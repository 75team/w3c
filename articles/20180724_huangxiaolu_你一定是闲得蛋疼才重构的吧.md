# 你一定是闲得蛋疼才重构的吧

> 随着“发布”进度条走到100%，重构的代码终于上线了。我露出了老母亲般的围笑……

最近看了一篇文章，叫《史上最烂的开发项目长啥样：苦撑12年，600多万行代码》，讲的是法国的一个软件项目，因为各种奇葩的原因，导致代码质量惨不忍睹，项目多年无法交付，最终还有公司领导入狱。里面有一些细节让人哭笑不得：一个右键响应事件需要花45分钟；读取700MB的数据，需要花7天时间。足见这个软件的性能有多糟心。

如果让笔者来接手这“坨”代码，内心早就飘过无数个敏感词。其实，笔者自己也维护着一套陈酿了将近7年的代码，随着后辈的添油加醋……哦不，添砖加瓦，功能逻辑日益复杂，代码也变得臃肿，维护起来步履维艰，性能也不尽如人意。终于有一天，我听见了内心的魔鬼在呼唤：“重构吧～～”

重构是一件磨人的事情，轻易使不得。好在兄弟们齐心协力，各方资源也配合到位。我们小步迭代了大半年，最后一鼓作气，终于完成了。今天跟大家分享一下这次重构的经验和收益。

## 挑战

此次重构的对象是一个大型单页应用。它实现了云端文件管理功能，共有10个路由页面，涉及文件上传、音视频播放、图片预览、套餐购买等几十个功能。前端使用QWrap、jQuery、RequireJS搭建，HTML使用PHP模板引擎Smarty编写。

<!--more-->
我们选择了Vue.js、vue-router、vuex来改造代码，用webpack完成模块打包的工作。仿佛一下子从原始社会迈向了新世纪，是不是很完美？

![](https://p1.ssl.qhimg.com/t018a67719fac2e633c.jpg)

（图片来自网络）

由于项目比较庞大，为了快速迭代，重构的过渡期允许新旧代码并存，开发完一部分就测试上线一部分，直到最终完全替代旧代码。

然鹅，我们很快就意识到一个问题：重构部分跟新增需求无法保证一致。比如重构到一半，线上功能变了……产品不会等重构完再往前发展。难不成要在新老代码中并行迭代相同的需求？

别慌，一定能想出更高效的解决办法。稍微分析一下，发现我们要处理三种情况：

**1. 产品需要新增一个功能。比如一个活动弹窗或路由页面。**

解决方法：新功能用vue组件实现，然后手动加载到页面。比如:

```javascript
const wrap = document.createElement('div')
document.body.appendChild(wrap)
new Vue({
  el: wrap,
  template: '<App />',
  components: { App }
})
```

如果这个组件必须跟老代码交互，就将组件暴露给全局变量，然后由老代码调用全局变量的方法。比如：

```javascript
// someApp.js
window.someApp = new Vue({
  ...
  methods: {
    funcA() {
      // do somthing
    }
  }
})
```

```javascript
// 老代码.js
...
window.someApp.funcA()
```

注意：全局变量名需要人工协调，避免命名冲突。PS：**这是过渡期的妥协，不是最终状态**。

新增一个路由页面时更棘手。聪明的读者一定会想到让新增的路由页面独立于已有的单页应用，**单独分配一个URL**，这样代码会更干净。

假如新增的路由页面需要实现十几个功能，而这些功能已经存在于旧代码中呢？权衡了需求的紧急性和对代码整洁度的追求，我们再次妥协（PS：这也是过渡期，不是最终状态）。大家不要轻易模仿，如果条件允许，还是新起一个页面吧，心情会舒畅很多哦。

**2. 产品需要修改老代码里的独立组件。**

解决方法：如果这个组件不是特别复杂，我们会以“夹带私货”的方式重构上线，这样还能顺便让测试童鞋帮忙验一下重构后有没有bug。具体实现参考第一种情况。

**3. 产品需要修改整站的公共部分。**

我们的网站包含好几个页面，此次重构的单页应用只是其中之一。它们共用了顶部导航栏。在这些页面模板中通过Smarty的`include`语法加载：

```html
{%include file="topPanel.inc"%}
```

产品在一次界面改版中提出要给导航栏加上一些功能的快捷入口，比如导入文件，购买套餐等。而这些功能在单页应用中已经用vue实现了。所以还得将导航栏实现为vue组件。

为了更快渲染导航栏，需要保留它原有的标签，而不是在JS里以组件的形式渲染。所以需要用到特殊手段：

- 在topPanel.inc里写上自定义标签，对应到vue组件，比如下面代码里的`<import-button>`。当JS未加载时，会立即渲染导航栏的常规标签以及自定义标签。

```html
<div id="topPanelMountee">
  <div id="topPanel">
      <div>一些页面直出的内容</div>
      ...
      <import-button>
        <button class="btn-import">
          导入
        </button>
      </import-button>
      ...
  </div>
</div>
```

- 导航栏组件：topPanel.js，它包含了`ImportButton`等子组件（对应上面的`<import-button>`）。等JS加载后，`ImportButton`组件就会挂载到`<import-button>`上并为这个按钮绑定行为。另外，注意下面代码中的`template`并不是`<App />`，而是一个ID选择器，这样topPanel组件就会以`#topPanelMountee `里的内容作为模板挂载到`#topPanelMountee`元素中，是不是很机智～

```javascript
// topPanel.js
new Vue({
  el: '#topPanelMountee',
  template: '#topPanelMountee',
  components: {
    ...
    ImportButton
  }
})
```



彻底重构后，我们还做了进一步的性能优化。

## 进一步优化

### 1. HTML瘦身

在采用组件化开发之前，HTML中预置了许多标签元素，比如：

```html
<button data-cn="del" class="del">删除</button>
<button data-cn="rename" class="rename">重命名</button>
...
```

当状态改变时，通过JS操作DOM来控制预置标签的内容或显示隐藏状态。这种做法不仅让HTML很臃肿，JS跟DOM的紧耦合也让人头大。改成组件化开发后，将这些元素统统删掉。

之前还使用了很多全局变量存放服务端输出的数据。比如：

```html
<script>
    var SYS_CONF = {
        userName: {%$userInfo.name%}
        ...
    }
</script>
```

随着时间的推移，这些全局变量越来越多，管理起来很费劲。还有一些已经废弃的变量，对HTML的体积做出了“贡献”。所以重构时只保留了必需的变量。更多数据则在运行时加载。

另外，在没有模板字面量的年代，HTML里大量使用了`script`标签存放运行时所需的模板元素。比如:

```html
<script type="text/template" id="sharePanel">
	<div class="share">
		...
	</div>
</script>
```

虽然上线时会把这些标签内的字符串提取成JS变量，以减小HTML的体积，但在开发时，这些`script`标签会增加代码阅读的难度，因为要不停地切换HTML和JS目录查找。所以重构后删掉了大量的`<script>`标签，使用vue的`<template>`以及ES6的模板字面量来管理模板字符串。

### 2. 渐进渲染

首屏想要更快渲染，还要确保文档加载的CSS和JS尽量少，因为它们会阻塞文档加载。所以我们尽可能延迟加载非关键组件。比如：

- **延迟非默认路由**

单页应用有很多路由组件。所以除了默认跳转的路由组件，将非默认路由组件打包成单独的chunk。使用`import()`的方式动态加载。只有命中该路由时，才加载组件。比如：

```javascript
const AsyncComp = () => import(/* webpackChunkName: "AsyncCompName" */ 'AsyncComp.vue')
const routes = [{
  path: '/some/path',
  meta: {
    type: 'sharelink',
    isValid: true,
    listKey: 'sharelink'
  },
  component: AsyncComp
}]
...
```

- **延迟不重要的展示型组件**

这些组件其实可以延迟到主要内容渲染完毕再加载。将这些组件单独打包为一个chunk。比如：

```javascript
import(/* webpackChunkName: "lazy_load" */ 'a.js')
import(/* webpackChunkName: "lazy_load" */ 'b.js')
```

- **延迟低频的功能**

如果某些功能属于低频操作，或者不是所有用户都需要。则可以选择延迟到需要的时候再加载。比如：

```javascript
async handler () {
  await const {someFunc} = import('someFuncModule')
  someFunc()
}
```

### 3. 优化图片

虽然代码做了很多优化，但是动辄几十到几百KB的图片瞬间碾压了辛苦重构带来的提升。所以图片的优化也是至关重要滴～

**1. PNG改成SVG**

由于项目曾经支持IE6-8，大量使用了PNG，JPEG等格式的图片。随着历史的车轮滚滚向前，IE6-8的用户占比已经大大降低，我们在去年放弃了对IE8-的支持。这样一来就能采取更优的解决方案啦～

我们的页面上有各种大小的图标和不同种类的占位图。原先使用位图并不能很好的适配retina显示器。现在改成SVG，只需要一套图片即可。相比PNG，SVG有以下优点：

1. 压缩后体积小
2. 无限缩放，不失真
3. retina显示器上清晰


**2. 进一步“压榨”SVG**

虽然换成SVG，但是还远远不够，使用webpack的loader可以有效地压缩SVG体积。

* 用svgo-loader去除无用属性

SVG本身既是文本也是图片。设计师提供的SVG大多有冗余的内容，比如一些无用的`defs`，`title`等，删除后并不会降低图片质量，还能减小图片体积。

我们使用svgo-loader对SVG做了一些优化，比如去掉无用属性，去掉空格换行等。这里就不细数它能提供的优化项目。大家可以对照svgo-loader的选项配置。

* 用svg-sprite-loader合并多个SVG

另外，SVG有多种用法，比如：img，background，inline，inline + `<use>`。如果某些图反复出现并且对页面渲染很关键，可以使用`svg-sprite-loader`将多个图合并成一个大的SVG，避免逐个发起图片请求。然后使用内联或者JS加载的方式将这个SVG引入页面，然后在需要的地方使用SVG的`<use>`标签引用该图标。合并后的大SVG如下图：

![](https://p4.ssl.qhimg.com/t01da09d0698869183f.png)

使用时：

```html
<svg>
  <use xlink:href="#icon-add"></use>
</svg>
```

即可在使用的位置展现该图标。

以上是一些优化手段，下面给大家分享一下重构后的收益。

## 重构的收益

以下是重构带来的收益：

| 收益项           | 重构前 | 重构后              |
| ---------------- | ------ | ------------------- |
| 组件化           | 无     | 100%                |
| 模块化           | 50%    | 100%                |
| 规范化           | 无     | ESLint 代码规范检查 |
| 语法             | ES5    | ES6+                |
| 首屏有效渲染时间 | 1.59s  | 1.28s（提升19%）    |
| 首次交互时间     | 2.56s  | 1.54s（提升39%）    |



- 组件化：从0到100%

  老代码没有组件的概念，都是指令式的编程模式以及对DOM的直接操作。重构后，改为组件化以后，可以充分利用组件的高复用性，以及虚拟DOM的性能优化，带来更愉悦的开发体验。

- 模块化：从50%到100%

  老代码中也用RequireJS做了一定程度的模块化，但是仅限于业务模块，没有解决第三方依赖的安装和升级问题。重构后，借助webpack和npm，只需要`npm install`安装第三方依赖，然后用`import`的方式加载。极大地提高了开发效率。

- 规范化：从0到1

  老代码几乎没有代码规范，甚至连同一份文件里都有不同的代码缩进，强迫症根本无法忍受。重构后，使用ESLint对代码格式进行了统一，代码看起来更加赏心悦目。

- ES6+语法：从0到大量使用

  老代码所使用的库因为历史悠久，加上没有引入转译流程，只能使用ES5语法。重构后，能够尽情使用箭头函数、解构、async/await等语言新特性来简化代码，从而提升开发体验。

- 性能提升

  根据上线前后Lighthouse的性能检测数据，首次有效渲染时间（First Meaningful Paint，FMP）提升 **19%** 。该指标表示用户看到有用信息的时间（比如文件列表）。首次交互（First Interactive，FI）提升 **39%**。该指标表示用户可以开始跟网页进行交互的时间 。

以上就是这次重构的总结。不要容忍代码里的坏味道，更不要容忍低效的开发模式。及时发现，勇敢改进吧～

## 参考

[Chrome 中的 First Meaningful Paint](https://meixg.cn/2017/08/01/first-meaningful-paint/)

[Using SVG](https://css-tricks.com/using-svg/)

[Modern JavaScript Explained For Dinosaurs](https://medium.com/the-node-js-collection/modern-javascript-explained-for-dinosaurs-f695e9747b70?source=userActivityShare-5c73882d22bf-1532143179)](https://medium.com/the-node-js-collection/modern-javascript-explained-for-dinosaurs-f695e9747b70?source=userActivityShare-5c73882d22bf-1532143179)