大家可能不一定都用过CSS自定义属性（[ CSS Custom Properties ](https://www.w3.org/TR/2015/CR-css-variables-1-20151203/)），但是一定都用过预处理器中的变量。这也是CSS自定义属性有时候被称作CSS变量的原因。

但由于预处理器中变量的使用位置可以不局限在属性值，但是自定义属性只能作为属性值使用，所以其准确名称是CSS自定义属性，而不是CSS变量。

下面我们先从预处理器说起。

## 一、预处理器中的变量

如果大家用过预处理器的话，一定会有这样的感触。设计师给的某个颜色值，只需要给其定义一个语义化的变量名，就可以在页面的任何（适当的）地方使用了，而不用记住或者复制粘贴这一色值。这样做的好处也是很明显，那就是当这一色值在多处使用需要修改时，直接修改变量的值即可。这就是预处理器中的变量的优势所在：**减少复制粘贴，易于修改**。

不过撇开优点不谈，预处理器的变量也有一些缺点和限制，如下：

1. **不能动态修改变量**：预处理器是在编译时进行变量的处理，编译后变量其实就不存在了。
2. **没有DOM结构，无法级联继承**。
3. **不能用JavaScript进行读写**。

看到这里大家都一定会想，既然预处理器变量有这些缺点，那是不是CSS的自定义属性就能做到这些呢？想知道的话，和我一起往下进行吧。

## 二、如何定义自定义属性

### 2.1 自定义属性名

CSS自定义属性的语法格式为`--*`，双横线加上具体的自定义属性名，属性名是一个合法的CSS[标识符](https://www.w3.org/TR/css-syntax-3/#identifier)即可。

自定义属性没有具体的CSS含义，其用途完全由作者和使用者决定。自定义属性可以**应用于任何元素，其可以被继承，并且支持级联，不支持动画**。

注意：与CSS属性不同，自定义属性是**大小写敏感的**。

> CSS不会被[`all`](https://developer.mozilla.org/en-US/docs/Web/CSS/all)属性重置，将来可能会定义一个重置所有变量的属性。

### 2.2 自定义属性值

自定义属性值的要求可以说是非常地宽松，可以是任何有效的CSS值，如颜色、字符、布局的值、甚至是表达式。

既然自定义属性值的要求如此宽松，那我们只需要知道有哪些情况不允许即可。

只要自定义属性值不存在以下几种情况即为合法：无效字符值、无效url值、未配对的`)`/`]`/`}`、不能在最外层出现`;`、不能出现`!`。

> 有个例外，自定义属性后面可以跟`!important`，但是这个`!important`其实并没有卵用，因为在进行属性值检测前就会将其移除。

下面我们来看个自定义属性的例子，大家觉得下面这个是一个合法的自定义属性吗？

```html
--foo: if(x > 5) this.width = 10;
```

答案是这是一个合法的自定义属性，但显然它并没有任何用处，因为将其用于其他任何常规属性是都是无效的。

### 2.3 如何使用变量

通过`var()`函数，自定义属性的值可以用作另一个属性的值。`var()`的语法格式如下：

```html
var() = var( <custom-property-name> [, <declaration-value> ]? )
```

其中第一个参数为自定义属性名，第二个参数为后备值。当传入的自定义属性无效或者不存在时，会使用后备值。

**`var()`可以用在属性值中的任何部分，但是不能用在属性名、选择器以及其他除属性值以外的地方。**

注意，后备值允许逗号，如`var(--foo, red, blud)`会定义一个`red, blue`的后备值，也就是说第一个逗号之后的都会被当做默认值。

好了，我们已经知道了`var()`的基础用法，那么`var()`是如何替换成具体值的呢？

1. 如果自定义属性的值为初始值以外的任何值，则直接将`var()`替换为对应的值。
2. 否则，如果`var()`函数有后备值，则替换成后备值，如果后备值中也有`var()`则同样进行替换。
3. 否则在计算值过程中，`var()`就是无效的。

### 2.4 注意事项

#### 1. 自定义属性与动画

上面有提到自定义属性不能用于动画。其实自定义属性可以出现在`@keyframs`中，但其行为较为特殊，会导致动画瑕疵，因为其只会在指定帧影响使用了自定义属性的可动画属性。如下所示：

```html
<style>
  :root {
    --custom-color: #0f0;
    --custom-width: 200px;
  }
  .box {
    color: var(--custom-color);
    width: var(--custom-width);
    border: 1px solid grey;
    animation: linear 3s scale-width;
  }

  @keyframes scale-width {
    50% {
	  --custom-width: 400px;
    }
  }
</style>

<div class="box">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Animi rerum labore numquam quo magni, modi quas dolores maiores alias! Consequatur optio error fugit velit, et veritatis quidem unde fuga nostrum?</div>
```

![](http://p5.qhimg.com/t010354f98b40a72158.gif)

可以看出，类`.box`元素`div`的宽度只发生了两次改变，这说明自定义属性无法进行动画，但是会在固定帧时生效，从而影响相关的属性。

#### 2. 自定义属性大小写敏感

如下例所示，两个div内的字体颜色不一样，可以看出CSS自定义属性大小写敏感性。

```
<style>
  :root {
    --custom-color: red;
    --CUSTOM-COLOR: green;
  }
  .box--1 {
    color: var(--custom-color);
  }
  .box--2 {
    color: var(--CUSTOM-COLOR);
  }
</style>

<div class="box--1">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Animi rerum labore numquam quo magni, modi quas dolores maiores alias! Consequatur optio error fugit velit, et veritatis quidem unde fuga nostrum?</div>
<div class="box--2">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Animi rerum labore numquam quo magni, modi quas dolores maiores alias! Consequatur optio error fugit velit, et veritatis quidem unde fuga nostrum?</div>

```

![](http://p2.qhimg.com/t01798e5d4c75bea3b8.png)

#### 3. 自定义属性不能作为一个独立属性值的一部分

自定义属性不能作为一个独立属性值的一部分， 如下所示：

```
.foo {
  --gap: 20;
  margin-top: var(--gap)px;
}
```

最终的并不是想象中的`margin-top: 20px`，而是`margin-top: 20 px`，而这是一个无效的值。这时我们可以用`calc()`函数来实现，如下：

```
.foo {
  --gap: 20;
  margin-top: calc(var(--gap) * 1px);
}
```

#### 4. 循环依赖

既然能通过`var()`使用变量，不知道大家是不是和我一样会有这样的疑问，如果使用变量的时候产生了闭环咋办呢？

其实大家可以放心，CSS规范在定义自定义属性的时候已经考虑到了这一点。规范中将其称为**依赖循环**，如果自定义属性引用自己，或者两个以上的属性互相引用则会导致依赖循环。如下所示

```
:root {
  /* 自定义属性引用自己 */
  --self: calc(var(--self) + 10px);

  /* 两个自定义属性互相引用 */
  --one: calc(var(--two) + 20px);
  --two: calc(var(--one) - 20px);
}

```

其实对于依赖循环的处理也没有想象中的复杂，如果在计算属性的时候，发现了依赖依赖循环，则**依赖循环中的所有自定义属性值都使用初始值代替**。

需要注意的是，**自定义属性是在计算值时解析其中的`var()`函数的，这一步是在值继承之前**。所以只有同一元素上的多个自定义属性相互引用时才会导致依赖循环；元素树中父级元素上的自定义属性不会导致子孙元素自定义属性的循环依赖。

如下所示，`two`中的`—-bar`在被`three`继承前值已经为`calc(10px + 10px)`，所以最终`three`中`--foo`的值为`30px`，并不会导致循环依赖。

```
<one><two><three /></two></one>

one   { --foo: 10px; }
two   { --bar: calc(var(--foo) + 10px); }
three { --foo: calc(var(--bar) + 10px); }
```

## 三、自定义属性的优势

前面提到了预处理器中，自定义属性有三个局限或缺点。那么CSS引入的自定义属性是否具备了相应的特性呢。是的，CSS自定义属性是具备的。

1. **可以动态修改自定义属性**
2. **有DOM结构的概念，可以级联继承**。
3. **可以用JavaScript进行读写**。

### 3.1 动态修改自定义属性

我们先看下下例中SCSS代码和CSS自定义属性的对比：

```
// SCSS
$custom-size: 16px;

@media (min-width: 1000px) {
  $custom-size: 28px;
}

body {
 font-size: $custom-size;
}

// CSS自定义属性
:root {
  --custom-size: 16px;
}
@media (min-width: 1000px) {
  :root {
    --custom-size: 28px;
  }
}
body {
  font-size: var(--custom-size)；
}
```

如果你实际试一下的话，你会发现使用SCSS预编译器时，在视口宽度变化时，并不能改变字体大小。而使用自定义属性时，当窗口宽度大于1000px时，字体会相应变大。

### 3.2 有DOM结构的概念，可以级联继承

CSS自定义属性时存在DOM结构的概念，并且可以继承。如下例所示：

```
:root {
  --custom-color: red;
}
div {
  --custom-color: green;
}
p {
  color: var(--custom-color)
}

<div><p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Animi rerum labore numquam quo magni, modi quas dolores maiores alias! Consequatur optio error fugit velit, et veritatis quidem unde fuga nostrum?</p></div>
<p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Animi rerum labore numquam quo magni, modi quas dolores maiores alias! Consequatur optio error fugit velit, et veritatis quidem unde fuga nostrum?</p>
```

其中第一个div内的p标签内的颜色为绿色，因为自定义属性继承了div中的值，而第二个p标签中文字颜色即为红色，因为它的值来自全局的`:root`中的自定义属性。

![](http://p5.qhimg.com/t01b36ee4b32405795f.png)

### 3.2 使用JavaScript进行读写

我们可以通过`window.getComputedStyle(element)`的方法`getPropertyValue`获取属性值，通过`el.style.setProperty`来设置属性值。

如下所示，我们可以先获取当前元素的字体大小，然后再对其进行修改：

```html
:root {
  --custom-font-size: 12px;
}
p {
  font-size: var(--custom-font-size);
}

<p id="p1">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Culpa, pariatur maiores esse perspiciatis quam itaque modi impedit soluta, reiciendis voluptatem non obcaecati dolorum eveniet ad reprehenderit hic eligendi maxime repudiandae.</p>

```

```js
const el = document.getElementById('p1')
setTimeout(() => {
  const currSize = window.getComputedStyle(el).getPropertyValue('--custom-font-size')

  // 计算新的大小
  const newSize = ( currSize.split('px')[0] * 2) + 'px'

  el.style.setProperty('--custom-font-size', newSize)
}, 3000)
```

执行如上代码，会发现，三秒后，字体的的大小会增大一倍，这就是通过JavaScript对自定义属性操作的结果。

## 四、兼容性

![](http://p4.qhimg.com/t0134e9c2742ab4e387.png)
如图所示，目前主流的浏览器对于自定义属性都已经有了很好的兼容性。所以如果你的产品只用兼容现代浏览器，而且可以通过类似`postcss-css-variables `的插件来实现兼容，那么你就完全可以用起来了。或者也可以通过优雅降级的方式分别加载带有CSS自定义属性和不带有CSS自定义属性的代码。

## 总结

本文介绍了CSS自定义属性的用法及其所具备的几个优势，但限于篇幅有限，本文没有介绍CSS自定属性的使用场景。其实CSS自定义属非常适合用来实现主题的切换，感兴趣的可以自己参考一下。

## 参考链接

> 1. [https://www.w3.org/TR/2015/CR-css-variables-1-20151203/](https://www.w3.org/TR/2015/CR-css-variables-1-20151203/)
> 2. [https://www.smashingmagazine.com/2017/04/start-using-css-custom-properties/](https://www.smashingmagazine.com/2017/04/start-using-css-custom-properties/)
> 3. [https://www.smashingmagazine.com/2018/05/css-custom-properties-strategy-guide/](https://www.smashingmagazine.com/2018/05/css-custom-properties-strategy-guide/)
> 4. [https://www.w3cplus.com/css3/start-using-css-custom-properties.html](https://www.w3cplus.com/css3/start-using-css-custom-properties.html)