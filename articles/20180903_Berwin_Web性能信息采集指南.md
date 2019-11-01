# 2018你应该知道的Web性能信息采集指南

假设您正在访问一个网站，如果Web内容不在几秒内显示在屏幕上，那么作为用户您可能会选择关闭标签页，转去浏览其他页面从而代替这个网页的内容。但是作为Web开发者，您可能希望跟踪**请求**与**导航**的详细信息，这样你就可以知道为什么这个网页的速度在变慢。

W3C性能工作组提供了可以用来测量和改进Web应用性能的用户代理（User Agent）特性与API。开发者可以使用这些API来收集精确的性能信息，从不同方面找出Web应用的性能瓶颈并提高应用的性能。

> 这些特性和API适用于桌面、移动浏览器以及其他非浏览器环境。

> 由于这些特性与API不止适用于浏览器，还适用于非浏览器环境，所以本文会大量使用“用户代理”这个词来代替“浏览器”

## 1. 如何获得高精度的时间？

ECMA-262 规范中定义了 `Date` 对象来表示自 1970 年 1 月 1 日以来的毫秒数。它足以满足大部分需求，但缺点是时间会受到时钟偏差与系统时钟调整的影响。时间的值不总是单调递增，后续值有可能会减少或者保持不变。

例如，下面这段代码计算出来的“`duration`”有可能被记录为正数、负数或零。

```javascript
const mark_start = Date.now()
doTask() // Some task
const duration = Date.now() - mark_start
```

上面这段代码获取的持续时间“duration”并不精准，它会受到时钟偏差与系统时钟调整的影响，所以最终得到的“duration”可能为正数、负数或零，我们根本不知道它记录的时间究竟是不是正确的时间。

高精度时间（High Resolution Time，简称`hr-time`）规范定义了`Performance`对象，通过`Performance`对象我们可以获得高精度的时间。

`Performance`对象包含方法`now`和属性`timeOrigin`：

* 方法`now`被执行后会返回从 `timeOrigin` 到现在的高精度时间。
    > *当前时间 - performance.timeOrigin*

* 属性`timeOrigin`返回[页面浏览上下文第一次被创建](https://html.spec.whatwg.org/multipage/browsers.html#creating-a-new-browsing-context)的时间。如果全局对象为`WorkerGlobalScope`，那么`timeOrigin`为worker被创建的时间。
    > timeOrigin 的时间值不受时钟偏差与系统时钟调整的影响。

    例如，当`timeOrigin`的值被确定之后，无论将系统时间设置到什么时间，下面代码始终返回`timeOrigin`最初被赋予的时间：

    ```javascript
    new Date(performance.timeOrigin).toLocaleString()
    // 2018/8/6 上午11:41:58
    ```

如果两个时间值拥有相同的时间起源（[Time Origin](https://w3c.github.io/hr-time/#dfn-time-origin)），那么使用 `performance.now` 方法返回的任意两个按时间顺序记录的时间值之间的差值永远不可能是负数。

例如，下面这段代码计算出来的“`duration`”永远不可能为负数。

```javascript
const mark_start = performance.now()
doTask() // Some task
const duration = performance.now() - mark_start
```

通过`performance.timeOrigin` + `performance.now` 可以得到精准的当前时间。该时间不受时钟偏差与系统时钟调整的影响。

> 不受时钟偏差与系统时钟调整的影响指的是当`timeOrigin`的值被确定之后修改了系统时间，这时候`timeOrigin`不会受到影响。

```javascript
const timeStamp = performance.timeOrigin + performance.now()
console.log(timeStamp) // 1533539552977.5718
new Date(timeStamp).toLocaleString()
// "2018/8/6 下午3:10:42"
```

## 2. 性能时间线（Performance Timeline）

在介绍如何获取性能指标之前，我们需要先介绍“性能时间线”，它提供了统一的接口来获取各种性能相关的度量数据。它是本文即将要介绍的其他获取性能指标方法的基础。

“性能时间线”本身并不提供任何性能信息，但它会提供一些方法，当您想要获得性能信息时，可以使用“性能时间线”提供的方法来得到您想获取的性能信息。

> 本文后面会详细介绍从“性能时间线”中可以访问哪些性能信息

### 2.1 扩展`Performance`对象

“性能时间线”扩展了`Performance`对象，新增了一些用于从“性能时间线”中获取性能指标数据的属性与方法。

下表给出了在`Performance`对象上新增的方法：

| 方法名               | 作用                                        |
|:------------------- |:-------------------------------------------|
| getEntries()        | 返回一个列表，该列表包含一些用于承载各种性能数据的对象，不做任何过滤 |
| getEntriesByType()  | 返回一个列表，该列表包含一些用于承载各种性能数据的对象，按类型过滤 |
| getEntriesByName()  | 返回一个列表，，该列表包含一些用于承载各种性能数据的对象，按名称过滤 |

表中给出了三个方法，使用这些方法可以得到一个列表，列表中包含一系列用于承载各种性能数据的对象。换句话说，使用这些对象可以得到我们想要获得的各种性能信息。

在术语上这个列表叫做`PerformanceEntryList`，而列表中的对象叫做`PerformanceEntry`。

不同方法的过滤条件不同，所以列表中的`PerformanceEntry`对象所包含的数据也不同。

### 2.2 `PerformanceEntry`对象

“性能时间线”定义了`PerformanceEntry`对象，该对象承载了各种性能相关的数据。下表给出了`PerformanceEntry`对象所包含的属性：

| 属性名               | 作用                                                |
|:------------------- |:----------------------------------------------------|
| name                | 通过该属性可以得到`PerformanceEntry`对象的标识符，不唯一  |
| entryType           | 通过该属性可以得到`PerformanceEntry`对象的类型                |
| startTime           | 通过该属性可以得到一个时间戳                                  |
| duration            | 通过该属性可以得到持续时间  |

从上表中可以发现，“性能时间线”并没有明确定义`PerformanceEntry`对象应该返回什么具体内容，它只是定义了一个格式，返回的具体内容会根据我们获取的性能数据类型的不同而不同。本文的后面我们会详细介绍。

### 2.3 `PerformanceObserver`

“性能时间线”还定义了一个非常重要的接口用来观察“性能时间线”记录新的性能信息，当一个新的性能信息被记录时，观察者将会收到通知。它就是`PerformanceObserver`。例如，可以通过下面代码定义一个长任务观察者：

```javascript
const observer = new PerformanceObserver(function (list) {
  // 当记录一个新的性能指标时执行
})
// 注册长任务观察者
observer.observe({entryTypes: ['longtask']})
```

上面这段代码使用`PerformanceObserver`注册了一个长任务观察者，当一个新的长任务性能信息被记录时，回调会被触发。

回调函数会接收到两个参数：第一个参数是一个列表，第二个参数是观察者实例。

在术语上这个列表被称为`PerformanceObserverEntryList`，并且包含三个方法`getEntries`、`getEntriesByType`、`getEntriesByName`。可以通过这三个方法获得`PerformanceEntryList`列表。这三个方法功能于使用方式均与前面介绍的相同。

## 3. 如何收集“资源加载”相关性能度量数据？

获取资源加载相关的时间信息可以让我们知道我们的页面需要让用户等待多久。下面这段简单的JavaScript代码尝试测量加载资源所需的时间：

```html
<!doctype html>
<html>
  <head></head>
  <body onload="loadResources()">
    <script>
      function loadResources() {
        const start = new Date().getTime()
        const image1 = new Image()
        const resourceTiming = function() {
          const now = new Date().getTime()
          const latency = now - start
          console.log('End to end resource fetch: ' + latency)
        }

        image1.onload = resourceTiming
        image1.src = 'https://www.w3.org/Icons/w3c_main.png'
      }
    </script>
    <img src="https://www.w3.org/Icons/w3c_home.png">
  </body>
</html>
```

虽然这段代码可以测量资源的加载时间，但它不能获得资源加载过程中各个阶段详细的时间信息。同时这段代码并不能投放到生产环境，因为它有很多问题：

* 在CSS中使用`@import url()`和`background: url()`加载的资源应该如何测量计时信息？
* 如何测量通过HTML标签元素加载的资源的计时信息？例如`link`、`img`、`script`
* 如果资源是通过`xmlhttprequest`请求的，如何测量资源的计时信息？
* 通过`fetch`方法请求的资源如何测量计时信息？
* 通过`beacon`发送的请求如何测量计时信息？
* 上面代码并不通用，如何测量所有资源的加载信息？
* 还有很多其他情况都无法测量

幸运的是，W3C性能工作组定义了[资源计时（Resource Timing）](https://w3c.github.io/resource-timing/)规范让Web开发者可以获取非常详细的资源计时信息。

下面这个例子可以获取更加详细的资源计时信息：

```html
<!doctype html>
<html>
  <head>
  </head>
  <body onload="loadResources()">
    <script>
      function loadResources () {
        const image1 = new Image()
        image1.onload = resourceTiming
        image1.src = 'https://www.w3.org/Icons/w3c_main.png'
      }

      function resourceTiming () {
        const resourceList = window.performance.getEntriesByType('resource')
        for (let i = 0; i < resourceList.length; i++) {
          console.log('End to end resource fetch: ' + (resourceList[i].responseEnd - resourceList[i].startTime))
        }
      }
    </script>
    <img id="image0" src="https://www.w3.org/Icons/w3c_home.png">
  </body>
</html>
```

上面代码通过`performance.getEntriesByType`方法得到一个列表，这个列表就是我们前面介绍的`PerformanceEntryList`，并过滤出所有类型为`resource`的`PerformanceEntry`对象。

类型为`resource`的`PerformanceEntry`对象在术语上被称为`PerformanceResourceTiming`对象。

`PerformanceResourceTiming`对象扩展了`PerformanceEntry`对象并新增了很多属性用于获取详细的资源计时信息，`PerformanceResourceTiming`对象的所有属性与其对应的作用如下表所示：

| 属性名               | 作用                                                |
|:------------------- |:----------------------------------------------------|
| name                | 请求资源的绝对地址，即便请求重定向到一个新的地址此属性也不会改变  |
| entryType           | `PerformanceResourceTiming`对象的`entryType`属性永远返回字符串“resource” |
| startTime           | 用户代理开始排队获取资源的时间。如果HTTP重定则该属性与`redirectStart`属性相同，其他情况该属性将与`fetchStart`相同 |
| duration            | 该属性将返回 `responseEnd` 与 `startTime`之间的时间 |
| initiatorType       | 发起资源的类型   |
| nextHopProtocol     | 请求资源的网络协议|
| workerStart         | 如果当前上下文是”worker”，则`workerStart`属性返回开始获取资源的时间，否则返回0 |
| redirectStart       | 资源开始重定向的时间，如果没有重定向则返回0 |
| redirectEnd         | 资源重定向结束的时间，如果没有重定向则返回0 |
| fetchStart          | 开始获取资源的时间，如果资源重定向了，那么时间为最后一个重定向资源的开始获取时间 |
| domainLookupStart   | 资源开始进行DNS查询的时间（如果没有进行DNS查询，例如使用了缓存或本地资源则时间等于fetchStart） |
| domainLookupEnd     | 资源完成DNS查询的时间（如果没有进行DNS查询，例如使用了缓存或本地资源则时间等于fetchStart） |
| connectStart        | 用户代理开始与服务器建立用来检索资源的连接的时间（TCP建立连接的时间） |
| connectEnd          | 用户代理完成与服务器建立的用来检索资源的连接的时间（TCP连接成功的时间） |
| secureConnectionStart | 如资源使用安全传输，那么用户代理会启动握手过程以确保当前连接。该属性代表握手开始时间（如果页面使用HTTPS那么值是安全连接握手之前的时间） |
| requestStart        | 开始请求资源的时间 |
| responseStart       | 用户代理开始接收`Response`信息的时间（开始接受`Response`的第一个字节，例如HTTP/2的帧头或HTTP/1.x的Response状态行） |
| responseEnd         | 用户代理接收到资源的最后一个字节的时间，或在传输连接关闭之前的时间，使用先到者的时间。或者是由于网络错误而终止网络的时间 |
| transferSize        | 表示资源的大小（以八位字节为单位），该大小包括响应头字段和响应有效内容主体（Payload Body） |
| encodedBodySize     | 表示从HTTP网络或缓存中接收到的有效内容主体（Payload Body）的大小（在删除所有应用内容编码之前） |
| decodedBodySize     | 表示从HTTP网络或缓存中接收到的消息主体（Message Body）的大小（在删除所有应用内容编码之后） |

由于有一些属性功能比较复杂，下面将针对一些功能比较复杂的属性详细介绍。

### 3.1 `initiatorType`

简单来说`initiatorType`属性返回的内容代表资源是从哪里发生的请求行为。

`initiatorType`属性会返回下面列表中列出的字符串中的其中一个：

| 类型                 | 描述                                                |
|:------------------- |:----------------------------------------------------|
| css                 | 如果请求是从CSS中的`url()`指令发出的，例如 `@import url()` 或 `background: url()` |
| xmlhttprequest      | 通过XMLHttpRequest对象发出的请求                      |
| fetch               | 通过Fetch方法发出的请求                               |
| beacon              | 通过beacon方法发出的请求                              |
| link                | 通过link标签发出的请求                                |
| script              | 通过script标签发出的请求                              |
| iframe              | 通过iframe标签发出的请求                              |
| other               | 没有匹配上面条件的请求                                 |

### 3.2 `domainLookupStart`

准确的说，`domainLookupStart`属性会返回下列值中的其中一个：

* 如果使用了持久连接（persistent connection），或者从相关应用缓存（[relevant application cache](https://html.spec.whatwg.org/multipage/offline.html#relevant-application-cache)）或从本地资源中获取资源，那么`domainLookupStart`的值与`fetchStart`相同
* 如果用户代理在缓存中具有域信息，那么`domainLookupStart`等于开始从域信息缓存中检索域数据的时间
* 用户代理开始对资源进行域名查询前的时间
* 其他情况为0

### 3.3 `domainLookupEnd`

`domainLookupEnd`属性会返回下列值中的其中一个：

* 与`domainLookupStart`相同，如果使用了持久连接（persistent connection），或者从相关应用缓存（[relevant application cache](https://html.spec.whatwg.org/multipage/offline.html#relevant-application-cache)）或本地资源中获取资源，那么`domainLookupEnd`的值与`fetchStart`相同
* 如果用户代理在缓存中具有域信息，那么`domainLookupEnd`为从域信息缓存中检索域数据结束时的时间
* 用户代理完成对资源进行域名查询的时间
* 其他情况为0

### 3.4 过程模型

下图给出了`PerformanceResourceTiming`对象定义的时序属性。当从不同来源获取资源时，括号中的属性可能不可用。用户代理可以在时间点之间执行内部处理。

![图1 PerformanceResourceTiming接口定义的时序属性](https://s4.ssl.qhres.com/static/f4c0b4e08ca42c99.svg)

图1 PerformanceResourceTiming 过程模型

## 4. 如何收集“网页加载”相关性能度量数据？

精准地测量Web应用的性能是使Web应用更快的一个重要方面。虽然利用JavaScript提供的能力可以测量用户等待时间（我们常说的埋点），但在更多情况下，它并不能提供完整或详细的**等待时间**。例如，下面的JavaScript使用了一个非常天真的方式尝试测量页面完全加载完所需要的时间：

```html
<html>
  <head>
    <script type="text/javascript">
      const start = new Date().getTime()
      function onLoad() {
        const now = new Date().getTime()
        const latency = now - start
        console.log('page loading time: ' + latency)
      }
    </script>
  </head>
  <body onload="onLoad()">
    <!- Main page body goes from here. -->
  </body>
</html>
```

上面的代码将计算在执行`head`标签中的第一行JavaScript之后加载页面所需的时间，但是它没有提供任何有关从服务端获取页面所需的时间信息，或页面的初始化生命周期。

对于这种需求，W3C性能工作组定义了Navigation Timing规范，该规范定义了`PerformanceNavigationTiming`接口，提供了更有用和更准确的页面加载相关的时间数据。包括从网络获取文档到在用户代理（User Agent）中加载文档相关的所有时间信息。

对于上面那个例子，使用Navigation Timing可以很轻松的用下面的代码做到并且更精准：

```html
<html>
  <head>
    <script type="text/javascript">
      function onLoad() {
        const [entry] = performance.getEntriesByType('navigation')
        console.log('page loading time: ' + entry.duration)
      }
    </script>
  </head>
  <body onload="onLoad()">
    <!- Main page body goes from here. -->
  </body>
</html>
```

上面代码通过`performance.getEntriesByType`方法得到一个列表，这个列表就是我们前面2.1节介绍的`PerformanceEntryList`，并过滤出所有类型为`navigation`的`PerformanceEntry`对象。

类型为`navigation`的`PerformanceEntry`对象在术语上被称为`PerformanceNavigationTiming`对象。

`PerformanceNavigationTiming`对象扩展了`PerformanceEntry`对象，通过该对象提供的`duration`属性可以得到页面加载所消耗的全部时间。

> PerformanceNavigationTiming 接口所提供的所有时间值都是相对于 Time Origin 的。所以 startTime 属性的值永远是0

通过该`PerformanceNavigationTiming`对象可以获得页面加载相关的非常精准的时间信息：

* name：当前页面的地址
* entryType：“navigation”
* startTime：`0`
* duration：页面加载所消耗的全部时间（`loadEventEnd`的时间减去`startTime`的时间）

`PerformanceNavigationTiming`对象扩展了`PerformanceResourceTiming`对象，所以`PerformanceNavigationTiming`对象具有`PerformanceResourceTiming`对象的所有属性，但是某些属性的返回值略有不同：

* initiatorType：“navigation”
* workerStart：页面开始注册Service Worker的时间

同时 NavigationTiming 新增了一些属性，下面列表给出了新增的属性：

| 新增的属性            | 描述                                                |
|:------------------- |:----------------------------------------------------|
| unloadEventStart    | 如果被请求的页面来自于前一个同源（同源策略）的文档，那么该属性存储的值是浏览器开始卸载前一个文档的时刻。否则的话（前一个文档非同源或者没有前一个文档）为0 |
| unloadEventEnd      | 前一个文档卸载完成的时刻。如果前一个文档不存在则为0 |
| domInteractive      | 指文档完成解析的时间，包括在“传统模式”下被阻塞的通过script标签加载的内容（使用defer或者async属性异步加载的情况除外） |
| domContentLoadedEventStart | DOMContentLoaded事件触发前的时间 |
| domContentLoadedEventEnd | DOMContentLoaded事件触发后的时间 |
| domComplete         | 用户代理将将`document.readyState`设置为`complete`的时间 |
| loadEventStart      | load事件被触发前的时间，如果load事件还没触发则返回0 |
| loadEventEnd        | load事件完成后的时间，如果load事件还没触发则返回0 |
| redirectCount       | 页面被重定向的次数 |
| type                | 页面被载入的方式 |

`type`属性的四种取值情况：

1. navigate：用户通过点击链接或者在浏览器地址栏输入URL的方式进入页面
2. reload：通过重新加载操作或`location.reload()`方法
3. back_forward：通过浏览器history的前进或后退进入页面
4. prerender：通过`prerender`的方式启动一个页面

### 4.1 过程模型

图2给出了`PerformanceNavigationTiming`对象的时序属性。当页面从不同来源获取时，括号中的属性可能不可用。

![图2 PerformanceNavigationTiming 过程模型](https://w3c.github.io/navigation-timing/timestamp-diagram.svg)

图2 PerformanceNavigationTiming 过程模型

从图2可以看出完整的页面加载时间信息包含很多信息。前端渲染相关的时间只占用很少的一部分（图2最后面两个蓝色部分`processing`与`onLoad`）。这也是为什么我们在一开始说使用JS埋点的方式去测量页面加载时间很天真。

## 5. 使用高精度时间戳来度量Web应用的性能

Web开发者需要一种能够**“评估与理解”**其Web应用性能的能力。虽然JavaScript提供了测量应用性能的能力（使用`Date.now()`方法获取当前时间戳），但这个时间戳的精度在不同的用户代理下存在一定的差异，并且时间会受到系统时钟偏差与调整的影响。

W3C性能工作组定义了User Timing规范，提供了高精度且单调递增的时间戳，使开发者可以更好地测量其应用的性能。

下面代码显示了开发者应该如何使用User Timing规范定义的API来获得执行代码相关的时间信息。

```javascript
async function run() {
  performance.mark("startTask1")
  await doTask1() // Some developer code
  performance.mark("endTask1")

  performance.mark("startTask2")
  await doTask2() // Some developer code
  performance.mark("endTask2")

  // Log them out
  const entries = performance.getEntriesByType("mark")
  for (const entry of entries) {
    console.table(entry.toJSON())
  }
}
run()
```

### 5.1 关于User Timing

User Timing规范扩展了`Performance`对象，并在`Performance`对象上新增了四个方法：

* mark
* clearMarks
* measure
* clearMeasures

#### 5.1.1 mark方法

mark方法接收一个字符串类型的参数（mark名称），用于创建并存储一个`PerformanceMark`对象。更通俗的说，mark方法用于记录一个与名称相关时间戳。

`PerformanceMark`对象存储了4个属性：

* name：mark方法的参数
* entryType：“mark”
* startTime：mark方法被调用的时间（`performance.now()`方法的返回值）
* duration：0

下面代码展示了如何使用`mark`方法：

```javascript
performance.mark('testName')
```

当使用`mark`方法存储了一个`PerformanceMark`对象后，可以通过前面介绍的`getEntriesByName`方法得到一个列表，列表中包含一个`PerformanceMark`对象。代码如下：

```javascript
const [entry] = performance.getEntriesByName('testName')
console.log(entry) // {"name": "testName", "entryType": "mark", "startTime": 4396.399999997811, "duration": 0}
```

### 5.1.2 clearMarks方法

顾名思义，`clearMarks`方法的作用是删除所有给定名称的时间戳数据（`PerformanceMark`对象）。

`clearMarks`方法接收一个字符串类型的参数（mark名称），例如：

```javascript
performance.mark('testName')
performance.clearMarks('testName')
performance.getEntriesByName('testName') // []
```

上面代码使用`mark`方法记录了一个名为`testName`的时间戳信息（存储了`PerformanceMark`对象），随后使用`clearMarks`方法清除名为`testName`的时间戳信息，最后尝试获取名为`testName`的时间戳信息时得到的是一个空列表。

### 5.1.3 measure方法

虽然`mark`方法可以记录时间戳信息，但是获得两个`mark`之间的持续时间还是有点麻烦，我们需要先获取两个`PerformanceMark`对象，然后再执行减法。

针对这个问题User Timing规范提供了`measure`方法，该方法的作用是使用一个名字将两个`PerformanceMark`对象之间所持续的时间存储起来。

`measure`方法的参数：

1. measureName：名称
2. startMark：mark名称
3. endMark：mark名称

与`mark`方法相同，`measure`方法会创建一个`PerformanceMeasure`对象并存储起来。`PerformanceMeasure`对象存储了4个属性：

* name：参数中提供的measureName
* entryType：“measure”
* startTime：`PerformanceMark`对象的`startTime`属性，如果没有提供`startMark`参数，则为0
* duration：两个`PerformanceMark`对象的`startTime`属性的差值，可能是负数。

下面代码展示了如何使用`measure`方法检测代码执行所持续的时间：

```javascript
async function run() {
  performance.mark('startTask')
  await doTask1() // Some developer code
  performance.mark('endTask')

  performance.measure('task', 'startTask', 'endTask')
  // Log them out
  const [entry] = performance.getEntriesByName('task')
  console.log(entry.duration)
}
run()
```

### 5.1.4 clearMeasures方法

与`clearMarks`类似，`clearMeasures`方法的作用是使用参数中提供的名称来删除`PerformanceMeasure`对象。

## 6. 如何知道“用户觉得网页慢”（如何检测长任务）？

保证UI的流畅很重要，那么如何检测UI是否流畅呢？

根据RAIL性能模型提供的信息，如果Web应用在100毫秒内的时间可以响应用户输入，则用户会觉得应用的交互很流畅。如果响应超过100毫秒用户就会感觉到应用有点轻微的延迟。如果超过1秒，用户的注意力将离开他们正在执行的任务。

由于JavaScript是单线程的，所以当一个任务执行时间过长，就会阻塞UI线程与其他任务。对于用户来说，他通常会看到一个“锁定”的页面，浏览器无法响应用户输入。

> 这种占用UI线程很长一段时间并阻止其他关键任务执行的任务叫做“长任务”
> 
> 更具体的解释是：超过50毫秒的事件循环任务都属于长任务

那么如何检测应用是否存在“长任务”呢？

一个已知的方式是使用一个短周期定时器，并检查两次调用之间的时间，如果两次调用之间的时间大于定时器的周期时间，那么很有可能有一个或多个“长任务”延迟了定时器的执行。

这种方式虽然可以实现需求，但它并不完美。它要不停的轮询去检查长任务，在移动端对手机电池寿命不友好，并且也没有办法知道是谁造成了延迟（例如：自己的代码 vs 第三方的代码）。

W3C性能工作组提供了Long Tasks规范，该规范定义了一个接口，使Web开发者可以监测“长任务”是否存在。

使用案例：

```javascript
const observer = new PerformanceObserver(function(list) {
  const perfEntries = list.getEntries()
  for (let i = 0; i < perfEntries.length; i++) {
    // 处理长任务通知
    // 上报性能检测数据
    // ...
  }
})
// 注册长任务观察者
observer.observe({entryTypes: ['longtask']})

// 模拟一个长任务
const start = Date.now()
while (Date.now() - start < 1000) {}
```

上面的代码注册了“长任务”观察器，它的功能是每当有超过50毫秒的任务被执行时调用回调函数。

2.3节介绍了`PerformanceObserver`，所以回调函数中的变量`perfEntries`保存了一个列表，列表中包含了所有承载了长任务数据的对象。

承载了长任务数据的对象在术语上被称为`PerformanceLongTaskTiming`。

`PerformanceLongTaskTiming`对象中保存了长任务相关的信息，包括以下属性：

* name：name属性提供了长任务的来源信息，通常返回“self”但也有一些其他来源信息
  * self：长任务来自自身frame
  * same-origin-ancestor：长任务来自一个同源的祖先frame（注册长任务观察者的页面被iframe到一个同源的其他页面时，我们叫这个其他页面为父级页面，如果这个父级页面出现了长任务，那么在子页面中的长任务观察者会得到通知，这时候name属性的值为`same-origin-ancestor`）
  * same-origin-descendant：长任务来自一个同源的后代frame（与`same-origin-ancestor`相反，如果当前页面注册了一个长任务观察者并iframe了一个其他页面，这时候iframe中如果存在长任务，则当前页面的长任务观察者会收到通知，这时候name属性的值为`same-origin-descendant`）
  * same-origin：长任务来自一个同源但无法访问的frame
  * cross-origin-ancestor：长任务来自跨域的祖先frame
  * cross-origin-descendant：长任务来自跨域的后代frame
  * cross-origin-unreachable：长任务来自跨域但无法访问的frame
  * multiple-contexts：长任务涉及多个frame（据我我测试，在当前页面注册的长任务观察者，并且在当前页面触发的长任务，但是这个页面是被iframe到另一个页面，然后父级页面的console中查看子页面打印的PerformanceLongTaskTiming对象的`name`属性为`multiple-contexts`）
  * unknown：上面这些情况都不符合
* entryType：属性必须返回“longtask”
* startTime：长任务开始的时间，该时间是相对于`Time Origin`的时间
* duration：长任务的持续时间
* attribution：一个数组，但长度永远等于1，里面是一个`TaskAttributionTiming`对象，该对象有以下属性：
  * name：现在name属性总是返回“script”，但未来name属性将用于标识布局，绘制等信息
  * entryType：总是返回“taskattribution”
  * startTime：总是返回0
  * duration：总是返回0
  * containerType：浏览上下文容器类型，例如：“iframe”，“embed”，“object”
  * containerName：浏览上下文容器名称
  * containerId：浏览上下文容器id
  * containerSrc：浏览上下文容器src

> frame指的是浏览上下文，例如iframe

## 7. 如何收集“首屏渲染”相关性能度量数据？

加载并不是一个单一的时刻，它是一种体验，没有任何一种指标可以完全捕获。事实上在页面加载期间有多个时刻可以影响用户将其视为“快”还是“慢”。

首次绘制（FP，全称First Paint）是第一个比较关键的时刻，其次是首次内容绘制（FCP，全称First Contentful Paint）。

这两个性能指标之间的主要区别在于“首次绘制”是当浏览器首次开始渲染任何可以在视觉上让屏幕发生变化的时刻。相比之下“首次内容绘制”是当浏览器首次从DOM中渲染内容的时刻，内容可以是文本，图片，SVG，甚至是canvas元素。

![速度度量](https://developers.google.com/web/fundamentals/performance/images/speed-metrics.png)
图3 首屏渲染指标

> ”首次绘制“（First Paint）不包括默认背景绘制（例如浏览器默认的白色背景），但是包含非默认的背景绘制，与iframe。

> ”首次内容绘制“（First Contentful Paint）包含文本，图片（包含背景图），非白色canvas与SVG。

> 父级浏览上下文不应该知道子浏览上下文的绘制事件，反之亦然。这就意味着如果一个浏览上下文只包含一个iframe，那么将只有“首次绘制”，但没有“首次内容绘制”。

可以通过下面代码获得首屏渲染性能指标数据：

```javascript
performance.getEntriesByType('paint')
```

通过上面这行代码可以得到一个列表。列表中包含一个或两个`PerformancePaintTiming`对象。这取决于“首次内容绘制”是否存在。如图4所示：

![获取首屏渲染指标](https://p4.ssl.qhimg.com/t018f71894b37e865ab.jpg)

图4. 获取首屏渲染指标

从图3可以看到`PerformancePaintTiming`对象包含四个属性，这四个属性的值为：

* name：如果是首次绘制则name为“first-paint”，如果是“首次内容绘制”则name为“first-contentful-paint”
* entryType：“paint”
* startTime：绘制发生的时间，该时间是相对于`time origin`的
* duration：0

我们可以使用下面的代码注册一个绘制观察器：

```javascript
const observer = new PerformanceObserver(function(list) {
    const perfEntries = list.getEntries()
    for (let i = 0; i < perfEntries.length; i++) {
        // 处理数据
        // 上报性能检测数据
        // ...
    }
})

// 注册绘制观察者
observer.observe({entryTypes: ["paint"]})
```

## 8. 总结

本文详细介绍了在Web应用中采集性能信息所需要的一些方法。其中包括：获得不受时钟偏差与系统时钟调整影响的高精度时间的方法、收集“页面资源加载”相关的性能度量数据的方法、收集“网页加载”相关的性能度量数据的方法、使用高精度时间戳在应用程序中埋点的方法、监测用户觉得网页“慢”的方法以及采集首屏渲染性能指标的方法。