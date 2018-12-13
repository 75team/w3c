# 跳出forEach

使用`for...in`遍历对象时，会遍历原型链上的可枚举属性，这可能会导致一些意想不到的问题。所以你一定收到过这样的建议，使用数组的`forEach`来代替`for...in`循环。

## 一、常规试错

在使用`for...in`的时候，在适当的时机终止循环是很常用的功能。那么问题来了，当我们有此需求时，我们可能会像下面这么做。

或许我们会尝试如下代码：

```
  [1, 2, 3, 4, 5].forEach(function(v) {
    console.log(v); //期望只输出1,2
    if (v === 2) return false;
  });
```

但是，运行之后你会发现，其实`return false`并没有起作用。

然后又尝试了下面这个方法：

```
  [1, 2, 3, 4, 5].forEach(function(v) {
    console.log(v); //期望只输出1,2
    if (v === 2) break;
  });
```

发现仍然不行，并且得到了如下的错误提示：

```
Uncaught SyntaxError: Illegal break statement at Array.forEach (<anonymous>)
```

其实，MDN上有说明：

> There is no way to stop or break a forEach() loop other than by throwing an exception. If you need such behavior, the forEach() method is the wrong tool.
> 在forEach()方法中除了抛出异常以外，无法终止或者跳出循环。如果你需要该操作，那说明你用错了方法。

好吧，看来在forEach中确实不能终止或者跳出循环，那么为什么呢？

## 二、为什么不行？

首先我们先想一下第一种方法为啥不行。

其实forEach类似等价于如下的方法：

```
const arr = [1, 2, 3, 4, 5];
for (let i = 0; i < arr.length; i++) {
  const ret = (function(element) {
    console.log(element);
    if (element === 2) return false; 
  })(arr[i])
}
```

这样就很好理解了，我们在内部使用的return只是相当于将结果输出到ret变量中，并不能跳出循环。

至于第二种方法的报错，是因为`break`不允许出现在函数体内。

现在我们也知道了为啥在forEach不能跳出或者终止了。那么在遇到开始所说的使用场景时，有没有方法能跳出forEach呢？

当然是有的，下面给大家总结了5个变通之法。

## 三、跳出forEach的5个变通之法

### 1. 重回for...in

上面提到我们是因为某些原因才推荐使用`forEach`来代替`for...in`的。但是如果有break的需求，而你又不知道其他方法时，可以重拾`for...in`。

### 2. throw法

前面提到了，在forEach()方法中除了抛出异常以外，无法终止或者跳出循环。那么就看看如何使用throw来跳出循环。

```
var BreakErr = {};

try {
  [1, 2, 3, 4, 5].forEach(function(v) {
    console.log(v); //只输出1,2
    if (v === 2) throw BreakErr;
  });
} catch (e) {
  if (e !== BreakErr) throw e;
}
```

这样其实也挺好的，如果循环遍历中的操作比较复杂，可以通过`try...catch`捕获异常。这样的话，跳出循环的错误就需要特别区开，避免不会干扰代码抛出的其他错误。

### 3. 空跑循环

第3种方法是空跑循环。

在外层加一个标识，在特定情况下改变此标识的值，然后通过if语句判断，空跑后续的循环，如下：

```
var breakFlag = false;

[1, 2, 3, 4, 5].forEach(function(v) {
  if (breakFlag === true) {
    return false;
  }

  if (v === 2) {
    breakFlag = true
  }

  console.log(v) //只输出1,2
})
```

这个方法比较简单也比较容易想到，但是该方法在外层加了一个变量，这样会污染外层的环境。所以我们可以使用forEach的第二个参数context来替代外层变量，把标识放在context里，这样就避免污染外层环境了。

```
[1, 2, 3, 4, 5].forEach(function(v) {
  if (this.breakFlag === true) {
    return false;
  }

  if (v === 2) {
    this.breakFlag = true
  }
  console.log(v) //只输出1,2
}, {}); // 这里指定context
```

需要注意的是，forEach的第二个参数context，只有在使用非箭头函数时有效，因为箭头函数，无法改变context的指向。如果不注意的话，会污染了父级上下文。

```
[1, 2, 3, 4, 5].forEach((v) => {
  if (this.breakFlag === true) {
    return false;
  }

  if (v === 2) {
    console.log(this) // 运行会发现，结果并不是{test: 'test'}
    this.breakFlag = true
  }
  console.log(v) //只输出1,2
}, {test: 'test'});
```

当然，上述这种方法会有一些不必要的运行，因为会空跑整个循环，显得不太优雅。

### 4. 神奇改数组大法

下面出场的这位选手，稍微有点技术含量，笔者还是问了大佬才知道的，一定是我太过愚钝了。

所以你可以先别急着往下看解释，先看看你能理解不。

```
var array = [1, 2, 3, 4, 5];
array.forEach(function(item, index) {
  if (item === 2) {
    array = array.concat(array.splice(index, array.length - index));
  }
  console.log(item); //只输出1,2
});
```

其实，这种方法相当于在item === 2的时候，改变了原数组引用的值，因为原数组改变了，则forEach进行到第二项就没了，但是该方法又机智地用concat后的新数组赋值给了array，所以array的值看上去并没有变，不信你可以试一下。

### 5. 最应该使用的every/some

**在需要break的场景下，我们可以使用every或者some**，也比较推荐这种方式。

every和some的用法如下，它们会根据返回值来判断是否继续迭代，能够完美满足我们的需求。every在碰到return false的时候，中止循环。some在碰到return ture的时候，中止循环。

两者的代码分别如下：

```
var a = [1, 2, 3, 4, 5]
a.every(function(item, index, arry) {
    console.log(item); //输出：1,2
    if (item === 2) {
        return false
    } else {
        return true
    }
})
```

```
var a = [1, 2, 3, 4, 5]
a.some(function(item, index, arry) {
    console.log(item); //输出：1,2
    if (item === 2) {
        return true
    } else {
        return false
    }
})
```

## 总结

本文给大家总结了5种在forEach中跳出循环的变通之法，其实这些方法在网上都能很容易地找到，笔者只是把在遇到该问题时的想法和解决方案进行了一下总结。希望能够对大家有帮助。

### 参考内容

> 1. https://medium.com/@tiboprea/3-things-you-didnt-know-about-the-foreach-loop-in-js-ff02cec465b1
> 2. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
> 3. http://jser.me/2014/04/02/%E5%A6%82%E4%BD%95%E5%9C%A8Array.forEach%E7%9A%84%E5%BE%AA%E7%8E%AF%E9%87%8Cbreak.html