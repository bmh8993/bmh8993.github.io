---
title: Django / Multiple Databases 세팅하기
date: 2020-02-01 20:02:17
layout: post
draft: false
path: "/python/django/multiple-db/"
category: "Django"
tags:
- "django"
description: "Django에서 multiple DB를 사용하는 방법에 대해 알아봅시다."
---
현재 내가 있는 회사(Dailyfunding)에서 새로운 프로젝트를 진행중이다.
내가 담당하고 있는 백엔드는 python으로 Django 프레임워크를 사용하고 있다.
현재 진행 중인 프로젝트에서 100여개의 크롤링 데이터를 사용해야하는데,
크롤러가 python이 아닌 php로 개발되어져 있어서, 기존의 크롤러를 python으로 새로 만들기에는 많은 시간이 걸릴 것으로 판단했다.
그래서 내린 결론은 Django에서 어떤 하나의 앱으로 접근했을 때에 크롤러가 쌓고 있는 데이터의 DB로 접근하도록 하는 것이다.
찾아보니 Django 에서는 `multiple Databases` 기능을 제공한다.<br><br>
아래 step은 공식문서를 기준을 작성 되었다.

## Multiple Databases
1. **Defining you databases**<br>
첫번째 단계는 내가 사용할 데이터베이스에 대해서 Django에게 얘기해주는 것이다. 즉 세팅을 해야한다.
데이터베이스에는 내가 선택한 세팅을 할 수 있는데, 주의 해야할 점이 있다면
다른 데이터베이스가 선택되지 않은 경우에는 기본값으로 설정한 데이터베이스를 선택한다는 점이다.<br><br>
아래의 코드는 공식문서를 참고한 내가 실제로 사용려는 코드이다 물론 db password는 진짜가 아니다.
```python
DATABASES = {
    'default': {
        'ENGINE': 'mysql.connector.django',
        'NAME': 'db_name',
        'USER': 'db_user',
        'PASSWORD': 'db_password',
        'HOST': '127.0.0.1',
        'PORT': '3306',
        'TEST': {
            'CHARSET': 'utf8',
            'COLLATION': 'utf8_general_ci',
        },
        'OPTIONS': {
            'charset': 'utf8',
            'use_pure': True
        }
    },
    "crawler": {
        'ENGINE': 'mysql.connector.django',
        'NAME': 'db_name',
        'USER': 'db_user',
        'PASSWORD': 'db_password',
        'HOST': '127.0.0.1',
        'PORT': '3306',
        'TEST': {
            'CHARSET': 'utf8',
            'COLLATION': 'utf8_general_ci',
        },
        'OPTIONS': {
            'charset': 'utf8',
            'use_pure': True
        }

    }
}
```
이제 두가지 방법이 있다.
#### SQL로 직접 참조
#### ORM으로 참조

아래의 방법은 ORM으로 참조하는 방법을 설명한다.

## Database Routers
2. **set up database routing scheme**<br>
request를 받았을 때에 어떤 데이터베이스로 연결지어야 할지 결정을 해야하는데 이를 해주는 것이 라우터이다.
라우터는 네가지 메소드를 제공하는 클래스이다.<br>
`router.py`의 작성 위치는 해당 앱 하위에 생성하면 된다.

```python
class DB_routers:
    """
    데이터베이스의 연산을 제어하는 중계기
    """

    def db_for_read(self, model, **hints):
        """
        daily_lab의 모델을 조회하는 경우 daily_lab_db로 중계한다.
        """
        if model._meta.app_label == "daily_lab":
            return "daily_lab_db"
        return None

    def db_for_write(self, model, **hints):
        """
        daily_lab의 모델을 기록하는 경우 daily_lab_db로 중계한다.
        """
        if model._meta.app_label == "daily_lab":
            return "daily_lab_db"
        return None

    def allow_relation(elf, obj1, obj2, **hints):
        """
        daily_lab의 모델과 관련된 관계접근을 허용한다.
        """
        if (obj1._meta.app_label == "daily_lab" or
            obj2._meta.app_label == "daily_lab"):
            return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        daily_lab의 migrate_file이 daily_lab_db에만 migrate 되도록한다.
        """
        if app_label == "daily_lab":
            return db == "daily_lab_db"
        return None
```
## Models
DB_settings와 router 클래스를 모두 작성하였다면 models를 작성해야하는데,
어짜피 이미 짜여진 테이블 구조를 가져온다면 `instpectdb`라는 기능을 통해서 models의 내용을 가져오자.

```shell
python manage.py inspectdb --database=daily_lab_db > daily_lab/models.py
```

이렇게 해서 models.py를 열어보면 작성되어져 있다. 이후 View에서 ORM을 사용해서 data를 가져오면 된다.
<br><br>
이번 리서치를 통해서 다시한번 느낀다. 주니어 개발자로서 어디까지 가능한지 판단하지 말고 생각하고 찾아보는 것이다.
그리고 그 어디까지는 상상불가라는 것이다. `multiple Databases` 생각하지도 못했다. 그저 CTO님의 제안이었다.
로직 안에서만 가능한지를 생각하지말고 전체적인 부분에서도 생각해보자. 불가능은 없다.

---
ref: [django multi-db docs](https://docs.djangoproject.com/en/2.2/topics/db/multi-db)<br>
ref: [multiple databases cook book](https://django-orm-cookbook-ko.readthedocs.io/en/latest/multiple_databases.html)<br>
ref: [multiple db two settings](https://dooha.tistory.com/15)<br>
ref: [django instpectdb](https://tbang.tistory.com/65)<br>
