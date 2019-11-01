# 你的浏览器为什么卡

> 编者按：本文作者是来自360奇舞团的前端开发工程师刘宇晨，同时也是 W3C 性能工作组成员。

优化页面体验的终极方案：

> 换 Chrome 试试？

以上为调侃，下面进入正题。

- 输入文字时，浏览器总慢半拍
- 滚动时，页面丢帧
- 执行动画时，明显卡顿

上述场景是常见的页面体验问题，也是前端工程师的日常优化点。

不过，在圈起袖子撸代码之前，屏幕前的你可曾思考过，究竟该如何定位这类体验问题的来源呢？

换句话说，造成页面卡顿的，是项目自身代码？还是第三方服务呢（如 iframe 或者 JavaScript SDK 等）？毕竟，如果问题根源是第三方代码，不论再怎么优化项目代码，体验问题也无法解决。

好消息是，浏览器提供的 `Long Task API` 可以帮助前端工程师快速确认问题的来源。

坏消息是，令人窒息的兼容性（见文末）。

## 什么是 `long task`

简单而言，任何在浏览器中执行超过 50 ms 的任务，都是 `long task`。

`long task` 会长时间占据主线程资源，进而阻碍了其他关键任务的执行/响应，造成页面卡顿。

常见场景如：

- 不断计算 DOM 元素的大小、位置，并且根据结果对页面进行 `relayout`；
- 一次性生成十分庞大的 DOM 元素，如大型表单；

## `long task` 的基本属性

`Long Tasks API` 定义了 `PerformanceLongTaskTiming` 接口，用于描述 `long task`。

简单介绍几个关键字段:

- `name`: 用于描述 `long task` 的类型。分成两大类：
  - 来自于执行 `event loop tasks`：
    - `self`：页面自身，例如执行某 JavaScript 函数
    - `same-origin-ancestor`：同源的上级 frame（自身是 iframe）
    - `same-origin-descendent`：同源的子级 frame（iframe）
    - `same-origin`：同源 frame，但是 `unreachable`
    - `cross-origin-ancestor`：跨域的上级 frame
    - `cross-origin-descendent`：跨域的子级 frame
    - `cross-origin-unreachable`：跨域 frame 且 `unreachable`
    - `multiple-context`: 多处来源
    - `unknown`: 未知
  - 其他：
    - `rendering`：`event loop` 中的 `update the rendering` 步骤，例如页面大量元素需要 `relayout`
    - `browser`：与 `event loop` 彻底无关
- `entryType`：值为 `"longtask"`
- `attribution`：一系列 `TaskAttributionTiming` 的集合。可以理解为是 `long task` 的详细信息。

> 关于 `event loop task` 的概念，参见 [https://html.spec.whatwg.org/multipage/webappapis.html#concept-task](https://html.spec.whatwg.org/multipage/webappapis.html#concept-task)<sup>1</sup>

> 关于浏览器如何判断并设置 `name` 字段，参见 [https://w3c.github.io/longtasks/#sec-processing-model](https://w3c.github.io/longtasks/#sec-processing-model)<sup>2</sup>

一般而言，`name` + `attribution` 就可以基本定位出 `long task` 的来源：

- `name`：告诉我们来源是 `<script/>` 还是 `<iframe/>` ？`self` -> `<script/>`；`same-origin-xxx` + `cross-origin-xxx` -> `<iframe/>`
- `attribution`：到底是哪个 `<iframe/>`？

那么，`attribution` 究竟包含了哪些信息呢？

### `TaskAttributionTiming`

如上所属，`attribution` 的值是一些列 `TaskAttributionTiming` 的集合。

本质上，`TaskAttributionTiming` 拓展自 `PerformanceEntry`，具备了以下常见属性：

- `name`：当前只有 `"script"` 一种
- `entryType`：`"taskattribution"`
- `start`: `0`
- `end`: `0`

此外，`TaskAttributionTiming` 还具备了四个专有属性：

> 可以将下述字段中的 `container` 部分理解为，代码的执行环境。

- `containerType`：来源的类型，且和 `name` 字段直接关联。例如 `name: "self"`，那么值就是 `""`；`name: "same-origin-descendent"`，值就是 `iframe`。此外还可以是 `embed`，`object` 等；
- `containerName`：来源的 `name` 属性。例如 `<iframe name="frame"/>`；
- `containerId`：来源的 `id` 属性。例如 `<iframe id="frameId"/>`；
- `containerSrc`：来源的 `scr` 属性。例如 `<iframe src="/iframe/src"/>`。

> 出于隐私 + 安全的考量，`attribution` 受到了同源策略的限制。即当 `name` 是 `cross-origin-xxx` 时，`attribution` 中，上述四个 `container<token>` 专有字段对应的值均为 `""`。

> 当页面含有多个第三方 iframe ，定位 `long task` 问题时就需要其他手段的辅助。例如，对每个第三方 iframe 进行逐一排查；直觉？

## 怎么用

假设仅关注 `long task`：

```js
const observer = new PerformanceObserver(list => {
  list.getEntries().forEach(item => {
    // longtask 的类型
    console.log(`long task name is: ${item.name}`);
    console.log(`long task attribution is:`);
    // longtask 的具体信息
    console.log(JSON.stringify(item.attribution, null, 2));
  });
});
// 仅关注 longtask
observer.observe({ entryTypes: ["longtask"] });
```

> 截至至 2018-10-14，主流浏览器中，仅 Edge 不支持 `PerformanceObserver`。

## 兼容性

截止至 2018-10-14，只有 Chrome 58+ 实现了 `PerformanceLongTaskTiming` + `TaskAttributionTiming`。

## 总结

关于 `Long Task API`，

优点：

- 定位卡顿问题的来源是项目本身，还是第三方资源。

不足：

- 页面中有多个第三方 iframe 时，不好直接定位具体是哪个 iframe 导致的卡顿；
- 不能提供具体的代码信息，例如相关函数、代码位置等；
- 兼容性。

因此，在定位页面卡顿问题时，仅使用 `Long Task API` 可能是不够的：

如果发现是第三方的问题，那就推动第三方去解决；

倘若是项目自身问题，则需要借助其他性能相关的 API （例如 `Performance Timeline`），定位问题所在。

## 参考文章

1. [https://html.spec.whatwg.org/multipage/webappapis.html#concept-task](https://html.spec.whatwg.org/multipage/webappapis.html#concept-task)
1. [https://w3c.github.io/longtasks/#sec-processing-model](https://w3c.github.io/longtasks/#sec-processing-model)
