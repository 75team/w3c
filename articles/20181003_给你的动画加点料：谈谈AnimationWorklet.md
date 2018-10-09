![](https://p0.ssl.qhimg.com/t01fc81a6738fb29954.png)

> 残阳西入崦，茅屋访孤僧。落叶人何在，寒云路几层。 独敲初夜磬，闲倚一枝藤。世界微尘里，吾宁爱与憎。 ——唐.李商隐 《北青萝》

### 引子

浏览器接收到 HTML 代码后，需要将其显示到屏幕上。不同的浏览器的处理方案有一定的差异。对此，谷歌工程师 Paul Lewis 给出了一个简明的 Rendering Pipeline 模型来说明浏览器解析流程。
![](https://p0.ssl.qhimg.com/t015f6d1eddc0a8d81c.jpg)
据此，Paul 在这篇文章<sup>1</sup>中， 详细地分析了浏览器每一步的职责以及几种常见的运行模式。

做为一个立志给用户最好的浏览体验的 Web 工程师，肯定希望在上述必要的步骤中和浏览器配合，作出必要的优化。

开发者可以通过 JavaScript 或者 CSS 来控制 DOM 和 CSSOM。对应于上图，也就是前两个阶段。在这两个阶段，开发者几乎可以随心所欲地控制 DOM 和 CSSOM。但是，后三个阶段，对 Web 开发者是黑盒。它们的行为，是由浏览器自动完成的，开发者只能通过前两个阶段的操作，间接地影响后面的阶段。

这不是我们想要的结果。

其实，各大浏览器厂商也意识到了这个问题的存在。因此，W3C 的 CSS 工作组，有一个活跃的工作小组，称为 CSS Houdini。CSS Houdini 是由一群来自 Mozilla、Apple、Opera、Microsoft、HP、Intel、IBM、Adobe 与 Google 等公司的工程师所组成的工作小组。这个小组希望指定一系列 API。通过这些 API，Web 开发者也能介入到浏览器的 CSS 解析引擎，从而和浏览器更好的配合，来解决性能、一致性等问题。这些 API 实现后，也许 CSS 的某些新标准也可以借助 Polyfill 在尚未实现的浏览器中体验了。

来自爱尔兰都柏林的资深工程师、开源软件组织成员 Serg Hospodarets<sup>2</sup>在 2018 年 3 月进行了一个关于 CSS Houdini 的演讲<sup>3</sup>。演讲文稿中，对 Houdini 的任务模块做了如下的划分：
![](https://p3.ssl.qhimg.com/t01abd40d7561e69fa5.png)

在这张图中，读者可以看到，浏览器渲染引擎的“白盒化”的标准，大致分了几个类：有对自定义属性的规范，有给 CSSOM 引入类型系统的规范，有解析 CSS 的规范，有字体属性与测量的规范，也有对 Layout、paint 和 Composite 的接口规范。

这里 Layout、Paint 和 Composite 的接口主要是通过 Web Worker 的机制实现的。关于 Layout、Paint 的 API，奇舞周刊后面的文章会给读者做详细的介绍，这篇文章，笔者将和读者主要谈一谈 Composite 相关的 CSS Animation Worklet API。

终于，本文的主角要登场了。没错，就是它，Animation Worklet。

### 什么是 Animation Worklet

那么 Animation Worklet 到底是做什么的呢？

首先，大家来回想下，一般是怎么制作动画效果的？

最简单的做法，我们使用 setTimeout 和 setInterval 来做动画，动画以时间间隔做为变化的依据。

但很快，人们发现当帧率过快时候，比如小于 16.7ms 一帧的时候，动画会发生丢帧的情况。张鑫旭老师的这篇文章<sup>4</sup>非常形象和趣味地解释了这个问题。

随后，浏览器厂商开放了一个更有效率的 API：`requestAnimationFrame`。之所以更有效率，在于这实际上是一个基于动画帧发生的回调。这种设计的高明之处在于把帧与时间解耦，从而不再受制于显示器的刷新率。

这个结果似乎已经很完美了，不过这里还有一点问题。以 Chrome 浏览器为例，渲染引擎分主线程和 Compositor 线程。Layout 完成之后，主线程维护了一份 Layer 树，Compositor 维护了一个副本。如果我是主线程，我一定会对这个分担我的运行压力，并且定期和我同步、听候我同步指令的线程兄弟，欣赏有加的。然而，`requestAnimationFrame`是运行在主线程的。一旦主线程非常繁忙，动画的效率会大打折扣。

怎么才能让 Compositor 线程分担主线程的压力呢？读者不妨参考https://csstriggers.com/ 。只要不触发 Layout 或 Paint 的属性改变，就可以让 Compositor 线程独立工作，并择机同步给主线程。CSS3 动画引入的 transform 就是这个原理。使用了 transform 的动画，往往会比 JavaScript 动画更流畅。对啊，那可是多人干活啊。

好了，如果是这样，我们就尽量研习规范，把工作丢给 Compositor 线程就好了呗。但是，理想总是美好的，现实总是骨感的：能确定丢给 Compositor 线程独立工作，主线程无需参与的，现在还不太丰富。

Animation Worklet 的出现，就是为了满足这个痛点出现的。一方面，可以借助 JavaScript 的威力制作强大而精确控制的动画，一方面可以在 Compositor 线程独立工作。它的目标旨在兼容目前的 Web Animations 标准，尽可能的使用现有的结构，以其使用这组 API 能平衡动画的性能、丰富性和合理性。

Animation Worklet 最早曾经被称为 Compositor Worklet。顾名思义，之前的这些代码是可以直接执行在 Compositor 线程的。直到 2016 年，Houdini 小组在 TPAC 会议（TPAC 会议，W3C 的年度重要技术会议之一。参会者在五天的时间里，共同协调未来开放 Web 平台的技术方向，讨论 W3C 的组织策略）期间，提出对 API 的新建议，主要的变化是不再允许用户代码直接运行在 Compositor 线程。这种变化的原因在于，游览器厂商担心如果有大量的或者低效的用户代码阻塞住了 Compositor 线程，页面将没有反应，动画也将停滞。

新的 API 被重新命名为：Animation Worklet。在 Animation Worklet 里，用户代码不会直接运行在 Compositor 线程。Compositor 线程会尽力和这个线程保持同步。所以，如果代码效率实在“惨不忍睹”，Compositor 线程可能会对其有一定的弱化处理。

为了说明 Animation Worklet，下面先简单讲讲 Worklet 和 Web Animations。

#### 什么是 Worklet

前面提到过，Layout、Paint 和 Composite 的接口主要是通过 Web Worker 的机制实现的。而 Worklet 的接口是一个轻量版的 Web Worker 的版本。借助这个接口，Web 开发者可以获得渲染引擎的底层部分的访问权限，从而使得高性能的诉求称为可能。

Worklet 被严格限制用途，不能随意创建。目前有四类 Worklet：PaintWorklet、AudioWorklet、AnimationWorklet 和 LayoutWorklet。

各种 let 只有一个公用的方法：addModule，返回一个 Promise。Promise 的 resolve 时，已将 URL 所示的脚本模块加载到了当前的 Worklet。

```
interface Worklet {
    [NewObject] Promise<void> addModule(USVString moduleURL, optional WorkletOptions options);
};

dictionary WorkletOptions {
    RequestCredentials credentials = "same-origin";
};
```

上面的接口定义了一个标准的 Worklet 接口，读者可在这里<sup>5</sup> 阅读 Worklet 标准的所有细节。

#### 什么是 Web Animations

那么，做为动画本身也有自己的标准，就是：Web Animations。Web Animations 本身又被分为 CSS Animations 和 CSS Transitions 两类。未来这些 API 会在这些接口的基础上丰富更多的功能。使用它们，不需要再去针对不同浏览器作出 hack，也不需要额外的 requestAnimationFrame。理想的目标是，调用这些接口，浏览器可以使用内部的优化机制，达到最优的体验。

Web Animations 定义了 Animation、KeyframeEffect、AnimationTimeline、AnimationEvent、DocumentTimeline、EffectTiming 等接口。是 Animation Worklet 运行动画的基础。

MDN 的这篇文章<sup>6</sup>详细地描述了标准的分类、对象、主要方法，并给出了几个有意思的例子。

#### 细看 Animation Worklet

除了主线程、Compositor 线程，我们又引入了 Animation Worklet 线程。在 Animation Worklet 中，动画运行在 Animation Worklet 线程上下文中，并且，暴露 Web Animations 标准中定义的接口。为了显示的最终一致性，这里存在一个主线程、Compositor 线程和 Animation Worklet 线程同步的流程。

![](https://p5.ssl.qhimg.com/t011be832843ed507d4.png)

上面这幅图简单的说明了，独立的 Animation Worklet 线程、Compositor 线程是如何与主线程同步的流程。这里以 Chrome 的实现的数据流向为例：从宏观上，主线程发送动画的状态如创建、删除、当前时间偏移等等信息，最终到达 Animation Worklet 线程。Animation Worklet 线程将实际起作用的动画时间回传给主线程。

这里为了不互相阻塞，主线程和 Animation Worklet 线程中间存在一个 Compositor 线程。主线程和 Compositor 线程，Compositor 线程和 Animation Worklet 线程之间于是存在有有两类的数据同步流程：

第一、Animation Worklet 接收到更新可视元素的信号，在动画播放器上运行每一个动画。所有动画播放完毕，记录下每一个动画时间，发给 Compositor 线程。Compositor 线程接收到消息后按时序生成一个新的状态记录。
第二、主线程在文档生命周期中每一次运行动画帧之前，需要和 Compositor 线程进行一次动画属性状态的同步。

Animation Worklet 给出的接口定义如下：

```
[Exposed=Window]
partial namespace CSS {
    [SameObject] readonly attribute Worklet animationWorklet;
};
```

最终实现的接口挂在全局的 CSS 对象上。

```
[Exposed=AnimationWorklet, Global=AnimationWorklet]
interface AnimationWorkletGlobalScope : WorkletGlobalScope {
    void registerAnimator(DOMString name, VoidFunction animatorCtor);
};
```

方法`registerAnimator`定义一个动画执行器，动画执行器的名称可以为一个字符串；`animatorCtor`为一个动画类。

前文曾经提到的数据同步图，每一个黑色的实心原点代表一个动画类实例。将它展开，就是下面这个图。每个动画类都包含一个 animate 方法，这个方法是动画执行的入口，Worklet 通过这个入口控制动画的执行。

![](https://p2.ssl.qhimg.com/t018ae82567f4bdccba.png)

在 Chrome 的实现下，上面的两图可以合成如下一幅图：

![](https://p3.ssl.qhimg.com/t015cc223908a3ceb1c.png)

Animation Worklet 的使用场景都有哪些呢？

1. 大多数的滚动相关的场景的动画和效果都是 Animation Worklet 的用武之地，比如滚动条、滚动过程中的快照、平滑的滚动动画、固定滚动栏等等。
2. 可以使用硬件加速的 CSS 属性变化动画，也即单独使用 Compositor 线程可以完成的动画。如：opacity 的变化。

### 演示例子

让我们来看一个形象的例子。

![](https://p5.ssl.qhimg.com/t01856d07484c46d58f.gif)

这个例子里，我们要实现的是：随着滚动条的滚动，页面上部的进度条不断前进；同时，在第一屏以下，逐渐显示订阅按钮，按钮逐渐变大，opacity 值越来越高。

![](https://p4.ssl.qhimg.com/t017383b4873901a7f7.gif)

打开 devtools 我们可以看到，动画的发生，不会触发 Layout 和 Paint，这是我们能够顺利使用 Animation Worklet 的前提。同时，我们需要实时获取滚动的进度。Animation Worklet 的 API 正好可以满足我们的需求。

在主页面上，我们引入 Polyfill 和动画文件：

```Javascript
<!-- HTML (scripts) -->
<!-- Polyfill checks and loads (if needed)
    both Web Animation API and Animation Worklet polyfills -->
<script src="polyfill/anim-worklet.js"></script>

<script src="animator.js"></script>
```

这里`animator.js`的代码如下：

```Javascript
/* animator.js (load a Worklet module) */
window.animationWorkletPolyfill.addModule('worklet.js')
    .then(()=> {
        onWorkletLoaded()
    }).catch(console.error);
```

这里说明一下，目前 Polyfill 的实现，会挂载在 window 的`animationWorkletPolyfill`对象上，如果今后原生支持了，对象一般会通过 `CSS.animationWorklet` 访问。这段的实现代码大致是：

```Javascript
...
    // Returns true if AnimationWorklet is natively supported.
    function hasNativeSupport() {
      for (var namespace of [scope, scope.CSS]) {
        if (namespace.animationWorklet && namespace.animationWorklet.addModule)
          return true;
      }
      return false;
    }
...
  // Create scope.CSS if it does not exist.
  scope.CSS = scope.CSS || {};

  // Create a polyfill instance but don't export any of its symbols.
  scope.animationWorkletPolyfill = MainThreadAnimationWorklet();

  scope.animationWorkletPolyfill.load();
```

接下来我们来看看，worklet 里面的写法。

```Javascript
/* worklet.js - register and apply animations */
// Animators are classes registered in the worklet execution context
registerAnimator(
    'scroll-position-animator',// animator name
    class { // extends Web Animation
        constructor(options) {
            this.options = options;
        }

        // currentTime, KeyframeEffect and localTime concepts
        // from Web Animation API
        // animate function with animation frame logic
        animate(currentTime, effect) {
            // scroll position can be taken from option params
            // const scrollPos = currentTime * this.options.scrollRange;

            // each effect will apply the animation options
            // from 0 to 100% scroll position in the scroll source
            effect.children.forEach((children) => {
                // currentTime is a Number,
                // which represent the vertical scroll position
                children.localTime = currentTime * 100;
            });
        }
});
```

定义完 worklet，我们回过头来补充 animate.js

```Javascript
/* animator.js (onWorkletLoaded() ) */
const scrollPositionAnimation = // animator instance
    new WorkletAnimation(
        'scroll-position-animator', // animation animator name
        [ // animation effects
            new KeyframeEffect(scrollPositionElement, [ // scroll position
                {'transform': 'translateX(-100%)'}, // from
                {'transform': 'translateX(0%)'} // to
                ],
                {duration: 100, iterations: 1, fill: 'both'} // options
            ),
            new KeyframeEffect(subscribeElement, [ // size and opacity
                {'transform': 'scale(0.5)', 'opacity': 0}, // from
                {'transform': 'scale(1)','opacity': 1} // to
                ],
                {duration: 100, iterations: 1, fill: 'both'}) // options
        ],
        new ScrollTimeline({ // animation timeline
            scrollSource: document.querySelector('.page-wrapper'),
            orientation: 'vertical'
        })
    );
scrollPositionAnimation.play(); // start and apply the animation
```

### 现在的状态

目前，各大主流浏览器都在努力对 Houdini 标准进行实现，这里面 Chrome 浏览器是最积极的一个。下面这张图，说明了各个浏览器对 API 的支持情况，以及 W3C 组织在各组 API 上的进展。

![](https://p3.ssl.qhimg.com/t0121cd75e14720c3b2.jpg)

我们来仔细看下这张图。绿色的是已经有完整的实现；浅黄色的是有部分的实现；深黄色是正在开发中；紫色的是已经有实现的意愿；红色的是暂时还没有进度。

具体到 Animation Worklet，目前标准正在非常活跃的迭代中，直到本文撰写时刻（2018 年 9 月），已经有 6 次工作草案的发布，最近一次为 2018 年 9 月 6 日，这里<sup>7</sup>是最新的标准版本。

在实现方面，暂时还只有 Chrome 有部分支持，不过不要紧，已经有比较成熟的 Polyfill<sup>8</sup>来实现这些既有的标准特性，而且，主流的现代浏览器都可以比较完美的支持。

做为 Animation Worklet 标准的活跃推进者，Chrome 已经计划在未来支持除了 CSS 加速属性之外的所有 CSS 属性动画，如果实现，这将是更加令人兴奋的特性。未来会怎样？让我们拭目以待。

Houdini 的官方给出了一些例子<sup>9</sup>供大家感受，读者可以尝试这些例子。这里需要注意一点，这些 API 只对 localhost 域名和 https 的域名可见。这两种情况之外，这些 API 不可用。目前有 Polyfill 可用。如果需要一些原生的支持，目前（2018 年 10 月）请下载最新的 Canary 版 Chrome，同时，打开`--enable-experimental-web-platform-features`选项。

![](https://p4.ssl.qhimg.com/t017661fb5218eb8c10.jpg)

### Web 工程师现在能做什么

包括 Animation Worklet 在内的 Houdini 标准还是在扫雷和实验阶段。虽然已经达成了广泛的共识，并且有主流的浏览器和 W3C 不断的推进，但是对于大规模生产实践应用，还尚有距离，标准不排除会有变化的可能。

笔者衷心感谢可以坚持读到这里的读者。大家是真心关心 Web 标准并对技术有着前瞻性了解希望的，这也是标准得以发展并推进的原始动力之一。包括 Houdini 在内的 Web 标准发展需要广大 Web 开发者、浏览器供应商的共同努力。

笔者认为，大家可以在以下几个方向给 Houdini 的发展作出贡献。

1. 关心 Houdini 的发展，可以在他们的 github<sup>10</sup> 上提出 issue、PR 等等帮助他们提出问题、解决分歧。也可以开发一些真实可用案例，去实现一些在如今难以被实现的样式或布局。
2. 同一般软件产品不一样，浏览器的用户分为最终用户和 Web 工程师两类。浏览器厂商需要倾听 Web 工程师方面的痛点、需求。集中反馈的需求可能得到优先的响应。
3. 关注官方提供的一些例子<sup>9<sup>。为将来到来的 Houdini 特性做好准备，当然也可以帮助他们纠错:-)

![](https://p0.ssl.qhimg.com/t01e293de8e5a462dc1.jpg)

### 致谢

设计师王旋 mm，为本文设计的精美题图，在此表示诚挚的谢意。

### 文内链接

1. https://developers.google.com/web/fundamentals/performance/rendering/
1. https://hospodarets.com/
1. https://slides.com/malyw/houdini#/
1. https://www.zhangxinxu.com/wordpress/2013/09/css3-animation-requestanimationframe-tween-%E5%8A%A8%E7%94%BB%E7%AE%97%E6%B3%95/
1. https://drafts.css-houdini.org/worklets/
1. https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API
1. https://drafts.css-houdini.org/css-animationworklet/
1. https://github.com/GoogleChrome/houdini-samples/blob/master/animation-worklet/anim-worklet.js
1. https://github.com/GoogleChromeLabs/houdini-samples.git
1. https://github.com/w3c/css-houdini-drafts

### 参考资料

1. https://developers.google.com/web/fundamentals/performance/rendering/
2. https://blog.csdn.net/Joel_h/article/details/72400100
3. https://github.com/w3c/css-houdini-drafts/tree/master/css-animationworklet
4. https://www.zhangxinxu.com/wordpress/2013/09/css3-animation-requestanimationframe-tween-%E5%8A%A8%E7%94%BB%E7%AE%97%E6%B3%95/
5. https://javascript.ruanyifeng.com/htmlapi/requestanimationframe.html
6. https://segmentfault.com/q/1010000000645415
7. https://css-tricks.com/myth-busting-css-animations-vs-javascript/
8. http://www.chinaw3c.org/member-meetings.html
9. https://developer.mozilla.org/en-US/docs/Web/API/Worklet
10. https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API
11. https://drafts.css-houdini.org/css-animationworklet/
12. http://dassur.ma/things/animworklet/
13. https://css-houdini.rocks/
14. https://googlechromelabs.github.io/houdini-samples/
15. https://docs.google.com/document/d/1MdpvGtnK_A2kTzLeTd07NUevMON2WBRn5wirxWEFd2w/edit#heading=h.w09fmb4pxgin
16. https://slides.com/malyw/houdini#/46
17. https://ishoudinireadyyet.com/
18. https://chromium.googlesource.com/chromium/src/third_party/+/master/blink/renderer/modules/animationworklet/README.md
19. https://qiita.com/taichitk/items/010c154c407a7b22dfc4
20. http://www.w3cplus.com/css/css-houdini.html
