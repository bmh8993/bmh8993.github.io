---
title: Django / DRF#06 GenericAPIView and Mixins
date: 2020-05-01 19:05:62
layout: post
draft: false
path: "/python/django/drf-06-generic-mixins/"
category: "Django"
tags:
- "DRF"
description: "DRF의 serializer에 대해서 알아봅시다."
---
[Django-GenericAPIView의 공식문서](https://www.django-rest-framework.org/api-guide/generic-views/)를 보면 GenericAPIView를 다음과 같이 설명하고 있다.

> Django의 GenericAPIView는 공통된 사용 패턴의 shortcut으로 개발된 것이다. 뷰 개발에서 발견되는 특정 공통 idioms와 패턴을 가져와서 추상화한 것이므로 개발자들이 반복하지 않고 일반적인 데이터에 대한 뷰를 빠르게 작성할 수 있도록 한다.

> ... generic views가 API의 요구 사항에 맞지 않으면 `APIView` 클래스를 사용하거나 generic views에서 사용하는 mixins 및 base 클래스를 재사용 가능한 generic views를 작성할 수 있다.


## GenericAPIView

이 클래스는 REST framework의 APIView 클래스를 확장한 것으로, 표준 list와 detail view에 일반적으로
필요한 동작을 추가한다. 제공되는 각각의 구체적인 generic views는 GenericAPIView를 하나 이상의
mixin 클래스와 결합하여 만든다.

- Ebook과 Review 모델이 있고, 1 : N 관계이다.

```python
# ebook/models.py

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


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
    review_author = models.CharField(max_length=8, blank=True)
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

    class Meta:
        model = Review
        fields = "__all__"

class EbookSerializer(serializers.ModelSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Ebook
        fields = "__all__"
```

- GenericAPIView과 mixin을 사용해보자. queryset 리스트와 instance를 생성하는 view이다.
- 위에서 설명한대로 한개 이상의 mixin과 GenericAPIView를 사용했다.
- `get` method에서 `list method`를 return 하는데, list method는 ListModelMixin에 정의된 method이다. list 메소드에 사용되는 method들은 GenericAPIView의 method이다.
- 내부적인 소스를 까보면 `queryset`, `serializer_class`가 필요하다.(나는 개인적으로 정말 궁금해서 코드를 까보았다.)

```python
# ebook/api/views.py

class EbookListCreateAPIView(
        mixins.ListModelMixin,
        mixins.CreateModelMixin,
        generics.GenericAPIView):
    queryset = Ebook.objects.all()
    serializer_class = EbookSerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)
```

- 위에 작성된 View를 Concrete View Classes로 바꿀 것이다.
- Concrete View Classes는 heavily한 커스터마이징 된 동작이 필요하지 않으면 사용하면 좋다고 설명하고 있다.

```python
class EbookListCreateAPIView(generics.ListCreateAPIView):
    queryset = Ebook.objects.all()
    serializer_class = EbookSerializer
```

- GenericAPIView로 작성한 views.py

```python
from rest_framework import generics
from rest_framework import mixins
from rest_framework.generics import get_object_or_404

from ..models import Ebook, Review
from ..api.serializers import EbookSerializer, ReviewSerializer


class EbookListCreateAPIView(generics.ListCreateAPIView):
    queryset = Ebook.objects.all()
    serializer_class = EbookSerializer


class EbookDetatilAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ebook.objects.all()
    serializer_class = EbookSerializer


class ReviewCreateAPIView(generics.CreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def perform_create(self, serializer):
        ebook_pk = self.kwargs.get("ebook_pk")
        ebook = get_object_or_404(Ebook, pk=ebook_pk)
        serializer.save(ebook=ebook)


class ReviewDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
```

- 모델을 다음과 같이 수정해야한다. ReviewCreateAPIView에서 `perform_create`를 선언하면서
ebook instance에 ebook을 저장하기 때문이다.(코드에서 보이는 kwargs(ebook-pk)는
end-point에서 받는다.)

```python
# ebook/api/serializers.py

class ReviewSerializer(serializers.ModelSerializer):

    class Meta:
        model = Review
        exclude = ("ebook",)
```

```python
# ebook/api/urls.py

from django.urls import path
from ..api.views import (
        EbookListCreateAPIView,
        EbookDetatilAPIView,
        ReviewCreateAPIView,
        ReviewDetailAPIView
        )

urlpatterns = [
        path("ebooks/",
            EbookListCreateAPIView.as_view(),
            name="ebook-list"),
        path("ebooks/<int:pk>/",
            EbookDetatilAPIView.as_view(),
            name="ebook-detail"),
        path("ebooks/<int:ebook_pk>/review/",
            ReviewCreateAPIView.as_view(),
            name="ebook-review"),
        path("reviews/<int:pk>/",
            ReviewDetailAPIView.as_view(),
            name="review-detail"),
        ]
```

---

ref: [Dean's blog](https://dean-kim.github.io/rest_framework/2017/05/24/Django-REST-Framework-GenericViews.html)<br>
ref: [SJQuant's Devlog](https://sjquant.tistory.com/34)
ref: [mixins source code](https://github.com/encode/django-rest-framework/blob/master/rest_framework/mixins.py)
