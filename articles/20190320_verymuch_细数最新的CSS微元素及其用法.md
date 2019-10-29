## 引言

CSS中有两个很常见的概念，伪类和伪元素。

伪类用于在页面中的元素处于某个状态时，为其添加指定的样式。

伪元素会创建一个抽象的伪元素，这个元素不是DOM中的真实元素，但是会存在于最终的渲染树中，我们可以为其添加样式。

最常规的区分伪类和伪元素的方法是：**实现伪类的效果可以通过添加类来实现，但是想要实现伪元素的等价效果只能创建实际的DOM节点。**

此外，伪类是使用单冒号`:`，伪元素使用是双冒号`::`。

伪元素可以分为排版伪元素、突出显示伪元素、树中伪元素三类。下面我们一起看看具体都有哪些吧。

> 本文主要介绍[CSS Pseudo-Elements Module Level 4](https://www.w3.org/TR/2019/WD-css-pseudo-4-20190225/#window-interface)涉及的伪元素，因为该标准仍处于草案阶段，所以会存在变动的可能。本文旨在带大家了解有哪些现在以及将来可用的伪类。有兴趣的可以持续跟进。

## 第一类：排版伪元素

### 1. `::first-line`伪元素

这个伪元素大家应该很熟悉，因为早在CSS2.1中就存在了。它表示所属源元素的第一格式化行。可以定义这一行的样式。

如下面的CSS和HTML代码，其对应的效果如图所示。

```CSS
  p::first-line {
    text-transform: uppercase;
  }
```

```HTML
  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus quisquam ipsum sunt doloribus accusamus quae atque quaerat quam deleniti beatae, ipsam nobis dignissimos fugiat reiciendis error deserunt. Odio, eligendi placeat.</p>
```

![首行伪元素的基础效果](http://p0.qhimg.com/t0132539fc584f4ad64.png)

> 第一格式化行被截断的位置与元素的宽度、字体大小等很多因素有关，本文的截图均只为了展示效果而截取的。

虽然在DOM中看不到，但实际上，上面的这段HTML代码会通过添加虚拟标签的方式进行修改。如下：

```HTML
  <p><p::first-line>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p::first-line> Necessitatibus quisquam ipsum sunt doloribus accusamus quae atque quaerat quam deleniti beatae, ipsam nobis dignissimos fugiat reiciendis error deserunt. Odio, eligendi placeat.</p>
```

如果`::first-line`伪元素的应用会截断真实的元素，这个时候会在截断的位置前先闭合标签，在截断位置之后再重新添加开标签。对比如下两段代码：


```HTML
  <!-- 无伪元素 -->
  <p><span>Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus quisquam ipsum sunt doloribus accusamus quae atque quaerat quam deleniti beatae, ipsam nobis dignissimos fugiat reiciendis error deserunt.</span> Odio, eligendi placeat.</p>

  <!-- 有伪元素 -->
  <p><p::first-line><span>Lorem ipsum dolor sit amet consectetur adipisicing elit.</span></p::first-line><span> Necessitatibus quisquam ipsum sunt doloribus accusamus quae atque quaerat quam deleniti beatae, ipsam nobis dignissimos fugiat reiciendis error deserunt.</span> Odio, eligendi placeat.</p>
```
#### 1.1 如何确定第一格式化行

需要注意的是，`::first-line`伪元素只有应用在块级容器上才有效，且必须出现在相同流中的块级子孙元素中（即没有定位和浮动）。

如下所示，DIV的首行就是P元素的首行

```HTML
  <div>
    <p>Lorem ipsum</p> dolor sit amet consectetur adipisicing elit. Omnis asperiores voluptatem sit ipsa ex fugit provident tenetur eum pariatur impedit cumque corrupti iste expedita, esse nulla ad et excepturi. Iste!
  </div>

  <!-- 等价抽象代码 -->
  <div>
    <p><div::first-line>Lorem ipsum</div::first-line></p> dolor sit amet consectetur adipisicing elit. Omnis asperiores voluptatem sit ipsa ex fugit provident tenetur eum pariatur impedit cumque corrupti iste expedita, esse nulla ad et excepturi. Iste!
  </div>
```

![内嵌块级元素的首行效果](http://p7.qhimg.com/t01ab69821d22fe9427.png)

如果display值为`table-cell`和`inline-block`的元素的内容，不能作为祖先元素的第一格式化行内容。

如下所示，如果将上面HTML代码中p标签改为`display: inline-block`，则其不会应用首行效果。

如下所示，可以看出Lorem ipsum仍为小写：

```HTML
  <div>
    <p style="display: inline-block;">Lorem ipsum</p> dolor sit amet consectetur adipisicing elit. Omnis asperiores voluptatem sit ipsa ex fugit
    provident tenetur eum pariatur impedit cumque corrupti iste expedita, esse nulla ad et excepturi. Iste!
  </div>

  <!-- 等价抽象代码 -->
  <div>
    <p style="display: inline-block;">Lorem ipsum</p><div::first-line> dolor sit amet consectetur adipisicing elit. Omnis</div::first-line> asperiores voluptatem sit ipsa ex fugit
    provident tenetur eum pariatur impedit cumque corrupti iste expedita, esse nulla ad et excepturi. Iste!
  </div>
```

![内嵌非块级元素的首行效果](http://p2.qhimg.com/t01b5169338f4d74fe9.png)

#### 1.2 可以用于`::first-line`伪元素的样式

`::first-line`生成的伪元素的行为类似于一个行级元素，还有一些其他限制。主要有以下样式可以应用于其上：

* 所有的字体属性
* `color`和`opacity`属性
* 所有的背景属性
* 可以应用于行级元素的排版属性
* 文字装饰属性
* 可以用于行级元素的行布局属性
* 其他一些规范中特别指定可以应用的属性

此外，浏览器厂商有可能额外应用其他属性。

### 2. `::first-letter`伪元素

`::first-letter`伪元素代表所属源元素的第一格式化行的第一个排版字符单元，且其前面不能有任何其他内容。

`::first-letter`常用于下沉首字母效果。

如下，我们可以创建一个下沉两行的段落。第一种方法，是[CSS-INLINE-3](https://www.w3.org/TR/2019/WD-css-pseudo-4-20190225/#biblio-css-inline-3)中引入的，浏览器尚不支持。我们可以通过第二种方法实现同样的效果。

```HTML
  <p>“Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dignissimos hic vero reprehenderit sunt temporibus?
    Doloribus consequatur quo illo porro quae recusandae autem eos. Corrupti itaque alias nam eius animi illum.</p>
```

```CSS
  <!-- initial-letter(尚不支持) -->
  p::first-letter { initial-letter: 2; }

  <!-- 普通实现 -->
  h3 + p::first-letter { 
    float: left;
    display: inline-block;
    font-size: 32px;
    padding: 10px 15px;
  }
```

![首字母下沉效果](http://p1.qhimg.com/t0160d558882af78a29.png)

注意，第一个排版字符单元前的标点符号（可以是多个标点符号）也要包含在`::first-letter`伪元素内。[CSS3 TEXT](https://www.w3.org/TR/2019/WD-css-pseudo-4-20190225/#biblio-css3text)中规定，一个排版字符单元可以包含超过一个的Unicode码点。不同的语言也可以有额外的规则决定如何处理。

如果将要放入`::first-letter`伪元素的字符不在同一个元素中，如`<p>“<em>L`中的`"L`，浏览器可以选择一个元素创建伪元素，也可以两个都创建，或者都不创建。

在chrome下效果如下，还是挺奇怪的。所以尽量避免该情况。

![伪元素中的字符不在同一个元素内](http://p4.qhimg.com/t01b41bf71611e3b4ad.png)

此外，如果块元素的首字母不在行首（如由于双向重新排序），则浏览器不需要创建伪元素。

#### 2.1 如何确定首字母

首字母必须出现在第一格式化行内。

如下所示，将`b`标签改为`display: inline-block;`，则其不会出现在第一格式化行内，所以首字母无效果。

```HTML
  <p>“<b style="display: inline-block;">Lorem</b>” ipsum dolor sit amet, consectetur adipisicing elit. Dignissimos hic vero reprehenderit sunt temporibus?
    Doloribus consequatur quo illo porro quae recusandae autem eos. Corrupti itaque alias nam eius animi illum.</p>
```

![首字母不在首行内无效果](http://p0.qhimg.com/t01f60cc74cffe065d5.png)

目前，`::first-letter`只可用于块级元素，未来可能会允许应用到更多的`display`类型中。

伪元素的虚拟标签应当紧跟在首字母之前，哪怕这个首字母是在子孙元素，这一点和`::first-line`类似。

如下例，首字母首字母在子孙元素中，首字母的并没有加粗，因为伪元素是添加到span标签内部的，所以字重是正常的。

```CSS
  p { line-height: 1.1 }
  p::first-letter { font-size: 2em; font-weight: normal }
  span { font-weight: bold }
```

```HTML
  <p><span>Lorem ipsum</span> dolor sit amet consectetur adipisicing elit. Magni possimus rerum eaque architecto, adipisci neque odio, recusandae sapiente placeat ullam velit ratione esse aut expedita quae earum. Velit, dignissimos accusamus?</p>
```

![首字母在子孙元素的样式覆盖](http://p6.qhimg.com/t01b0018805155c151c.png)


如果元素有`::before`或者`::after`，则`::first-letter`伪元素也可以应用到其`content`值中。

如果元素是列表项（即`display: list-item`），则首字母会应用在标记符号后面。如下图：

![列表项的首字母](http://p4.qhimg.com/t01161934c1acc9d68f.png)

如果列表项的显示位置在内部（即`list-style-position: inside`），浏览器可以选择忽略`::first-letter`伪元素。


#### 2.2 可以用于`::first-letter`伪元素的样式

`::first-line`生成的伪元素的行为类似于一个行级元素，还有一些其他限制。主要有以下样式可以应用于其上：

* 所有的字体属性
* `color`和`opacity`属性
* 所有的背景属性
* 可以应用于行级元素的排版属性
* 文字装饰属性
* 可以用于行级元素的行布局属性
* `margin`和`padding`属性
* `border`和`box-shadow`
* 其他一些规范中特别指定可以应用的属性

同样，浏览器厂商有可能额外应用其他属性。

## 第二类：突出显示伪元素

突出显示伪元素表示文档中特定状态的部分，通常采用不同的样式展示该状态。如页面内容的选中。

突出显示伪元素**不需要在元素树中有体现，并且可以任意跨越元素边界而不考虑其嵌套结构**。

突出显示伪元素主要有以下几类：

1. `::selection`与`::inactive-selection`

  这两个伪元素表示用户在文档中选取的内容。`::selection`表示有效的选择，相反，`::inactive-selection`表示无效的选择（如当窗口无效，无法相应选中事件时）

  如下图所示，我们可以定义页面中选中内容的样式，输入框中的内容也可以。

  ![选中高亮样式](http://p3.qhimg.com/t018df68977e4e5eb69.png)

  请原谅我也无法触发`::inactive-selection`。大家知道它是干啥的就行了。

2. `::spelling-error`

  `::spelling-error`表示浏览器识别为拼写错误的文本部分。暂无实现。

3. `::grammar-error`

  `::grammar-error`表示浏览器识别为语法错误的文本部分。暂无实现。

`::spelling-error`和`::grammar-error`暂时均无实现。一方面，不同的语言的语法与拼写较为复杂。另一方面，`::spelling-error`和`::grammar-error`还可能会导致用户隐私的泄露，如用户名和地址等。所以浏览器实现必须避免读取这类突出显示内容的样式。

### 可以应用到突出显示类伪元素的样式

对于突出显示类伪元素，我们只可以应用不影响布局的属性。如下：

* `color`
* `background-color`
* `cursor`
* `caret-color`
* `caret-color`
* `text-decoration`及其相关属性
* `text-shadow`
* `stroke-color`/`fill-color`/`stroke-width`

> 草案中对这里可以应用的属性还有待确认，所以会存在一定的增减。现阶段，也只有color和background得到了支持。

## 第三类：存在于元素树中的伪元素：树中伪元素

这类伪元素会一直存在于元素树中，它们汇集成源元素的任何属性。

### 1. 内容生成伪元素：`::before`/`::after`

当`::before`/`::after`伪元素的`content`属性不为`'none'`时，这两类伪元素就会生成一个元素，作为源元素的子元素，**可以和DOM树中的元素一样定义样式**。

`::before`是在源元素的实际内容前添加伪元素。`::after`是在源元素的实际内容后添加伪元素。

正如上文提到的，与常规的元素一样，`::before`和`::after`两个伪元素可以包含`::first-line`和`::first-letter`。

### 2. 列表项标记伪元素：`::marker`

`::markder`可以用于定义列表项标记的样式。

如下，我们可以分开定义列表项及其内容的颜色。

```HTML
  <ul>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
  </ul>
```

```CSS
    li{
      color: red;
    }
    li::marker { 
      color:green;
    }
```

![自定义列表项标记颜色](http://p2.qhimg.com/t01c2ea1fa19a2683a8.png)

> 该伪元素暂时只有safari支持，尝试的话请使用safari。可以用于该伪元素的属性也有限，包括所有字体样式、`color`以及`text-combine-upright`，有待以后扩充。

### 3. 输入框占位伪元素：`::placeholder`

`::placeholder`表示输入框内占位提示文字。可以定义其样式。

如：

```CSS
  ::placeholder {
    color: blue;
  }
```

![输入框占位伪元素样式](http://p8.qhimg.com/t011001903fb568784f.png)

**所有可以应用到`::first-line`伪元素的样式都可以用于`::placeholder`上。**可以参考上面的内容。

> 注意还有一个`:placeholder-shown`伪类，它主要用于定义显示了占位文字的元元素本身的样式，而不是占位文字的样式。

## 总结

本文列举了[CSS Pseudo-Elements Module Level 4](https://www.w3.org/TR/2019/WD-css-pseudo-4-20190225/#window-interface)中的所有伪元素类型。

首先，详细介绍了排版类伪元素，这一类大家的使用场景较多，支持度也较好。

其次，介绍了突出显示类伪元素，主要可以用于选中样式的修改，其他的尚未得到支持。

最后，介绍了树中伪元素，包括`::before`/`::after`/`::marker`/`::placeholder`

虽然有些伪元素没有得到支持，或者可以应用的属性优先，但是CSS工作中正在进行一定的扩展。有兴趣的同学们可以持续关注。

CSS Pseudo-Elements Module Level 4：https://www.w3.org/TR/2019/WD-css-pseudo-4-20190225/#window-interface。