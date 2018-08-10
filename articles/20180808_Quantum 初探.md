# Quantum 初探

> quantum 这个词来自拉丁语 quantus，意思是 how great - 多么伟大

Quantum 是 Mozilla 为了构建下一代 Web 引擎的项目。在正式介绍它之前，我们需要先了解一些浏览器的相关知识。


## 浏览器相关
### 浏览器的结构

![](https://p5.ssl.qhimg.com/t0191ae8502d6620286.png)

_图1. 浏览器结构，源自 [How Browsers Work](https://www.html5rocks.com/en/tutorials/internals/howbrowserswork/)_

- 用户界面（User Interface）：除了用于显示网页内容的视口之外，你能看到的其它所有部分都属于用户界面，诸如地址栏、前进/后退按钮、书签菜单等。
- 浏览器引擎（Browser Engine）：在用户界面和渲染引擎之间传送指令。
- 渲染引擎（Rendering Engine）：负责显示浏览器请求回来的资源内容。资源可以是 HTML 文档、PDF、图片或其它类型，它们的位置都是用 URI 指定的。如果请求的资源是 HTML，那渲染引擎就负责解析 HTML 和 CSS，并将解析后的内容显示在屏幕上。
- 网络（Networking）：负责网络调用，比如 HTTP 请求。不同平台的实现会有所差异。
- JS 解释器（Javascript Interpreter）：用于解析和执行 JavaScript 代码。
- 用户界面后端（UI Backend）：用于绘制基础小部件，比如组合框和窗口等。此层会公开平台无关的通用接口，而它的底层则是调用操作系统的用户界面方法。
- 数据持久化存储（Data Persistence）：浏览器的客户端持久化存储，诸如 Cookie、Local Storage、Session Storage、 IndexDB、WebSQL 等。

### 渲染引擎
渲染引擎（Rendering Engine）也叫布局引擎（Layout Engine）。浏览器的渲染引擎，有时也简称为浏览器引擎（Browser Engine）。
> 注意：这里的 Browser Engine 不同于图1中的 Browser engine

> 所以，以下名词往往是等价的：  
> 浏览器的渲染引擎 ~ 浏览器引擎 ~ 渲染引擎 ~ 布局引擎

主流浏览器用到的渲染引擎如下：

浏览器      | 渲染引擎（开发语言）   | 脚本引擎（开发语言）
-----------|--------------------| ------------
Chrome     | Blink (c++)        | V8 (c++)
Opera      | Blink (c++)        | V8 (c++)
Safari     | Webkit (c++)       | JavaScript Core (nitro)
FireFox    | Gecko (c++)        | SpiderMonkey (c/c++)
Edge       | EdgeHTML (c++)     | Chakra JavaScript Engine (c++)
IE         | Trident (c++)      | Chakra JScript Engine (c++)

> 之所以列出“脚本引擎”，旨在强调渲染引擎不负责 JS。对 JS 的解释和执行是由独立的引擎完成的，比如大名鼎鼎的 V8 引擎。

对 HTML 文档来说，渲染引擎的主要任务就是解析 HTML 和 CSS，再把最终的结果绘制到屏幕上。

下面是各个渲染引擎的时间线，我们可以很直观地看出她们的生日和年龄。其中，Trident、KHTML、Presto 已经停止更新；Gecko、Webkit、Blink 和 Edge 依然在持续更新中。

![](https://p0.ssl.qhimg.com/t0102295d23524009d0.png)

_图2. 浏览器引擎，源自维基百科 [Browser engine](https://en.wikipedia.org/wiki/Browser_engine)_


## Quantum

### 背景
2013年，Mozilla 启动了一项研究型项目 Servo。这是一个从零开始设计的浏览器引擎，目标是提高并发性和并行性，同时减少内存安全漏洞。它是由 Rust 语言编写的，而 Rust 有更好的内存安全属性和并发功能。

2016年4月，考虑到 Servo 还需要几年才能成为功能完备的浏览器引擎。所以，Mozilla 决定启动 Quantum 项目，将 Servo 的稳定部分带到 Firefox 里。


### Quantum 项目
Gecko 是 Mozilla 的一个成熟且功能健全的 Web 浏览器引擎，它起源于1997年的 Netscape。Mozilla 采用渐进式的方法，将 Servo 里已稳定的组件迁移到 Gecko 中，用户将不必等很长时间就能看到 Firefox 在稳定性和性能上的显著改进。

2017年11月发布的 Firefox 57 是第一版启用了 Servo 组件的浏览器，之后便在此版本的基础上进行迭代开发。

> 关于集成到 Firefox 中的 Servo 组件，可查看 Jack Moffitt 的演讲视频 [Web Engines Hackfest](https://youtu.be/UGl9VVIOo3E) 

Quantum 以 Gecko 引擎为基础，同时利用了 [Rust](https://github.com/rust-lang/rust) 的良好并发性和 [Servo](https://github.com/servo/servo) 的高性能组件，为 Firefox 带来了更多的并行化和 GPU 运算，让 Firefox 更快更可靠。


### 多个子项目
Quantum 是一个将 Mozilla 的多个社区及其代码仓库联系在一起的大项目，它包含多个子项目：

1. [rust-bindgen](https://github.com/servo/rust-bindgen)：是 Rust 语言的 C++ 绑定生成器。Quantum 用它生成的代码，可用在 Firefox 的 C++ 代码和 Servo 的 Rust 组件之间。感兴趣的朋友可以查看 [Contributing to rust-bindgen](https://github.com/servo/rust-bindgen/blob/master/CONTRIBUTING.md)。
2. Quantum CSS：也叫 Stylo，旨在把 Servo 的并行 CSS 系统集成到 Gecko 中，可以充分利用多核 CPU 的硬件特性。 
3. Quantum Render：旨在将 WebRender 作为 Firefox 的图形后端。WebRender 是 Servo 针对 GPU 渲染进行了优化的下一代渲染器，它用保留模式模型替换立即模式绘制模型，通过利用 CSS/DOM 和场景图的相似性，让 GPU 加速更容易。
4. Quantum Compositor：将 Gecko 现有的合成器移到自己的进程中，将图形驱动程序相关的崩溃和浏览器页签隔离开来，以让 Firefox 更稳定。此特性已经在 Firefox 53 里发布了。
5. Quantum DOM：在 DOM 中使用协同调度线程来提高响应速度，而不用增加进程数和内存，这会让 Gecko 更具响应性，尤其是当有大量后台页签打开的时候。不同页签（也可能是不同 iframe）的 JS 代码将运行在独立的线程中，某些后台页签的代码将永远不会被运行。更多可查看 [Bill McCloskey 的博客](https://billmccloskey.wordpress.com/2016/10/27/mozillas-quantum-project/)。
6. Quantum Flow：探讨了目前尚未被涵盖的性能改进，例如 UI 性能优化。


### 下一步
至此，大家对 Quantum 项目的由来和概况有了初步的认识。后续，我会继续探索更多详细内容。敬请期待。

## 参考
- [https://wiki.mozilla.org/Quantum](https://wiki.mozilla.org/Quantum)
- [https://en.wikipedia.org/wiki/Quantum_(Mozilla)](https://en.wikipedia.org/wiki/Quantum_(Mozilla))
- [https://en.wikipedia.org/wiki/Browser_engine](https://en.wikipedia.org/wiki/Browser_engine)
- [https://www.html5rocks.com/en/tutorials/internals/howbrowserswork](https://www.html5rocks.com/en/tutorials/internals/howbrowserswork)