# Filter Effects in Web (1)：CSS filter

过滤器效果可以在元素展示之前对元素的渲染进行处理。它是基于图片的效果，主要接受0或多个图片作为输入，然后指定特定的效果参数，最后生成一张图片作为输出。输出的图片会替代原始元素在DOM中渲染，或者被当做一个CSS图片值。

虽然过滤器效果一开始是为了SVG而设计的，但是在CSS中，我们也同样可以使用(通过`filter`属性)。

本文主要介绍的就是这一部分，CSS中的filter效果。后续我会再给大家介绍一下SVG中的filter效果。

## CSS中的`filter`属性

在CSS中，我们可以通过`filter`属性使用过滤器效果。该属性可以应用在CSS中的任何元素上，除此之外，还可以应用在SVG中的容器元素（除`<defs>`外）、图形类元素（如`circle`、`polyline`等）以及`<use>`元素上。

`filter`值的格式为：`filter: none | <filter-value-list>`。

其中`none`表示无过滤器效果。`<filter-value-list>`等于`[ <filter-function> | <url> ]+`。`<filter-function>`是filter属性预设的效果函数，后面会详细介绍。`<url>`表示引用svg中的`<filter>`元素。如`url(commonfilters.svg#filter)`。如果引用的内容不存在或者不是一个filter元素，则忽略该引用。这一部分的细节我们会在下一篇SVG filter中详细介绍。

当元素的`filter`不为`none`时，会创建一个堆叠上下文，这对元素的层叠会产生影响。如下所示，对图中图片一应用`drop-shadow`filter效果，其层级会覆盖在图片二的原图之上。

![](http://p0.qhimg.com/t01ede1f1d2095f34dd.png "图1 filter效果会生成堆叠上下文")

> 如果你对于CSS中元素的层级有什么疑问，可以参考我之前写的另一篇文章[《 CSS的“层”峦“叠”翠 》](https://github.com/75team/w3c/blob/master/articles/20190225_CSS%E7%9A%84%E2%80%9C%E5%B1%82%E2%80%9D%E5%B3%A6%E2%80%9C%E5%8F%A0%E2%80%9D%E7%BF%A0.md)。这篇文章会向你解释什么是层叠上下文，元素之间如何决定堆叠顺序。

## 预设的filter效果函数
CSS中预设的filter效果函数包括：`blur()`、`brightness()`、`contrast()`、`drop-shadow()`、`grayscale()`、`hue-rotate()`、`invert()`、`opacity()`、`saturate()`、`sepia()`。

需要注意的是，对于这些效果函数，初始值和缺省值（指定了函数但未传值）并不都是一样的。如`grayscale()`、`sepia()`、`invert()`当参数缺省时，值为`1`，等价于100%的效果，而它们的初始值是`0`。更需要的注意的是，这几种特殊情况在不同浏览器中表现并不一样，所以在使用时大家不要偷懒写了函数却不传值。

### `blur()`高斯模糊

`blur()`向元素应用高斯模糊。该函数语法格式为：`blur( <length>? )`，接受一个长度值，不接受百分比，表示模糊半径。不接受负值，初始值和缺省值都是`0px`。

如下图所示，我们给图片元素应用了`filter: blur(5px);`。

![](http://p9.qhimg.com/t01aabd6177e6167777.png)

### `brightness()`明亮度

`brightness()`改变元素的明亮度。其语法格式为：`brightness( <number-percentage>? )`，值为数字或百分比。`0%`会将图片变为全黑，`100%`表示保持原样。初始值与默认值均为`1`。无效值或者负值均被视为`1`。大于1的值表示增加曝光度。

如下图所示，分别给出了值为0%， 50%，100%，200%的情况。

![](http://p2.qhimg.com/t01585679b285e93c4d.png)

### `contrast()`对比度

`contrast()`改变元素的对比度。其语法格式为：`contrast( <number-percentage>? )`，值为数字或百分比。`0%`则完全变为灰色，`100%`表示保持原样。初始值和默认值均为`1`。无效值或者负值均被视为`1`。大于1的值表示增加对比度。

如下图所示，分别给出了值为0%， 50%，100%，200%的情况。

![](http://p0.qhimg.com/t01abf6e239c7885c89.png)

### `drop-shadow()`投影

`drop-shadow()`向元素应用一个投影效果。该函数接受的参数与CSS3的`box-shadow`属性类似，除了不能接受inset参数。区别在于使用filter，某些浏览器会启用硬件加速来进行优化。

语法格式如下：`drop-shadow( <color>? && <length>{2,3} )`。其中三个长度值依次对应`<offset-x> <offset-y> <blur-radius> `，表示x轴偏移、y轴偏移以及模糊半径。如`filter: drop-shadow(16px 16px 10px black) `。其中**颜色值`black`放在前面或者后面都可以**。

该方法的初始值中各长度为`0`，颜色值为`transparent`。

该方法的默认值中个长度也为`0`，但是**颜色值会有一点比较特殊，即其会使用当前元素的`color`值**。

如下例所示。图二在drop-shadow中指定了颜色，图三没有指定，则图三应用了`color`颜色。

![](http://p6.qhimg.com/t01074e036215b318c8.png)

### `grayscale()`灰度变换

`grayscale()`能够对图像进行灰度处理。该函数接受一个值，语法格式为`grayscale( <number-percentage>? )`。值可以为数字或者百分比。`100%`表示完全为灰度的，**注意不是全灰色的，只是变成黑白的了**。`0%`表示保持原样。**初始值为`0`，但默认值为`1`**。无效值或者负值均被视为`0`。大于1的值效果等同于`100%`。

如下图展示了，值为0%，50%， 100%，200%的情况。

![](http://p7.qhimg.com/t01c1e33461ee078eb3.png)

### `hue-rotate()`色调旋转

`hue-rotate()`可以对指定元素应用色调旋转，语法格式为`hue-rotate( [ <angle> | <zero> ]? )`。接受一个角度`angle`值。用于定义将颜色在色环上旋转多少度。初始值和默认值均为`0deg`，表示无变化。无最大值限制，超过`360deg`的值会折算成小于`360deg`的等价值。

色环上各颜色的角度参考下图：
![](https://camo.githubusercontent.com/5d167f543f4b407b3b5043982cfdabe65317b8cf/68747470733a2f2f70332e73736c2e7168696d672e636f6d2f743031636334626265623137623534396563622e706e67)

如果大家对颜色有兴趣，也可以看一看二哥之前发布的[ 《给你点颜色看看 》](https://github.com/75team/w3c/blob/master/articles/20181203_%E7%BB%99%E4%BD%A0%E7%82%B9%E9%A2%9C%E8%89%B2%E7%9C%8B%E7%9C%8B.md "给你点颜色看看")一文。

下面我们可以看下将色调旋转90度后上图的效果。对照上面的色环角度，可以预想天空变成了粉色。确实应用后的效果也是如此。

![](http://p0.qhimg.com/t01e7067fbe2d5e9cf5.png)

### `invert()`颜色反转

`invert()`会将图片中的颜色进行反转。该函数语法格式为`invert( <number-percentage>? ) `，接受一个值，值可以为数字或者百分比。`100%`表示完全反转，`0%`表示保持原样。**初始值为`0`，但默认值为`1`**。无效值或者负值均被视为`0`。大于1的值效果等同于`100%`。

如下图展示了，值为0%，50%， 100%，200%的效果。

![](http://p6.qhimg.com/t01f4ef04606fa83237.png)

### `opacity()`透明

`opacity()`会向图片应用透明效果。该函数语法格式为`opacity( <number-percentage>? )`，接受一个值，值可以为数字或者百分比。`0%`表示完全透明，`100%`保持原样。初始值和默认值均为`1`。无效值或者负值均被视为`1`。大于1的值效果等同于`100%`。

该值与常用的CSS属性`opacity`类似，区别在于使用filter时，某些浏览器会开启硬件加速来保证性能。此外还可以在过滤器函数中指定多个`opacity()`，效果会产生叠加。

如下图展示了，值为0%，25%，两次50%， 50%， 100%，200%的效果。**可以发现两次50%的效果会发生叠加，等价于25%的效果**。

![](http://p8.qhimg.com/t019d4d990aa942349b.png)

### `saturate()`饱和度

`saturate()`可以改变图像色彩的饱和度。该函数的语法格式为`saturate( <number-percentage>? )`，接受一个值，值可以为数字或者百分比。`0%`表示完全不饱和，效果等同于`greyscale(100%)`完全灰度。`100%`表示保持原样。初始值和默认值均为`1`。无效值或者负值均被视为`1`。大于`1`则表示超饱和。

如下图展示了，值为0%，50%， 100%，200%的效果。

![](http://p4.qhimg.com/t01ab3ef0574a1b7cd0.png)

### `sepia()`褐色化

`sepia()`可以将图像褐色化。该函数的语法格式为`sepia( <number-percentage>? )`，接受一个值，可以为数字或者百分比。`0%`表示保持原样，`100%`表示完全褐色化。**初始值为`0`，但默认值为`1`**。无效值或者负值均被视为`1`。大于`1`则等同于`1`。

如下图展示了，值为0%，50%， 100%，200%的情况。

![](http://p5.qhimg.com/t01a953fc323f27bbd0.png)

## 结束语

以上我们介绍了CSS filter所预设的效果函数。本次我们先介绍这些内容，后续我还会给大家介绍下更为灵活复杂的SVG filter，敬请期待。

## 参考链接

> 1. [ Filter Effects Module Level 1 ](https://drafts.fxtf.org/filter-effects/#FilterProperty)


