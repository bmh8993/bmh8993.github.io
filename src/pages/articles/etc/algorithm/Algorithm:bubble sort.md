---
title: Algorithm/버블 정렬(bubble sort with python)
date: 2021-01-16 23:27:95
layout: post
draft: false
path: "/etc/algorithm/bubble-sort"
category: "Algorithm"
tags:
- "Algorithm"
- "bubble-sort"
description: "버블정렬에 대해서 알아봅시다."
---
버블정렬에 대해서 알아봅시다.

# 버블정렬의 핵심 IDEA

1. 전체 elements의 개수가 n 이라면, 두 개씩 비교하게 되므로 loop의 범위를 n-1로 합니다.
2. 비교가 끝나면 제일 큰 요소가 확정되는데, 확정된 요소를 제외하고 loop를 돌면됩니다.

```python
for index in range(데이터 길이 - 1):  #✅1
    for index_2 in range(데이터 길이 - loop 회수 - 1):  #✅2
        if 앞 데이터 > 뒤 데이터:  #✅3
            스왑  #✅4
```

> ✅1: 데이터길이-1 만큼 outer loop range를 지정한다.<br>
> ✅2: i번 돌면 i개의 요소를 제외하고 inner loop를 진행하면 된다.<br>
> ✅3: 조건 확인<br>
> ✅4: swap<br>

---

# 추가 IDEA
이미 정렬 되어져 있다면 = swap이 한 번도 발생하지 않았다면, 그 다음 loop를 진행하지 않아도 됩니다.<br>
어떻게 알 수 있을까요? -> 상태를 확인하는 변수를 하나 만들자!

---

# 구현
```python
def bubble_sort(data):
    for i in range(len(data) - 1):
        is_swaped = False
        for j in range(len(data) - i - 1):
            if data[j] > data[j + 1]:
                data[j], data[j + 1] = data[j + 1], data[j]
                is_swaped = True

        if is_swaped is False:
            break
    return data
```

---

# 결과
```python
import random

data = random.sample(range(100),10)
bubble_sort(data)

# [3, 15, 17, 20, 28, 50, 55, 63, 70, 76]
```
