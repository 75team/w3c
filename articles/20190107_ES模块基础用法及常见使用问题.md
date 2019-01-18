# ES模块基础用法及常见使用问题

ES6中引入了模块（Modules）的概念，相信大家都已经挺熟悉的了，在日常的工作中应该也都有使用。

本文会简单介绍一下ES模块的优点、基本用法以及常见问题。

着重介绍3个使用ES模块的常见问题：

1. 如何在浏览器中下快速使用export/import?
2. 如何在Node下快速使用export/import?
3. 当心，不要修改export输出的对象，尽管你能改

## 一、ES模块的优点

ES模块的引入主要有以下几个优点：

1. 可以将代码分割成功能独立的更小的文件。
2. 有助于消除命名冲突。
3. 不再需要对象作为命名空间（比如Math对象），不会污染全局变量。
4. ES6 模块在编译时就能确定模块的依赖关系，以及输入和输出的变量，从而可以进行静态优化。

## 二、ES模块的基本用法

模块功能中主要有以下几个关键词：`export`、`import`、`as`、`default`、`*`。

* `export`用于规定输出模块的对外接口
* `import`用于输入模块提供的接口
* `as`用于重命名输出和输入接口
* `default`用于指定模块输出的默认接口
* `*`表示输入模块的所有接口。

## 2.1 `export`

### 2.1.1 常规用法

`export`输出规定模块的对外接口，有4种常规用法：

```
// 用法1：直接输出一个变量声明、函数声明或者类声明
export var m = 1;
export function m() {};
export class M {};

// 用法2：输出内容为大括号包裹的一组变量，
// 注意不要被迷惑，export不能直接输出常规的对象，下面会给出错误示例。
var m1 = 1;
var m2 = 2;
export {m1, m2};

// 用法3：输出指定变量，并重命名，则外部引入时得到的是as后的名称。
var n = 1;
export {n as m};

// 用法4：使用default输出默认接口，default后可跟值或变量
export default 1;
var m = 1
export default m;
```

### 2.1.2 错误用法

需要注意的是，在使用`export`时会经常出现以下错误用法。如下代码所示：

```
// 用法1
export 1;
export {m: '1'};

// 用法2
var m = 1;
export m;

// 用法3
function foo() {
  export default 'bar' // SyntaxError
}
```

其中错误用法1和用法2相同，`export`必须输出一个接口，不能输出一个值（哪怕是对象也不行）或者一个已赋值的变量，已赋值的变量对应的也是一个值。上述常规用法中，`export default`后之所以可以直接跟值是因为`default`为输出的接口。

错误用法3是因为`export`只能出现在模块的顶层作用域，不能存在块级作用域中。如果出现在块级作用域的话，就没法做静态优化了，这违背ES6中模块的设计初衷了。

## 2.2 `import`

`import`命令用于引入模块提供的接口，有以下几种常见用法：

```
// 用法1：仅执行 my_module 模块，不输入任何值（可能没啥用，但是是合法的）
import 'my_module';

// 用法2：输入 my_module 的默认接口, 默认接口重命名为 m
import m from 'my_module';

// 用法3：输入 my_module 的 m 接口
import { m } from 'my_module';

// 用法4：输入 my_module 的 m 接口，使用as重命名m接口
import { m as my_m} from 'my_module';

// 用法5：导入所有接口
import * as all from 'my_module';
```

需要注意的是，**如果多次重复执行同一句import语句，那么只会执行一次，而不会执行多次。如下两种均不会多次执行。**

```
// 用法1：重复引入 my_module，只执行一次
import 'my_module';
import 'my_module';

// 用法2：多次引入不同的接口，只执行一次
import { m1 } from 'my_module';
import { m2 } from 'my_module';
```

此外，**import命令输入的变量都是只读的，加载后不能修改接口**。

```
import { m } from 'my_module';
m = 1; // SyntaxError: "m" is read-only
```

如果m是一个对象，改写m的属性是可以的。但是笔者不建议这么做，具体内容第三部分会详细说。

### 错误用法

需要注意的是，import也必须在顶级作用域内，并且其中不能使用表达式和变量。其常见的错误用法示例如下：

```
// 用法1：不能使用表达式
import { 'm' + '1' } from 'my_module';

// 用法2：不能使用变量
let module = 'my_module';
import { m } from module;

// 用法3：不能用于条件表达式
if (x === 1) {
  import { m } from 'module1';
} else {
  import { m } from 'module2';
}
```

## 三、常见的使用问题

### 3.1 如何在浏览器中下快速使用import?

各大浏览器已经开始逐步支持ES模块了，如果我们想在浏览器中使用模块，可以在script标签上添加一个`type="module"`的属性来表示这个文件是以module的方式来运行的。如下：

```
// myModule.js
export default {
  name: 'my-module'
}

// script脚本引入
<script type="module">
  import myModule from './myModule.js'

  console.log(myModule.name) // my-module
</script>
```

不过，由于ES的模块功能还没有完全支持，在不支持的浏览器下，我们需要一些回退方案，可以通过`nomodule`属性来指定某脚本为回退方案。如下，在支持的浏览器中进行提示。

```
<script type="module">
  import myModule from './myModule.js'
</script>

<script nomodule>
  alert('你的浏览器不支持ES模块，请先升级！')
</script>
```

如上，当浏览器支持`type=module`时，会忽略带有`nomodule`的script；如果不支持，则忽略带有`type=module`的脚本，执行带有`nomodule`的脚本。

在使用`type=module`引入模块时还有一点需要注意的，**`module`的文件默认为defer**，也就是说**该文件不会阻塞页面的渲染，会在页面加载完成后按顺序执行**。

### 3.2 如何在Node下快速使用export/import?

相信大家都遇到过如下错误：

![](http://p2.qhimg.com/t01baefa220575f1a41.png)

当我们直接在node下执行包含ES模块的的代码时，就会看到如上报错，这是因为Node还没有原生支持ES模块。但有的时候我们又想在Node下使用，那么该如何做呢？

下面介绍两种快捷的方法，一种是Node原生支持的，一种需要借助Babel进行编译。

#### 3.2.1 Node原生支持 

Node从9.0版本开始支持ES模块，可以在flag模式下使用ES模块，不过这还处于试验阶段（Stability: 1 - Experimental）。其用法也比较简单，执行脚本或者启动时加上`--experimental-modules`即可。不过这一用法要求import/export的文件后缀名必须为*.mjs。

```
node --experimental-modules test-my-module.mjs

// test-my-module.mjs
import myModule from './myModule.mjs'

console.log(myModule.name) // my-module
```

这是Node原生支持的方法，但是对文件的后缀名有限制，但是现阶段，我们在项目中的代码应该还是以`.js`为后缀居多，所以大多数情况下我们还是会通过编译使用ES模块。

下面我们就介绍下如何快速编译并使用ES模块。

#### 3.2.2 借助babel-node执行包含ES模块代码的文件

平时我们可能会借助构建工具对ES模块，可能是借助Webpack/Rollup等构建工具进行编译，这些工具配置起来都相对繁琐。

有时，我们只想简单的执行某些代码，而其中又包含ES模块代码，就会发生问题，因为node默认不支持。这时候如果进行一堆配置来使其支持的话，又太过麻烦。

下面我给大家介绍一种看起来更加快捷的方法。

1. 安装`babel-cli`和`babel-preset-env`，并将其保存为开发依赖。
2. 在根目录创建`.babelrc`文件，在其中添加如下配置。
    ```
    {
        "presets": ["env"]
    }
    ```
3. 通过`./node_modules/.bin/babel-node index.js`或`npx babel-node index.js`执行脚本。其中`babel-node`为`babel-cli`自带。

怎么样，是不是相当快捷了，而且近乎于0配置。

### 3.3 当心，不要修改export输出的对象，尽管你能改

前面有提到如果`export`输出的接口是一个对象，那么是可以修改这个对象的属性的。

而我的建议是，尽管你能改，也不要修改。

大家可能都会有这样一个常规的用法，即在编写某个组件时，可能会存在包含基础配置的代码，我们姑且称其为`options.js`，其输出一堆配置文件。

```
// options.js
export default {
  // 默认样式
  style: {
    color: 'green',
    fontSize: 14,
  }
}
```

> 如果你没有类似需求，你可以想象下，你现在要把EChart的某个图表抽象成自己代码库里的组件，那么这时候应该就有一大堆基础配置文件了。

既然称其为基础配置，那么言外之意就是，根据组件的用法不同，会一定程度上对配置进行修改。比如我们会在引入后将颜色改为红色。

```
// use-options.js
import options from "./options.js";

console.log(options); // { style: { color: 'green', fontSize: 14 } }

options.style.color = "red";
```

这时候就需要格外注意了，如果我们直接对输入的默认配置对象进行修改，就可能会导致一些bug。

因为**export输出的值是动态绑定的**，如果我们修改了其中的值，就会导致其他地方再次引入该值时会发生变化，此时的默认配置就不是我们所设想的默认配置了。如上例，我们再次引入基础配置后，就会发现颜色的默认值已经变成红色了。

```
// use-options-again.js
import useOptions from "./use-options.js
import options from "./options.js";

console.log(options); // { style: { color: 'red', fontSize: 14 } }
```

所以，笔者建议，当我们有需求对输入的对象接口进行改变时，可以先对其进行**深度复制**，然后在进行修改，这样就不会导致上述所说的问题了。如下所示：

```
// use-options.js
import _ from "./lodash.js";
import options from "./options.js";

const myOptions = _.cloneDeep(options);
console.log(myOptions); // { style: { color: 'green', fontSize: 14 } }
myOptions.style.color = "red";
```

## 四、总结

本文只是简单点的介绍了下ES模块的基本用法，还有一些用法，如`import`和`export`的结合使用等，这些大家可以结合MDN或者其他网站进行了解。本文主要是介绍了以下笔者及身边的同事在使用ES模块时会存在的一些疑问，希望对大家有一点帮助。

## 参考内容

1. [Export | MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/export)
1. [Import | MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/import)
1. [7 Different Ways to Use ES Modules Today!
](https://hackernoon.com/7-different-ways-to-use-es-modules-today-fc552254ebf4)
1. [Import, Export, Babel, and Node](https://medium.com/@JedaiSaboteur/import-export-babel-and-node-a2e332d15673)