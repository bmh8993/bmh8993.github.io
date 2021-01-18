---
title: Django / ORM cheat sheet
date: 2019-11-01 10:12:08
layout: post
draft: false
path: "/python/django/orm-cheat-sheet/"
category: "Django"
tags:
- "django"
description: "Django orm cheat sheet"
---
1. [Get fields list of model](#get_fields_list_of_model)
2. [Update-use Django Model](#update_use_django_model)
3. [ORM filter/get tips!](#orm_filter_get_tips)

##Get fields list of model<a id="get_fields_list_of_model"></a>

- 모델의 필드 리스트를 얻는 방법

```python
modelname._meta.get_fields()
```
example>
```python
Product._meta.get_fields()
>>>
(<django.db.models.fields.AutoField: id>,
 <django.db.models.fields.IntegerField: status>,
 <django.db.models.fields.CharField: product_name>)
```
advanced>
```python
fields_list = []
fields = Product._meta.get_fields()

for field in fields:
  fields_list.append(field.name)

>>>
['id',
 'status',
 'product_name']
```

##Update use Django model<a id="update_use_django_model"></a>
##ORM filter, get tips!<a id="orm_filter_get_tips"></a>

- `filter` 또는 `get`을 할 때에 팁!
- 꼭 인스턴스로만 접근 가능한 것이 아니라 인스턴스의 `id`값으로도 접근 가능하다.
- 단, 생성시에는 filter, get과 달리 `인스턴스=인스턴스`의 식으로 사용해야한다.

```python
# models.py

class House(models.Model):
  name = models.CharField(max_length=255, primary_key=True)
  type = models.ForeignKey(HouseType)

class HouseType(models.Model):
  type_name = models.CharField(max_length=255)
```
---
```python
apt = HouseType(
    type_name="apt"
    )
apt.save()

apt.id
>>> 1

House.objects.create(
    name="mh_house",
    type_id=1
    )
```
---
```python
mh_house = House.objects.filter(type=apt)  # QuerySet
mh_house = House.objects.filter(type_id=apt.id)  # QuerySet
mh_house = House.objects.filter(type=apt.id)  # QuerySet

mh_house = House.objects.get(type=apt)  # Instance
mh_house = House.objects.get(type_id=apt.id)  # Instance
mh_house = House.objects.get(type=apt.id)  # Instance
```

- DB에 컬럼 생성시 자동으로 `_id`가 붙는데 이것을 사용한 것.
