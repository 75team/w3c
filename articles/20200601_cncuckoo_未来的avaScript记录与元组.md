# 未来的JavaScript记录与元组

> 原文地址：https://2ality.com/2020/05/records-tuples-first-look.html
>
> 原文作者：Dr. Axel Rauschmayer

Dr. Axel Rauschmayer最近撰文介绍了还处于Stage1阶段的两个JavaScript新特性：记录和元组。

记录和元组是一个新提案（Record & Tuple，https://github.com/tc39/proposal-record-tuple），建议为JavaScript增加两个复合原始类型：

- 记录（Record），是不可修改的按值比较的对象
- 元组（Tuple），是不可修改的按值比较的数组

## 什么是按值比较

当前，JavaScript只有在比较原始值（如字符串）时才会**按值比较**（比较内容）：

```js
> 'abc' === 'abc'
true
```

但在比较对象时，则是**按标识比较**（by identity），因此对象只与自身严格相等：

```js
> {x: 1, y: 4} === {x: 1, y: 4}
false
> ['a', 'b'] === ['a', 'b']
false
```

“记录和元组”的提案就是为了让我们可以创建按值比较的复合类型值。

比如，在对象字面量前面加一个井号（#），就可以创建一个记录。而记录是一个按值比较的复合值，且不可修改：

```js
> #{x: 1, y: 4} === #{x: 1, y: 4}
true
```

如果在数组字面量前面加一个#，就可以创建一个元组，也就是可以按值比较且不可修改的数组：

```js
> #['a', 'b'] === #['a', 'b']
true
```

按值比较的复合值就叫**复合原始值**或者**复合原始类型**。

### 记录和元组是原始类型

使用typeof可以看出来，记录和元组都是原始类型：

```js
> typeof #{x: 1, y: 4}
'record'
> typeof #['a', 'b']
'tuple'
```

### 记录和元组的内容有限制

- 记录：
  - 键必须是字符串
  - 值必须是原始值（包括记录和元组）
- 元组：
  - 元素必须是原始值（包括记录和元组）

### 把对象转换为记录和元组

```js
> Record({x: 1, y: 4}) 
#{x: 1, y: 4}
> Tuple.from(['a', 'b'])
#['a', 'b']
```

注意：这些都是浅层转换。如果值树中的任何节点不是原始值，Record()和Tuple.from()会抛出异常。

### 使用记录

```js
const record = #{x: 1, y: 4};

// 访问属性
assert.equal(record.y, 4);

// 解构
const {x} = record;
assert.equal(x, 1);

// 扩展
assert.ok(
  #{...record, x: 3, z: 9} === #{x: 3, y: 4, z: 9});
```

### 使用元组

```js
const tuple = #['a', 'b'];

// 访问元素
assert.equal(tuple[1], 'b');

// 解构（元组是可迭代对象）
const [a] = tuple;
assert.equal(a, 'a');

// 扩展
assert.ok(
  #[...tuple, 'c'] === #['a', 'b', 'c']);

// 更新
assert.ok(
  tuple.with(0, 'x') === #['x', 'b']);
```

### 为什么按值比较的值不可修改

某些数据结构（比如散列映射和搜索树）有槽位，其中键的保存位置根据它们的值来确定。如果键的值改变了，那这个键通常必须放到不同的槽位。这就是为什么在JavaScript中，可以用作键的值：

- 要么按值比较且不可修改（原始值）
- 要么按标识比较且可修改（对象）

### 复合原始值的好处

复合原始值有如下好处。

- 深度比较对象，这是一个内置操作，可以通过如===来调用
- 共享值：如果对象是可修改的，为了安全共享就需要深度复制它的一个副本。而对于不可修改的值，就可以直接共享
- 数据的非破坏性更新：如果要修改复合值，由于一切都是不可修改的，所以就要创建一个可修改的副本，然后就可以放心地重用不必修改的部分
- 在Map和Set等数据结构中使用：因为两个内容相同的复合原始值在这门语言的任何地方（包括作为Map的键和作为Set的元素）都被认为严格相等，所以映射和集合成会变得更有用。

接下来演示这些好处。

## 示例：集合与映射变得更有用

### 通过集合去重

有了复合原始值，即使是复合值（不是原始值那样的原子值）也可以去重：

```js
> [...new Set([#[3,4], #[3,4], #[5,-1], #[5,-1]])]
[#[3,4], #[5,-1]]
```

如果是数组就办不到了：

```js 
> [...new Set([[3,4], [3,4], [5,-1], [5,-1]])]
[[3,4], [3,4], [5,-1], [5,-1]]
```

### 映射的复合键

因为对象是按标识比较的，所以在（非弱）映射中用对象作为键几乎没什么意义：

```js
const m = new Map();
m.set({x: 1, y: 4}, 1);
m.set({x: 1, y: 4}, 2);
assert.equal(m.size, 2)
```

如果使用复合原始值就不一样了：下面行(A)创建的映射会保存地址（记录）到人名的映射。

```js
const persons = [
  #{
    name: 'Eddie',
    address: #{
      street: '1313 Mockingbird Lane',
      city: 'Mockingbird Heights',
    },
  },
  #{
    name: 'Dawn',
    address: #{
      street: '1630 Revello Drive',
      city: 'Sunnydale',
    },
  },
  #{
    name: 'Herman',
    address: #{
      street: '1313 Mockingbird Lane',
      city: 'Mockingbird Heights',
    },
  },
  #{
    name: 'Joyce',
    address: #{
      street: '1630 Revello Drive',
      city: 'Sunnydale',
    },
  },
];

const addressToNames = new Map(); // (A)
for (const person of persons) {
  if (!addressToNames.has(person.address)) {
    addressToNames.set(person.address, new Set());
  }
  addressToNames.get(person.address).add(person.name);
}

assert.deepEqual(
  // Convert the Map to an Array with key-value pairs,
  // so that we can compare it via assert.deepEqual().
  [...addressToNames],
  [
    [
      #{
        street: '1313 Mockingbird Lane',
        city: 'Mockingbird Heights',
      },
      new Set(['Eddie', 'Herman']),
    ],
    [
      #{
        street: '1630 Revello Drive',
        city: 'Sunnydale',
      },
      new Set(['Dawn', 'Joyce']),
    ],
  ]);
```

## 示例：有效地深度相等

### 使用复合属性值处理对象

在下面的例子中，我们使用数组的方法.filter()（行(B)）提取了地址等于address（行(A)）的所有条目 。

```js
const persons = [
  #{
    name: 'Eddie',
    address: #{
      street: '1313 Mockingbird Lane',
      city: 'Mockingbird Heights',
    },
  },
  #{
    name: 'Dawn',
    address: #{
      street: '1630 Revello Drive',
      city: 'Sunnydale',
    },
  },
  #{
    name: 'Herman',
    address: #{
      street: '1313 Mockingbird Lane',
      city: 'Mockingbird Heights',
    },
  },
  #{
    name: 'Joyce',
    address: #{
      street: '1630 Revello Drive',
      city: 'Sunnydale',
    },
  },
];

const address = #{ // (A)
  street: '1630 Revello Drive',
  city: 'Sunnydale',
};
assert.deepEqual(
  persons.filter(p => p.address === address), // (B)
  [
    #{
      name: 'Dawn',
      address: #{
        street: '1630 Revello Drive',
        city: 'Sunnydale',
      },
    },
    #{
      name: 'Joyce',
      address: #{
        street: '1630 Revello Drive',
        city: 'Sunnydale',
      },
    },
  ]);
```

### 对象变了吗?

在处理缓存的数据（如下面例子中的previousData）时，内置深度相等可以让我们有效地检查数据是否发生了变化。

```js
let previousData;
function displayData(data) {
  if (data === previousData) return;
  // ···
}

displayData(#['Hello', 'world']); // 显示
displayData(#['Hello', 'world']); // 不显示
```

### 测试

多数测试框架都支持深度相等，以检查某个计算是否产生了期待的结果。例如，Node.js内置的assert模块有一个函数叫deepEqual()。有了复合原始值，就可以直接断言：

```js
function invert(color) {
  return #{
    red: 255 - color.red,
    green: 255 - color.green,
    blue: 255 - color.blue,
  };
}
assert.ok(
  invert(#{red: 255, green: 153, blue: 51})
    === #{red: 0, green: 102, blue: 204});
```

## 新语法的优缺点

新语言的一个缺点是字符#已经在很多地方被占用了（比如私有字段），另外非数字字母字符多少显得有点神秘。可以看看下面的例子：

```js
const della = #{
  name: 'Della',
  children: #[
    #{
      name: 'Huey',
    },
    #{
      name: 'Dewey',
    },
    #{
      name: 'Louie',
    },
  ],
};
```

优点是这个语法比较简洁。对于一个常用的结构，我们都希望它简单。此外，一旦熟悉了这个语法之后，神秘感自然就会越来越淡。

除了特殊的字面量语法，还可以使用工厂函数：

```js
const della = Record({
  name: 'Della',
  children: Tuple([
    Record({
      name: 'Huey',
    }),
    Record({
      name: 'Dewey',
    }),
    Record({
      name: 'Louie',
    }),
  ]),
});
```

如果JavaScript支持Tagged Collection Literals（https://github.com/zkat/proposal-collection-literals，已撤销），这个语法还可能有所改进：

```js
const della = Record!{
  name: 'Della',
  children: Tuple![
    Record!{
      name: 'Huey',
    },
    Record!{
      name: 'Dewey',
    },
    Record!{
      name: 'Louie',
    },
  ],
};
```

唉，即便使用更短的名字，结果看起来还是有点乱：

```js
const R = Record;
const T = Tuple;

const della = R!{
  name: 'Della',
  children: T![
    R!{
      name: 'Huey',
    },
    R!{
      name: 'Dewey',
    },
    R!{
      name: 'Louie',
    },
  ],
};
```

## JSON与记录和元组

- JSON.stringify()把记录当成对象，把元组当成数组（会递归）。
- JSON.parseImmutable与JSON.parse()类似，但返回记录而非对象，返回元组而非数组（会递归）。

## 未来：类的实例会按值比较吗？

相比对象和数组，我其实更喜欢使用类作为一个数据容器。因为它可以把名字添加到对象上。为此，我希望将来会有一种类，它的实例不可修改且按值比较。

假如我们还可以深度、非破坏性地更新那些包含由值类型的类产生的对象的数据，那就更好了。

### 扩展阅读

- 共享可修改状态的问题及如何避免：https://exploringjs.com/deep-js/ch_shared-mutable-state.html









