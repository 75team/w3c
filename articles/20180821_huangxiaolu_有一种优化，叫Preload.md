# 有一种优化，叫Preload

> 编者按：本文作者是来自奇舞团的前端工程师黄小璐，同时是W3C性能工作组成员。

今天给大家介绍一个性能优化利器：Preload。

## 背景
有时候为了提高网页初始加载的性能，我们会选择延迟一部分资源的加载和执行。

另一种情况是我们想要尽早加载资源，但是要等到合适的时机再执行。时机的影响因素包括依赖关系、执行条件、执行顺序等。


通常的做法是：
* 通过插入一个页面元素来声明一个资源（比如img、script、link）。这种方式会将资源的**加载和执行耦合**。

* 用AJAX来加载资源。这种方式只有在时机成熟时才会加载资源，解决了执行时机问题。但是浏览器无法预解析，也就**无法提前加载**。另外如果页面有大量的阻塞脚本，就会造成**延迟**。

有没有办法既提前加载资源，又能解耦加载和执行呢？这时候就轮到preload大显身手啦。

## 什么是Preload
`preload`是一个预加载关键字。它显式地向浏览器声明一个需要提前加载的资源。使用方式如下：
* 在`<head>`中写入`<link rel="preload" href="some-resource-url" as="xx">`（包括用JS创建`<link>`元素并插入到`<head>`）

* 在HTTP头部加上`Link: <some-resource-url>; rel=preload; as=xx
`

当浏览器“看”到这样的声明后，就会以一定的优先级在后台加载资源。加载完的资源放在HTTP缓存中。而等到要真正执行时，再按照正常方式用标签或者代码加载，即可从HTTP缓存取出资源。

使用Preload加载资源的方式有以下几个特点：

* 提前加载资源

* 资源的加载和执行分离

* 不延迟网页的load事件（除非Preload资源刚好是阻塞 window 加载的资源）

大家可能会问：Preload跟其他提前加载资源以及加载和执行分离的方案有什么区别？

好的，满足你们的好奇心：

### vs. 预测解析
浏览器很聪明，它可以在解析 HTML 时收集外链资源。并将它们添加到一个列表，在后台并行下载。预测解析也实现了提前加载以及加载和执行分离。如图所示：

![](https://p1.ssl.qhimg.com/t0113f23aba8c54f455.png)

那么它跟Preload的区别是什么？

* 仅限于解析HTML时收集的外链资源。如果是程序里异步加载的资源无法提前收集到。

* 浏览器不暴露类似于Preload中的`onload`事件，也就无法更细粒度控制资源的执行。

### vs. `async`
`async` 脚本是一加载完就立即执行，因此会阻塞window的onload事件。而且目前`async`仅限于脚本资源。

![](https://p1.ssl.qhimg.com/t015e85e187747f55b6.png)

Preload可以实现`async`一样的异步加载功能。且不局限于脚本。比如以下代码实现了加载完CSS文件立即作用到网页的功能：
```HTML
<link rel="preload" href="style.css" as="style" onload="this.rel='stylesheet'">

```
> 注：如果页面存在同步阻塞脚本，等脚本执行完后，样式才会作用到网页。这样是因为Preload的资源不会阻塞window的onload事件。

### vs. `defer`
`defer`实现了资源的加载和执行分离，并且它能保证`defer`的资源按照在HTML里的出现顺序执行。跟`async`一样，目前也只能作用于脚本资源。

![](https://p1.ssl.qhimg.com/t012bef90c8ae685690.png)

Preload则适用多种资源类型。Preload的资源也能像`defer`的资源一样延迟执行并保证执行顺序。

### vs. Server Push
HTTP/2的Server Push也实现了资源的提前加载以及加载执行分离。不过Server Push节省了一个网络来回。我们可以结合Server Push优化Preload，比如服务器识别到文档里的Preload的资源就主动推送Preload的资源。

如果不希望服务器推送，则可以增加`nopush`属性：
```
Link: </app/style.css>; rel=preload; as=style; nopush
```
另外Server Push只能推送同域资源。而Preload则可以支持**跨域**资源。

## 何时使用Preload

任何你想要先加载后执行，或者想要提高页面渲染性能的场景都可以使用Preload。

典型用例：

* 在单页应用中，提前加载路由文件，提高切换路由时的渲染速度。现在大型的单页应用通常会异步加载路由文件。当用户切换路由时再异步加载相应的模块存在性能问题。可以用`Preload`提前加载，提升性能。

* 提前加载字体文件。由于字体文件必须等到CSSOM构建完成并且作用到页面元素了才会开始加载，会导致页面字体样式闪动（FOUT，Flash of Unstyled Text）。所以要用Preload显式告诉浏览器提前加载。假如字体文件在CSS生效之前下载完成，则可以完全消灭FOUT。

## 浏览器兼容性
Preload的兼容性如下：
![](https://p0.ssl.qhimg.com/t01e8239b8b563d820c.png)

（图片来源：[https://caniuse.com/#search=preload](https://caniuse.com/#search=preload)）

截至本文写作时，在PC上实现了Preload的浏览器包括： Chrome 50+，Saferi 11.1+ 。Edge 17+支持HTML <link rel> 方式，不支持HTTP header方式。移动端：iOS Safari 11.4+，Android Chrome 67

不支持Preload的浏览器会自动忽略它，并采用普通的加载方式。因此可以将此功能作为一种渐进增强方式用到我们的网页应用中。

## 鸣谢
何文力和李松峰对文章的内容和细节提出了宝贵的修订意见，感谢！

## 参考文档
* [W3C的Preload标准文档](https://www.w3.org/TR/preload/)

* [MDN：通过rel="preload"进行内容预加载](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Preloading_content)

* [Preload: What Is It Good For? （中文版）](https://www.jianshu.com/p/24ffa6d45087)

* [Yoav Weiss的PPT：link](https://yoavweiss.github.io/link_htmlspecial_16)

* [更快地构建DOM: 使用预解析, async, defer 以及 preload（中文版）](https://www.w3cplus.com/javascript/building-the-dom-faster-speculative-parsing-async-defer-and-preload.html)
