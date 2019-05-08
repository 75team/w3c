今天和大家分享两个和 CSS 3D 相关的属性/值：
- 属性 `perspective`
- 声明 `transform-style: preserve-3d;`

为什么要分享它们两个呢？最近在 [100dayscss](https://100dayscss.com/) 上做 CSS 题的时候，被下面这个效果给难住了。

![](https://p1.ssl.qhimg.com/t01275df2373210c202.gif)

当时鬼使神差地就是不知道如何把图 1.1 变成图 1.2。

图 1.1 | 图 1.2 |
:-------------------------:|:-------------------------:|
![](https://p3.ssl.qhimg.com/t01b06795a9b8b3c649.png) | ![](https://p0.ssl.qhimg.com/t0191f83577f5181276.png)

后来偷偷作弊了下，才知道是漏了`transform-style: preserve-3d`。和 3D 密切相关的还有一个`perspective`属性，故本文重点介绍下这两个。

## perspective

`perspective`属性决定了`z=0`平面和用户眼睛之间的距离，当绘制 3D 的时候会用到。

先来看个例子：立方体，宽 100px 高 100px，其中心点在坐标系的原点`(0,0,0)`处。

> 立方体的中心点在`(0,0,0)`，所以`z=0`平面也在立方体的中心点位置

下表是不同`perspective`下的效果（[在线预览](https://codepen.io/anjia/pen/vPrQEv)）：

`perspective:0px` | `perspective:50px` | `perspective:51px` | `perspective:100px`
:-------------------------:|:-------------------------:|:-------------------------:|:-------------------------:|
![](https://p5.ssl.qhimg.com/t01fc5a9c9ab2a2249e.png) | ![](https://p3.ssl.qhimg.com/t01c74650ef3efd96a7.png) | ![](https://p1.ssl.qhimg.com/t017f18afdbb4951196.png) | ![](https://p3.ssl.qhimg.com/t0156aa90d893e54850.png)
图 2.1 | 图 2.2 | 图 2.3 | 图 2.4

说明：
- `perspective:0px`时，纯平面，没有 3D 效果
- `perspective:50px`时，刚好是立方体的中心位置
- `perspective:51px`时，粉红色的“1号”面刚漏出1px，故相比之前的图，方位变化不大，但是颜色偏红
- `perspective:100px`时，立方体整个都视线之内

注意：
- 3D 元素在用户后面的部分是不会被绘制的（如图 2.2、2.3）
- 消失点默认是元素的中心位置。我们也可以通过`perspective-origin`属性来设置

> `perspective`的值可以是`none`和`<length>`
> 当值是 0 或者负数时，则不会有 3D 效果


## transform-style

`transform-style` 属性决定了元素的子元素是在 3D 空间中展开，还是在 2D 平面中展开。

- `transform-style: flat` 元素的子元素们是放置在元素本身的平面中的
- `transform-style: preserve-3d` 元素的子元素们是放置在 3D 空间中的

注意：
- 如果值是`flat`，则元素的子元素们将不会在它们自己的 3D 空间中存在
- `transform-style`是不能被继承的，这就意味着如果元素的非叶子后代需要在 3D 中展开，则必须给子元素自己也设置下

这个概念比较好理解。我们直接以开头的例子为例：


每小片`rotateX(-24deg)` | 父容器未设置 3d | 父容器设置了`transform-style:preserve-3d`
:-------------------------:|:-------------------------:|:-------------------------:|
![](https://p0.ssl.qhimg.com/t01401cc7bf255a8ab9.png) | ![](https://p4.ssl.qhimg.com/t018a64b79aa506e6b1.png) | ![](https://p1.ssl.qhimg.com/t01afa3d8f234007734.png)
图 3.1 | 图 3.2 | 图 3.3

说明：
- 图 3.2 里，伞片之所以比容器小，是因为伞片沿 X 轴旋转了
- 图 3.3 里，大小又比 3.2 看起来小了点，是因为父容器设置了 3d，导致伞“往里扣”了，所以再小了点

目前伞整体是往里扣着的，现在，我们把它再转过来。即给伞的父容器设置：
```css
transform: rotateX(70deg) rotateY(-15deg);  /* 前后翻转个角度，再倾斜下 */
transform-style: preserve-3d;    /* 需要是 3d 上下文 */
```

最终的效果就实现了：

![](https://p5.ssl.qhimg.com/t0118949b63dd054131.png)

完整代码，可点击[在线预览](https://codepen.io/anjia/pen/QoagGV)。

## 主要参考

https://drafts.csswg.org/css-transforms-2/#propdef-perspective
https://drafts.csswg.org/css-transforms-2/#transform-style-property
