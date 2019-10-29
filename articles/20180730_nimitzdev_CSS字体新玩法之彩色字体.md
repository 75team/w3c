# CSS 新玩法之彩色字体
> 本文作者：何文力，360奇舞团前端工程师，同时也是 W3C CSS 工作组成员。

# 为什么要使用彩色字体

如果你们设计师想在某些特别的专题活动中使用下图的字体作为标题字体进行展现，怎么办呢？做成图片咯。然后你可能会遇到这几个问题：不同屏幕下的适配，要是只做一种尺寸的图，放大或缩小后的效果都不太好。直接做成 SVG？好像不能复制到 Word 里面加粗啊，也就是说，这种做法使得这些“文字”本身失去了真实文字该有的能力。

此时彩色字体的好处就显现出来了。既能达到视觉效果上的要求，还拥有常规文字的功能，能够复制，能够粘贴，还可以被屏幕阅读器阅读，丝毫不妨碍常规操作。

![Playbox](https://p2.ssl.qhimg.com/t014b5cbad7ff504511.png)

> Playbox by Matt Lyon

# 什么是彩色字体（Color Font）

### 初识彩色字体

在我们所熟知的传统字体中，字体文件本身仅仅描述了字体的外形特征，这些特征一般包含着矢量的轮廓数据或是单色调位图数据。在浏览器渲染单色字体时，渲染引擎使用设定的字体颜色填充字形区域，最后绘制出对应文字及其设定的颜色。而彩色字体中，不仅仅存储了字体的外形特征，还保存了颜色信息，甚至还能在字体中提供不同的配色，增加了灵活性的同时也更具丰富的外形细节。

日常使用中最常见的彩色字体要数 Emoji 表情了。例如在 Windows 10 上，Segoe UI Emoji 就属于一款彩色字体。

![Windows 10 上的 Segoe UI Emoji](https://p1.ssl.qhimg.com/t01a3e6c88fd472da97.png)

通常彩色字体还会包含一些兼容信息，这些兼容信息包含 Unicode 编码的单色字形数据，使得在一些不支持彩色字体的平台上，仍然能够像渲染普通字体一样将彩色字体的字形渲染出来，达到一种向后兼容的效果。

![在 Word 2016 上插入 Segoe UI Emoji 显示为单色字体](https://p2.ssl.qhimg.com/t014febf656537a1e20.png)

### 彩色字体的实现标准

在彩色字体设计的发展历史上，由于各家有自己的实现方案，导致在 OpenType 字体中嵌入的色彩信息标准也不尽相同。在最新的 [OpenType 标准中](https://docs.microsoft.com/en-us/typography/opentype/spec/otff#tables-related-to-color-fonts) <sup>1</sup>，就有多达四种彩色字体数据的描述格式。

- SVG，由 Adobe 和 Mozilla 主导的矢量字体标准。其中不仅包含了标准的 TrueType 或 CFF 字形信息，还包含了可选的 SVG 数据，允许为字体定义颜色、渐变甚至是动画效果。SVG 标准中的配色信息也将存储在 CPAL 中。

- COLR + CPAL，由微软主导的矢量字体标准。其中包含 COLR 即**字形图层数据**和 CPAL **配色信息表**，对其的支持集成在 Windows 8.1 及之后的版本中。
- CBDT + CBLC，由 Google 主导的位图字体标准。其中包含了 CBDT **彩色外形位图数据**和 CBLC **位图定位数据**，对其的支持集成在 Android 中。
- SBIX，由 Apple 主导的位图字体标准。SBIX 即**标准位图图像表**其中包含了 PNG、JPEG 或 TIFF 的图片信息，对其的支持集成在 macOS 和 iOS 中。

### 浏览器对各种标准的支持

| 浏览器                       | 支持标准              |
| ---------------------------- | --------------------- |
| Microsoft Edge (38+, Win 10) | SVG, SBIX, COLR, CBDT |
| Firefox (26+)                | SVG, COLR             |
| Safari                       | SBIX, COLR            |
| Chrome                       | CBDT                  |
| Internet Explorer (Win 8.1)  | COLR                  |

> 数据来源 www.colorfonts.wtf

看到这么多种标准，参差不齐的浏览器支持，你可能会想难道又要根据UA派发不同格式字体做兼容么？告辞！

少侠且慢！

![](https://p4.ssl.qhimg.com/t01b37f982ef41aa261.png)

在 2016 年的时候，各大厂商最终同意使用 OpenType SVG 作为彩色字体的标准，也就是上面提到的 SVG，**也是 W3C 目前所用的标准**。相信在不久各大厂家浏览器将逐步支持 W3C 所用的 SVG 标准。

# 字体模块标准的现状

 [CSS Fonts Module Level 3](https://www.w3.org/TR/2018/CR-css-fonts-3-20180626/) <sup>2</sup> ：目前处于候选推荐状态，是主流浏览器都已大部分实现的标准，最新一版候选标准发表于今年的 6 月 26 日。Level 3 标准基于之前的 CSS3 Fonts 以及 CSS3 Web Fonts，并将字体加载事件相关的标准移入 [CSS Font Loading](https://www.w3.org/TR/css-font-loading/) <sup>3</sup>模块中。

 [CSS Fonts Module Level 4](https://www.w3.org/TR/css-fonts-4) <sup>4</sup>：Level 3 的下一代标准，目前处于工作组草案状态，最近一次草案更新于 4 月 10日。该版本草案基于 Level 3，新增的属性中比较新颖的功能，也就是本文将要介绍彩色字体（Color Font）的支持。

# CSS 彩色字体相关标准

在支持彩色字体的浏览器中，虽然能够正确渲染，但是你却无法控制使用字体中内置的其他配色。那么在 Level 4 标准中，就新增了一些彩色字体相关的标准让我们能够更好地使用。接下来我们就来看看吧。

### 选择字体配色：font-palette

前面我们了解到，彩色字体通过 CPAL 表是可以拥有多种不同的配色方案的。`font-palette` 有三个内置的参数以及支持自定义配色来达到修改配色方案的效果。

- normal：浏览器尽可能地将该字体当作非彩色字体进行渲染，并选择一个最适合阅读的配色方案。浏览器在做决策时还可能将当前设定的字体颜色`color`加入决策条件中。还有可能自动生成一组未内置在字体中的配色方案进行渲染。
- light：一些彩色字体在其元数据中标明某个配色方案适用于亮色（接近于白色）背景中。使用此数值，浏览器将会直接使用标记了该特性的首个配色方案进行渲染。如果字体文件格式无元数据或时元数据中未标记相应的配色方案，那么此时该数值的行为与 `normal` 相同。
- dark：正好与`light` 相反。
- 自定义：上面我们介绍了三种基本的配色选择，那么如果要使用其他的配色方案或是要自定义，我们将要借助接下来介绍的`@font-palette-values`的帮助。

示例：

```css
h1 {
    font-family: Segoe UI Emojil
    font-palette: light
}
```

### 自定义字体配色：@font-palette-values

`@font-palette-values`用于定义指定字体的配色规则。它允许开发者不仅可以自由选择字体内置的各种配色方案，还能自定义配色方案。而`font-palette`选择自定义配色方案也是通过本规则设置。

它的基本定义规则是`@font-palette-values name`，`name` 即为本配色规则的自定义规则名称。

下面通过其中的三个关键属性进行解释。

#### font-family

首先，在为字体设置配色时，我们先要指定这些配色信息是设定在哪个字体上的。通过`font-family`即可将当前配色配置绑定到某个字体上。

```css
@font-palette-values Snow {
    font-family: TriColor;
}
```

#### base-palette

在作者制作彩色字体时，往往内置了很多种字体配色，存储这些信息时，每个不同的配色方案有自己对应的 `id`，或者叫做  `index`。使用 `base-palette` 进行选择。

```css
@font-palette-values Snow {
    font-family: TriColor;
    base-palette: 5;
}
```

#### color-x

![](https://p2.ssl.qhimg.com/t010706b652b8df5637.png)

> 图片来源 typography.guru

上图展示了 COLR 对字形的分层。 COLR 将字形的多个部分分为多个图层，并按照特定的顺序将图层合并成为一个完整的字体。每一个图层都由 CPAL 中的配色信息进行上色。为了达到更强大的自定义效果，标准中使用 `color-x` 属性提供对特定图层颜色进行复写的能力。其中的 `x` 即为图层 `id`。

```css
@font-palette-values RedSnow {
    font-family: TriColor;
    base-palette: 5;
    color-1: rgb(255, 0, 0);
}
```
上述例子展示了如何通过 `color-x` 对图层颜色进行复写。通过 `base-palette: 5` 选取自带的配色，并通过 `color-1: rgb(255, 0, 0)` 将该配色中 `id` 为1的图层颜色修改为红色。

## Level 4 其他值得注意的新属性

### font-min-size, font-max-size

与属性名称描述的一样，这两个属性将限制`font-size`最终的数值。如果`font-size`的计算值超出设定的最大和最小值，`font-size`的最终数值将会被直接修改为 `font-min-size`或`font-max-size`。 这对于响应式设计来说是比较有用的，将字体大小限制在一个范围，使得字体不会变的过大或过小。

# 总结

Fonts Module Level 4 中有趣的新功能还是挺多的，具体效果和标准改进得等各大浏览器开始慢慢支持才能知道，让我们拭目以待吧。

# 文内连接

1. https://docs.microsoft.com/en-us/typography/opentype/spec/otff
2. https://www.w3.org/TR/2018/CR-css-fonts-3-20180626/
3. https://www.w3.org/TR/css-font-loading/
4. https://www.w3.org/TR/css-fonts-4/

# 参考资料

- https://www.w3.org/TR/css-fonts-4/
- https://docs.microsoft.com/en-us/typography/opentype/spec/
- <https://typography.guru/journal/windows-color-fonts/> 
- https://www.colorfonts.wtf/

# 致谢

感谢李松峰老师、高峰、刘观宇、安佳对本文章做出的修改建议。
