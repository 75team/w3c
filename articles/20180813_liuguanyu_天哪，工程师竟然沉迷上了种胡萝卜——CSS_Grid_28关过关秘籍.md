> 本文作者：刘观宇，360 奇舞团高级前端工程师、技术经理，曾参加 360 导航、360 影视、360 金融、360 游戏等多个大型前端项目。关注 W3C 标准、IOT、人工智能与机器学习的最新进展，W3C CSS 工作组成员。

> 十年磨一剑，霜刃未曾试。今日把示君，谁有不平事。 —— 唐·贾岛《剑客》

![](https://p0.ssl.qhimg.com/t01b807b853968f0d14.png)

### 游戏概况

[Grid Garden](https://cssgridgarden.com/)是[Codepip](https://codepip.com/)创建的一款寓教于乐的在线网页游戏，游戏共有 28 关。玩家可以通过过关的方式掌握 CSS 最新标准 CSS Grid。

游戏的设定是一个花园种植胡萝卜的场景，玩家通过在代码区填写 CSS Grid 的相关代码完成除草、浇水等任务。通过玩家的辛勤劳作，一定能够吃上纯天然、无公害的胡萝卜。

![](https://p0.ssl.qhimg.com/t01da9561c75f29dced.jpg)

打开游戏，我们发现，游戏存在多语言版。在左侧底部就可以切换各种语言。事实上，笔者对自己的英语水平是非常有信心的，所以毫不犹豫的切换到——简体中文版。

除了代码区和任务区，玩家可以在选关区选择 28 关的任意一关来挑战；当玩家在代码区敲入代码时候，右侧的任务和结果展示区会实时根据代码展现结果。如果代码完成了任务，则点击提交按钮，会进入下一关，如果玩家通关的话，则展示通关特效;如果代码不能完成任务，提交按钮会灰掉。如果玩家硬来，代码区会有一个错误特效供玩家欣赏:-(

除了游戏本身，游戏的目的是加深玩家对 CSS Grid 的理解。说到 CSS Grid，这可是一种强大的 Web 页面布局方式。恰当的使用 CSS Grid，可以高效地解决很多常见的布局问题，而且优雅、简洁。完整的 CSS Grid 属性参考，可查阅[这里](https://developer.mozilla.org/zh-CN/docs/Web/CSS/grid)。由于 CSS Grid 标准尚属 CR(CR，Candidate Recommendation)阶段，如果你是最新标准的爱好者，还可以跟进 CSS 工作组关于 CSS Grid 的[最新进展](https://drafts.csswg.org/css-grid/)。

尽管如此，现在主流浏览器都已经有了不同程度的支持，支持度如下图所示：

![](https://p4.ssl.qhimg.com/t01e5d56da6cbaedfad.jpg)

说到这里，各位都迫不及待地想要在游戏中一试身手了吧，那么话不多说，Let's Go。

### 过关实录

#### 跟网格项玩耍

也许各位玩家完全没有接触过 CSS Grid，刚刚进来可能会有些不知所措。我们姑且认为前面几关是教学关。一般游戏的教学关都会有一个人物在屏幕上蹦来蹦去外加叨逼叨来普及各种概念和操作。那么笔者现在就来饰演一下这个人物。

1. CSS Grid 元素主要分为两大类：`网格容器`和`网格项`。`网格容器`是父元素，`网格项`是子元素。
2. 对于`网格容器`和`网格项`各有不同的属性修饰。
3. 声明 Grid 布局要做的事情是在`网格容器`的 CSS 代码中指定`display: grid;`、`display: inline-grid;`或者`display: subgrid;`
4. `网格线`构成网格结构的分界线，是定位网格项的参照。下图就是行`row`和列`column`的第一个网格线的位置。换句话说，对于一个每行有 5 列的网格，它的每一行总共有 6 个`网格线`。如果这点看不清楚，那可能需要复习植树问题了:-(

![](https://p4.ssl.qhimg.com/t01be206680489428c0.jpg)

5. `网格轨道`是指相邻的`网格线`之间的部分，下图箭头所指是一个网格轨道。
   ![](https://p1.ssl.qhimg.com/t0175e15a4980f6d0a1.jpg)

掌握了这些知识我们就可以开始过关之旅了。

第 1 关到第 11 关设置主要是针对`网格项`属性`grid-column-start`和`grid-column-end`展开的，相当的简单，相信玩家一定可以很快的完成。

![](https://p3.ssl.qhimg.com/t01069e0bb0375de514.jpg)

下面简单总结一下第 1-11 关：

1. `grid-column-start`和`grid-column-end`作用于`网格项`。
2. 上述值可配合使用来解决跨行跨列问题。
3. `grid-column-start`和`grid-column-end`中，start 不一定比 end 小，逆向是被允许的。
4. 可以设置负值，负值的意思是从最后一个`网格线`算起的数值。
5. 除了取数值外，还可以使用`span`关键字。格式是`span <number>`意思是跨越多少个`网格轨道`
6. 可以使用`grid-column: <start>/<end>`来简写， `span`关键字适用此缩写。

上面可能出错的地方在于，设置数值时候，是确定`网格线`的顺序而非`网格轨道`的顺序，尤其是负数时候，而`span`后面跟着的数字是`网格轨道`的个数。只要牢记这点就很容易。

第 12 关与第 13 关，主要展示了 CSS Grid 在行`row`上设置的能力，二维空间的设置是 Grid 布局比`flex`布局拓展的一个方面。

这两关也比较简单。

![](https://p4.ssl.qhimg.com/t012dc5e285f7d60203.jpg)

从第 14 关开始，我们开始综合运用行与列的属性。
第 14 和 15 关的过关，需要灵活利用上述关键字。规范中还可以给轨道线命名，这里暂时没有遇到，我们先不使用“命名”这个利器。

![](https://p4.ssl.qhimg.com/t01f0538366906654a3.jpg)

第 16 关的意思是可以行列的简写方式，依然可以使用`grid-area`属性再次化简，`grid-area`接收 4 个由`/`隔开的值，依次为：`grid-row-start`, `grid-column-start`, `grid-row-end`, `grid-column-end`。

![](https://p5.ssl.qhimg.com/t01b1cd986966514680.jpg)

第 17 关告诉我们，重迭覆盖是不影响计算机制的。

![](https://p5.ssl.qhimg.com/t01b9d31e34aefc9dd7.jpg)

依然很简单，过。

针对 17 关的重叠，第 18-19 关引入了属性关键字：`order`，`order`类似于`z-index`，表明叠放顺序，数值越大，越在上。允许负数。

很简单是不是。

![](https://p3.ssl.qhimg.com/t01ccf473e2061e26df.jpg)

#### 跟网格容器玩耍

上面我们对`网格项`的“一波操作猛如虎”，下面我们再来看一看，对于`网格容器`的操作，能不能“横扫千军我做主”。

第 20 关到第 22 关主要针对`网格容器`的属性`grid-template-columns`和`grid-template-rows`展开的。

![](https://p1.ssl.qhimg.com/t019b6bd7a9c0d7abcb.jpg)

下面简单总结一下第 20-22 关：

1. `grid-template-columns`和`grid-template-rows`用于设置 Grid 布局的行列中`网格轨道`的大小
2. repeat 函数可以简化多个同值，格式为`repeat(N, value)`，其中 N 是个数，value 是值。repeat 可以与其他值混用，如：`grid-template-columns: repeat(N-1, value) value`
3. 定义上述属性时，允许长度单位混合使用。

第 23-25 关，主要说明了关键字`fr`的使用。

下面总结一下第 23-25 关：

1. `fr`是“分数”的英文单词`fraction`的简写。
2. `fr`用于等分等分网格容器剩余空间。那么`fr`是怎么分配空间的呢？举个例子说明：设有 A、B、C 三个`网格轨道`，他们的`grid-template-columns`的设置依次是`1fr`、`2fr`和`3fr`。那么他们共同把一个行分为 6 等分，则 A，B，C 的空间就依次获得了这一行的 1/6、2/6 和 3/6。
3. `fr`是可以和其他单位混用的，如`grid-template-columns: 1fr 50px 1fr 1fr;`。计算优先级记住一点即可：除了`auto`之外，先计算所有固定值(包括百分数)后，剩下的空间再计算`fr`。

![](https://p2.ssl.qhimg.com/t015df060710f9fb18b.jpg)

第 26 关介绍`grid-template-rows`与前面的`grid-template-columns`语法类似。留给玩家尝试。

![](https://p4.ssl.qhimg.com/t0155b0931d86eb75af.jpg)

第 27 关介绍了`grid-template-columns`与`grid-template-rows`的简写方式`grid-template`，写法是：`grid-template-rows` / `grid-template-columns`

![](https://p1.ssl.qhimg.com/t010278d7718f265313.jpg)

经历了百转千回，我们终于来到了关底，我们来看看大 BOSS 的尊容：

![](https://p1.ssl.qhimg.com/t01daafdc5eca66eec9.jpg)

WTF？只能写一行代码么？
仔细想想：`grid-template`最简洁，格式是`/`隔开的先行后列。
先解决行：需要把 50px 先分出去，后面 100%给到花草。再解决列，列的场景是典型的`fr`使用场景，杂草占空间的 1/5，胡萝卜占 4/5。

于是代码是：`grid-template: 1fr 50px/1fr 4fr;`

![](https://p3.ssl.qhimg.com/t01d9d4ad3afa7c3e17.jpg)

Bingo!恭喜你，通关成功！

![](https://p5.ssl.qhimg.com/t0188b69b9418dbde97.jpg)

### 结语

是的，我们已经最快速度领略了 CSS Grid 的风采。然而，对于整个的 CSS Grid 我们仅仅做了最常用的展示，更多的好玩的做法，还要等待大家的发掘，以及标准的演进。

![](https://p5.ssl.qhimg.com/t01fd9c26075754bc2e.jpg)

### 致谢

感谢李松峰老师、高峰、刘博文对本文修订提出的中肯意见。
设计师王旋美眉帮忙设计了精美的题图。
在此诚挚的表示感谢。
