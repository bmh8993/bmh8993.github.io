---
title: SQL#03//sql 큰 그림에서 작은 그림으로
date: 2020-02-12 23:02:56
layout: post
draft: false
path: "/cs/db-sql/sql-03/"
category: "DB&SQL"
tags:
- "sql"
description: "SQL을 짜는 전략에 대해서 알아봅시다."
---
지난 포스트에서 설명한 내용을 가져오겠습니다.<br><br>

`순위`는 `누적 대출액`을 기준으로 내림차순 정렬할 예정입니다. 순위는 없는 컬럼이므로 만들어야 할 것 같습니다.<br>
`순위 변동`이라는 데이터는 말 그대로 변동을 나타내기 때문에 **오늘과 어제**처럼 차이가 필요합니다.<br>
여기서 중요한 것은 `어제와 오늘` 테이블 `두 개`가 필요하고, 두 개의 테이블은 관계가 필요하다는 말이 됩니다.<br>
`회사이름`, `누적 대출액`, `누적 상환액`은 Item 테이블에서 가져올 수 있는 데이터 입니다.<br>
`순수 대출액`은 하나의 테이블, 예를 들면 오늘의 테이블 안에서 계산할 수 있는 데이터 입니다.<br><br>

조건을 살펴보면 필터 조건이 있습니다. 그런데 문제가 있습니다.
`Header`테이블과 `Item`테이블은 서로 전혀 다른 데이터를 가지고 있습니다.
`Header`테이블은 조건을, `Item`테이블은 정보를 가지고 있습니다. 두 테이블의 연결고리는 `company_no`뿐입니다.

---
이해를 위해 `단계`라는 표현을 그림으로 표현했었는데 이제부터는 `단계`라고 표시하겠습니다.
또한 `약속`을 하나 하자면 가장 상위 단계의 테이블을 `A`, 그 다음을 `B`, 그 다음을 `C`라고 표시하고
같은 단계에서 존재하는 서로 다른 테이블은 `1, 2, 3..`과 같이 표시하겠습니다.<br>
**이렇게 표시하는 점이 생각보다 중요합니다.** 하지만 약속일 뿐 스스로 정해도 좋습니다.<br>
(SQL의 기본적인 부분은 학습이 되어져 있다고 가정하겠습니다.)

---
### A단계
```sql
Select A1.순위, ifnull(A2.순위 - A1.순위, "new"), A1.회사 이름, A1.누적 대출액, A1.기타 데이터
From 오늘 A1
Left Outer Join 어제 A2
On A1.companyNo = A2.companyNo
```
이렇게 제일 큰 단계의 쿼리가 완성 되었습니다.<br>
`Inner Join`이 아닌 `Left Outer Join`을 한 이유는 어제는 없던 회사가 오늘 생겼을 수가 있기 때문입니다.
- `Inner Join`은 `매칭 조건(On)`이 두 개의 테이블에 완전히 매칭되는 로우만 보여줍니다.
- 하지만 `Left Outer Join`은 `매칭 조건(On)`을 기본으로 매칭하지만, 매칭되지 않는 로우도 `함께` 보여줍니다. 그래서 `ifnull`을 사용했습니다.

나머지는 모두 오늘(A1)에서 가져올 수 있는 데이터 입니다. 다음 하위 단계(B)를 작성해보겠습니다.

---
### B단계
```sql
Select B2.@num1:=@num1+1 as 순위, B1.회사 이름, B1.누적 대출액, B1.기타 데이터
From 순위를 제외한 데이터를 가지고 있는 테이블 B1
Inner Join (Select @num1:=0) B2
On 1 = 1
Order By 정렬 조건(조건 2번 + 5번)
```
`B`단계의 쿼리로 `오늘(A1)`에 해당하는 쿼리입니다.<br>
위에서 설명 했듯이 `순위`는 없는 컬럼입니다. 없는 컬럼은 `Inner Join`의 대상이 되는 테이블 안에서 변수를 통해 만들어줍니다.
그리고 순위를 제외한 데이터를 가지고 있는 테이블과 `Join` 합니다. `Outer Join`도 무관해 보입니다. 어짜피 Join 조건은 없으니까요.<br>
이후에 정렬을 진행합니다. 5번 조건에 해당하는 정렬은 Order By 뒤로 넣어줍니다.<br>
<br>
**여기서 잠깐, 오늘과 어제의 차이는 무엇일까요?**<br>
B1에서 날짜 조건을 통해 차이가 생깁니다. 즉, B1과 B2는 구조가 동일하다는 이야기가 됩니다.
다음 하위 단계(C)를 작성해보겠습니다.

---
### C단계
```sql
Select C1.회사 이름, C2.누적 대출액, C2.기타 데이터
From Header C1
Inner Join Item C2
On C1.companyNo = C2.companyNo
Where 데이터의 생성 날짜 = (D단계)(조건 4번)
And C1.isUse = 1(조건 1번)
And 추가 필터 조건(조건 3번)
Order By 정렬 조건(조건 2번 + 5번)
```
`오늘(A1)`에 해당하는 C단계 입니다.<br>
B단계에서 회사 이름을 가져오고 여러 조건들을 통해 필터를 진행하기 위해서 `Inner Join`이 필요합니다.<br>
거의 마지막 단계에서 필터 조건이나 정렬 조건이 사용됩니다.<br>
마지막 D단계 입니다.

---
### D단계
```sql
Select stdDate
From Item
Where stdDate <= DATE_FORMAT(now(), "%Y-%m-%d")
Order By stdDate Desc
Limin 0, 1
```
C단계의 Where에 들어갈 서브쿼리 입니다. 어제 날짜를 구하려면 `<=`가 아닌 `<`로 바꿔주시면 됩니다.<br>
하나씩 차분히 하다보면 생각보다 어렵지 않습니다.<br>
<br>
전체 쿼리를 작성해보겠습니다.
```sql
Select A1.순위, ifnull(A2.순위 - A1.순위, "new"), A1.회사 이름, A1.누적 대출액, A1.기타 데이터
From (
    Select B2.@num1:=@num1+1 as 순위, B1.회사 이름, B1.누적 대출액, B1.기타 데이터
    From (
      Select C1.회사 이름, C2.누적 대출액, C2.기타 데이터
      From Header C1
      Inner Join Item C2
      On C1.companyNo = C2.companyNo
      Where 데이터의 생성 날짜 = (
        Select stdDate
        From Item
        Where stdDate <= DATE_FORMAT(now(), "%Y-%m-%d")
        Order By stdDate Desc
        Limin 0, 1
        )
      And C1.isUse = 1
      And 추가 필터 조건
      Order By 정렬 조건
      ) B1
    Inner Join (Select @num1:=0) B2
    On 1 = 1
    Order By 정렬 조건
    ) A1
Left Outer Join (
    Select B2.@num2:=@num2+1 as 순위, B1.회사 이름, B1.누적 대출액, B1.기타 데이터
    From (
      Select C1.회사 이름, C2.누적 대출액, C2.기타 데이터
      From Header C1
      Inner Join Item C2
      On C1.companyNo = C2.companyNo
      Where 데이터의 생성 날짜 = (
        Select stdDate
        From Item
        Where stdDate < DATE_FORMAT(now(), "%Y-%m-%d")
        Order By stdDate Desc
        Limin 0, 1
        )
      And C1.isUse = 1
      And 추가 필터 조건
      Order By 정렬 조건
      ) B1
    Inner Join (Select @num2:=0) B2
    On 1 = 1
    Order By 정렬 조건
    ) A2
On A1.companyNo = A2.companyNo
```
모두 합치기만 하면 됩니다.<br>
이렇게 정리하고보니 생각보다 수월해보입니다. 여러 테이블을 가지고 연습하시면 좋을 것 같습니다.<br>
기본서를 추천해 드리자면 `SQL 첫걸음`을 추천드립니다.<br>
추천하는 이유는 일단 `mysql`을 베이스로 하고 있으며, 직접 다룰 수 있도록 예제 파일과 예제가 준비되어 있습니다.<br>

### 지극히 주관적인 블로그를 읽어주셔서 감사합니다!
