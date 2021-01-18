---
title: Django/비지니스 로직 관리하기
date: 2020-07-03 13:07:70
layout: post
draft: false
path: "/python/django/manage-business-logic/"
category: "Django"
tags:
- "django"
description: "django를 사용할 때 비지니스 로직을 어떻게 관리하는지 알아봅시다."
---

django를 사용할 때 비지니스 로직을 어떻게 관리하는지 알아봅시다.

Django를 사용하면서 고민되는 점이 생겼습니다. 비지니스 로직을 어떻게 관리하는게 좋을까 하는 부분입니다.
(현재 진행하고 있는 프로젝트는 DRF를 사용하고 있습니다.)<br>
<br>
**views.py**는 CBV를 사용하고 있어서 최대한 간결하게 작성하고,
serializer의 메소드를 오버라이드 하여 작성하고 있습니다. 복잡한 비지니스로직을 작성하다보니
리팩토링의 필요성을 느꼈고, **models.py**에 모델메소드를 작성하고 있었습니다. 하지만 그마저도 너무 많아져서 fat model이 되버렸습니다.<br>
<br>

*"비지니스 로직을 어떻게 관리했을 때 프로젝트를 관리가 편해질까"*<br><br>

이런 질문에서부터 이 글이 시작되었습니다.<br>

## Fat models는 너무 많은 의존성을 만들어낸다.

비지니스 로직은 어떤 하나의 큰 흐름입니다. 그래서 비지니스 로직을 작성하다보면 흐름을 시작한
model 뿐만 아니라 다른 model에서의 메소드를 불러와서 호출하기도 합니다. 이런 방식은 불필요한 의존성을 만들어냅니다.<br>
<br>
의존성때문에 다른 모델에서의 변경이 발생하면 변경을 반영하기 위해서 흐름 안에 있는 코드를 수정해야 합니다.

## Fat models는 테스트를 어렵게 한다.

만약 나의 모델이 큰 흐름을 가지고 있다면, 내 테스트 코드들은 크고 많은 더미 데이터를 필요로 할 것입니다.

## Fat models는 SRP를 위반한다.

SRP(단일 책임 정책)은 클린 아키텍처의 5가지 원칙중의 하나로, 다음과 같은 원칙입니다. 자세한 내용은 다음에 `클린 아키텍처`라는
책을 읽고 블로깅 할 예정입니다.

- 클래스는 단 하나의 책임을 해야한다.
- 클래스가 변경되는 이유는 단 한 개여야 한다.

Fat models를 작성하다보면 많은 책임을 갖게 만듭니다. 예를 들어 User 모델은 user의 DB를 관리하는데 목적이 있습니다.<br>
User 모델에 메일을 보내거나 알림을 보내는 메소드를 작성하게 되면 어떤 알림이나 메일을 보내는 책임이 더해지는 것입니다.

## 흐름과 관련된 것이 아니라 attr을 변경하는 메소드를 작성하자

- 상태(attr)을 변경하는 것은 늘 행동(메소드)를 통해서 하세요. 매우 중요합니다.
직접 변경하게 되면 트랙킹하기가 어려울 것입니다. 사이즈가 커지면 커질수록 더욱 어렵습니다.
- Django의 모델은 python 클래스의 일부입니다. OOP의 관점에서 객체의 상태는 행동(메소드)에 의해서 변경 되어야합니다.

```python
from django.db import models

class Customer(models.Model):
    name = models.CharField(max_length=90)
    active = models.BooleanField(default=True)
    work_email = model.EmailField()
    personal_email = models.EmailField(null=True, blank=True)
```

- 다음과 같이 active의 상태를 변경하는 코드를 통해서 상태가 혼잡해지는 사태를 막을 수 있게 되었습니다.

```python
from django.db import models

class Customer(models.Model):
    name = models.CharField(max_length=90)
    active = models.BooleanField(default=True)
    work_email = model.EmailField()
    personal_email = models.EmailField(null=True, blank=True)

    def deactivate(self):
        self.active = False
        self.save(update_fields=["active"])
```

- 어떤 상태를 저장하는 것과 더불어 validation 하고 싶다면 다음과 같이 적으면 됩니다. 물론 DRF에서 validateion은
serializer에 validate를 오버라이드 하면 됩니다.

```python
from django.db import models

class Customer(models.Model):
    name = models.CharField(max_length=90)
    active = models.BooleanField(default=True)
    work_email = model.EmailField()
    personal_email = models.EmailField(null=True, blank=True)

    def deactivate(self):
        self.active = False
        self.save(update_fields=["active"])

      def set_personal_email(self, email):
          if self.work_email == email:
              raise ValueError(
                  "Personal email and work email are equal"
              )
          self.personal_email = email
          self.save(update_fields=["personal_email"])
```

## 의존성을 피하라

- 흐름 안에 있는 모델에서 다른 모델이나 클래스의 메소드를 호출하면 안됩니다.
- 특히나 서드파티를 이용할수록 더욱 그렇습니다. 예를들어 가입하게되었을 때에 환영 이메일을 보낸다고 가정합시다.
객체를 생성하는 코드에서 메일을 보낼 때에 서버에 이상이 생긴다면 생성되지도 않은 유저에게 이메일을 보내는 경우가 생깁니다.

## model manager를 사용해라

- 모델 매니저를 사용하면 여기저기서 쿼리가 남발 되는 것을 막을 수 있습니다. 매니저를 사용하게 되면 테스트가 더욱 쉬워지고,
한 곳에서만 변화를 만들 수 있습니다.

## 결론

제가 진행하고 있는 프로젝트에서는 다음과 같이 관리하기로 했습니다.

1. models는 객체의 속성만 다루는 메소드를 작성한다.

2. orm을 사용하여 query가 발생하는 메소드는 manager를 오버라이드하여 작성한다.

3. utils(service layer) 디렉토리를 만들어 기능단위로 파일을 만들어 관리한다.

    - 그중에서도 공통적으로 사용 가능한 부분은 또 따로 떼어낼 예정

<br>

더 참고할 포스트가 있다면 댓글로 남겨주시면 감사하겠습니다.

---

ref: [Django model Guideline](https://medium.com/@jairvercosa/django-model-guideline-d48a96c9b38c)<br>
