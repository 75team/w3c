![](https://p3.ssl.qhimg.com/t01f8755aedb0dd9f8b.png)

> 天街小雨润如酥，草色遥看近却无。最是一年春好处，绝胜烟柳满皇都。 —— 唐.韩愈 《早春呈水部张十八员外二首》

### 引子

几个月之前，chunpu小编曾经在《[震惊! 滑动验证码竟然能这样破解](https://mp.weixin.qq.com/s/NDIEaAhMHdrC3l9DV8z00g)》一文中给大家展示了使用支持WebDriver标准的Firefox破解滑动验证码的示例，脑洞之大，构思之巧，笔法幽默，叹为观止，也极大的燃起了笔者对此的兴趣。

这篇文章就带大家使用目前较为流行的Puppeteer完成这件事情。

当我们把WebDriver和Puppeteer放在一起的时候，还是有必要说明一下这二者的区别。

[WebDriver标准](https://www.w3.org/TR/webdriver1/)，可以远程的操控目标浏览器。标准是语言无关、平台无关的。

有一种叫Selenium的框架，实现了WebDriver协议。Selenium通过各种浏览器的driver来驱动相应的浏览器，可以支持Python、Java、C#、JavaScript等语言的编程，同时还可以通过Selenium Server 实现集群测试。

Puppeteer是Google出品的NodeJS包。使用Node脚本通过DevTools Protocol协议，直接对Chrome浏览器进行操作。由于有Chrome官方的背景，Puppeteer和Chrome浏览器配合得异常完美。由于几乎直接操作浏览器，也使得操作的效率高于Selenium。Puppeteer官方给出了下面这张图，表述了Puppeteer中各个部分的关系。

![](https://p3.ssl.qhimg.com/t01dae7ef9a392bb1da.png)

随着Puppeteer项目的发展，Puppeteer也正在向着跨浏览器方向发展。比如[Puppeteer-firefox](https://github.com/GoogleChrome/puppeteer/tree/master/experimental/puppeteer-firefox)，目前正在实验阶段。对于使用其他语言操控Puppeteer，[官方暂时没有计划](https://github.com/GoogleChrome/puppeteer/issues/575#issuecomment-325397258)，不过对于python，有一个非官方的实现[pypuppeteer](https://pypi.org/project/pyppeteer/)。

因此，就目前的技术体系来看，如果需要多语言、带集群支持、多浏览器支持，请选择Selenium；如果需要更快速的执行、更易上手的API，或者无需考虑多浏览器，请考虑Puppeteer。

### 分析滑动验证码

验证码之所以存在，其实就是要区别出“人”和“机器”。特别的，对于滑动验证码，需要根据滑动的动作判断出操作者是人与否。这显然是与自动化测试是矛盾的。因此解决这个问题的关键点在于两点：

1. 准确地识别出验证码需要滑到的位置。
2. 以符合人类规律的形式把滑块滑到正确的位置

《震惊》一文中给出了一种方法，这里我们给出基于Puppeteer的一种可行做法。

笔者这里把识别过程分为三步：

1. 识别拖动终点地址
1. 拖动
1. 验证结果并区别对待

在这之前，我们先用Puppeteer把目标页面打开

```JavaScript
const URL = "http://www.geetest.com/type/"

let browser

const init = async () => {
    if (browser) {
        return;
    }

    browser = await puppeteer.launch({
        "headless": false,
        "args": ["--start-fullscreen"]
    });
}

const configPage = async (page) => { 
    await page.setViewport({ width: 1280, height: 1040 });
}

const toRightPage = async (page) => {
    await page.goto(URL)

    await page.evaluate(_ => {
        let rect = document.querySelector(".products-content")         
            .getBoundingClientRect()
        window.scrollTo(0, rect.top - 30)
    })

    await page.waitFor(1000)

    await page.click(".products-content li:nth-child(2)")
} 

~(async (page) => { 
    await configPage(page)
    await toRightPage(page)
})()
```

Puppeteer的大多数方法都是异步的，为了代码更加易读，官方建议更多使用await/async来操作。上面这一段代码的含义是：使用Puppeteer打开页面，全屏化，打开相应的TAB。并滚动至相应的位置。

如果无需看到跳出的Chrome，可以把`"headless": false`改为true。就更像一个命令行程序了。当然在这个例子里我们还是要看到浏览器执行效果的。

为了看到浏览器元素结构，可以在调试时候，打开devtools。方法是在lanch方法中设置`devtools: true`

#### 识别拖动终点地址

首先要做到的是，识别拖动终点的位置。通过分析页面看到，拖动目标是一个黑色的缺口。这个缺口实际上是勾画在一个`canvas.geetest_canvas_bg`元素上。

![](https://p3.ssl.qhimg.com/t01a38af8c532c0f57b.png)

为了识别出缺口的初始位置，我们需要得到一张没有缺口的图像。实际上，这张图片位于另一个canvas元素`canvas.geetest_canvas_fullbg`上。

理论上，Puppeteer可以进行对页面、元素等进行截图。然后分析图片的色彩数据。这时候，因为`canvas.geetest_canvas_fullbg`本身处于不可见状态，需要调用脚本将其变为可见，然后也可以得到它：

![](https://p0.ssl.qhimg.com/t01a89fff8cdb95da33.png)

不过，今时今地我们来偷个懒。因为页面上的元素就是canvas，而canvas本身就有`getImageData`方法。特别懒的笔者决定直接从页面的canvas吐出数据。这里，我们可以把方法封装起来，然后通过Puppeteer提供的注入方法，把这个方法直接注入到页面里。

```javascript
const injectedScript = `
    const getCanvasValue = (selector) => {
        let canvas = document.querySelector(selector)

        let ctx = canvas.getContext('2d')
        let [width, height] = [canvas.width, canvas.height]

        let rets = [...Array(height)].map(_ => [...Array(width)].map(_ => 0))
        for (let i = 0; i < height; ++i) { 
            for (let j = 0; j < width; ++j) { 
                rets[i][j] = Object.values(ctx.getImageData(j,i,1,1).data)
            }
        }        

        return rets
    }
`
```

此时调用Puppeteer提供的注入方法`addScriptTag`就可以在上下文中加入这个方法。

```JavaScript
await page.addScriptTag({content: injectedScript})
```

当然这依然是异步方法。后面我们就可以在页面中通过调用注入的`getCanvasValue`方法来获取所选canvas的颜色值了。

这当然是投机取巧的办法，如果目标对象不是canvas，就只好老老实实的截图获取，同时，对于不可见的元素，也可以通过`addScriptTag`的方法，注入JavaScript以改变可见性，以便正确地截图。

仔细观察原图和带缺口的图，发现只要取得两个图片像素值的差集，最左边的坐标就是拖动目的地。这里，带缺口的图上面有一个浅色的干扰图。可以在对比“相等”时候，增加一些阀值，定义“相等”为容许有一定范围内的差异。

```JavaScript
const THRESHOLD = 70

const _equals = (a, b) => { 
    if (a.length !== b.length) {
        return false
    }

    for (let i = 0; i < a.length; ++i) { 
        let delta = Math.abs(a[i] - b[i])

        if (delta > THRESHOLD) {
            return false
        }
    }
    return true
}

const _differentSet = (a1, a2) => { 
    let rets = []

    a1.forEach((el, y) => {
        el.forEach((el2, x) => {
            if (!_equals(el2, a2[y][x])) {
                rets.push({
                    x,
                    y,
                    v: el2,
                    v2: a2[y][x]
                })
            }
        })
    })

    return rets    
}
``` 

这时，取得差集的x最小值即可。

```JavaScript
const _getLeftest = (array) => {
    return array.sort((a, b) => {
        if (a.x < b.x) {
            return -1
        }

        else if (a.x == b.x) {
            if (a.y <= b.y) {
                return -1
            }
            return 1
        }

        return 1
    }).shift()
}
```

终点有了，起点即为0，因为我们拖动的对象为：`.geetest_slider_button`。这个圆钮始终位于左侧起始位置。

![](https://p0.ssl.qhimg.com/t017b5df79f12e0bd34.png)

因此，识别任务完成：从0拖动到识别出的目标点的横坐标。 

#### 拖动

Puppeteer不直接提供`drag`方法。不过提供了对mouse的控制方法。可以通过调用mouse的方法，模拟拖动。同时由于`boundingBox`方法获取的是圆钮左上角的坐标，需要适当的往内部移几个像素，否则鼠标“抓”不到圆钮。

```JavaScript

let slider = await page.waitFor(".geetest_slider_button")
let sliderInfo = await slider.boundingBox()

let m = page.mouse

await m.move(sliderInfo.x + 5, sliderInfo.y + 6)
await m.down()

// 假装我是拖动代码

await m.up()
```

下面需要模拟拖动。

这里可以随机分段，也可以模拟匀加速直线运动。但需要注意，一定不要使用匀速运动，并且速度不要太快，时间要稍长一些。

以模拟匀加速直线运动为例，

匀加速直线运动的公式为:`S = v0t + 1/2*a*t*t`
其中，S为位移，v0为初速度，t为时间，a为加速度。
因为我们的初速度为0，上式可以简化为：`S = 1/2*a*t*t`。

我们不需要真的用setInterval来解决，可以用generator来模拟每次调用，并假设每次调用都过了0.2秒，这样可以把每次位移的距离一次性算出来。

```JavaScript 

let _moveTrace = function* (dis){
    let trace = []
    let t0 = 0.2
    let curr = 0
    let step = 0
    let a = 0.8

    while (curr < dis) {
        let t = t0 * (++step)
        curr = parseFloat((1 / 2 * a * t * t).toFixed(2))
        trace.push(curr)
    }

    for (let i = 0; i < trace.length; ++i) { 
        yield trace[i]
    }
}
```

使用时候，我们用generator的方式调用之，使用for...of，当generator结束返回，for...of也自动中止了。同时，为了真实性，可以做一些对y的随机指定（实际y是不会动的）。横坐标x也可以做一些超过再退回的扰动设置。

```JavaScript
let gen = _moveTrace(dest.x)

for (let ret of gen) { 
    await m.move(sliderInfo.x + ret, sliderInfo.y + 6 +  _getY(-5, 40))
}

await m.move(sliderInfo.x + dest.x, sliderInfo.y + 6 + _getY(-5, 40))
```

此时，拖动的任务基本完成。

#### 验证结果并区别对待

由于这些测试可能会有一定程度的误差，也会造成一些失败率。为了真正“自动”起来，需要对识别和拖动结果作出一些判断，对于错误的，重新启动测试。对于多次犯错的，重新刷新页面。

```JavaScript
let isSuccess = await page.evaluate(_ => { 
    if (!!document.querySelector(".geetest_success_animate")) { 
        return true
    }
    return false
})
```

好了，Puppeteer这个任务的细节基本完成。

保存, 执行。

> 笔者放下鼠标，端起桌上的肥宅快乐水， 看着 Puppeteer 操作起了浏览器“木偶”。打开网页，点击按钮, 拖动滑块，滑块曲折前行，虽然有挫折，但是依然百折不回...摩擦摩擦, 似魔鬼的步伐, 似老奶奶颤巍巍的手。终于, 极验又一次显示出一个清爽绿色的横幅, 仿佛在向我们招手: 欢迎你, 人类。

![](https://p3.ssl.qhimg.com/t015abee4711f6bb2a6.gif)
