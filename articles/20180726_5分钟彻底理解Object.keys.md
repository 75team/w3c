# 5分钟彻底理解Object.keys

> 本文作者：[Berwin](http://github.com/berwin/)，W3C性能工作组成员，360导航高级前端工程师。Vue.js早期用户，《深入浅出Vue.js》（正在出版）作者。
> 
> http://github.com/berwin

前几天一个朋友问了我一个问题：为什么`Object.keys`的返回值会自动排序？

例子是这样的：

```javascript
const obj = {
  100: '一百',
  2: '二',
  7: '七'
}
Object.keys(obj) // ["2", "7", "100"]
```

而下面这例子又不自动排序了？

```javascript
const obj = {
  c: 'c',
  a: 'a',
  b: 'b'
}
Object.keys(obj) // ["c", "a", "b"]
```
当朋友问我这个问题时，一时间我也回答不出个所以然。故此去查了查[ECMA262规范](https://tc39.github.io/ecma262/)，再加上后来看了看这方面的文章，明白了为什么会发生这么诡异的事情。

故此写下这篇文章详细介绍，当`Object.keys`被调用时内部都发生了什么。

## 1. 答案

对于上面那个问题先给出结论，`Object.keys`在内部会根据属性名`key`的类型进行不同的排序逻辑。分三种情况：

1. 如果属性名的类型是`Number`，那么`Object.keys`返回值是按照`key`从小到大排序
2. 如果属性名的类型是`String`，那么`Object.keys`返回值是按照属性被创建的时间升序排序。
3. 如果属性名的类型是`Symbol`，那么逻辑同`String`相同

这就解释了上面的问题。

下面我们详细介绍`Object.keys`被调用时，背后发生了什么。

## 2. 当`Object.keys`被调用时背后发生了什么

当`Object.keys`函数使用参数`O`调用时，会执行以下步骤：

第一步：将参数转换成`Object`类型的对象。

第二步：通过转换后的对象获得属性列表`properties`。

> 注意：属性列表`properties`为List类型（[List类型](https://www.ecma-international.org/ecma-262/#sec-list-and-record-specification-type)是[ECMAScript规范类型](https://www.ecma-international.org/ecma-262/#sec-ecmascript-specification-types)）

第三步：将List类型的属性列表`properties`转换为Array得到最终的结果。

> 规范中是这样定义的：
> 
> 1. 调用`ToObject(O)`将结果赋值给变量`obj`
> 2. 调用`EnumerableOwnPropertyNames(obj, "key")`将结果赋值给变量`nameList`
> 3. 调用`CreateArrayFromList(nameList)`得到最终的结果

### 2.1 将参数转换成Object（`ToObject(O)`）

`ToObject`操作根据下表将参数`O`转换为Object类型的值：

参数类型       | 结果                    |
--------------|------------------------|
Undefined     | 抛出TypeError           |
Null          | 抛出TypeError           |
Boolean       | 返回一个新的 Boolean 对象 |
Number        | 返回一个新的 Number 对象  |
String        | 返回一个新的 String 对象  |
Symbol        | 返回一个新的 Symbol 对象  |
Object        | 直接将Object返回         |

因为`Object.keys`内部有`ToObject`操作，所以`Object.keys`其实还可以接收其他类型的参数。

上表详细描述了不同类型的参数将如何转换成Object类型。

我们可以简单写几个例子试一试：

先试试`null`会不会报错：

<img src="http://p6.qhimg.com/t0114e481ee248fc55b.jpg" width="560" alt="Object.keys(null)">

图1 `Object.keys(null)`

如图1所示，果然报错了。

接下来我们试试数字的效果：

<img src="http://p9.qhimg.com/t011cf14c21a917162b.jpg" alt="Object.keys(123)" width="150">

图2 `Object.keys(123)`

如图2所示，返回空数组。

为什么会返回空数组？请看图3：

<img src="http://p7.qhimg.com/t01556d576ff9b57edd.jpg" alt="new Number(123)" width="260">

图3 `new Number(123)`

如图3所示，返回的对象没有任何可提取的属性，所以返回空数组也是正常的。

然后我们再试一下String的效果：

<img src="http://p4.qhimg.com/t018d6288e6b5f7f32c.jpg" alt="Object.keys('我是Berwin')" width="380">

图4 `Object.keys('我是Berwin')`

图4我们会发现返回了一些字符串类型的数字，这是因为String对象有可提取的属性，看如图5：

<img src="http://p1.qhimg.com/t01386384cc122d5153.jpg" alt="new String('我是Berwin')" width="340">

图5 `new String('我是Berwin')`

因为String对象有可提取的属性，所以将String对象的属性名都提取出来变成了列表返回出去了。

### 2.2 获得属性列表（`EnumerableOwnPropertyNames(obj, "key")`）

获取属性列表的过程有很多细节，其中比较重要的是调用对象的内部方法`OwnPropertyKeys`获得对象的`ownKeys`。

> 注意：这时的`ownKeys`类型是List类型，只用于内部实现

然后声明变量`properties`，类型也是List类型，并循环`ownKeys`将每个元素添加到`properties`列表中。

最终将`properties`返回。

> 您可能会感觉到奇怪，ownKeys已经是结果了为什么还要循环一遍将列表中的元素放到`properties`中。
> 
> 这是因为EnumerableOwnPropertyNames操作不只是给Object.keys这一个API用，它内部还有一些其他操作，只是Object.keys这个API没有使用到，所以看起来这一步很多余。

所以针对`Object.keys`这个API来说，获取属性列表中最重要的是调用了内部方法`OwnPropertyKeys`得到`ownKeys`。

其实也正是内部方法`OwnPropertyKeys`决定了属性的顺序。

关于`OwnPropertyKeys`方法[ECMA-262](https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots-ownpropertykeys)中是这样描述的：

当`O`的内部方法`OwnPropertyKeys`被调用时，执行以下步骤（其实就一步）：

1. `Return ! OrdinaryOwnPropertyKeys(O).`

而`OrdinaryOwnPropertyKeys`是这样规定的：

1. 声明变量`keys`值为一个空列表（List类型）
2. 把每个Number类型的属性，按数值大小升序排序，并依次添加到`keys`中
3. 把每个String类型的属性，按创建时间升序排序，并依次添加到`keys`中
4. 把每个Symbol类型的属性，按创建时间升序排序，并依次添加到`keys`中
5. 将`keys`返回（`return keys`）

**上面这个规则不光规定了不同类型的返回顺序，还规定了如果对象的属性类型是数字，字符与Symbol混合的，那么返回顺序永远是数字在前，然后是字符串，最后是Symbol。**

举个例子：

```javascript
Object.keys({
  5: '5',
  a: 'a',
  1: '1',
  c: 'c',
  3: '3',
  b: 'b'
})
// ["1", "3", "5", "a", "c", "b"]
```

属性的顺序规则中虽然规定了`Symbol`的顺序，但其实`Object.keys`最终会将`Symbol`类型的属性过滤出去。（原因是顺序规则不只是给`Object.keys`一个API使用，它是一个通用的规则）

### 2.3 将List类型转换为Array得到最终结果（`CreateArrayFromList( elements )`）

现在我们已经得到了一个对象的属性列表，最后一步是将List类型的属性列表转换成Array类型。

将List类型的属性列表转换成Array类型非常简单：

1. 先声明一个变量`array`，值是一个空数组
2. 循环属性列表，将每个元素添加到`array`中
3. 将`array`返回

## 3. 该顺序规则还适用于其他API

上面介绍的排序规则同样适用于下列API：

1. `Object.entries`
2. `Object.values`
3. `for...in`循环
4. `Object.getOwnPropertyNames`
5. `Reflect.ownKeys`

> 注意：以上API除了`Reflect.ownKeys`之外，其他API均会将`Symbol`类型的属性过滤掉。

