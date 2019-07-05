title: data-test
date: 2019-05-29 15:37:39
tags:
---
<link rel="stylesheet" href="/css/custom.css">
<script src="http://lib.baomitu.com/jquery/3.2.1/jquery.min.js"></script>
<script src="/js/generate-toc.js"></script>

# Data URL简介与使用

相信大家在前端开发的过程中，都应该处理过图片，其中有一项就是我们会在loader中将小的图片转为base64。那么这个base64是什么呢？我们为什么要将其转为base64呢？

其实这是格式的图片，我们可以称为Data URL，下面让我们一起来简单了解下。

## 1. 简介

`Data URL`，是以`data:`模式为前缀的URL，允许内容的创建者将较小的文件嵌入到文档中。与常规的URL使用场合类似，下面会具体介绍可以将Data URL用在哪些地方。

`Data URL`由**`data:`前缀、MIME类型（表明数据类型）、`base64`标志位（如果是文本，则可选）以及数据本身四部分组成**。

语法格式如下：
```
data:[<mediatype>][;base64],data
```

`mediatype`是一个MIME（Multipurpose Internet Mail Extension）类型字符串，如`image/jpeg`表示一个JPEG图片文件。如果省略，默认值为`text/plain;charset=US-ASCII`。

## 2. Data URL的优缺点

1. Data URL的优势

  和传统的外部资源引用，Data URL有着以下优势：

  * 当访问外部资源很麻烦或受限时，可以将外部资源转为Data URL引用(这个比较鸡肋)
  * 当图片是在服务器端用程序动态生成，每个访问用户显示的都不同时，这是需要返回一个可用的URL（场景较少）
  * 当图片的体积太小，**占用一个HTTP会话**不是很值得时（雪碧图可以出场了）

2. Data URL的缺点

  虽然Data URL允许使用者将文件嵌入到文档中，这在某些场景下较为合适，但是Data URL也有一些缺点：

  * 体积更大：Base64编码的**数据体积通常是原数据的体积4/3**，也就是Data URL形式的图片会比二进制格式的图片体积大1/3
  * 不会缓存：Data URL形式的图片**不会被浏览器缓存**，这意味着每次访问这样的页面时都被下载一次。这是一个使用效率方面的问题——尤其当这个图片被整个网站大量使用的时候。

## 3. 如何获取base64编码

1. Linux/Mac OS X下可以使用`uuencode`命令

  ```
    uuencode -m <源文件> <转码后标识>
  ```

  如执行`uuencode -m hello-base64 hello`，会得到如下结果：

  ```
  begin-base64 644 hello
  aGVsbG8gYmFzZTY0 // 此处为base64编码，对应文本内容为 'hello base64'
  ====
  ```

2. 使用原生Web API编码/解码

  Javascript中有两个函数负责编码和解码base64字符串，分别是`atob`和`btoa`。

  * `atob()`: 负责解码已经使用base64编码了的字符串。
  * `btoa()`: 将二进制字符串转为base64编码的ASCII字符串。

  两者都只针对Data URL中的data进行处理。

  ```
  btoa('hello base64') // "aGVsbG8gYmFzZTY0"
  atob('aGVsbG8gYmFzZTY0') // "hello base64"
  ```

3. Canvas的`toDataURL`方法

  Canvas提供了`toDataURL`方法，用于获取canvas绘制内容，将其转为base64格式。

  如下图所示，文本框中的内容即为canvas中绘制内容的base64格式。

  ![](http://p5.qhimg.com/t018bb9f0a15e681625.png)

  Html: 
  ```
  <canvas id="testCanvas" width="200" height="100"></canvas>
  <textarea id="testCanvas-content"></textarea>
  ```

  JS:
  ```
  var canvas = document.getElementById('testCanvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    // 设置字体
    ctx.font = "Bold 20px Arial"; 
    // 设置对齐方式
    ctx.textAlign = "left";
    // 设置填充颜色
    ctx.fillStyle = "#0f0"; 
    // 设置字体内容，以及在画布上的位置
    ctx.fillText("hello base64", 10, 30); 
    // 描边颜色
    ctx.strokeStyle = "#0f0"; 
    // 绘制空心字
    ctx.strokeText("hello base64", 10, 80);
    // 获取 Data URL
    document.getElementById('testCanvas-content').value = canvas.toDataURL();
  }  
  ```

4. 使用FileReader API的`readAsDataURL`方法

  FileReader API提供的`readAsDataURL`方法能够返回一个基于base64编码的Data URL。

  如下所示，选择文件后返回Data URL。
  
  **注意，别选大的文件，选个小的试试就行，LOL。**

  ![](http://p0.qhimg.com/t01798e11cb132b4c9c.png)
  
  Html:
  
  ```
    <div class="demo-area">
      <input type="file" id="testReadAsDataURL">
      <textarea id="testReadAsDataURL-content"></textarea>
    </div>
  ```

  JS:
  ```
    var reader = new FileReader()
    reader.onload = function(e) {
      var textarea = document.getElementById('testReadAsDataURL-content');
      textarea.value = reader.result
    }
    document.getElementById('testReadAsDataURL').onchange = function(e) {
      var file = e.target.files[0]
      reader.readAsDataURL(file)
    }
  ```
 


## 4. Data URL能用在何处呢？

最开始已经说了`Data URL`，是以`data:`模式为前缀的URL，使用场合与常规URL相同，即常规URL能够使用的场合，Data URL也可以使用。如：浏览器地址栏、link中引入css文件、script中引入js文件、img src中引入图片、video中引入视频、iframe中引入网页、css background url引入背景。

1. 在浏览器地址栏中使用Data URL

  <div class="demo-area">
    <a href="" target="_blank" id="setDataURLInHref">
    在浏览器地址栏中使用Data URL，打开上述canvas中绘制的内容</a>
    <p class="text-hint">注意：chrome 从56开始将Data URL标记为“不安全”，从60开始屏蔽从页面打开的 Data URI 网址，可以**右键新标签打开**。[详情](http://www.cnblogs.com/ziyunfei/p/6753002.html)</p>
  </div>
  <script>
    document.getElementById('setDataURLInHref').href = document.getElementById('testCanvas-content').value
  </script>

  Html:
  ```
  <a href="base64内容" target="_blank" id="setDataURLInHref"></a>
  ```

2. 在**script/img/video/iframe**等标签的`src`属性内使用Data URL

  以在script中使用Data URL为例（在原文中点击按钮之后，会弹出alert，alert的内容通过Data URL设定）：

  ![](http://p3.qhimg.com/t01a532b4b035305054.png)

  JS: 
  ```
  var scriptDataURL = `data:text/javascript;base64,YWxlcnQoJ+WcqHNjcmlwdOS4reS9v+eUqERhdGEgVVJMJykK`
  // 对应文本为：alert('在script中使用Data URL')
  $('#setDataURLInScriptBtn').click(function() {
    $('<script>').attr('src', scriptDataURL).appendTo($('body'))
  })
  ```
3. 在`<link>`标签的href中使用Data URL

  如下图，看在原文中点击按钮，会发现按钮中文字的颜色变成了红色，样式通过Data URL设定。

  ![](http://p9.qhimg.com/t0136465db73ed1fa52.png)

  JS: 
  ```
  var linkDataURL = `data:text/css;base64,I3NldERhdGFVUkxJbkxpbmtCdG57Y29sb3I6IHJlZDt9Cg==`
  // 对应内容为：setDataURLInLinkBtn{color: red;}
  $('#setDataURLInLinkBtn').click(function() {
    $('<link rel="stylesheet" type ="text/css">').attr('href', linkDataURL).appendTo($('head'))
  })
  ```

4. 在css样式`background`的url中使用Data URL

  执行下面代码，会将上面Canvas创建的图片的Data URL作为背景展示。

  ![](http://p2.qhimg.com/t0173e1436c726b7adb.png)
  
  JS: 
  ```
  const bgDataURL = $('#testCanvas-content')[0].value
  $('#setDataURLInBG').css('background-image', `url(${bgDataURL})`)
  ```

## 5. 参考链接

> 1. [MDN Data URLs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs)