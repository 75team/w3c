
## `display`属性，なに？

`display`属性用来控制一个元素及其子元素的**格式化上下文**，你应该在刚刚学习CSS的时候就知道，有些元素是*块级元素*，有些则是*行内元素*。

有了`display`属性，你就可以切换元素不同的状态。比如说，通常一个`h1`元素是一个块级元素，但是通过切换，它可以以*内联元素*展现。

这几年，我们也知道了[Grid 布局](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)和[弹性盒布局](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout)。我们只需要将`display`属性的值设置为`display: grid`或`display: flex`就可以实现这两种布局。当`display`属性改变后，其子元素才变成了*flex*或者*grid*元素，从而对一些特性进行响应。


`display: grid`和`display: flex`对一个元素的产生了对外和对内两方面的影响。当一个原本是内联元素`span`的`display`属性被设置为`flex`，这个`span`元素就会变为一个块级元素，但其子元素却变为*flex*元素。如果我们想要这个被应用`display: grid`或`display: flex`的元素保持内联效果不变，则可以设置其为`display: inline-grid`或`display: inline-flex`。请看下面的代码片段：

![661ed9e3807373618e0348f81971e2f4.png](evernotecid://0A50264A-821C-4E5E-9BD3-FB0B69201A18/wwwevernotecom/191752691/ENResource/p39)


## 改造`display`属性

`display`属性可以从两个维度描述元素，对外来说它用来确认一个元素在普通文档流中的表现，比如说是块级元素或是内联元素；对内来说它改变其子元素的格式化上下文。

为了更好地描述这个行为，css的`display`属性的标准中现在允许接收两个值，第一个值用来描述他的外在表现，第二个值用来描述其子元素的格式。下面的列表中展示了部分新标准与单一值的对照：
![c67e73dc3b3fce61d0e222db292797e6.png](evernotecid://0A50264A-821C-4E5E-9BD3-FB0B69201A18/wwwevernotecom/191752691/ENResource/p41)
完整版请访问[CSS Display Module Level 3](https://drafts.csswg.org/css-display/#typedef-display-legacy)

目前为止，这个双值的写法只有Firefox 70实现了支持。

![4a4807250bfa601c1f3c2d9e4ef440b0.png](evernotecid://0A50264A-821C-4E5E-9BD3-FB0B69201A18/wwwevernotecom/191752691/ENResource/p42)
（Firefox 70中的效果截图）

## `display: inline-block`和`display: flow-root`

你也许注意到了， 原来的`display: block`变成了`display: block flow`, `display: inline`变成了`display: inline flow`，但是`flow-root`这个值是什么意思呢？

实际上，这个属性并不是一个新的属性，而是在CSS2里面就有的属性。

    [flow-root]
    The element generates a block container box, and lays out its contents using flow layout. It always establishes a new block formatting context for its contents. 
    
   翻译过来就是，应用这个属性之后的元素会生成一个块级容器盒，并使用流式布局将其内容展示出来，它总是为其内容创建新的块级上下文。
   
  下面的示例中展现了应用`flow-root`及未应用的区别。
  ![4cfe9996a10499af29f11409fe084eb2.png](evernotecid://0A50264A-821C-4E5E-9BD3-FB0B69201A18/wwwevernotecom/191752691/ENResource/p43)
  
  实际上`display: inline-block`和`display: flow-root`两个关联紧密，因为`display: inline-block`实际上就是`display: inline flow-root`。
  
  ## 我们现在能用这个双值属性吗？
  目前这个只有Firefox70支持了这一语法，但其他的浏览器仍将其当成非法的语法处理，因此生产情况下使用还是为时过早。目前所有的功能都可以用单一值来实现，所以这个新的语法可能会作为别名的形式存在，并且没有必要进行一刀式切换。
  
  然而，这种双值的写法有助于理解display属性的对内对外表现，它很清晰地展示了display对其自己以及其子元素的影响。无论是教学还是自学层面来说，清晰地关系总是会更好一些，不是吗？
  
  
  
  参考文章：
  
  1. https://hacks.mozilla.org/2019/10/the-two-value-syntax-of-the-css-display-property/?utm_source=dev-newsletter&utm_medium=email&utm_campaign=oct24-2019&utm_content=css
  2. https://div.io/topic/1973