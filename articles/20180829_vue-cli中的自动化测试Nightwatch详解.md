`vue-cli` 是我最喜欢的脚手架工具, 提供了很多开箱即用的功能, 每次新建一个项目, 我都会一路回车按下来, 唯独到这一步...

> **Setup e2e tests with Nightwatch?**

每到此处, 我都会无情的选择 **no**, 这也是我唯一不使用默认配置的选项

![](https://p4.ssl.qhimg.com/t01509f2fac08ee91af.png)

那我们真的不会用 e2e tests 吗?

先来看一下 e2e 测试和 unit 测试有什么区别


## 分层的自动化测试

敏捷大师 Mike Cohn 提出了**测试金字塔**概念, 认为测试应该系分为不同的粒度

Martin Fowler 大师在此基础上提出[分层自动化测试](https://martinfowler.com/articles/practical-test-pyramid.html)的概念, 也就是如图所示

![](https://p0.ssl.qhimg.com/t01ceeee856c147ab4b.png)

分层自动化测试是这样分层的

1. 单元测试 (unit tests)
1. 服务接口测试 (service tests)
1. 用户界面测试 (e2e tests)

单元测试和服务测试始终不是真实的使用场景, 真正能测到人机交互的只有UI测试

我们今天讨论的就是这个门槛最高, 成本也最大的金字塔顶端测试, 也称为 e2e 测试


## e2e 自动化测试

如何确定用户可以顺利走完流程呢? 一个流程可以很长

1. 打开网页
1. 浏览商品
1. 加入购物车
1. 下单确认
1. 付款

单纯依靠人力来测试完整功能非常耗时耗力, 这时候自动化测试就体现价值了

> 自动化测试是把人的测试行为转化为机器执行的程序, 可以提高效率, 解放生产力, 节省人力成本和时间成本, 降低人类易出错的风险

现代比较流行的 e2e 测试框架有

- Nightwatch
- TestCafe
- Protractor
- WebdriverIO
- Cypress

## vue-cli 中使用 Nightwatch

Nightwatch 是一个老牌的 e2e 测试工具, 中文名**"守夜者"**, 使用 [W3C WebDriver API](https://www.w3.org/TR/webdriver/) 协议来驱动浏览器

WebDriver 是各大浏览器都实现的通用标准, 这也使得它的兼容性特别好, 支持各大浏览器, 符合国情

如果在 vue-cli 中我们选择使用 e2e tests

vue-cli 会自动帮我们安装 `selenium-server` 和 `chromedriver` 等必要工具

哪怕你完全不懂 selenium, chromedriver 这些工具也可以尽情的写 e2e 测试, **开箱即用**

在不久前发布的 `vue-cli@3.0` 中添加 Nightwatch

```sh
$ vue add @vue/e2e-nightwatch
```

运行 e2e 测试

```sh
$ vue-cli-service test:e2e
```


## 纯净的 WebDriver

要注意的是, vue-cli 目前依赖的还是 Nightwatch@0.9.x

我们看到 vue-cli 安装的 Nightwatch 会依赖一个 Selenium Server, 一个 java 程序

![](https://p1.ssl.qhimg.com/t0193625587f226b230.png)

从官方示意图中看出, Nightwatch 和浏览器需要通过 Selenium Server 来通信

这让我们 js 程序员有点不爽, 既然 WebDriver 已经成为 W3C 推荐标准, 为什么不能跳过 Selenium 直接驱动浏览器呢?

答案是肯定的, 这也正是 Nightwatch@1.0 所做的是事情, **直接驱动浏览器**

## Nightwatch@1.0

Nightwatch@1.0 可以直接驱动浏览器, 因此我们直接安装 Nightwatch@1.0 即可, 无需 Selenium Server

```sh
$ npm install nightwatch@1.0.8
```

我们一起来学男朋友叫, 哦不~一起来写一个最迷你的端到端自动化测试

首先 Nightwatch 需要一个配置文件 `nightwatch.conf.js`

```js
module.exports = {
  "webdriver": {
    "server_path": "/usr/bin/safaridriver", // 浏览器 driver 的 bin 执行路径
    "start_process": true, // 需要启动 driver
    "port": 9515 // driver 启动的端口, 一般是 9515 或 4444
  },
  "test_settings": {
    "default": {
      "desiredCapabilities": {
        "browserName": "safari" // 浏览器的名字叫 safari
      }
    }
  }
}
```

此处之所以使用 `safaridriver` 是因为 mac 系统已经内置了 safaridriver, 零安装成本

然后来写一个简单易懂的测试脚本 `e2e.test.js`

```js
module.exports = {
  'Basic e2e Test' (browser) {
    browser
      .url('http://so.com') // 打开 so.com 网页
      .waitForElementVisible('body') // 确认能看到 body 元素
      .setValue('#input', 'Nightwatch') // 在搜索框输入 Nightwatch
      .click('#search-button') // 点击搜索
      .pause(1000) // 等待1秒钟
      .assert.containsText('#container', 'Nightwatch') // 查询结果包含 Nightwatch
      .end()
  }
}
```

执行一下看测试结果

```sh
$ nightwatch basic-e2e.test.js

[Basic e2e Test] Test Suite
===========================
Running:  Basic e2e Test

✔ Element <body> was visible after 17 milliseconds.
✔ Testing if element <#container> contains text: "Nightwatch".

OK. 2 assertions passed. (3.419s)
```

测试通过, 嗨皮😜

## 各大浏览器 driver 安装

如果想用其他浏览器进行测试, 本文也列出了主流浏览器 driver 的下载地址

> 驱动浏览器的程序, 我们称为 driver

- Chrome Driver: <http://chromedriver.chromium.org/>
- Firefox GeckoDriver: <https://github.com/mozilla/geckodriver>
- IE Driver: <https://github.com/SeleniumHQ/selenium/wiki/InternetExplorerDriver>, 支持IE7-IE11
- Opera Driver: <https://github.com/operasoftware/operaprestodriver>
- Safari 自带 SafariDriver: <https://webkit.org/blog/6900/webdriver-support-in-safari-10/>

要注意的是, vue-cli 目前绑定的还是 Nightwatch@0.9.x, 但 Nightwatch@1.0 已经在 beta 阶段了, vue 作者表示等到 Nightwatch 稳定后就会切到 1.0, 相信不远的将来我们会见到搭载 Nightwatch@1.0 的 vue-cli
