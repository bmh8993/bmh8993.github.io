---
title: "Flyweight 패턴"
date: "2020-01-03T05:06:35.750Z"
layout: post
draft: false
path: "/design-pattern/flyweight/"
category: "design-pattern"
tags:
  - "Flyweight"
  - "design pattern"
description: "플라이웨이트 패턴은 비용이 큰 자원을 공통으로 사용할 수 있도록 만드는 패턴이다. 1990년에 Paul Calder와 Mark Linton이 WYSIWYG 문서 편집기의 글자모양 정보를 효율적으로 다루기 위해 처음 도입되고 널리 연구되어 졌다."

---

# 플라이웨이트 패턴

> 플라이웨이트 패턴은 비용이 큰 자원을 공통으로 사용할 수 있도록 만드는 패턴이다. 1990년에 Paul Calder와 Mark Linton이 WYSIWYG 문서 편집기의 글자모양 정보를 효율적으로 다루기 위해 처음 도입되고 널리 연구되어 졌다.

자원에 대한 비용은 크게 두가지로 나눠 볼 수 있다.

1. 중복 생성될 가능성이 높은 경우.
    - 중복 생성될 가능성이 높다는 것은 동일한 자원이 자주 사용될 가능성이 매우 높다는 것을 의미한다. 이런 자원은 공통 자원 형태로 관리해 주는 편이 좋다.
2. 자원 생성 비용은 큰데 사용 빈도가 낮은 경우.
    - 이런 자원을 항상 미리 생성해 두는 것은 낭비이다. 따라서 요청이 있을 때에 생성해서 제공해주는 편이 좋다.

---

이 두가지 목적을 위해서 플라이웨이트 패턴은 자원 생성과 제공을 책임진다.

자원의 생성을 담당하는 Factory 역할과 관리 역할을 분리하는 것이 좋을 수 있으나, 일반적으로는 역할의 크기가 그리 크지 않아서 하나의 클래스가 담당하도록 구현한다.

**장점**

- 많은 객체를 만들 때 성능을 향상시킬 수 있다.
- 많은 객체를 만들 때 메모리를 줄일 수 있다.
- State pattern과 쉽게 결합될 수 있다.

**단점**

- 특정 인스턴스의 공유 컴포넌트를 다르게 행동하게 하는 것이 불가능 하다.
- (개별 설정이 불가능 하다.)

## 예제 - Tree

Tree 클래스로 만들어지는 객체는 mesh, bark, leaves 등 객체를 직접 만들지 않고 미리 만들어진 TreeModel을 사용한다.

static 변수로 선언된 객체를 하나 만들어 모든 Tree 객체의 내부에서 사용되는 TreeModel 에서 공유한다.

- 각각의 Tree 클래스에 직접 만드는 예시

        public class TreeFactory {
            private static final TreeModel sharedTreeModel = new TreeModel();
        
            static public Tree create(Position position, double height, double thickness) {
                Tree tree = new Tree();
                tree.setPosition(position);
                tree.setHeight(height);
                tree.setThickness(thickness);
                tree.setTreeModel(sharedTreeModel);
                
                return tree;
            }
        }

        public class Tree {
            Mesh mesh;
            Texture bark;
            Texture leaves;
            Position position;
            double height;
            double thickness;
            Color barkTint;
            Color leafTint;
        }

- Flyweight pattern 을 이용하여 공유할 객체를 분리 된 코드

        public class Tree {
            TreeModel treeModel;
            Position position;
            double height;
            double thickness;
        }
        
        // 공유할 객체를 감쌀 나무모델 클래스를 정의
        public class TreeModel {
            Mesh mesh;
            Texture bark;
            Texture leaves;
        
            public TreeModel() {
                this.mesh = new Mesh();
                this.bark = new Texture("bark");
                this.leaves = new Texture("leaves");
            }
        }

## Flyweight pattern 사용 예

- 고전적인 사용 예
    - 워드 프로세서에서 문자들의 그래픽적 표현에 대한 자료구조
    - 문서에 입력된 모든 글자들에 대해서 글자(폰트) 정보를 가지고 있다면 메모리 낭비가 일어난다.
- JDK 예
    - java.lang.String
    - java.lang.Integer.valueOf(int)
    - java.lang.###.valueOf( ) 형식

### java.lang.String의 예시

str1 과 str2는 각자 새로운 객체를 생성 하였기 때문에 서로 다른 객체 이지만 str3 과 str4는 같은 객체이다.(참조 되는 메모리가 같다. 중복 생성을 방지한다.)

    public class TestPattern {
        public static void main(String[] args) {
            String str1 = new String("홍길동");
            String str2 = new String("홍길동");
            String str3 = "홍길동";
            String str4 = "홍길동";
    
            System.out.println("Flyweight Pattern");
        }
    }

### 얕은 복사도 일종의 Flyweight 패턴이 적용되어 있다.

    public class TestPattern {
        public static void main(String[] args) {
            MyData md1 = new MyData();
            md1.xpos = 10;
            md1.ypos = 11;
            md1.name = "홍길동";
    
            MyData md2 = new MyData();
            md2 = md1;
    
            MyData md3 = new MyData();
            md3.xpos = 20;
            md3.ypos = 21;
            md3.name = "손오공";
    
            md2.name = "전우지";
            md2.xpos = 5;
        }
    }
    
    class MyData {
        int xpos;
        int ypos;
        String name;
    }

### Flyweight 패턴 구현하기

    public class Subject {
        private String name;
    
        public Subject(String name) {
            this.name = name;
        }
    }

    import java.util.HashMap;
    import java.util.Map;
    
    public class FlyweightFactory {
        private static Map<String, Subject> map = new HashMap<>();
    
        public Subject getSubject(String key) {
            Subject subject = map.get(key);
            if (subject == null) {
                subject = new Subject(key);
                map.put(key, subject);
    
                System.out.println("새로 생성" + key);
            } else {
                System.out.println("재사용" + key);
            }
    
            return subject;
        }
    }

### Test code 사용 예시

    public class TestPattern {
        public static void main(String[] args) {
            FlyweightFactory flyweightFactory = new FlyweightFactory();
            flyweightFactory.getSubject("a");
            flyweightFactory.getSubject("a");
            flyweightFactory.getSubject("b");
            flyweightFactory.getSubject("b");
        }
    }