## [@anjia](https://github.com/anjia)

- \#1102 [[css-grid-2] Allow minmax where max wins over min](https://github.com/w3c/csswg-drafts/issues/1102)
  - 我的提议：可以给`minmax()`再多加一个参数，大约长这样`minmax(min-value, max-value, more-prior-item)`
  - 结果：很开心，“第三个参数”的提议被采纳了，预计会在 Grid Level 2 里实现。彼时觉得自己是个对社会有用的人 :)

- \#2682 [[css-text-3] word-wrap/overflow-wrap: break-word should affect min-content](https://github.com/w3c/csswg-drafts/issues/2682)
  - 我的观点：虽然这是个问题，但可以“忽略”，因为前者影响`min-content`是符合逻辑的，可以接受
  - frivoal 回复我：我们应该以用户为中心，而不是只考虑开发者的心情
    - 对此，偶表示了赞同，人家说的对，自己学到了~

- \#2557 [[css-grid] Applying 'justify-content' content distribution is in the wrong place in the overall grid sizing algo](https://github.com/w3c/csswg-drafts/issues/2557)
  - 我的观点：虽然 Gird Layout 的算法细节自己并不特别清楚，但是更赞同FF的实现，因为更符合预期 ^^

- \#2701 [[css-nesting] request to pick up the css-nesting proposal](https://github.com/w3c/csswg-drafts/issues/2701)
  - 我的观点：非常赞同和期待 CSS 能有原生嵌套 
    - 但看会议纪要，还是被标记为`unknow/future spec`了
      - 自己想探究下为什么，所以决定以这个为切入点写一篇文章
    - 目前此 issue 已经 closed 了
      - 我的文章也已出炉，感兴趣的朋友可点击[不用预编译，CSS直接写嵌套的日子就要到了](./articles/20180712_不用预编译，CSS直接写嵌套的日子就要到了.md)

- \#885 [[css-shapes] Allow shape-outside to apply to initial letter](https://github.com/w3c/csswg-drafts/issues/885)
  - 我的观点：
    - 两者并存会更好些，考虑到对字体而言，根据字形裁剪的情况更普遍
    - 关于覆盖，赞同让`shape-outside`的优先级更高
    - 如果`shape-outside`能实现`initial-letter-wrap`的现有功能，两者能合二为一更好~（因为对于前端开发者而言，使用就更方便啦）
    - 鉴于目前的情况，对`shape-outside`和`initial-letter-wrap`的属性值们给了一些其它建议
      - > 目前此 issue 暂无进展，预计此功能优先级不高~
