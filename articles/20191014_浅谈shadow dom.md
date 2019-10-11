## 为什么会有Shadow dom

你在实际的1开发中很可能遇到过这样的需求：实现一个可以拖拽的滑块，以实现范围选择、音量控制等需求。

除了直接用组件库，聪明的你肯定已经想到了多种解决办法。如在数据驱动框架React/Vue/Angular下，你可能会找到或编写对应的组件，通过相应数据状态的变更，完成相对复杂的交互；如在小快灵的项目下，用jQuery的Widget也是一个不错的选择；在或者，你可以点开你的HTML+JavaScript+CSS技能树，纯手工打造一个。这都是不难完成的任务。

当然，在完成之后，你可能会考虑对组件做一些提炼，下次再遇到同样的需求，你就可以气定神闲地“开箱即用”。

[这里](https://clair-design.github.io/component/slider)Clair组件库对这个需求的封装。

我们不妨从这个层面再多想一步。其实由于HTML和CSS默认都是全局可见的，因此，尤其是纯手工打造的组件，其样式是很容易受到所在环境的干扰的；由于选择器在组件层没有统一的保护手段，也会造成撰写时候的规则可以被随意修改；事件的捕获和冒泡过程会和所在环境密切相关，也可能会引起事件管理的混乱。

根据一般意义上“封装”的概念，我们希望相对组件来讲，DOM和CSS有一定的隐藏性；如非必要，外部的变化对于内部的有一定的隔离；同时，外界可以通过且仅可以通过一些可控的方法来影响内部，反之亦然。

针对这些问题，其实浏览器提供了一种名叫Shadow DOM的解决方案。这个方案目前与 Custom Elements、HTML Templates、CSS changes和JSON, CSS, HTML Modules并列为[Web Components标准](https://github.com/w3c/webcomponents)。

## Shadow DOM的概念

我们仍以上面的滑块作为例子。在最新的Chrome浏览器上，你可以输入如下代码来实现上面的功能：

```html
<input type="range" disabled min="20" max="100" defaultValue="30"/>
``` 

请打开DevTools中的“show user agent shadow DOM”：

![](https://p1.ssl.qhimg.com/t010ddc862b484179da.png)

在DevTools的Elements标签中，我们可以看到这个“组件”的实现细节。

![](https://p5.ssl.qhimg.com/t01c824429f8d05d74e.png)

上面的input range，可以看作是浏览器内置的一个组件。它是利用Shadow DOM来完成的一个组件。类似的，还有Audio、Video等组件。读者可以做类似的实验。

为了搞清Shadow DOM的机制，我们需要先厘清几个概念：

1. Shadow DOM: 是一种依附于文档原有节点的子 DOM，具有封装性。
1. Light DOM: 指原生的DOM节点，可以通过常规的API访问。Light DOM和Shadom DOM常常一起出现。这也是很有意思的一个比喻。一明一暗，灯下有影子。
1. Shadow Trees：Shadow DOM的树形结构。一般地，在Shadow Trees的节点不能直接被外部JavaScript的API和选择器访问到，但是浏览器会对这些节点做渲染。
1. Shadow Host：Shadow DOM所依附的DOM节点。
1. Shadow Root： Shadow Trees的根节点。外部JavaScript如果希望对Shadow Dom进行访问，通常会借助Shadow Root。
1. Shadow Boundary：Shadow Tree的边界，是JavaScript访问、CSS选择器访问的分界点。
1. content：指原本存在于Light DOM 结构中，被 <content> 标签添加到影子 DOM 中的节点。自Chrome 53以后，content标签被弃用，转而使用template和slot标签。
1. distributed nodes：指原本位于Light DOM，但被content或template+slot添加到Shadow DOM 中的节点。
1. template：一致标签。类似我们经常用的`<script type='tpl'>`，它不会被解析为dom树的一部分，template的内容可以被塞入到Shadow DOM中并且反复利用，在template中可以设置style，但只对这个template中的元素有效。
1. slot：与template合用的标签，用于在template中预留显示坑位。如：
   
```html
<div id="con">
    我是基础文字
    <span slot="main1">
      占位1
    </span>
    <span slot="main2">
      占位2
    </span>
    我还是基础文字 
</div>
<template id="tpl">
    我是模版
    <slot name="main1">
    </slot>
    <slot name="main2">
    </slot>
    我还是模版
</template>
```

下面这幅图，展示了上述概念的相互关系：

![](https://p3.ssl.qhimg.com/t019da09b06e0c45b73.png)

## Shadow DOM的特性

了解了Shadow DOM相关的概念，我们来了解一下相关的特性，以便更好地使用Shadow DOM：

1. DOM 的封装性：在不同的 Shadow Trees中无法选择另外 Shadow Tree 中的元素，只有获取对应的 Shadow Tree 才能对其中的元素进行操作。
1. 样式的封装性： 原则上，在Shadow Boundary外的样式，无法影响Shadow DOM的样式；而对于Shadow Tree内部的样式，可以由自身的style标签或样式指定；不同的Shadow Tree元素样式之间，也不会相互影响。
   对于需要影响的、以Shadow Boundary分离的样式，需要由特殊的方案显示指定，如：`:host`选择器，:host-context()选择器、::content()选择器等等。
1. JavaScript事件捕获与冒泡：
   传统的JavaScript事件捕获与冒泡，由于Shadow Boundary的存在，与一般的事件模型有一定的差异。
   在捕获阶段，当事件发生在Shadow Boundary以上，Shadow Boundary上层可以捕获事件，而Shadow Boundary下层无法捕获事件。
   在冒泡阶段，当事件发生在Shadow Boundary以下，Shadow Boundary上层会以Shadow Host作为事件发生的源对象，而Shadow Boundary下层可以获取到源对象。
   
   读者可以从这个[例子](https://jsbin.com/kiqatolede/1/edit?html,console,output)里感受一下。

## 如何使用shadow dom