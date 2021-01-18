---
title: Django / 미디어 파일(Media Files)을 위한 Django 세팅 + ImageField 다루기
date: 2020-05-07 13:05:80
layout: post
draft: false
path: "/python/django/handle-media/"
category: "Django"
tags:
- "django"
description: "Django에서 미디어 파일을 다루는 방법에 대해서 알아봅시다."
---
#### static and media

Django에서는 static과 media files를 다음과 같이 분류한다.
- Static Files: `개발 리소스`로서의 정적인 파일(js, css etc)
- Media Files: 이미지파일이나 유저가 업로드한 파일(image, pdf etc)

---

## settings.py 세팅

#### Media Files 전달 및 저장(settings.py)

1. view: `HttpRequest.FILES`를 통해 파일 전달
2. view: `settings.MEDIA_ROOT` 디렉토리 하단에 파일 저장

```python
# root/project/settings.py

# 각 media 파일에 대한 URL Prefix
MEDIA_URL = '/media/'
# 미디어 파일을 보면 이미지 url이 다음과 같이 나온다
# http://127.0.0.1:8000/media/Screen_Shot_2020-04-29_at_17.19.25.png

# 업로드된 파일을 저장할 디렉토리 경로
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

#### 새롭게 세팅한 프로젝트 구조에서 `MEDIA_ROOT` 세팅하기

```shell
project__root_dir
├── README.rst
├── .gitignore
├── config
│   ├── __init__.py
│   ├── settings
│   │   ├── base.py
│   │   ├── local.py
│   │   ├── production.py
│   │   └── test.py
│   ├── urls.py
│   └── wsgi
│       ├── local.py
│       ├── production.py
│       └── test.py
├── docs
├── manage.py
├── project_name
│   └── static
│       └── image
├── requirements
│   ├── base.txt
│   ├── local.txt
│   └── production.txt
├── .config_secret
│   ├── base.txt
│   ├── local.txt
│   └── production.txt
├── setup.cfg
└── tags
```

- 위와 같은 프로젝트 구조를 가지고 있다면 settings에 다음과 같이 추가해야한다.
- 아래와 같이 추가하면 `MEDIA_ROOT`는 `project_name/static/image`가 된다.

```python
# config/settigns/base.py

ROOT_DIR = os.path.dirname(BASE_DIR)
...
MEDIA_ROOT = os.path.join(ROOT_DIR, "project__root_dir", "project__root_dir", "static", "image")
```

---

## ImageField(models.py)

- ImageField: 이미지 저장을 지원하는 모델 필드(FileField 상속)

```python
# example_app/models.py

from django.db import models
from users.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = modlels.CharField(max_length=240, blank=True)
    city = models.CharField(max_length=30, blank=True)
    avatar = models.ImageField(blank=True, upload=to="profile/avatar")

    def __str__(self):
        return self.user.username
```

#### 파일저장 세부경로

ImageField에 `upload_to=경로`와 같이 설정하면
  - 저장경로
      - `settings.MEDIA_ROOT/파일명`경로에 저장
      - `MEDIA_ROOT/profile/avtar/xxxx.jpg` 경로에 저장
  - DB
      - 파일명이 string으로 저장(추가적으로 string으로 저장되기 때문에 null=True가 아닌 blank=True)
      - `MEDIA_ROOT/profile/avtar/xxxx.jpg` 문자열 저장

#### Pillow

- PIL(Python Image Library)의 일종, 파이썬으로 이미지를 처리하고 싶을 때 사용
- Pillow는 PIL 프로젝트에서 fork 되어서 나온 라이브러리로, PIL이 python3를 지원하지
않기 때문에 Pillow를 사용하는 추세
- 이미지 관련 width, height, format, resize 작업을 수행

```python
$ pip install pillow
```

---

## 개발환경에서의 media 파일 서빙(urls.py)

지금까지의 세팅을 마치면 디렉토리에 저장하고, DB에 경로를 저장하는 작업은 가능하다.
하지만 서빙은 불가능하다. 즉, 데이터를 받아올 수가 없다. 더 쉽게는 이미지파일을 받아올 수
없다는 것이다.

- 여기서 서빙이란 server로부터 데이터를 받아오는 것을 `serving`이라고 한다.

장고는 개발 서버에서 서빙을 지원해주지 않는다. 즉, `DEBUG=True`일 때의 서빙 rule을
추가해줘야한다. `DEBUG=False`일 때에는 빈 리스트 리턴한다.

```python
# config/urls.py

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```
