# 来，一起帮忙制定CSS规范吧

CSS工作组又要开会了，其中一个issue是[“Allow shape-outside to apply to initial letter”](https://github.com/w3c/csswg-drafts/issues/885)。

标题一目了然，就是“让`initial-letter`支持`shape-outside`”。为了方便大家参与，我们简单介绍一下这两个属性。

## shape-outside

`shape-outside`用于定义元素周围的文本如何对其进行绕排，比如`shape-outside: circle(); `会导致文本围绕圆形对其绕排，而`shape-outside: url(img/example.png); `则会导致文本基于图片的透明区域轮廓绕排，比如：

![](https://p0.ssl.qhimg.com/t014fba959b77a47fcf.png)

（图片来源：[https://drafts.csswg.org/css-shapes/#shape-margin-property](https://drafts.csswg.org/css-shapes/#shape-margin-property)）

##  initial-letter

`initial-letter`控制首字母下沉或上升的样式，另一个属性`initial-letter-wrapping`控制受首字母影响而缩短的行如何绕排首字母。

`initial-letter`接受两个值：第一个控制首字母高度为几行，第二个控制首字母下沉几行。如果高度和下沉的行数相等，可以省略第二个值。比如`initial-letter: 3;`表示首字母高3行，下沉3行。

`initial-letter-wrapping`用于控制受首字母影响而缩短的行如何绕排，是绕着首字母的矩形盒子排，还是绕着首字母字形的轮廓排？这个属性目前有如下几个关键字值。

- `none`：不考虑字母轮廓，受影响的行均沿首字母盒子外边距的轮廓排布。

  ![](https://p0.ssl.qhimg.com/t01ba6ee74b980088cb.png)

- `first`：如果首字母是一个独立的字母，后面跟着空格，则如同`none`；如果首字母是一个单词中的第一个字母，则第一行如同`all`。

  ![](https://p0.ssl.qhimg.com/t01b294c708611fbfa3.png)

- `all`：受影响的所有行的起点都必须顶到首字母字迹线外的一定位置。

  ![](https://p0.ssl.qhimg.com/t012239f853c3a17ea9.png)

- `grid`：同`none`，但首字母的“外扩区”（exclusion area）会以常规单字网格的整数倍为限进行扩展。

  ![](https://p0.ssl.qhimg.com/t01fde5a8f197df996c.png)

> `initial-letter`是CSS Inline Layout Module Level 3中定义的一个属性。CSS Inline Layout Module的目的是替换或扩展CSS 2.1中定义的相关模型。目前这个规范还在制定中。

（以上图片来源：[https://drafts.csswg.org/css-inline/](https://drafts.csswg.org/css-inline/)）

## 让inital-letter支持shape-outside

`initial-letter-wrapping`最多是让受影响的行沿字母轮廓绕排，而`shape-outside`则支持比这多得多的形状。因此就有人提出把`shape-outside`应用给首字母，也就是本文开头的issue。

对此，CSS工作组也作出了积极回应，[在CSS Inline Layout Module Level 3增加了这一句](https://github.com/w3c/csswg-drafts/commit/48709c776d3aa98bdfcee00284ac29ab370fcb3a)：

> If the value of `shape-outside` is not `none`, `shape-outside` is used instead of the glyph outline.（如果`shape-outside`的值不是`none`，则应该依据`shape-outside`而不是字形绕排。）

## API如何设计？

W3C特邀专家、CSS工作组资深编辑fantasai（[Elika J. Etemad](http://fantasai.inkedblade.net/contact)）最初建议给`initial-letter-wrapping`引入一个新的关键字值`wrap`。她希望在`initial-letter-wrapping: wrap;`存在时，`shape-outside` 才可以取代`initial-letter-wrapping`，否则仍然以`initial-letter-wrapping` 的值为准。

但CSS工作组成员、360前端工程师[安佳](https://github.com/anjia)对此发表了自己的看法。安佳认为不增加`wrap`值，让`shape-outside`始终覆盖`initial-letter-wrapping` 的值更好。理由是这样简单、好理解，还可以将`initial-letter-wrapping` 的值作为后备，即在未设置`shape-outside`或浏览器不支持`shape-outside`或`shape-outside`值写错的情况下，浏览器都会回退为继续使用`initial-letter-wrapping` 的值。

基于安佳的意见，fantasai第二天又修改了自己的建议，看样子她也同意了不引入新`wrap`值，而是以现有的`all`值作为接纳`shape-outside`的开关：

```
initial-letter-wrap: all;
shape-outside: circle(); /* or something else */
```

也就是说，如果`initial-letter-wrap: all;`和`shape-outside: ...;`同时存在，则依据`shape-outside`来绕排。否则，如果`initial-letter-wrap`是其他值（如`none`、`fisrt`或`grid`），则即使`shape-outside: ...;`存在也不起作用。

这就是截止本文章发布时，CSS工作组对该API的最新意见。笔者认为，经过前面的讨论和修订，这个API相对更合理了，体现了CSS标准制定的开放性。如果你对此也有自己不同的看法，欢迎留言。
