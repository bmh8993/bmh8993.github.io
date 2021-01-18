---
title: DRF/#07 Permission으로 request의 access 다루기
date: 2020-05-05 23:05:74
layout: post
draft: false
path: "/python/django/drf-07-permission/"
category: "Django"
tags:
- "DRF"
description: "DRF의 permission에 대해서 알아봅시다."
---

# Permission

- request에 access를 허용할 지 또는 거부할 지 결정
- Permission 검사는 다른 코드가 진행되기 전에 view의 맨 처음에 항상 실행됨
- Permission 검사는 일반적으로 들어오는 request의 허용하는지 결정하기 위해 `request.user` 및
`request.auth`의 properies를 등록정보의 인증정보로 사용
- 가장 간단한 permission은 `IsAuthenticated` class인데
    - 인증된 사용자에게 access 허용
    - 인증되지 않은 사용자에게 access 거부

## 모든 View에 동일한 Permission 적용하기(전역 설정)

- settings.py에 아래 코드를 입력합니다.
- 하지만 아래와 같이 사용은 합리적이지 않습니다. 일반적으로 view마다 권한이 다르기 때문입니다.

```python
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ]
}
```

## 특정 View에 특정 Permission 지정하기

- app/view.py에 다음과 같이 입력합니다.
- APIView를 사용한 view를 작성했다면 다음과 같이 작성합니다.

```python
class ExampleAPIView(...):

    ...
    permission_classes = [PermissionClass]
```

## Permission을 커스텀해서 사용하기(Custom permissions)

- 다음과 같은 model과 serializers가 있다고 가정합니다.
- view와 urls를 작성한 이후 permissions.py를 작성하고 permissions을 적용하고 싶은 view에
코드를 추가적으로 작성합니다.
- 지금 작성하려는 permissions는 리뷰를 작성한 사람이면 접근을 허락하고 아니면 읽기만 가능한
permissions입니다.(일차적으로 읽기에 해당하는 메소드이라면 접근 허락)

```python
# ebook/models.py

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

from django.contrib.auth.models import User


class Ebook(models.Model):
    title = models.CharField(max_length=140)
    author = models.CharField(max_length=60)
    description = models.TextField()
    description_date = models.DateField()

    def __str__(self):
        return self.title


class Review(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    review_author = models.ForeignKey(User, on_delete=models.CASCADE)
    review = models.TextField(blank=True)
    rating = models.PositiveIntegerField(
            validators=[
                MinValueValidator(1),
                MaxValueValidator(5)
                ]
            )
    ebook = models.ForeignKey(
            Ebook,
            on_delete=models.CASCADE,
            related_name="reviews"
            )

    def __str__(self):
        return str(self.rating)
```

```python
# ebook/api/serializers.py

from rest_framework import serializers
from ..models import Ebook, Review


class ReviewSerializer(serializers.ModelSerializer):

    review_author = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Review
        exclude = ("ebook",)

class EbookSerializer(serializers.ModelSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Ebook
        fields = "__all__"
```

#### Custom permissions

- custom permissions를 구현하려면, `BasePermission`를 상속받아서 작성합니다.

```python
# ebook/api/permissions.py

from rest_framework import permissions


class IsReviewAuthorOrReadOnly(permissions.BasePermission):

    def has_object_permissions(self, request, view, obj):
        if request.method in permissions.SAFE_METHOD:
            return True

        return obj.review_author == request.user
```

- View Class에 `permissions_classes = IsReviewAuthorOrReadOnly`를 선언합니다.

```python
# ebook/api/views.py
from rest_framework import generics
from rest_framework import mixins
from rest_framework import permissions
from rest_framework.generics import get_object_or_404
from rest_framework.exceptions import ValidationError

from ebook.models import Ebook, Review
from ebook.api.serializers import EbookSerializer, ReviewSerializer
from ebook.api.permissions import IsReviewAuthorOrReadOnly
...

class ReviewDetailAPIVIEW(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permissions_classes = IsReviewAuthorOrReadOnly
```

#### APIView에 사용하기(custom view에 사용하기)

- 위와 같이 generic view를 사용하면 object level permissions을 검사하지만 custom view를
작성하는 경우 object level permissions 검사를 직접해야합니다. 즉 `has_object_permission`은
별도의 호출과정이 필요한데, `get_object`를 오버라이드 하고 함수 내에서 `check_object_permissions`
을 통해 `has_object_permission`을 호출할 수 있습니다.

```python
class ReviewDetailView(APIView):
    permissions_classes = [IsReviewAuthorOrReadOnly]

    def get_object(self, review_id):
        try:
            review = Review.objects.get(id=review_id)
            self.check_object_permissions(self.request, review)
            return review
        except Review.DoewNotExist:
            return None

    def get(self, request, review_id):
        review = self.get_object(review_id)
        ...
```
---

ref: [Dean's blog](https://dean-kim.github.io/rest_framework/2017/05/22/Django-REST-Framework-Permissions.html)<br>
ref: [ssung.k](https://ssungkang.tistory.com/entry/Django-APIView%EC%97%90-permission-%EC%A7%80%EC%A0%95%ED%95%98%EA%B8%B0)
