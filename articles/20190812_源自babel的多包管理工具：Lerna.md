## 多包合作的烦恼

在开发需要多个密切协作的软件包时候，我们往往将独立的功能块进行划分，使得各个功能独立的模块分别完成，以减少相互影响，完成有效的多人合作。但是，在模块协作时，经常会遇到一些问题：

1. 依赖处理繁琐。
1. 依赖的模块，尚处在开发之中，通行的npm install、yarn等无法从安装源中获得。
1. 被依赖的模块版本升级，模块其他版本需要手动管理相关的版本。
1. 有循环依赖的风险

对于多个模块的大型项目的协作管理，一般地有multirepo、monorepo和submodules等多种方式：multirepo是将多个模块分别分为多个仓库，早期的babel（babel6以前）使用的就是这种方式；submodules是借助git的实现，在.gitmodules中写明引用的仓库，在主仓库中只保留必要的索引；monorepo则是将相关的模块用单一的仓库统一管理。

上述的方式各有优劣。从目前前端工程的代码管理来看，monorepo被很多超级repo选中。babel、vue-cli、create-react-app都采用这种模式。

Babel的重要贡献者[Jamie Kyle](https://github.com/jamiebuilds)，在为 Babel 6 工作的过程中发现所有东西都拆分成漂亮的小插件包，但同时也就需要管理数十个软件包。因此，多包存储库管理工具 Lerna 应运而生。为让项目更好用，他对项目进行了多次重写，试图让架构更完善。下图是Jamie Kyle的靓照@_@

![](https://p2.ssl.qhimg.com/t01a8274f322191222c.jpg)

Lerna也是babel官方现在使用的多包管理工具。

## 什么是Lerna

[Lerna官网](https://lerna.js.org/)对此给出了官方的解释：Lerna是一个管理包含多个软件包的JavaScript项目的工具。它可以：

1. 解决包之间的依赖关系。
2. 通过git仓库检测改动，自动同步。
3. 根据相关的git提交的commit，生成CHANGELOG。

Lerna是一个命令行工具，可以将其安装在系统全局。简单的命令说明，可以使用：`lerna -h`查看命令帮助。

![](https://p0.ssl.qhimg.com/t01c055cac678a945e9.png)

## 两种模式

Lerna分为两种模式：fixed模式和independent模式。两种模式的区别在于：前者强制所有的包都使用在根目录lerna.json中指定的版本号。而后者各个软件包，可以自己指定版本号。

默认的，lerna使用的是fixed模式。笔者认为，这种模式下，所有的相关软件包，最好以几乎一致的发布周期发布，如babel这种，并且对外的软件被使用者更多以“黑盒”方式对待。这是fixed模式最适应的方式。

而需要暴露内部包的细节，或者迭代频率显著不一致的包，建议采用independent模式。

指定为independent模式，可以在`lerna init`时加入--independent，或者将lerna.json的version字段指定为independent。

## Lerna配置

lerna.json通常位于项目的根目录下，定义了lerna运行的主要行为。当在根目录下运行`lerna init`或`lerna init --independent`时，会自动生成。以下是一个典型的配置：

```Javascript
{
  "version": "1.1.3",
  "npmClient": "npm",
  "command": {
    "publish": {
      "ignoreChanges": ["ignored-file", "*.md"],
      "message": "chore(release): publish"
    },
    "bootstrap": {
      "ignore": "component-*",
      "npmClientArgs": ["--no-package-lock"]
    }
  },
  "packages": ["packages/*"]
}
```

上面的配置文件中：

1. version指定的是所有包的统一版本号；对于independent模式，这个字段请指定为independent；
1. npmClient指定的是npm的客户端。默认的，lerna将使用npm。读者也可依所需将程序设置为yarn，甚至cnpm等等。
1. command字段，可以对publish和bootstrap命令进行参数传递和命令定制。如：`command.publish.ignoreChanges`，用来设置一些忽略的文件，以避免无关文件的提交对于版本号的变更，如README.md等等。`command.bootstrap.npmClientArgs`指定在bootstrap命令时，传递的默认参数。
1. packages字段指定包所在的目录。

## Lerna命令

### 初始一个多包的工程

```lerna init```
 
上述命令会初始化一个多包工程。初始化之后会在根目录生成packages目录、lerna.json。

### 创建子包

```lerna create <package> [-y]```

创建package包。

### 添加包

```lerna add <package>[@version] [--dev] [--exact] [--scope=module名]```

上述命令会添加一个包package指明的软件包。指定--dev是添加在devDependencies中。指定--exact，则将用精确匹配的模式添加包。指定--scope将只在此指明的模块中安装这个软件包，否则将在所有packages目录中的包中安装。对于npm镜像中存在的包，将安装镜像中的包，对于

### 运行命令

运行命令分为两种：任意命令和npm scripts定义的命令。

对于任意命令使用，`lerna exec`；对于npm scripts定义的命令使用`lerna run`

以`lerna exec`为例：

```lerna exec [--concurrency number] [--stream] [--parallel] -- <command> [..args]```此命令，在所有包中运行 <command>所指定的命令。

特别地，`lerna exec -- rm -rf ./node_modules`将删除所有包中的依赖。`lerna exec -- npm uninstall <package>`将移除所有的package依赖。

`lerna exec` 和 `lerna run` 如需要每个子模块相继的执行并按顺序输出，可以指定--concurrency 1。

对于指定了--stream的命令，将把所有子进程的输出立即回显此举可能造成子进程显示顺序交叉，为了分辨输出来源，每个输出，会带上包名；指定了--parallel的命令，则会在scope指定的范围内，并行地执行相关地命令。

`lerna run`与上述命令不一样的情况在于，`lerna run build`将在每一个包中scripts字段中执行定义的`build`命令。

### 安装所有依赖

`lerna bootstrap`

上述命令安装所有的依赖、将所有的相关链接做好，同时在所有的包中运行`npm run prepublish`。随后，在所有包中运行`npm run prepare`。此时，所有的依赖均已完备。

### 发布

`lerna publish` 发布所有的包。

### 清理

`lerna clean` 删除所有的node_modules

## 一些优化

### 合并公共依赖

我们在开发过程中，经常发现包依赖类似。这样，我们发现运行lerna bootstrap之后，会重复安装依赖包。为此，我们可以把同样的依赖包在根目录安装一次即可。此时，可以使用`lerna bootstrap --hoist`命令，则公用的依赖，只会在顶层目录安装一次。

### 发布带有scope公有包

带有scope的包，需要发布时候，如果是公有的包，需要在npm publish时候使用`npm publish --access public`。为了能够成功publish，并使用lerna流程，请在每个子包的package.json中加入：

```
 "publishConfig": {
    "access": "public"
  }
```

### 检测循环依赖

lerna本身内置了检测循环依赖的功能，如果出现循环依赖。会在bootstrap时候给出提示：

![](https://p1.ssl.qhimg.com/t012758899df6770754.png)

此时，请依照提示去掉循环依赖，以保证软件包的正常运行。