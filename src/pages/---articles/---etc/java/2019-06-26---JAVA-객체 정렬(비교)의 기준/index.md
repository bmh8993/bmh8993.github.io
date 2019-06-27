---
title: "JAVA-객체 정렬(비교)의 기준?Comparable, Comparator"
date: "2019-06-26T05:06:35.750Z"
layout: post
draft: false
path: "/etc/comparable-comparator/"
category: "java"
tags:
  - "Comparable"
  - "Comparator"
  - "Normal Flow"
  - "unTIL the end"
description: "[unTIL the end] Java 객체를 정렬 하기위한 인터페이스 Comparable, Comparator 정리"

---

## TMI

[코딩테스트와 실무 역량 모두 잡는 알고리즘 스터디(Java) 2기 | 프로그래머스](https://programmers.co.kr/learn/courses/10004)

시작부터 TMI 가 시작된다. 프로그래머스에서 진행하는 코딩테스트-JAVA 를 온라인 스터디 진행하면서 배운 내용을 정리 한다. 

[알고리즘 연습 - 모의고사 | 프로그래머스](https://programmers.co.kr/learn/courses/30/lessons/42840)

내가 풀었던 문제 중 모의 고사 문제를 풀면서 객체를 Sort 하거나 MAX 값을 얻기 위해 Comparable, Comparator를 사용하게 되었다.

## 객체 **기준!!**

![](Untitled-6e740739-1d83-497d-8be2-d0f841e5b809.png)

- 객체의 정렬 기준 예시) Student
    - Student.name 오름차순으로 정렬!!
    - Student.age 내림차순으로 정렬!!
        - age가 같으면 name 내림차순으로 정렬!!

## 객체의 정렬의 기준을 정하는 두가지 인터페이스

1. Comparable : 클래스 객체에 정렬 기준을 부과 할 때 사용하는 인터페이스
2. Comparator: 클래스 객체, 컬렉션의 정렬 기준을 부과 해주기 위한 기능적 인터페이스
    - Comparable 로 객체가 가지고 있는 정렬 기준이 아닌 새로운 기준을 부과 할때 사용
        - 객체에 Comparable가 없어도 사용 가능(sort() 에서 정렬 기준을 명시할때)
    - ex) sort(list, CustomSort)
        - class CustomSort implements Comparator<CustomSort>

---

## 1. Comparable - 클래스 객체가 정렬 기준을 가지고 있자!

> class.sort() 를 사용 할 때 인자를 지정 해주지 않아도 사용이 가능 한 이유는 해당 클래스 객체는 Comparable 인터페이스를 구현 하고 있기 때문이다.

- 구현 예시
    - sor(), max(), min() 등 정렬을 사용할 클래스 객체에 Comparable 인터페이스 구현 → compareTo() 를 오버라이드 한다.


        class Student implements Comparable<Student> {
            private int id;
            private int score = 0;
            private int[] answerPatternArray;
        
            @Override
            public int compareTo(Student student) {
                return this.getScore() - student.getScore();
            }
        }

- compareTo() 메서드
    - Collections, Arrays에서 sort(), max(), min() 을 사용 할 때 compareTo() 메서드 사용
    - 구현 방법
        - this > 파라미터
        - this < 파라미터
        - this == 파라미터
        - this - 파라미터
        - 파라미터 - this
    - 정렬 기준:
        1. 양수 리턴: 오름차순
        2. 음수 리턴: 내림차순
        3. 0 리턴: 변동없음
- 사용 예시

        public Student maxScoreStudent(List<Student> studentList) {
            return Collections.max(studentList);
        }

        public List<Student> sort(List<Student> studentList){
            studentList.stream().sorted();
        		return studentList;
        }

> Comparable 인터페이스가 없는 클래스 객체라면 Collections, Arrays에서 sort(), max(), min() 을 사용 할 때, 인자를 생략 할 수 없다!!

- 왜?? 정렬 기준이 없으니까? 그럼 정렬 기준을 주입 해주면 되지 않을까?

## 2. Comparator - 정렬 기준을 알려줄게! 이 기준으로 정렬!!

![](Untitled-6e740739-1d83-497d-8be2-d0f841e5b809.png)

> 클래스 객체의 지정된 정렬 기준을 따르고 싶지 않아 새로운 기준으로 정렬 하고 싶을 때 사용, 혹은 클래스 객체의 지정된 정렬 기준이 없을 때 사용

- 구현 예시
    1. Comparator 인터페이스를 구현하여 정렬 기준 클래스 사용

            class CustomSort implements Comparator<Student> {
            
                @Override
                public int compare(Student o1, Student o2) {
                    if (o1.getScore() > o2.getScore()) {
                        return 1;
                    } else if (o1.getScore() == o2.getScore()) {
                        if (o1.getId() < o2.getId()) {
                            return 1;
                        }
                    }
                    return -1;
                }
            }
            
            //사용
            public Student maxScoreStudentUsingComparator(List<Student> studentList) {
                return studentList.stream().max(new CustomSort()).orElse(null);
            }

    2. Comparator 인터페이스를 이용한 익명 클래스 사용

            public Student maxScoreStudentUsingAnonymousComparatorClass(List<Student> studentList) {
                return studentList.stream().max(new Comparator<Student>() {
            
                    @Override
                    public int compare(Student o1, Student o2) {
                        if (o1.getScore() > o2.getScore()) {
                            return 1;
                        } else if (o1.getScore() == o2.getScore()) {
                            if (o1.getId() < o2.getId()) {
                                return 1;
                            }
                        }
                        return -1;
                    }
                }).orElse(null);
            }

    3. 람다(Lamda) 를 이용하여 Comparator 인터페이스 구현

            public Student maxScoreStudentUsingLamda(List<Student> studentList) {
                return studentList.stream().max((prevStudent, curentStudent) -> prevStudent.getScore() - curentStudent.getScore()).orElse(null);
            }

- compare() 메서드
    - Collections, Arrays에서 sort(), max(), min() 을 사용 할 때 compare() 메서드 사용
    - 구현 방법
        - 파라미터1 > 파라미터2
        - 파라미터1 < 파라미터2
        - 파라미터1 == 파라미터2
        - 파라미터1 - 파라미터2
        - 파라미터2 - 파라미터1
    - 정렬 기준:
        1. 양수 리턴: 오름차순
        2. 음수 리턴: 내림차순
        3. 0 리턴: 변동없음

> 개인적으로 Comparator는 람다(Lamda) 방식으로 사용하는 것이 좋은것 같다.

---

## PS - 소감쓰..

정리하지 않고 사용할 땐, 모르고 사용 했었던 것 같다.

최근에 javascript 를 공부하고 자주 사용했었는데, 다시 Java 공부 하면서 Java 의 sort 사용과 Javascript의 sort 사용법이 비슷했던 것 같다. 그래서 더 잘 와 닿는 느낌을 받았다.

정리 할 내용들이 많은데, 정리 하는 시간이 생각 보다 길었다.

---

참고 사이트

[자바 정렬 Java Comparable Comparator 확실히 알고 넘어가기](https://cwondev.tistory.com/15)

[[Java] Comparable와 Comparator의 차이와 사용법 - Heee's Development Blog](https://gmlwjd9405.github.io/2018/09/06/java-comparable-and-comparator.html)