有时候我们希望在浏览器中执行一些低优先级的任务，比如记录统计数据、做一些耗时的数据处理等，暂且将其称为后台任务。这些任务跟动画计算、合成帧、响应用户输入等高优先级的任务共享主线程。我们可能会面临这样的问题：正在执行的后台任务很耗时，会阻塞高优先级任务的执行，出现卡顿或者无响应的情况。

有同学提出建议：把后台任务拆分到最小的可执行块，将其放到间隔极短的setTimeout中异步执行。这样就不会阻塞主线程上其他任务啦。但是不停地将小任务发给事件循环会带来额外开销，而且实现起来也不优雅。

其实浏览器的主线程在每一帧处理完用户输入、动画计算、合成帧等操作后，通常会处于空闲状态，直到下一帧开始、或者收到新的用户输入、或者pending的任务满足了执行条件等。这段空闲时间应该充分地利用起来。比如用空闲时间来执行后台任务就十分合适。如下图所示，可以在空闲时间执行回调任务：

![](https://p2.ssl.qhimg.com/t018ffd321375926d61.png)

(图片来源：[W3C的ED文档](https://w3c.github.io/requestidlecallback/))

但是开发者不知道浏览器什么时候空闲，所以要依靠浏览器提供的`requestIdleCallback`API来实现任务的调度。

## requestIdleCallback

这是一个神奇的API：`requestIdleCallback(callback, options)`。

它的原理是让浏览器在空闲的时候执行回调函数，而且在回调函数中通过参数告知预计还剩多少空闲时间。我们可以根据剩余的空闲时间来合理安排执行的任务量，确保不会影响其他高优先级任务的执行。

用法很简单：

```
function doWork(deadline) {
  // 如果还有空闲时间，就继续执行doSomeTask
  while (deadline.timeRemaining() > 5) {
    doSomeTask();
  }
  // 否则，安排到下一次空闲时间执行
  requestIdleCallback(doWork)
}
...
requestIdleCallback(doWork)
```

以上代码是最基本的用法。首先`requestIdleCallback(doWork)`让浏览器在下一次空闲时间执行`doWork`。在`doWork`里，通过参数`deadline`的`timeRemaining()`方法获得最新的空闲时间还剩多少。如果大于0，表示还有剩余的空闲时间。但是我们还需要评估`doSomeTask()` 的执行时长，比如预计需要5毫秒，那么当剩余的空闲时间大于5毫秒的时候，继续执行`doSomeTask()`。否则安排到下一次空闲时间执行。

有人会问，如果浏览器一直忙，岂不是没有机会执行后台任务？所以这个API提供了第二个参数`timeout`，它表示如果在`timeout`的时间间隔内callback都没有被调用，那么就像setTimeout那样，到超时时间将callback加入到事件队列中等待执行。代码如下：

```
function doWork(deadline) {
  // 如果还有空闲时间，或者到超时时间了，就继续执行任务直到做完
  while ((deadline.timeRemaining() > 5 || deadline.didTimeout) && tasks.length > 0) {
    doSomeTask();
  }
  // 否则，剩余的任务安排到下一次空闲时间执行
  if  (tasks.length > 0) {
    requestIdleCallback(doWork)
  }
}
...
requestIdleCallback(doWork, 2000)
```

在以上代码中，如果是因为超时导致的回调，那么`timeRemaining()`返回0，且`didTimeout`为`true`。加上超时时间在一定程度上保证了回调函数执行的时机。但是并不推荐这种做法，因为这样丢失了这个API最重要的意义——充分利用空闲时间。

跟setTimeout类似，`requestIdleCallback`会返回一个handle，我们可以通过`cancelIdleCallback(handle)`来取消后台任务调度。

## 使用场景

- 上报分析数据。比如用户轻触的时候，需要将该事件上报。为了不影响轻触之后动画的流畅性，可以使用`requestIdleCallback`实现。
- 实现模板的预编译和组装。比如在懒加载的页面组装新元素，再用`requesAnimationFrame`更新到DOM上。注意，不要在`requestIdleCallback` 中直接修改DOM。

## 兼容性

![](https://p1.ssl.qhimg.com/t015a2660e09754fd8e.png)

（图片来源：[caniuse](https://caniuse.com/#search=requestIdlecallback)）

目前这个API的兼容性还比较欠缺，而且标准还在迭代中，需要等待一段时间。网上有用setTimeout实现的方案可以做为降级。

## 参考文档

[W3C: Cooperative Scheduling of Background Tasks](https://www.w3.org/TR/requestidlecallback/)

[Using requestIdleCallback](https://developers.google.com/web/updates/2015/08/using-requestidlecallback)

[MDN: Cooperative Scheduling of Background Tasks API
