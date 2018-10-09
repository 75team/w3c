# CSS Painting API

今天和大家分享一个非常酷炫的 API [CSS Painting API](https://www.w3.org/TR/css-paint-api-1/)。

## 简介

它能做什么呢？简单点说，它可以让网页开发人员干预浏览器的绘制（Paint）环节。

为什么要干预绘制环节呢？干预绘制，意味着开发人员可以自行决定页面要绘制成的样子，而不一定非要等到浏览器支持才行。

举个例子，CSS3 的新属性`conic-gradient`圆锥形渐变：

```html
<style>
    div {
        display: inline-block;
        width: 150px; height: 150px; margin: 10px; 
        border-radius: 50%;
    }
    .color-palette {
        background: conic-gradient(red, yellow, lime, aqua, blue, magenta, red);
    }
    .color-rgb {
        border: 1px solid #999;
        background: conic-gradient(red 0, red 16%,white 16%, white 32%,green 32%, green 48%,white 48%, white 64%,blue 64%, blue 80%,white 80%, white);
    }
</style>

<div class="color-palette"></div>
<div class="color-rgb"></div>
```

以上代码的运行效果如下，也可[在线预览](https://codepen.io/anjia/pen/gBPorz)（Chrome 69+）：

![](https://p3.ssl.qhimg.com/sdmt/352_177_80/t01c433a80fac77ba5c.gif)

根据 [Can I use](https://caniuse.com/#search=conic-gradient)，目前仅 Chrome 支持`conic-gradient`。但是，有了`CSS Painting API`，我们就可以自己画出[类似效果](https://css-houdini.rocks/conic-gradient)，然后在项目中使用了，而不用等到所有的浏览器都支持`conic-gradient`。

当然，除了充当 CSS3 新特性的 polyfill 之外，我们还可以用它画任意形状。比如[钻石状的 Div](https://googlechromelabs.github.io/houdini-samples/paint-worklet/diamond-shape/)：

![](https://p3.ssl.qhimg.com/sdmt/350_247_80/t01d40b261857a6f928.png)

比如，符合 [Google Material Design](https://material.io) 的[波纹效果](https://css-houdini.rocks/ripple)：

![](https://p3.ssl.qhimg.com/sdmt/250_215_80/t017418764efa7636bd.gif)

### 浏览器支持情况

截止目前，CSS Painting API 的[浏览器支持情况](https://ishoudinireadyyet.com/)<sup>1</sup>如下：
- Chrome 65+ 和 Opera 52+ 已经支持
- Firefox 有实现的意愿
- Safari 还在考虑中
- Edge 暂无反馈

也有相应的 [CSS Paint Polyfill](https://github.com/GoogleChromeLabs/css-paint-polyfill)<sup>2</sup> 供我们选择。


### W3C 标准层面

[CSS Painting API Level 1](https://www.w3.org/TR/css-paint-api-1/) 已于今年8月9日成为候选推荐标准，这意味着该模块的所有已知 Issues 均已被解决，并且已经开始向浏览器厂商征集实现。


接下来，我们通过一个实例来理解下 Paint API。

## 使用方法

使用挺简单的，就这三步：
1. 在 CSS 中使用指定的 Paint Worklet，用`paint()`
2. 加载定义了 Paint Worklet 的脚本文件，用`CSS.paintWorklet.addModule()`
3. 定义 Paint Worklet，用`registerPaint()`


### 核心代码

在 index.html 里
```html
<style>
  .css-paint {
    /* 1. 通过 paint() 调用指定的 Paint Worklet 'checkerboard'*/
    background-image: paint(checkerboard); 
  }
</style>

<div class="css-paint"></div>

<script>
  // 2. 加载 Paint Worklet
  CSS.paintWorklet.addModule('my_paint_worklet.js');
</script>
```

在 my_paint_worklet.js 里
```javascript
class CheckerboardPainter {
  paint(ctx, geom) {
    const size = 30;
    const spacing = 10;
    const colors = ['red', 'green', 'blue'];
    for(let y = 0; y < geom.height/size; y++) {
      for(let x = 0; x < geom.width/size; x++) {
        ctx.fillStyle = colors[(x + y) % colors.length];
        ctx.beginPath();
        ctx.rect(x*(size + spacing), y*(size + spacing), size, size);
        ctx.fill();
      }
    }
  }
}
// 3. 定义 Paint Worklet 'checkerboard'
registerPaint('checkerboard', CheckerboardPainter);
```

运行后的效果如下。我们可以看到，绘制的背景是响应式的。

![](https://p4.ssl.qhimg.com/sdmt/350_284_80/t018634054cddfdd857.gif)

### 自定义参数
Paint Worklet 也支持自定义参数，我们通过自定义属性来实现。

改动三处即可：
1. 在 CSS 里增加自定义属性
2. 在定义 Paint Worklet 时
    - 指定绘制时可以访问的属性列表
    - 绘制时，获取属性的值

具体代码如下：

在 index.html 里，自定义 CSS 属性
```html
<style>
  .css-paint {
    --checkerboard-size: 32;   /* 1. 自定义2个参数 */
    --checkerboard-spacing: 10;  
    background-image: paint(checkerboard);
  }
</style>
```

在 my_paint_worklet.js 里，接收参数
```javascript
class CheckerboardPainter {
    // 2.1 静态方法，返回 paint() 可以访问的 CSS 属性列表
    static get inputProperties() {
      return ['--checkerboard-spacing', '--checkerboard-size'];
    }

    // 注意：新增了第三个参数 properties
    paint(ctx, geom, properties) {
      // 2.2 获取输入参数的值
      const size = parseInt(properties.get('--checkerboard-size').toString());
      const spacing = parseInt(properties.get('--checkerboard-spacing').toString());
      // ... 同上
    }
}
registerPaint('checkerboard', CheckerboardPainter);
```

这样，当修改自定义属性时，绘制的图像也会相应变化。效果如下：

![](https://p5.ssl.qhimg.com/t01f29b940b624637a0.gif)


### 优雅降级

当浏览器不支持 Paint API 时，我们需要向前兼容。修改以下两处：
1. 在写 CSS 时，给属性写个备用值
2. 在 JS 里加载 Paint Worklet 之前，先做个判断

具体代码如下：

在 index.html 里，修改两处
```html
<style>
  .css-paint {
    background-image: linear-gradient(0, red, blue);  /* 1. 备用值 */
    background-image: paint(checkerboard);
  }
</style>

<script>
  // 2. 判断是否支持
  if ('paintWorklet' in CSS) {
    CSS.paintWorklet.addModule('my_paint_worklet.js');
  }
</script>
```

> 完整代码见 https://github.com/anjia/blog/tree/master/src/css-paint-api  
> 注意，代码需要运行在 localhost 或 HTTPS 下


在该实例中，我们用到了三个函数：
1. `paint()`：在 CSS 中使用指定的 Paint Worklet
2. `CSS.paintWorklet.addModule()`：加载定义了 Paint Worklet 的脚本文件
3. `registerPaint()`：定义 Paint Worklet

下面，我们将对它们进行进一步介绍。


## 关键代码解析

### CSS.paintWorklet.addModule()
CSS 的 paintWorklet 属性提供了与绘制相关的 [Worklet](https://www.w3.org/TR/worklets-1/#worklet)，它的全局执行上下文是 [PaintWorkletGlobalScope](https://www.w3.org/TR/css-paint-api-1/#paintworkletglobalscope)。PaintWorkletGlobalScope 里存了 devicePixelRatio 属性，它和 Window.devicePixelRatio 一样。

`CSS.paintWorklet.addModule('filename.js')`负责加载定义了 Paint Worklet 的脚本文件。

### registerPaint()
下面是文件 my_paint_worklet.js 里的内容。
```javascript
class CheckerboardPainter {
  static get inputProperties() {
    return ['--checkerboard-spacing', '--checkerboard-size'];
  }

  paint(ctx, geom, properties) {
    const size = parseInt(properties.get('--checkerboard-size').toString());
    const spacing = parseInt(properties.get('--checkerboard-spacing').toString());
    const colors = ['red', 'green', 'blue'];
    for(let y = 0; y < geom.height/size; y++) {
      for(let x = 0; x < geom.width/size; x++) {
        ctx.fillStyle = colors[(x + y) % colors.length];
        ctx.beginPath();
        ctx.rect(x*(size + spacing), y*(size + spacing), size, size);
        ctx.fill();
      }
    }
  }
}
registerPaint('checkerboard', CheckerboardPainter);
```

Paint Worklet 的全局脚本上下文只给开发人员暴露了一个方法`registerPaint()`，用来注册。

`registerPaint(name, paintCtor)` 有两个参数：
- `name` 是 Paint Worklet 的名字。必填，且全局唯一
- `paintCtor` 是一个类。之所以用类，是考虑到：
  - 类之间可以相互组合，比如继承
  - 类可以执行一些预初始化的工作，比如只执行一次的 CPU 密集型工作

e.g. 继承
```javascript
class RectPainter {
  static get inputProperties() {
    return ['--rect-color'];
  }
  paint(ctx, size, style) {
    //...
  }
}

class BorderRectPainter extends RectPainter {
  static get inputProperties() {
    return ['--border-color', ...super.inputProperties];
  }
  paint(ctx, size, style) {
    super.paint(ctx, size, style);
    //...
  }
}

registerPaint('border-rect', BorderRectPainter);
```
e.g. 预初始化工作
```javascript
registerPaint('lots-of-paths', class {

  constructor() {
    this.paths = performPathPreInit();
  }
  
  performPathPreInit() {
    // Lots of work here to produce list of Path2D object to be reused.
  }
  
  paint(ctx, size, style) {
    ctx.stroke(this.paths[i]); 
  }
});
```

#### paint 函数
在`paintCtor`的类里有个函数`paint()`，它是渲染引擎在浏览器绘制阶段的回调。

回调会传3个参数 `paint(ctx, geom, properties)`：
- `ctx` 绘制的渲染上下文 [PaintRenderingContext2D](https://www.w3.org/TR/css-paint-api-1/#2d-rendering-context)
- `geom` 绘制的图像大小 [pageSize](https://www.w3.org/TR/css-paint-api-1/#paintsize)，它有两个只读属性 width 和 height
- `properties` 当前绘制元素的计算样式，它只包含`inputProperties`里列出的属性

以下三种情况，都会触发回调的调用：
- 视口要显示绘制的元素了。i.e. 初始创建 Paint 类的实例对象时
- 绘制区域的大小变了。i.e. 网页响应式
- `inputProperties` 列出的属性值变了。i.e. 图像可根据参数的改变而改变

#### 绘制的渲染上下文
[PaintRenderingContext2D](https://www.w3.org/TR/css-paint-api-1/#2d-rendering-context) 是 [CanvasRenderingContext2D](https://html.spec.whatwg.org/multipage/canvas.html#2dcontext) 的子集。所以，会用 Canvas 的小伙伴也就会在 Paint Worklet 里绘制图像了。

> 它目前不支持 CanvasImageData, CanvasUserInterface, CanvasText, CanvasTextDrawingStylesAPI 。详见 [PaintRenderingContext2D](https://www.w3.org/TR/css-paint-api-1/#2d-rendering-context)<sup>3</sup>

PaintRenderingContext2D 对象有一个[输出位图](https://html.spec.whatwg.org/multipage/canvas.html#output-bitmap)，当类的实例被创建时，它就被初始化。输出位图的大小，不一定等于实际渲染的位图大小，因为实际输出的图像会根据设备像素比的不同而不同。浏览器会记住`paint()`里绘制的操作序列，以便动态适应不同的设备像素比，这样就保证了图像在高清屏下的显示质量。

> 未来的规范会提供不同类型的渲染上下文，比如 WebGL 的渲染上下文，这样就能绘制 3D 效果了


#### inputProperties
在输入属性列表`inputProperties`里列出的属性，意味着：
- 可以在`paint()`回调里访问它们，这些属性会通过第三个参数`properties`传过去
- Paint Worklet 会订阅这些属性，以便在它们的值发生改变时触发`paint()`回调，以实时重新绘制图像

### paint() 函数
最后，就是在 CSS 中使用写好的 Paint Worklet 了。写法如下：
```css
.css-paint {
  background-image: paint(checkerboard);
}
```
参数 checkerboard 就是 Paint Worklet 的名字，即在`registerPaint(name, paintCtor)`里提供的 name。

`paint()`是 CSS 的 [&lt;image&gt;](https://www.w3.org/TR/css3-images/#image-type) 类型支持的一种写法。我们平时用`url()`加载图片或者用渐变函数`linear-gradient()`的地方都可以使用`paint()`。它可以用在 background-image、border-image、list-style-image 和 cursor 等属性上。

并不是在 CSS 里每调用一次`piant()`就执行一次 Paint Worklet 类的 paint 方法，而是当元素的大小改变时，或者 inputProperties 里声明的属性值改变时才会触发。


## 最后
CSS Painting API 给网页开发人员提供了通过 JS 绘制`<image>`的能力，具体图像长什么样子以及页面如何交互，我们可以充分发挥自己的想象力。可以留意日常工作和业务里的点滴，也可以去 [CSS Houdini](https://css-houdini.rocks/)<sup>4</sup> 寻找灵感。

## 文内链接
[1] 浏览器支持情况：https://ishoudinireadyyet.com  
[2] CSS Paint Polyfill：https://github.com/GoogleChromeLabs/css-paint-polyfill  
[3] PaintRenderingContext2D：https://www.w3.org/TR/css-paint-api-1/#2d-rendering-context  
[4] CSS Houdini：https://css-houdini.rocks

## 主要参考
- https://www.w3.org/TR/css-paint-api-1/  
- https://developers.google.com/web/updates/2018/01/paintapi  
- https://github.com/w3c/css-houdini-drafts/blob/master/css-paint-api/EXPLAINER.md  

## 更多阅读
- CSS Houdini 的九大内容：https://drafts.css-houdini.org
- 谈谈 Animation Worklet：https://mp.weixin.qq.com/s/Tixer_ezqyk793gqqKKQDg
