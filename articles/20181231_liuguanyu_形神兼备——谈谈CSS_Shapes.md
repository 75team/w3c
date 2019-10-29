![](https://p1.ssl.qhimg.com/t01839fe68123e2f451.png)

> 东风夜放花千树。更吹落、星如雨。宝马雕车香满路。凤箫声动，玉壶光转，一夜鱼龙舞。

> 蛾儿雪柳黄金缕。笑语盈盈暗香去。众里寻他千百度。蓦然回首，那人却在，灯火阑珊处。 ——宋.辛弃疾《青玉案.元夕》

### 引子

马上就要进入 9102 年的今天，仅仅借助于 CSS，Web 开发者就已经可以绘制出各种丰富多彩的图形了，而且方式还是多种多样的。比如下面的鹰嘴形，就可以用多种方式实现。

![](https://p5.ssl.qhimg.com/t01009da54ab5172edc.jpg)

```html
<span class="icon"></span> <span class="icon icon--blue"></span>
```

```CSS
.icon{
    display: inline-block;
    width: 60px;
    height: 100px;
    margin: 100px 30px;

    border-top: 30px solid #000;
    border-top-left-radius: 55px 60px;
}
.icon--blue{
    border-top-left-radius: 60px 70px;
    border-color: blue;
}
```

```CSS
.icon{
    display: inline-block;
    width: 60px;
    height: 100px;
    margin: 100px 30px;

    border-bottom: 60px solid transparent;
    border-left: 80px solid #000;
    border-top-left-radius: 100%;

    transform: rotateX(180deg) rotateZ(-90deg);
}
.icon--blue{
    border-left-color: blue;
}
```

看上去很完美。不过这些我们创建的图形，还不能影响图形内部和周围的内容排布。举个例子来讲，我们可以简单地在页面上创建一个三角形，但是也许无法控制周围的内容围绕这个三角形。

自从 7102 年，iPhoneX 引入“刘海屏”之后，异形屏的全屏适配交互也成为了前端的又一个课题。随之而来的各种适配交互方案，也是层出不穷。下面是一种很讨巧的方案。

![](https://p2.ssl.qhimg.com/t015ea548f527b835c0.gif)

这种在排布内容的问题可以使用 CSS 标准的 CSS Shapes 解决。特别地，针对上文提到的“刘海屏”的适配交互方案，张鑫旭老师的[这篇文章](https://www.zhangxinxu.com/wordpress/tag/css-shapes/)给出了解决方案的详细解析。

### 标准细节

[CSS Shapes 标准](https://www.w3.org/TR/css-shapes/)定义了可以被 CSS 属性值使用的图形描述方法。标准目前主要有两个版本。当前标准为第一版，第二版还在迭代过程之中。下图展示了第一版本的支持情况。

![](https://p2.ssl.qhimg.com/t01104dae01633d0753.png)

标准第一个版本主要包含 3 个属性：`shape-outside`，`shape-image-threshold`以及`shape-margin`

#### shape-outside

`shape-outside`可以实现内容能绕着不规则几何图形排列。比如，对于在世界杯年之后，即将出征亚洲杯的中国足球队，我们可以表达一下殷切的期望，鼓励下最早备战下届世界杯的这只球队。为此，我们可以让文字实现对一个圆形足球的围绕。

考虑下面的代码：

```html
<div class="football"></div>
<p>中国足球，何日出头</p>
<p>累了，但是还会爱下去</p>
<p>国足会武术，谁也挡不住</p>
```

首先我们考虑将`.football`变为圆形。

```CSS
.football {
    width: 100px;
    height: 100px;
    background-color: #fff;
	background-image: linear-gradient(45deg, black 25%, transparent 25%, transparent 75%, black 75%, black), linear-gradient(45deg, black 25%, transparent 25%, transparent 75%, black 75%, black);
    border-radius: 50%;
    border: 1px solid #ccc;
    background-size: 50px 50px;
    background-position: 0 0, 25px 25px;
    float: left;
}
```

这里，我们可以看到，虽然`.football`变成了圆形，但是并没有实现文字圆形环绕。实际上，还是一个矩形的区域。

![](https://p1.ssl.qhimg.com/t0155186ccdc318af41.png)

这时候，就需要`shape-outside`出马了。我们只需设置：`shape-outside: circle();`即可实现环绕。

![](https://p1.ssl.qhimg.com/t018e0475356583fb90.png)

目前，要求使用`shape-outside`的元素，必须使用浮动定位，今后随之标准的进一步完善，这个条件会弱化。

`shape-outside`的取值，可以有以下几种取值：

1. `circle`函数：定义一个正圆。可以指定半径和圆心位置。
   对于半径，只能接受非负数，负数不允许。默认地，使用短边作为直径。
   如果使用百分数，百分数的定义是 sqrt(width2+height2)/sqrt(2)。几何定义为：“对角线长度与单位面积对角线长度的比值”。
   有两个快捷值可以设置：`closest-side`和`farthest-side`
   圆心位置默认为中心，如果需要指定须以`at`引导的数据。此数据可以是百分数或这 center/left/right 的组合。
   完整的参数形如：`circle(100px at center 25%)`

2. `ellipse`函数：定义一个椭圆。和`circle`函数的参数大致一样。指定半径时候可以指定两个参数。椭圆函数的长轴和短轴只能在宽度方向和高度方向产生。如果指定的话，就是依次指定水平和垂直的半径。
   完整的参数形如：`ellipse(100px 200px at center 25%)`

3. `inset`函数：定义一个内部矩形。这个矩形可以把周围的内容放进去。参数有两个，一个是矩形的上右下左的百分比坐标，类似与`margin`的指定原则，但必须是百分数。第二个参数为这个矩形的 border 半径，以`round`引导。
   完整的参数形如：`ellipse(0% 66% 1% 1% round 50%)`

4. `polygon`函数：表示一个封闭的多边形区域。语法为：`polygon(X1 X1, ... , Xn Yn)`。意思是由 N 个点构成的多边形。Xi 和 Yi 代表每个顶点所示的坐标，坐标可为像素值或者百分比。`Xi,Yi`与`Xi+1,Yi+1`即为相邻顶点的边。`Xn,Yn`与`X1,Y1`也是连接的。

对于多边形，存在有多种填充逻辑，用于判定一个点在多边形的“内部”还是“外部”。目前标准支持两种，这与 SVG 标准一致。

`nonzero`：按该规则，要判断一个点是否在图形内，从该点作任意方向的一条射线，然后检测射线与图形路径的交点情况。从 0 开始计数，路径从左向右穿过射线则计数加 1，从右向左穿过射线则计数减 1。得出计数结果后，如果结果是 0，则认为点在图形外部，否则认为在内部。

![](https://s2.ssl.qhimg.com/static/421a3e2dd48187a1.svg)

上图中，白色认为在“外部”，红色认为在“内部”。

`evenodd`：按该规则，要判断一个点是否在图形内，从该点作任意方向的一条射线，然后检测射线与图形路径的交点的数量。如果结果是奇数则认为点在内部，是偶数则认为点在外部。

![](https://s4.ssl.qhimg.com/static/61782d6330bb41a9.svg)

上图中，白色认为在“外部”，红色认为在“内部”。

默认地，标准指定为`nonzero`。如果是`evenodd`可以在`polygon`函数中传第一个参数。

在实践中，我们一般指定各个顶点既可。下面的代码可以定义一个不规则的环绕多边形。

`shape-outside: polygon(88% 0, 90% 15%, 83% 22%, 93% 31%, 100% 36%, 72% 73%, 35% 75%, 19% 100%, 0 100%, 0 0);`
效果如图：
![](https://p2.ssl.qhimg.com/t01847a7ea6cfdaffe0.png)

这里有一个简单的[在线工具](http://betravis.github.io/shape-tools/polygon-drawing/)可以辅助计算想用的多边形形状。

#### shape-image-threshold

这个属性一般和`shape-outside`联合使用，此时，`shape-outside`的属性应设置为一张图片。此时，`shape-image-threshold` 用于从图像中提取形状的阈值。形状由 alpha 值大于此阈值的像素定义。

[Patrick Catanzariti](Patrick Catanzariti)在[这篇文章](https://www.sitepoint.com/css-shapes-breaking-rectangular-design/#shapes-from-images)给出了[一个例子](http://codepen.io/SitePoint/pen/kLjiv/)。

主要其作用的代码为：

```CSS
  shape-outside: url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/css-shapes-9.jpg);
  shape-image-threshold: 0.0;
```

此处需要注意：

1. 不能使用`file:`协议进行测试。
2. 注意同源策略。
3. 未来的协议可能会倾向使用图片数据的亮度来取代目前的 alpha 通道。为此会提供一个开关选项。未来同时兼容这两种值的时候，究竟是亮度还是 alpha 通道，取决于这个开关选项值的状态。

#### shape-margin

`shape-margin`表示在 CSS 形状的浮动区域周围添加空白区域来避免周围内容和形状区域重叠。下面的代码是一个使用的例子。

```CSS
.float {
    shape-outside: polygon(10px 10px, 90px 50px, 40px 50px, 90px 90px, 10px 90px);
    shape-margin: 10px;
}
```

下面的示意图中轮廓的蓝边就是这个`shape-margin`区域。

![](https://p0.ssl.qhimg.com/t015a042e32eb4bfc76.png)

`shape-margin`可以为：px、em、rem、百分比或者 calc()函数值。但必须为非负数。下面展示了几个可能的取值：

```CSS
shape-margin: 10px;
shape-margin: 1em;
shape-margin: 5%;
shape-margin: calc(2em - 1px);
```

### 展望

根据目前最新版本的[第二个版本标准的 editors’ draft](https://drafts.csswg.org/css-shapes-2/)来看，CSS Shapes 会考虑直接作用在块级元素而无须浮动、加强对 SVG 的支持，增加`shape-padding`支持，同时增加对`shape-inside`即图形内环绕的支持等等。可以预见，新标准的目标就是最终扩展现有的盒子模型从矩形到任意图形。这对于 Web 页面的丰富和创意的展现，都是特别值得期待的前景。
