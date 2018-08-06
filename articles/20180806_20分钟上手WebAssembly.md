### 背景
Web应用的蓬勃发展，使得JavaScript、Web前端，乃至整个互联网都发生了深刻的变化。前端开始承担起了更多的职责，于是对于执行效率的诉求也就更为急迫。除了在语言本身的进化，Web从业者以及各大浏览器厂商，也在不停地进行探索。2012年Mozillia的工程师提出了Asm.js和Emscripten，使得C/C++以及多种编程语言编写的高效程序转译为JavaScript并在浏览器运行成为可能。

更进一步地，WebAssembly(简称wasm)技术被提出，并迅速成立了各种研发组织，各种周边工具链的不断完善，相关实验数据也有力地佐证了这条优化和加速路线的可行性。

特别是2018年，W3C的WebAssembly工作组发布了第一个工作草案，包含了[核心标准](https://www.w3.org/TR/2018/WD-wasm-core-1-20180215/)、[JavaScript API](https://www.w3.org/TR/2018/WD-wasm-js-api-1-20180215/)以及[Web API](https://www.w3.org/TR/2018/WD-wasm-web-api-1-20180215/)。另外，除了C/C++和Rust之外，Golang语言也正式支持了wasm的编译。我们罕见的看到，各大主流浏览器一致表示支持这一新的技术，也许一个崭新的Web时代即将到来。

### 简单介绍wasm

打开wasm的[官网](https://webassembly.org/)，我们可以看到其宏伟的技术目标。除了定义一个可移植、精悍、载入迅捷的二进制格式之外，还有对移动设备、非浏览器乃至IoT设备支持的规划，并且还会逐步建立一系列工具链。感兴趣的读者，可以从[这里](https://webassembly.org/docs/high-level-goals/)看到wasm官方的阐述。

简单的说，wasm并不是一种编程语言，而是一种新的字节码格式，目前，主流浏览器都已经支持 wasm。与 JavaScript 需要解释执行不同的是，wasm字节码和底层机器码很相似可快速装载运行，因此性能相对于 JavaScript 解释执行有了很大的提升。

下面这张图，展示了目前（2018年7月）主流浏览器对于wasm的支持情况。

![](//p0.ssl.qhimg.com/t01bb75a86a76a498da.jpg)

除了在浏览器上可以运行外，目前wasm已经可以在包括NodeJS等命令行环境下运行。

### wasm的工具链结构

按照最初的设想，各种高级语言通过自己的前端编译工具，将自己的源代码编译成为底层虚拟机(LLVM)可识别的中间语言表示(LLVM IR)。此时，底层的LLVM可以将LLVM IR根据不同的CPU架构生成不同的机器码，同时可以对这些机器码进行编译时的空间与性能的优化。大多数的高级语言都是按照这样的结构来支持wasm的。上述提到的两个步骤，也依次被成为编译器前端和编译器后端。

编译到wasm的代码，是最终进行实际工作的程序。对此，有一种名为S-表达式的文本格式，扩展名为.wast，以方便程序猿阅读。借助wabt工具链可以实现wasm和wast的互转。一个S-表达式形如：

```perl
(module
 (type $iii (func (param i32 i32) (result i32)))
 (memory $0 0)
 (export "memory" (memory $0))
 (export "add" (func $assembly/module/add))
 (func $assembly/module/add (; 0 ;) (type $iii) (param $0 i32) (param $1 i32) (result i32)
  ;;@ assembly/module.ts:2:13
  (i32.add
   ;;@ assembly/module.ts:2:9
   (get_local $0)
   ;;@ assembly/module.ts:2:13
   (get_local $1)
  )
 )
)
```

目前已经有多种高级语言支持对wasm的编译，特别是[AssemblyScript](https://github.com/AssemblyScript/assemblyscript)，这种以TypeScript为基础语言，通过AssemblyScript的工具链支持，可以完成最终到wasm的转换。

根据上述架构，浏览器以及各种运行环境提供者，各自通过提供不同的运行支持以抹平各个CPU架构不同造成的差异，使得需要支持wasm高级语言，只需要支持编译到中间语言表示层。可以预见的是，随着开发环境的舒适度逐步提高，越来越多的高级语言也会加入支持wasm的阵营。

### 使用AssemblyScript编写wasm

下面的实践，我们需要借助[AssemblyScript](https://github.com/AssemblyScript)来完成，AssemblyScript定义了一个TypeScript的子集，意在帮助TS背景的同学，通过标准的JavaScript API来完成到wasm的编译，从而消除语言的差异，让程序猿可以快乐的编码。

AssemblyScript项目主要分为三个子项目：
- [AssemblyScript](https://github.com/AssemblyScript/assemblyscript)：将TypeScript转化为wasm的主程序
- [binaryen.js](https://github.com/AssemblyScript/binaryen.js)：AssemblyScript主程序转化为wasm的底层实现，依托于[binaryen](http://github.com/WebAssembly/binaryen)库，是对binaryen的TypeScript封装。
- [wast.js](https://github.com/AssemblyScript/wabt.js)：AssemblyScript主程序转化为wasm的底层实现，依托于[wast](https://github.com/WebAssembly/wabt)库，是对wast的TypeScript封装。

这里需要说明的是，目前工具链还在开发过程中，个别步骤可能还不太稳定。我们尽量保证安装配置过程的严谨，如果遇到有变动，请以[官方](https://github.com/AssemblyScript/assemblyscript/wiki/Hello-World)描述为准。

为了支持编译，我们首先需要安装AssemblyScript的支持。为了编译的顺利进行，首先需要保证你的Node版本在8.0以上。同时，你需要安装好TypeScript运行环境。

下面让我们开始吧：

#### 第一步：安装依赖

为了避免后面依赖的问题，我们首先安装AssemblyScript支持
   
```bash
git clone https://github.com/AssemblyScript/assemblyscript.git
cd assemblyscript
npm install
npm link
```

执行上述命令后，你可以使用命令```asc```来判定是否安装正确。如果正常安装，命令行会显示asc命令的使用说明。

![](//p2.ssl.qhimg.com/t01d7c3585f2088ad07.jpg)

#### 第二步：新建项目
接下来，我们新建一个NPM项目，如：wasmExample。如果需要，可以加入ts-node和typescript的devDependencies，并安装好依赖。
然后，在项目根目录下，我们新建一个目录：assembly。
我们进入assembly目录，同时我们在这里加入tsconfig.json，内容如下：

```javascript
{
  "extends": "../node_modules/assemblyscript/std/assembly.json",
  "include": [
    "./**/*.ts"
  ]
}
```

#### 第三步：写代码

下面，我们在这个目录下加入简单的ts代码，如下：

```typescript
export function add(a: i32, b: i32): i32 {
  return a + b;
}
```

我们把上面这段TypeScript代码存储为：module.ts。
那么，现在从项目根目录来看，我们的文件结构如下图：

![](//p1.ssl.qhimg.com/t010528af9951c2e150.jpg)

#### 第四步：配置NPM Scripts
为了后面运行简便，我们把build步骤加入到npm scripts里面，方法是打开项目根目录的package.json，更新scripts字段为：

```javascript
 "scripts": {
    "build": "npm run build:untouched && npm run build:optimized",
    "build:untouched": "asc assembly/module.ts -t dist/module.untouched.wat -b dist/module.untouched.wasm --validate --sourceMap --measure",
    "build:optimized": "asc assembly/module.ts -t dist/module.optimized.wat -b dist/module.optimized.wasm --validate --sourceMap --measure --optimize"
   }
```
为了项目整洁，我们把编译目标放到项目根目录的dist文件夹，此时，我们需要在项目根目录下新建dist目录。

#### 第五步：编译

现在，在项目根目录下，我们来运行：`npm run build` 如果没有报错的话，你会看到，在dist目录下生成了6个文件。

我们先不必深究文件的具体内容。此时，我们的编译工作已经做好。细心的读者可能看到了，在上面的编译命令里面使用了不同的参数。这些参数，我们可以直接在命令行下键入`asc`来查询命令以及参数的使用细节。

#### 第六步：引入编译结果
现在我们有了编译的结果。目前，由于wasm还只能由JavaScript引入，因此我们还需要将编译出的wasm引入到JavaScript程序中。

我们在项目根目录加入一个module引入代码：module.js，如下：

```javascript
const fs = require("fs");
const wasm = new WebAssembly.Module(
    fs.readFileSync(__dirname + "/dist/module.optimized.wasm"), {}
);
module.exports = new WebAssembly.Instance(wasm).exports;
```

同时，我们需要一个使用module的代码。如：index.js，如下：

```javascript
var myModule = require("./module.js");
console.log(myModule.add(1, 2));
```

激动人心的时刻到了，我们在项目根目录下运行`node index.js`，看看结果是否正如我们所期待。读者自行可以修改index.js里面的调用数据，来测试模块的正确性。需要注意的是，因为是wasm是有数据类型概念的，而且数据类型比TypeScript 更为精确。所以，上面的例子中，如果输入的不是整数（上例指wasm定义的i32），会和传统的JavaScript结果不一致，比如你的调用是`myModule.add(2.5, 2)`，结果可能是4。因此，我们需要在调用wasm程序时候，严格关注数据类型。

### 在浏览器使用 

上面的段落，我们展示了如何与NodeJS整合，其实对于效率提升更为显著的，当属在浏览器中。那么如何在浏览器中使用我们编译好的代码呢？

#### JavaScript调用wasm
对于JavaScript调用wasm，一般采用如下步骤：
1. 加载wasm的字节码。
2. 将获取到字节码后转换成 ArrayBuffer，只有这种结构才能被正确编译。编译时会对上述ArrayBuffer进行验证。验证通过方可编译。编译后会通过Promise resolve一个 WebAssembly.Module。
3. 在获取到 module 后需要通过 WebAssembly.Instance API 去同步的实例化 module。
4. 上述第2、3步骤可以用instantiate异步API等价代替。
5. 之后就可以和像使用JavaScript模块一样调用了。

完整的步骤，也可以参见下面的流程图：

![](//p2.ssl.qhimg.com/t01cbe282fc7451c953.jpg) 

这里提供一个异步代码的例子，我们将其命名为async_module.js：

```javascript
// 异步引入例子
const fs = require("fs");
const readFile = require("util").promisify(fs.readFile);

const getInstance = async (wasm, importObject={}) => {
  let buffer = new Uint8Array(wasm)
  return await WebAssembly.instantiate(wasm, importObject)
}

let ins;

const noop = () => {};

const exportFun = (obj, funName) => {
  return (typeof obj[funName] === "function") 
    ? obj[funName] : noop;
}

async function getModuleFun(filePath, funName ,importObject={}) {
  if (ins){
    return exportFun(ins, funName)
  }

  const wasmText = await readFile(filePath);
  const mod = await getInstance(wasmText, importObject);

  return exportFun(mod.instance.exports, funName)
}

module.exports = getModuleFun;
```

调用时候，我们只需如下代码，即可愉快地利用wasm对象进行编码了：
```javascript
var myModule = require("./async_module.js");

// 调用代码
(async () => {
  const fun = await myModule(__dirname + "/dist/module.optimized.wasm", "add")
  console.log(fun(1, 2))
  console.log(fun(4, 10000))
})()
```

[这里](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly)是目前全部的JavaScript中与wasm协作的API说明

#### 使用webpack整合加载工作流

从webpack4开始，官方提供了默认的wasm的加载方案。如果你的webpack是webpack4以前的版本，可能需要安装诸如`assemblyscript-typescript-loader`等开发包。

笔者目前所使用的webpack版本为：4.16.2，对于wasm的原生支持已经比较完善。根据官方的信息，之后的webpack5，会对wasm进行更为稳健的支持。

如下代码即可简单的引入wasm模块，运行`npx webpack`可以将代码自动编译：

```javascript
import("./module.optimized.wasm").then(module => {
    const container = document.createElement("div");
    container.innerText = "Hello, WebAssembly.";
    container.innerText += " add(1, 2) is " + module.add(1, 2);
    document.body.appendChild(container);
});
```

### 在wasm中操作JavaScript

由于wasm目前不能直接操作Dom，如果需要这种操作，可能需要借助JavaScript的能力，这种情况下，我们需要在wasm中调用JavaScript。

WebAssembly.instance 和 WebAssembly.instantiate 函数均支持第二个参数 importObject，这个importObject 参数的作用就是 JavaScript 向 wasm 传入需要调用的JavaScript模块。

作为演示，我们把上面的module.js代码修改一下，把相加的结果，用“*”的个数来表示。这里我们为了演示方便，依然使用同步代码，实际上，异步代码更为常用。

```javascript
const fs = require("fs");
const wasm = new WebAssembly.Module(
    fs.readFileSync(__dirname + "/dist/module.optimized.wasm"), {}
);
module.exports = new WebAssembly.Instance(wasm, {
  window:{
    show: function (num){
        console.log(Array(num).fill("*").join(""))
    }
  }
}).exports;
```

调用方`index.js`修改为：

```javascript
var myModule = require("./module.js");
myModule.add(1, 2);
```

同时，我们需要修改TypeScript源码：
```typescript
// 声明从外部导入的模块类型
declare namespace window {
    export function show(v: number): void;
}

export function add(a: i32, b: i32): void {
  window.show(a + b);
}
```
我们回到项目根目录，重新运行`npm run build`。

之后，运行`node index.js` 我们看到，原来的结果，改为用*的个数来表示了。说明WebAssembly调用JavaScript代码成功。

![](//p2.ssl.qhimg.com/t0114059a98b5e8ce45.jpg)

### 小结
对于wasm技术，我们总结如下：
- 标准尚属工作草案阶段，暂不建议在实际稳定项目中使用。
- 目标远大，各大浏览器厂商、各大主流语言跟进积极性很高，适合作为一种新技术长期跟进。
- 目前主流浏览器的最新版本都已基本支持。如果需要兼容过往浏览器、尤其是IE系列，现在还没有特别好的解决方案，个别接口存在不兼容状况。
- 工具链开发目前活跃度很高，但也带来接口不稳定，使用方式可能有变化的可能。各个工具链还没有特别压倒性的效率及成熟度优势，都处于起步阶段。
- 学习资料、尤其是中文资料偏少。需要一定的精力投入，必要时候需要跟进源码。

尽管如此，笔者仍然非常看好wasm的前景，在性能要求很高的如游戏、影音应用等领域，或许会有不错的发展。

### 参考资料
- https://webassembly.org/
- https://www.npmjs.com/package/assemblyscript 
- https://github.com/AssemblyScript/assemblyscript/wiki
- https://www.w3.org/TR/2018/WD-wasm-js-api-1-20180215/ 
- https://www.ibm.com/developerworks/cn/web/wa-lo-webassembly-status-and-reality/index.html
- https://segmentfault.com/a/1190000004167684
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly
- https://www.npmjs.com/package/assemblyscript-typescript-loader
- https://blog.csdn.net/a986597353/article/details/78167530 
- https://webpack.js.org/


### 致谢

本文选题过程，参考了安佳、李松峰、刘宇晨等同事的建议。成文后，李松峰老师和刘宇晨给出了很多中肯的修订意见，在此一并表示诚挚的谢意。