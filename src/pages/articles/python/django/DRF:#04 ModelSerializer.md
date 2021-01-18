---
title: DRF/#04 ModelSerializer
date: 2020-04-20 23:04:38
layout: post
draft: false
path: "/python/django/drf-04-ModelSerializer/"
category: "Django"
tags:
- "DRF"
description: "DRF의 ModelSerializer에 대해서 알아봅시다."
---

## ModelSerializer와 serializer의 field를 구성하는 방법

### ModelSerializer

소스코드를 보면 ModelSerializer를 다음과 같이 설명하고 있습니다.
> - ModelSerializer는 다음과 같은 경우를 제외하고 일반 Serializer에 불과합니다.
>     - 기본 필드 집합들을 기본적으로 제공합니다.(모델을 기초로 serializer class를 자동으로 만들어줍니다.)
>     - 기본 검증 집합들을 기본적으로 제공합니다.
>     - `.create()`, `.update()`가 제공됩니다. (하지만 writable nested relationships는 지원하지 않으므로 필요에 따라 create 메소드를 만들어야합니다.)
> - 모델의 필드에 기반하여 작성된 serializer의 필드 집합을 자동으로 결정하는 방식은 상당히 복잡합니다.
> 하지만 구현하는 것을 파고들 필요는 없습니다.
> - 'ModelSerializer' 클래스가 필요한 필드 집합을 생성하지 않는 경우, 시리얼라이저 클래스에
> 필드를 명시적으로 선언하거나 '시리얼라이저' 클래스를 사용하십시오.

#### ModelSerializer 사용방법
이전에 serializer를 소개하는 포스팅에서 `ArticleSerializer` class를 다음과 같이 구성했었습니다.
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
- ModelSerializer를 사용하면 더 간편하게 가능합니다.

```python
# news.serializers.py

from rest_framework import serializers
from .models import Article


class ArticleSerializer(serializers.ModelSerializer):

    class Meta:
        model = Article
        fields = "__all__"
```
- 모델의 모든 필드를 사용하고 싶을 때 `fields = "__all__"`
- 모델의 일부 필드를 제외하고 싶을 때 `exclude = "(field_name_1, field_name_2)"`
- 모델의 일부 필드만 선택적으로 사용할 때 `fields = ("field_name_1", "field_name_2")`

### field 커스텀하기

기본적으로 model에 등록된 필드 값들은 Meta 클래스에 추가해줌으로서 다뤄줄 수 있지만 커스텀필드를
정의하는데 있어서는 새로운 방법이 필요합니.

#### SerializerMethodField
SerializerMethodField는 `read-only field`로 serialized된 데이터에 추가해서 사용할 수 있습니다.

#### SerializerMethodField 사용법
아래의 코드와 같이 `field_name = serializers.SerializerMethodField()`와 같이 field를 선언하고
함수 이름을 `get_field_name`의 식으로 정의합니다.<br>
함수 이름을 `get_field_name`의 식으로 하지 않는다면 다음과 같이 `method_name`을 지정하면됩니다.
`SerializerMethodField(method_name=field_name_as_I_want)`

```python
# news.serializers.py

from datetime import datetime

from django.utils.timesince import timesince
from rest_framework import serializers
from .models import Article


class ArticleSerializer(serializers.ModelSerializer):

    time_since_publication = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = "__all__"

    def get_time_since_publication(self, object):
        publication_date = object.publication_date
        now = datetime.now()
        time_delta = timesince(publication_date, now)
        return time_delta
```
