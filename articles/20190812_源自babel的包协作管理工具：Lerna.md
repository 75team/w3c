## 多包合作的烦恼

在开发需要多个密切协作的软件包时候，我们往往将独立的功能块进行划分，使得各个功能独立的模块分别完成，以减少相互影响，完成有效的多人合作。但是，在模块协作时，经常会遇到一些问题：

1. 依赖处理繁琐。
1. 依赖的模块，尚处在开发之中，通行的npm install、yarn等无法从安装源中获得。
1. 被依赖的模块版本升级，模块其他版本需要手动管理相关的版本。
1. 有循环依赖的风险

对于多个模块的大型项目的协作管理，一般地有multirepo、monorepo和submodules等多种方式：multirepo是将多个模块分别分为多个仓库，早期的babel（babel6以前）使用的就是这种方式；submodules是借助git的实现，在.gitmodules中写明引用的仓库，在主仓库中只保留必要的索引；monorepo则是将相关的模块用单一的仓库统一管理。

上述的方式各有优劣。从目前前端主流的大型代码的代码管理来看，monorepo被很多超级repo选中。babel、vue-cli、create-react-app都采用这种模式。

Babel的重要贡献者[jamiebuilds](https://github.com/jamiebuilds)，在为 Babel 6 工作的过程中发现所有东西都拆分成漂亮的小插件包，但同时也就需要管理数十个软件包。因此，多包存储库管理工具 Lerna 应运而生。为让项目更好用，他对项目进行了多次重写，试图让架构更完善。

Lerna也是babel官方现在使用的多包管理工具。

## 什么是Lerna

[Lerna官网](https://lerna.js.org/)对此给出了官方的解释：Lerna是一个管理包含多个软件包的JavaScript项目的工具。它可以：

1. 解决包之间的依赖关系。
1. 通过git仓库检测改动，自动同步。
1. 根据相关的git提交的commit，生成CHANGELOG。

Lerna是一个命令行工具，可以将其安装在系统全局。简单的命令说明，可以使用：`lerna -h`查看命令帮助。

![](https://p0.ssl.qhimg.com/t01c055cac678a945e9.png)

## 两种模式

Lerna分为两种模式：fixed模式和independent模式。两种模式的区别在于：前者强制所有的包都使用在根目录lerna.json中指定的版本号。而后者各个软件包，可以自己指定版本号。

默认的，lerna使用的是fixed模式。笔者认为，这种模式下，所有的相关软件包，最好以几乎一致的发布周期发布，如babel这种，并且对外的软件被使用者更多以“黑盒”方式对待。这是fixed模式最适应的方式。

而需要暴露内部包的细节，或者迭代频率显著不一致的包，建议采用independent模式。

指定为independent模式，可以在`lerna init`时加入--independent，或者将lerna.json的version字段指定为independent。