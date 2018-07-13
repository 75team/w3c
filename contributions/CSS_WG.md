## [@anjia](https://github.com/anjia)

- \#1102 [[css-grid-2] Allow minmax where max wins over min](https://github.com/w3c/csswg-drafts/issues/1102)
  - 提出了意见，给minmax()再多加个参数，大约这样 minmax(min-value, max-value, more-prior-item)
  - 最后，意见被标准采纳了，预计在 Grid Level 2 里会实现

- \#2682 [[css-text-3] word-wrap/overflow-wrap: break-word should affect min-content](https://github.com/w3c/csswg-drafts/issues/2682)
  - 表达了观点，说这虽然是个问题，但是可以“忽略”。因为前者影响 min-content 可以接受，符合逻辑
  - frivoal 回复我：我们应该以用户为中心，而不是考虑到开发者的心情
    - 我也表示了赞同，人家说的对，自己学到了

- \#2557 [[css-grid] Applying 'justify-content' content distribution is in the wrong place in the overall grid sizing algo](https://github.com/w3c/csswg-drafts/issues/2557)
  - 表达了观点：虽然 Gird 的 Layout 的算法细节我不特别清楚，但是我赞同FF的实现更符合预期，与 Chrome 的相比

- \#2701 [[css-nesting] request to pick up the css-nesting proposal](https://github.com/w3c/csswg-drafts/issues/2701)
  - 表达了观点，非常赞同CSS能原生支持嵌套
    - 讨论里其他前端开发人员也非常期待此功能
  - 但看会议纪要，还是被标记为 unknow/future spec了
    - 自己想探究下到底为什么，所以决定以这个为主题，写一篇文章。届时再解密

- \#885 [[css-shapes] Allow shape-outside to apply to initial letter](https://github.com/w3c/csswg-drafts/issues/885)
  - 表达了以下观点：
    - 两者并存更好，因为对于字体，根据字形裁剪更普遍
    - 关于覆盖，觉得直接让 shape-outside 生效更好
    - 如果 shape-outside 能实现 initial-letter-wrap 的现有功能，当然合二为一再好不过
