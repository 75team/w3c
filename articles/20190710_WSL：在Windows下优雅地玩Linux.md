 ### 引子

一直以来，Windows的命令行的体验都不是特别的友好。由于Windows以图形界面交互为主，同时微软在一段时间内对命令行程序发展并不积极，以及Windows系统底层与*nix系列的不一致。造成Windows下的命令行开发与图形开发体验相去甚远：一方面工具链的不完整，一方面终端字体不甚美观，甚至默认的终端色域相对于Mac都是精简的。

随着Web开发的逐渐流行，很多首发在*nix的编程语言，自然也就受到了Unix开发哲学的影响，提供了非常方便的命令行接口和调用命令，并且极端依赖命令行。在编程语言方面，很多语言的首选实施平台都不是Windows。甚至有Ruby社区[不建议新人在Windows下进行开发](https://ruby-china.org/topics/1020)，以避免陷入解决环境问题的深坑，而抬高使用门槛。

近年来，微软更加真诚地拥抱开源，同时*nix下的优秀开源软件如NodeJS等也被微软所关注，并开始做出自己的贡献，环境问题便越来越深刻的体现出来。同样是基于图形界面的Mac在开发上可以说是领先于Windows的。前端开发者会更加优选Mac作为首要的开发环境。而此时微软拿出了重要的武器WSL，使得Windows下命令行开发环境有了长足的进步，尤其是你已经习惯在命令行下解决依赖关系和开发问题，同时又不得不顾及Windows环境时，WSL可能会成为你一个重要的选择。

### 什么是WSL 

WSL是一个缩写，全称是Windows Subsystem for Linux。意为一个在Windows下的Linux子系统，是一个在Windows 10上能够运行原生的Linux可执行文件。

通过WSL，未经修改的Linux程序文件，可以直接运行在Windows上。在2016年发布的第一代WSL中，WSL提供了Linux程序中所需要的命令行环境、Windows与Linux文件系统的互操作、完整的命令行、以及完整的用户态生命周期和部分的内核系统调用。

2019年刚刚宣布的WSL2中，试图内置一个完整的Linux内核，与兼容层相比，速度得到了较大的提升。

但是，WSL并不能运行所有的Linux程序，诸如图形化的用户界面、尚未找到适配目标的Linux内核功能等等。不过这对于抹平系统差异这种既脏又苦的任务，已经是相当大的成就，少数的不兼容是合理的并且可以理解的。

### 安装WSL

为了安装WSL，你需要将你的Windows升级到Windows10 build 16215版本以后。
如果你还需要使用WSL2，那么需要将版本升级到Windows10 build 18917版本后。不过，目前（2019年7月）仍处在[Insider Fast通道](https://www.zhihu.com/question/47557590)，多数用户还不能获得到这个版本。

在现在的条件下，我们还需要再等待WSL2的完善和放出。这篇文章我们主要了解一下WSL1的操作方法。根据官方的消息，[WSL1暂无弃坑的打算](https://docs.microsoft.com/en-us/windows/wsl/wsl2-faq)。当然，WSL2会比WSL1有更快的速度，更加完善的兼容性方案。

![](https://p2.ssl.qhimg.com/t010083c24ce6e74e9c.jpg)

上面这幅图阐述了WSL2的系统架构。

查询Windows版本可以使用快捷键"win+r"，运行命令：`winver`。会弹出Windows版本信息。

![](https://p0.ssl.qhimg.com/t0106a74ac2e22dae98.png)

这里的红色矩形圈住的就是版本号。我们可以看到，笔者当前的计算机可以安装WSL1，但还不能支持WSL2。

为了安装Linux，我们首先来启用Windows10的一些功能。

这一步有两种操作方式：

1. UI界面操作法：

点击：开始->设置->应用->最大化点击右边的“程序和功能”->点击左侧的“启用或关闭Windows功能”->在弹出的窗体上找到“适用于Linux的Windows子系统”，选中->确定。

![](https://p4.ssl.qhimg.com/t01381db73dccc52323.png)

2. 命令法：

用*管理员身份*打开PowerShell，输入：`Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux`

上述操作完成后你将重启电脑。现在去冲杯咖啡，欣赏几次下图的画面。

![](https://p1.ssl.qhimg.com/t01e21e8361f01be425.png)

当你再次进入系统，这一步就完成了。

### 安装Linux

首先说明，各个Linux的发行版不能直接使用。为此，需要下载适用于的发行版。这里，有两种方式可以安装。

1. 通过Windows Store：打开Windows Store，搜索WSL，得到相关的发行版，安装即可。

![](https://p1.ssl.qhimg.com/t019ae3491d3d284544.png)

2. 手动安装：你可以选择下面的地址下载相应的发行版

- https://aka.ms/wsl-ubuntu-1804 
- https://aka.ms/wsl-ubuntu-1804-arm
- https://aka.ms/wsl-ubuntu-1604
- https://aka.ms/wsl-debian-gnulinux
- https://aka.ms/wsl-kali-linux
- https://aka.ms/wsl-opensuse-42
- https://aka.ms/wsl-sles-12
- https://github.com/WhitewaterFoundry/WSLFedoraRemix/releases/

这里比较推荐第一个ubuntu的安装版。笔者曾经尝试过`wsl-debian-gnulinux`，但由于此版本过于精简，开发包缺失严重，依赖解决麻烦，上手较为复杂，故不推荐。

下载之后，我们可以看到，扩展名为appx的文件。将其修改为.zip扩展名，则可以利用系统的解压缩工具解压到合适的目录。

我们在PowerShell中进入上述解压目录，此时，可以看到对应的exe文件。在命令行下运行，即可进入系统。在此过程中，我们可以根据命令行提示，新建用户。默认地，WSL就会以这个用户进入系统。

![](https://p4.ssl.qhimg.com/t0153dfb8bf9a840c83.png)

### 调整命令行

默认的命令行界面还是不能满足我们的需求：

1. 对命令有基本的自动补全
1. 能支持较完整的unicode字符集
1. 有较为丰富的色彩支持，较为友好的界面

实际上，我们可以分以下几步解决这个问题：

1. 更换为更友好的zsh为默认shell，以ubuntu为例：
   `sudo apt-get install -y zsh`
   `chsh -s /bin/zsh`

1. 安装oh-my-zsh等命令行工具
   `sh -c "$(curl -fsSL https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"`

1. 换用更加友好的命令行render
   
   这里比较推荐几个工具如：[cmder](https://cmder.net/)或者[Hyper](https://hyper.is/)。这两个都是Windows程序，对于命令行程序的显示有着更为优雅的体验。

对于像ubuntu、debian、fedora等需要在线包管理的发行版，读者可以通过更换国内软件源的方法来获取较快的下载速度。

### 命令wsl.exe和wslconfig.exe

对于Linux系统的管理，微软给出了两个Windows下的命令：wsl.exe和wslconfig.exe。这些命令可以对WSL的实例进行管理。自1903版本后，两个命令支持的功能高度一致。因此读者仅需记忆`wsl`命令即可。


读者可以通过`wsl -h`来查看所有支持的命令行参数。
下面是比较重要的命令：

```bash

# 进入默认的WSL系统
wsl

# 进入某个发行版
wsl -d <DistributionName>

# 列出所有发行版
wsl -l 
   
# 列出所有运行中的发行版
wsl -l --running

# 不进入WSL，而在windows下运行Linux命令
wsl ls -la

```

### 系统互操作

#### Linux访问Windows

在安装之后，Windows的所有分区已被挂载在/mnt/下面，同时可读写。不同Linux系统给的权限是不一样的。fedora给的是755，ubuntu给的是777。

![](https://p2.ssl.qhimg.com/t0151e4c6dd0f5da38e.png)

#### Windows访问Linux

以ubuntu18.04为例，你可以在\\wsl$\Ubuntu-18.04中看到LinuxLinux文件。由于Linux和Windows的权限系统逻辑不一致。直接在Windows下修改Linux系统的文件是不安全的，不被提倡的。不过，你可以通过这种方法，把Linux里面的文件拷贝出来。

### 启用WSL2

对于有Insider Fast通道的同学，可以启用WSL2。此时先要在上文所述的“启用或关闭Windows功能”中启用“虚拟机平台”，或者在管理员的PowerShell下输入`Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform`。然后再输入命令`wsl --set-version <Distro> 2`即可。安装之后，可以把之前架构的发行版迁移到新的架构，也可以再恢复成原来的架构。相应地，[wsl.exe也增加了诸多方法](https://devblogs.microsoft.com/commandline/wsl-2-is-now-available-in-windows-insiders/)。

没有Insider Fast通道的同学，还需要再耐心等待。

[这篇文章](https://docs.microsoft.com/en-us/windows/wsl/wsl2-ux-changes)展示了WSL2的用户体验改进的方面，我们也期待早日使用上WSL2