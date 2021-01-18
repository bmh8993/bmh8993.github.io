---
title: DRF/#08 Pagination 처리하기
date: 2020-05-06 23:05:74
layout: post
draft: false
path: "/python/django/drf-08-pagination/"
category: "Django"
tags:
- "DRF"
description: "DRF의 pagination에 대해서 알아봅시다."
---

# Pagination

- DRF는 커스텀 가능한 페이지네이션 스타일을 제공합니다.
- DRF에서 제공하는 pagination 기능은 두가지 입니다.

#### PageNumberPagination

- PageNumberPagination을 상속받아서 페이지네이션 클래스를 정의합니다.
- `page`: 1부터 시작하고, 몇 번째 페이지인지 표시해주는 query parmeter의 이름을
나타내는 default 문자열 value. `page_query_param`의 값을 설정하면 query parmeter 변경이 가능합니다.
- `page_size`: 한 페이지에 몇 개의 레코드를 보여줄지 표시해주는 key.
client로부터 `page_size`를 받기 위해서는 `page_size_query_param = page_size`라고 정의해야합니다.
- `end/point/?page=2&page_size=10`과 같이 호출하면 한 페이지에 10개씩 contents가 보이고 2페이지를 보는 endpoint가 완성됩니. `page_size_query_param`으로 설정하는 값은 `page_size`가 아니어도 됩니다.
단, endpoint에서 호출할 때 사용하는 파라미터 이름은 설정 값과 동일해야 합니다.

#### LimitOffsetPagination

- LimitOffsetPagination을 상속받아서 페이지네이션 클래스를 정의합니다.
- `limit_query_param`: "limit" query parmeter의 이름을 나타내는 문자열 value
- `offset_query_param`: "offset" query parmeter의 이름을 나타내는 문자열 value

## 모든 View에 동일한 Pagination 적용하기(전역 설정)

- settings.py에 아래 코드를 입력합니다.

```python
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 3
}
```

## 특정 View에 특정 Pagination 지정하기

- pagination class를 작성합니다.
- app/api/views.py에 다음과 같이 입력합니다.

```python
#  app/api/pagination.py

from rest_framework.pagination import PageNumberPagination


class SmallSetPagination(PageNumberPagination):
    page_size = 3  # default page_size를 3이라고 설정
    page_size_query_param = "page_size"  # page_size를 client로 부터 받아서 처리
```

```python
# app/api/views.py

from app.api.pagination import SmallSetPagination


class ExampleAPIView(...):

    ...
    pagenation_class = SmallSetPagination
```
---

ref: [Dean's blog](https://dean-kim.github.io/rest_framework/2017/05/12/Django-REST-Framework-Pagination.html)<br>
ref: [ssung.k](https://ssungkang.tistory.com/entry/Django-DRF-Pagination)
