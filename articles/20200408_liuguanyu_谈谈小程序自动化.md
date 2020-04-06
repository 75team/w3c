浏览器领域，我们有如selenium和puppeteer这样的库，可以自动化控制浏览器执行自动化脚本，以完成自动化端对端测试、定时自动化任务等。随着持续集成、持续部署也就是CI/CD的需求日益增长，自动化也成为必不可少的一环。

对于日益增长的小程序开发需求，我们能不能自动化控制小程序呢，进而达成自动测试、自动发布等任务呢？

针对微信小程序，自2019年5月，微信官方也开始提供了一个官方的自动化SDK：`miniprogram-automator`。这是一个通过NodeJS操控开发者工具以及远程真机中微信的SDK。通过这个SDK，可以控制小程序跳转到指定页面、获取小程序页面数据、获取小程序页面元素状态、触发小程序元素绑定事件、往 AppService 注入代码片段、调用 wx 对象上任意接口等等。

这个SDK通过脚本控制本机的微信开发者工具来近似达到自动化测试业务的目的，同时，也可通过远程控制真机，达到真机测试的目的。

### 原理与初步体验

我们首先来体验一下这个SDK。

首先，你需要确保你安装了微信开发者工具，并且版本大于1.02.1907232，并设置你的基础库版本在2.7.3以上，同时请安装NodeJS 8.0以上的版本。

![](https://p5.ssl.qhimg.com/t0120195edb943d0b7a.jpg)

我们知道，微信开发者工具提供了命令行与 HTTP 服务两种接口供外部调用，开发者可以通过命令行或 HTTP 请求指示工具进行登录、预览、上传等操作。

SDK通过命令行方式将微信开发者工具调起，再通过外部方式导入目标项目。微信开发者工具通过读取目标项目的project.config.js，初始化项目。并读取启动命令的`--auto-port`参数，使得SDK可以通过此端口的Websocket服务，实现与对应的目标小程序调试窗口进行交互。

这就是`miniprogram-automator`工作的大致原理。

感兴趣的读者可以尝试使用微信开发者工具的cli方式来尝试运行此命令。

`cli auto --project { 项目路径 } --auto-port { websocket的端口 }`

为了运行上述命令，我们需要找到微信开发者工具的安装目录。不同的操作系统位置不同。Mac位于:<安装路径>/Contents/MacOS/cli，windows位于: <安装路径>/cli.bat。对于经常使用的读者，建议将cli所在的目录放在系统的环境变量中。

你可能遇到IDE服务超时的情况。因此，为了保证开发者工具能够通过命令行打开，需要将开发者工具的HTTP服务调用接口打开。

打开的方式是，进入微信开发者工具，选择：设置 > 安全设置。在服务端口中选择：打开。此时，微信开发者工具会自动指定一个可用的端口号。

![](https://p1.ssl.qhimg.com/t01b653e4aa564bc617.jpg)

细心的读者会发现这里又出现了一个“端口”。不同于上面提到的端口，这个端口是IDE提供对外服务的端口。如上图所示，36146是IDE服务的端口。你在启动IDE之后，可以访问http://127.0.0.1:36146/open

你的IDE就会聚焦到你的面前。http://127.0.0.1:36146/ 是IDE服务的根域名，open是命令，读者可以参考[命令索引](https://developers.weixin.qq.com/miniprogram/dev/devtools/http.html)通过不同的URL发出不同的命令。

好，安装好了SDK，我们来操练一下：

首先，我们init一个npm库如`auto`，通过：`npm i miniprogram-automator --save-dev`或 `yarn add miniprogram-automator --dev` 即可安装`miniprogram-automator`。

接下来，我们下载一个[微信示例程序](https://res.wx.qq.com/wxdoc/dist/assets/media/demo-subpackages.b42a3adb.zip)，并解压在~/demo-miniapp/

下面，我们新建一个文件，如index.js，内容如下：

```JavaScript

const automator = require('miniprogram-automator')

automator.launch({
  projectPath: '~/demo-miniapp/', // 项目文件地址
}).then(async miniProgram => {
  const page = await miniProgram.reLaunch('/page/tabBar/component/index')
  await page.waitFor(500)
  const element = await page.$('.kind-list-text')
  console.log(await element.attribute('class'))
  await element.tap()
  await page.waitFor(500)

  await miniProgram.close()
})

```

现在，让我们运行起来。`node index.js`。我们看到，IDE自动启动，并加载了我们的项目文件，并自动地点开了第一个项目，过一段时间之后，程序自动的退出。

![](https://p5.ssl.qhimg.com/t01f6997d7db63929e3.jpg)

这就是我们对于自动运行的初步体验。

### API组成

截至目前（2020年4月初）最新的SDK的API主要分四个模块：Automater、MiniProgram、Page和Element等。

Automator 模块提供了启动及连接开发者工具的方法。开发者可以对连接地址、端口号、项目路径等作出设置。归根结底是对于cli的包装。详见：[Automator](https://developers.weixin.qq.com/miniprogram/dev/devtools/auto/automator.html)

MiniProgram提供对小程序的控制。提供以下几类支持，详见：[MiniProgram](https://developers.weixin.qq.com/miniprogram/dev/devtools/auto/miniprogram.html)：

- 路由方法。控制小程序的跳转
- 系统信息。与API的wx.getSystemInfo等价
- 转调、mock以及恢复微信API对象wx上的方法
- 在APP对象上注入方法、向小程序暴露方法
- 截图、滚动等方法
- 测试真机、截图、测试账号、关闭等方法
- 打印事件、报错事件

Page 模块提供了控制小程序页面的方法。提供以下几类支持，详见：[Page](https://developers.weixin.qq.com/miniprogram/dev/devtools/auto/page.html)：

- 页面路径方法
- 页面元素选取方法
- 页面元素/逻辑钩子方法
- 页面数组方法
- 页面行为方法
- 页面方法调用代理

Element 模块提供了控制小程序页面元素的方法。提供以下几类支持，详见：[Element](https://developers.weixin.qq.com/miniprogram/dev/devtools/auto/element.html)：

- 元素本身属性获取方法
- 元素子代与后继选择器方法
- 元素事件触发方法
- 元素数据访问方法
- 元素方法访问代理方法

可以看出，除Automator之外，每个API模块都在自己的领域内提供对小程序自身内容的访问特性以及扩充特性。这比较类似于Pupputeer的API设定。

### 与测试框架的整合

`miniprogram-automator`本身不提供测试框架，我们可以选用熟悉的测试框架与之整合。这里我们以jest为例。其他诸如mocha、jasmine、Cucumber都比较类似。

现在，在我们之前的项目`auto`里安装jest。`npm i jest -g`或`yarn global add jest`

简单科普下jest的工作原理。在项目中，jest识别三种测试文件：
- 以.test.js结尾的文件
- 以.spec.js结尾的文件
- 放到__tests__ 文件夹中的文件。
  
Jest 在进行测试的时候，它会在整个项目进行查找，只要碰到这三种文件它都会执行。Jest有以下设定：

- 一个describe块称为一个“测试套件”。
- 一个it/test块，称为“测试用例”。测试用例是测试的最小单位。
- 每个测试文件应至少包含一个describe或一个it/test块。
- 一个describe块应至少包含一个或多个it/test块。
- 每个测试用例，可以组合各种断言来判定是否符合预期。

Jest 测试提供了一些测试的生命周期 API。可以辅助我们在每个 case 的开始和结束做一些处理。 这样，在进行一些和数据相关的测试时，可以在测试前准备一些数据，在测试后，清理测试数据。
4 个主要的生命周期函数：

1. afterAll(fn, timeout): 当前文件中的所有测试执行完成后执行 fn, 如果 fn 是 promise，jest 会等待 timeout 毫秒，默认 5000
1. afterEach(fn, timeout): 每个 test 执行完后执行 fn，timeout 含义同上
1. beforeAll(fn, timeout): 同 afterAll，不同之处在于在所有测试开始前执行
1. beforeEach(fn, timeout): 同 afterEach，不同之处在于在每个测试开始前执行

回到`miniprogram-automator`。我们可以在`auto`项目中加入一个index.spec.js文件。

```javascript

const automator = require('miniprogram-automator')
let miniProgram, page

beforeAll(async () => {
    miniProgram = await automator.launch({
        projectPath: '/Users/liuguanyu/devspace/demo-miniapp/'
    })
    page = await miniProgram.reLaunch('/page/tabBar/component/index')
    await page.waitFor(500)
}, 50000)

afterAll(async () => {
    await miniProgram.close()
})

```

现在，你在`auto`下运行`jest`会报错。

![](https://p1.ssl.qhimg.com/t019897e0ad7fa5d76d.jpg)

意思是需要我们增加至少一个测试套件或测试用例。

为此我们增加一个测试套件，并增加一些测试用例，修改如下：

```javascript

const automator = require('miniprogram-automator')
let miniProgram, page

beforeAll(async () => {
    miniProgram = await automator.launch({
        projectPath: '/Users/liuguanyu/devspace/demo-miniapp/'
    })
    page = await miniProgram.reLaunch('/page/tabBar/component/index')
    await page.waitFor(500)
}, 50000)

describe("测试微信小程序", () => {
    // 1. 测试顶部描述
    it("标题栏", async () => {
        const desc = await page.$('.index-desc')
        // 要求测试标签名必须为view
        expect(desc.tagName).toBe('view')
        // 要求测试内容包含文字以下将展示小程序官方组件能力
        expect(await desc.text()).toContain('以下将展示小程序官方组件能力')
    })

    // 2. 测试列表项
    it('列表项', async () => {
        const lists = await page.$$('.kind-list-item')
        // 测试共有7个列表项
        expect(lists.length).toBe(7)
        const list = await lists[0].$('.kind-list-item-hd')
        //第一个列表元素的标题应该是“视图窗器”
        expect(await list.text()).toBe('视图容器')
    })

    // 3. 测试列表项行为
    it('列表行为', async () => {
        const listHead = await page.$('.kind-list-item-hd')

        // 点击应展开未展开项
        expect(await listHead.attribute('class')).toBe('kind-list-item-hd')
        await listHead.tap()
        await page.waitFor(200)
        expect(await listHead.attribute('class')).toBe(
            'kind-list-item-hd kind-list-item-hd-show',
        )

        // 再次点击应合上
        await listHead.tap()
        await page.waitFor(200)
        expect(await listHead.attribute('class')).toBe('kind-list-item-hd')

        // 点击子列表项应该会跳转到指定页面
        await listHead.tap()
        await page.waitFor(200)
        const item = await page.$('.index-bd navigator')
        await item.tap()
        await page.waitFor(1500)
        expect((await miniProgram.currentPage()).path).toBe('page/component/pages/view/view')
    })

    // 4. 验证wxml方法和setData方法及快照比对
    it('验证WXML', async () => {
        const element = await page.$('page')
        expect(await element.wxml()).toMatchSnapshot()
        await page.setData({
            list: []
        })
        expect(await element.wxml()).toMatchSnapshot()
    })

    // 5. mock方法测试并还原
    it('伪造请求结果', async () => {
        // 伪造请求数据
        const mockData = [{
            rule: 'testRequest',
            result: {
                data: 'test',
                cookies: [],
                header: {},
                statusCode: 200,
            }
        }]

        // mock方法
        await miniProgram.mockWxMethod(
            'request',
            function (obj, data) {
                for (let i = 0, len = data.length; i < len; i++) {
                    const item = data[i]
                    const rule = new RegExp(item.rule)
                    if (rule.test(obj.url)) {
                        return item.result
                    }

                    // 没命中规则的真实访问后台
                    return new Promise(resolve => {
                        obj.success = res => resolve(res)
                        obj.fail = res => resolve(res)
                        this.origin(obj)
                    })
                }
            },
            mockData
        )

        // 请求mock的方法
        const result = await miniProgram.callWxMethod('request', {
            url: 'https://14592619.qcloud.la/testRequest',
        })
        expect(result.data).toBe('test')
        // 还原方法
        await miniProgram.restoreWxMethod('request')
    }, 30000)
})

afterAll(async () => {
    await miniProgram.close()
})

```

此时，我们在`auto`目录下再次运行`jest`，则得到如下结果：

![](https://p1.ssl.qhimg.com/t01a8cd8b0435ac23ae.jpg)

我们看到所有的测试都已通过。

### 真机测试

真机测试可以自动测试以及扫码测试。此时可以在beforeAll里面加入`await miniProgram.remote(true)`。这个true如果不写，就需要用真机扫码测试。当编译好之后，开发者工具会自动将小程序和调试工具发送到真机。并在侧边增加了测试条。

![](https://p3.ssl.qhimg.com/t0192589983674d4f5f.gif)

当不写true时候，运行到remote时，会弹出这样的对话框：

![](https://p3.ssl.qhimg.com/t01110d27a91db2d051.jpg)

### 小结

发布3年多，微信小程序已经从微信生态的一环，逐步向多领域渗透。随着开发者的日益增多，面向开发的工具也逐步完善。本文试图管中窥豹，给大家介绍了微信自动化的主要环节。时至今日，小程序已经成长为一种重要的产品形式和生态环境。越来越多的小程序平台正在自己的领域以不同的形式给小程序这个产品形式添砖加瓦。小程序生态和开发环节的完善和成长，也需要广大平台、开发者共同努力，将这一Created in China 的生态体系发扬光大。
