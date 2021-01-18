---
title: Postgresql DB backup / restore(+스케줄 작업)
date: 2020-09-08 10:09:81
layout: post
draft: false
path: "/cs/db-sql/postgresql-backup-restore/"
category: "DB&SQL"
tags:
- "postgresql"
description: "postgresql에서 backup과 restore 작업을 하는 방법에 대해서 알아봅시다."
---

서버 배포 이후 매일 DB backup 파일일 만들어야 한다. CLI로 어떻게 진행이 가능한지 남기려한다.

# Backup

PostgreSQL에서는 DB Backup을 위해 pg\_dump와 pg\_dumpall 프로그램을 제공한다.

1. dg\_dump는 단일 Database를 요청한 Format으로 Bakup을 만든다.
2. pg\_dumpall는 전체 Database Cluster를 SQL script로 Backup 한다.

해당 글에서는 pg\_dump에 관해서만 다룰 예정이다. pg\_dump의 사용 방법은 서버에서 `db_dump --help`를 입력하면 옵션에 대해 자세히 확인 가능하다.

아래 옵션 및 인자들이 자주 사용하는 것들이다.
```
-d, --dbname : Backup할 Database 명.
-h, --host : Database 주소.
-U, --username : Database 접속 시 User ID
-F, --format : Backup Format. 필자는 주로 tar 파일로 backup하기 때문에 't'를 사용한다.
-f, --file : Backup File Name
-t, --table : 특정 Table만 Backup하려할 때 대상이 되는 Table 명
-j, --jobs : Backup 시 병렬 처리 여부와 그 정도.
-v, --verbose : 진행 과정 표시.
```

### 사용 예

- `holaplan` DB를 `tar` 형식으로
- `/root/project/db_backup` 아래에
- `특정이름`으로 backup

```shell
$ pg_dump -d {DB_이름} -h {DB_주소} -U {DB_유저} -F t > {위치와 이름}
$ pg_dump -d holaplan -h xx.xx.xxx.xxx -U postgres -F t > /root/project/db_backup/test.tar
```

이렇게 하면 패스워드를 요구한다. 그래서 그냥 패스워드도 커맨드에 넣어버려야지 생각하고 옵션을 사용했으나 너무 많은 옵션이 사용되었다는 메세지를
받았다.<br>
그래서 찾아본 것이 `.pgpass`<br>

### pgpass

pg\_hba.conf에서 DB에 접근을 제한하도록 설정하면(접근할 때 패스워드를 요구하는 방식으로) postgres를 command line으로 로그인을 하려면 다음과
같은 명령어를 사용해야한다.

```shell
$ psql -U {유저} -d {접근하려는 DB}
$ psql -U postgres -d postgres
```

그리고 패스워드를 물어보면 패스워드를 입력하고 접근이 가능하다. 그러나 shell script를 사용하게 되면 위와 같은 문제를 비롯한 귀찮은 일들이
발생한다. 이럴때 자동으로 로그인이 가능하도록 하는 것이 `.pgpass` 이다.

#### 생성

생성하는 위치는 root 디렉토리이다.

```shell
$ touch ~/.pgpass
```
안에 들어가는 내용은 다음과 같다.

```shell
hostname:port:database_name:user_name:password
*:*:*:user_name:password
```

앞의 세가지는 \*(와일드카드)를 사용하여 입력할 수 있다. 하지만 주의 할 부분이 있는데 db\_name에 \*를 사용하면 서버와 연결된 모든 DB를 대상으로
하게 된다.<br>
그래서 나는 db\_name은 특정 db를 지정하도록한다.

모두 작성하면 권한설정을 해준다.

```shell
chmod 600 ~/.pgpass
```

소유자에게 읽기와 쓰기권한을 부여하고 그룹소유자와 일반 사용자에게는 어떠한 권한도 부여하지 않겠다는 의미이다.

# cronjob setting

cronjob 리스트를 확인하고 `크론잡으로 등록`해주면된다.<br>

```shell
$ crontab -e  # 해당 옵션으로 등록된 크론탭리스트를 수정할 수 있다.
```
해당 파일에 크론을 등록해주도록 한다.

기타 여러가지 방법이 있기다 pg\_cron 이라는 extension도 존재한다. 하지만 하려는 작업에 적합하지 않은 것 같아서
어느정도 읽어보고 넘어갔다.

# Restore

pg\_restore는 pg\_dump를 이용해서 만들어진 DB backup file을 restore 할 때 사용한다.<br>
단, pg\_dumpall로 만들어진 backup file은 sql script라 pg\_store를 사용할 수는 없다.<br>
<br>
pg\_restore의 사용 방법은 서버에서 `db_restore --help`를 입력하면 옵션에 대해 자세히 확인 가능하다.

아래 옵션 및 인자들이 자주 사용하는 것들이다.
```
-d, --dbname : Restore하는 Database 명.
-h, --host : Database 주소.
-U, --username : Database 접속 시 User ID
-F, --format : Restore File의 Format.
-t, --table : 특정 Table만 Restore하려할 때 대상이 되는 Table 명
-j, --jobs : Restore 시 병렬 처리 여부와 그 정도.
-v, --verbose : 진행 과정 표시
-C, --create : Target DB를 새로 만들면서 Restoration 진행.
-c, --clean : Restoration 시에 같은 이름의 Database Object가 발견되면 Drop 후에 Create하게 함.
-O, --no-owner : 원본 DB의 Owner가 복구할 위치에 존재하지 않을 경우 복구 시 다량의 에러가 발생한다. 이를 막기 위해  DB 복구시 OWNER를 명시하지 않고 진행하게 함.
```

#### TAG

`postgres`, `cronjob`, `linux-permission`, `pgpass`, `pg_hba`

---

REF: [PostgreSQL DB Backup 및 Restore](https://browndwarf.tistory.com/12)<br>
REF: [An Overview of Job Scheduling Tools for PostgreSQL(cronjob 설정하기)](https://severalnines.com/database-blog/overview-job-scheduling-tools-postgresql)<br>
REF: [PostgreSQL Job Scheduler](https://sqlbackupandftp.com/blog/postgresql-job-scheduler)<br>
REF: [리눅스 퍼미션 chmod 600](https://securityspecialist.tistory.com/40)<br>
REF: [pgpass stack-overflow](https://stackoverflow.com/questions/50404041/pg-dumpall-without-prompting-password)<br>
REF: [how to use cron](https://www.cyberciti.biz/faq/how-do-i-add-jobs-to-cron-under-linux-or-unix-oses/)

---

#### 추가 사항

### 리눅스 tar.gz

리눅스(Linux)에서의 파일 압축 개념은 윈도우즈(Windows)에서의 파일 압축 개념에 비해 세분화 되어있다.
윈도우즈에서는 보통 압축을 한다하면, zip 등의 방식으로 선택된 파일이나 폴더들을 묶으면서 동시에 압축(compress)을 하는 것을 의미한다.
`반면` 리눅스에서는 파일이나 폴더들을 묶는 것(archive)과 실제로 압축(compress)하는 기능이 나뉘어져있다.

- 묶는다 = archive
- 압축한다 = compress

리눅스에서 여러 파일을 한 파일로 묶은 것을 아카이브(archive)라 하며 확장자는 `.tar` 이다.<br>
일반적으로 tar로 묶인 아카이브를 gunzip을 사용해서 .tar.gz 의 확장자를 가지는 압축 아카이브로 많이 사용한다.

REF: [리눅스 tar.gz와 압축/해제 명령어](http://sarghis.com/blog/468/)<br>
REF: [왜 단일 파일을 tar합니까?](https://qastack.kr/unix/277793/why-would-i-tar-a-single-file)
