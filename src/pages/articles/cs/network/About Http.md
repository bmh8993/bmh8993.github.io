---
title: About Http
date: 2019-08-20 20:27:37
layout: post
draft: false
path: "/cs/network/about-http/"
category: "network"
tags:
- "http"
description: "HTTP에 대해서 알아봅시다."
---

##HTTP
HyperText Transfer Protocol
- 하이퍼텍스트(HTML) 문서를 교환하기 위해 만들어진 protocol(통신 규약).
- 즉, HTML 문서를 주고 받을 때 원활한 소통을 위한 약속이다.
    - 즉 웹상에서 네트워크로 서버끼리 통신을 할때 어떠한 형식으로 서로 통신을 하자고 규정해 놓은 "통신 형식" 혹은 "통신 구조" 라고 보면 된다.
    - 프론트앤드 서버와 클라이언트간의 통신에 사용된다.
    - 또한 백앤드와 프론트앤드 서버간에의 통신에도 사용된다.

- HTTP는 TCP/IP 기반으로 되어있다.


#HTTP 핵심요소

##1. 통신 방식
    - 기본적으로 request/respose 구조로 이루어져 있다.
        - 클라이언트와 서버의 모든 통신이 요청과 응답으로 이루어 진다.
    - HTTP는 Stateless 이다.
        - 말그대로 상태를 저장하지 않는다.
        - 예를 들어, 클라이언트가 요청을 보내고 응답을 받은 후, 조금 있다가 다시 요청을 보낼 때, 전에 보낸 요청/응답에 대해 알지 못한다.
        - 그래서 만일 여러 요청과 응답의 진행 과정이나 데이터가 필요할 때는 쿠키나 세션 등등을 사용하게 된다.

##2. HTTP request 구조

```
1. 메쏘드 URI HTTPversion
2. Request Headers
3.
4.body
```
위와 같이 구조인데,<br>
**첫째줄은 Start Line**<br>
해당 request가 의도한 action/해당 request가 전송되는 목표 uri/사용되는 HTTP 버젼<br>
**둘째줄은 headers**<br>
해당 request에 대한 추가 정보를 담는부분이다.<br>
Key:Value값으로 되어져 있다.<br>
HOST: google.com => key = HOST, value = google.com<br>
**셋째줄은 headers와 body를 구분**<br>
**넷째줄은 body**<br>
해당 request의 실제 메세지/내용
```
1.GET /index.html HTTP/1.1
2.Host: bmh.kr
3.Connection: keep-alive
4.
5.name=min&age=27
```
위의 request를 읽어보면,<br>
`HTTP/1.1 버전`의 프로토콜로 `GET방식`으로 호스트가 `min.kr`인 곳의 /`index.html`을 가져와라.<br>
가져오는데 `연결(connection)`은 `지속적(keep-alive)`인 방식으로 하며 `name`과 `age`라는 파라미터를 만들어서 각각 `min`과 27을 값으로 담아 같이 보내자.<br>

**자주 사용되는 header 정보**<br>
![headers_info](./img/headers_info.png)

**Request Action**
![request_method](./img/http_request_method.png)

##3. HTTP request 구조
```
1. HTTP 버전 상태코드 설명
2. Response Headers
3.
4.body
```
위와 같이 구조인데,<br>
**첫째줄은 Status Line**<br>
해당 response의 상태를 나타내주는데,<br>
HHTP 버전/status code/status text<br>
**둘째줄은 headers**<br>
request의 header와 동일하다.<br>
다만, response에서만 사용되는 header값들이 있다.<br>
예를들어, `User-Agent`대신에 `Server`헤더가 사용된다.<br>
**셋째줄은 headers와 body를 구분**<br>
**넷째줄은 body**<br>
request의 header와 동일하다.<br>
request와 마찬가지로 모든 response가 body를 가지고 있지는 않다. 데이터를 전송할 필요가 없을 경우에는 body가 비어있게 된다.
```
1. HTTP/1.1 200 OK
2. Date: Tue, 10 Jul 2012 06:50:15 GMT
3. Content-Length:362
4. Content-type:text/html
5.
6. <html>
7. ...
```
위의 response를 읽어보면,<br>
`HTTP/1.1 버전`의 프로토콜로 request에 대한 처리 결과는`200`이다. 다시말해 `OK`이다.<br>
내가 전달할 메시지는 `2012년 7월 10일 화요일 6분 50분 15초`에 만들어 졌으며,<br>
내용의 길이는 `362`이고 내용은 `text/html`타입이다.보낼 내용은 `<html>`...이다.
<br>
**자주 쓰이는 HTTP Status Code**<br>
![http_status_code](./img/http_status_code.png)
#그래서 왜 배우는데???
##HTTP 메세지
HHTP 메세지는 서버와 클라이언트 간에 데이터가 교환되는 방식이다.<br>
**교환되는 방식이면서, 정보가 담겨있다. 우리는 이 정보를 처리해야하므로 HTTP가 중요하다.**<br>
장고를 하면서 HTTP를 아는 것이 왜 중요한지 알게되었다.<br>
공부할 것이 많다! REST API도 알아야한다!!!!!<br>
이건 다음시간에
