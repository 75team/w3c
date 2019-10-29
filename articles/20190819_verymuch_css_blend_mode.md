在CSS中我们可以通过`background-blend-mode`和`mix-blend-mode`来应用混合模式这一强大的效果。这一效果仿佛能够让我们在浏览器中进行P图。

在详细介绍这两个属性之前，我们现在先了解一下它们都会用的值类型`<blend-mode>`。

## 一、\<blend-mode\>

\<blend-mode\>是CSS的一种值类型。它用于描述**当元素重叠时颜色该如何展示**。可以用于`background-blend-mode`和`mix-blend-mode`这两个属性。

当应用了混合模式后，这一属性会根据特定的算法将重叠的前景（顶）色和背景（底）色生成一个新的颜色值。

\<blend-mode\>数据类型可以指定下面**16**个关键字，分别为：`normal`，`multiply`，`screen`，`overlay`，`darken`，`lighten`，`color-dodge`，`color-burn`，`hard-light`，`soft-light`，`difference `，`exclusion`，`hue`，`saturation`，`color`，`luminosity`。[示例demo](http://code.h5jun.com/roca)链接可点击跳转（[http://code.h5jun.com/roca](http://code.h5jun.com/roca)），可以分别选择不同的混合模式来应用效果。

1. `normal` 正常模式
	这个比较简单也比较好理解。最终的颜色会忽略下面被覆盖的颜色，直接显示为上面的颜色。

2. `multiply` 正片叠底模式
	最终的颜色是顶色和底色相乘。**黑色叠加后结果会变成黑色，白色叠加时不变**。

3. `screen` 屏幕模式
	与正片叠底模式相反，合成图层的效果是显现两图层中较高的灰阶，而较低的灰阶则不显现（即浅色出现，深色不出现），产生一幅更加明亮的图像。**黑色叠加后颜色不变，白色叠加结果为白色**。

4. `overlay` 叠加模式
	如果底色更深则最终结果为`multiply`的结果；如果底色更浅，则最终结果为`screen`的结果。

5. `darken` 变暗模式
	此关键字会对前后景颜色值的RGB值（即RGB通道中的颜色亮度值）分别进行比较，取二者中低的值再组合成为混合后的颜色。

6. `lighten` 变亮模式
	该模式与变暗模式相反，会对前后景色的RGB值进行比较，取高值合成为混合后的颜色，从而达到变亮的效果。

7. `color-dodge` 颜色减淡
	该模式会加亮背景颜色，形成鲜明对比的图像。黑色的前景时，背景色保持不变。如果前景色是背景色的反差色，则会形成完全鲜明的颜色。该模式与`screen`模式类似。

8. `color-burn` 颜色加深
	这种模式会加深背景色。白色前景时背景色不变。如果前景色是背景色的反差色，则会形成黑色的图像。该模式与`multiply`模式类似。

9. `hard-light` 强光模式
	该模式与overlay类似，但是图层互换了。当顶层颜色更深时最终结果为`multiply`，当顶层颜色更浅时，则最终结果为`screen`。

10. `soft-light` 柔光模式
	效果与`overlay`类似，但是有轻微的不同。作用时将顶层图像以柔光的方式是加到底层。

11. `difference` 差值模式
	应用该模式时，最后的颜色为较浅的颜色减去较深的颜色。当有一层为黑色时，则另一层不变。当有一个层为白色时，则另一层会变为反转色。

12. `exclusion` 排除模式
	最终的颜色与差值模式类似，但是对比度更小。

13. `hue` 色调模式
	最终的颜色会使用顶色的色相，加上底色的饱和度和亮度。

14. `saturation` 饱和度模式
	与`hue`类似，最终的颜色会使用顶色的饱和度加上底色的色调和亮度。

15. `color` 颜色模式
	最终的颜色会使用顶色的饱和度和色调加上底色的亮度。

16. `luminosity` 亮度模式
	最终的颜色会使用顶色的亮度加上底色的色调和饱和度。

除了常规模式，一共有15种混合模式，想要准确地记住所有模式的原理其实比较困难。所以我们可以将其简单分为几类，当我们需要某一类效果时，可以直接缩减范围，尝试满足这一类效果的混合模式。这样使用起来更快捷。

如下我们可以将15中混合模式分为5类：

1. 变暗：multiply，darken，color-burn
2. 变亮：screen，lighten，color-dodge
3. 调整对比度：overlay，hard-light，soft-light
4. 反差：difference，exclusion
5. 颜色组成：hue，saturation，color，luminosity

## 二、`background-blend-mode`

通过`background-blend-mode`，我们可以将背景图片混合到一起，也可以将背景图片与背景颜色混合。如下我们可以很简单地将一个阴天的图片通过混合的方式变成碧蓝的天空（[代码链接](http://code.h5jun.com/xoxiy)）。

```html
div.blended {
  background: url(http://p9.qhimg.com/t012932e87662183569.jpg);
  background-color: #09a8e0;
  background-blend-mode: multiply;
}
```

![](http://p6.qhimg.com/t01ffc1105d4da91738.png)

注意：当背景图与背景色进行混合时，背景图算作前景色，与代码顺序无关。

简单的三句CSS达到了PS的效果，是不是还是很给力的。其实这里比较简单，想要达到更好的效果还可以通过多层背景混合来实现。下面我们来一起试一试。

```html
background: url(http://p6.qhimg.com/t0110da9f699fc645b4.png),
    url(http://p0.qhimg.com/t01628bd068d6f37961.png),
    url(http://p2.qhimg.com/t0160c558d31f4d5202.png),
    url(http://p9.qhimg.com/t012932e87662183569.jpg),
    linear-gradient(#0aa0fe 0%, #baf5ff 55%, #85c1cb 55%);
background-blend-mode: lighten, lighten, lighten, multiply, darken;
```

如上，我们通过多背景的混合实现了更好看点图像，效果图如下（左侧为未应用混合模式的效果）。我们通过渐变实现了天的渐变蓝与水的绿，并且额外增加了三朵漂浮的云朵。（[示例代码](http://code.h5jun.com/qara/1)）

![](http://p3.qhimg.com/t0170d4b87060d2b1c9.png)

注意，当存在多背景时，`background-blend-mode`混合模式的顺序与`background-img`属性一致。如果混合模式的值长度小于背景图的值长度，则会重复混合模式的值，循环匹配。如果大于背景图的值长度，则会被截取。

## 三、`mix-blend-mode`

`mix-blend-mode`可以设置元素的内容如何和父元素以及元素背景混合。

同样针对上面多背景的例子，我们可以通过多元素的方式进行试下。如下（[示例代码](http://code.h5jun.com/yere/1)）：

HTML代码：
```html
<div class="wrapper">
  <div class="img"></div>
  <div class="cloud cloud1"></div>
  <div class="cloud cloud2"></div>
  <div class="cloud cloud3"></div>
</div>
```

CSS代码：
```html
.wrapper {
  position: relative;
  border: 1px solid #ddd;
  margin-right: 5px;
  width: 300px;
  height: 200px;
  background: linear-gradient(#0aa0fe 0%, #baf5ff 55%, #85c1cb 55%);
  background-size: 100%;
  background-position: center center;
  background-repeat: no-repeat;
  overflow: hidden;
}

.img {
  width: 100%;
  height: 100%;
  background: url(http://p9.qhimg.com/t012932e87662183569.jpg);
  background-size: 100%;
  background-position: center center;
  background-repeat: no-repeat;
  mix-blend-mode: multiply;
}

.cloud {
  position: absolute;
  background-size: 100%;
  background-position: center center;
  background-repeat: no-repeat;
  mix-blend-mode: lighten;
}

.cloud1 {
  background-image: url(http://p6.qhimg.com/t0110da9f699fc645b4.png);
  left: 30px;
  top: 50px;
  width: 60px;
  height: 20px;
}

.cloud2 {
  background-image: url(http://p0.qhimg.com/t01628bd068d6f37961.png);
  left: 230px;
  top: 50px;
  width: 80px;
  height: 30px;
}

.cloud3 {
  background-image: url(http://p2.qhimg.com/t0160c558d31f4d5202.png);
  left: 130px;
  top: 25px;
  width: 100px;
  height: 30px;
}
```

效果图如下：
![](http://p8.qhimg.com/t0179fd2fdc913c9d27.png)

## 四、总结

本文为大家简单介绍了下CSS中的混合模式，并动手制作了一个小示例。相信大家对于混合模式一定已经有了一定的了解。其实除了这些之外，我们还可以在Canvas和SVG中应用混合模式，如果大家感兴趣可以扩展一下，本文就不展开介绍了。