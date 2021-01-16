---
title: Django/null=True와 blank=True의 차이
date: 2019-12-16 11:02:18
layout: post
draft: false
path: "/python/django/difference-between-null-true-and-blank-true"
category: "Django"
tags:
- "django"
description: "django의 field option인 null=True와 blank=True에 대해서 알아봅시다."
---
django의 field option인 null=True와 blank=True에 대해서 알아봅시다.<br>
Django model을 검색하면 상위에 올라오는 검색어입니다.<br>
뭔가 빈 값을 허락하냐는 옵션인데 둘 다 비슷해보입니다.
분명 다른 것이 있으니 둘 다 제공할텐데 무엇이 다른지 차이를 알고 사용해봅시다.<br>

- Null
    DB와 관련되어 있습니다. 주어진 DB 컬럼이 null 값을 가질 것인지 아닌지를 정의합니다.
    DB에 저장시 컬럼의 값이 NULL(데이터 없음)이 저장됩니다.
- Blank
    유효성과 관련되어 있습니다. `form.is_valid()`가 호출될 때 폼 유효성 검사에 사용됩니다.
    쉽게 이야기하면, 필드가 폼(입력양식)에서 빈 채로 저장되는 것을 허용하느냐에 대한 물음으로, 허용시 ""(빈 스트링)이 저장됩니다.

여러 글에 따르면 개발자들이 많이 실수하는 부분은 `CharField`, `TextField`와 같은 문자열 기반 필드에 `null=True`를 정의하는 것입니다.
이 같은 실수를 피해야합니다. 그렇지 않으면 "데이터 없음"에 대해 두 가지 값, `None`과 `빈 문자열`을 갖게 됩니다.
"데이터 없음"에 대해 두 가지 값을 갖는 것은 중복입니다.<br>
<br>
즉, 문자열 기반의 모델 필드를 `nullable`하게 만들고 싶다면 다음과 같이 해야합니다.
```python
class Person(models.Model):
    name = models.CharField(max_length=255)
    introduce = models.TextField(blank=True)  # 여기서 null=True는 넣으면 안된다.
    birth_date = models.DateField(null=True, blank=True)  # 둘 다 넣어도 괜찮다.
```
