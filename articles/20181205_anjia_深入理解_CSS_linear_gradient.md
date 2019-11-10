# 深入理解 CSS linear-gradient

渐变（Gradient）是 CSS3 引入的特性，其定义详见 [CSS Images Module Level 3](https://drafts.csswg.org/css-images-3/#gradients)。它本质上是一个 2D 图像，可以对 background-image、list-style-image 和 border 等进行细微着色。

语法是：

```js
<gradient> = <linear-gradient()> | <repeating-linear-gradient()> |
             <radial-gradient()> | <repeating-radial-gradient()> |
             <conic-gradient()>  | <repeating-conic-gradient()>
```

渐变会绘制到一个叫渐变框（gradient box）的矩形框里。渐变框有具体的大小，而渐变本身是没有固有尺寸的。

> 固有尺寸（intrinsic dimensions）是固有宽度、固有高度、固有宽高比的集合。对于特定的对象，这三个尺寸都有可能存在或者不存在。比如：光栅图像（image）同时拥有这三个，SVG image 只有一个固有宽高比，CSS 渐变就没有任何固有尺寸。

举个例子，理解下。

在下面的代码中，渐变框就是`.demo`容器的 padding box，宽 220px 高 120px。

```html
<style>
.demo {
    width: 200px; 
    height: 100px;
    padding: 10px;

    background-color: #eaeaea;
    background-image: linear-gradient(red, green);  /* 线性渐变 */
    background-repeat: no-repeat;
    background-position: center;
}
</style>

<div class="demo"></div>
```

如果你给 `.demo` 再增加一行下面的 CSS，那么，渐变框就变成了宽 50px 高 50px。
```css
.demo {
    background-size: 50px 50px;
}
```

如果你是增加的下面这行 CSS，那么，渐变框就变成了宽 440px 高 240px。
```css
.demo {
    background-size: 200% 200%;
}
```

同一个渐变，在渐变框大小不同时呈现的不同效果：

220px * 120px | 50px * 50px | 440px * 240px
:-------------------------:|:-------------------------:|:-------------------------:
![](https://p0.ssl.qhimg.com/t01fc15d1dd70d5deab.png) | ![](https://p0.ssl.qhimg.com/t01de3463381a6fb7f6.png) | ![](https://p1.ssl.qhimg.com/t01dd6a769bc3b9ef3a.png)



**理解 1. 渐变本身是没有固有尺寸的，虽然渐变框有具体大小**

要想指定一个渐变效果，只需定义这三个元素，即可：
- 渐变线（gradient line）
- 渐变线上的起始点（starting point）和结束点（ending point）
- 在起始点和结束点上的颜色值

这样，颜色就会平滑地填充渐变线上的其余部分。

不同的渐变类型，会定义如何使用渐变线上的颜色们来生成实际的渐变。

> 渐变类型，在几何上，可以是：
> - 线段（line）：对应 CSS 的线性渐变（linear gradient）
> - 射线（ray）：对应 CSS 的径向渐变（radial gradient）
> - 螺旋（spiral）：对应 CSS 的圆锥渐变（conic gradient）

**理解 2. 渐变三元素：渐变线、起始点和结束点、颜色序列**


本篇文章，先只聊最直观的线性渐变。

## 线性渐变

线性渐变就是指定一条直直的渐变线，然后再在这条线上放置几种颜色。在这种渐变类型下，创建 2D 图像的过程是：创建一个“无限”画布，用垂直于渐变线的线条来填充它，线条的颜色就取它和渐变线交点的那个颜色。

> 这里的“无限”是指渐变是可以无限大的，因为它本身是没有固有尺寸的。
> 之所以加引号“”，是因为在实际绘制中，渐变必然是被限制在一个有具体大小的渐变框里。

用一个例子来理解线性渐变创建 2D 图像的过程。

```css
.demo {
    width: 200px; height: 100px; padding: 10px;

    /* 线性渐变，颜色依次是：深粉色、黄色、柠檬绿*/
    background-image: linear-gradient(0deg, deeppink, yellow, lime);
}
```
以上代码绘制出来的效果，如下。图中，蓝色标出的就是渐变线，它通过渐变框的中心。
> 三条横线是参考线，可忽略

![](https://p5.ssl.qhimg.com/t0154aad82f56ac4506.png)

整个渐变图像是画了无数条垂直于渐变线的线条而成的。在脑补这个绘制过程时，我又冒出了两个问题：
- 渐变线上的颜色，生成规则是什么样子的？
- 渐变线本身，是怎么确定的？

这，就需要从线性渐变的定义说起。

### 语法

线性渐变的语法是：
```javascript
linear-gradient() = linear-gradient(
    [ <angle> | to <side-or-corner> ]?,
    <color-stop-list>
)

<side-or-corner> = [left | right] || [top | bottom]
```

`linear-gradient()`函数有两个参数：
1. 第一个参数定义了渐变线。它给出了渐变线的方向，缺省是`to bottom`。
2. 第二个参数定义了渐变线上的颜色序列。

### 渐变线的方向
渐变线的方向，可以用两种方式来指定：
- 用`<angle>`：0deg 即向上，正数表示顺时针方向旋转，所以 90deg 即向右。
- 用关键字
    - to top, to right, to bottom, to left，对应到`<angle>`分别是 0deg, 90deg, 180deg, 270deg
    - to left top 则是指渐变框的左上角

在渐变框的中心点处，建立平面极坐标系：中心点是极点，向上的射线是极轴。

当渐变线的方向分别是 0deg、60deg、300deg 时，效果分别是：

> 颜色序列均是：深粉色、黄色、柠檬绿

0deg | 60deg | 300deg
:-------------------------:|:-------------------------:|:-------------------------:
![](https://p0.ssl.qhimg.com/t0179dcefba37acf9ae.png) | ![](https://p0.ssl.qhimg.com/t01c7394fbc98db3c53.png) | ![](https://p1.ssl.qhimg.com/t015a41d68e38513a8b.png)


起始点和结束点，都在渐变线上。

结束点位置的确定，是依据渐变方向，选择和它在同一个象限的渐变框的顶点，从它作一条垂直于渐变线的线，交点即结束点。同理，在相反方向上可确定起始点的位置。

**理解 3. 结束点和起始点的位置确定规则**

值得一提的是，当渐变线的方向是指向渐变框的某个角（corner）时，情况会稍稍复杂一些。比如，当渐变方向是`to left top`时，如下图：

![](https://p4.ssl.qhimg.com/t01caa1dbee5de5d822.png)

第一反应，有没有觉得很奇怪？明明指定的渐变方向是`to left top`，为什么渐变线的方向却不是指向`left top`的呢？其实，这是有意为之的，是为了保证让渐变颜色的 50% 处恰好通过`left bottom`和`right top`这两点。

所以，当渐变方向是指向特定角（eg. `to left top`）时，渐变线的方向是：在渐变框的中心点处，做一条垂直于相邻角（`left bottom`和`right top`）连线的直线，取与指定方向（`to left top`）象限相同的那个方向。

**理解 4. 渐变线方向的两种指定方式，esp.当指向 corner 的时候**

### 渐变线上的颜色序列

渐变线上的颜色序列是用`<color-stop-list>`指定的。它的语法是：

```js
<color-stop-list> = <color-stop>#{2,}

<color-stop> = <color> <length-percentage>?
```

颜色的个数必须大于等于 2 个。`<color-stop>` 是颜色和位置的组合

这里，需要注意两点：

1. `<length-percentage>`的百分比，是针对渐变线的长度计算的
    - 渐变线的长度，是起始点和结束点之间的线段的长度
    - 它的计算公式是：`abs(W * sin(A)) + abs(H * cos(A))`
        - A 是渐变线的方向的角度
        - W 是渐变框的宽度
        - H 是渐变框的高度
    - 对其计算公式的推导感兴趣的朋友可以阅读 [Dig deep into CSS linear gradients](https://hugogiraudel.com/2013/02/04/css-gradients/)
2. `<length-percentage>`的取值，可以是 [0%, 100%] 之外的值
    - 原因：渐变本身是没有固有尺寸的，渐变线的两端也是可以无限延伸的
    - 起始点和结束点，只是渐变线上的两个有特殊意义的位置标识，而已

> 对于“颜色位置”的实例，这里就不展开讲了。有兴趣的朋友可以自行实践

**理解 5. 颜色序列的颜色位置，取值可以在区间 [0%, 100%] 之内，也可以在其之外**


## 总结
关于线性渐变，理解这五点：

1. 渐变本身是没有固有尺寸的，虽然渐变框有具体大小
2. 渐变三元素：渐变线、起始点和结束点、颜色序列
3. 渐变线方向的两种指定方式，esp.当指向 corner 的时候
4. 起始点和结束点的位置确定规则
5. 颜色序列的颜色位置，取值可以在区间 [0%, 100%] 之内，也可以在其之外


## 参考及更多

- https://drafts.csswg.org/css-images-3
- https://codepen.io/thebabydino/pen/qgoBL
