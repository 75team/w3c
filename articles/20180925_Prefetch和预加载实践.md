# Prefetch和预加载实践

之前介绍了[利用Preload优化首屏关键资源的加载](http://imhxl.com/post/preload.html)。今天跟大家介绍另一个性能优化手段——[Prefetch](https://www.w3.org/TR/resource-hints/#prefetch)。文末会结合常见工具，教大家在项目中使用Preload和Prefetch。

跟Preload类似，Prefetch也是Link的一种关系类型值，用于提示浏览器提前加载资源。跟Preload不同，Prefetch指示的是**下一次**导航可能需要的资源。浏览器识别到Prefetch时，应该加载该资源（且不执行），等到真正请求相同资源时，就能够得到更快的响应。

它的使用方式与Preload类似：

- 在HTML的`<head>`中：

  `<link rel="prefetch" href="/library.js" as="script">`

- 通过JS动态插入：

  ```
  var hint = document.createElement("link");
  hint.rel = "prefetch";
  hint.as = "html";
  hint.href = "/article/part3.html";
  document.head.appendChild(hint);
  ```

- 在HTTP头中：

  `Link: <https://example.com/banner.jpg>; rel=prefetch; as=image;`

Prefetch的兼容性如下：
![](https://p0.ssl.qhimg.com/t0155ab172bd26492ea.png)

跟Preload比起来，Prefetch的兼容范围更广。唯独在Safari上对Preload的支持度比Prefetch要好。

由于Preload和Prefetch两个小朋友的名字太像了，行为也十分相似。它们站在一起的时候，很多人傻傻分不清楚。下面来说一说它俩的区别：

## Prefetch vs Preload

### 1. 网络请求的优先级

在Chrome中，Prefetch的优先级为Lowest。而Preload的优先级则是根据`as`属性值所对应的资源类型来决定，总体上，Preload的优先级比Prefetch高。不过两者都不应该延迟页面的load事件。

### 2. 缓存策略

Preload加载的资源至少会被缓存到内存中，下一次请求的时候直接从缓存读取，从而减少从服务器加载的时间。

Prefetch的缓存并未在标准中定义，所以浏览器不保证缓存资源。不过会根据资源本身的缓存头进行相应的处理。

2017年[Addy Osmani](https://medium.com/@addyosmani?source=post_header_lockup)的“[Preload, Prefetch and Priorities in Chrome](https://medium.com/reloading/preload-prefetch-and-priorities-in-chrome-776165961bbf)”文章提到：

> Furthermore, prefetch requests are maintained in the unspecified net-stack cache for at least 5 minutes regardless of the cachability of the resource.

意思是不论资源的缓存配置如何，Prefetch的请求会被维护在网络栈中至少5分钟。那么现在的Chrome中是不是这样呢？

笔者在Chrome 69中测试发现，如果资源配置了no-store，或者在开发者工具的网络面板中禁用缓存，浏览器并不会缓存该资源。下次请求还会再次从服务器加载资源。

![](https://p4.ssl.qhimg.com/t01bd52cd9a1adf1a6a.jpg)

(图中第一次index.js的请求是使用的Prefetch，第二次是正常请求。笔者在服务端做了延迟1s响应的处理，可以从加载时长看出第二次请求仍然是从服务器获取)

在不禁用缓存且配置了适当的缓存控制的情况下，下次请求则会从缓存加载（from disk cache），可以节约网络加载时间：

![](https://p3.ssl.qhimg.com/t018992a3c53ee36adb.png)

所以对于想要Prefetch的资源要做好**缓存控制**，以便下次请求时命中缓存。而对于**动态**HTML文档，则没必要使用Prefetch加载。

### 3. 重复加载

如果Preload的资源还在途中，此时对相同的资源再发起请求，浏览器不会重复请求资源，而是等返回了再进行处理。

而如果Prefetch的资源还在途中，再发请求，会导致二次请求（如上面“缓存策略”所示）。除此之外，有人可能会将Prefetch作为Preload的降级方案紧跟在Preload后面，也会产生两次请求，如下图所示：

![](https://p4.ssl.qhimg.com/t01c9cdeda4781dcc99.png)



![](https://p5.ssl.qhimg.com/t016fd83ca1c69d3179.png)



### 4. 页面跳转时的行为

如果在当前页面跳转到下一页，在途的Preload请求会被取消。

而Prefetch的请求会在导航过程中保持，如下图所示：

```
document.getElementById('btn').addEventListener('click', () => {
  var hint = document.createElement("link");
  hint.rel = "prefetch";
  hint.as = "img";
  hint.href = "https://p1.ssl.qhimg.com/t01709ea6aebf12d69f.jpg";
  document.head.appendChild(hint);
 
  location.href="https://code.h5jun.com/cuma" 
})
```

![](https://p4.ssl.qhimg.com/t0172ce1f1d6aae2208.jpg)

（第一个图片请求在跳转时没有被取消）

### 5. 适用场景

Preload的设计初衷是为了让当前页面的关键资源尽早被发现和加载，从而提升首屏渲染性能。

Prefetch是为了提前加载下一个导航所需的资源，提升下一次导航的首屏渲染性能。但也可以用来在当前页面提前加载运行过程中所需的资源，加速响应。

那么在生产环境中如何方便地使用Preload和Prefetch呢？

## 实践：单页应用中的Preload和Prefetch

**关键资源**：在单页应用中，应尽早加载关键资源。以React项目为例，应尽早加载React.js以及入口文件。如果项目使用Webpack和htmlWebpackPlugin，入口脚本文件和CSS都是直接输出到HTML中，大部分浏览器能预测解析这些资源，所以不必特意Preload这些资源。

但是有一些隐藏资源，比如font文件，则需要Preload。这种资源可以使用preloadWebpackPlugin，结合htmlWebpackPlugin，在编译阶段插入`link rel="preload"`标签。配置如下：

```
const preloadWebpackPlugin = require('preload-webpack-plugin')
...

// webpack配置
plugins: [
  new htmlWebpackPlugin(),
  new preloadWebpackPlugin({
    as(entry) {
      if (/\.woff2$/.test(entry)) return 'font';
      return 'script';
    },
    include: 'allAssets',
    rel: 'preload',
    fileWhitelist: [/\.woff2/]
  })
]
```

在HTML文件的头部会生成如下标签：

![](https://p1.ssl.qhimg.com/t0138448282d8dd0d92.png)

**异步路由组件**则应当在初始化后再加载。之前有读者朋友说异步路由组件应该用Prefetch，这个策略很好，只有一个地方需要注意：如果当前路由文件也是异步的，那么在Prefetch它的途中大概率会再次请求当前路由组件，从而导致二次加载。所以需要更细粒度的加载策略。

比如可以在鼠标移入导航菜单时再预加载其他的路由组件。既可以使用Prefetch也可以使用Preload。这里笔者认为使用Preload更优，因为Prefetch的优先级比较低而且容易引起二次加载。在React项目中，可以使用`react-loadable`管理异步组件的加载，它还提供了Loading状态和`preload`方法：

```
const AboutComponent = Loadable({
  loader: () => import(/* webpackChunkName: "about" */'./routes/about.js'),
  loading: Loading
});

...
onMouseOver = (page) => {
  AboutComponent.preload(); // 鼠标移入时再预加载相应路由组件
};

...
<li onMouseOver={() => {this.onMouseOver()}}><Link to="/about">关于</Link></li>
```

**其他异步模块**可以用Webpack的魔法注释：`import(/* webpackPrefetch: true */ "...")`、`import(/* webpackPreload: true */ "...")` 。有一个细节需要注意：Preload魔法注释只有写在**非入口文件的chunk**中才能“动态”插入`link rel="preload"`标签。感兴趣的小伙伴可以试试。

以上就是浏览器预加载资源相关的内容，如果有任何疑问，欢迎留言讨论~同时感谢上一篇文章的读者王巍达提出的宝贵意见~

## 参考链接
* [Resource Hints](https://www.w3.org/TR/resource-hints/)
* [代码分割结合 Prefetch 完美优化单页应用加载性能](https://www.404forest.com/2017/09/27/use-code-splitting-with-prefetch-to-improve-spa-web-page-load-performance/)
* [How to Improve the Performance of React Applications](https://hackernoon.com/improving-the-performance-of-javascript-applications-c05385185f9f)
* [preload-webpack-plugin](https://github.com/GoogleChromeLabs/preload-webpack-plugin)
* [<link rel=”prefetch/preload”> in webpack](https://medium.com/webpack/link-rel-prefetch-preload-in-webpack-51a52358f84c)
