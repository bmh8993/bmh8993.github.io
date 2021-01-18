---
title: Django/DRF#02 Serializer
date: 2020-04-04 15:04:82
layout: post
draft: false
path: "/python/django/drf-02-serializer/"
category: "Django"
tags:
- "DRF"
description: "DRF의 serializer에 대해서 알아봅시다."
---

DRF의 serializer에 대해서 알아봅시다.

DRF의 Serializer는 queryset이나 모델의 instance와 같은 복잡한 데이터를 json처럼 쉽게 사용 가능한 python data type으로 변환 시켜줍니다. 또한 validation도 검증해줍니다.<br>
<br>
Serializer의 의미에 대해서는 아래 포스트를 읽어보길 바랍니다.<br>
[직렬화(serialisation)는 무엇인가](https://bmh8993.github.io/cs/network/serialization/)<br>
<br>

## 1. Article object and serializer
```python
# news.models.py

from django.db import models


class Article(models.Model):
    author = models.CharField(max_length=50)
    title = models.CharField(max_length=120)
    description = models.CharField(max_length=200)
    body = models.TextField()
    location = models.CharField(max_length=120)
    publication_date = models.DateField()
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```
```python
# news.serializers.py

from rest_framework import serializers
from .models import Article


class ArticleSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    author = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    body = serializers.CharField()
    location = serializers.CharField()
    publication_date = serializers.DateField()
    active = serializers.BooleanField()
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
```
## 2. Serializing objects

- 위에서 만든 ArticleSerializer로 article을 serialize 할 수 있습니다.
- 모델 인스턴스를 파이썬 내부 데이터 타입으로 출력한 결과
- 미리 인스턴스를 만들고 진행했습니다.
```shell
>>> article_instance = Article.objects.first()
>>> serializer = ArticleSerializer(article_instance)
>>> serializer
ArticleSerializer(<Article: admin test_title>):
    id = serializers.IntegerField(read_only=True)
    author = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    body = serializers.CharField()
    location = serializers.CharField()
    publication_date = serializers.DateField()
    active = serializers.BooleanField()
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
>>> serializer.data
{'id': 1, 'author': 'admin', 'title': 'test_title', 'description': 'test_description', 'body': 'test_body', 'location': 'test_location', 'publication_date': '2020-04-02', 'active': True, 'created_at': '2020-04-02T10:57:03.725817Z', 'updated_at': '2020-04-02T10:57:03.725844Z'}
>>> type(serializer.data)
rest_framework.utils.serializer_helpers.ReturnDict
```
- python datatype에서 JSON으로 출력하기 위해서 아래와 같이 렌더링을 거쳐야합니다.
```shell
>>> from rest_framework.renderers import JSONRenderer
>>> json = JSONRenderer().render(serializer.data)
>>> json
b'{"id":1,"author":"admin","title":"test_title","description":"test_description","body":"test_body","location":"test_location","publication_date":"2020-04-02","active":true,"created_at":"2020-04-02T10:57:03.725817Z","updated_at":"2020-04-02T10:57:03.725844Z"}'
>>> type(json)
bytes
```

## 3. Deserializing objects
- 첫째로 파이썬 native datatype으로 변환합니다.
```shell
>>> import io
>>> from rest_framework.parsers import JSONParser
>>> stream = io.BytesIO(json)
>>> data = JSONParser().parse(stream)
>>> data
{'id': 1,
 'author': 'admin',
 'title': 'test_title',
 'description': 'test_description',
 'body': 'test_body',
 'location': 'test_location',
 'publication_date': '2020-04-02',
 'active': True,
 'created_at': '2020-04-02T10:57:03.725817Z',
 'updated_at': '2020-04-02T10:57:03.725844Z'}
```
- deserializing한 데이터를 사용하기 전에 항상 `is_vaild()`함수를 호출해야합니다.
- DRF 코드를 보면 `.is_vaild()` before attempting, first, before accessing 등...기록되어져 있습니다.
- 특히, DRF 코드를 보면 `save()`하기 이전에 `is_vaild()`를 해야한다고 써있습니다.
```python
class BaseSerializer(Field):
  ...

  def save(self, **kwargs):
    assert hasattr(self, '_errors'), (
        'You must call `.is_valid()` before calling `.save()`.'
    )
  ...
```
- serializer에 instance를 전달하면 `update`를 실행하고, instance를 전달하지 않으면 `create`를 합니다.
```python
# .save() will create a new instance
serializer = ArticleSerializer(data=data)
serializer.save()
# .save() will update the existing `article` instance
serializer = ArticleSerializer(article_instance, data=data)
serializer.save()
```

---

ref: [Dean's blog](https://dean-kim.github.io/rest_framework/2017/05/08/Django-REST-Framework-Serializers.html)
