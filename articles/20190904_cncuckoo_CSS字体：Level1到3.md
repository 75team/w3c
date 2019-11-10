# CSS字体，从Level 1到Level 3

本文是阅读CSS标准文档的笔记，也是对CSS字体相关知识的一个梳理。

## Cascading Style Sheets, level 1

CSS 1定义的字体属性包括：`font-family`、`font-style`、`font-variant`、`font-weight`、`font-size`和`font`。其算法要求UA(User Agent，用户代理)对给定元素中的字符逐个查找匹配的CSS属性，首先尝试匹配`font-style`，比如`italic`和`oblique`。然后匹配`font-variant`，`normal`匹配非`small-caps`(小型大写)字体，而`small-caps`则匹配(1)标识为`small-caps`的字体(2)合成小型大写字母的字体(3)将小写字母替换为大写字母的字体(小型大写字母可以通过将`normal`字体的大写字母缩小来实现)。接着匹配`font-weight`和`font-size`，这两个属性都是必须匹配成功的。

`font-family`是一个按照优先级排列的字体或通用字体名字的列表，每个名字以逗号分隔，表示多选一。

```css
body { font-family: gill, helvetica, sans-serif; }
```

有两种值：字体名和通用字体名。在上面的例子中，`gill`和`helvetica`就是明确指定的字体名，而`sans-serif`则是通用字体名。CSS 1定义了5种通用字体：

- `serif`：衬线
- `sans-serif`：非衬线
- `cursive`：手写
- `fantasy`：装饰
- `monospace`：等宽

通常，除了指定特定的字体名，最后都应该指定一个通用字体名。另外，如果字体名包含空格，必须用引号括起来。

`font-style`有3个值：`normal`、`italic`和`oblique`。`noraml`就是正常字体，而`italic`是斜体，`oblique`有可能是将正常字体倾斜后得到的。对于`italic`而言，如果没有`italic`字体，则使用`oblique`。

通常字体名字中包含Oblique、Slanted或Incline的，UA通常将其归类为`oblique`；而字体名字中包含Italic、Cursive或Kursiv的，UA则将其归类为`italic`。

`font-variant`主要用于指定`normal`和`small-caps`。真正的`small-caps`字体的字母比大写字母小一些，而且比例也稍有差异。但是，如果不是真正的`small-caps`字体，也可以将`normal`字体中的大写字母缩小后代替。实在不行，也可以直接用大写字母。

CSS 1只支持`small-caps`一种变体，不支持老式数字、小型大写数字、紧缩或疏松字母等其他变体。

`font-weight`选择字重，有关键字值`normal`、`bold`、`bolder`、`lighter`和数值100~900，表示笔画越来越粗。`normal`对应400，`bold`对应700。`bolder`和`lighter`则相对于从父元素继承的字重加粗或变细。现实中的字体(字体数据)都会有一个或几个属性的值用于描述字体的"重量"。但不同字体使用的属性值并不统一，比如包含以下关键字的值似乎都可以认为是粗体：Regular、Roman、Book、Medium、Semi-、DemiBold、Bold或Black，具体要看其`normal`字形有多重。正因为如此，CSS 1才定义了一系列数值。OpenType使用9个数值区分字重，可以直接对应。但并非所有字体都有那么多字重，CSS 1为此也定义了如何向前或向后"寻值"，比如500如果没有，则用400。

`font-size`定义了绝对值、相对值、长度值和百分比值。绝对值包括`xx-small`、`x-small`、`small`、`medium`、`large`、`x-large`和`xx-large`等关键字，它们在UA里以1.5倍的比例差异保存着绝对大小。相对值有`larger`和`smaller`关键字，取决于父元素文本大小的绝对值。不允许负值。

最后，`font`是以上所有属性的简写属性，可以同时设置`font-style`、`font-variant`、`font-weight`、`font-size`、`line-height`和`font-family`。这个属性借鉴了传统排版中的同时设置多个属性的简写法。

## Cascading Style Sheets Level 2 Revision 1 (CSS 2.1)

CSS 1奠定了字体属性的格局。CSS 2.1仅对CSS 1进行了补充和扩展。

首先，CSS 1只规定`font-family`最后要使用一种通用字体作为后备，并没有详细说明这些字体的特点和举例。CSS 2.1则详细解读了`serif`、`sans-serif`、`cursive`、`fantasy`和`monospace`。

其次，对所有属性统一增加了`inherit`关键字。而且，`font-variant`仍然只支持`small-caps`一种变体形式。

最后，CSS 2.1比较重要的一个增补，是为`font`简写属性增加了6种系统字体关键字：`caption`、`icon`、`menu`、`message-box`、`small-caption`和`status-bar`。比如，通过`font: menu;`可以让网页中的某个元素继承系统菜单中使用的字体及属性。假设系统菜单使用了12像素、字重600的Times，则`font: menu`就相当于：

```css
font: 600 12px Times;
```

因为系统字体的样式只能整体继承，不能单独获取，所以只能通过`font`简写属性来继承系统字体的样式。另外，由于`font`简写属性会将所有没有明确给出的值重置为相应的初始值，所以上面的声明又相当于：

```css
font-family: Times;
font-style: normal;
font-variant: normal;
font-weight: 600;
font-size: 12px;
line-height: normal;
```

## CSS Fonts Module Level 3

我们知道，从CSS3开始，CSS规范被拆成众多模块单独升级，新的需求也会作为一个新模块来立项并标准化。在CSS 2.1之后，CSS中关于字体的内容就独立为CSS3 Fonts模块。同时为了支持可下载的自定义字体，又创建了CSS3 Web Fonts模块。

但最终，CSS3 Fonts和CSS3 Web Fonts合并为CSS Fonts Module Level 3（以下简称"ML3"）。后来，ML3中涉及字体加载的内容，又独立为CSS Font Loading Module Level 3。

ML3进一步细化了CSS字体属性的内涵和外延。比如，对于`font-family`字体列表中出现的字体名。ML3就进一步说明：

> 字体名只指定一种字体的名字，而不能指定该种字体中某一个字体。比如，Futura是一种字体，它又包含Futura Medium、Futura Medium Italic、Futura Condensed Medium和Futura Condensed ExtraBold字体。

ML3还增加了`font-stretch`属性，用于从字体中选择正常、紧缩或疏松的字形，有以下关键字值：

- ultra-condensed
- extra-condensed
- condensed
- semi-condensed
- normal
- semi-expanded
- expanded
- extra-expanded
- ultra-expanded

另外，对于之前`font-style`属性所谓的"伪斜体"关键字`oblique`，也可以通过`font-synthesis`属性设置是否启用。因为对某些文字，比如西里尔文字，真正的斜体与人工合成的斜体差别很大。比如，下面的规则禁止UA合成阿拉伯文斜体：

```css
*:lang(ar) { font-synthesis: none; }
```

ML3还增加了`font-size-adjust`属性，用于在使用备用字体时，依然能保持原本所要使用字体的纵横比（小写字母与大写字母的相对高度），从而保证可读性。

### @font-face

如前所述，ML3最大的变化就是增加了Font Resource一节。这一节定义了`@font-face`规则，`@font-face`规则用于定义一个（种）新的字体，其属性由包含在花括号内的规则描述符声明决定。其中，`font-family`和`src`是必需的描述符。(注意，在普通CSS声明里，`font-family`和`src`是属性，而在`@font-face`规则里，因为是用于定义新字体，所以`font-family`和`src`就成了描述符，即用于描述新字体的属性。)

`font-family`描述符定义字体名字，会覆盖底层字体文件中的名字，而且如果名字跟系统字体冲突，还会覆盖系统字体。

`src`描述符定义字体的来源，其值为按优先次序排列的来源列表，来源本地使用`local()`引入，来源外部使用`url()`引入。使用`url()`引入外部字体时，可以用`format()`添加字体格式的提示。ML3定义的有效字体格式字符串有：

| 格式字符串            | 字体格式                                                     | 常见扩展名  |
| :-------------------- | :----------------------------------------------------------- | :---------- |
| `"woff"`              | [WOFF 1.0 (Web Open Font Format)](https://www.w3.org/TR/WOFF/) | .woff       |
| `"woff2"`             | [WOFF 2.0 (Web Open Font Format)](https://www.w3.org/TR/WOFF2/) | .woff2      |
| `"truetype"`          | [TrueType](https://docs.microsoft.com/en-us/typography/opentype/spec/) | .ttf        |
| `"opentype"`          | [OpenType](https://docs.microsoft.com/en-us/typography/opentype/spec/) | .ttf, .otf  |
| `"embedded-opentype"` | [Embedded OpenType](https://www.w3.org/Submission/2008/SUBM-EOT-20080305/) | .eot        |
| `"svg"`               | [SVG Font](https://www.w3.org/TR/SVG11/fonts.html)           | .svg, .svgz |

此外，由于OpenType是TrueType超集和扩展，字符串"truetype"和"opentype"表示的意思是一样的。

```css
/* 尽可能加载WOFF2字体，然后WOFF，否则OpenType */
@font-face {
  font-family: bodytext;
  src: url(ideal-sans-serif.woff2) format("woff2"),
       url(good-sans-serif.woff) format("woff"),
       url(basic-sans-serif.ttf) format("opentype");
}
```

在使用`local()`加载本地字体时，因为UA要匹配字体文件中包含的全名，而同一字体在不同平台下的全名可能不一样，因此需要指定所有可能的名字，以便跨平台使用。

```css
/* 定义Gentium字体的粗体 */
@font-face {
  font-family: MyGentium;
  src: local(Gentium Bold),    /* 全名 */
       local(Gentium-Bold),    /* Postscript名 */
       url(GentiumBold.woff);  /* 找不到就下载 */
  font-weight: bold;
}
```

`local()`函数很有用，比如上面的例子其实是为不同平台下的同一款字体创建了一个统一的别名。再比如下面的例子，用于将一种大字体中永远都不会被引用到的字体抽取出来：

```css
@font-face {
  font-family: Hoefler Text Ornaments;
  /* 与Hoefler Text Regular具有相同的字体属性 */
  src: local(HoeflerText-Ornaments);
}
```

另外，ML3规定UA只能优先使用字体文件中的英文全名来匹配字体。即便用户操作系统将地区设置为比如德国、芬兰，而字体文件中也有德语、芬兰语的字体全名，也要匹配英文全名，这是为了全平台统一起见。因此下面`h2`最终会使用默认的衬线字体：

```css
@font-face {
  font-family: SectionHeader;
  src: local("Arial Lihavoitu");  /* Arial Bold的芬兰语全名 */
  font-weight: bold;
}

h2 { font-family: SectionHeader, serif; }
```

最后，如果存在多个`src`描述符，后声明的会覆盖先声明的：

```css
@font-face {
  font-family: MainText;
  src: url(gentium.eot);                     /* 针对老UA */
  src: local("Gentium"), url(gentium.woff);  /* 覆盖前面的 */
}
```

`font-style`、`font-weight`和`font-stretch`这三个描述符的值跟对应属性的值一样，只是不允许使用相对关键字`bolder`和`lighter`。

综上所述，`@font-face`规则的引入为CSS字体的使用提供了很大便利。事实上，只有结合马上要出场的`unicode-range`描述符，`@font-face`规则才能发挥出最大的潜力。

### unicode-range

`unicode-range`描述符用于指定当前定义字体支持的Unicode码点(code point)，是一个逗号分隔的Unicode范围值。这相当于定义了一个字符集，UA可以根据这个字符集来决定针对某个文字是否需要下载新字体。

Unicode范围值支持单个码点(如`U+416`)、码点区间(如`U+400-4ff`)和通配范围(如`U+4??`)。

那么Unicdoe范围或者说字符范围(字符集)有什么用呢？可以用多个`@font-face`规则和不同的Unicode范围共同定义一个复合型字体。换句话说，可以在一个自定义字体中包含来自不同语言文字的多个字体的不同字形，也可以定义一个只包含某种字体常用或罕用字符的新字体。如果同一个新字体的多个`@font-face`规则中的Unicode范围有重合，那么最后定义的规则先匹配。

下面的规则会基于日文字体MSMincho和英文字体Gentium定义一个新字体JapaneseWithGentium，其中拉丁字母的字形来自Gentium字体，其他字形来自MSMincho。

```css
@font-face {
  font-family: JapaneseWithGentium;
  src: local(MSMincho);
  /* 不指定范围，默认为全部范围 */
}

@font-face {
  font-family: JapaneseWithGentium;
  src: url(../fonts/Gentium.woff);
  unicode-range: U+0-2FF;
  /* 最后定义的规则优先匹配 */
}
```

利用`@font-face`的层叠规则，还可以实现对字体的"按需下载"。比如，在下面的例子，如果只需要拉丁字符的字形，UA只会下载DroidSans.woff。

```css
/* 后备字体：4.5MB */
@font-face {
  font-family: DroidSans;
  src: url(DroidSansFallback.woff);
  /* 不指定范围，默认为全部范围 */
}

/* 日文字形：1.2MB */
@font-face {
  font-family: DroidSans;
  src: url(DroidSansJapanese.woff);
  unicode-range: U+3000-9FFF, U+ff??;
}

/* 拉丁、希腊、西里尔及标点、符号：190KB */
@font-face {
  font-family: DroidSans;
  src: url(DroidSans.woff);
  unicode-range: U+000-5FF, U+1e00-1fff, U+2000-2300;
}
```

ML3规定，`@font-face`指定的字体资源采用懒加载策略，即如果不用到，就不下载。样式表里可以定义很多`@font-face`，但UA必须只下载那些样式规则中引用到的字体。有一个例外就是当自定义字体作为后备字体时，UA可以提前下载，比如：

```css
@font-face {
  /* 自定义字体 */
  font-family: GeometricModern;
  src: url(font.woff);
}

p {
  /* 只有应用给p元素时才下载 */
  font-family: GeometricModern, sans-serif;
}

h2 {
  /* 即便本地有Futura，也会下载 */
  font-family: Futura, GeometricModern, sans-serif;
}
```

一般情况下，页面都会先于字体加载完。此时使用自定义字体的文本应该如何显示呢？ML3规定UA可以按照自定义字体不可用的情形来渲染字体，或者用后备字体将文本渲染为透明的。但在自定义字体下载失败后，UA必须显示文本。因此，ML3也要求样式表作者指定与自定义字体大小类似的后备字体。

关于字体的获取，ML3规定必须使用启用CORS的手段，使用`Anonymous`模式，将`referrer`设置为样式表的URL，将`origin`设置为包含样式表的文档的URL。

关于字体匹配，ML3是有史以来最详细的。它增加了`font-stretch`的匹配，罗列出了`font-style`所有可能的匹配情形。`small-caps`完全从字体匹配流程中剥离，由字体特性来处理。要求必须使用Unicode变体选择符。簇序列作为一个单位匹配。

### 字体特性

如前所述，`font-variant`属性一直以来只有一个`small-caps`变体。而实践中使用的字体远不止只有小型大写字母一种变化形式。为此，ML3扩展了`font-variant`属性，使其成为了控制所有样式相关字体特性的一个简写属性。

换句话说，`font-variant`有了`font-variant-ligatures`、`font-variant-postion`、`font-variant-caps`、`font-variant-numeric`、`font-variant-east-asian`等具体属性。

字体特性可以通过`font-variant`或`font-feature-settings`来启用。具体细节因为涉及英文字体的很多古老传统，有兴趣的读者可以自行学习。

## 尾声

CSS Font Module Level 3在2018年9月成为W3C推荐标准，随即又开始了CSS Fonts Module Level 4，包含了一些CSS字体相关的试验性特性。另外，从CSS Font Module Level 3中独立出去的CSS Font Loading Module Level 3已经得到主流浏览器较新版本的支持。

### 相关链接

- Cascading Style Sheets, level 1（<https://www.w3.org/TR/REC-CSS1/>）
- Cascading Style Sheets Level 2 Revision 1 (CSS 2.1)（<https://www.w3.org/TR/2011/REC-CSS2-20110607/>）
- CSS Font Module Level 3（<https://drafts.csswg.org/css-fonts-3/>）
- CSS Fonts Module Level 4（<https://drafts.csswg.org/css-fonts-4/>）
- CSS Font Loading Module Level 3（<https://drafts.csswg.org/css-font-loading-3/>）
- Character Model for the World Wide Web 1.0: Fundamentals：（<https://www.w3.org/TR/2005/REC-charmod-20050215/>）

