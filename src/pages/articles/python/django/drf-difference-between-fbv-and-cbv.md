---
title: Django / FBV와 CBV의 차이
date: 2020-04-08 19:04:65
layout: post
draft: false
path: "/python/django/difference-fbv-cbv/"
category: "Django"
tags:
- "django"
description: "Django에서 FBV와 CBV의 차이에 대해서 알아봅시다."
---
FBV = **Function Based View**<br>
CBV = **Class Based View**<br>
<br>
- 클라이언트는url 주소를 통해서 서버에 request를 보내고, Django는 urls.py를 참고하여 해당 url에
매핑된 뷰를 찾아 실행한다. 이때 실행되는 뷰의 종류에는 함수 기반 뷰(FBV)와 클래스 기반 뷰(CBV)가
있다.
- FBV와 CBV가 실행하는 것은 결국 함수이다. 자세한 내용은 아래에서 설명하겠다.

<br>
Django가 동작하는 원리는 다음 게시물을 참고하길 바란다.<br>

▶︎ [Django는 무엇이고 어떻게 일하는가](https://bmh8993.github.io/Django/what-is-django-and-how-to-it-works/)

## 함수 기반 뷰(Function Based View)
- django source code를 보면 FBV에서는 app.urls.py에서 `함수`를 호출하고 그 함수는
request 객체를 받아서 각 메쏘드에 따라 처리한다.

```python
# app/views.py
from django.http import HttpResponse, JsonResponse


def function_based_view(request):
    if request.method == "GET":
        content = "..."
        return JsonResponse({"content": content})
    if request.method == "POST":
        ...
        return HttpResponse("SUCCESS")
```

```python
# app/urls.py
from django.urls import path
from .views import function_view_name

urlpatterns = [
    path("view/url/", function_view_name)
]
```

### 장점
- 함수로 정의하기에 읽기가 쉽고 클래스 기반 뷰보다 직관적이다
- 작성하기가 쉽다

### 단점
- 확장과 재사용성이 클래스 기반 뷰에 비해서 강력하지 못하다

## 클래스 기반 뷰(Class Based View)
- django soruce code를 보면 CBV에서는 app.urls.py에서 클래스 메소드인
`defined_view_class.as_view()`를 실행한다. `as_view`는 `view`함수를, `view`는 `dispatch`함수를
호출하고, `dispatch`함수는 request.method를 확인하여 method별로 정의된 함수에 따라
request를 처리한다.

```python
# app/views.py
from django.http import JsonResponse, HttpResponse
from django.views import View


class ClassBasedView(View):
    def get(self, request):
        content = "..."
        return JsonResponse({"content": content})

    def post(self, request):
        ...
        return HttpResponse("SUCCESS")
```

```python
# app/urls.py
from django.urls import path
from .views import ClassViewName

urlpatterns = [
    path("view/url/", ClassViewName.as_view())
]
```

### 장점
- 코드를 확장하거나 재사용하기 쉽다.
- mixin(다중 상속) 같은 객체지향 기술을 사용할 수 있다.
- 내장 제네릭 클래스 기반 뷰

### 단점
- 읽기가 어렵다.
- 직관적이지 않다.
