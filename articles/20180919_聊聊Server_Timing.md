# 聊聊 Server Timing

## 什么是 Server Timing

简单而言，一个请求周期内，服务器在响应过程中，每个步骤的耗时情况。

## 为什么要用 Server Timing

试想一个场景：某个列表页，loading 时间总是很长，被用户大量反馈。

通常情况，前端先“接锅”，被友好的询问“看看是不是渲染有问题，DOM 操作太多了吧”。

前端同学打开了自己的 IDE，开始了 console.log 大法，输出时间戳。

倘若发现渲染很快，那么有经验的前端会继续查看浏览器中提供的 Network，了解请求中，各个步骤的耗时情况（如下图所示）。

![Network](https://p1.ssl.qhimg.com/t01d7d54a5007a637c7.png)

经过几次尝试，发现 Waiting(TTFB) 耗费时间很长，于是初步判定为，服务端在进行某类操作时比较耗时，导致返回较慢。随后反馈给服务端开发，让其优化接口，至此流（甩）程（锅）完毕。

这个流程很常见。但是仔细想想，其实既繁琐，又被动。前端需要先查一遍，判断是不是自己的问题。如果不是前端问题，又需要服务端再排查一边。一趟下来，费时费力。

前端排查的流程，可以通过笔者之前介绍的 `User Timing` + `Performance Timeline` 进行优化，把性能监控常规化，主动统计渲染相关数据。通过这些数据，可以迅速确认是否存在渲染瓶颈。

至于服务端的排查，自然也有十分成熟的解决方案。不过，假如现在告诉你，不久的将来，前端也可以粗略定位出服务端的问题所在呢？是不是很刺激？

## 长什么样子

Server Timing 在实际应用中，最直观的体现在于返回头部。

以下头部信息选自 [https://www.w3.org/TR/server-timing/](https://www.w3.org/TR/server-timing/) <sup>1</sup>

```text
> GET /resource HTTP/1.1
> Host: example.com

HTTP/1.1 200 OK
Server-Timing: db;dur=53
```

## 结构含义

```text
Server-Timing: #server-timing-metric
```

`Server-timing` 的值由单个或多个 `server-timing-metric` 构成。

```text
server-timing-metric = metric-name *( OWS ";" OWS server-timing-param )
```

`server-timing-metric` 由 `metric-name` [+ 空白符 + `;` + 空白符 + `server-timing-param`] 构成。

```text
server-timing-param = server-timing-param-name OWS "=" OWS server-timing-param-value
```

`server-timing-param` 由 `server-timing-param-name` + 空白符 + `=` + 空白符 + `server-timing-param-value` 构成。

```text
Server-Timing: db;dur=53
```

上述例子中，

- `server-timing-metric` = `db;dur=53`；
- `metric-name` = `db`；
- `server-timing-param` = `dur=53`；
- `server-timing-param-name` = `dur`；
- `server-timing-param-value` = `53`

换成通俗的话语，上述头部告诉我们，服务器花了 53ms 去查询数据库。

> 假如，发现 `dur` > n 秒，那么就可以基本确（甩）定（锅）性能瓶颈在数据库查询上。

或许有读者会有疑问，光有个返回头部，难道每次还得主动在浏览器中，打开开发者工具，再通过 Network 看问题？好麻烦，哪里优秀了？

放心，在标准设计时，工作组已经考虑到了这点。前端工程师可以通过调用对应的 JavaScript API ，直接获取相关数据。

## 浏览器是如何处理的

W3C 性能小组设计了 `PerformanceServerTiming` 接口，用于记录 `Server Timing` 的信息。

针对每个 `Server-Timing` 字段：

- 创建一个 `PerformanceServerTiming` 对象；
- 将 `name` 属性设置为对应的 `metric-name`；
- 如果`server-timing-param-name` 是 `dur`（不区分大小写），将 `duration` 属性设置为 `server-timing-param-value`，否则设置为 `0`；
- 如果`server-timing-param-name` 是 `desc`（不区分大小写），将 `description` 属性设置为 `server-timing-param-value`，否则设置为 `""`；
- 将对象放入对应的 `entryList`。

> 流程针对 `Resource Timing` + `Navigation Timing` 中涉及的资源。
> `entryList` (全名为 `PerformanceEntryList`) 的含义参见 [https://www.w3.org/TR/performance-timeline-2/](https://www.w3.org/TR/performance-timeline-2/) <sup>2</sup>。

## 前端工程师如何使用

```js
// 设置时间限制
const limit = 200;
// 只从 navigation + resource 中筛选
["navigation", "resource"].forEach(type => {
  performance.getEntriesByType(type).forEach(({ name: url, serverTiming }) => {
    // 遍历 Server Timing
    serverTiming.forEach(({ name, duration, description }) => {
      if (duration < limit) return;
      console.log("find slow server-timing");
      console.log(
        JSON.stringify({ url, entryType, name, duration, description }, null, 2)
      );
    });
  });
});
```

## 隐私与安全

因为 `PerformanceServerTiming` 可以统计服务器的行为 + 信息，因此可能会暴露出一些敏感信息。针对这一点，`PerformanceServerTiming` 默认受到了同源政策的限制。

服务端可以通过在返回头部中添加 `Timing-Allow-Origin` 放开同源限制。此外，还可自行添加逻辑，决定对外暴露哪些 metric 信息。

## 浏览器支持

鉴于标准依然属于工作草案，截至到 2018-09-09，只有 Chrome 65+，Firefox 61+ 支持 `Server Timing`，依旧属于“黑科技”。

## 总结

`Server Timing` 给了前端统计服务端性能表现的能力。但是切记，如果没有服务端的配合（添加响应头部），前端还是什么都获取不到的（`performance.getEntriesByType("resource")[0].serverTiming` 会是空数组）。前端后端一家亲才是解决之道。

## 鸣谢

黄小璐和刘观宇在本文行文过程中提出了中肯建议，排名分先后（时间顺序），特此鸣谢。

## 文内链接

1. [https://www.w3.org/TR/server-timing/](https://www.w3.org/TR/server-timing/)
1. [https://www.w3.org/TR/performance-timeline-2/](https://www.w3.org/TR/performance-timeline-2/)
