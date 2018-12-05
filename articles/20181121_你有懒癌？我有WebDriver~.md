> WebDriver真香~

## 背景

最近负责的项目的一个拓扑界面加了新功能：在渲染后点击按钮可保存每个节点坐标。提测后才发现，**线上有将近200个没有保存过节点信息的老拓扑图。新功能上线后需要将每个页面都打开，等待渲染，然后点击保存才能使新功能生效。**懒癌晚期的笔者反正是不愿意做这件事情的。

第一时间想到工作组的冯通童鞋用WebDriver实现过对滑动验证码的模拟人类验证。或许WebDriver能帮忙解决这个问题~

## 上手WebDriver

WebDriver是W3C制定的一个标准，它衍生自Selenium WebDriver框架。Selenium WebDriver诞生的目的是模拟用户操控本地或者远程的浏览器，以实现浏览器的自动化操作（可用于自动化测试）。WebDriver标准主要是基于Selenium WebDriver API设计的一套接口。

使用WebDriver需要做如下准备：

- 安装Chrome或者FireFox的Driver程序。笔者选择了ChromeDriver。下载地址：http://chromedriver.chromium.org/downloads。Tips：记得选择正确的操作系统，并将下载的文件放到系统环境变量路径中。
- 根据自己擅长的语言，选择安装对应版本的selenium-webdriver包。笔者使用的是[Node.js版本的selenium-webdriver](https://www.npmjs.com/package/selenium-webdriver)

做好这些准备工作后，笔者兴高采烈地写了一个demo。功能很简单：打开一个拓扑页面，点击保存按钮。初版代码如下：

```
const webdriver = require('selenium-webdriver')
!async function () {
  let driver = await new webdriver.Builder().forBrowser('chrome').build()
  await driver.get('http://mydomain/topo/1234') // 请自行替换该URL
  driver.findElement(webdriver.By.css('.topo-component .btn-save')).click() //请自行替换选择器
}()
```

剧情需要，运行代码后果然没有达到预期。

![](https://p4.ssl.qhimg.com/t01e0451521e7e98ba8.jpg)

虽然打开了一个浏览器窗口，也打开了指定的URL，但是这个URL很快就跳转到了登录界面。小老弟，怎么肥事？没带上cookie？

笔者观察发现，每初始化一个WebDriver实例，就相当于创建了一个全新的浏览器，没法共享已经打开的浏览器里的cookie等信息。面对一个没有“身份”的请求，服务端当然是拒绝的，因此跳转到了登录界面。

所以首先要解决的问题是”身份“。

笔者的思路是：先登录一次，将cookie记录到本地。下次再请求页面的时候，将本地的cookie带上，这样服务端就认得“我”了。在cookie过期之前都不需要再登录~

## 登录

第一次登录，输入一堆验证信息。等登录完成后，获取cookie并保存到本地。整个流程如下：

- 访问登录页面的URL；
- 自动填充用户名、密码；
- 如果出现验证码，程序留给人类一点时间手动填（因为没有实现自动识别验证码）；
- 如果还出现别的提示等，根据业务情况处理（我们的目标是拿到cookie，这点曲折过程算什么）；
- 等待跳转到目标域名；
- 获取cookie并存储到本地，留待下次使用。

代码如下：

```
// 存储cookie到本地文件
async function storeCookieToFile (driver) {
  const cks = await driver.manage().getCookies()
  const ckString = JSON.stringify(cks, null, 2)
  // 将cookie保存到当前目录
  fs.writeFile('cookies.txt', ckString, (err) => {
    err && console.log(err)
  })
}

!async function login() {
  let driver = await new webdriver.Builder().forBrowser('chrome').build()
  // 请求必须要登录才能访问的地址。毫无疑问，会跳转到登录页
  await driver.get('http://mydomain/data_need_authorization') 

  try {
    // 用1秒等待登录输入框的出现
    await driver.wait(driver.findElement(webdriver.By.css('input[name=userName]')), 1000)
    driver.findElement(webdriver.By.css('input[name=userName]')).sendKeys('myUserName')
    driver.findElement(webdriver.By.css('input[name=password]')).sendKeys('myPassword')
    driver.findElement(webdriver.By.css('input[type=submit]')).click()
  } finally {
    try {
      // 可能出现验证码
      await driver.wait(driver.findElement(webdriver.By.css('input[name=captcha]), 2000)
      await holdOn(5000) // 自己实现一个holdOn函数，静静等待5秒。
    } finally {
      // 此处还可以根据业务处理其他逻辑
      ...
    }
  }
  // 获取登录后的标志元素，确认登录成功。
  await driver.wait(driver.findElement(webdriver.By.css('.user-info')), 5000)
  storeCookieToFile(driver)
}()
```

以上代码中用到了两个比较重要的API：`sendKeys()`发送键盘事件填充输入框，`getCookies()`获取cookie。另外，笔者未实现自动识别验证码，所以采用人为干预的方式输入。如果你连登录逻辑也不想写，那就直接让程序`holdOn`，等上几秒，自己手动输入并提交，静静等待程序帮忙保存密码也是可以的。

最后总算将cookie保存到本地文件了。接下来用这个身份去访问目标地址。

## 访问目标地址

### 设置cookie

笔者原以为的步骤：

- 从本地文件读cookie；
- 将cookie添加到浏览器里；
- 请求目标地址；
- 看到登录后的页面。

实际上这样并不可行。WebDriver在访问一个地址之前，设置cookie是没有意义的，这时候还没有目标域名。所以必须先访问一个页面，然后在这个域加上cookie，再次访问该页面，才能看到登录后的效果。

修改后的步骤：

- 从本地文件读cookie；
- 请求一个不登录也能访问的**同域**页面（为了确保不跳转到别的域名）。比如：http://mydomain；
- 添加cookie；
- 可能需要等几秒；
- 再次请求这个页面；
- 终于看到用户信息~

代码如下：

```
!async function() {
  let driver = await new webdriver.Builder().forBrowser('chrome').build()
  await driver.get('http://mydomain')
  const cookies = await retrieveCookieFromFile() // 请自行实现
  JSON.parse(cookies).forEach(async ck => {
    await driver.manage().addCookie(ck)
  })
  await holdOn(2000)
  await driver.get('http://mydomain')
  // 再次读cookie，有值啦~
  driver.manage().getCookie('XXX').then(function (cookie) {
    console.log('get cookie', cookie);
  });
}()
```

笔者测试发现，这个过程十分缓慢，还有待调优。Anyway，现在终于可以着手实现保存拓扑图的功能了。

## 实现业务逻辑

对200个拓扑数据写一个循环，每次循环包含以下逻辑：

- 打开当前拓扑图对应的URL（`get()`方法）
- 等待渲染（`holdOn()`方法）
- 点击”保存“按钮（`click()`方法）

将这段逻辑实现后放到上一节的代码末尾。运行程序，看到页面一次次提示“保存成功”，笔者脸上露出了老母亲般的围笑~

具体代码就不放了，使用的API都是前两节代码里提到的，读者朋友们可以参考前面的代码自己练习。

## 参考文档

- [WebDriver标准](https://www.w3.org/TR/webdriver1/#sessions)
- [Selenium WebDriver](https://www.seleniumhq.org/projects/webdriver/)
- [Cookie Handling in Selenium WebDriver](https://www.guru99.com/handling-cookies-selenium-webdriver.html)
- [Selenium JS add cookie to request
