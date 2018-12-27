## 你未必知道的CSS故事：揭开leading的面纱

几乎所有CSS书在讲到`line-height`属性的时候，都会提到传统排版中的一个术语——leading。这个leading到底指什么，它在汉字排版中叫什么，它与CSS中的`line-height`，也就是“行高”有什么关系？本文试图拔开历史的迷雾，把事实真相呈现在读者眼前。

## 从传承说起

作为网页排版语言，CSS跟其他专业或大众化的排版软件一样，同样植根于传统出版。传统出版，特别是铅活字印刷时代被称为“铅与火”的时代。而通过计算机软件排版印刷的时代，被称为“光与电”的时代。从“铅与火”到“光与电”的变迁，并非简单的取代和革命，更多的还是对人类出版实践的传承。

不用说InDesgin、QuarkXPress、Acrobat等专业的排版软件，只要用过Word、WPS等文字处理软件的人，都能说出一堆出版的术语来。可想而知，这些软件的设计和编码，一定是以传统出版实践为依据的。当然，这些排版软件都以排印以页为单位的纸质书为目的，这一点与CSS不同。CSS的目标是可以无限延长的网页。但除此之外，CSS与排版软件并没有本质区别。在CSS标准中，各种排版术语随处可见。从人工拣字到计算机排版，从纸面到网页，工具的革命、介质的更迭，并不代表可以无视过去，藐视传统。相反，了解传统排版实践，是真正理解CSS标准和相关术语的必要一环。

在《CSS设计指南（第3版）》中，作者同样提到了leading。甚至还说，CSS中的`line-height`属性对应于印刷行业常说的leading，原文截图如下。

![enter image description here][1]

我们都知道，`line-height`是“行高”的意思。难道排版中的leading是CSS中的“行高”？要解决这个问题，首先得知道leading的确切含义。

## 神秘的铅空

为了弄清楚leading最初的含义，我在网上找到了以下图片：

![enter image description here][2]

<sup>（图片出处：<http://www.normanfournier.com/capabilities/typography11.html>）</sup>

![enter image description here][3]

<sup>（图片出处：<http://www.creativepro.com/article/just-say-no-automatic-leading>）</sup>

第一张图片告诉我们，两行文本之间的距离（或空白）是leading。而第二张图片更直观：两行字模之间有一条薄薄的填充材料，那就是lead。

有读者可能会问：“第二张图片中的Lead在中文活字排版中叫什么呢？”问得好！须知，了解传统出版是理解CSS的必由之路。幸好我手头有一本战士出版社1981年12月版的《出版工作手册》，这本书第二章“排字部分”有一个词条：

<div style="padding:1em;background:#eee;font:1.05em '楷体';"> <strong>铅条</strong>（空条、条） 活版中填充行与行之间的空白材料，同空铅一样，它在书面上是没有印迹的。</div>

就此，我又请教了公司校对董秋霞师傅。董师傅跟说我，排版工在拣字拼版时，会根据版心宽度自己裁割铅条。铅条长度稍短于一行字长，以便不妨碍将来固定版面时压紧字模。铅条高度低于铅字高度，在印件上产生空白。

> ### Slug、Em Quad是什么？

> 细心的读者会追问：第二张图里的Slug、1-Em Quad又是什么？Slug应该也是铅条，或者叫厚铅条。Em Quad中的Em指字体大小（英文字体以大写字母M标称点大小，em就是M的发音 :)，另可参见维基百科中的相关词条：<http://en.wikipedia.org/wiki/Em_(typography)>），Quad就是方形空铅。

> 根据《出版工作手册》：“凡是印件的版面之内没有印迹的地方，都要用空铅填充。空铅的大小是以该字号全身铅字为基准，比全身铅字小的称分数空铅，如相等于五号铅字一半大小的叫五号对开空铅，三分之一或四之一大小的叫五号三分或四分空铅，如相等于五号铅字二个大小的叫五号双连空铅，三个或四个大小叫三连空铅或四连空铅（又称五号三倍空或四倍空）。以此类推。为了节约材料，有时把大空铅中间挖空，叫做空心空铅。”

> 对应到汉字排版，1-Em Quad就是*N* 点全身空铅，2-Em Quad就是*N* 点双连空铅。总之，都是为了在版面中创造空白，铅空主要用在行首尾，铅条主要填在行间。

相信所有人都能看得出来，leading其实就是我们常说的行间距！行间距跟行高可不是一个概念。难道《CSS设计指南（第3版）》错了？别急，事情又有了曲折。

<h2 style="text-align:center;background:url(http://www.ituring.com.cn/download/01RTdGgRMvLZ) center no-repeat;">微妙的歧义</h2>

假如我一开始不是上网搜索图片，而是查文字资料呢？《牛津高阶英汉双解词典（第7版）》：

<div style="padding:1em;background:#eee;font:1.05em '楷体';"> <strong>leading</strong>(<em>technical</em> 术语) the amount of white space between lines of printed text 行距（相邻两个文本行之间的距离）</div>

俗话说：“眼见为实。”（稍后你会发现，眼见也不一定为实！）看了前面的图示，再读上面词典的解释——特别是读到释义括号中的“相邻两个文本行之间的距离”时，你一定认为“行距”就是铅条的高度！应该说，这恐怕正是我们中的大多数人所理解的“行距”的概念。毕竟，行距就是加在两行之间嘛，增大行距也是增大两行之间的距离呀。换句话说，假设两行文字的字体大小是10点（point，一点为一英寸的1/72，即0.35146毫米。我国规定一点为0.35毫米），即3.5毫米高，铅条厚度2毫米，那么这两行文字的行距是2毫米，对吧？——很遗憾，不对！

虽然铅字排版时代的leading确实是指两行之间的铅条，但现代排版软件中的leading指的则是两行文本基线之间的距离。以下是维基百科中的解释（<http://en.wikipedia.org/wiki/Leading>）：

<div style="padding:1em;background:#eee;font:1.05em '楷体';">  In typography, leading ( /ˈlɛdɪŋ/) refers to the distance between the baselines of successive lines of type. The term originated in the days of hand-typesetting, when thin strips of lead were inserted into the formes to increase the vertical distance between lines of type. The term is still used in modern page layout software such as QuarkXPress and Adobe InDesign.</div>

英文看着可能不太舒服，以下是译文：

<div style="padding:1em;background:#eee;font:1.05em '楷体';"> 在排字中，行距指连续文本行的基线之间的距离。这个术语最早起源于手工排版时代，当时为了增大行间的垂直距离需要在行间插入薄铅条。QuarkXPress和Adobe InDesign等现代排版软件中仍然使用这个术语。</div>

那什么是文本行的基线之间的距离呢？还是用图来说明吧。

![enter image description here][4]  

英文字体有基线（baseline）和中线（meanline），这两条线之间就是所谓的“x-height”，即小写字母x的高度。基线之上的部分是上伸区域（ascent），基线之下的部分是下伸区域（descent）。小写字母超过中线之上的部分（如d上面的竖划）称字母的上伸部分（ascender），超过基线之下的部分（如字母q下面的竖划）称字母的下伸部分（descender）。英文大写字母都位于基线以上，顶部稍低于小写字母上伸部分的顶线<sup>1</sup>。

<sup>1. 这篇短文介绍了紧排（kerning）和字符间距（tracking）：[http://www.brightlemon.com/blog/typography-01-font-basics][5]。</sup>

如上图所示，两行文本的基线之间的距离是现代排版软件中所说的行距（leading）。这样定义行距是有意义的，因为知道了行距和行数，就能算出版心的高度，而版心高度加上、下页边距就是页面高度。下图就是InDesign中调整行距的“字符”面板，其中的图标清楚地表明，这里行距实际上就是一行的高度。

![enter image description here][6]

简言之，当我们在Word、WPS，或者InDesign、QuarkXPress中调整行距时，我们设定的其实是包括字体大小在内的文本行的高度，而不仅是文本行之间的距离。当你听到别人说“行距”或“行间距”时，一定要搞清楚他说的到底是哪个距离。有人可能会说：“‘行间距’也可以理解为‘两行文本基线之间的距离’吧”……算了，这事儿不能抬杠，反正意思你懂了。

明白了就里之后，那是不是可以认为《CSS设计指南（第3版）》说“`line-height`属性对应于印刷行业常说的leading”没有问题了呢？别急，一波总要三折嘛。

<h2 style="text-align:center;background:url(http://www.ituring.com.cn/download/01RTdGgRMvLZ) center no-repeat;">CSS的定义</h2>

如果说“行距”和“行间距”尚有一字之差，可以勉强分辨，那我们对相同字形的leading就更要多加小心了。如前所述，同样是leading，可能代表两个不一样而且容易混淆的含义：一是填充在两行文字之间的铅条，二是两行文字基线之间的距离。

那么，CSS中的leading到底采用了哪个意思呢？答案是前者，即填充在两行文字间的铅条。请参考下面的示意图。

![enter image description here][7]  
<sup>（图片出处：<http://doctype.com/calculating-lineheight-from-comp>）</sup>

CSS 2.1第10.8.1节（<http://www.w3.org/TR/CSS21/visudet.html#leading>）明确规定（参考上图）：

leading = `line-height` - `font-size`

其中一半leading加到文字上方，另一半leading加到文字下方。这一点与前面提到的排版软件对leading的实现有所不同，排版软件一般把leading加到文字上方。比如，如果字体大小是10点，而行距为18点，则多出的8点在InDesign中会被加在文字上方（为清晰起见，这里为文本加了下划线）。

![enter image description here][8]

而在CSS中，leading（0.8倍`font-size`的计算值）被平均分成了两半，分别加到文本行上方和下方。

![enter image description here][9]

上图的HTML和CSS代码分别如下所示。HTML：

```html
<h3>The way C works</h3>
<div>
Computers really only understand one language: machine code, 
<span>a binary stream of 1s and 0s</span>. You convert your C 
code into machine code with the aid of a compiler.
</div>
```

CSS：

```css
div { 
    line-height: 1.2;
    /*省略其他样式*/
}
span {
    line-height: 2;
    /*省略其他样式*/
}
```



另外，CSS 2.1还建议把`line-height`属性的默认值，也就是`normal`值设定为字体大小的1.0到1.2倍。这也是为什么把块级文本元素的上下外边距都去掉（`margin:0;`），其元素盒子仍然比字体还高的原因。Eric Meyer著名的CSS重置样式表（<http://meyerweb.com/eric/tools/css/reset/>）把根元素`body`的`line-height`重置为`1`，这相当于把所有元素行高中的leading重置为0。

综上所述，说“`line-height`属性对应于印刷行业常说的leading”还是有问题的。准确的表述应该是：“`line-height`属性包含了/实现了印刷行业常说的leading。”

