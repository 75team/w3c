## 前言

提起，z-index大家脑海里可能会立刻浮现这样的知识点：“z-index的值大小控制元素在Z轴上显示的层级，z-index越大显示的层级越高（也就是在最上层，离观察者越近），没有指定的按照出现顺序堆叠，此外z-index不能跨父元素比较。

z-index的使用似乎就是这么简单，对吧？

我们先看如下例1：

```HTML
  <div class="box box1">DIV#1，z-index为2</div>
  <div class="box box2">DIV#2，z-index为auto</div>
```

HTML中有如下两个元素，DIV#1的z-index为`2`，DIV#2向右向上偏移。问：它们谁会显示在上面？

![示例1 - 用法引导](http://p9.qhimg.com/t01901b512bb409202d.png)

<!-- codepen示例代码 -->
<p class="codepen" data-height="331" data-theme-id="light" data-default-tab="result" data-user="verymuch" data-slug-hash="jdNwOW" style="height: 331px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CSS的“层”峦“叠”翠 - 示例1 - 用法导引">
  <span>点击<a href="https://codepen.io/verymuch/pen/jdNwOW/">
  CSS的“层”峦“叠”翠 - 示例1 - 用法导引</a> 进行编辑 (<a href="https://codepen.io/verymuch">@verymuch</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<!-- <script async src="https://static.codepen.io/assets/embed/ei.js"></script> -->

如上所示，z-index为2的元素并没有显示在第二个元素上面。这似乎很奇怪，那到底是为什么呢？

如果你也对此存在困扰，那就和我一起往下看吧。笔者将逐步引导大家深入理解z-index的用法。

<!-- more -->

## 一、没有使用z-index时，元素如何堆叠？

首先，我们先了解下默认情况下，元素的堆叠，即在没有使用z-index时，元素是如何堆叠的。

如果没有给任何元素指定z-index，则元素按照如下顺序进行堆叠（由下到上，由远及近）。

1. 根元素的背景和边框
1. 非定位的后代块元素，按照在HTML中的出现顺序进行堆叠
1. 定位的后代块元素，按照在HTML中的出现顺序进行堆叠

> 注：定位的元素即为position的值不是static的元素

![示例2 - 无z-index时的默认堆叠](http://p2.qhimg.com/t017ac57b1fd7e12d2c.png)

<!-- codepen示例 -->
<p class="codepen" data-height="610" data-theme-id="light" data-default-tab="result" data-user="verymuch" data-slug-hash="KJPvpQ" style="height: 610px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CSS的“层”峦“叠”翠 - 示例2 - 无z-index时的默认堆叠">
  <span>点击<a href="https://codepen.io/verymuch/pen/KJPvpQ/">
  CSS的“层”峦“叠”翠 - 示例2 - 无z-index时的默认堆叠</a> 进行编辑 (<a href="https://codepen.io/verymuch">@verymuch</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<!-- <script async src="https://static.codepen.io/assets/embed/ei.js"></script> -->

如上例2所示，定位的元素（DIV#1、DIV#2、DIV#3与DIV#4）按照出现的顺序堆叠。非定位的元素（DIV#5与DIV#6）虽然出现在后面，但是会被定位的元素遮盖，不过它们本身是按照出现顺序堆叠的。

注意，**当使用`order`属性改变`flex`元素子元素的出现顺序时，对于堆叠规则也有同样的影响。**

如下例3所示，当将DIV#2的order改为-1后，它出现的位置为第一个，其堆叠顺序也被DIV#1所遮盖。

![示例3 - flex中order对出现顺序的影响](http://p2.qhimg.com/t01538f9d79432b61a0.png)

<p class="codepen" data-height="307" data-theme-id="light" data-default-tab="result" data-user="verymuch" data-slug-hash="RvbjQX" style="height: 307px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CSS的“层”峦“叠”翠 - 示例3 - flex中order对出现顺序的影响">
  <span>点击<a href="https://codepen.io/verymuch/pen/RvbjQX/">
  CSS的“层”峦“叠”翠 - 示例3 - flex中order对出现顺序的影响</a> 进行编辑 (<a href="https://codepen.io/verymuch">@verymuch</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<!-- <script async src="https://static.codepen.io/assets/embed/ei.js"></script> -->

## 二、浮动块默认如何堆叠

如果存在浮动块，浮动块的堆叠顺序会介于无定位元素和定位元素之间。即：

1. 根元素的背景和边框
1. 非定位的后代块元素，按照在HTML中的出现顺序进行堆叠
1. **浮动块**
1. 定位的后代块元素，按照在HTML中的出现顺序进行堆叠

我们稍微修改下示例2中的代码，将DIV#1和DIV#3改为浮动元素。可以看到如下例4所示，浮动元素的堆叠顺序高于非定位元素，低于定位元素。

![示例4 - 浮动块的堆叠](http://p0.qhimg.com/t013a0e89d8a7b66bd9.png) 

<p class="codepen" data-height="265" data-theme-id="0" data-default-tab="css,result" data-user="verymuch" data-slug-hash="pGogMq" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CSS的“层”峦“叠”翠 - 示例4 - 浮动块的堆叠">
  <span>点击<a href="https://codepen.io/verymuch/pen/pGogMq/">
  CSS的“层”峦“叠”翠 - 示例4 - 浮动块的堆叠</a> 进行编辑 (<a href="https://codepen.io/verymuch">@verymuch</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<!-- <script async src="https://static.codepen.io/assets/embed/ei.js"></script> -->

此外，还有一点小改动，不知道你有没有注意到，我们将非定位元素中的文本内容改为了左对齐，但其内容并没有被浮动元素覆盖。这其实是浮动元素的标准效果——环绕效果。这一行为也可以列为堆叠顺序之一。顺序如下：

1. 根元素的背景和边框
1. 非定位的后代块元素，按照在HTML中的出现顺序进行堆叠
1. 浮动块
1. **非定位元素的后代行内元素**
1. 定位的后代块元素，按照在HTML中的出现顺序进行堆叠

为了让大家清晰的理解上面所说的非定位元素的后代行内元素。大家可以看下例5。DIV#1为浮动元素，所以其层级高于在其后出现的DIV#2。此时DIV#1向右偏移，可以看见DIV#2中的行内文字元素(可以为纯文字节点)层级高于DIV#1。

![示例5 - 非定位元素的后代行内元素](http://p9.qhimg.com/t0171cbc60777b42f35.png)

<p class="codepen" data-height="200" data-theme-id="light" data-default-tab="result" data-user="verymuch" data-slug-hash="PVoOoX" style="height: 200px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CSS的“层”峦“叠”翠 - 示例5 - 非定位元素的后代行内元素">
  <span>点击<a href="https://codepen.io/verymuch/pen/PVoOoX/">
  CSS的“层”峦“叠”翠 - 示例5 - 非定位元素的后代行内元素</a> 进行编辑 (<a href="https://codepen.io/verymuch">@verymuch</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<!-- <script async src="https://static.codepen.io/assets/embed/ei.js"></script> -->

## 三、使用z-index自定义堆叠顺序

以上是CSS中对于各类元素的默认排序，那我们能否自定义排序呢？答案显然是肯定的。使用z-index可以自定义堆叠顺序。

z-index的值可以为整数（正数、负数、0均可）。使用方法很简单。

需要注意以下三点：

1. 未指定z-index，默认为auto
1. 如果z-index相同，则按照默认规则比较
1. z-index**只能用于定位了的元素**(暂时这么说，下文会追加解释)。*这也解释了本文开头的例1为什么不生效了。因为z-index对普通元素没有效果。*

如下例6，我们修改了例2中元素的z-index。

**我们会发现DIV#5和DIV#6并不受z-index的影响**。主要体现在两个方面，首先DIV#5的z-index大于DIV#6，但是显示却低于#DIV#6；其次是DIV#5的z-index小于DIV#4，但是仍显示在其上面。

而对于定位的元素，z-index对其有影响，堆叠顺序与数字大小符合。

![示例6 - 使用z-index自定义堆叠顺序](http://p8.qhimg.com/t0139f74dafdba629fa.png) 

<p class="codepen" data-height="605" data-theme-id="light" data-default-tab="result" data-user="verymuch" data-slug-hash="bzGYqb" style="height: 605px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CSS的“层”峦“叠”翠 - 示例6 - 使用z-index自定义堆叠顺序">
  <span>点击<a href="https://codepen.io/verymuch/pen/bzGYqb/">
  CSS的“层”峦“叠”翠 - 示例6 - 使用z-index自定义堆叠顺序</a> 进行编辑 (<a href="https://codepen.io/verymuch">@verymuch</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<!-- <script async src="https://static.codepen.io/assets/embed/ei.js"></script> -->

好了，相信通过上述内容，大家对于z-index应该有了一定的了解，但是以上仅仅是基本知识，关于堆叠远远没有这么简单。

想要彻底了解z-index，我们还要了解一下CSS堆叠的一个重要概念————堆叠上下文。

## 四、堆叠上下文

堆叠上下文是HTML中的三维概念，它抽象出了一个z轴，z轴垂直于显示器，指向用户（假设用户面朝显示区域）。

在前面的内容中，之所以有些元素的渲染顺序会受到z-index影响，是因为它们都因为某种原因产生了一个**堆叠上下文**，而不仅仅是上文提到的定位的元素。

**那么到底什么情况下会产生堆叠上下文呢？其实堆叠上下文的生成主要受到元素的属性所影响。**

如果任何一个元素满足一下条件之一，就会生成一个堆叠上下文。

1. 文档的根元素（HTML）默认为一个堆叠上下文
1. `position`值为"absolute"或"relative"，且z-index指定了除了auto以外值的元素
1. `position`值为"fixed"或"sticky"
1. 弹性布局的子元素，且z-index指定了除了auto以外值的元素
1. `opacity`的值小于的元素
1. `mix-blend-mode`的值不是`normal`的元素
1. 以下属性值不为"none"的元素
    * transform
    * filter
    * perspective
    * clip-path
    * mask / mask-image / mask-border
1. `isolation`值为"isolate"的元素
1. `-webkit-overflow-scrolling`值为"touch"的元素
1. `will-change`指定了除初始值以外的任何属性的元素
1. `contain`值为"layout"/"paint"及含义其中之一的组合值的元素

如上所述，有11种情况会生成堆叠上下文，对于堆叠上下文可以通过z-index指定其堆叠的顺序（注意这里不是上面说的只对定位元素生效了）。

对于堆叠上下文我们需要知道以下几点：

1. 在每个堆叠上下文内部，子元素的堆叠规则遵循上面所讲的基本规则。
1. 堆叠上下文可以包含在其他堆叠上下文内部，它们会创建一个堆叠上下文层级结构。
1. 堆叠上下文的层级结构与HTML的元素不同，因为对于没有创建堆叠上下文的元素会被父元素同化。**堆叠上下文的层级只包括创建了堆叠上下文的元素**。
1. 堆叠上下文独立于其兄弟元素，在处理自身内部堆叠时，只考虑其后代元素。内部堆叠完成后，将当前堆叠上下文当成一个整体，考虑在父堆叠上下文中的堆叠顺序。通俗的说，**子堆叠上下文的z-index值只在父堆叠上下文中有意义。**

注意，第四条和文章开头提到的“z-index不能跨父元素比较”是不等价的，因为其限制了必须是堆叠上下文。

针对这几点，我们看一下例7。大家可以先看一下是否理解。然后我们再讲解一下。

![示例7 - 存在多级堆叠上下文时，元素的堆叠](http://p8.qhimg.com/t01a65ff345704b4310.png)

<p class="codepen" data-height="701" data-theme-id="0" data-default-tab="result" data-user="verymuch" data-slug-hash="QYbPvN" style="height: 701px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CSS的“层”峦“叠”翠 - 示例7 - 存在多级堆叠上下文时，元素的堆叠">
  <span>点击<a href="https://codepen.io/verymuch/pen/QYbPvN/">
  CSS的“层”峦“叠”翠 - 示例7 - 存在多级堆叠上下文时，元素的堆叠</a> 进行编辑 (<a href="https://codepen.io/verymuch">@verymuch</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<!-- <script async src="https://static.codepen.io/assets/embed/ei.js"></script> -->

示例7中，堆叠上下文的层级结构如下：

* root
  * DIV#1
  * DIV#2
    * DIV#4
    * DIV#5
    * DIV#6
  * DIV#3
  * DIV#8

其中DIV#4, DIV#5, DIV#6是DIV#2的子元素，可见其堆叠顺序被限制在DIV#2中，z-index的值只在DIV#2内部有效，然后DIV#2又作为一个整体与DIV#1，DIV#3按照上述规则进行堆叠。

DIV#7被根元素同化，DIV#8与DIV#1, DIV#2, DIV#3按照上述规则进行堆叠。在其三之上。

其实有个小方法能够帮助大家更好地判断如何堆叠，那就是把堆叠上下文的层级结构类比为版本号。如下：

* root
  * DIV#1 (V3)
  * DIV#2 (V2)
    * DIV#4 (V2.1)
    * DIV#5 (V2.3)
    * DIV#6 (V2.4)
  * DIV#3 (V1)
  * DIV#8 (V4)

如上，类比成版本号之后，我们就能很方便的判断出谁上谁下啦。

## 五、注意事项

### 1. `z-index: 0`与`z-index: auto`并不相同。

通常情况下，相邻的两个元素，如果其z-index值分别为`0`和`auto`，看上去没什么区别的。如下例8所示。

DIV#1的z-index值为0，其堆叠顺序并没有高于DIV#2，而是和出现顺序相同。

![示例8 - zindex: 0 和 auto 的区别](http://p9.qhimg.com/t0180f2ab512f55e244.png)

<p class="codepen" data-height="265" data-theme-id="0" data-default-tab="result" data-user="verymuch" data-slug-hash="omKOmM" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CSS的“层”峦“叠”翠 - 示例8 - zindex: 0 和 auto 的区别">
  <span>点击<a href="https://codepen.io/verymuch/pen/omKOmM/">
  CSS的“层”峦“叠”翠 - 示例8 - zindex: 0 和 auto 的区别</a> 进行编辑 (<a href="https://codepen.io/verymuch">@verymuch</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<!-- <script async src="https://static.codepen.io/assets/embed/ei.js"></script> -->

但是实际上，这两种情况并不相同。上面提到，当元素“`position`值为"absolute"或"relative"，且z-index指定了除了auto以外值”时，元素会产生一个堆叠上下文，虽然元素本身堆叠顺序没有影响，但是其子元素的堆叠顺序会有影响。如下例9所示。

因为DIV#1的z-index值不为auto，其产生了堆叠上下文，所以其子元素被限制在其内部，低于DIV#2(如果z-index是auto的话，DIV#3会高与DIV#2)。

![示例9 - zindex: 0 和 auto 的区别（2）](http://p6.qhimg.com/t013271819e3dd047a2.png)

<p class="codepen" data-height="265" data-theme-id="0" data-default-tab="css,result" data-user="verymuch" data-slug-hash="yZmrWg" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CSS的“层”峦“叠”翠 - 示例9 - zindex: 0 和 auto 的区别（2）">
  <span>点击<a href="https://codepen.io/verymuch/pen/yZmrWg/">
  CSS的“层”峦“叠”翠 - 示例9 - zindex: 0 和 auto 的区别（2）</a> 进行编辑 (<a href="https://codepen.io/verymuch">@verymuch</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<!-- <script async src="https://static.codepen.io/assets/embed/ei.js"></script> -->

### 2. 不要滥用`z-index`，将堆叠上下文的层级结构打平

笔者之所以这样建议，是因为当堆叠上下文的层级结构比较复杂时，简单的修改某个元素的z-index或者其他属性，会导致一些无法预知的影响。

如下例时所示，DIV#2是DIV#1的子元素，DIV#4是DIV#3的子元素，DIV#1和DIV#3不是堆叠上下文，则DIV#2与DIV#4的堆叠顺序与它们的z-index值对应。

![示例10 - zindex造成的影响](http://p5.qhimg.com/t01b4385b3b982323d0.png)

<p class="codepen" data-height="309" data-theme-id="0" data-default-tab="result" data-user="verymuch" data-slug-hash="zbOwxP" style="height: 309px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CSS的“层”峦“叠”翠 - 示例10 - zindex造成的影响">
  <span>点击<a href="https://codepen.io/verymuch/pen/zbOwxP/">
  CSS的“层”峦“叠”翠 - 示例10 - zindex造成的影响</a> 进行编辑 (<a href="https://codepen.io/verymuch">@verymuch</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<!-- <script async src="https://static.codepen.io/assets/embed/ei.js"></script> -->

但如果我们在某些时候需要调整DIV#3的z-index，如将其调整成`z-index: 4;`，那么结果就完全不一样了。如下例11所示，DIV#4高于DIV#2了。

![示例11 - zindex造成的影响（2）](http://p7.qhimg.com/t014fbc7fb2ca27f66c.png)

<p class="codepen" data-height="344" data-theme-id="0" data-default-tab="result" data-user="verymuch" data-slug-hash="WmejjG" style="height: 344px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CSS的“层”峦“叠”翠 - 示例11 - zindex造成的影响（2）">
  <span>See the Pen <a href="https://codepen.io/verymuch/pen/WmejjG/">
  CSS的“层”峦“叠”翠 - 示例11 - zindex造成的影响（2）</a> by verymuch (<a href="https://codepen.io/verymuch">@verymuch</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<!-- <script async src="https://static.codepen.io/assets/embed/ei.js"></script> -->

所以笔者建议，大家一定要慎用，基于对堆叠上下文的理解基础上，把握好页面中堆叠上下文的层级结构，尽量保持比较浅的层级结构，最好能与HTML层级结构一致，保证自己能够时刻知道如何进行修改与调整。

## 总结

以上，笔者从元素的默认堆叠顺序，讲到了堆叠上下文的生成。对上述内容了解之后，就能够很好地应对开发中所遇到的层级问题了。不过还是建议大家在开发前，提前规划好z-index的使用。避免最后自己无法掌控。

## 参考文献

> 1. [深入理解CSS中的层叠上下文和层叠顺序](https://www.zhangxinxu.com/wordpress/2016/01/understand-css-stacking-context-order-z-index/)
> 2. [Understanding CSS z-index](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index)