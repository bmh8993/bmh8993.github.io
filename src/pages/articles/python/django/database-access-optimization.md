---
title: Django / 데이터베이스 접근 최적화에 대해서
date: 2020-07-04 13:07:88
layout: post
draft: false
path: "/python/django/database-optimization/"
category: "Django"
tags:
- "django"
description: "Django에서 DB 최적화에 대해서 알아봅시다."
---

Django를 사용하다보면 DB 최적화를 자연스럽게 접하게 된다. 알고는 있지만 정리가 안된 내용을
이번 블로깅을 통해 진행해보려한다.
<br>
얼마전부터 `django-debug-toolbar`를 사용하여 프로젝트의 쿼리를 최적화하기 시작했다.
나름 고민하며 ORM을 작성했다고 생각했는데 여전히 중복되거나 최적화를 필요로하는 부분이 많았다.
어찌보면 대략적으로, 그저 표면적으로만 알고있는 지식을 통해 최적화를 진행했다고 생각하여
공식문서를 바탕으로 이런 글을 쓰게 되었다.

## 1. 기본적으로 제공하는 DB 최적화 기술을 사용해라

이 부분은 SQL 최적화 기본 원리를 알아야하는데 [다음 포스트](https://bmh8993.github.io/SQL/sql-최적화의-기본-원리/)를 참고하기를 바란다.
즉, 기본적인 DB 최적화를 먼저 해야한다는 이야기이다.

- 1-1. 인덱싱
> 인덱싱은 최우선적으로 고려되는 부분이다. Field의 옵션으로 `db_index=True`를 세팅하면된다.
혹은 Meta class에 `indexes`를 추가한다. 두 옵션의 동작은 동일하다. 추가하게되면 검색속도를
높일 수 있다.<br>
<br>
그렇다면 어떤 필드에 추가해야할까. `filter()`, `exclude()`, `order_by()`를 자주 쿼리하는 필드에
추가하도록하자

<br>

- 1-2. 적절한 필드타입 사용하기

## 2. QuerySets 이해하기

#### *쿼리셋을 이해하는 것은 좋은 퍼포먼스를 만들어낼 때 매우 중요하다.*

QuerySet에 대한 내용은 [다음 포스트](https://kimdoky.github.io/django/2020/02/03/django-queryset-api/)를 참고하기를 바란다.

### 2-1. 쿼리셋 평가 이해하기

- 쿼리셋은 매우 게으르다.
    - 코드로 queryset을 생성하는 작업은 DB에 아무런 작업을 하지 않는다. DB의 query는 실제로
    queryset이 결과값이 평가되기 전까지 실행되지 않는다. 예를들어 filter를 아무리 많이
    하더라도 DB query는 일어나지 않는다.

- 쿼리셋 평가되는 시점
    - 반복, 슬라이싱, Pickling/Caching, repr(), len(), list(), bool()

- 데이터를 메모리에 저장하는 방법
    - 각 queryset에는 데이터베이스 접근을 최소화하기 위한 cache를 포함하고 있다.
        1. 새로운 queryset을 만들면 cache는 비어있는 상태이다.
        2. 데이터베이스 쿼리가 발생해서 쿼리셋이 평가되는데, Django는 query 결과를 queryset의 캐시에 저장한다. 그리고 요청사항에 따른 결과를 리턴한다.
    - 해당 queryset을 재사용하면 캐시된 결과를 가져와서 사용한다.

#### *Cache 활성화*

QuerySet에서 cache를 사용하려면 QuerySet을 변수에 저장하여 재사용하면 된다.

- 다음과 같은 코드는 캐싱하지 않았으므로 재사용이 불가능한 queryset이다

```python
print([e.headline for e in Entry.objects.all()])
print([e.pub_date for e in Entry.objects.all()])
```

- 아래 코드는 queryset이라는 변수에 QuerySet을 할당했다

```python
>>> queryset = Entry.objects.all()
>>> print([p.headline for p in queryset]) # QuerySet이 평가됨
>>> print([p.pub_date for p in queryset]) # 이미 평가가 되었으므로 캐시로 재사용한다.
```

#### *queryset이 평가되지 않을 때*

쿼리셋은 항상 그 결과를 캐싱하지는 않는다. 다음 코드를 보면서 이해해보자

```python
>>> queryset = Entry.objects.all()
>>> print(queryset[5]) # queryset이 평가되지 않았으므로 쿼리를 실행한다.
>>> print(queryset[5]) # queryset이 평가되지 않았으므로 쿼리를 실행한다.
```

```python
>>> queryset = Entry.objects.all()
>>> [entry for entry in queryset] # 리스트컴프리헨션을 사용해서 queryset이 평가되었다.
>>> print(queryset[5]) # 평가가 발생했기 때문에 캐시를 사용한다.
>>> print(queryset[10]) # 평가가 발생했기 때문에 캐시를 사용한다.
```

### 2-2. 캐시된 속성 이해하기

전체 쿼리셋을 캐싱할 뿐만 아니라, ORM 객체의 속성 또한 캐싱이 가능하다. 일반적으로 호출할 수 없는 속성은 캐시된다.

```python
>>> entry = Entry.objects.get(id=1)
>>> entry.blog   # 이때 blog가 연결된 어떠한 instance라면 쿼리가 발생하고 그것을 캐싱, 그게 아니라 어떠한 속성이라면 속성 값을 캐싱
>>> entry.blog   # instance라면 쿼리가 발생하지 않고 캐싱된 값을 가져온다. 속성이여도 캐싱된 값을 가져온다.
```

- 호출 가능한 속성은 캐싱되지 않고 DB에 접근한다.

```python
>>> entry = Entry.objects.get(id=1)
>>> entry.authors.all()   # 캐싱되지 않아서 쿼리가 발생한다.
>>> entry.authors.all()   # 캐싱되지 않아서 쿼리가 발생한다.
```

❌사용자가 정의한 속성은 주의를 해야한다. 캐싱이 필요하다면 `cached_property` 데코레이터를 사용해야한다.
[다음 포스트](https://americanopeople.tistory.com/317)를 참고하자.

### 2-3. iterator()를 사용해라

많은 양의 객체를 가져오게 될 때 쿼리셋의 캐싱하는 행위로 인해 많은 양의 메모리가 사용될 수 있다. 이때 `iterator()`를 사용하자

## 3. 파이썬으로 가져와서 처리하기보다 DB에서 결과를 처리하도록 하라

- F, aggregate를 사용하면 파이썬으로 가져오지 않고 DB에서 결과를 처리할 수 가 있는데 다음 포스트를 참고하자.

- [Django 공식문서](https://docs.djangoproject.com/en/3.0/topics/db/aggregation/#aggregation)
- [Django에서 F() 객체 알아보기](https://blog.myungseokang.dev/posts/django-f-class/)

## 4. 인덱스나 유니크한 값으로 조회해라

get()을 사용하여 단일 객체를 조회할 때 `unique` 또는 `db_index`열을 사용하는 데는
두 가지 이유가 있다.

1. 데이터베이스 인덱스로 인해 여러 쿼리 속도가 빨라진다.
2. 두번째 조회는 단 하나의 객체가 반환될 것이라고 보장하지 않는다.

## 5. 필요한 정보들을 알고 있다면 한 번에 싹 가져와라

- `select_related`와 `prefetch_related`를 통해서 적은 쿼리를 동작시키는 것이 효율적이다. 필요한 데이터가 무엇인지
알고 있으면서 여러번 데이터베이스를 hitting하는 것은 효율적이지 못하다.
- view 코드 혹은 다른 레이어에서 필요에 따라 prefetch\_related\_objects()를 사용해라.
- `select_related`와 `prefetch_related`에 대한 자세한 내용은 다음 포스트를 참고하라.

## 6. 필요없는 항목은 검색하지 마라

#### QuerySet.values() 및 values\_list()를 사용하기

dict 또는 list 값을 원할 때, ORM 모델 객체가 필요하지 않은 경우에는 values()를 적절하게
사용하라

#### QuerySet.`defer()` 및 `only()`를 사용하기

대부분 모든 데이터가 필요하지는 않을 것이다. 모든 컬럼이 로드되지 않도록 하려면 defer()와
only()를 사용하라<br>
하지만 잘못 사용하면 별도의 쿼리로 데이터를 가져와야 하므로 더 나빠질 수도 있다.<br>
<br>
또한 지연된 필드(deferred fields)가 있는 모델을 생성할 때, Django 내부에서 발생하는
약간의 오버 헤드가 있음에 유의하라. defer() 및 only() 메서드는 많은 텍스트 데이터를
로드하지 않거나 Python으로 다시 변환하기 위해 많은 처리가 필요한 필드의 경우
가장 유용하다. 항상 그렇듯이 먼저 프로파일링을 한 다음 최적화하라.

#### QuerySet.count()를 사용하라

len(queryset)을 사용하는 것보다 낫다.

#### QuerySet.exists()를 사용하라

적어도 하나가 있는지 확인하기 위해서는 if queryset을 사용하기보다 exists()를 사용하라

#### QuerySet.update()와 delete()를 사용하라

단일객체를 검색하고 일부를 변경하고 저장하지마라, bulk SQL UPDATE를 사용하라 또한 bulk delete
를 사용해도 좋다.

#### foreign key values를 직접 사용하라

`entry.blog.id` 보다 `entry.blog_id` 를 사용해라

#### 상관 없다면 결과를 정렬하지 말 것

odering은 비용이 안드는 작업이 아니다. 데이터베이스가 반드시 수행해야하는 작업이다.<br>
데이터베이스에 인덱스를 추가하면 정렬성능을 향상 시키는데 도움이 될 수 있다.

## 7. bulk를 사용하라

`bulk_create()`를 사용하면 query를 줄일 수 있다. 이런 방법은 ManyToMany에서도 동일하다.

```python
# bad
my_band.members.add(me)
my_band.members.add(my_friend)
```

```python
my_band.members.add(me, my_friend)
```

---

ref [django - QuerySets Evaluation and Caching](https://kimdoky.github.io/django/2020/03/11/django-querysets-cashing-eval/)
