6 月 6 日，W3C 发布了第一份滚动溢出行为工作组草案 CSS Overscroll Behavior Module Level 1。该草案定义 `overscroll-behavior` 去控制滚动视图滚动到边缘时的行为和效果

## 简介

在日常开发过程中，大家应该都见到过这么一个行为：子容器滚动条滚动到底，会带动父容器一起滚动。要解决这个问题，通常我们可以通过监听子容器的事件，然后调用 `preventDefault` 或是将父容器的 `overflow` 临时设置为 `hidden`。这种行为又称为连锁滚动（scroll chaining）。

在 CSS Overscroll Behavior 中，将使用 `overflow-behavior` 去完成相同的事情。

### overscroll-behavior 属性

#### contain

`contain` 属性值指定浏览器在任何层级的滚动中都可以出现连锁滚动的行为。但是对于滚动溢出的效果，让然使用不做修改。

例如左侧的导航栏，想让用户在将导航栏滚动到底部时不滚动副容器，则可以设置：

```css
.sidebar {
  overscroll-behavior: contain;
}
```

![](https://p5.ssl.qhimg.com/t01eb12b128cb3a8290.gif)

#### none

`none` 属性值的行为与`contain` 行为相同，除此之外，使用该属性值将不会使用溢出滚动效果（如 iOS 上的滚动溢出效果）。

#### auto

`auto` 是 `overscroll-behavior`的默认值，使用链式滚动行为，并且使用滚动溢出效果。

![](https://p4.ssl.qhimg.com/t01932c46014b308b99.gif)

#### overscroll-behavior 的长写法

`overscroll-behavior: contain` 会设定 x 与 y 方向为 `contain`，如果需要设定某一边的行为，可以使用 `overscroll-behavior-x` 以及 `overscroll-behavior-y`。

#### 文档流方向相关的长写法

`overscroll-behavior-inline` 和 `overscroll-behavior-block` 分别表示了 inline 和 block 方向上的设定，分别与 `overscroll-behavior-x` 或 `overscroll-behavior-y` 相对应，实际的对应关系与文档所设定的书写模式 `writing-mode` 有关。

## 参考资料

https://www.w3.org/blog/news/archives/7779

https://www.w3.org/TR/2019/WD-css-overscroll-1-20190606/