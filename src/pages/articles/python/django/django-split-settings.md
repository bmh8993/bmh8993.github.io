---
title: Django / settings 분리하기(프로젝트 구성하기)
date: 2020-04-13 20:04:51
layout: post
draft: false
path: "/python/django/split-setting/"
category: "Django"
tags:
- "DRF"
description: "Django에서 서버 세팅을 분리하는 방법에 대해서 알아봅시다."
---
아래 내용은 `Two Scoops of Django`를 바탕으로 작성된 글입니다.

#### Two Scoops of Django

- 3장 프로젝트 구성
    - 쿠키커터
        - Two Scoops of Django에서는 쿠키커터를 추천한다. 하지만 모든 옵션들을 다 이해할 수 없는
        상태에서 사용하려니 매우 과하게 느껴진다.
        - 구조만 따라하고 추후에 따라 필요한 것들 부가적으로 추가하고자 한다.

- 4장 장고 앱 디자인의 기본
    - 한 번에 한 가지 일을 하고 그 한 가지 일을 매우 충실히 하는 프로그램을 짜는 것

- 5장 settings와 requirements 파일
    - 개발환경, 배포환경, 테스트환경처럼 때에 따라 필요한 설정값과 변경 또는 추가해주어야하는 설정이 존재할 수 있음
    - 때마다 변경, 수정하는 번거로움 또는 누락 가능성으로 파일을 분리할 필요성이 생김
    - 마찬가지로 필요한 package도 다를 수 있기 때문에 requirements도 분리를 해야한다.

이번 포스팅에서는 프로젝트 구성과 함께 settings/requirements를 분리해보자

---

### 세팅하려는 프로젝트 구성

```shell
PROJECT_DIR
├── README.rst
├── config
│   ├── __init__.py
│   ├── settings
│   │   ├── base.py
│   │   ├── local_bmh.py
│   │   ├── production.py
│   │   └── test.py
│   ├── urls.py
│   └── wsgi
│       ├── local.py
│       ├── production.py
│       └── test.py
├── .config_secret
│   ├── base.py
│   ├── local.py
│   ├── production.py
│   └── test.py
├── docs
├── manage.py
├── project_name
├── requirements
│   ├── base.txt
│   ├── local.txt
│   └── production.txt
├── .gitignore
└── setup.cfg
```

---

### 세팅하기 이전에 몇 가지 중요사항들
- 세팅 변화에 대한 기록이 반드시 문서화 되어야하기 때문에 버전 컨트롤 시스템으로 모든 설정 파일을 관리해야한다.
- 반복되는 설정들을 없애야한다. 기본 세팅 파일로부터 상속을 통해 이용해야한다.
- 암호나 비밀키 등은 안전하게 보관해야한다. 보안 관련 사항은 버전관리 시스템에서 제외해야한다.

---

### config: 여러 개의 settings 파일 이용하기

#### settings 디렉터리를 사용하라
```shell
config/
  settings/
    __init__.py
    base.py       # 프로젝트의 모든 인스턴스에 적용되는 공용 세팅 파일
    local.py      # 로컬 환경에서 작업할 때 쓰이는 파일. 디버그 모드, 로그 레벨,
                  # django-debug-toolbar은 도구 활성화 등이 설정되어 있는 개발 전용
                  # 로컬 파일이다. dev.py라고도 한다.
                  # 운영 환경으로 코드가 완전히 이전되기 전에 관리자들이 확인을 위한
                  # 서버에 사용
    production.py # 운영서버에서 실제로 운영되는 세팅 파일. 이 파일에는 운영서버에서만
                  # 필요한 설정들이 들어있다. prod.py라고도 한다.
    test.py       # 테스트 러너(test runner), 인메모리 데이터베이스 정의, 로그세팅등을
                  # 포함한 테스트를 위한 세팅
```
#### 나누어진 setting 파일은 어떻게 실행할까?
```shell
python manage.py runserver --settings=config.settings.local_bmh
```
- shell, makemigrations, migrate과 같은 다른 명령은 runserver 자리에 넣어서 동일하게 실행한다.
- django 공식문서에서는 여러개의 settings를 사용하면 django-admin을 사용하는 것을 권한다.
- `.zshrc`에 다음과 같이 선언하면 매번 길에 입력해야하는 귀찮은 일을 줄일 수 있다.
```shell
DJANGO_SETTINGS_MODULE=config.settings.local_bmh
```

#### 다중 개발 환경 세팅
- 개발자마다 자기만의 환경이 필요한 경우가 있다.
- 이럴 경우 하나의 local.py 세팅을 공유해서 사용하는 것에 어려움이 있을 수 있다.
- 이럴 때는 버전 컨트롤 시스템에서 공유가 가능하며 관리가 가능하도록 `local_developer_name.py`
과 같은 식으로 관리하면 편리하다. 이렇게 하면 잘못된 세팅을 했을 경우 동료 개발자가 체크할 수 있다.

#### wsgi 분리하기
- settings가 분리되면서 wsgi도 나누어야하는데 특별한 설정은 없고 위의 tree처럼 나눈 후 아래와 같이 수정하자
    ```python
    import os

    from django.core.wsgi import get_wsgi_application

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local_bmh")
    # 실행하는 settings을 1번째 인자로 설정하면된다.

    application = get_wsgi_application()
    ```

---

### .config_secret: 코드에서 비밀키 분리하기
세팅파일은 분리했는데 이제 특별하게 설정된 비밀키를 어딘가에 저장해서 사용해야한다.

#### 비밀키 보호를 위한 방법
- 버전 컨트롤 시스템에서 제외한다.
- 각 환경마다 비밀 정보가 다를 수 있다.(ex> DB정보, 사용하는 모듈의 비밀키) 그렇기때문에 공통된 객체로부터 상속받아 각 환경마다
다른 세팅 파일로 나누어 버전 컨트롤 시스템에서 관리하는 것이다.

#### 비밀키를 어딘가에 저장해서 사용해야한다.
- 버전컨트롤 시스템에 추가하면 안된다.
- 코드 수정이 없어야한다.
- 세팅 파일을 버번관리 시스템에 추가할 수 있어야한다. 세팅파일을 포함하여 모든 파이썬 파일은 버전 컨트롤 시스템에서 관리해야한다.
- 두 가지 방법이 있다.

<br>

1. 환경 변수로 관리하기
    - 위키=> 환경변수란 프로세스가 컴퓨터에서 동작하는 방식에 영향을 미치는, 동적인 값들의 모임
    - 시스템의 실행파일이 놓여 있는 디렉토리의 지정 등 OS상에서 동작하는 응용소프트웨어가 참조하기 위한 설정이 기록된다.
    - 환경변수를 세팅하기 위해서 `.bashrc, .bash_profile, .profile, .zshrc` 파일에 추가하면 된다.
    - zsh를 사용하는 나는 `.zshrc`에 다음과 같은 구문을 넣는다.
    ```shell
    export SOME_SECRET_KEY=secret_key
    ```
    - 세팅 파일에서 환경 변수에 접근하는 방법
    ```python
    import os
    SOME_SECRET_KEY = os.environ["SOME_SECRET_KEY"]
    ```
    - 비밀키가 존재하지 않을 때 예외처리하기
        - 비밀키가 존재하지 않으면 `KeyError`를 일으킬 수 있다.
        - 프로젝트가 시작되지 않는 문제보다 더 큰 문제는 그 원인을 알 수 없다는 것이다.
        - 디버그를 위한 에러메세지를 받아야한다.
        - 아래와 같은 함수를 선언하고 함수로 환경변수를 가져온다

      ```python
      import os

      # 일반적으로 장고로부터 직접 무언가를 설정 파일로 임포트해 올 일은 없을 것이며 또한 해서도 안된다.
      # 단 ImproperlyConfigured는 예외다
      from django.core.exceptions import ImproperlyConfigured

      def get_env_variable(var_name):
        """환경 변수를 가져오거나 예외를 반환한다."""
          try:
              return os.environ[var_name]
          except KeyError:
              error_msg = f"Set the {var_name} environment variable"
              raise improperlyConfigured(error_msg)
      ```
2. 비밀파일로 관리하기
    - 환경 변수로 관리하는 방법은 때에 따라 적용되지 않을 수 있다. 책에서는 아파치를 웹 서버로 이용하는 경우라고 이야기하고 있다.
    아파치가 독립적인 환경 변수 시스템을 가지고 있기 때문이다.
    - 이런 경우에는 json 파일에 비밀 정보를 입력하고 참조할 수 있도록 세팅해야한다.
    - `.config_secret` 디렉토리를 만들고 json파일 안에 비밀 키를 넣는다.
    - `.config_secret`은 .gitignore에 추가해야한다.
    - .config_secret/base.json

    ```json
    {
      "SECRET_KEY": {
        "SECRET_KEY": "secret_key"
      }
    }
    ```
    - `BASE_DIR, ROOT_DIR, CONFIG_SECRET_DIR`의 path를 설정해서 json 파일을 읽어오도록 한다.
    - config/settings/base.py

    ```python
    # config/settings/base.py
    import os
    import json


    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ROOT_DIR = os.path.dirname(BASE_DIR)
    CONFIG_SECRET_DIR = os.path.join(ROOT_DIR, ".config_secret")
    CONFIG_SECRET_BASE_FILE = os.path.join(CONFIG_SECRET_DIR, "base.json")
    CONFIG_SECRET_LOCAL_FILE = os.path.join(CONFIG_SECRET_DIR, "local.json")
    CONFIG_SECRET_PRODUCTION_FILE = os.path.join(CONFIG_SECRET_DIR, "production.json")
    CONFIG_SECRET_TEST_FILE = os.path.join(CONFIG_SECRET_DIR, "test.json")

    config_secret_base = json.loads(open(CONFIG_SECRET_BASE_FILE).read())

    # SECRET_KEY
    SECRET_KEY = config_secret_base["SECRET_KEY"]["SECRET_KEY"]

    # APPS
    DJANGO_APPS = [
        'django.contrib.admin',
        "django.contrib.auth",
        "django.contrib.contenttypes",
        "django.contrib.sessions",
        "django.contrib.messages",
        "django.contrib.staticfiles",
    ]

    THIRD_PARTY_APPS = []

    LOCAL_APPS = []

    INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

    ...
    ```

    - local 세팅은 다음과 같다.
    - .config_secret/local.json

    ```json
    {
      "DATABASES": {
        "default": {
          "ENGINE": "django.db.backends.mysql",
          "NAME": "name",
          "USER": "user",
          "PASSWORD": "password",
          "HOST": "127.0.0.1",
          "PORT": "3306",
          "TEST": {
            "CHARSET": "utf8mb4",
            "COLLATION": "utf8mb4_general_ci"
          },
          "OPTIONS": {
            "charset": "utf8mb4"
          }
        }
      },
      "ALLOWED_HOSTS": ["*"]
    }
    ```
    - config/settings/local_bmh.py

    ```python
    import json

    from .base import *


    # GENERAL
    config_secret_local = json.loads(open(CONFIG_SECRET_LOCAL_FILE).read())
    DEBUG = True

    # URLS
    WSGI_APPLICATION = "config.wsgi.local.application"  # olaplan.wsgi.application
    ALLOWED_HOSTS = config_secret_local["ALLOWED_HOSTS"]

    # APPS
    INSTALLED_APPS += ("django_extensions", "drf_yasg")

    # DATABASES
    DATABASES = config_secret_local["DATABASES"]
    ```

---

### docs: 프로젝트 관련 문서 관리하기

---

### project_name: app 관리

---

### requirements: 개발 환경에 따라 필요한 package관리하기
```shell
requirements/
	base.txt
	local.txt
	staging.txt
	production.txt
```

- base.txt에는 공통적인 package를 넣어준다.
    ```
    Django=2.2.1
    djangorestframework=3.1.1
    ...
    ```
- 다른 환경에서 필요한 패키지는 base를 기본으로 추가적으로 입력한다.
- 예시로 local.txt이다.
    ```
    -r base.txt
    django-debug-toolbar==1.3.0
    ...
    ```

---

### setup.cfg

- package관련 세팅을 setup.cfg에 입력하면된다.
- 예를들어 flkae8을 사용하는 나는 아래와 같이 세팅했다.
    ```
    [flkae8]
    max-line-length = 88
    select = C,E,F,W,B,B950
    ignore = E203, E501, W503
    ```
