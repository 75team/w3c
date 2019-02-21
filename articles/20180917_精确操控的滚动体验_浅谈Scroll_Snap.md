> 本文作者，奇舞团前端开发工程师何文力，同时也是 W3C CSS 工作组成员

在最近更新的 Chrome 69 稳定版中，全面支持了 CSS Scroll Snap 标准。该标准用于设置一个滚动捕捉点，让最终的滚动位置附着于就近或特定类型的捕捉点中，以达到更好的滚动体验。今天我们就来研究一下。

## 浏览器支持情况

![](http://p5.qhimg.com/t014a8a6f8073cc56a0.png)

## 什么是捕捉

学过 CAD 系列软件的同学可能很清楚，我们在移动一个对象时，对象总能够自动吸附在栅格线上，使得对象只能落在栅格上的确定位置上，这就是栅格捕捉。或者这样说，在一个普通的量尺上，规定你的画笔只能落在 1mm 和 2mm 的刻度上，而不能落在他们之间。

## 什么是滚动捕捉

滚动捕捉，即在滚动时对滚动位置进行捕捉。我们先来看看 W3C 提供的两个例子：

例1：使用一系列图片堆放在一个横向的**可滚动容器**中形成一个类似相册的容器，通过使用基于元素的位置捕捉，使得滚动结束时某个图片的位置将始终落在滚动视口的中心位置。

```css
img {
    /* 指定每张图片的捕捉位置与滚动容器可视区域 x 轴中心的位置对齐 */
    scroll-snap-align: none center;
}
.photoGallery {
    width: 500px;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    /* 要求每次滚动的结束的位置精确地落在捕捉点上 */
    scroll-snap-type: x mandatory;
}
```

```html
<div class="photoGallery">
    <img src="img1.jpg">
    <img src="img2.jpg">
    <img src="img3.jpg">
    <img src="img4.jpg">
    <img src="img5.jpg">
</div>
```



![img](https://www.w3.org/TR/css-scroll-snap-1/images/element_snap_positions.png)

> 图中的红色区域即为可滚动容器的可视区域或叫捕捉视口。图片黄色框的地方被称为捕捉区域。我们上面设置的 scroll-snap-align 中指定了横轴捕捉点为中心位置。此时将在捕捉视口区域中心（红色虚线）以及捕捉区域中心（黄色虚线）形成捕捉点。

例2：在本例中，将一份分页的文档的滚动位置捕捉在每一页文档靠近滚动容器的地方。这种非精确的捕捉能够让上一页文档的末尾出现在捕捉点（容器边缘）的附近，让用户能够感知到还没有到达所有文档的最顶部的效果。并且使用非精确的捕捉能够让用户在滚动中途随时停止，而不会像精确捕捉一样会强制将滚动位置”修正“到捕捉点上。然而在使用非精确捕捉时，如果滚动结束点已经位于捕捉点的附近，浏览器将会将最终的滚动点修改为指定的捕捉点上。

```css
.page {
    /* 指定每一页文档的顶部为捕捉的位置 */
    scroll-snap-align: start none;
}
.docScroller {
    width: 500px;
    overflow-x: hidden;
    overflow-y: auto;
    /* 指定捕捉视口应有 100px 的上内边距 */
    scroll-padding: 100px 0 0;
    /* 使用非精确捕捉，能允许滚动最终停止在捕捉点的附近而不需要进一步的调整 */
    scroll-snap-type: y proximity;
}
```

```html
<div class="docScroller">
    <div class="page">Page 1</div>
    <div class="page">Page 2</div>
    <div class="page">Page 3</div>
    <div class="page">Page 4</div>
</div>
```

![img](https://www.w3.org/TR/css-scroll-snap-1/images/element_snap_positions_offset.png)

> 如上图所示，首先是确定捕捉视口，由于使用了 scroll-padding 我们的捕捉视口与滚动可视区域有一个上边距为 100px 的距离，通过使用 scroll-snap-align 确定了捕捉区域的捕捉点位于区域的纵轴开始的位置

好，做个小结，我们已经知道，要形成捕捉需要以下几个条件：

1. 是个可滚动的区域
2. 确定捕捉视口和捕捉区域的捕捉点

那么接下来我们就带着上面的例子来慢慢了解控制这些参数的几个属性吧

## 捕捉视口相关控制

### scroll-snap-type

通过设置 scroll-snap-type 将一个滚动容器转变为一个滚动捕捉容器，并且可以控制捕捉的严格度，如果没有指定严格度，默认为非精确的捕捉（proximity）。

scroll-snap-type 支持设置两个参数，第一个为捕捉轴向，第二个参数为捕捉严格度，可省略。

#### 捕捉轴向

捕捉轴向有x, y, block, inline 以及 both 数值。

> x: 捕捉影响捕捉视口 x 轴方向
>
> y: 捕捉影响捕捉视口的 y 轴方向
>
> block: 捕捉影响块轴方向
>
> inline: 捕捉影响行轴方向
>
> both: 捕捉分别影响所有方向

#### 捕捉严格度

> none: 不捕捉
>
> mandatory：精确捕捉
>
> proximity：非精确捕捉

例如：

```css
html {
    scroll-snap-type: y mandatory;
}
```

在文档的滚动捕捉中，捕捉视口对 y 轴方向进行精确捕捉。

### scroll-padding

scroll-padding 指定了捕捉视口的与滚动容器之间的内边距，能够使得开发者更好的控制进行捕捉的区域。scroll-padding 的参数与我们常见的 padding 参数形式相同，同时也有 padding 一样的 scroll-padding-top 等属性。

## 捕捉区域相关控制

### scroll-margin

scroll-margin 则是指定了捕捉区域与捕捉元素之间的边距。例如对捕捉区域设置了 scroll-margin: 20px; 那么实际上生成的捕捉区域会比捕捉元素的尺寸大。 scroll-margin 的参数与我们常见的 margin 参数形式相同，同时也有 margin 一样的 scroll-margin-top 等属性。

### scroll-snap-align

scroll-snap-align 属性指定了滚动区域和捕捉视口的捕捉位置，并且作为所有捕捉区域相对与捕捉视口的对齐位置。例如设置 scroll-snap-align 为 center 时，滚动区域的捕捉位置位于中心位置，捕捉视口的捕捉位置则为 scroll-snap-type 中指定方向的中心位置。

scroll-snap-align 可以分别设置 x、y 或是 行、块 方向上的捕捉对齐。如果第二个参数忽略，那么 x、y 方向的值均为第一个参数指定的值。

scroll-snap-align 可以有如下的属性值：

> none: 未定义
>
> start: 对齐开始位置
>
> end: 对齐结束位置
>
> center: 对齐中心位置

例如：

```css
.item {
    scroll-snap-align: none start;
}
```

## 小结

通过上面的例子我们可以清楚地看到，使用 CSS Scroll Snap 特性很好地把控了滚动结束的位置，将用户想看的内容立即展现出来。目前仅有部分浏览器完整得支持了最新的 CSS Scroll Snap 标准，期待其他大厂的加入。

## 致谢

感谢刘观宇对文章的纠错以及标题建议，感谢黄小璐对文章的纠错。

## 参考资料

1. https://www.w3.org/TR/css-scroll-snap-1/
2. https://webdesign.tutsplus.com/tutorials/how-to-scroll-snap-using-css--cms-30333

