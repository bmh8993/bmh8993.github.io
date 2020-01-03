---
title: "DI (Dependency Injection)"
date: "2020-01-01T05:06:35.750Z"
layout: post
draft: false
path: "/design-pattern/di/"
category: "design-pattern"
tags:
  - "DI"
  - "design pattern"
description: "객체 읜존성과 객체지향에서의 결합 관계에 대해 간략하게 정리한 내용"

---

# 객체를 사용하는 두가지 방법

1. A객체가 B/C 객체를 직접 생성한다.

        public class A {
        	private B b = new B();
        	private C c = new C();
        }

    a는 갑 b,c는 을

    a가 b,c를 사용하기도 하지만 b,c에 의존 하기도 한다.

    객체 간의 의존 관계에서 직접 생성 하면 생성 부터 메모리 관리를 위한 소멸까지 해당 객체의 라이프 사이클을 개발자가 직접 관리 해주어야 됨으로 객체 간 강한 결합이다

2. B/C 객체가 외부에 생성되어 A객체에 주입된다.

        public class A {
         	private B b;
        	private C c;
        
        	public A (B b, C c) {
        		this.b = b;
        		this.c = c;
        	}
        //or
        	public void setb(B b){
        		this.b = b;
        	}
        
        	public void setC(C c){
        		this.c = c;
        	}
        }

    a가 을 bc를 가지고, 있는 곳이 갑

    a가  b,c기능이 필요하면 갑이 a에게 bc의 기능을 주입 시켜주는 구조이다.

    이미 누군가가  생성한 객체를 주입 받아 사용만 하면 됨으로 약한 결합이다.

    객체 지향에서 약한 결합, 느슨한 결합을 사용하면 개발자가 관리 할 것이 작아진다는 장점이 있다.

        package di;
        
        import java.util.Date;
        
        public class UnderstandDI {
            public static void main(String[] args) {
                Date date = new Date();
                System.out.println(date);
            }
        
            public static void getDate(Date d) {
                Date date = d;
                System.out.println(date);
            }
        
            public static void memberUser1() {
        //        강한 결합 : 직접 생성
                Member m1 = new Member();
        //        억지스럽지만 Member 클래스의 생성자 메서드를 private 으로 변경하면 문제가 생긴다
        //        이와 반대로 약한 겷합은 안전하고 유연하게 대체 가능하다
            }
        
            public static void memberUser2(Member m) {
        //        약한 결합 : 생성된 것을 주입 받음 - 의존 주입 (Dependency Injection)
                Member m2 = m;
            }
        }
        
        //    Member를 사용한다.-->Member의 기능에 의존한다 라는 의미
        class Member {
            String name;
            String nickname;
        
            public Member() {
        
            }
        //    private Member() {
        //    }
        }