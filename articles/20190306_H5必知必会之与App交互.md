# H5必知必会之与App交互

2018年11月26日发表的“[360 AI音箱H5开发实践](https://github.com/75team/w3c/blob/master/articles/20181126_360AI%E9%9F%B3%E7%AE%B1H5%E5%BC%80%E5%8F%91%E5%AE%9E%E8%B7%B5.md)”一文中，曾简单提到“与Native交互”。本文将就此主题深入探讨H5与App交互的几种常见模式。

首先声明，本文涉及的H5与App交互协议和模式没有什么特别独到之处，相反，它们恰恰是在业界既有经验基础上结合项目实际归纳提炼出来的。因此，文中涉及的技术和代码可以看作是行业经验落地的产物，不涉秘，也不是权威做法，仅供业界同仁参考。

本文内容如下：

- 概述
- 基础接口
- 单向调用
- 双向调用
- 实现模式
- 哪方主导

## 1. 概述

H5，在中国被专门用来指代开发内嵌于手机应用中的网页的技术，外国好像并没有这个说法。从技术上讲，H5是HTML5即Hyper Text Markup Language（超文本标记语言）第5版的简称。而HTML只是开发网页要用到的多种技术之一。除了HTML，还要用CSS设计界面，用JavaScript实现交互，甚至要用Node.js实现服务端逻辑。为什么H5会被用来笼统地指代这些技术呢？我猜一是因为它简单，二是移动端网页开发技术又恰好需要这么一个概念。

移动端网页运行在手机应用内嵌的浏览器引擎中，这个没有UI的内核容器统称WebView，即[iPhone的UIWebView](https://developer.apple.com/documentation/uikit/uiwebview)（iOS 2.0–12.0）、[WKWebView](https://developer.apple.com/documentation/webkit/wkwebview)（iOS 8.0+，macOS 10.10+）和[Android的WebView](https://developer.android.com/reference/android/webkit/WebView)。总之，WebView就是在手机应用中运行和展示网页的界面和接口（神奇的是，英文Interface，既可以翻译成“界面”也可以翻译成“接口”）。

H5与原生应用的交互都是通过原生应用中的WebView实现的。通过这个环境，H5可以调用原生应用注入其中的原生对象的方法，原生应用也可以调用H5暴露在这个环境中的JavaScript对象的方法，从而实现指令与数据的传输。

比如，在Android应用中，`WebView`类有一个公有方法`addJavascriptInterface`，签名为：

```java
public void addJavascriptInterface (Object object, String name)
```

调用这个方法可以向WebView中以指定的名称`name`注入指定的Java对象`object`。这样，WebView中的JavaScript就可以通过`name`调用`object`的方法。比如：

```java
 class JsObject {
    @JavascriptInterface
    public String toString() { return "injectedObject"; }
 }
 webview.getSettings().setJavaScriptEnabled(true);
 webView.addJavascriptInterface(new JsObject(), "injectedObject");
 webView.loadData("", "text/html", null);
 webView.loadUrl("javascript:alert(injectedObject.toString())");
```

在iOS或macOS中，需要通过创建`WKWebView`类的实例在应用中嵌入网页，交互过程类似。

## 2. 基础接口

所谓基础接口，就是首先要规定原生应用和JS分别在WebView里注入/暴露一个什么对象：

- `NativeBridge`：原生应用注入到WebView中的对象
- `JSBridge`：JS暴露在WebView中的对象

并约定在这两个对象上分别可以调用什么方法：

- `NativeBridge.callNative(action, params, whoCare)`
- `JSBridge.callJS(action, params, whoAmI)`

顾名思义，`NativeBridge.callNative`是由JS调用向Native传递指令或数据的方法，而`JSBridge.callJS`则是由Native调用向JS传递指令或数据的方法。方法签名中的参数含义如下：

- &nbsp;`action`：字符串，希望Native/JS执行的操作
- &nbsp;`params`：JSON对象，要传给Native/JS的数据
- &nbsp;`whoCare`：数值，表示JS希望哪个端响应
- `whoAmI`：数值，表示哪个端调用的JS

基础接口只有两个对象和两个方法，JS与App间的互操作则通过`action`和`params`来扩展和定义。

## 3. 实现模式

对于JS而言，虽然这里只定义了一个对象一个方法，但实践中，可以把`action`对应方法的实现附加到`JSBridge`上，只要把`callJS`实现为一个分发方法即可，比如：

```javascript
window.JSBridge = {}
window.JSBridge.callJS = function({action, params, whoAmI}) {
  return window.JSBridge[action](params, whoAmI)
}
```

这样，所有对`callJS`的调用，都会转化成对`JSBridge`上相应`action`方法的调用，优点是只需一行代码。

另一种实现方式是通过`switch...case`语句实现调用分发，比如:

```javascript
function callJS (action, params, whoAmI) {
  params = JSON.parse(JSON.stringify(params))
  switch (action) {
    case 'showSkill':
      const category = params.category
      JSBridge.showSkill(category)
      break
    case 'showSkillDetail':
      const id = params.id
      JSBridge.showSkillDetail(id)
      break
    case 'otherAction':
      // some code
      break
    default:
  }
}
// JS暴露给应用的通用接口
const SpkJSBridge = {}
// 全部接口
JSBridge.callJS = callJS
```

这样实现的优点是所有方法一目了然，当然同样也是把所有相关接口都附加到同一个`JSBridge`对象上。

以上两种实现模式各有利弊。

## 4. 单向调用

由JS发起的单向调用App的操作，主要涉及加载URL和切换到原生界面，可对应如下`action`：

- `loadUrl`：加载另一个URL
- `loadContent`：跳转到原生界面

`loadUrl`调用的参考协议如下：

```js
NativeBridge.callNative({
    action: 'loadUrl',
    params: { url },
    whoCare: 0
})
```

这里`NativeBridge`是App的原生对象，其`callNative`方法被调用时，会收到一个对象（字典/映射）参数。根据这个参数的`action`属性的值，App可知需要执行的操作是加载URL。于是再取得`params`属性中的`url`，发送请求即可。

`loadContent`调用的参考协议如下：

```javascript
NativeBridge.callNative({
  action: "loadContent",
  params: {
    type: "album",
    content: {
      album_id: "1"
    }
  },
  whoCare: 0
})
```

同上，这里通过`params`向App传递了必要参数，App负责切换到相应的原生界面。

由App发起的单向调用JS的操作，主要涉及用户点击后退按钮（<），可对应如下`action`：

- `can_back`：询问JS是否返回前是否需要用户确认

`can_back`调用的参考协议如下：

```javascript
JSBridge.callJS({
  action: "can_back",
  params: {},
  whoAmI: 1/2
})
```

此调用返回的值示例如下：

```javascript
{
  can: true,
  target: "prev"
}
```

顾名思义，`can_back`用于App询问JS：在返回上一级界面前，是否弹窗提示用户？

返回值中的`can`如果是`true`，则直接返回，不提示；如果是`false`，则弹出一个确认框，请用户确认。另一个值`target`是与App约定的返回目标，比如`prev`表示返回上一级，`top`表示返回顶级，等等。

## 5. 双向调用

双向调用是JS先调用App，然后App在完成操作后再调用JS，双向通常都需要传递数据。双向调用主要涉及JS调用App原生组件和用户点击右上角按钮，可对应如下`action`：

- `loadComponent`：调用原生组件
- `displayNextButton`：显示“下一步”“保存”或“完成”按钮

`loadComponent`的参考协议如下：

```javascript
NativeBridge.callNative({
  action: 'loadComponent',
  params: {
    type: 'location',
    value,
    callbackName: 'set_location'
  },
  whoCare: 0
})

```

在这个例子中，涉及JS调用App显示其实现的城市选择组件：`type: 'location'`，用户选择完城市之后，App再调用`set_location`，将用户选择的城市名称传给JS：

```javascript
JSBridge.callJS({
  action: 'set_location',
  params: {
    value: '北京市朝阳区',
  },
  whoAmI: 1/2
})

```

JS根据拿到的值更新界面，完成一次双向调用。另一个例子是JS调用原生的日期选择组件，与此类似。

为什么叫`displayNextButton`？因为根据具体业务场景，可能存在如下三种情况：

1. 当前WebView不需要显示右上角按钮，比如详情页；
2. 当前WebView需要显示“下一步”或“保存”按钮，但需要禁用变灰；
3. 当前WebView需要显示“下一步”或“保存”按钮，允许用户点击。

`displayNextButton`协议的参考实现如下：

```javascript
NativeBridge.callNative({
  action: "displayNextButton",
  params: {
    name: "下一步",
    enable: false,
    callbackName: "save_form"
  },
  whoCare: 0
})

```

以上代码示例表明，JS调用App，告诉App显示“下一步”按钮，但是要禁用变灰，因为`enable: false`。如果传递的是`enable: true`，那么用户就可以点击“下一步”按钮了。点击之后，App再调用JS的`save_form`。最后，如果不想显示按钮，可以传递`name: ''`。

下面重点说一下用户点击“下一步”按钮，App调用`save_form`的场景。此时也分两种情况：

1. JS直接保存数据
2. JS通过App保存数据

如果是JS通过App保存数据——可能因为App端实现了数据写入必需的加密机制——那么，JS可以在App调用`save_form`时将约定好的数据返回给App，由App去保存数据。

如果是JS直接保存数据，比如通过Ajax，那么在保存完数据之后，则还需要调用前面所说的App暴露的`loadUrl`或`loadComponent`方法，以告知App切换界面。当然这种情况下会出现第三次调用，但仍然属于双向调用。

## 6. 哪方主导

本文介绍了JS与App交互的几种模式，而且只讨论了JS端的实现。在开发实践中，团队各端总会面临哪一端主导的问题。本文展示的参考实现就是H5端主导的一种实现形式。H5主导的特点是把主要业务逻辑都封装到WebView中，App主要协同配合，而优点是业务逻辑的变更不会蔓延到App。毕竟相对于H5，App的安装部署模式会造成多版本共存问题，需要尽可能控制新版本。假如由App端主导，将逻辑封装在App端，势必造成版本不受控，给整个项目或产品埋下隐患。

当然，事无绝对。具体情况还要具体分析。而且，哪方主导有时候也取决多方面因素。实践中还是要因人、因时、因势制宜。

