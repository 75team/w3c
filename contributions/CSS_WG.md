## [@anjia](https://github.com/anjia)

### 参与讨论的 Issues

模块      | ID      | 内容详情 | Gains&nbsp;
:-------:|---------|:-------- |----
grid     | 1102  | [[css-grid-2] Allow minmax where max wins over min](https://github.com/w3c/csswg-drafts/issues/1102)
&nbsp;   |         | 我的提议：可以给`minmax()`再多加一个参数，大约长这样`minmax(min-value, max-value, more-prior-item)`
&nbsp;   |        | 很开心，“第三个参数”的提议被采纳了，预计会在 Grid Level 2 里实现。彼时觉得自己是个对社会有用的人 :) | 有结果
&nbsp;   |2557   | [[css-grid] Applying 'justify-content' content distribution is in the wrong place in the overall grid sizing algo](https://github.com/w3c/csswg-drafts/issues/2557)
&nbsp;   |         | 我的观点：虽然 Gird Layout 的算法细节自己并不特别清楚，但是更赞同FF的实现，因为它更符合预期 ^^
nesting | 2701        | [[css-nesting] request to pick up the css-nesting proposal](https://github.com/w3c/csswg-drafts/issues/2701)
&nbsp;   |         | 我的观点：非常赞同和期待 CSS 能有原生嵌套 
&nbsp;   |         | 但看会议纪要，还是被标记为`unknow/future spec`了，自己想探究下为什么，所以决定以这个为切入点写一篇文章
&nbsp;   |         | 目前此 issue 已经 closed 了。我的文章也已出炉，感兴趣的朋友可点击[不用预编译，CSS直接写嵌套的日子就要到了](./articles/20180712_不用预编译，CSS直接写嵌套的日子就要到了.md) | 有产出
overflow | 2421 | [[css-overflow] How does max-lines interact with hidden content?](https://github.com/w3c/csswg-drafts/issues/2421)
&nbsp;   |         | 我的观点：也赞同不做改动
&nbsp;   |         | “它们两个都让字符不可见了，但一个算行另一个却不算”，初看似乎有点矛盾，其实是符合预期的，因为原因不同：<br/>`max-lines:1` 不算行，是因为它影响了布局；<br/>`max-height: 1lh; overflow: clip`算行，是因为`max-height: 1lh`影响了布局，而`overflow`只做了视觉上的裁切
inline   | 862   | [[css-inline] should initial-letter be plural?](https://github.com/w3c/csswg-drafts/issues/862)
&nbsp;   |         | 我的观点：针对要应用到第一个内联盒子里的多字母情形，感觉名字都不太合适呢，不论是`initial-letter/initial-letters`
&nbsp;   |         | 因为这已经不再是纯CSS了，而是和HTML结构相关了。或许`initial-child`或者其它什么名字更贴切些？
&nbsp;   |         | [dauwhe](https://github.com/dauwhe)（同时也是EPUB-电子出版工作组成员）回复我：<br/>这个属性旨在让block开头的大字母（一个或多个）正确的对齐。在印刷传统里，它们一直被叫做 initial letters 或者 drop caps，而他们之所以选择用前者是因为它覆盖了更多的用例。<br/>`initial-child`似乎是描述了属性应用的对象，而不是该属性所做的事情。所以，他认为我的提议`initial-child`也不太好，因为会让开发人员感到困惑。| 有交流
text     | 2682  | [[css-text-3] word-wrap/overflow-wrap: break-word should affect min-content](https://github.com/w3c/csswg-drafts/issues/2682)
&nbsp;   |         | 我的观点：虽然这是个问题，但可以“忽略”，因为前者影响`min-content`是符合逻辑的，可以接受
&nbsp;   |         | [frivoal](https://github.com/frivoal)回复我：我们应该以用户为中心，而不是只考虑开发者的心情   | 有交流
&nbsp;   |         | 对此，偶表示了赞同，人家说的对，自己学到了~
shapes   | 885   | [[css-shapes] Allow shape-outside to apply to initial letter](https://github.com/w3c/csswg-drafts/issues/885)
&nbsp;   |         | 我的观点： 
&nbsp;   |         | 两者并存会更好些，考虑到对字体而言根据字形裁剪的情况更普遍（[fantasai](https://github.com/fantasai)回复我两者是会并存的，现在的问题是当并存时如何处理覆盖） | 有交流
&nbsp;   |         | 关于覆盖，赞同让`shape-outside`的优先级更高（[astearns](https://github.com/astearns)评论道`shape-outside`也有类似的需求）
&nbsp;   |         | 如果`shape-outside`能实现`initial-letter-wrap`的现有功能，两者能合二为一更好啦，因为对于网页开发者而言，使用就更方便了~
&nbsp;   |         | 鉴于目前的情况，对`shape-outside`和`initial-letter-wrap`的属性值们给了一些其它建议
&nbsp;   |         | _（目前此 issue 暂无进展，预计此功能优先级不高/其它~）_
&nbsp;   |         |


### 阅读的 Issues

模块      | ID      | 内容   | 详情    | Notes&nbsp;
:-------:|---------|-------|:---------|----
nesting  | 2881  | Issue | [[css-nesting] Concern about combinatorial explosion](https://github.com/w3c/csswg-drafts/issues/2881) | 实现
&nbsp;   |         |       | 当嵌套太深时，会导致选择器数量呈指数级增长
&nbsp;   |         | 提议人 | Firefox的开发人员[upsuper](https://github.com/upsuper)
&nbsp;   |         | 描述   | 在预编译里也存在同样的问题，但不那么重要，因为开发人员可以通过最终生成的文件大小初步判断；但在原生实现里，情况就不一样了。他想寻求一种通用的方法来高效地实现嵌套规则，而不让选择器数量以指数爆增。
&nbsp;   |         | 解决方案 | 嵌套时限制不能是组合选择器？限制嵌套深度，3-4 或 5-6 层？ 
&nbsp;   |         |         | 前者被否定了，因为组合选择器是个功能性需求，不能被限制
&nbsp;   |         |  进展  | 仍在讨论中
&nbsp;   |         |       | 实现嵌套的唯一合理方法似乎是以指数级时间复杂度去匹配... 或者用空间换时间，以指数级空间复杂度去执行线性匹配。但目前尚未找到合适的匹配算法，让时间和空间都不是指数级
&nbsp;   |         |       |
