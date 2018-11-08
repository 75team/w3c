> 本文作者来自 360 奇舞团的前端开发工程师何文力，同时也是 W3C CSS 工作组的成员

## 现象

当我们在浏览一些使用自定义字体的网站，或在开发中使用 `@font-face` 设置自定义字体时，时常会看到一个现象：页面结构和图片出来了，但文字区域是空白的。这种现象被称之为 FOIT (Flash Of Invisible Text)。

![MSNBC on Firefox](https://p0.ssl.qhimg.com/t016eca2562bdbcc147.gif)

## 原因

通常，我们通过`@font-face`规则定义让浏览器加载使用第三方字体。这些写在 CSS 文件中的规则，浏览器必须待文件下载结束并解析之后才能开始下载字体文件。而要真正地触发字体文件下载，还要满足一些条件，根据 <u>Zach Leatherman</u> <sup>①</sup> 的这篇文章，要触发字体下载，还要满足以下的条件:

- 合法的 `@font-face` 规则，并且当前浏览器需要支持 `src` 列表中给出的格式
- 文档中有节点使用了 `@font-face` 中相同的 `font-family`
- 在 Webkit 和 Blink 引擎中，使用该 `font-family` 的节点不能为空
- 如果 `@font-face` 中指定了 `unicode-range`，出现的文字内容还必须落在设定的 Unicode 范围中

当上述所有条件满足，浏览器才会开始下载字体文件，这也意味着，浏览器不仅仅需要解析 CSS 内容，还要解析页面内容才能决定是否需要下载字体。当浏览器开始下载字体，使用了该 `font-family` 的所有文本被隐藏，导致页面出现文本空白的情况。

## 解决

在字体相关的 W3C 标准中，CSS Fonts Module Level 3 中的 `font-display` 属性以及 CSS Font Loading API 标准可以解决相关问题。

### font-display

`font-display` 属性添加于 CSS Fonts Module Level 3 中，已有大部分浏览器支持该属性。

![](https://p4.ssl.qhimg.com/t01529376ca7fe11cee.png)

`font-display ` 在 CSS 层面上提供了此类问题的解决方法，它提供了五个属性：

- auto：使用浏览器默认的行为；
- block：浏览器首先使用隐形文字替代页面上的文字，并等待字体加载完成再显示；
- swap：如果设定的字体还未可用，浏览器将首先使用备用字体显示，当设定的字体加载完成后替换备用字体；
- fallback：与 `swap` 属性值行为上大致相同，但浏览器会给设定的字体设定加载的时间限制，一旦加载所需的时长大于这个限制，设定的字体将不会替换备用字体进行显示。 Webkit 和 Firefox 中设定此时间为 3s；
- optional：使用此属性值时，如果设定的字体没有在限制时间内加载完成，当前页面将会一直使用备用字体，并且设定字体继续在后台进行加载，以便下一次浏览时可以直接使用设定的字体。

### CSS Font Loading API

除了 CSS 层面上解决问题，[CSS Font Loading API](https://drafts.csswg.org/css-font-loading/) <sup>②</sup> 在 JavaScript 层面上也提供了解决方案。通过监听加载事件，我们可以在字体加载完成后通过替换 class 达到 CSS 中 `swap` 属性值的效果。

浏览器支持方面也还是一般

`FontFace` 接口支持情况

![](https://p0.ssl.qhimg.com/t0133abb34eb0f8b560.png)

![](https://p5.ssl.qhimg.com/t01b3e1a2edb02eee82.png)

`FontFaceSet `接口支持情况

![css-font-loading-api-comp-fontfaceset](https://p2.ssl.qhimg.com/t01c3992c4f6cad8e29.png)

标准中主要提供了`FontFace`接口加载字体，并且 document.fonts 对象为一个 `FontFaceSet` 接口，他是一组`FontFace`的集合，管理了页面上所有字体的状态。

 `FontFace` 接受三个参数：`font-family` 名称、字体资源位置以及字体设定（可选）。

首先，要在 `JavaScript` 中加载字体，我们要`new`一个 `FontFace` 并将其添加到全局 `FontFaceSet` 中：

```javascript
const Aclonica = new FontFace('Aclonica', 'url(./Aclonica.ttf)');
// 添加到全局的 FontFaceSet 中
document.fonts.add(Aclonica);
```

第二步：调用 `FontFace` 的 `load` 方法开始加载，`load`方法将返回一个 `Promise`。当我们的字体加载完之后，就可以通过变换 class 的换上新字体。

````javascript
Aclonica.load().then(() => {
    // 当字体加载完之后，我们就可以通过替换 class 的方法替换掉默认的字体
    // 此处的逻辑也可以是你的字体渲染策略
    document.body.classList.add('use-aclonica');
})
````

```css
.use-aclonica {
    font-family: Aclonica;
}
```

## 不够完美

我们通过上述方法进行优化之后，虽然没有了 FOIT 现象，但是实际效果却是这样的：

![fout](https://p4.ssl.qhimg.com/t0127867e72e5061f66.gif)

我们发现，字体加载完之后页面还是不可避免地闪了，这是由于备用字体和定义的字体外形相差过大导致的视觉效果，这种现象又被称之为 FOUT (Flash Of Unstyled Text)。对于正在阅读文章的用户来说，显然不是很好的体验。

## 小结

CSS Fonts Module 以及 CSS Font Loading API 这两组标准都给前端字体无论在渲染上还是控制上赋予了更多能力，随着我们更深入地研究规范，相信会给字体加载以及渲染方面的问题带来更多的解决方案。

## 文内链接

① https://www.zachleat.com/web/comprehensive-webfonts/

② https://drafts.csswg.org/css-font-loading/

## 致谢

感谢李松峰老师对本文提出的修改建议