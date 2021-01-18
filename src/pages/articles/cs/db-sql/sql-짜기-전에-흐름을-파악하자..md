---
title: SQL#01//sql 짜기 전에 흐름을 파악하자
date: 2020-02-10 00:02:19
layout: post
draft: false
path: "/cs/db-sql/sql-01/"
category: "DB&SQL"
tags:
- "sql"
description: "SQL을 짜는 전략에 대해서 알아봅시다."
---
sql이 아닌 django의 orm으로 데이터를 추출하는 것에 익숙한 저는
raw query를 사용해야하는 일이 생겼습니다.
```python
from django.db import models


class Header(models.Model):
    company_no = models.IntegerField(db_column='companyNo', primary_key=True)
    company_name = models.CharField(db_column='companyName', max_length=100)
    is_association = models.IntegerField(db_column='isAssociation')
    is_use = models.IntegerField(db_column='isUse')

    class Meta:
        managed = False
        db_table = 'header'


class Item(models.Model):
    std_date = models.DateField(db_column='stdDate')
    company_no = models.IntegerField(db_column='companyNo')
    loan = models.BigIntegerField(blank=True, null=True)
    repay = models.BigIntegerField(blank=True, null=True)
    balance = models.BigIntegerField(blank=True, null=True)
    profit_rate = models.DecimalField(db_column='profitRate', max_digits=5, decimal_places=2, blank=True, null=True)
    loss_rate = models.DecimalField(db_column='lossRate', max_digits=5, decimal_places=2, blank=True, null=True)
    overdue_rate = models.DecimalField(db_column='overdueRate', max_digits=5, decimal_places=2, blank=True, null=True)
    company_std_date = models.DateField(db_column='companyStdDate', blank=True, null=True)
    create_date = models.DateTimeField(db_column='createDate')
    update_date = models.DateTimeField(db_column='updateDate')

    class Meta:
        managed = False
        db_table = 'item'
        unique_together = (('std_date', 'company_no'),)
```
위의 데이터 구조는 `inspectdb`를 통해서 자동으로 작성된 `models.py`입니다.<br>
`Header`테이블은 새로운 회사가 유입되지 않는 이상 변화가 없습니다.<br>
`Item`테이블은 매일 새로운 데이터로 업데이트 됩니다.

####1편에서는 sql에 대한 설명은 아닙니다.

저는 django의 orm을 통해서 데이터를 가져오는 것에 익숙했습니다.
그런 상태로 sql을 접하니 알 것 같으면서 모르겠다고 느껴졌습니다.
그 이유는 django의 `직관적인 orm` 때문이라고 생각됩니다.
orm을 사용하면서 어디서 어떤 조건으로 데이터를 가져와야 하는지 흐름을 이해했습니다. 예를 들면 `filter`와 같은 것이 있습니다.<br><br>
하지만 sql은 where 조건을 사용하게 되는데 간단하게는 `true`나 `false`로, 더 나아가서는 서브쿼리로 조건을 사용하게 됩니다.
서브쿼리가 보여지는 방식은 orm보다는 다소 불편합니다. 그래서 더 어렵게 보여졌다봅니다.<br><br>
제가 이해하는 방식은 오로지 제 기준입니다. 나름 정리해 본 순서를 적어보겠습니다.

### 1. 추출하고자 하는 데이터를 설정한다.
이어질 포스트들을 한 가지 목표를 가지고 진행이 될 예정입니다.<br>
제가 가져올 데이터들은 다음과 같습니다.

1. 순위
2. 순위 변동(기준일자와 기준일자의 하루 전데이터의 비교)
3. 회사 이름
4. 누적 대출액
5. 기타 데이터

### 2. 조건이 있다면 조건을 정리하고, 계산을 해야하는 데이터를 구분한다.
두 번째로 할 일은 정리하는 시간을 갖는 겁니다.<br>

- 조건을 먼저 정리해보겠습니다.
  1. is\_use = True
  2. `누적 대출액`을 기준으로 내림차순 정렬을 진행합니다.
  3. is\_association의 값이 `True` or `False` 혹은 `True와 False 모두` 이렇게 첫번째 필터 조건이 있습니다.
  4. 기준 일자를 설정합니다.
  5. 기타 컬럼들로 정렬이 가능해야합니다.
<br><br>
- 다음으로는 계산을 해야하는 데이터를 구분합니다. 구분 할 때에는 두 가지로 분류합니다.

  1. 새로운 컬럼을 만들어야하는 데이터
        - 위의 예시에서 1번에 해당하는 것은 `순위`입니다.
  2. 두개 이상의 테이블에서 계산이 이루어져서 만들어지는 데이터
        - 2번에 해당하는 것은 `순위 변동`입니다. 순위 변동은 오늘의 데이터 테이블과 어제의 데이터 테이블에서 순위를 각각 가져와 계산을 해야합니다.


### 3. 데이터 추출을 위해 테이블 간에 관계가 필요하다면 어떤 관계로 이루어 져야 할지 정리한다.
세 번째는 테이블 간의 관계를 정하는 일입니다.<br>
관계를 정리하고 큰 그림의 sql문을 작성합니다.

orm을 사용하면서 데이터를 가져오는 흐름에 익숙하신 분들은 조금만 생각해보시면
금방 sql을 사용할 수 있으실거라 생각합니다.
[다음 포스트](https://bmh8993.github.io/DATABASE&SQL/sql-%ED%81%B0-%EA%B7%B8%EB%A6%BC%EC%9D%84-%EA%B7%B8%EB%A0%A4%EB%B3%B4%EC%9E%90/) 로 이어집니다
