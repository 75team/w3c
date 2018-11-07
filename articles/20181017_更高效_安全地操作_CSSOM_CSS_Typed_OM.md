# CSS Typed OM

> 本文作者：奇舞团前端开发工程师 何文力，同时也是 W3C CSS 工作组的成员。

## 前言

长期以来，我们要修改 DOM 元素的样式，我们实际上操作的是 CSS 的对象模型 CSSOM。而 Houdini 中推进的又一组 CSS 对象模型 Typed OM，该标准又给我们带来了什么好处呢？

## CSSOM

### CSSOM 是干嘛的？

简单的说来，CSSOM 是一组能让 JS 操作元素 CSS 的 API。在浏览器进行页面渲染的过程中扮演着非常重要的角色，浏览器的渲染步骤大致包括：

1. 解析 HTML 内容并构建成 DOM 对象
2. 解析 CSS 内容并构建成 CSSOM 对象
3. 浏览器将 DOM 与 CSSOM 组合成渲染树
4. 最终浏览器将结果进行渲染

### 面临的问题

在平时开发中，我们通过元素上的 `style` 对象去获取元素的样式：

```javascript
const cover = document.getElementById('cover');
cover.style.opacity; // 假设是 0.5
```

然后我们基于这个减少一点透明度：

```javascript
cover.style.opacity += 0.3;
```

那么，这样做有没有问题呢？首先我们来看看值的类型：

```javascript
typeof cover.style.opacity; // string
```

What a suprise!，所以实际上，上面减少透明度的操作实际上产生了 `0.50.3` 的值，很显然这是个有问题的操作。对于 `height` 等属性，同样的，返回了类似 `200px` 的字符串，`getComputedStyles` 返回的数值也不例外。如果你想要将这些获取出来的数值套入一些列的数学计算中，你必须先将其转换成数字对象。为了解决这些问题，Typed OM 出现了。

## Typed OM

Typed OM 的出现，给我们读取以及设定数值添加了一种新的方法，不同于 CSSOM 中原有的字符串值的表现形式，Typed OM 将 CSSOM 的数值以 `map` 的形式展现在元素的 `attributeStyleMap` 中，规则所对应的值则是更有使用价值的 JavaScript 对象。

### 带来的好处

1. 更少的 bug，正如前面所展示的操作，通过 TypedOM 进行操作减少此类型的问题；
2. 在数值对象上调用简单的算术运算方法，绝对单位之间还能方便得尽兴单位转换；
3. 更好的性能，由于减少了字符串操作，对于 CSSOM 的操作性能得到了更进一步的提升，由 Tab Akins 提供的[测试](https://github.com/w3c/css-houdini-drafts/issues/634#issuecomment-366358609)表明，操作 Typed OM 比直接操作 CSSOM 字符串带来了大约 30% 的速度提升；
4. 错误处理，对于错误的 CSS 值，将会抛出错误；
5. 键名与常规 CSS 写法保持一致，不用在 backgroundColor 和 background-color 的边缘试探；
6. 由于 `attributeStyleMap` 以及 `computedStyleMap` 对象是个 `map`，这样意味着我们可以使用标准 `map` 中提供的所有方法。

### 浏览器支持情况

目前各大浏览器厂商的实现情况:

![](https://p5.ssl.qhimg.com/t012bd3adafd5ae272e.png)

> Intent to implement: 有意向实现
>
> Shipped: 已发布
>
> No signal: 暂无意图

其中 Google Chrome 和 Opera 浏览器分别在 66 和 53 版中实现了。

### 可用性检测方法

可以通过以下方法检测是否可用：

```javascript
window.CSS && CSS.number
```

## 使用

### 基本的读取和赋值方法

在 Typed OM 中，数值和数值的单位是分开的，所获取的是一个 `CSSUnitValue` 对象，内置数值 `value` 和单位 `unit` 两个键。

```javascript
// 要对一个元素的样式赋值，除了可以使用 CSS.px 构建之外，还能接受字符串
el.attributeStyleMap.set('height', CSS.px(10));
el.attributeStyleMap.set('height', '10px');

// 对于获取，返回 CSSUnitValue 对象，访问其 value 属性即可得到数字类型的值
el.attributeStyleMap.get('height').value; // 10
el.attributeStyleMap.get('height').unit; // 'px'
```

### CSS 数值类型

在 Typed OM 中，我们有两种基本的数值类型，一种是上面例子中提到的数字加单位的简单数值，他们属于 `CSSUnitValue` 类型。对于不止于单个数字加单位或使用`calc`计算的表达式，均属于 `CSSMathValue`类型。

#### CSSUnitValue

如上所述，`CSSUnitValue` 表达了简单的数字加单位的 CSS 数值，同时你也可以通过对其使用 `new` 来构造一个，大多数情况下，你还能从 CSS 对象下的同名方法直接构造：

```javascript
const num = CSS.number('10');
// num.value -> 10 num.unit -> 'number'

const px = CSS.px(42);
// px.value -> 42 px.unit -> 'px'

// 同样可以使用 new 方法构造一个
const deg = new CSSUnitValue(45, 'deg');
// deg.value -> 45 deg.unit -> 'deg'
```

完整的方法列表，可以查看 [CSS Typed OM](https://drafts.css-houdini.org/css-typed-om/#numeric-factory) 草案的内容。

#### CSSMathValue

如果你要表达涉及不止一个数值以及使用 `calc` 计算表达式的数值，则需要使用 `CSSMathValue`。需要注意的是， `calc` 在实际使用中被浏览器求值之后，获取到的是运算结果，也就是一个 CSSUnitValue 值。

既然涉及到表达式，自然少不了操作符，`CSSMathValue` 中还提供了基本的数学操作符：

```javascript
// 求和操作: calc(100vw + -10px)
new CSSMathSum(CSS.vw(100), CSS.px(-10));

// 求积: calc(45deg * 3.1415926)
new CSSMathProduct(CSS.deg(45), CSS.number(Math.PI));

// 取相反数: calc(-10px)
new CSSMathNegate(CSS.px(10));

// 取倒数: calc(1 / 10px);
new CSSMathInvert(CSS.px(10));

// 范围限制: calc(1px);
// 其中第一个参数为最小值，第三个参数为最大值，中间数值为需要钳制的数值
new CSSMathClamp(1, -1, 3);

// 最大值: max(10%, 10px)
new CSSMathMax(CSS.percent(10), CSS.px(10));

// 最小值: min(10%, 10px)
new CSSMathMin(CSS.percent(10), CSS.px(10));
```

#### 表达式需要更复杂的怎么办？

以上的数学操作表达式符号均支持嵌套使用，例如需要构建表达式：`calc(1px * (3px + 2em))`，可以做如下嵌套实现：

```javascript
new CSSMathProduct(CSS.px(1), new CSSMathSum(CSS.px(3), CSS.em(2)));
```

#### 数学操作方法

`CSSMathValue` 和 `CSSUnitValue` 他们均继承自 `CSSNumericValue`，自然地也继承了`CSSNumericValue` 上的数学操作方法，方便使用：

```javascript
// 加: 1px + 1px 
CSS.px(1).add(1);

// 减: 1px - 1px
CSS.px(1).sub(1);

// 乘: 1px * 3px
CSS.px(1).mul(3);

// 除: 1px 除 3px
CSS.px(1).div(3);

// 比较最大值: max(50%, 50vw);
CSS.percent(50).max(CSS.vw(50));

// 比较最小值: min(50vh, 50vw);
CSS.vh(50).min(CSS.vw(50));

// 相等比较方法，返回一个布尔值 true
CSS.px(200).equals(CSS.px(200));
```

同时，加减乘除这些操作同样支持多个参数使用

```javascript
// 累加 calc(10px + 10vw + 10%)
CSS.px(10).add(CSS.vw(10), CSS.percent(10));
```

除此之外，绝对单位之间还能相互转换：

```javascript
CSS.in(9).to('cm').value; 
// 22.860000000000003
```

### CSS Transform 数值类型

对于 CSS Transform 的 `transform` 属性，上面的基本数值表达完全无法满足，从而需要借助 `CSSTransformValue` ，构建 `CSSTransformValue`可以传入以下几种参数：

1. `CSSRotate`： 旋转
2. `CSSScale`： 缩放
3. `CSSSkew`：倾斜
4. `CSSSkewX`：X 轴倾斜
5. `CSSSkewY`: Y 轴倾斜
6. `CSSTranslate`： 转换
7. `CSSPerspective`： 视角

> 与平常的 CSS 用法一样，skew(x, y) 与分别 skewX(x) skewY(y) 产生的结果也是不一样的，这点需要注意一下

用起来也是同样的简单：

```javascript
// 转变 transform: rotateX(45deg) scale(0.5) translate3d(10px, 10px, 10px);
new CSSTransformValue([
    new CSSRotate(CSS.deg(45)),
    new CSSScale(CSS.number(0.5), CSS.number(0.5)),
    new CSSTranslate(CSS.px(10), CSS.px(10), CSS.px(10))
]);
```

对于`CSSTranslate` 类型，你还可以访问对象上的 `is2D` 方法查看当前 `translate` 是 2D 的还是 3D 的。同时，还能调用 `toMatrix` 方法获得 `DOMMatrix ` 矩阵对象。

### CSS 位置数值类型

对于需要描述 x/y 位置的属性，例如 `object-position`，则需要用到 `CSSPositionValue` 类型。

```javascript
const pos = new CSSPositionValue(CSS.px(5), CSS.px(10));
// pos.y.value -> 10 pos.x.value -> 10
```

### 数值解析

既然我们可以在 Type OM 的对象上使用 `toString()` 方法得到字符串规则，那么我们是否能通过 API 将字符串规则解析成 Type OM 的类型呢？答案是可以的。使用 `CSSStyleValue` 中的 `parse` 方法即可：

```javascript
CSSStyleValue.parse('transform', 'translate(10px) scale(0.5)');
// 将会解析成 CSSTransformValue 对象

CSSStyleValue.parse('height', '2px');
// 将会解析成 CSSUnitValue 类型
```

## computedStyleMap

与传统调用 `window.getComputedStyle` 方法相同，元素上的 `computedStyleMap` 方法同样会返回所有的计算后属性值。但它们仍然有一些小区别。`window.getComputedStyle` 仍然会返回字符串数值；而对于 `computedStyleMap` 方法来说，返回的数值则是转换成 Type OM 数值类型的。

```javascript
document.body.attributeStyleMap.set('opacity', 1); 

document.body.computedStyleMap().get('opacity').value;
// 1

window.getComputedStyle(document.body).opacity;
// '1'
```

## Typed OM 在 Houdini 其他标准中的角色

既然 Typed OM 涉及到了 CSSOM 的数值，那么与之相关的标准中的数值都将与此相关。前段时间看了安佳老师的文章《CSS Paint API》的同学可能会对里面的棋盘例子有印象，CSS Paint API 对 paint 参数的输入值其实也是 CSS Typed OM 中的数值类型。

除此之外，Typed OM 的使用在为往后更高效地发展各个 Houdini 标准打下了基础（包括自定义属性，布局以及绘制相关标准）。

## 总结

CSS Typed OM 解决了开发时修改数值的问题，同时通过减少字符串操作增加了总体的操作性能，使得我们在操作 CSSOM 不仅方便还高效，配合 `requestAnimationFrame` 还能制作出性能更优的自定义动画。

## 参考链接

https://drafts.css-houdini.org/css-typed-om

https://developers.google.com/web/updates/2018/03/cssom

http://rocks1635.rssing.com/chan-40941343/all_p18.html

## 致谢

感谢安佳老师对本文提出的修改建议