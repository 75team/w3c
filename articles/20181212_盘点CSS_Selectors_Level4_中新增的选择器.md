---
title: "盘点 CSS Selectors Level 4 中新增的选择器"
description: "CSS Selectors Level 4 changelog"
date: "2018-12-10"
authors: ["nimitzdev"]
tags: ["w3c", "css-selectors-level4", "css"]
---

## 前言

CSS 选择器在实践中是非常常用的，无论是在写样式上或是在 JS 中选择 DOM 元素都需要用到。在 CSS Selectors Level 4 中，工作组继续为选择器标准添加了更丰富的选择器。下面我们来了解一下。

## :is()

`:is` 是一个用于匹配任意元素的伪类，使用方法很简单，只需要将选择器列表传入即可，也就是说，`:is()`的结果也就是传入的选择器列表中选中的元素。

那么这个选择器有什么用呢？举个例子：我需要对不同层级下的`h1`标签设置不同的字体大小：

```css
/* Level 0 */
h1 {
  font-size: 30px;
}

/* Level 1 */
section h1, 
article h1, 
aside h1, 
nav h1 {
  font-size: 25px;
}

/* Level 2 */
section section h1, 
section article h1, 
section aside h1, 
section nav h1 {
  font-size: 20px;
}
```

会发现我们需要写很长的列表才能区分覆盖到不同层级中的 `h1` 标签，那么此时 `:is` 就派上了用场，前面说到，`:is`即代表着参数里面的选择选择器列表选择的元素，那么我们可以把上面的代码进行简化：

```css
/* Level 0 */
h1 {
  font-size: 30px;
}

/* Level 1 */
:is(section, article, aside, nav) h1 {
  font-size: 25px;
}

/* Level 2 */
section :is(section, article, aside, nav) h1 {
  font-size: 20px;
}
```

是不是一下子简洁了很多？是。

`:is`也可以直接看做是类似选择列表的语法糖，简化编写步骤，浏览器会自动将`:is`展开到简化之前的形式进行解析。

#### 使用`:is`时需要注意的

1. 遇到不支持的选择器

   通常，在遇到不支持的选择器时，浏览器会直接将整条规则丢弃。例如，当浏览器不支持`:unsupported`时，`:supported` 是不会生效的。

   ```css
   :supported, :unsupported {
       font-size: 12px;
   }
   ```

   而在`:is`中出现不支持的选择器，则是相反的行为，`:supported` 让然会被正确生效。

   ```css
   :is(:supported, :unsupported) {
       font-size: 12px;
   }
   ```

2. 选择器的权重

   整个`:is`选择器的权重由传入的选择器列表中的权重最高的选择器决定

   ```css
   :is(span, #id) {
       font-size: 12px;
   }
   ```

   `#id`选择器拥有 (1, 0 ,0) 的权重，而 `span` 只有 (0, 0, 1)，所以最终去匹配 `<span></span>`、`<div id="id"></p>`、`<span id="id"></span>`都是使用 (1, 0, 0) 的权重值。

3. 伪元素不能在`:is`中使用

#### 浏览器支持情况

![:is support](./css_matches_support.png)

> 这里查的数据是 `:matches`，`:matches` 即为 `:is` 的前身，在 CSS Selector Level 4 中，我们所熟知的`:not` 也支持选择器列表作为参数使用了，而功能上`:matches`则与`:not`是相对的，所以为了成对，`:matches`改名为`:is` 

## :where()

`:where` 选择器是 `:is` 选择器的无权重版本。前面提到，`:is` 的权重是由里边的选择器列表的最高权重决定的，`:where` 则不关心里边的权重，它的权重直接为0。

```css
.class:where(#id) {
    font-size: 12px;
}
```

如上面的例子，整个样式规则权重为 (0, 1, 0)，只有 `.class` 贡献了权重值。

> 在未来，`:where` 选择器可能会支持指定权重值的选项

## :scope

`:scope`选择器为它后面的选择器提供了参考点，在 CSS 中，默认 `:scope` 代表的即为 `:root`。而在使用 JavaScript 进行选择元素时，例如 `querySelector` 调用，可以用来限定选择器的选择范围。

```html
<div class="outer">
  <div class="select">
    <div class="inner">
    </div>
  </div>
</div>
```

```javascript
var select = document.querySelector('.select');
var inner = select.querySelectorAll('.outer .inner');
inner.length; // 1, 不是 0
```

你会发现，我本来只想查 `.select` 里面的 `.outer .inner`，这明显不符合预期，那么使用 `:scope` 可以解决此问题。

```javascript
var select = document.querySelector('.select');
var inner = select.querySelectorAll(':scope .outer .inner');
inner.length; // 0
```

## :any-link

该选择器用于选择所有包含`href`属性的链接，在 HTML5 中，这些链接包含 `a`、`area` 以及 `link` 标签。

## :local-link

`:local-link` 和 `:any-link` 的作用是相同的，但 `:local-link` 附加了一个限制，它只能选择到链接的绝对地址是和当前页面的域名相匹配的，也就是说，如果一个链接的`href`是站外链接，将不会被`:local-link`选择到。

## :target-within

我们都知道，在 URL 中可以用过 `#anchor` 的形式，让浏览器定位到`id`为`#anchor`或者`name`为`anchor`的锚点上， 当命中一个锚点时，我们可以使用`:target`选择到当前命中的那个元素。

现在有一个场景，我的某个`section`容器的边框需要在其里边的某个锚点命中时改变边框颜色，此时我们可以对这个容器使用`:target-within`选择到这个`section`，也就是说，这个`section`内部的某个元素必须能被`:target`选中。

## :focus-within

`:focus-within` 与 `:target-within` 的效果是相同的，但它仅在该容器元素内有元素被聚焦时能被选中，也就是说，这个容器内部的某个元素必须能被 `:focus` 选中。

## :focus-visible

当一个元素被聚焦，能被 `:focus` 选中并且浏览器需要在该元素上显示聚焦效果时（例如浏览器中输入框聚焦时默认显示的外框），该元素才能被这个选择器选中。

有了这个选择器，就能用于自定义聚焦样式。

## :dir()

该选择器用于根据语言的书写方向进行选择，例如常见的左到右书写形式（left-to-right）则可以使用 `:dir(ltr)` 进行选择；右到左的书写形式则可以使用 `:dir(rtl)` 进行选择。如果给定的值是 `auto`，那么会选中符合 `ltr` 或 `rlt` 顺序的元素。

## :blank

该选择器用于选择输入框值为空的元素。

## :user-invalid

该选择器用于选择未通过验证的输入框，例如在 `max` 和 `min` 范围之外的输入框，标明了`required` 但值为空的输入框。

## :indeterminate

该选择器用于选择状态未确定的元素，例如在 `radio` 和 `checkbox` 元素中，它们的值可以是是 `checked` 或者 `unchecked`，如果没有显式地设定，它们的状态都是未确定的。

## 时间线相关选择器

时间线相关的选择器用于在某些与时间进度相关的功能上使用，例如文字阅读器阅读的时间轴，或是在视频回放中用视频时间显示 WebVTT 字幕等。

### :current()

当前正在被阅读器阅读的元素或正在被显示的字幕。

```css
article:current(p) {
    background: yellow;
}
```

### :past()

已经被阅读过或显示过的元素。

### :future()

将要被阅读或显示的元素。

## 总结

通过丰富选择器的语法，可以使得我们在实践中更容易地去选择元素并确定样式。同时也能避免一些不必要的hack。

## 参考链接

- https://developer.mozilla.org/en-US/docs/Web/CSS/:is
- https://www.w3.org/TR/selectors-4/#changes-level-3