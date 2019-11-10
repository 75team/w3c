# 时间切片（Time Slicing）

上周我在FDConf的分享[《让你的网页更丝滑》](https://ppt.baomitu.com/d/b267a4a3)中提到了“时间切片”，由于时间关系当时并没有对时间切片展开更细致的讨论。所以回来后就想着补一篇文章针对“时间切片”展开详细的讨论。

从用户的输入，再到显示器在视觉上给用户的输出，这一过程如果超过100ms，那么用户会察觉到网页的卡顿，所以为了解决这个问题，每个任务不能超过50ms，W3C性能工作组在LongTask规范中也将超过50ms的任务定义为长任务。

> 关于这50毫秒我在FDConf的分享中进行了很详细的讲解，没有听到的小伙伴也不用着急，后续我会针对这次分享的内容补一篇文章。
> 
> 在线PPT地址:https://ppt.baomitu.com/d/b267a4a3

所以为了避免长任务，一种方案是使用Web Worker，将长任务放在Worker线程中执行，缺点是无法访问DOM，而另一种方案是使用时间切片。

## 什么是时间切片

时间切片的核心思想是：如果任务不能在50毫秒内执行完，那么为了不阻塞主线程，这个任务应该**让出主线程的控制权**，使浏览器可以处理其他任务。让出控制权意味着停止执行当前任务，让浏览器去执行其他任务，随后再回来继续执行没有执行完的任务。

所以时间切片的目的是不阻塞主线程，而实现目的的技术手段是将一个长任务拆分成很多个不超过50ms的小任务分散在宏任务队列中执行。

![LongTask](https://p.ssl.qhimg.com/t018f4a9c8003da97fd.png)

上图可以看到主线程中有一个长任务，这个任务会阻塞主线程。使用时间切片将它切割成很多个小任务后，如下图所示。

![task](https://p.ssl.qhimg.com/t0165469668d61c85f6.png)

可以看到现在的主线程有很多密密麻麻的小任务，我们将它放大后如下图所示。

![task2](https://p.ssl.qhimg.com/t013d48124638650087.png)

可以看到每个小任务中间是有空隙的，代表着任务执行了一小段时间后，将让出主线程的控制权，让浏览器执行其他的任务。

> 使用时间切片的缺点是，任务运行的总时间变长了，这是因为它每处理完一个小任务后，主线程会空闲出来，并且在下一个小任务开始处理之前有一小段延迟。
> 
> 但是为了避免卡死浏览器，这种取舍是很有必要的。

## 如何使用时间切片

时间切片是一种概念，也可以理解为一种技术方案，它不是某个API的名字，也不是某个工具的名字。

事实上，时间切片充分利用了“异步”，在早期，可以使用定时器来实现，例如：

```javascript
btn.onclick = function () {
  someThing(); // 执行了50毫秒
  setTimeout(function () {
    otherThing(); // 执行了50毫秒
  });
};
```

上面代码当按钮被点击时，本应执行100毫秒的任务现在被拆分成了两个50毫秒的任务。

在实际应用中，我们可以进行一些封装，封装后的使用效果类似下面这样：

```javascript
btn.onclick = ts([someThing, otherThing], function () {
  console.log('done~');
});
```

当然，关于`ts`这个函数的API的设计并不是本文的重点，这里想说明的是，在早期可以利用定时器来实现“时间切片”。

ES6带来了迭代器的概念，并提供了生成器Generator函数用来生成迭代器对象，虽然Generator函数最正统的用法是生成迭代器对象，但这不妨我们利用它的特性做一些其他的事情。

Generator函数提供了`yield`关键字，这个关键字可以让函数暂停执行。然后通过迭代器对象的`next`方法让函数继续执行。

> 对Generator函数不熟悉的同学，需要先学习Generator函数的用法。

利用这个特性，我们可以设计出更方便使用的时间切片，例如：

```javascript
btn.onclick = ts(function* () {
  someThing(); // 执行了50毫秒
  yield;
  otherThing(); // 执行了50毫秒
});
```

可以看到，我们只需要使用`yield`这个关键字就可以将本应执行100毫秒的任务拆分成了两个50毫秒的任务。

我们甚至可以将yield关键字放在循环里：

```javascript
btn.onclick = ts(function* () {
  while (true) {
    someThing(); // 执行了50毫秒
    yield;
  }
});
```

上面代码我们写了一个死循环，但依然不会阻塞主线程，浏览器也不会卡死。

## 基于生成器的ts实现原理

通过前面的例子，我们会发现基于Generator的时间切片非常好用，但其实ts函数的实现原理非常简单，一个最简单的ts函数**只需要九行代码**。

```javascript
function ts (gen) {
  if (typeof gen === 'function') gen = gen()
  if (!gen || typeof gen.next !== 'function') return
  return function next() {
    const res = gen.next()
    if (res.done) return
    setTimeout(next)
  }
}
```
代码虽然全部只有9行，关键代码只有3、4行，但这几行代码充分利用了事件循环机制以及Generator函数的特性。

> 创造出这样的代码我还是很开心的。

上面代码核心思想是：通过`yield`关键字可以将任务暂停执行，从而让出主线程的控制权；通过定时器可以将“未完成的任务”重新放在任务队列中继续执行。

## 避免把任务分解的过于零碎

使用`yield`来切割任务非常方便，但如果切割的粒度特别细，反而效率不高。假设我们的任务执行`100ms`，最好的方式是切割成两个执行`50ms`的任务，而不是切割成100个执行`1ms`的任务。假设被切割的任务之间的间隔为`4ms`，那么切割成100个执行`1ms`的任务的总执行时间为：

```javascript
(1 + 4) * 100 = 500ms
```

如果切割成两个执行时间为`50ms`的任务，那么总执行时间为：

```javascript
(50 + 4) * 2 = 108ms
```

可以看到，在不影响用户体验的情况下，下面的总执行时间要比前面的少了4.6倍。

保证切割的任务刚好接近`50ms`，可以在用户使用`yield`时自行评估，也可以在`ts`函数中根据任务的执行时间判断是否应该一次性执行多个任务。

我们将`ts`函数稍微改进一下：

```javascript
function ts (gen) {
  if (typeof gen === 'function') gen = gen()
  if (!gen || typeof gen.next !== 'function') return
  return function next() {
    const start = performance.now()
    let res = null
    do {
      res = gen.next()
    } while(!res.done && performance.now() - start < 25);

    if (res.done) return
    setTimeout(next)
  }
}
```

现在我们测试下：

```javascript
ts(function* () {
  const start = performance.now()
  while (performance.now() - start < 1000) {
    console.log(11)
    yield
  }
  console.log('done!')
})();
```
这段代码在之前的版本中，在我的电脑上可以打印出 215 次 `11`，在后面的版本中可以打印出 6300 次 `11`，说明在总时间相同的情况下，可以执行更多的任务。

再看另一个例子：

```javascript
ts(function* () {
  for (let i = 0; i < 10000; i++) {
    console.log(11)
    yield
  }
  console.log('done!')
})();
```
在我的电脑上，这段代码在之前的版本中，被切割成一万个小任务，总执行时间为 `46`秒，在之后的版本中，被切割成 52 个小任务，总执行时间为 `1.5`秒。

## 总结

我将时间切片的代码放在了我的Github上，感兴趣的可以参观下：[https://github.com/berwin/time-slicing](https://github.com/berwin/time-slicing)
