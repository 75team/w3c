# Flexbox，终于可以承认自己明白了

Flexbox已经得到主流浏览器较新版本的广泛支持。对于某些需要兼容的旧版本浏览器，只要调整一下语法或提供商前缀，基本上也没问题。

## 两套属性

Flexbox有两套属性，一套针对可伸缩容器（flexible container），一套针对容器的直接子元素，或可伸缩项（flexible item）。

Flex容器，即应用`display:flex;`或`display: inline-flex`规则的元素，可以接受如下属性：

- `flex-direction`：指定主轴方向是水平还是垂直
- `flex-wrap`：指定可伸缩项是否折行
- `flex-flow`：以上两个属性的简写形式
- `justify-content`：指定可伸缩项在主轴方向上的对齐方式
- `align-items`：指定可伸缩项在辅轴方向上的对齐方式
- `align-content`：指定多行可伸缩项在辅轴方向上的对齐方式

容器的直接子元素或者可伸缩项，可以接受如下属性：

- `flex-grow`：指定当前项如何扩展
- `flex-shrink`：指定当前项如何收缩
- `flex-basis`：指定分配剩余空间之前当前项的初始大小
- `flex`：以上三个属性的简写形式
- `order`：指定当前项在容器中出现的次序

针对容器的属性非常容易理解，而针对可伸缩项的属性则不好理解。更确切地说，是`flex-grow`、`flex-shrink`和`flex-basis`属性不好理解。只有理解了这三个属性，你才能说自己真正理解了Flexbox。

## 最高优先级：flex-basis

要理解上述三个属性，必须先从`flex-basis`说起。这个属性决定CSS如何给可伸缩项在容器中分配初始大小（为简化讨论，以下一律假定“大小”为宽度，高度与之类似）。以下是这个属性几种常用的值：

- `auto`（默认值）
- `content`
- 长度或百分比值

`auto`的意思是首先看当前项有没有明确设置宽度，如果有则使用该宽度；如果没有，则以包含的内容决定宽度。

`content`是不管当前项是否明确设置了宽度，一律以内容决定宽度。

长度或百分比值呢？就是字面意思，百分比是相对于容器而言的。

知道如何确定可伸缩项的宽度是第一步。根据以上规则知道了每一项的宽度，简单相加就能得到所有项宽度的总和。而知道了所有项宽度的总和，再与容器宽度比较，就能知道容器里是不是还有剩余空间可供再次分配。这里有三种情况：

1. 所有项宽度总和等于容器宽度，剩余空间为零
2. 所有项宽度总和小于容器宽度，剩余空间为正
3. 所有项宽度总和大于宽度宽度，剩余空间为负

其中，剩余空间为正，代表有剩余空间可分配，也就是可伸缩项有条件扩展。至于如何扩展，那就要看每一项的`flex-grow`属性了。

而剩余空间为负，代表可伸缩项宽度总和超出了容器宽度，也就是可伸缩项必须收缩才能适应容器宽度。至于如何收缩，就得看每一项的`flex-shrink`属性。

## 有空地儿，怎么扩展？

如果容器内有剩余空间可供再次分配，那就看每一项的`flex-grow`属性。`flex-grow`的值必须是正整数，默认值为0。

默认值为0，就意味着不扩展。如果每一项的`flex-grow`都是0，那么空地儿就空着了。

只要有一项的`flex-grow`不是0，那么就要对空地儿进行重新分配。分配规则或者说算法如下：

```
当前项可分得的剩余空间 = ( 当前项`flex-grow`值/所有项`flex-grow`值之和 ) * 剩余总宽度
```

这是典型的按比例分配：每一项`flex-grow` 的值表示在有条件扩展时，当前项可以分得的剩余空间份数。

## 超宽了，怎么收缩？

如果所有项宽度之和大于容器宽度，说明出现了负空间。此时，需要根据每一项的`flex-shrink`值决定如何收缩，以适应容器宽度。

与`flex-grow`一样，`flex-shrink`也只接受正整数值，但是它的默认值是1，也就是说默认每一项都会收缩。

再次但是，注意，与`flex-grow`在扩展时简单地按比例分配不同，`flex-shrink`的收缩算法会稍微复杂一些，公式如下：

```
当前项收缩的宽度 = ( 当前项`flex-shrink` * 当前项`flex-basis` / 所有项`flex-shrink` * 与各自`flex-basis`乘积之和  ) * 需收缩的总宽度
```

这也是按比例收缩，只是在计算比例的分子分母时，除考虑`flex-shrink`本身，也要考虑`flex-basis`。假设每一项`flex-shrink`都是默认值1，那其实就是按照每一项`flex-basis`的占比进行收缩。

## 特例：flex-basis: 0;

假设把所有可伸缩项的`flex-basis`都设置为0，那就意味着这些项不会参与第一次容器空间的分配。

什么意思呢？如前所述，`flex-basis`值决定了CSS如何确定各伸缩项在容器中的初始宽度。确定各项初始宽度是对容器空间的首次分配。

如果初次分配各项初始宽度为0（`flex-basis: 0;`），那就是说容器的全部宽度都会进入二次分配环节。利用这一点，可以实现各伸缩项宽度的绝对平均化。

## 小结

好啦，咱们说的Flexbox，其实指的是CSS Flexible Box Layout Module Level 1（[https://www.w3.org/TR/css-flexbox-1/#flex-basis-property](https://www.w3.org/TR/css-flexbox-1/#flex-basis-property)）这个规范。由本文可知，理解Flexbox的重点并不在于容器，而在于可伸缩项。

> 关于CSS模块化与命名，可以参考我之前的文章：“为什么不会有CSS4了？”（[https://mp.weixin.qq.com/s/rQEN6rz2mLtN-Br6wNN-WQ](https://mp.weixin.qq.com/s/rQEN6rz2mLtN-Br6wNN-WQ)）。

很多介绍Flexbox的文章或教程把容器属性和可伸缩项属性等同视之，花同样篇幅来介绍，而且大都未涉及本文提到的具体算法，结果造成读者根本无法搞清楚`flex-basis`、`flex-grow`和`flex-shrink`这三个核心属性的内在关联。于是对Flexbox始终只能“知其然”，而不能“知其所以然”。

希望本文能够“填补这个空白”，让广大CSS使用者在真正透彻理解Flexbox基础上，运用好这个流行又强大的布局工具。

> 本文有一个小小的缺憾，就是没有配图，也没有代码和例子。但是，我相信，仅通过文字已经能很清楚地说明主题了。如果非要看图，请移步这篇纯图版：“一张图理解Flexbox的3个核心属性”（[https://lisongfeng.cn/post/understanding-3-main-properties-of-flexbox-in-one-figure.html](https://lisongfeng.cn/post/understanding-3-main-properties-of-flexbox-in-one-figure.html)，特别感谢360搜索的安佳同学帮忙编辑了这张图。）
>
> 还想看代码和例子？建议大家阅读图灵教育即将出版的《精通CSS（第3版）》（[http://www.ituring.com.cn/book/1910](http://www.ituring.com.cn/book/1910)）。

