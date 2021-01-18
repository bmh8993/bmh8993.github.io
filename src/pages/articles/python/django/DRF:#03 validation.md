---
title: Django/DRF#03 validation
date: 2020-04-20 08:04:25
layout: post
draft: false
path: "/python/django/drf-03-validation/"
category: "Django"
tags:
- "DRF"
description: "DRF의 validation에 대해서 알아봅시다."
---

DRF의 validation에 대해서 알아봅시다.

데이터를 deserializing을 한 이후에, deserializing한 데이터를 사용하기 전에 항상 `.is_valid()`를
호출하도록 되어져 있습니다. 만약 에러가 발생하면, `.errors`를 통해서 에러 메세지를 확인할 수 있습니다.<br>
특별히 나눌 것은 아니라고 생각되지만 object level validation과 field level validation이 존재합니다.

#### object level validation
- 여러 필드에 대한 validation을 진행합니다. serializer 클래스에 `validate`메서드를 추가합니다.
```python
class ExampleSerializer(serializers.Serializer):
    ...
    def validate(self, data):
        if data["title"] == data["description"]:
            raise serializers.ValidationError("Titile and Description must be different from one another")
        return data
```

#### field level validation
- serializer 클래스에 `vailidate_{field_name}`함수를 추가해서 사용자 정의 필드 수준 유효성
검사를 진행할 수 있습니다.
```python
class ExampleSerializer(serializers.Serializer):
    ...
    def validate_title(self, value):
        if len(value) < 30:
            raise serializers.ValidationError("The title has to be at least 30 chars long!")
        return value
```
