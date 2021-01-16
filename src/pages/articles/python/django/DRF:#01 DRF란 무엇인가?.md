---
title: DRF/#01 DRF란 무엇인가?
date: 2020-03-18 13:03:95
layout: post
draft: false
path: "/python/django/drf-01/"
category: "Django"
tags:
- "DRF"
description: "DRF에 대해서 간략하게 알아봅시다."
---
DRF에 대해서 간략하게 알아봅시다.


### DRF?

공식문서에서 설명하는 DRF입니다.
> DRF는 Web API를 만들기 위한 강력하고 유연한 툴입니다.<br>
우리가 DRF를 써야하는 이유가 몇 가지 있습니다.
> - Web browsable API는 개발자들에게 큰 유용성을 가져다줍니다.
> - Serialization은 ORM과 non-ORM 데이터 소스를 모두 지원합니다.
> - 강력한 View도 있지만 일반적인 View를 커스터마이징 해서 사용할 수 있습니다.
> - DRF를 사용하는 많은 유저들이 있기때문에, 문서와 커뮤니티를 제공할 수 있습니다.
> - 국제적인 기업들에서 사용하고 있습니다.

<br>

다른 이는 이렇게 말하기도 합니다.
> DRF는 개발자가 만든 API들을 디버그하기 쉽게 만들어줍니다. DRF의 큰 기능은 **Models를 serializers로 변환하는 것**입니다. DRF에서 serializers는 복잡한 구조들을 이미 구성해두었습니다.
> serializers는 모델을 전달하고, 그 모델들을 json 객체로 변환하는 것만이 전부가 아닙니다. 클라이언트로부터 백엔드에게 데이터를 전달하기도합니다. 코드를 검증하는 것도 자동으로 할 수 있습니다. 코드를 정리해서 security issues를 해결하기도 합니다.

<br>

많은 사람들이 설명하는 DRF는 무엇일까요?
> Django 안에서 RESTful API 서버를 쉽게 구축할 수 있도록 도와주는 오픈소스 라이브러리입니다.

### Serializer

[직렬화(serialisation)는 무엇인가]()

직렬화에 대한 설명은 위의 글을 읽어보길 바랍니다.<br>
<br>
파이썬 형식의 코드를 다른 네트워크 환경과 통신을 위해 코드를 직렬화 해야하는데,
DRF에서 그것을 담당하는 클래스가 바로 `Serializer`입니다. DRF에서 제공하는 Serializer는
queryset, model instance 등의 복잡한 데이터를 JSON, XML 등의 컨텐트 타입으로 쉽게 변환 가능한
python datatype으로 변환시켜줍니다.<br>

**RESTful API와 Serializer가 DRF를 사용하는 가장 큰 장점이 아닐까 생각합니다.**
