---
title: Django / Django에서 orm이 아닌 raw SQL queries 사용하기
date: 2020-02-06 09:02:12
layout: post
draft: false
path: "/python/django/raw=queries/"
category: "Django"
tags:
- "django"
description: "Django에서 raw SQL queries를 사용하는 방법에 대해서 알아봅시다."
---
며칠 전에 Django에서 제공하는 `multiple DB`를 사용했습니다.
데이터를 가져오려고 하자 다음과 같은 에러가 발생했습니다.<br>
`ProgramingError: Unknown column 'xxx.id' in 'field list'`<br>
그 이유는 이렇습니다.
> 장고는 우리가 pk를 설정하지 않아도 자동으로 id 필드를 생성합니다.
> 우리는 복잡적인 키를 설정할 수 없습니다. 하지만 `unique_together`라는 트릭을 사용하면 장고가 id 필드가 있다고 인식하게 할 수 있습니다.
> 데이터베이스에 id 필드가 존재하지 않기 때문에 에러를 발생시키지만, 장고는 트릭 덕분에 id 필드가 있다고 인식하는 겁니다.

#### 그렇다면 어떤 방법을 사용해야할까

방법은 raw queries를 사용해야 합니다.<br>
django-docs를 살펴보면 raw SQL queries를 사용할 수 있는 2가지 방법을 제공한다고 합니다.
1. Manager.raw()
    - 인스턴스를 return
2. execute custom SQL directly
    - row를 여러 형태로 return 합니다 기본은 list

저는 여기서 두번째 방법을 사용하려합니다. 그 이유를 설명하자면 이렇습니다.
1. **일단 공식 문서에서 다중 데이터 베이스르 사용하면 `django.db.connections`를 통해서 db에 접근하는 것을 이야기하고 있습니다.**
2. **Manager.raw()를 사용하면 해당하는 쿼리셋(정확히는 RawQuerySet)이 존재하는지 알 수 없습니다.**<br>
> return하는 type이 `RawQuerySet`입니다. 제가 말하는 존재하는 지는 orm에서 exists()와 같은 것들 입니다.
> 물론 전혀 방법이 없는 것은 아닙니다. len(list(RawQuerySet))과 같은 방법으로는 가능하지만 RawQuerySet의 갯수가 많을 경우에는 그 비용이 커서 효율적이라고 말할 수 없습니다.

그렇다면 custom SQL을 사용하도록하겠습니다.

```python
from django.db import connections

with connections["default"].cursor() as cursor:
  cursor.execute("select * from products")
  row = cursor.fetchall()
  print(row)
```
결과는 리스트 안의 튜플로 나오게 됩니다. 사용하기에는 참 불편해보입니다.
```python
[(id1, field1_value, field2_value....), (id2, field1_value, field2_value)...(idN, field1_value, field2_value)]
```
참고로 with connections["default"]에서 `default`는 multipel db 세팅에서의 키값입니다.
`connections.databases`를 찍으면 settings.py의 db 세팅을 볼 수 있습니다.
동일한 방법으로 다른 db에 접근해서 가능하네요.<br>

이번에는 사용하기 좋은 dict의 형태로 가공해보겠습니다.
```python
with connections["daily_lab_db"].cursor() as cursor:
    cursor.execute("select * from tb_p2pnotice_header")
    desc = cursor.description
    print(desc)
```
결과는
```python
[
  ('companyNo', 3, None, None, None, None, 0, 20483),
  ('companyName', 253, None, None, None, None, 0, 4225),
  ('homepageUrl', 253, None, None, None, None, 0, 4225),
  ('isAssociation', 1, None, None, None, None, 0, 1),
  ('isMarketplace', 1, None, None, None, None, 0, 1),
  ('isUse', 1, None, None, None, None, 0, 1),
  ('hasError', 1, None, None, None, None, 0, 1)
]
```
dict를 만들기 위해서 제가 필요한건 컬럼 이름입니다.
```python
with connections["daily_lab_db"].cursor() as cursor:
    cursor.execute("select * from tb_p2pnotice_header")
    desc = cursor.description
    columns = [col[0] for col in desc]
    print(
        [dict(zip(columns, row))
        for row in cursor.fetchall()])
```
결과를 보자면
```pyhon
[{"col1": "value1"}, {"col2": "value2"}, ... {"colN": "valueN"}]
```
list comprehension을 통해서 dict를 담은 리스트로 만들었습니다.<br>
필요에 따라 함수로 만들어서 사용하면 더 좋을 것 같습니다.

---
ref: [stack overflow](https://stackoverflow.com/questions/42968154/unknown-column-modelname-id-in-field-list)<br>
ref: [django-docs](https://docs.djangoproject.com/en/2.2/topics/db/sql/)
