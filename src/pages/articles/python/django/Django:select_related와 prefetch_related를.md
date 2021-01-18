---
title: Django/select_related와 prefetch_related를 정복해보자
date: 2020-07-06 20:07:84
layout: post
draft: false
path: "/python/django/select-related-and-prefetch_related/"
category: "Django"
tags:
- "django"
description: "select_related와 prefetch_related를 알아봅시다."
---
select_related와 prefetch_related를 알아봅시다.


Django의 유저라면 select\_related와 prefetch\_related를 모를 수 없을 것입니다. 하지만 얼마나 잘
사용하고 있는지는 의문점을 가져봐야 합니다. 저 또한 그런 의문이 들었기에 이번 포스트를 작성하게
되었습니다.<br>
<br>
설명을 위한 모델은 다음과 같습니다.

```python
# app/models.py

from django.db import models


class Publisher(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Book(models.Model):
    name = models.CharField(max_length=255)
    price = models.IntegerField(default=0)
    publisher = models.ForeignKey(Publisher, on_delete=models.CASCADE, related_name='books')

    def __str__(self):
        return self.name


class Store(models.Model):
    name = models.CharField(max_length=255)
    books = models.ManyToManyField(Book, related_name='stores')

    def __str__(self):
        return self.name
```

설명을 위한 데이터를 다음 조건에 맞춰서 만들 것입니다.<br>
<br>
100개의 book이 있고, 5개의 publisher는 각 publisher당 20개씩 출판했습니다. 그리고
10개의 매장에서 10개씩 판매중 입니다. custom command를 통해서 데이터를 insert 할 예정입니다.
`python manage.py insert`

```python
# app/management/commands/insert.py

import random

from django.core.management.base import BaseCommand

from ...models import Publisher, Store, Book


class Command(BaseCommand):
    """
    이 커맨드는 5개의 Publisher, 100개의 books와 10개의 Stores를 DB에 insert합니다.
    """

    def handle(self, *args, **options):
        Publisher.objects.all().delete()
        Book.objects.all().delete()
        Store.objects.all().delete()

        # create 5 publishers
        publishers = [Publisher(name=f"Publisher{index}") for index in range(1, 6)]
        Publisher.objects.bulk_create(publishers)

        # create 20 books for every publishers
        counter = 0
        books = []
        for publisher in Publisher.objects.all():
            for i in range(20):
                counter = counter + 1
                books.append(Book(name=f"Book{counter}", price=random.randint(50, 300), publisher=publisher))

        Book.objects.bulk_create(books)

        # create 10 stores and insert 10 books in every store
        books = list(Book.objects.all())
        for i in range(10):
            temp_books = [books.pop(0) for i in range(10)]
            store = Store.objects.create(name=f"Store{i+1}")
            store.books.set(temp_books)
            store.save()
```

그리고 보기 좋게 정리하기 위한 데코레이터를 작성합니다.
```python
import time
import functools

from django.db import connection, reset_queries


def query_debugger(func):

    @functools.wraps(func)
    def inner_func(*args, **kwargs):

        reset_queries()

        start_queries = len(connection.queries)

        start = time.perf_counter()
        result = func(*args, **kwargs)
        end = time.perf_counter()

        end_queries = len(connection.queries)

        print(f"Function : {func.__name__}")
        print(f"Number of Queries : {end_queries - start_queries}")
        print(f"Finished in : {(end - start):.2f}s")
        return result

    return inner_func
```



# select\_related
`select_related`는 관련된 단일객체를 가져오는데, 정참조일 때에는 `ForeignKey, OneToOne`, 역참조 일때에는 `OneToOne`일 때에 사용합니다.<br>
<br>
`select_related`를 SQL로 풀어보면 `Inner Join`을 하여 관련 개체의 필드를 `Select` 문에 포함시켜서 관련 개체를 얻습니다.

## bad

```python
from query_debugger import query_debugger

@query_debugger
def book_list():

    queryset = Book.objects.all()

    books = []
    for book in queryset:  # queryset 평가
        books.append({
            'id': book.id,
            'name': book.name,
            'publisher': book.publisher.name
            }
        )
    # book.publisher에 접근, 캐싱되지 않은 데이터이므로 query 발생

    return books
```

결과는 다음과 같습니다.

```
Function : book_list
Number of Queries : 101
Finished in : 0.05s
```

하나의 쿼리가 모든 책에 접근하고 반복하는 동안 ForeignKey로 연결된 `Publisher`에 각각 접근하여 쿼리가 실행됩니다.<br>
<br>
실제로 sql을 보면

1. book에 접근하는 쿼리 1
2. book에 해당하는 publisher에 접근하는 쿼리 100개

`총 101개`의 쿼리가 실행됩니다.

## good

`select_related`를 사용해서 결과를 확인해 봅시다.

```python
@query_debugger
def book_list():

    queryset = Book.objects.select_related("publisher").all()

    books = []
    for book in queryset:  # queryset 평가
        books.append({
            'id': book.id,
            'name': book.name,
            'publisher': book.publisher.name
            }
        )

    return books
```

결과는 다음과 같습니다.

```
Function : book_list
Number of Queries : 1
Finished in : 0.00s
```

Publisher를 Inner Join으로 하나의 쿼리로 가져온결과, 101개 에서 1개로 쿼리가 줄었습니다!

# 정참조에서의 prefetch\_related(ManyToMany)

## Example1
`prefetch_related`는 두개의 테이블을 가져와서 **Python에서 Join을 합니다.**
정참조일 때에는 `ManyToMany` 역참조일 때에는 `ForeignKey, ManyToMany`일 때에 사용합니다.<br>

## bad

```python
@query_debugger
def store_list():

    queryset = Store.objects.all()

    stores = []
    for store in queryset:  # 쿼리셋 평가
        books = [book.name for book in store.books.all()]  # 각 store마다 books로 접근, 쿼리 발생
        stores.append({
            'id': store.id,
            'name': store.name,
            'books': books
            }
        )

    return stores
```

결과는 다음과 같습니다.

```
Function : store_list
Number of Queries : 11
Finished in : 0.01s
```

SQL은 다음과 같습니다.

```sql
SELECT "bookstore_store"."id", "bookstore_store"."name"
FROM "bookstore_store"

SELECT "bookstore_book"."id", "bookstore_book"."name", "bookstore_book"."price", "bookstore_book"."publisher_id"
FROM "bookstore_book"
INNER JOIN "bookstore_store_books"
ON ("bookstore_book"."id" = "bookstore_store_books"."book_id")
WHERE "bookstore_store_books"."store_id" = 1

...

SELECT "bookstore_book"."id", "bookstore_book"."name", "bookstore_book"."price", "bookstore_book"."publisher_id"
FROM "bookstore_book"
INNER JOIN "bookstore_store_books"
ON ("bookstore_book"."id" = "bookstore_store_books"."book_id")
WHERE "bookstore_store_books"."store_id" = 10
```

데이터베이스 내에는 10개의 상점이 있고 각각 10권의 책을 가지고 있습니다. 쿼리가 어떻게 되었는지 살펴보면
일단 하나의 쿼리로 모든 상점들을 fetch해오고 반복문을 돌면서 하나의 상점에서 각각 쿼리를 발생시켜 books에 접근을 했습니다.
그래서 1 + 10 과같은 결과를 가져온 것입니다.

## good

`prefetch_related`를 사용하여 결과를 살펴봅시다

```python
@query_debugger
def store_list():

    queryset = Store.objects.prefetch_related("books").all()

    stores = []
    for store in queryset:
        books = [book.name for book in store.books.all()]
        stores.append({'id': store.id, 'name': store.name, 'books': books})

    return stores
```

결과는 다음과 같습니다.

```
Function : store_list
Number of Queries : 2
Finished in : 0.01s
```

SQL은 다음과 같습니다.

`prefetch_related`를 사용한 결과는 SQL을 살펴보면 조금 더 빠르게 이해할 수 있을 것 같습니다.

```sql
SELECT "bookstore_store"."id", "bookstore_store"."name"
FROM "bookstore_store"

SELECT ("bookstore_store_books"."store_id") AS "_prefetch_related_val_store_id", "bookstore_book"."id", "bookstore_book"."name", "bookstore_book"."price", "bookstore_book"."publisher_id"
FROM "bookstore_book"
INNER JOIN "bookstore_store_books"
ON ("bookstore_book"."id" = "bookstore_store_books"."book_id")
WHERE "bookstore_store_books"."store_id"
IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)'
```

`prefetch_related`를 사용하지 않았을 때와 다른 점은 두번째 쿼리에서 store의 id 값들을 가져와서 In을 사용한다는 것입니다. 이것을 통해서 여러번
매칭 하였던 것을 한 번으로 줄여서 1 + 1과 같은 결과를 가져왔습니다.

## Example2

이번에는 필터를 사용한 결과를 살펴봅시다.

## bad

```python
@query_debugger
def store_list():

    queryset = Store.objects.prefetch_related("books").all()

    stores = []
    for store in queryset:
        books = [book.name for book in store.books.filter(price__range=(250,300))]
        stores.append({'id': store.id, 'name': store.name, 'books': books})

    return stores
```

결과는 다음과 같습니다

```
Function : store_list
Number of Queries : 12
Finished in : 0.01s
```

SQL은 다음과 같습니다

```sql
SELECT "bookstore_store"."id", "bookstore_store"."name"
FROM "bookstore_store"

SELECT ("bookstore_store_books"."store_id") AS "_prefetch_related_val_store_id", "bookstore_book"."id", "bookstore_book"."name", "bookstore_book"."price", "bookstore_book"."publisher_id"
FROM "bookstore_book"
INNER JOIN "bookstore_store_books"
ON ("bookstore_book"."id" = "bookstore_store_books"."book_id")
WHERE "bookstore_store_books"."store_id" IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)'

SELECT "bookstore_book"."id", "bookstore_book"."name", "bookstore_book"."price", "bookstore_book"."publisher_id"
FROM "bookstore_book"
INNER JOIN "bookstore_store_books"
ON ("bookstore_book"."id" = "bookstore_store_books"."book_id")
WHERE ("bookstore_store_books"."store_id" = 1 AND "bookstore_book"."price" BETWEEN 250 AND 300)

...

SELECT "bookstore_book"."id", "bookstore_book"."name", "bookstore_book"."price", "bookstore_book"."publisher_id"
FROM "bookstore_book"
INNER JOIN "bookstore_store_books"
ON ("bookstore_book"."id" = "bookstore_store_books"."book_id")
WHERE ("bookstore_store_books"."store_id" = 10 AND "bookstore_book"."price" BETWEEN 250 AND 300)
```

조건이 추가되자 조건을 필터링하는 구문을 포함한 쿼리가 추가로 실행되었습니다.
1 + 1 + 10 총 12개의 쿼리가 발생했습니다.

## good

Prefetch를 사용하여 다시 작성해보도록 합시다

```python
@query_debugger
def store_list():

    queryset = Store.objects.prefetch_related(
        Prefetch("books", queryset=Book.objects.filter(price__range=(250, 300))))

    stores = []
    for store in queryset:
        books = [book.name for book in store.books.all()]
        stores.append({'id': store.id, 'name': store.name, 'books': books})

    return stores
```

결과는 다음과 같습니다.

```
Function : store_list
Number of Queries : 2
Finished in : 0.00s
```

SQL은 다음과 같습니다.

```sql
SELECT "bookstore_store"."id", "bookstore_store"."name"
FROM "bookstore_store"

SELECT ("bookstore_store_books"."store_id") AS "_prefetch_related_val_store_id", "bookstore_book"."id", "bookstore_book"."name", "bookstore_book"."price", "bookstore_book"."publisher_id"
FROM "bookstore_book"
INNER JOIN "bookstore_store_books"
ON ("bookstore_book"."id" = "bookstore_store_books"."book_id")
WHERE ("bookstore_book"."price" BETWEEN 250 AND 300 AND "bookstore_store_books"."store_id" IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10))
```

Prefetch를 사용하니까 별도의 쿼리를 작성했던 WHERE를 AND로 묶어서 하나의 쿼리를 생성했습니다.

# 역참조에서의 prefetch\_related

## Example1

**부모와 관련된 자식 데이터를 가져올 때**<br>
<br>
이번에는 역참조입니다. 지금까지 사용한 관계에서 예를 들면 Publisher가 출간한 book들을 조회할 때에 사용할 수 있습니다.

## bad

```python
@query_debugger
def publisher_list():

    queryset = Publisher.objects.all()

    publishers = []
    for publisher in queryset:
        books = [book.name for book in publisher.books.all()]
        publishers.append({'id': publisher.id, 'name': publisher.name, 'books': books})

    return publishers
```

결과는 다음과 같습니다.

```
Function : publisher_list
Number of Queries : 6
Finished in : 0.00s
```

SQL은 다음과 같습니다.

```sql
SELECT "bookstore_publisher"."id", "bookstore_publisher"."name"
FROM "bookstore_publisher"

SELECT "bookstore_book"."id", "bookstore_book"."name", "bookstore_book"."price", "bookstore_book"."publisher_id"
FROM "bookstore_book"
WHERE "bookstore_book"."publisher_id" = 1

...

SELECT "bookstore_book"."id", "bookstore_book"."name", "bookstore_book"."price", "bookstore_book"."publisher_id"
FROM "bookstore_book"
WHERE "bookstore_book"."publisher_id" = 5
```

일단 Publisher를 가져오는 쿼리 1개, book중에서 publisher의 id와 동일한 book을 가져오는 쿼리 5개(1~5까지)
총 6개입니다.

## good

역참조에서 `prefetch_related`를 사용해봅시다.

```python
@query_debugger
def publisher_list():

    queryset = Publisher.objects.prefetch_related("books")

    publishers = []
    for publisher in queryset:
        books = [book.name for book in publisher.books.all()]
        publishers.append({'id': publisher.id, 'name': publisher.name, 'books': books})

    return publishers
```

결과는 다음과 같습니다.

```
Function : publisher_list
Number of Queries : 2
Finished in : 0.00s
```

SQL은 다음과 같습니다.

```sql
SELECT "bookstore_publisher"."id", "bookstore_publisher"."name"
FROM "bookstore_publisher"

SELECT "bookstore_book"."id", "bookstore_book"."name", "bookstore_book"."price", "bookstore_book"."publisher_id"
FROM "bookstore_book"
WHERE "bookstore_book"."publisher_id" IN (1, 2, 3, 4, 5)
```

동일하게 Publisher를 가져오는 쿼리 1개, 위 와다르게 book에 WHERE ~ IN을 사용한 쿼리 1개로 총 2개가 되었습니다.

## Example2

**자식 테이블에 조건을 걸어서 조건에 해당하는 부모객체를 가져올 때**<br>
<br>
250~300에 출간한 책들을 가지고 있는 출판사 데이터를 가져와봅시다. 배운바에 의하면 역참조를 위해
`prefetch_related`를 사용하고 필터를 걸어야합니다.

## bad

```python
@query_debugger
def publisher_list():

    queryset = Publisher.objects.prefetch_related("books").filter(books__price__range=(250,3 00))

    publishers = []
    for publisher in queryset:
        publishers.append({'id': publisher.id, 'name': publisher.name})

    return publishers
```

결과는 다음과 같습니다.

```
Function : publisher_list
Number of Queries : 2
Finished in : 0.01s
```

SQL 다음과 같습니다.
- 첫번째 SQL은 publisher에 book을 inner join 해서 가져옵니다. 그리고
그 book의 조건은 250~300사이의 가격을 형성하고 있다는 것 입니다. 해당하는 publisher들을 가져옵니다.
- 두번째 SLQ은 book을 가져오는데 여기서 in 조건에 들어간 id들은 첫번째 sql에서 나온 결과에 해당하는
publisher의 id입니다. 해당 publisher에게 속해있는 모든 책들을 가져옵니다.

```sql
SELECT "bookstore_publisher"."id", "bookstore_publisher"."name"
FROM "bookstore_publisher"
INNER JOIN "bookstore_book"
ON ("bookstore_publisher"."id" = "bookstore_book"."publisher_id")
WHERE "bookstore_book"."price" BETWEEN 250 AND 300

SELECT "bookstore_book"."id", "bookstore_book"."name", "bookstore_book"."price", "bookstore_book"."publisher_id"
FROM "bookstore_book"
WHERE "bookstore_book"."publisher_id" IN (1, 2, 4, 5)
```

## good

```python
@query_debugger
def publisher_list():

    queryset = Publisher.objects.filter(books__price__range=(250,300))

    publishers = []
    for publisher in queryset:
        publishers.append({'id': publisher.id, 'name': publisher.name})

    return publishers
```

결과는 다음과 같습니다.

```
Function : publisher_list
Number of Queries : 1
Finished in : 0.00s
```

sql을 살펴보면 이전의 첫번째 sql과 동일합니다. 어떻게 된 일일까요

```sql
SELECT `bookstore_publisher`.`id`, `bookstore_publisher`.`name`
FROM `bookstore_publisher`
INNER JOIN `bookstore_book`
ON (`bookstore_publisher`.`id` = `bookstore_book`.`publisher_id`)
WHERE `bookstore_book`.`price` BETWEEN 250 AND 300
```

django의 query 소스코드를 봅시다.

```python
def demote_joins(self, aliases):
    """
    Change join type from LOUTER to INNER for all joins in aliases.

    Similarly to promote_joins(), this method must ensure no join chains
    containing first an outer, then an inner join are generated. If we
    are demoting b->c join in chain a LOUTER b LOUTER c then we must
    demote a->b automatically, or otherwise the demotion of b->c doesn't
    actually change anything in the query results. .
    """
    aliases = list(aliases)
    while aliases:
        alias = aliases.pop(0)
        if self.alias_map[alias].join_type == LOUTER:
            self.alias_map[alias] = self.alias_map[alias].demote()
            parent_alias = self.alias_map[alias].parent_alias
            if self.alias_map[parent_alias].join_type == INNER:
                aliases.append(parent_alias)
```

소스 코드를 보면 chain join이 없으면 inner join으로 쿼리를 하도록 강제하고 있기 때문입니다.<br>
<br>
많은 블로그 내용들을 하나로 모아보았습니다. 귀한 내용을 공유해주신 개발자님들께 다시한번 감사를 드립니다.

---

ref: [Django 나만의 Management Command 만들어보기](https://blog.myungseokang.dev/posts/make-django-custom-command/)<br>
ref: [Python decorator에 @wraps를 사용해야 하는 이유](https://cjh5414.github.io/wraps-with-decorator/)<br>
ref: [Django select_related and prefetch_related](https://medium.com/better-programming/django-select-related-and-prefetch-related-f23043fd635d)<br>
ref: [당신이 몰랐던 Django Prefetch.](https://medium.com/chrisjune-13837/%EB%8B%B9%EC%8B%A0%EC%9D%B4-%EB%AA%B0%EB%9E%90%EB%8D%98-django-prefetch-5d7dd0bd7e15)
