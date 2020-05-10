# [译]Deno 1.0，来了解一下

> 原文地址：https://blog.logrocket.com/deno-1-0-what-you-need-to-know/
>
> 原文作者：[David Else ](https://blog.logrocket.com/author/davidelse/)

![](https://p0.ssl.qhimg.com/t01cf984756298e92e5.jpg)

经过近两年的等待，官方正式宣布Deno 1.0将于5月13日发布。如今，API已经冻结，倒计时开始。

借助创始人的大名，加之其前瞻性愿景，Deno的发布无疑是近期最激动人心也最具争议性的JavaScript话题。

Deno是通用JavaScript/TypeScript编程环境，集成了很多最好的开源技术，在一个小执行文件中提供了全面的解决方案。

作为Node.js的创始人，Ryan Dahl又打造了Deno。Deno利用了2009年Node.js发布之后JavaScript的新增特性，同时也解决了Ryan在其“Node.js十大遗憾”（演讲）中提到的设计缺陷。有人称其为Node.js的后续者，但作者本人并没有这么说过。

与Node.js使用C++不同，Deno是使用Rust开发的，构建在Tokio（[https://tokio.rs/](https://tokio.rs/)，Rust异步运行时）平台之上。但与Node.js类似，Deno也使用V8引擎运行JavaScript。内置TypeScript是Deno的是一个明显特征。尽管需要先编译成JavaScript再运行，但这个过程在内部完成，因此看起来就像Deno原生支持TypeScript一样。

## 1. 上手

根据官网主页（[https://deno.land/](https://deno.land/)）的指导，可以下载Deno。要升级到新版本，运行`deno upgrade`。

要了解Deno子命令，使用如下任意一命令。

- `deno [subcommand] -h`：显示摘要
- `deno [subcommand] --help`：显示详细信息

本文将介绍Deno 1.0的重点特性，包括使用最新语法应用这些特性的示例。我们会尽可能使用TypeScript，等价的JavaScript当然也没问题。

相信看完这篇文章你一定会喜欢上Deno。本文将正式带领读者进入Deno开发的大门。

## 2. 安全

Deno默认安全。相比之下，Node.js默认拥有访问文件系统和网络的权限。

要在没有授权的情况下运行一个需要启动子进程的程序，比如：

```ts
deno run file-needing-to-run-a-subprocess.ts
```

如果需要相关权限，你会看到一条警示消息：

```ts
error: Uncaught PermissionDenied: access to run a subprocess, run again with the --allow-run flag
```

Deno使用命令行选项显式授权对系统不同部分的访问。最常用的包括：

- 环境
- 网络
- 文件系统读/写
- 运行子进程

要了解包含示例的全部权限，运行`deno run -h`。

最佳实践是对`read`、`write`和`net`使用权限白名单。这样可以更具体地指定允许Deno访问什么。例如，要授予Deno对`/etc`目录的只读权限，可以这样：

```ts
deno --allow-read=/etc
```

### 2.1 使用权限的快捷方式

每次运行应用都要授权很快就觉得麻烦。为此，可以使用如下方法。

#### 1. 允许所有权限

可以使用`--allow-all`或快捷方式`-A`。不推荐这么做，因为这么做就无法控制特定的权限。

#### 2. 写个bash脚本

写一个bash脚本来运行应用，授权该应用所需的最低权限。

```bash
#!/bin/bash

// 允许运行子进程及文件系统写权限
deno run --allow-run --allow-write mod.ts
```

这个方法的缺点是可能要针对运行、测试和打包都分别写一个脚本。

#### 3. 使用任务运行器

可以使用GNU工具`make`创建包含一组Deno命令及相关权限的文件。也可以使用特定于Deno的版本Drake（[https://deno.land/x/drake/](https://deno.land/x/drake/)）。

#### 4. 安全可执行的Deno程序

使用`deno install`安装一个包含其执行所需所有权限的Deno程序（[https://github.com/denoland/deno/tree/master/docs](https://github.com/denoland/deno/tree/master/docs)）。安装之后，可以通过`$PATH`来访问这个程序。

## 3. 标准库

Deno标准库（[https://deno.land/std/](https://deno.land/std/)）包含常用的模块，由Deno项目维护，保证可以在Deno中使用。标准库涵盖最常用的工具，API风格及特性镜像了Go语言的标准库。

JavaScript一直因缺少标准库而饱受诟病。用户不得不为此重复“发明轮子”，而开发者经常要搜索npm仓库来寻找解决常见问题的模块，而这些模块本来就是应该由平台提供的。

像React这样解决复杂问题的第三方包另当别论，但像生成UUID（[https://en.wikipedia.org/wiki/Universally_unique_identifier](https://en.wikipedia.org/wiki/Universally_unique_identifier)）这样简单的任务最好还是使用标准库来完成。这些小库可以作为更大库的组件，让开发更快、惊吓更少。多少次一个流行的库突然宣布废弃，而用户只能自己维护或再去寻找新的替代库？调查显示，常用的开源软件包中有10-20%已经不再积极维护了。

### 3.1 内置模块及对应的npm包

| Deno模块 | 说明                                                      | npm包                |
| -------- | --------------------------------------------------------- | -------------------- |
| colors   | 给终端输出设置颜色                                        | chalk、kleur、colors |
| datetime | 帮助处理JavaScript的`Date`对象                            |                      |
| encoding | 增加对base32、二进制、csv、toml和yaml等外部数据结构的支持 |                      |
| flags    | 帮助处理命令行参数                                        | minimist             |
| fs       | 帮助实现文件系统操作                                      |                      |
| http     | 支持通过HTTP访问本地文件                                  | http-server          |
| log      | 用于创建日志                                              | winston              |
| testing  | 用于单元测试和基准测试                                    | chai                 |
| uuid     | 生成UUID                                                  | uuid                 |
| ws       | 帮助创建WebSocket客户端/服务器                            | Ws                   |

## 4. 内置TypeScript

TypeScript是JavaScript的超集，增加了显式类型声明。任何有效的JavaScript也是有效的TypeScript，因此把你的代码转换为TypeScript不需要什么代价。只要把扩展名改为.ts，然后再加上类型就可以了。

在Deno中使用TypeScript，你什么也不用做。如果没有Deno，那你必须先把TypeScript编译为JavaScript，然后才能运行。Deno内部帮你进行编译，因此让你使用TypeScript更容易。

### 4.1 使用你自己的tsconfig.json

熟悉TypeScript人可能知道要使用tsconfig.json文件指定编译选项。但在使用Deno时这个文件不是必需的。因为Deno有自己默认的配置。如果你要使用自己的tsconfig.json，而其中的选项与Deno有冲突，你会看到警示消息。

这个特性要求使用`-c`选项并指定你自己的tsconfig.json。

```ts
deno run -c tsconfig.json [file-to-run.ts]
```

关于默认tsconfig.json的细节，可以参考Deno手册（[https://github.com/denoland/deno/tree/master/docs](https://github.com/denoland/deno/tree/master/docs)）。

如果你跟多数开发者一样，那听说Deno默认使用`strict`模式一定会高兴。除非有人故意重写这个设置，否则Deno会尽其所能将代码中的草率之处报告给用户。

## 5. Deno尽可能使用Web标准

Web标准的制定时间很长，一旦发布，谁也不能视而不见。虽然各种框架你方唱罢我登场，但Web标准则始终如一。在学习Web标准上花费的时间永远不会浪费，因为没有人胆敢推翻Web。在可以预见的未来几十年，甚至到你职业生涯的终点，Web仍将继续存在和发展。

`fetch`是用于获取资源的Web API。浏览器中有一个JavaScript方法叫`fetch()`。如果你想在Node.js中使用这个标准API，需要依赖第三方的Node Fetch（[https://github.com/node-fetch/node-fetch](https://github.com/node-fetch/node-fetch)）。而在Deno中，这个API是内置的，就像浏览器中的版本一样，开箱即用。

Deno 1.0提供以下兼容Web的API。

- addEventListener
- atob
- btoa
- clearInterval
- clearTimeout
- dispatchEvent
- fetch
- queueMicrotask
- removeEventListener
- setInterval
- setTimeout
- AbortSignal
- Blob
- File
- FormData
- Headers
- ReadableStream
- Request
- Response
- URL
- URLSearchParams
- console
- isConsoleInstance
- location
- onload
- onunload
- self
- window
- AbortController
- CustomEvent
- DOMException
- ErrorEvent
- Event
- EventTarget
- MessageEvent
- TextDecoder
- TextEncoder
- Worker
- ImportMeta
- Location

如上API都在程序的顶级作用域。这意味着如果你不使用`Deno()`命名空间中的任何方法，你的代码应该同时可以在Deno和浏览器中运行。虽然Deno的这些API并不是100%符合Web标准，但这结前端开发者而言依然是一个重大利好。

## 6. ECMAScript模块

Deno相比于Node.js的一个主要变化是Deno使用了正式的ECMAScript模块标准，而不是以往的CommonJS。Node.js直到2019年底才在13.2.0中支持ECMAScript模块，但即便如此支持仍不完善，并且还需要包含有争议的.mjs扩展名。

Deno通过在其模块系统中拥抱现代Web标准与过去挥手作别。模块可以使用URL或者包含强制扩展名的文件路径来引用。例如：

```ts
import * as log from "https://deno.land/std/log/mod.ts";
import { outputToConsole } from "./view.ts";
```

### 6.1 使用扩展名的问题

Deno希望模块包含文件扩展名，但TypeScript不希望如此：

![](https://p4.ssl.qhimg.com/t018909fb8654c4d69a.jpg)

使用扩展名符合逻辑，也是一种显而易见的方式。可惜现实总比理想要复杂。目前为止，可以使用Visual Studio Code Deno扩展（[https://marketplace.visualstudio.com/items?itemName=axetroy.vscode-deno](https://marketplace.visualstudio.com/items?itemName=axetroy.vscode-deno)）在Deno项目中解决这个问题。

TypeScript创始人似乎对这个问题有自己的看法。在最终抛弃CommonJS之前，我认为这个问题不会有简单的解决方案。

对于睿智但上了点年纪的编程大神们，我们还需要多一点耐心。但愿他们早日摒弃这些过气的格式，对那些死抓住它们不放而伤害我们的家伙降下惩罚。

## 7. 包管理

Deno的包管理方式已经发生了天翻地覆的变化。不再依赖中心化的仓库，Deno的包管理以去中心化为特色。任何人可以像在Web上托管任何类型的文件一样托管一个包。

像npm这样的中心化仓库有好处也有不足，这方面也是Deno饱受争议之处。

### 7.1 Deno新的包含管理机制

导入一个包变得如此简单可能会吓到你。

```ts 
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";	
```

下面我们来分析一下变化。

- 不再有中心化的包管理器，而是直接从Web上导入ECMAScript模块。
- 不再有“魔法般”的Node.js模块解析。现在，直观的语法更容易定位问题。
- 不再有node_modules目录。相反，依赖下载后会藏身于你的硬盘，你看不到。如果想刷新缓存再次下载，只要在命令后面加上`--reload`。

如果想把依赖下载到项目代码附近而不是使用全缓存，可以使用`$DENO_DIR`环境变量。

### 7.2 查找兼容的第三方库

目前有一个存放兼容Deno的第三方库的用户区域（[https://deno.land/x/](https://deno.land/x/)），但导航设计很简陋。例如，不能按照流行度或下载量搜索。预计这个用户区域要么会被扩展，要么会出现替代性的网站，用于托管社区贡献的第三方模块。

虽然官方没有支持向后兼容Node.js，但仍然有很多库和应用可以在Deno下使用。有些可以开箱即用，有些则需要一些调整才能用。

| 库类型                                  | 兼容性                                                       |
| --------------------------------------- | ------------------------------------------------------------ |
| 在浏览器中运行<br />使用ESM语法         | 应该可以开箱即用<br />试试Pika CDN（[https://www.pika.dev/cdn](https://www.pika.dev/cdn)） |
| 在浏览器中运行<br />使用CommonJS语法    | 使用jspm.io（[https://jspm.io/](https://jspm.io/)）用ESM语法来封装               |
| 不在浏览器中运行<br />不使用Node.js API | 使用jspm.io用ESM语法来封装                                   |
| 使用Node.js API                         | 可能无法使用，不过可以试试这个官方针对Node.sj的兼容层<br />（[https://deno.land/std/node/](https://deno.land/std/node/)） |

### 7.3 安装第三方模块

Deno仍然非常新，周围生态还有待完善。在本文写作时，我推荐在标准库和用户库之后，把Pika（[https://www.pika.dev/cdn](https://www.pika.dev/cdn)）作为搜索兼容模块的首选。

Pika的开发者已经针对Deno通过ECMAScript提供了TypeScript类型，叫X-TypeScript-Types（[https://dev.to/pika/introducing-pika-cdn-deno-p8b](https://dev.to/pika/introducing-pika-cdn-deno-p8b)）。要在Pika中找一个包：

- 先通过[https://www.pika.dev/search](https://www.pika.dev/search)搜索

- 找到兼容模块；在本文写作时，搜索react返回：

  ```html
  Package found! However, no web-optimized "module" entry point was found in its package.json manifest.
  ```

不过，preact是兼容的。点击它，再点`import`，然后把出现的导入语句复制到你的代码中：

```ts
import * as pkg from 'https://cdn.pika.dev/preact@^10.3.0';
```

### 7.4 超越package.json

JavaScript生态的主要依赖关系还是通过package.json来解析。这个文件已经膨胀到身兼数职，比如：

- 保存项目元数据
- 列出项目带版本的依赖
- 将依赖区分为dependencies和devDependencies
- 定义程序的入口
- 存储与项目相关的终端脚本
- 定义type，是最近为改进对ECMAScript模块的支持新增加的

```json
{
  "name": "Project Name", // 元数据
  "version": "1.0.0", //元数据
  "description": "My application", // 元数据
  "type": "module", // 模块功能
  "main": "src/mod.ts", // 模块功能
  "scripts": {
    "build": "npm run _copy-build-files && rollup -c",
    "build-watch": "npm run _copy-build-files && rollup -cw"
  }, // 脚本功能
  "license": "gpl-3.0", // 元数据
  "devDependencies": {
    "@rollup/plugin-typescript": "^3.1.1",
    "rollup": "^1.32.1",
    "typescript": "^3.8.3"
  }, // 版本及分类功能
  "dependencies": {
    "tplant": "^2.3.3"
  } // 版本及分类功能
}
```

所有这些功能都是随时间推移而增加的，现在已经成为JavaScript生态运行的标准方式。很容易忘记这并不是一个正式的标准，而只会在这些功能必要时才会想起来。既然JavaScript这么流行，这件事就该好好从头思考。

Deno还不能取代package.json的全部功能，但眼下也有一些解决方案。

### 7.5 使用deps.ts和URL管理版本

Deno有一个管理包版本的惯例，即使用一个特殊文件deps.ts。在这个文件里，依赖会被再次导出。这样应用中的不同模块可以引用相同的出处。

与告诉npm要下载模块的哪个版本不同，deps.ts将版本放到URL中：

```ts
export { assert } from "https://deno.land/std@v0.39.0/testing/asserts.ts";
export { green, bold } from "https://deno.land/std@v0.39.0/fmt/colors.ts";
```

如果想更新某个模块，可以修改deps.ts中的URL。例如，把@v0.39.0替换成@v0.41.0，这样其他地方就都会使用新版本了。如果你直接在每个模块中导入 `https://deno.land/std@v0.39.0/fmt/colors.ts` ，那么就得搜索整个应用，逐一替换。

假设以前下载的模块不会被以后下载的模影响也存在安全风险。这也是为什么有一个选项用于创建锁文件（[https://github.com/denoland/deno/tree/master/docs](https://github.com/denoland/deno/tree/master/docs)）的原因。这样可以保证新下载的模块与最初下载的模块相同。

### 7.6 `deno doc`与对元数据使用JSDoc

JSDoc发布于1999年，21年前。它是目前使用和支持最多的JavaScript和TypeScript文档方式。虽然不是正式的Web标准，但JSDoc是package.json中所有元数据的完美替代方案。

```ts
/**
 * @file Manages the configuration settings for the widget
 * @author Lucio Fulci
 * @copyright 2020 Intervision
 * @license gpl-3.0
 * @version 1.0
 *
```

Deno内置支持JSDoc并使用它构建文档系统。虽然目前尚未使用类似上面的元数据，但`deno doc`例会读取函数及期参数的描述。

```ts
/**
 * Returns a value of (true?) if the rule is to be included
 *
 * @param key Current key name of rule being checked
 * @param val Current value of rule being checked
 **/
```

可以使用`deno doc <filename>`来查询你的程序文档。

```ts
deno doc mod.ts

function rulesToRemove(key: string, val: any[]): boolean
  Returns a value of if the rule is to be included
```

如果你的程序是在线托管的，可以使用这个在线文档查看器：[https://doc.deno.land/](https://doc.deno.land/)。

## 8. Deno的内置工具

![](https://p2.ssl.qhimg.com/t01d36bd907ee1ad3f9.jpg)

这是对前端开发者影响最大的一个领域。JavaScript工具目前的情形可以说是相当地乱。再加上TypeScript的工具，复杂性会进一步增加。

JavaScript本身是不是需要编译的，因此可以直接在浏览器中运行。这样可以很快知道自己的代码是否存在问题。总之门槛非常低，只需要一个文本编辑器和一个浏览器。

不幸的是，这种简单性和低门槛已经被一种叫做极度工具崇拜的东西在不知不觉间破坏了。结果JavaScript开发变成一个复杂的噩梦。我曾经完整地学习过一个讲解如何配置Webpack的课程。人生苦短，这种没意义的生活该结束了。

工具之乱已经到了让很多人急切想回归真正写代码的状态，而不是摆弄配置文件或者因为要在不同的竞争性标准中做出选择而苦恼。Facebook的Rome（[https://github.com/facebookexperimental/rome](https://github.com/facebookexperimental/rome)）是一个为解决这个问题而出现的项目。在本文写作时，这个项目还处于幼年期。虽然这个项目是有益的，但Deno应该是一个更本质的解决方案。

Deno本身是一个完整的生态，包含运行时及自己的模块/包管理系统。这就决定了它自己内置的工具会有更广泛的应用范围。下面我们就来介绍Deno 1.0中内置的工具，以及如何利用它们减少对第三方库的依赖和简化开发。

当然，目前Deno还不可能取代整个前端构建工具链，但我们离这一天应该不会太远了。

### 8.1 测试

测试运行器以`Deno.test()`函数的形式内置于Deno的核心，而断言库（[https://deno.land/std/testing/](https://deno.land/std/testing/)）也包含在标准库中。你喜欢的`assertEquals()`、`assertStrictEq()`一个也不少，此外还包含一些不太常见的断言，如`assertThrowsAsync()`。

在本文写作时，没有测试覆盖功能。另外，监控模式也需要使用Denon（[https://deno.land/x/denon/](https://deno.land/x/denon/)）等第三方工具来设置。

要了测试运行器的全部选项，使用`deno test --help`。虽然还很有限，但或许包含很多某些你熟悉的程序如Mocha中的特性。例如，`--failfast`会在遇到第一个错误时停止，而`--filter`可用于过滤要运行的测试。

#### 1. 使用测试运行器

最基本的语法是`deno test`。这个命令会运行工作目录中所有以 `_test`或`.test`结尾且扩展名为.js、.ts、.jsx或.tsx文件（如example_test.ts）。

```ts
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test({
  name: "testing example",
  fn(): void {
    assertEquals("world", "world");
    assertEquals({ hello: "world" }, { hello: "world" });
  },
});
```

如果你的代码使用了DOM，那么需要提供自己的tsconfig.json文件，包含`lib: ["dom", "esnext"]`。下面会介绍细节。

#### 2. 格式化

格式化基于dprint（[https://github.com/dprint/dprint](https://github.com/dprint/dprint)），是一个Prettier替代库，照搬了Prettier 2.0所有得到认可的规则。

要格式化文件，可以使用`deno fmt <files>`或者Visual Studio Code扩展（[https://marketplace.visualstudio.com/items?itemName=axetroy.vscode-deno](https://marketplace.visualstudio.com/items?itemName=axetroy.vscode-deno)），后面会介绍。

#### 3. 编译与打包

Deno可以通过命令行`deno bundle`创建简单的包，但它也暴露了内部编译器API（[https://deno.land/std/manual.md#compiler-api](https://deno.land/std/manual.md#compiler-api)），因此用户可以控制自己的输出，有时候可以为在前端使用而自定义。这个API当前被标记为不稳定，所以需要使用`--unstable`标签。

Deno虽然有一些兼容Web的API，但并不完整。如果想将编译引用DOM的前端TypeScript，需要在编译或打包时告诉Deno相关的类型。可以使用编译器API选项`lib`。

index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <h1 id="greeter">Replace me</h1>
  </body>
</html>
```

test-dom.ts

```ts
let greeter: HTMLElement | null = document.getElementById("greeter")!; // Please forgive the Non-Null Assertion Operator

greeter.innerText = "Hello world!";
```

compile.ts

```ts
const [errors, emitted] = await Deno.compile("test-dom.ts", undefined, {
  lib: ["dom", "esnext"], // include "deno.ns" for deno namespace
  outDir: "dist",
});

if (errors) {
  console.log("There was an error:");
  console.error(errors);
} else {
  console.log(emitted); // normally we would write the file
}
```

下面是终端中打印出来的结果。

```json
{
 dist/test-dom.js.map: "{\"version\":3,\"file\":\"test-dom.js\",\"sourceRoot\":\"\",\"sources\":[\"file:///home/david/Downloads/deno-arti...",
 dist/test-dom.js: "\"use strict\";\nlet greeter = document.getElementById(\"greeter\");\ngreeter.innerText = \"Hello world!\";\n..."
}
```

在上面的例子中，我们编译了引用DOM的test-dom.ts文件。在`Deno.compile()`的`lib`选项中覆盖了Deno默认的`lib`值，因此需要也加上`esnext`。此外要使用Deno命名空间，也可以选择加上`deno.ns`。

这还是有点实验性的，但我希望`bundle`命令能够发展到可以实现类似摇树清冗（tree shaking）的功能，类似Rollup.js那样。

### 8.2 调试

Dene内置了调试功能，但在本文写作时，Visual Studio Code扩展还不支持它。要调试，需要手工执行如下操作。

- `deno run -A --inspect-brk fileToDebug.ts`（注意：使用对模块的最低权限）

- 在Chrome或Chromium中打开`chrome://inspect`，之后会看到类似下面的屏幕

  ![](https://p2.ssl.qhimg.com/t01eb8641668aa33bc7.jpg)

- 单击”inspect“连接并开始调试代码。

### 8.3 文件监控

Deno内置了基于Rust notify（[https://github.com/notify-rs/notify](https://github.com/notify-rs/notify)）的文件监控功能，通过`Deno.watchFs()`来使用。Deno喜欢在后台暴露强大的API，让用户自己按喜好实现自己的代码。因此没有`--watch`标记，而是需要创建自己的实现或使用一个第三方模块。

编写自己的文件监控器，唯一有点难度的是消除抖动。这个API可能连续触发很多事件，而我们并却希望多次执行某个操作。Github用户Caesar2011使用`Date.now()`用23行TypeScript代码就解决了这个问题（[https://github.com/Caesar2011/rhinoder/blob/master/mod.ts](https://github.com/Caesar2011/rhinoder/blob/master/mod.ts)）。

还有一个更高级的Deno文件监控工具叫Denon（[https://deno.land/x/denon/](https://deno.land/x/denon/)），相当于nodemon。如果你想监控工作空间的变化并重新运行测试，只要执行下面的命令：

```shell
denon test
```

## 9. Visual Studio Code插件

axetroy在Visual Studio Market Place发布的插件（[https://marketplace.visualstudio.com/items?itemName=axetroy.vscode-deno](https://marketplace.visualstudio.com/items?itemName=axetroy.vscode-deno)）是目前最好的扩展。安装以后，在项目目录下创建一个.vscode/settings.json文件，然后就可以在每个项目中独立启动这个扩展。

```json
// .vscode/settings.json
{
  "deno.enable": true,
}
```

之后就可以使用包括智能感知在内的所有编码辅助功能了。

## 10. 小结

JavaScript生态的快速发展本身有好有坏。从积极的方面看，从来没有出现过那么多高质量的工具。从消极的方面说，各种框架和库无休止地密集出现很容易让开发者怨声载道，甚至怀疑人生。

Deno成功避免了很多JavaScript开发的缺点，下面只列举几点。

- 通过使用Web标准，Deno让自己的API更加面向未来。同时，这也让开发者信心大增，不必再浪费时间去学习那些很快过时的东西。
- 以TypeScript加强JavaScript同时去掉编译负担，实现了更紧密的集成。
- 内置工具意味常见功能开箱即用，用着不再浪费时间去搜索。
- 去中心化的包管理将用户从npm解放出来，而ECMAScript模块系统相对于老旧的CommonJS也给人带来了新鲜感。

虽然眼下还不能完全取代Node.sj，但Deno已经成为可以日常使用的一个出色的编程环境。

## 11. 相关文章

- [Rome：Facebook最新JS工具上手](https://mp.weixin.qq.com/s/CzKO1I_pr6gKjGb2uAOTmA)






























