# 20200302_Rome：Facebook最新JS工具上手

北京时间2020年2月27日，Facebook宣布其实验性JavaScript工具链Rome开源。Rome是Babel和Yarn作者、React Native团队成员Sebastian McKenzie的新作品。开源之前，Rome基本上Sebastian McKenzie的个人项目，只不过Facebook愿意付薪水让他潜心开发。

Rome项目地址：https://github.com/facebookexperimental/rome。



![](https://p3.ssl.qhimg.com/t01b0c5ed5c05e8c59b.jpg)



Rome（罗马）这个名字是这个项目的第三个名字。2016年，Sebastian McKenzie给这个项目起的第一个名字是Sonic（声速/音速），“因为追求速度”，后来又改为Hydra（九头蛇），因为“有多个头”。2019年3月改为Rome，因为“罗马有很多非常恰当的隐喻，如「罗马不是一天建成的」「条条大路通罗马」”（https://twitter.com/sebmck/status/1108408813864906752）。

这是Sebastian McKenzie为Rome选的Logo：

![](https://p2.ssl.qhimg.com/t01f66956e0ed017098.jpg)

有人说：“这不是斯巴达头盔吗？”

Sebastian McKenzie回答说：“没错，就是斯巴达头盔，希腊的。不是罗马的。无所谓，我不在乎。”

## Rome是什么？

根据项目介绍：

- Rome是一个实验性JavaScript工具链，包括编译器、Linter、格式化器、打包器、测试框架等，致力于成为处理JavaScript源代码的一个综合性工具；
- Rome不是已有工具的拼合，其所有组件都是从头写的，没有使用第三方依赖；
- Rome旨在取代很多现有的JavaScript工具。

Rome完全使用TypeScript编写，所有代码在一个仓库中，以内部包形式区分功能组件。Rome也是自托管的（self-hosted），可以自己编译自己。Rome支持JSX，也支持Flow和TypeScript注解代码。当前，Rome的工作重心是Linting：https://github.com/facebookexperimental/rome/issues/20。

关于如何使用Rome，官方提到只支持从源码构建。本文最后介绍如何让Rome跑起来。

## Rome长什么样

正如项目页面所说，Rome现在还在开发中，不能在实际项目中使用。不过，通过其CLI帮助信息可以大致了解目前Rome提供的特性。

### 源代码命令

- `analyzeDependencies`：分析并输出文件的依赖
- `bundle`：把JavaScript打包为一个文件
- `compile`：编译JavaScript文件
- `develop`：启动Web服务器
- `parse`：解析JavaScript文件并输出AST
- `resolve`：计算文件路径

### 代码质量命令

- `ci`：安全依赖，运行Linter和测试
- `lint`：对文件运行Linter
- `test`：运行测试

### 流程管理命令

- `restart`：重启守护程序
- `start`：启动守护程序
- `status`：获取当前守护程序状态
- `stop`：停止运行中的守护程序
- `web`

### 项目管理命令

- `config`
- `publish`：TODO
- `run`：TODO

### 内部命令

- `evict`：从内存缓存中驱逐文件
- `logs`
- `rage`

## 打包

Rome的打包流程比较独特，所有编译都以模块为单位，每个模块都通过一个工作线程池来处理。这个流程用于转译单个模块没问题，但打包时就可能存在问题，比如重复解析已经由其他工作线程解析完成的模块。为此，需要给模块预先添加命名空间，让模块全部共享一个作用域。

Rome会给模块作用域中的每个变量加上前缀，即根据模块名称生成的一个标识符。比如，test.js中的变量`foo`会变成`test_js_foo`。

同样，对每个模块的导入和导出标识符也会如此处理。这样，任何模块的导出都可以通过模块的名字及其导出的名字来确定。

### 1. 输出

比如，moduleA.mjs（Rome打包模块时要求使用.mjs扩展名）中包含以下导出变量：

```js
export const myVar = 'hello'
```

另一个模块文件module.mjs导入这个模块：

```js
import { myVar } from './moduleA.mjs'
```

运行：

```js
rome bundle mudule.mjs dist
```

会在dist目录生成如下index.js文件：

```js
(function(global) {
  'use strict';
  // rome-root/moduleA.mjs
const ___R$rome$root$moduleA_mjs$myVar = 'hello';

  // rome-root/module.mjs
const ___R$rome$root$module_mjs = {};
  console.log(___R$rome$root$moduleA_mjs$myVar);

  return ___R$rome$root$module_mjs;
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this);
```

由此可见，Rome打包后的文件类似Rullup，即所有模块都被打进一个共享的闭包作用域，而不是像Webpack那样每个模块都有一个闭包，然后通过运行时加载器把这些闭包串起来。

### 2. 复杂的例子

下面再尝试一个贴近项目的例子。

#### entry.tsx：

```ts
import React from './react';  
import title from './other';  

async function App(props: any) {  
  return <div id="app">{await title()}</div>
}

App({}).then(console.log);  
```

**other.tsx：**

```ts
import React from './react';  
export default () => <h1>Hello World</h1>;  
```

**react.tsx：**

```ts
type VNode = {  
  type: string;
  props: any;
  children: Array<VNode|string>
};
function createElement(  
  type: string,
  props: any,
  ...children: Array<VNode|string>
): VNode {
  return { type, props, children };
}
export default { createElement };  
```

运行`rome bundle entry.tsx bundle`：

```shell
➜  rome git:(master) ✗ rome bundle entry.tsx bundle
⚠ Disk caching has been disabled due to the ROME_CACHE=0 environment variable ⚠
ℹ Bundling packages/@romejs/cli/bin/rome.ts
✔ Saved the following files to /tmp/rome-dev
  - index.js 2.41MB  entry
  - index.js.map 95B  sourcemap
  - bundlebuddy.json 473kB  stats
⚠ Disk caching has been disabled due to the ROME_CACHE=0 environment variable ⚠
ℹ Bundling entry.tsx
✔ Saved the following files to bundle
  - index.js 907B  entry
  - index.js.map 95B  sourcemap
  - bundlebuddy.json 293B  stats
```

会在bundle目录生成如下index.js文件：

```js
(function(global) {
  'use strict';
  // rome-root/react.tsx
  function ___R$$priv$rome$root$react_tsx$createElement(type, props, ...children) {
    return {type: type, props: props, children: children};
  }
  const ___R$rome$root$react_tsx$default = {
    createElement: ___R$$priv$rome$root$react_tsx$createElement
  };

  // rome-root/other.tsx
		const ___R$rome$root$other_tsx$default = () => 
      ___R$rome$root$react_tsx$default.createElement('h1', null, 'Hello World');

  // rome-root/entry.tsx
  const ___R$rome$root$entry_tsx = {};
  async function ___R$$priv$rome$root$entry_tsx$App(props) {
    return ___R$rome$root$react_tsx$default.createElement('div', {
      id: 'app'}, (await ___R$rome$root$other_tsx$default()));
  }

  ___R$$priv$rome$root$entry_tsx$App({}).then(console.log);

  return ___R$rome$root$entry_tsx;
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this);
```

乍看起来似乎有点乱，但删减掉特定于模块的代码再看，就容易理解了：

```js
(function(global) {
  'use strict';
  // rome-root/react.tsx
  const ___R$rome$root$react_tsx$default = /* 省略 */

  // rome-root/other.tsx
  const ___R$rome$root$other_tsx$default = /* 省略 */

  // rome-root/entry.tsx
  const ___R$rome$root$entry_tsx = {}; /* 省略 */
   ___R$$priv$rome$root$entry_tsx$App({}).then(console.log);

  return ___R$rome$root$entry_tsx;
})(window);
```

实际上，跟前面那个简单的例子一样：三个模块都被打进了一个闭包。

## 帮助信息

运行`rome --help`可以看到Rome目前“完整”的帮助信息：

```shell
➜  ~ rome --help
⚠ Disk caching has been disabled due to the ROME_CACHE=0 environment variable ⚠
ℹ Bundling Projects/_projects/rome/packages/@romejs/cli/bin/rome.ts
✔ Saved the following files to /tmp/rome-dev
  - index.js 2.41MB  entry
  - index.js.map 95B  sourcemap
  - bundlebuddy.json 473kB  stats

  Usage: rome [command] [flags]

  Options

    --benchmark                   no description found
    --benchmark-iterations <num>  no description found
    --collect-markers             no description found
    --cwd <input>                no description found
    --fieri                       no description found
    --focus <input>              no description found
    --grep <input>               no description found
    --help                        show this help screen
    --inverse-grep                no description found
    --log-path <input>           no description found
    --logs                        no description found
    --log-workers                 no description found
    --markers-path <input>       no description found
    --max-diagnostics <num>      no description found
    --no-profile-workers          no description found
    --no-show-all-diagnostics     no description found
    --profile                     no description found
    --profile-path <input>       no description found
    --profile-sampling <num>     no description found
    --profile-timeout <num>      no description found
    --rage                        no description found
    --rage-path <input>          no description found
    --resolver-mocks              no description found
    --resolver-scale <num>       no description found
    --silent                      no description found
    --temporary-daemon            no description found
    --verbose                     no description found
    --verbose-diagnostics         no description found
    --watch                       no description found

  Code Quality Commands

    ci    install dependencies, run lint and tests
    lint  run lint against a set of files
    test  run tests
      --no-coverage        no description found
      --show-all-coverage  no description found
      --update-snapshots   no description found

  Internal Commands

    evict  evict a file from the memory cache
    logs
    rage

  Process Management Commands

    restart  restart daemon
    start    start daemon (if none running)
    status   get the current daemon status
    stop     stop a running daemon if one exists
    web

  Project Management Commands

    config
    publish  TODO
    run      TODO

  Source Code Commands

    analyzeDependencies  analyze and dump the dependencies of a file
      --compact               no description found
      --focus-source <input>  no description found
    bundle               build a standalone js bundle for a package
    compile              compile a single file
      --bundle  no description found
    develop              start a web server
      --port <num>  no description found
    parse                parse a single file and dump its ast
      --no-compact                no description found
      --show-despite-diagnostics  no description found
    resolve              resolve a file
```

## 让Rome跑起来

如前所述，Rome还没有发布npm包，因此只能通过代码来使用。首先，克隆其Github仓库：

```shell
git clone git@github.com:facebookexperimental/rome.git
```

然后：

```shell
cd rome
```

最后运行：

```js
scripts/dev-rome --help
```

## 参考链接

- Rome项目：https://github.com/facebookexperimental/rome
- Rome, a new JavaScript Toolchain：https://jasonformat.com/rome-javascript-toolchain/
- Rome官宣：https://twitter.com/sebmck/status/1232885861135421441
- Rome轨迹：https://twitter.com/sebmck/status/1108407803545214977
- 关于斯巴达头盔：https://twitter.com/sebmck/status/1108412555922268161