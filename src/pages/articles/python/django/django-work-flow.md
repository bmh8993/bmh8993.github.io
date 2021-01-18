---
title: Django / CBV에서 View, APIView는 어떻게 동작하는가?
date: 2020-06-17 02:02:15
layout: post
draft: false
path: "/python/django/view-work-flow/"
category: "Django"
tags:
- "django"
description: "Django에서 CBV가 동작하는 방식에 대해서 알아봅시다"
---

DRF를 더욱 잘 오버라이드 하기 위해서 Django의 flow를 다시 파악하려한다.

전체 적인 흐름은 [다음 포스트](https://bmh8993.github.io/Django/what-is-django-and-how-to-it-works/)를 확인하길 바란다.

# Django에서의 View

```python
# app/urls.py

from django.urls import path
from .views import ClassViewName

urlpatterns = [
    path("view/url/", ClassViewName.as_view())
]
```

`ClassViewName.as_view()`에서 as\_view()의 소스 코드를 보면

```python
class View:
    """
    Intentionally simple parent class for all views. Only implements
    dispatch-by-method and simple sanity checking.
    """

    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']

    def __init__(self, **kwargs):
        # code

    @classonlymethod
    def as_view(cls, **initkwargs):
        # code

        def view(request, *args, **kwargs):
            self = cls(**initkwargs)
            if hasattr(self, 'get') and not hasattr(self, 'head'):
                self.head = self.get
            self.setup(request, *args, **kwargs)
            if not hasattr(self, 'request'):
                raise AttributeError(
                    "%s instance has no 'request' attribute. Did you override "
                    "setup() and forget to call super()?" % cls.__name__
                )
            return self.dispatch(request, *args, **kwargs)
        view.view_class = cls
        view.view_initkwargs = initkwargs

        # take name and docstring from class
        update_wrapper(view, cls, updated=())

        # and possible attributes set by decorators
        # like csrf_exempt from dispatch
        update_wrapper(view, cls.dispatch, assigned=())
        return view

    def setup(self, request, *args, **kwargs):
        """Initialize attributes shared by all view methods."""
        self.request = request
        self.args = args
        self.kwargs = kwargs

    def dispatch(self, request, *args, **kwargs):
        # Try to dispatch to the right method; if a method doesn't exist,
        # defer to the error handler. Also defer to the error handler if the
        # request method isn't on the approved list.
        if request.method.lower() in self.http_method_names:
            handler = getattr(self, request.method.lower(), self.http_method_not_allowed)
        else:
            handler = self.http_method_not_allowed
        return handler(request, *args, **kwargs)

    ...
```

- as\_view는 view를 리턴하게 된다.  view의 type을 찍어보면 <class 'function'>라고 나온다.
- view를 실행하면 View의 메소드 `setup`에서 ViewClass의 클래스 변수에 request, args, kwargs를 추가한다.
- 이후 dispatch 메소드를 실행하게 되는데 `dispatch`는 request의 method를 체크해서 해당 메소드를 호출하게 된다.

# DRF에서의 APIView

APIView는 DRF에서 제공하는 ViewClass의 기초가 된다. APIView를 살펴보자.

```python
class APIView(View):

    ...

    @classmethod
    def as_view(cls, **initkwargs):
        ...
        view = super().as_view(**initkwargs)
        view.cls = cls
        view.initkwargs = initkwargs

        return csrf_exempt(view)

        ...

    def dispatch(self, request, *args, **kwargs):
        """
        `.dispatch()` is pretty much the same as Django's regular dispatch,
        but with extra hooks for startup, finalize, and exception handling.
        """
        self.args = args
        self.kwargs = kwargs
        request = self.initialize_request(request, *args, **kwargs)
        self.request = request
        self.headers = self.default_response_headers  # deprecate?

        try:
            self.initial(request, *args, **kwargs)

            # Get the appropriate handler method
            if request.method.lower() in self.http_method_names:
                handler = getattr(self, request.method.lower(),
                                  self.http_method_not_allowed)
            else:
                handler = self.http_method_not_allowed

            response = handler(request, *args, **kwargs)

        except Exception as exc:
            response = self.handle_exception(exc)

        self.response = self.finalize_response(request, response, *args, **kwargs)
        return self.response

```

- APIView에서 return되는 view는 무보클래스의 as\_view를 통해서 반환된다.
- 부모 클래스인 view에서 `self.dispatch`를 return 하게되는데 여기서 dispatch는 APIView의
dispatch이다. 왜냐하면 self는 APIView이기때문이다.
- 여기서 dispatch가 확인하는 중요한 사항은 `self.initial`이다.

## initial

self.initial은 어떤 값을 return하지 않는다. 함수의 이름대로 initial, 시작부분이고 여기서 3가지를 확인하게 된다.

```python
def initial(self, request, *args, **kwargs):
    """
    Runs anything that needs to occur prior to calling the method handler.
    """
    self.format_kwarg = self.get_format_suffix(**kwargs)

    # Perform content negotiation and store the accepted info on the request
    neg = self.perform_content_negotiation(request)
    request.accepted_renderer, request.accepted_media_type = neg

    # Determine the API version, if versioning is in use.
    version, scheme = self.determine_version(request, *args, **kwargs)
    request.version, request.versioning_scheme = version, scheme

    # Ensure that the incoming request is permitted
    self.perform_authentication(request)
    self.check_permissions(request)
    self.check_throttles(request)
```

1. perform\_authentication
2. check\_permissions
3. check\_throttles

### 1. perform\_authentication

이 함수를 실행하면 request.user를 하는데 `.user`는 getter이다. `_user`의 유무에 따라 `_authenticated`를 실행하거나 `_user`를 return한다.<br>
`_authenticated`는 인증 클래스들을 가져와서

### 2. check\_permissions
### 3. check\_throttles
