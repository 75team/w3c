# 为什么不会有CSS4了？

简单地说，就是从CSS3开始，CSS规范就被拆成众多模块（module）单独进行升级，或者将新需求作为一个新模块来立项并进行标准化。因此今后不会再有CSS4、CSS5这种所谓大版本号的变更，有的只是CSS某个模块级别的跃迁。

### 引入模块化之前

按照CSS工作组的说法，CSS历史上并没有版本的概念，有的只是“级别”（level）的概念。比如，CSS3其实是CSS Level 3，CSS2是CSS Level 2，而CSS Level 1当然就是CSS1。每个级别都以上一个级别为基础。

大家都知道，CSS1早就作废了。CSS2其实基本上也已经作废了。但是，CSS1、CSS2（以及CSS2.1）在当时都是一个大而全的规范。而且，CSS2在成为最终标准的时候，W3C规范的流程里还没有定义CR这个阶段。

后来，W3C进一步完善了规范制定流程，要求每个规范都要经过以下五个阶段：

1. 工作草案（WD，Working Draft）
2. 最终工作草案（LC/LCWD，Last Call Working Draft）
3. 候选推荐（CR，Candidate Recommendation）
4. 提议推荐（PR，Proposed Recommendation）
5. 推荐标准（REC，Recommendation）

由于当初CSS2并没经过CR阶段，因此出现了很多问题。CSS工作组被无穷无尽的“改bug”搞得不厌其烦。结果，他们决定对CSS2进行一次修订，这就是CSS2.1（CSS Level 2 Revision 1）。换句话说，CSS2.1其实只是CSS2的一个修订版，并没有实质性变化。有些CSS2中的内容，CSS工作组认为不够成熟，于是从CSS2.1中删除了。这些删除的内容被视为回退到流程的CR阶段——相当于需要“回炉”。（后来，这些内容基本都以CSS模块的方式，经过修订和增补，进入了CSS Level 3。）

CSS2.1及之前的CSS规范把所有内容都写在一个文档里。随着CSS特性越来越多，越来越复杂，CSS规范的篇幅也越来越长。CSS2.1的PDF版有430页（[https://www.w3.org/TR/CSS2/css2.pdf](https://www.w3.org/TR/CSS2/css2.pdf)）。这就给勘误和进一步升级带来了极大不便。因为文档不同部分升级的进度不可能强求一致。

于是，CSS工作组决定从CSS2.1之后开始采取模块化的路线。就是把需要升级的内容独立成模块拆分出来，新增的需求也以新模块的方式立项。从此以后，CSS就进入了Level 3。

### 引入模块化之后

CSS采取模块化路线后，就有了三种模块，而且它们的命名方式非常值得注意。

- **CSS Level 2原有模块**：Selector、Color、Values and Units、BackgroundS and Borders等这些都是从原来CSS规范中拆出来的模块。这些模块的命名一开始就会从Level 3开始，比如Selectors Level 3（[https://www.w3.org/TR/css3-selectors/](https://www.w3.org/TR/css3-selectors/)）、CSS Backgrounds and Borders Level 3（[https://www.w3.org/TR/css3-background/](https://www.w3.org/TR/css3-background/)），因为它们都是在CSS Level 2的基础之上开始的。
- **新模块**：Multi-column Layout、Transitions、Flexible Box、Transforms等都是后来新增的模块，以前CSS中不存在类似特性。因此它们的命名会从Level 1开始，比如CSS Transitions Level 1（[https://www.w3.org/TR/css3-transitions/](https://www.w3.org/TR/css3-transitions/)）、CSS Flexible Box Module Level 1（[https://www.w3.org/TR/css-flexbox-1/](https://www.w3.org/TR/css-flexbox-1/)）。
- **当然，还有CSS2.1从CSS2中删除的内容**。如前所述，“被CSS2.1删除的CSS2中的内容，被视为回退到CR阶段”，而其中大部分内容都会以CSS Level 3的面目“转世”，一旦它们进入CR阶段，就会取代之前对应的内容成为新标准。

OK，上述任何模块的规范从WD推进到REC阶段，要么意味着新CSS模块诞生，要么意味着旧CSS模块重新焕发了生机！

希望下面这张图能更直观地说明CSS模块的命名：

![](https://s1.ssl.qhres.com/static/be5dea94aac966f5.svg)

### 模块还会有Level 4或更高

CSS到Level 3因为采取了“模块化”策略，本身不会再进化到Level 4了。正因为如此，CSS理论上永远不会出现CSS4。但是，CSS中的某个模块是可以到Level 4甚至更高级别的。比如，CSS Color Module就开始Level 4的升级之旅了（[https://www.w3.org/TR/css-color-4/](https://www.w3.org/TR/css-color-4/)）。

CSS snapshot 2017里是这么说的（[https://www.w3.org/TR/CSS/#css-levels](https://www.w3.org/TR/CSS/#css-levels)）：

> There is no CSS Level 4. Independent modules can reach level 4 or beyond, but CSS the language no longer has levels. ("CSS Level 3" as a term is used only to differentiate it from the previous monolithic versions.)
>
> 没有CSS Level 4。独立的模块可以到Level 4或更高级别，但CSS这门语言不会再有这个级别。（“CSS Level 3”作为一个概念，只是便于跟之前大而全的版本有所区别。）

以下是几个有用的参考链接。

- CSS snapshot列出了当前稳定的CSS模块：[https://www.w3.org/TR/css-2017/](https://www.w3.org/TR/css-2017/)；
- 这里列出了所有CSS模块：[https://www.w3.org/Style/CSS/current-work](https://www.w3.org/Style/CSS/current-work)；
- CSS工作组资深编辑、W3C特邀专家fantasai写的一篇导读：[https://www.w3.org/Style/CSS/read](https://www.w3.org/Style/CSS/read)。

有什么不明白的，欢迎大家留言！