---
title: "ES6 Basic 3"
date: "2019-04-25T05:45:35.750Z"
layout: post
draft: false
path: "/etc/ES6 Basic 3/"
category: "js"
tags:
- "Iterator"
- "Iterable"
- "Interface"
- "Generator"
description: "Code spitz에서 강의한 ES6 기초, 루프구조에 대해 보다 깊이 탐험해봅니다. 또한 Iterator과 Iterable의 관계, Generator에 대해 알아봅시다."
---
# es6 basic 3
[코드스피츠](https://www.youtube.com/channel/UCKXBpFPbho1tp-Ntlfc25kA)

채널에서 보고 정리한 글입니다.

---


[WONISM's Blog](https://wonism.github.io/javascript-iteration-protocol/) 블로그 참고

Iterables vs Iterator

- iterable 프로토콜은 반복 가능한 **객체를** 나타내는 프로토콜
- iterator 프로토콜은 반복 가능한 **객체의 값**을 시퀸스대로 처리하는 프로토콜

## Interface in JS

1. 인터페이스란 사양에 맞는 값과 연결된 속성키의 셋트
2. 어떤 Object라도 인터페이스의 정의를 충족시킬 수 있다.
3. 하나의 Object는 여러개의 인터페이스를 충족시킬 수 있다.

### Interface Test

1. test라는 키를 갖고
2. 값으로 문자열인자를 1개 받아 불린결과를 반환하는 함수가 온다.

    {
      test(str){return true;}
    }

## Iterator Interface

1. next라는 키를 갖고
2. 값으로 인자를 받지 않고 IteratorResultObject를 반환하는 함수가 온다.
3. IteratorResultObject는 value와 done이라는 키를 갖고 있다.
4. 이중done은계속반복할수있을지없을지에따라불린값을반환한다.

    {
    	next(){
    	return {value:1, done:false}; }
    }
    
    {
      data:[1,2,3,4],
      next(){
    		return { 
    			done:this.data.length == 0, 
    			value:this.data.pop()
    		}; 
    	}
    }

## Iterable Interface

1. Symbol.iterator라는 키를 갖고
2. 값으로 인자를 받지 않고 Iterator Object를 반환하는 함수가 온다.

    {
    	[Symbol.iterator](){
    		return { 
    				next(){
    	        return {value:1, done:false};
    				}
        };
    	} 
    }

## Loop to iterator

statement(문) : 엔진한테 주는 힌트 , 실행하고 나면 흔적도 없이 사라진다.

expression(식): 메모리에 남고, 언제든지 조회, 참조 할 수 있다.

for, while 은 문이다.

iterator 는 loop 를 식으로 바꾸고 싶어서 사용한다.

## while문으로 살펴보는 Iterator

    let arr = [1, 2, 3, 4];
    while(arr.length > 0){ //계속 반복할지 판단
    	console.log(arr.pop()); //반복시 처리할 것
    }
    // 4 
    // 3 
    // 2 
    // 1

Iterator Interface

    {
    	arr:[1, 2, 3, 4], 
    	next(){
    		return {
    //self descrition
    //계속 반복할지 판단
    		done:this.arr.length == 0,  
    //반복시 처리할 것
    		value:console.log(this.arr.pop())
    		}; 
    	}
    }

1. 반복자체를 하지는 않지만
2. 외부에서반복을하려고할때
3. 반복에 필요한 조건과 실행을
4. 미리준비해둔객체

→

반복행위와 반복을 위한 준비를 분리

→

1. 미리반복에대한준비를해두고
2. 필요할 때 필요한만큼 반복
3. 반복을재현할수있음

## es6+ Loop

- 사용자반복처리기직접 Iterator 반복처리기를 구현

    const loop = (iter, f) => {
      //Iterable이라면 Iterator를 얻음
        if(typeof iter[Symbol.iterator] == 'function'){
          iter = iter[Symbol.iterator]();
      }
      //IteratorObject가 아니라면 건너뜀
        if(typeof iter.next != 'function') return;
      do{
      const v = iter.next(); if(v.done) return; //종료처리 f(v.value); //현재 값을 전달함
      }while(true); 
    };
    
    const iter = {
      arr:[1, 2, 3, 4],
      [Symbol.iterator](){return this;}, next(){
      return { 
        done:this.arr.length == 0, 
        value:this.arr.pop()
    };
    loop(iter, console.log);
    //4 
    //3 
    //2 
    //1

- 내장반복처리기

Array destructuring (배열해체)

    const iter = {
      [Symbol.iterator]() {
        return this;
      },
      arr: [1, 2, 3, 4],
      next() {
        return { done: this.arr.length == 0, value: this.arr.pop() };
      }
    };
    
    const [a, ...b] = iter;
    console.log(a, b);
    // 4, [3, 2, 1]

Spread (펼치기)

    const iter = {
      [Symbol.iterator]() {
        return this;
      },
      arr: [1, 2, 3, 4],
      next() {
        return { done: this.arr.length == 0, value: this.arr.pop() };
      }
    };
    const a = [...iter];
    console.log(a);
    // [4, 3, 2, 1]

Rest Parameter (나머지인자)

    const iter = {
      [Symbol.iterator]() {
        return this;
      },
      arr: [1, 2, 3, 4],
      next() {
        return { done: this.arr.length == 0, value: this.arr.pop() };
      }
    };
    const test = (...arg) => console.log(arg);
    test(...iter);
    // [4, 3, 2, 1]

For of (문 - 권한이 거의 없는 문)

    const iter = {
      [Symbol.iterator]() {
        return this;
      },
      arr: [1, 2, 3, 4],
      next() {
        return { done: this.arr.length == 0, value: this.arr.pop() };
      }
    };
    for (const v of iter) {
      console.log(v);
    }
    //4 //3 //2 //1

---

## 블로킹(Blocking)

프로그램은 노이만 머신(메모리)에 적재되면 쉴 틈 없이 실행되고, 우리는 간섭하지 못한다. 

이러한 상태를 동기 명령이라고 한다. 동기 명령이란 한번 적재된 명령어를 한번에 쭉 실행되는 것을 말한다.  

동기 명령어가 실행되는 것을  관찰하는 것이 flow 이다. 

동기 명령어가 실행되고 있을 때에는 cpu를 건들 일 수 없다. cpu 를 못 건들 이는 현상을 block(blocking)이라고 한다.

블로킹을 걸 수 있는 범위는 5초 이내이다.

시간 동안 얼만큼 많은 일을 할 수 있는 지는 cpu 클럭 수, 비트 수에 달려 있다.

loop 가 길면 블로킹으로 걸면 안된다.(os, 브라우저 가 실행을 종료 해버린다.) Generator cpu 를 sleep을 걸어 주어 release 하여 다른 작업을 할 수 있게 해야 한다.

 node 에서는 nexttick() 브라우저에서는 request animation frame 이나 setTimeout() 이 있다.

무한 루프가 없도록 limit 를 걸어 줘야 한다.

Iterator 를 만들때 done 의 limit 를 설정해줘야 한다.

ex) next() {
        if (cursor > max) 

}

---

## practice

제곱을 요소로 갖는 가상컬렉션

    const N2 = class {
      constructor(max) {
        this.max = max;
      }
      [Symbol.iterator]() {
        let cursor = 0,
          max = this.max;
        return {
          done: false,
          next() {
    //함수는 함수 바깥쪽의 변수를 캡쳐할 수 있는 권한이 있다. 이를 free value (자유변수)라고 한다.
    //자유 변수가 갇히(가두)면 클로져라고 한다.
            if (cursor > max) {
              this.done = true;
            } else {
              this.value = cursor * cursor;
              cursor++;
            }
            return this;
          }
        };
      }
    };
    
    console.log([...new N2(5)]);
    //[0, 1, 4, 9, 16]
    
    for (const v of new N2(5)) {
      console.log(v);
    }
    // 0
    // 1
    // 4
    // 9
    // 16

## Generator

[자바스크립트 제너레이터의 재미](https://medium.com/@jooyunghan/%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-%EC%A0%9C%EB%84%88%EB%A0%88%EC%9D%B4%ED%84%B0%EC%9D%98-%EC%9E%AC%EB%AF%B8-246553cadfbd) 블로그 참고

Iterator의 구현을 돕는 Generator

Generator 는 호출 할때 마다 iterator 가 만들어 진다.

Generator가 만드는 **iterator 는 동시에 Iterable** 이기도 한다.

Generator는 yield 이때 잠깐 suspension 이 생겨  coroutine 이라고도 한다. 일반적인 함수는 은 routine 이라고 한다.

(iterator 는 동시에 Iterable 이기에 for of 를 이용 할 수 있다.)

(for of 는 Generator를 사용 할 수 없다.)

배열은 for of 로 돌아간다. === 배열 === Iterable, Symbol.iterator를 호출 하면 배열이 나온다. === 배열 ===iterator

    const N2 = class {
      constructor(max) {
        this.max = max;
      }
      [Symbol.iterator]() {
        let cursor = 0,
          max = this.max;
        return {
          done: false,
          next() {
            if (cursor > max) {
              this.done = true;
            } else {
              this.value = cursor * cursor;
              cursor++;
            }
            return this;
          }
        };
      }
    };
    
    const generator = function*(max) {
      let cursor = 0;
      while (cursor < max) {
        yield cursor * cursor;
    //yield 이때 잠깐 suspension 이 생겨 
    //iterator result object 를 반환해준다. 
        cursor++;
      }
    };
    console.log([...generator(5)]);
    //[0, 1, 4, 9, 16]
    for (const v of generator(5)) {
      console.log(v);
    }
    //0 
    //1 
    //4 
    //9 
    //16