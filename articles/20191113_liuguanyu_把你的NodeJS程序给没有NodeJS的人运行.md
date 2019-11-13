标题很绕口，不过确实是一个很常见的需求。

众所周知，NodeJS程序开发简便且容易实现跨平台。但是，当你开发了一个NodeJS程序，想要分发给其他人运行的时候，你会发现，你往往需要对方也来安装一个NodeJS环境。理想的方式是，我们可以把我们的程序打包成一个可执行文件，这样，就可以直接在对方的电脑上运行你的程序了；同时，我们将代码打成二进制形式，可以在一定程度上保护源代码以及API等处理的逻辑。

那么，能不能解决这样的需求呢？可以的。有很多程序包可以做到这件事情：pkg、nexe、node-packer、enclose、ncc，当然，对于使用web开发的程序，你还可以使用electron来开发，除了打包本身，还提供了GUI能力。

如果只是命令行的跨平台，不妨试试pkg，它可以在某一个平台下将你的NodeJS程序打包进一个可执行程序，并且可以在单一平台，打出主流的Windows、Mac、Linux下的运行程序。

我们来简单尝试一下pkg。你可以按如下方法安装pkg：`npm install pkg -g`。这样，你就在全局的命令行中安装了这个工具。

为了测试，我们需要一个实例的NodeJS库。我们就来做一个简单NodeJS库：prettyJson。你可以输入如下代码：

```JavaScript
function pretty(filePath){
    return JSON.stringify(JSON.parse(require('fs').readFileSync(filePath).toString()), false, 3)
} 

console.log(pretty(process.argv[2]))
```

上面这个代码做的是格式化JSON代码。我们把上述代码存储为index.js，之后，我们就可以按照一般NodeJS包那样，使用npm初始化包：`npm init -y`。

下面，我们要祭出pkg了。在使用之前，请安装好所有相关依赖。我们指定好入口文件就可以进行编译了：`pkg index.js`。默认地，pkg会选择下载最新的NodeJS源码，并编译三个主流的平台，以笔者这里的情况是：node12-linux-x64, node12-macos-x64, node12-win-x64。

![](https://p3.ssl.qhimg.com/t0165d32c4ab4840ba3.png)

每一次打包，pkg会尝试从本地缓存优先寻找NodeJS的缓存包，如果本地没有找到，就会去远程获取。

实际上，在pkg的底层依赖了同样是zeit撰写的pkg-fetch库。这个库包含主要的平台、架构NodeJS的二进制包。当需要远程获取时，pkg-fetch会首先从自身版本中取得前两位作为Tag。同时，根据平台、架构以及所需NodeJS版本号，从[https://github.com/zeit/pkg-fetch/releases]获取对应的包，以下载。当下载完成后，会在本地缓存这个二进制包，下一次依赖同样包的时候，可以不再重新下载。

这些二进制包与原有的NodeJS包有所不同，劫持了一些原有的函数，使之能够读取到可执行文件中的代码和资源文件。同时，通过特定的方法，将JavaScript文件和资源文件，按照一定的方式打包到目标可执行文件中，从而达到打包的目的。

我们在上述步骤完成之后，会得到3个文件：

![](https://p0.ssl.qhimg.com/t012bf0447a31c985bd.png)

一般地，pkg的命令格式如下:

```bash
pkg [options] <input>
```

我们可以指定发布通过-t参数指定目标平台，如果目标平台与你当前的系统一致，你可以使用`-t host`简化输入。你还可以通过-o参数来指定输出文件。

指定-c文件，可以将配置一起写到统一的配置文件里，或者你可以从package.json中指定。
配置里面的bin字段，你可以放入你的入口文件。

一个典型的配置文件如下：

```JavaScript
{
  ...
  "bin": "./bin/www",
  "scripts": {
    "pkg": "pkg . --out-path=dist/"
  },
  "pkg": {
    "scripts": [...]
    "assets": [...],
    "targets": [...]
  },
  ...
}
```

原则上，动态require的代码不会被自动打包，因此需要将动态引入的代码指定给pkg。`scripts`和`assets`用来配置未打包进可执行文件的脚本和资源文件，文件路径可以使用glob通配符。

打包的过程，可以添加--debug进行调试，用以发现过程中的问题。

完成了上述步骤，你就可以在没有NodeJS的环境下运行你的程序了。如上例，我们使用`pkg -t node12-win-x64 -o prettyJson index.js`则会看到prettyJson.exe文件，这就是我们的可执行文件。由于此文件是一个命令行程序，我们可以放到喜欢的命令行终端下运行。此时，我们给出一个混乱的JSON文件package.json：

```JavaScript
{"name":"prettyJson","version":"1.0.0","description":"","main":"index.js","scripts":{"test":"echo \"Error: no test specified\" && exit 1"},"keywords":[],"author":"","license":"ISC"}
``` 

就能获取很好的转换效果了：

![](https://p1.ssl.qhimg.com/t010b42e9abc17868cf.png)