# [译] 揭开 ARIA 的神秘面纱

原文：https://www.a11ywithlindsey.com/blog/beginning-demystify-aria

当我在 [DEV](https://dev.to/) 上发布了[为什么可访问性不是边缘案例](https://dev.to/lkopacz/3-reasons-why-accessibility-is-not-an-edge-case-3da4)时，我收到一个评论，说希望可访问性更容易实现些。其实我还蛮好奇他们认为的难点是什么，因为我一直有在关注 HTML 和 CSS 的最佳实践，所以我自己没有觉得学习可访问性是有挑战的。当[对方回复](https://dev.to/marek/comment/882m)了之后，我了解到原来主要的痛点是 ARIA。

我看到很多关于 ARIA 的疑惑，比如什么时候该用它、什么时候不该用它、ARIA 的这些属性都是什么意思、所有的这些属性有一个列表吗、等等。我在考虑写一个关于 ARIA 的系列，可能每周写几个 ARIA 属性、如何使用它们、我是否喜欢它们等内容。在我了解所有的 ARIA 属性之前，我真的需要先聊聊 ARIA 的用途，以及我认为你不应该用它来做什么。


## ARIA 到底是什么
ARIA 是一组属性，你可以将它们添加到元素中，以赋予元素额外的上下文和含义。这对许多事情是很有用的。以下是我认为 ARIA 很有帮助的实例：

- 告诉你正在动态加载内容
- 提醒用户有重要的信息弹出
- 告诉屏幕阅读器状态变了
- 当有需要时添加一些额外的上下文

关于 ARIA 的文档实在是让人望而生畏。我学习 ARIA 的方法是：打开一个常用的应用程序，比如 Twitter。接着，检查元素，在 HTML 中搜索 aria 并查看所有属性。然后，打开屏幕阅读器，真正地听一下当我到达某个特定元素时，它是怎么朗读的。例如，当我在 Mac 上使用 VoiceOver 打开 Twitter 主页时，这是我右上角的个人资料图片对应的 HTML 标签：

```html
<a
  href="/settings"
  id="user-dropdown-toggle"
  role="button"
  aria-haspopup="true"
>
  <!-- Children Elements -->
</a>
```
**注意：为了方便阅读，我删除了一些属性和类**

这里有两个 ARIA 属性`role="button"`和`aria-haspopup="true"`。那么，当我使用屏幕阅读器时，这意味着什么呢。

首先，VoiceOver 说的是“配置文件和设置，弹出按钮”
![](https://p4.ssl.qhimg.com/t012fd47911b836b704.png)


接着，VoiceOver 说“你当前正在一个弹出按钮上，要显示选项列表，请按 Control-Option-Space”
![](https://p3.ssl.qhimg.com/t01d12b619dd766486b.png)


你会注意到单词“弹出按钮（Pop up button）”。如果该链接上没有这两个属性，它将会读成是一个链接`<a>`。老实讲，我认为用`<button>`标签更合适，因为在阅读时，我不能使用链接的`href`属性值`/settings`，它表现地就像一个按钮一样。知道它是一个弹层交互的上下文对屏幕阅读器非常有帮助。

我会说，当我第一次构建网页时，通常会犹豫是否要使用 ARIA。你可能已经注意到，我批评了这个标签的使用而会替换成另一个标签。除非有必要添加上下文，否则我会试图避免使用 ARIA。这就是为什么在我的技术文章中，从零编写的代码，最初的时候你都不会看到 ARIA 属性。我这么做的原因有很多...


## ARIA 不是什么
我在会议上第一次介绍 ARIA 的时候，出席的一位盲人开发人员质疑了我。这当然不好。是因为很多时候 ARIA 永远不应成为可访问性的焦点，特别是现在我们有 HTML5。HTML5 解决了屏幕阅读器过去常常面临的许多语义化问题。

ARIA 不是什么呢？它不是：
- 语义化 HTML 的替代品

呃...这是我能想到的全部。用个示例说明下我的意思。如果你不喜欢`<button>`的默认样式，但你喜欢它所有的内置功能，下面的 HTML 不会神奇地使所有按钮默认生效：

```html
<div role="button">
  Open Menu
</div>
```
假设上面的按钮有个点击事件。如果你有阅读我的文章[《改进键盘可访问性的3个简单提示》](https://www.a11ywithlindsey.com/blog/3-simple-tips-improve-keyboard-accessibility)，你就会知道，按钮内置了一些默认功能。如果不做任何其他操作，所有做的这些只是宣称这是一个带有屏幕阅读器的按钮。但是，你无法用键盘激活它。所以下一步是确保我们有一个`tabindex`。我们试试吧。

```html
<div tabindex="0" role="button">
  Open Menu
</div>
```

现在，我们可以使用点击事件了吗？我们来试试吧。给它取个 ID，方便 JS 定位：

```html
<div tabindex="0" id="button" role="button">
  Open Menu
</div>
```

现在，我将在这里编写一些基本的 JavaScript，看它是否有效。

```js
const button = document.getElementById('button')
button.addEventListener('click', () => alert('clicked!'))
```

![](https://p1.ssl.qhimg.com/t0186e100810e228f76.gif)
**说明：点击 div，会弹出一个 alert 框。然后按 tab 键时不能接收到焦点**

从 gif 图可以看出，ARIA 角色或`tabindex`并没有修复它。我们必须在按钮上监听一个按键事件。我要和你一起调试这个，这样我们就可以了解有多少额外的工作了。

```js
button.addEventListener('keypress', e => {
  console.log(e)
})
```

控制台输出的结果是：
![](https://p5.ssl.qhimg.com/t01bfac00c83bdfa78e.png)


考虑下我们在这里做了什么。我在按钮上添加了一个按键事件，并检查了事件对象中的属性。这很重要，因为如果我们想要复制一个按钮，我们必须记下当我们有按键事件时我们正在按什么键。内置的 HTML 按钮行为适用于按键 Enter 和空格键。当我们查看控制台日志时，我们想要使用`e.code`。所以我加个条件判断，将代码更新为：

```js
button.addEventListener('keypress', e => {
  if (e.code === 'Enter' || e.code === 'Space') {
    alert('pressed!')
  }
})
```

![](https://p3.ssl.qhimg.com/t01536be69149f123b0.gif)

虽然这不是最具挑战性的事情，但更容易将`<div>`变成一个`<button>`。您可以使用 CSS 来摆脱默认样式，总体而言，这将让你的生活更轻松易用！

## 结论
我喜欢考虑 ARIA 的方式是上下文（context）。有时你不需要额外的背景-- HTML 肯定是足够的。有时它可能会更好，特别是如果它是一个自定义小部件。关于特定属性及其作用，我将在未来对 ARIA 做更多的工作 - 主要是因为文档可能有点令人生畏。干杯！

如果你对此内容有疑问，请随时在 [Twitter](https://twitter.com/LittleKope/) 上与我联系！
