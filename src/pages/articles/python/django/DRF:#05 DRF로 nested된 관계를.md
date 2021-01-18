---
title: DRF/#05 DRF로 nested된 관계를 다뤄보자
date: 2020-04-26 21:04:61
layout: post
draft: false
path: "/python/django/drf-05-handle-nested-relationships/"
category: "Django"
tags:
- "DRF"
description: "DRF에서 nested된 관계를 다루는 방법을 알아봅시다."
---

DRF에서 nested된 관계를 다루는 방법을 알아봅시다.

관계형 데이터베이스를 사용하면 당연히 `ForiegnKey`를 사용하게 됩니다.
그렇다면 DRF로 nested된 관계는 어떻게 다뤄야할까요<br>
serializer와 views가 조금씩 달라질 것입니다.<br>

**가정한 모델의 관계는 `Jounalist : Article = 1 : N`, 한 명의 저널리스트가 여러개의 기사를 쓸 수 있다고 가정했습니다.**

<br>

```python
# news/models.py
from django.db import models


class Journalist(models.Model):
    first_name = models.CharField(max_length=60)
    last_name = models.CharField(max_length=60)
    biography = models.TextField(blank=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Article(models.Model):
    author = models.ForeignKey(
            Journalist,
            on_delete=models.CASCADE,
            related_name="articles"
            )
    title = models.CharField(max_length=120)
    description = models.CharField(max_length=200)
    body = models.TextField()
    location = models.CharField(max_length=120)
    publication_date = models.DateField()
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.author} {self.title}"
```
```python
# news/api/serializer.py

from rest_framework import serializers
from ..models import Article, Journalist


class JournalistSerializer(serializers.ModelSerializer):

    class Meta:
        model = Journalist
        fields = "__all__"


class ArticleSerializer(serializers.ModelSerializer):

    class Meta:
        model = Article
        fields = "__all__"

```
```python
# news/api/views.py

class ArticleListCreateAPIView(APIView):
    def get(self, request):
        articles = Article.objects.filter(active=True)
        serializer = ArticleSerializer(articles, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ArticleSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ArticleDetailAPIView(APIView):
    def get_object(self, pk):
        article = get_object_or_404(Article, pk=pk)
        return article

    def get(self, request, pk):
        article = self.get_object(pk)
        serializer = ArticleSerializer(article)
        return Response(serializer.data)

    def post(self, request, pk):
        article = self.get_object(pk)
        serializer = ArticleSerializer(article, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        article = self.get_object(pk)
        article.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class JounalistListCreateAPIView(APIView):
    pass
```
```python
# news/api/urls.py

from django.urls import path
from news.api.views import (
        ArticleListCreateAPIView,
        ArticleDetailAPIView,
        JounalistListCreateAPIView
        )

urlpatterns = [
        path("articles/", ArticleListCreateAPIView.as_view(), name="article-list"),
        path("articles/<int:pk>/", ArticleDetailAPIView.as_view(), name="article-detail"),
        path("journalists/", JounalistListCreateAPIView.as_view(), name="journalist-list")
        ]
```

1. 여기서 `GET /api/articles/`를 호출하면?
    > author의 값으로 해당 `journalist_id`가 호출됩니다.

```json
GET /api/articles/
HTTP 200 OK
Allow: GET, POST, HEAD, OPTIONS
Content-Type: application/json
Vary: Accept

[
    {
        "id": 1,
        "time_since_publication": "13 hours, 52 minutes",
        "title": "test title",
        "description": "test description",
        "body": "!!!",
        "location": "!!!!!",
        "publication_date": "2020-04-26",
        "active": true,
        "created_at": "2020-04-26T13:32:15.453026Z",
        "updated_at": "2020-04-26T13:32:15.453049Z",
        "author": 1
    }
]
```

2. author의 detail까지 보고싶으면?
    - ArticleSerializer에 `author = JournalistSerializer(read_only=True)`를 추가합니다.
    - 혹시나 하는 마음에 author가 아닌 `test`라는 변수로 JournalistSerializer를 선언했더니
    값이 안나옵니다. model에 선언된 field 이름으로 해야하는 것 같습니다. 자세한건 나중에 소스코드를
    살펴봐야겠습니다.

```python
class ArticleSerializer(serializers.ModelSerializer):

    author = JournalistSerializer(read_only=True)

    class Meta:
        model = Article
        fields = "__all__"
```
```json
GET /api/articles/
HTTP 200 OK
Allow: GET, POST, HEAD, OPTIONS
Content-Type: application/json
Vary: Accept

[
    {
        "id": 1,
        "time_since_publication": "14 hours, 22 minutes",
        "author": {
            "id": 1,
            "first_name": "bae",
            "last_name": "mh",
            "biography": "hi"
        },
        "title": "test title",
        "description": "test description",
        "body": "!!!",
        "location": "!!!!!",
        "publication_date": "2020-04-26",
        "active": true,
        "created_at": "2020-04-26T13:32:15.453026Z",
        "updated_at": "2020-04-26T13:32:15.453049Z"
    }
]
```

3. author의 `__str__`이 보고싶으면?
    - `author = serializers.StringRelatedField()`를 선언하면 model에 정의한 `__str__`의
    return 값이 나옵니다.

4. 이번에는 journalist에 해당하는 article을 보려고 합니다.
    - 동일하게 JournalistSerializer에 `articles = ArticleSerializer(many=True, read_only=True)`
    를 선언하면 되고 articles는 model에서 ForiegnKey 옵션으로 지정한 related\_name입니다.
    - JounalistListCreateAPIView를 작성합니다.

```python
# news/api/serializers.py
class ArticleSerializer(serializers.ModelSerializer):

    class Meta:
        model = Article
        fields = "__all__"


class JournalistSerializer(serializers.ModelSerializer):

    articles = ArticleSerializer(many=True, read_only=True)

    class Meta:
        model = Journalist
        fields = "__all__"
```
```python
# news/api/views.py
class JounalistListCreateAPIView(APIView):
    def get(self, request):
        journalist = Journalist.objects.all()
        serializer = JournalistSerializer(journalist, many=True)  # many=True는 많은 관계를 표현할 때에 passing해줘야 한다.
        return Response(serializer.data)
    def post(self, request):
        serializer = JournalistSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```
```json
GET /api/journalists/
HTTP 200 OK
Allow: GET, POST, HEAD, OPTIONS
Content-Type: application/json
Vary: Accept

[
    {
        "id": 1,
        "articles": [
            {
                "id": 1,
                "time_since_publication": "14 hours, 41 minutes",
                "title": "test title",
                "description": "test description",
                "body": "!!!",
                "location": "!!!!!",
                "publication_date": "2020-04-26",
                "active": true,
                "created_at": "2020-04-26T13:32:15.453026Z",
                "updated_at": "2020-04-26T13:32:15.453049Z",
                "author": 1
            }
        ],
        "first_name": "bae",
        "last_name": "mh",
        "biography": "hi"
    }
]
```

5. articles의 데이터를 직접받아오는 것이 아니라 direct link를 받아오려면?
    - `serializers.HyperlinkedRelatedField()`를 사용해야 합니다. 인자로 `view_name`은 필수이다. `view_name`은 related된 관계를 명시적으로 표시하는
    *필수* 옵션입니다. urls.py에서 입력한 `view_name`을 가져옵니다
    - JournalistSerializer의 옵션에 context={"request": request}를 넣어야합니다. 공식문서를 보면
    `context`는 시리얼라이징 되는 객체 이외에 추가적인 내용을 제공할 때 필요한 argument입니다.

```python
# news/api/serializers.py
class JournalistSerializer(serializers.ModelSerializer):

    articles = serializers.HyperlinkedRelatedField(many=True, read_only=True, view_name="article-detail")

    class Meta:
        model = Journalist
        fields = "__all__"
```
```python
# news/api/views.py
class JounalistListCreateAPIView(APIView):
    def get(self, request):
        journalists = Journalist.objects.all()
        serializer = JournalistSerializer(journalists, many=True, context={"request": request})
        return Response(serializer.data)
...
```
