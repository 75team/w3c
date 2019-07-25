# 给你一个奇舞团面试秘籍 （上）

还有不到半个月就要入伏了，天气逐渐燥热起来，订阅奇舞周刊的你是不是逐渐萌生想要来奇舞团面试下的想法呢？ 今天的文章是个算法相关的JavaScript实现，既然都已经漏题了，你还不过来试试吗？

## 位运算相关

### 计算汉明重量

``` javascript
  function hammingWeight(n) {
    let num = 0;
    while(n !== 0) {
      n &= (n - 1);
      num++;
    }
    return num;
  }
```

### 判断奇偶

``` javascript
  funciton isOdd(n) {
    return n & 1 === 1;
  }
```

## 二分查找

### 非递归方法

```javascript
  function binarySearch(nums, target) {
    let low = 0;
    let high = nums.length - 1;

    while(low <= high) {
      let mid = parseInt((low + high) / 2);
      if(nums[mid] === target) {
        return mid;
      }
      if(nums[mid] > target) {
        high = mid - 1;
      }
      if(nums[mid] < target) {
        low = mid + 1;
      }
    }
    return -1;
  }
```

### 递归方法

```javascript
  function binarySearch(nums, target) {
    let low = 0;
    let high = nums.length -1;
    const binaryWalker = (nums, low, high, target) => {
      if(low > high) return -1;
      const mid = parseInt((low + high) / 2);
      if(nums[mid] === target) return mid;
      if(nums[mid] > target) return binaryWalker(nums, low, mid - 1, target);
      if(nums[mid] < target) return binaryWalker(nums, low + 1, high, target);
    }
    return binaryWalker(nums, low, high, target);

  }

```

## 常见排序

### 快速排序
``` javascript
  function quickSort(arr) {
    if(arr.length <= 1) return arr;

    let left = [];
    let right = [];

    let pivot = arr[0];

    for(let i = 1; i < arr.length; i++) {
      if(arr[i] >= pivot) {
        right.push(arr[i]);
      } else {
        left.push(arr[i]);
      }
    }

    return [...quickSort(left), pivot, ...quickSort(right)];
  }

```

### 冒泡排序
``` javascript
  function bubbleSort(arr) {
    let i = arr.length - 1;
    while(i >= 0) {
      for(let j = 0; j < i; j++) {
        if(arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
      }
      i--;
    } 
    return arr;
  }

```

## 二叉树遍历相关

### 先序遍历（中->左->右）

#### 递归实现
```javascript
  function preOrderTraverse(root) {
    if(root) {
      console.log(root);
      preOrderTraverse(root.left);
      preOrderTraverse(root.right);
    }
  }
```
#### 非递归实现
```javascript
  function preOrderTraverse(root) {
    let stack = [];

    if(root) {
      stack.push(root);
    }

    while(stack.length) {
      let temp = stack.pop();
      console.log(temp);

      if(temp.right) stack.push(temp.right);

      if(temp.left) stack.pus(temp.left);
    }
  }
```

### 中序遍历（左->中->右）


#### 递归实现
```javascript
  function midOrderTraverse(root) {
    if(root) {
      midOrderTraverse(root.left);
      console.log(root);
      midOrderTraverse(root.right);
    }
  }
```
#### 非递归实现
```javascript
  function midOrderTraverse(root) {
    let stack = [];
    while(true) {
      while(root) {
        stack.push(root);
        root = root.left;
      }

      if(!stack.length) break;

      let temp = stack.pop();
      console.log(temp);
      root = temp.right;
    }
  }
```


### 后序遍历（左->右->中）
#### 递归实现
```javascript
  function postOrderTraverse(root) {
    if(root) {
      postOrderTraverse(root.left);
      postOrderTraverse(root.right);
      console.log(root);
    }
  }
```
#### 非递归实现
```javascript
  function postOrderTraverse(root) {
    let stack = [];
    let rest = [];
    if(root)stack.push(root);
    while(stack.length) {
      let temp = stack.pop();
      rest.push(temp);
      if(temp.left) stack.push(temp.left);
      if(temp.right) stack.push(temp.right);
    }
    return rest.reverse();
  }
```

### 层次遍历
```javascript
  function levelTraverse(root) {
    if(!root) return;
    let stack = [];
    stack.push(root);

    while(stack.length) {
      let temp = stack.shift();
      console.log(temp);
      if(temp.left) stack.push(temp.left);
      if(temp.right) stack.push(temp.right);
    }
  }
```

