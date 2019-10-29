
### 前言
这篇文章是多年前在 [SegmentFault](https://segmentfault.com/q/1010000002424191/a-1020000002432581) 上的一个回答，原问题是问如何使用 Canvas 实现一个下图类似的圆环选择器，点击后会出现对应的日期。虽然已经有 Canvas 的答案了，不过当时正好在学习 SVG 就顺手自己实现了一下。我感觉对大家去理解 SVG 的贝塞尔曲线会有一定的帮助，所以重新整理了下发出来。另外感兴趣的同学还可以去原问题上看一下，除了标准答案 Canvas 的实现以及我写的 SVG 实现之外，还有使用 DIV+CSS 的实现方案。

![image.png](https://p1.ssl.qhimgs4.com/t01dc5694ac1f063f08.png)

### SVG 如何画任意角度的圆弧线

将这个问题分解出来就是我们要画一个一个的弧块，所以第一步我们需要了解"如何使用SVG画弧线"。关于 SVG 的Path参数了解大家可以去参考一下 张鑫旭老师的博文：[《深度掌握SVG路径path的贝塞尔曲线指令》](http://www.zhangxinxu.com/wordpress/2014/06/deep-understand-svg-path-bezier-curves-command/)。不过我们需要的 arc 命令并没有给出，这里我就稍作说明一下：

使用

| 命令 | 命令参数 | 参数说明 |
| :---: | :---: | :---: |
| A | rx | 弧线所在椭圆的长轴半径 |
|  | ry | 弧线所在椭圆的短轴半径 |
|  | x-axis-rotation | 弧线与 x 轴的旋转角度 |
|  | large-arc-flag | 两个值：0为小角度弧线，1为大角度弧线 |
|  | sweep-flag | 两个值：0为逆时针，1为顺时针 |
|  | x | 弧线终点的 x 坐标 |
|  | y | 弧线终点的 y 坐标 |

也就是说画一段弧线你必须给定：

1. 弧线的起始和终点坐标
1. 弧线所在椭圆的长短轴半径
1. 弧线与 x 轴的夹角（即弧线所在椭圆与 x 轴的夹角）
1. 是大角度弧线还是小角度弧线
1. 圆弧是顺时针还是逆时针的

总共 7 个参数，怪复杂的。其它参数都比较好理解，就是`large-arc-flag`这个参数似乎不太明白的样子，这里我引用一张 [MDN 文档](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#Arcs) 中的图片给大家做一下参考：

![image.png](https://p2.ssl.qhimgs4.com/t01a1f24a9dc6a43481.png)

实在是不太明白也没有关系，反正就 4 种情况，大家试试也就试出来了。针对这个问题的情况下，因为我们画的是圆弧，所以椭圆直接变成了圆，2 - 5 这 4 条参数都能解决了，剩下的是我们只需要知道弧的起点和终点就好了。这个根据圆弧的角度我们也是可以利用公式计算出来的。这里我画了一个示意图给大家参考一下：

![image.png](https://p5.ssl.qhimg.com/t0166347473c57bec4b.png)

也就是说假设已知圆心坐标和圆心半径，逆时针方向角度为正值。则圆弧α的起点 A 和终点 B 的坐标我们都能知道了。所以控制一段圆弧通用的指令应该是：

```
M Xo, Yo-r A r r 0 [1|0]** 0 Xo-r*sinα, Yo-r*cosα
注: ** 当弧角度 小于180° 时使用小角度弧线，当弧角度 大于180° 时使用大角度弧线
```

举个例子，假设圆心坐标为 (100,100)，半径为 50，则我们画一个 30° 角的圆弧为：

![image.png](https://p0.ssl.qhimgs4.com/t01fdb2ff0826956b58.png)<br/>在线预览：[https://code.h5jun.com/cocis/edit?html,output](https://code.h5jun.com/cocis/edit?html,output)

我们可以将其化作一个 JS 函数以便动态创建：

![image.png](https://p3.ssl.qhimgs4.com/t01d65fb9dff3e1d5f3.png)<br/>在线预览：[https://code.h5jun.com/hezac/edit?js,output](https://code.h5jun.com/hezac/edit?js,output)

### 如何处理弧线标注位置

SVG本身是有`marker`用来指定其他元素用来做标注的，不过用起来稍微麻烦最终还是需要用到`text`标签，所以我就直接用`text`标签来做了。

`text`标签需要指定标签左下角的 (x,y) 坐标来确定标签的位置，为了达到好看的效果，通过计算弧中点的坐标将其旋转到其切线方向会达到很好看的效果。弧重点的坐标利用上一步中求终点的方法可以非常简单拿到。而旋转到切线方向其实就是将文字旋转弧线的角度。

`text`也是支持 [transform属性](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform) 的，和平常在 CSS 中一样也是支持 `rotate` 等一些常用的变换的。但这里需要注意的是，默认的`rotate`并不是以文字的左下角做旋转，所以我们要在旋转角度后面定义旋转中心坐标，也就是 `transform = "rotate(α x y)"`。

这样做完之后有个未完成的地方在于由于不是按照文字中心做的运算，所以你必须左下移动文字宽高的一半才能到达中心。我将这一步的过程封装成了`svg.prototype.appendCircleArcText`方法做了一个DEMO：

![image.png](https://p4.ssl.qhimgs4.com/t0120e177d0f199b2f0.png)<br/>在线预览：[https://code.h5jun.com/zehim/edit?js,output](https://code.h5jun.com/zehim/edit?js,output)

### 如何处理渐变色

这个问题我不是很清楚标准的解决办法，但是我的第一反应是利用 alpha通道 来做。利用透明通道能过非常简单的给出一个颜色的渐变出来。但是透明通道有个我们不需要的功能就是透明效果，所以需要将透明过的颜色处理成普通颜色。这一步过程其实非常简单了，代码就是以下这样的：

```javascript
function gradientColor(len, color) {
  color = color || [147, 112, 219];
  const delta = 0.8 / len;

  const colorTransfer = (c, o) => '#' + c.map(t => parseInt((1 - o) * 255 + o * t).toString(16)).join('');
  return new Array(len).fill(0).map((o, i) => colorTransfer(color, 1 - i * delta));
}
```

比较温馨的做法是透明度并不是从 100% -> 0%，而是预留了 20% 的基值。

### 最终效果

处理完以上三个关键的问题之后其实这道题的代码已经出来了。由于要增加点击事件，我使用`g`标签将同一个圆弧和其对应的`text`标签包起来做成一个`group`，而后对每一个组增加了点击事件。由于 SVG 实际上可以看成一个一个的 DOM 标签，所以点击事件处理起来也是非常的得心应手的。最后附上我的最终代码和效果：

![image.png](https://p2.ssl.qhimgs4.com/t01b50ed3c41d158a71.png)

```javascript
class SVG {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.s = SVG.createSVG(width, height);
  }

  appendCircleArc(
    circle = { cx: 100, cy: 100, r: 100 },
    angel = { start: 0, end: 90 },
    attrs = { fill: "none" }
  ) {
    const largeArcFlag = Number(angel > 180);
    this.appendItem(SVG.arc({
      largeArcFlag: largeArcFlag,
      rx: circle.r,
      ry: circle.r,
      startX: circle.cx - circle.r * Math.sin(angel.start / 180 * Math.PI),
      startY: circle.cy - circle.r * Math.cos(angel.start / 180 * Math.PI),
      endX: circle.cx - circle.r * Math.sin(angel.end / 180 * Math.PI),
      endY: circle.cy - circle.r * Math.cos(angel.end / 180 * Math.PI)
    }, attrs));
    return this;
  }

  appendCircleArcText(
    text,
    circle = { cx: 100, cy: 100, r: 100 },
    angel = { start: 0, end: 90 },
    width = 16,
    attrs = {}
  ) {
    angel = angel.start + (angel.end - angel.start) / 2;
    const posX = circle.cx - circle.r * Math.sin(angel / 180 * Math.PI);
    const posY = circle.cx - circle.r * Math.cos(angel / 180 * Math.PI);

    const circleArcText = SVG.text(text, {
      ...attrs,
      x: posX,
      y: posY,
      fontSize: width,
      transform: "rotate( -" + angel + " " + posX + " " + posY + ")"
    });

    this.appendItem(circleArcText);
    return this;
  }

  render() {
    return this.s;
  }

  renderTo(DOM = document.body) {
    DOM.innerHTML = this.s.outerHTML;

    const texts = Array.from(DOM.querySelectorAll('text'));
    texts.forEach(text => {
      const transform = text.getAttribute('transform');
      transform && text.removeAttribute('transform');
      const { width, height } = text.getBoundingClientRect();
      [
        ['x', text.getAttribute('x') / 1 - width / 2],
        ['y', text.getAttribute('y') / 1 + height / 2],
        ['transform', transform || '']
      ].forEach(([name, value]) => text.setAttribute(name, value));
    })

    return this;
  }

  appendItem(item) {
    this.s.appendChild(item);
    return this;
  }

  static arc({
    rx = 50,
    ry = 50,
    xAxisRotation = 0,
    largeArcFlag = 0,
    sweepFlag = 0,
    startX = 0,
    startY = 0,
    endX = 0,
    endY = 0
  }, attrs = {}) {
    attrs.d = `M ${startX},${startY} A ${rx} ${ry} ${xAxisRotation} ${largeArcFlag} ${sweepFlag} ${endX},${endY}`;

    const path = document.createElement('path');
    for (var i in attrs) {
      path.setAttribute(i.replace(/[A-Z]/g, o => `-${o}`), attrs[i]);
    }
    return path;
  }

  static text(text = '', attrs = {}) {
    const t = document.createElement('text');
    t.innerHTML = text;
    for (var i in attrs) {
      t.setAttribute(i.replace(/[A-Z]/g, o => `-${o}`), attrs[i]);
    }
    return t;
  }

  static g = class extends SVG {
    constructor(attrs = {}) {
      super();
      this.s = document.createElement("g");
      for (var i in attrs) {
        this.s.setAttribute(i.replace(/[A-Z]/g, o => `-${o}`), attrs[i]);
      }
    }
  };

  static createSVG(width, height) {
    const s = document.createElement('svg');
    s.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    s.setAttribute("width", width);
    s.setAttribute("height", height);
    s.setAttribute("viewBox", "0 0 " + width + " " + height);
    return s;
  }
}

function gradientColor(len, color) {
  color = color || [147, 112, 219];
  const delta = 0.8 / len;

  const colorTransfer = (c, o) => '#' + c.map(t => parseInt((1 - o) * 255 + o * t).toString(16)).join('');
  return new Array(len).fill(0).map((o, i) => colorTransfer(color, 1 - i * delta));
}

function createCircle(svg, items, circle, width, attrs) {
  var colors = gradientColor(items.length);
  colors.forEach(function (color, i) {
    attrs.value = items[i];
    var g = new SVG.g(attrs);
    var angel = {
      start: 360 / colors.length * i,
      end: 360 / colors.length * (i + 1)
    };
    g.appendCircleArc(circle, angel, {
      fill: "none",
      stroke: color,
      strokeWidth: width
    });
    g.appendCircleArcText(items[i], circle, angel);
    svg.appendItem(g.render())
  })
}

const s = new SVG(600, 600)
const width = 40;
const d = {
  year: [2009, 2010, 2011, 2012],
  month: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  week: ['Mon', 'Tue', 'Wes', 'Thu', 'Fri', 'Sat', 'Sun'],
  day: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
}
Object.keys(d).forEach(function (k, i) {
  createCircle(s, d[k], { cx: 300, cy: 300, r: 300 - width * (i + 1) }, width, { category: k });
});
s.renderTo();

[].forEach.call(document.querySelectorAll("g"), function (g) {
  g.onclick = function () {
    var s = document.querySelector('svg')
    s.setAttribute(this.getAttribute("category"), this.getAttribute("value"))
    var u = {}, c = ['year', 'month', 'week', 'day'];
    for (var i = 0, l = c.length; i < l; i++) {
      var o = c[i];
      u[o] = s.getAttribute(o) || "";
      if (u[o] === "") return false;
    }
    alert(Object.keys(u).map(function (k) { return u[k] }).join(' '));
  }
})
```
在线预览：[https://code.h5jun.com/mura/edit?js,output](https://code.h5jun.com/mura/edit?js,output)
