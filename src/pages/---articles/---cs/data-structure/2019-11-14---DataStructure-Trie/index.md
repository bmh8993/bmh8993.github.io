---
title: "Trie 트라이"
date: "2019-11-14T05:06:35.750Z"
layout: post
draft: false
path: "/cs/datastructure/"
category: "datastructure"
tags:
  - "문자열 탐색"
description: "코딩 테스트 연습을 하면서 알게 된 Trie (트라이) 라는 자료 구조에 대헤 정리 한다."

---

# Trie 구조 (문자열 검색)

Tags: tree, trie, 문자열

![Trie/Untitled.png](Trie/Untitled.png)

## TMI

[코딩테스트 연습 - 가사 검색 | 프로그래머스](https://programmers.co.kr/learn/courses/30/lessons/60060)

오늘도 여김 없이 TMI부터 시작한다. 코딩 테스트 연습을 하면서 알게 된 Trie (트라이) 라는 자료 구조에 대헤 정리 한다. 

## Trie-트라이

> 문자열을 효율적으로 탐색하기 위한 자료 구조로 n 진 Tree(트리)형태로 구성되어 있다.

트라이?? 발음은 Try 랑 같다. 잘 모르겠지만 일단 Try 해보자!!

우리가 여러 개의 문자열을 가지고 있을 때, 어떤 문자열이 그 문자열 중 하나인지 알아내는 방법은 뭐가 있을까?단순하게 일일이 비교해보면 된다. 하지만 컴퓨터는 이러한 방법이 매우 비효율적이다. 예를 들어, 최대 길이가

m인 문자열 *n*개의 집합에서 마찬가지로 최대 길이가*m*인 임의의 문자열이 그 문자열들의 집합에 포함되는지를 일일이 확인하면 사전처리는 필요 없지만, 최악의 경우O(nm)의 비교 횟수가 필요하다.

이 문자열을 정렬시킨 뒤, [이진 탐색](https://namu.wiki/w/%EC%9D%B4%EC%A7%84%20%ED%83%90%EC%83%89) 이라는 강력한 알고리즘을 사용하면O(m log n)로 단축시킬 수 있지만, 정렬 과정 자체에 O(n m log n)의 시간이 걸리므로 사양이 안 좋은 컴퓨터라면 이것도 비효율적이다. 하지만 위의 시간 복잡도를 압도하는 알고리즘이 존재한다. 프레드킨이 이름 붙인 "Trie"라는 자료구조가 지금부터 설명할 가장 효율적인 문자열 검색법이다.

## 구현 코드

    public class TrieNode {
        private final Map<Character, TrieNode> children = new HashMap<>();
        private boolean endOfWord;
        private int count;
    
        Map<Character, TrieNode> getChildren() {
            return children;
        }
    
        boolean isEndOfWord() {
            return endOfWord;
        }
    
        void setEndOfWord(boolean endOfWord) {
            this.endOfWord = endOfWord;
        }
    
        public int getCount() {
            return count;
        }
    
        void increaseCount() {
            this.count++;
        }
    }

    public class Trie {
        private TrieNode root;
    
        public Trie() {
            root = new TrieNode();
        }
    
        public void insert(String word)1
            TrieNode current = root;
    
            current.increaseCount();
            current = current.getChildren()
                    .computeIfAbsent((char) (word.length() + '0'), c -> new TrieNode());
    
            for (char trieWord : word.toCharArray()) {
                current.increaseCount();
                current = current.getChildren()
                        .computeIfAbsent(trieWord, c -> new TrieNode());
            }
    
            current.setEndOfWord(true);
        }
    
        public int countOfSearched(String word, int index) {
            TrieNode current = root;
    
            TrieNode wordLengthNode = current.getChildren().get((char) (word.length() + '0'));
            if (wordLengthNode == null) {
                return 0;
            }
            current = wordLengthNode;
    
            for (int i = 0; i < index; i++) {
                char ch = word.charAt(i);
                TrieNode node = current.getChildren().get(ch);
                if (node == null) {
                    return 0;
                }
                current = node;
            }
            return current.getCount();
        }
    }

## update 예정...