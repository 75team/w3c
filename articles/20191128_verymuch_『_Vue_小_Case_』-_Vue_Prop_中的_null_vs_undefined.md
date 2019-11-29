> 前言：本文将引入两个 Vue 中比较特殊的使用场景，带领大家熟悉一下`null`和`undefined`的区别，然后再分析一下 Vue 中是怎么对 Props 做校验的，最后给出大佬是怎么解释的。

一直以来，笔者在使用 Vue 时，习惯于在需要表示 prop 属性未定义时，使用`undefined`，而不是`null`。因为“_`undefined`才是没有值，`null`是有值，但是值为空的对象（注意不是空对象`{}`）_”。

基于这一习惯，笔者规避掉了很多问题，对此也没有深究。

直到最近，参与项目的一些同学习惯于指定`null`为初始值，我也没有强制性统一。根本原因是，我自己也觉得没什么，每个人都有自己的习惯，只要大的风格不出偏差就可以接受，毕竟项目紧嘛。

直到今天遇到了下面的场景，我才发现，原来这么做会有一些奇怪的小问题。

## 一、场景再现

### 1.1 场景一：prop 的值是`null`，会使用 default 的值吗？

阅读以下代码，你觉得有问题吗？

HTML：

```html
<div id="app">
  <list :items="null"></list>
</div>
```

JS：

```js
Vue.component('list', {
  template: '<div>{{ typeof items }} {{ items.join(',') }}</div>',
  props: {
    items: {
      type: Array,
      default() {
        return [1, 2, 3]
      },
    }
  }
})

new Vue({
  el: '#app',
});
```

上述的代码执行之后有问题吗？停顿 5s 思考一下，1、2、3、4、5。

好，我们来看下[示例代码](https://jsbin.com/yiwisag/3/edit?html,js,console,output)，这段代码执行之后会报错(记得开启控制台查看错误，因为是 JS 执行错误)。因为`items`最终的值是`null`，而所以没法对`null`执行`join()`拼接。那为什么 prop 值为`null`时，`default`中指定的值没有生效呢？

如果你愿意，可以把`null`换成`undefined`，你会发现正如你期望的那样，`default`生效了。

### 1.2 场景二：prop 设置了`required`，传`null`可以吗？

既然 prop 的值为`null`时，`default`不会生效，那我们能否通过`required`强制 prop 必填呢？

HTML 保持场景一不变。JS 做如下改动：

```js
Vue.component('list', {
  template: '<div>{{ typeof items }} {{ items.join(',') }}</div>',
  props: {
    items: {
      type: Array,
      required: true,
    }
  }
})

new Vue({
  el: '#app',
});
```

同样停顿 5s 思考一下，1、2、3、4、5，好。我们看下 [示例代码](https://jsbin.com/vapewih/12/edit?html,js,console,output)，这段代码执行时依然会报错。

Vue 会给出警告，信息如下：

```js
[Vue warn]: Invalid prop: type check failed for prop \"items\". Expected Array, got Null.
(found in component <list>)
```

从警告内容可以看出`null`通过了`required: true`的验证，但是没有通过类型校验，最后浏览器执行报错。如果这时候，你再次尝试将`null`改成`undefined`，你会发现依然行不通，会有类似的错误。

好了，至此，我们已经看完了我所想展示的示例。可以总结为以下两个疑问：

1. 当值为`null`的时候，为什么`default`中定义的值没有生效？（显然，当值为 undefined 的时候，默认值是会生效的）
2. 当值为`null`/`undefined`的时候，为什么`required: ture`的校验似乎通过了，但是类型校验反倒没有通过？（显然，`required: false`的时候，`null`和`undefined`是都能通过类型校验的。这点文档中有提到。）

在详细解释为什么之前，我们先来熟悉下一个历史悠久的问题：“`null`和`undefined`的区别是什么？”

## 二、null 和 undefined 的区别

在设计之初，JavaScript 是这样区分的：**`null`是一个表示"无"的对象，转为数值时为`0`；`undefined`是一个表示"无"的原始值，转为数值时为`NaN`。**

```js
Number(null) // 0
5 + null // 5

Number(undefined) // NaN
5 + undefined // NaN
```

> 不得不吐槽，真是坑呀

但后来被证明这并不可行。目前，`null`和`undefined`基本是同义的，只有一些细微的差别。

`null`表示**没有对象，即此处不应该有值**。虽然其表示不应该有值，但它是有值的，值是一个空的对象（注意不是`{}`）。用法如下：

1. 作为函数的参数，表示该函数的参数不是对象。
2. 作为对象原型链的终点。

```js
Object.getPrototypeOf(Object.prototype)
// null
```

`undefined`表示**缺少值，就是此处应该有一个值，但是还没有定义**。

1. 变量被声明了，但没有赋值时，就等于`undefined`。
2. 调用函数时，应该提供的参数没有提供，该参数等于`undefined`。
3. 对象没有赋值的属性，该属性的值为`undefined`。
4. 函数没有返回值时，默认返回`undefined`。

```js
var i;
i // undefined

function f(x){console.log(x)}
f() // undefined

var  obj = new Object();
obj.p // undefined

var ret = f();
ret // undefined
```

## 三、Vue 中的 Prop 校验

好了，我们已经再次熟悉了一下`null`和`undefined`的区别。下面就让我们一起看下，Vue 中是如何进行 Prop 校验以及如何对待`null`和`undefined`。

笔者阅读了 Vue 中关于[Prop 校验](https://github.com/vuejs/vue/blob/dev/src/core/util/props.js)的代码，总结出了如下图所示的校验流程：

![](https://p4.ssl.qhimg.com/t01976b08b66f14e527.png)

从图中第三步可以看出，只有 prop 的值为`undefined`时，才会去获取`default`中的值。这解释了第一部分两个奇怪现象的第一个。

代码片段如下：

```js
// check default value
if (value === undefined) {
  value = getPropDefaultValue(vm, prop, key)
  // since the default value is a fresh copy,
  // make sure to observe it.
  const prevShouldObserve = shouldObserve
  toggleObserving(true)
  observe(value)
  toggleObserving(prevShouldObserve)
}
```

从图中第四步可以看出，当`required: true`时，只有不传属性时，才会提示`'Missing required prop`。当`required：false`时，`null`和`undefined`都会通过校验。其他情况，则都会进行类型校验。这解释了第一部分两个奇怪现象的第二个。

代码片段如下：

```js
// required为true，且不传属性
if (prop.required && absent) {
  warn(
    'Missing required prop: "' + name + '"',
    vm
  )
  return
}
// required为false，null和undefined校验通过
if (value == null && !prop.required) {
  return
}
// 其他情况校验type
let type = prop.type
// ...
if (type) {
  // type校验逻辑...
}
```

好了，我们通过 Vue 源码中的逻辑解释了为什么会出现第一部分中的奇怪现象。但可能还是没有理解为什么。下面我们继续来看一下大佬们的解释。

## 四、大佬们的解释

引用一下尤雨溪在[issue#6768 中的回答](https://github.com/vuejs/vue/issues/6768#issuecomment-335527318)，部分内容及翻译如下：

> `null` indicates the value is explicitly marked as not present and it should remain null.
>
> `null`表示显式地标记值为未指定（是个空值），所以我们保留`null`。（这里解释了为什么不对`null`应用`default`）
>
> `undefined` indicates the value is not present and a default value should be used if available.
>
> `undefined`表示值没有指定，如果有默认值，则使用默认值。
>
> `required: true` indicates neither `null` or `undefined` are allowed (unless a default is used)
>
> `required: true`表示在 default 没有应用的情况下，`null`和`undefined`都不允许。
>
> 注意：还有一个小前提，就是给属性指定了类型
>
> （此外，这句话隐式包含了 required 和 default 是可以共存的，先应用 default，再判断`required: true`）

在这一评论中，尤雨溪还解释了为什么要这么设计。虽然这样存在歧义，但是这和`null`与`undefined`在语言本身中的含义是统一的，如果改变的会造成更多的混乱。

## 五、总结

比较赞同尤雨溪的解释，虽然 JavaScript 语言本身存在一定的设计缺陷，但我们对这些缺陷表示知道，并不轻易 hack，不然就会出现更多的混淆。与语言本身保持统一是一种更好的方式。

最后，虽然本文标题是《Vue Prop 中的 null vs undefined》，但其中频繁涉及到了 required 和 default 这两个概念。所以想借此机会和大家一起明确一下 Vue 中这两个值的具体含义。

1. `required: true`表示要求传入该属性，即 template 中要有该属性。只要有，不管值是什么，都可校验通过（没通过是类型校验的事情）。
2. default 会在 value 值为`undefined`时生效，不管是因为没有传入属性还是属性的值就是`undefined`。所以当你希望触发默认值的时候，一定要使用`undefined`。

## 参考链接

> 1. [undefined 与 null 的区别](https://www.ruanyifeng.com/blog/2014/03/undefined-vs-null.html)
> 2. [「Vue Issue #7720」- Vue warns about missing required prop that has a default value](https://github.com/vuejs/vue/issues/7720)
> 3. [「Vue Issue #6768」- No warning when string property value is `null` ](https://github.com/vuejs/vue/issues/6768)
> 4. [Vue Prop 校验源码](https://github.com/vuejs/vue/blob/dev/src/core/util/props.js)
