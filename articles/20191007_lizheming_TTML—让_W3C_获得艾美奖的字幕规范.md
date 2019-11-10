![logo](https://p3.ssl.qhimgs4.com/t01289cbbd49ec72c44.png)

说到视频字幕格式，一般大家都会想到 `.srt`, `.ass` 之类大家比较常用的格式。而现在说到 Web 字幕格式，大家第一反应肯定都是 [WebVTT][1]。我们知道在`<video>`或者`<audio>` 标签中要加载字幕的话，需要使用 `<track>` 标签将字幕文件嵌入进来。而在 [track][2] 的文档中我们会发现其实还有一种 Web 字幕格式，那就是本文的主角 TTML。

> The tracks are formatted in [WebVTT format][3] (.vtt files) — Web Video Text Tracks or [Timed Text Markup Language][4] (TTML).  
> via: [\<track\>: The Embed Text Track element][5]


## TTML 简介

虽然这个字幕格式标准 2010 年就已经成为正式标准了，但是知道的人其实并不多。TTML 全称是 Timed Text Markup Language，是一种基于 XML 的时序文本标记语言。它旨在用于全球范围内的跨字幕和字幕传递应用程序，从而简化互操作性并保持与其他字幕文件格式的一致性和兼容性。

TTML 提供了一种基于时间的配置文件，用来描述与数字媒体相关的文本、图形、图像等内容的出现、位置、样式以及动效等相关配置。因其基于文本字幕标准的工作让更多数字媒体内容提高了无障碍访问能力，于[2016年1月8日][6]，荣获由美国国家电视艺术与科学学院颁发的技术与工程艾美奖。

![](https://www.w3.org/2016/01/MDB_5533-TTWG-Emmy-1-small.jpg)

## TTML 兼容性

TTML 目前主要是大部分的广播和电视公司、电影制作公司以及电视流媒体平台等公司在使用，例如大家知道的 BBC、Netflix、HBO甚至还有好莱坞。客户端方面的话 VLC Player 开源播放器已经支持这种格式的字幕文件了。而在 Web 上虽然早已有了 W3C 规范，但是似乎浏览器厂商并不是非常买账，目前仅有 IE10+ 支持该格式，且 IE 上支持的仅仅只是 TTML 规范的一个子集，按照[文档][7]描述，包括 Animation 在内的一些特性都不太支持，更不用提之后 TTML2 中新增的一些特性了。

> Note:  IMSC does not have native support in browsers at this current moment, but the imscJS polyfill can be used to bridge this gap. All the examples below are rendered by using imscJS. It creates dynamically HTML and CSS from an IMSC  XML document.
> via: [《IMSC basics》][8]

虽然 Web 上的兼容性这么惨淡，不过好在有对应的 [Polyfill][9] 实现可以兼容。使用起来比较简单，调用几个官方 API 方法即可。解析 ttml 字幕内容后调用 `getMediaTimeEvents()` 方法获得一个包含所有的字幕片段以及每个动画的起始时间的数组，根据对应的起始时间调用 `generateISD()` 方法获取到对应时间片段的字幕片段数据，最后转换成 DOM 使用 `renderHTML()` 方法进行渲染即可。

```js
const ttmlObject = imsc.fromXML(ttmlXmlString);
const times = ttmlObject.getMediaTimeEvents(); 
const snapshot = imsc.generateISD(ttmlObject, times[1]);
imsc.renderHTML(snapshot, document.getElementById('videoContainer'));
```

Polyfill 的详细文档可以查看 [MDN][10]，同时官方提供了一个 [demo][11] 方便大家快速了解。

## TTML 

标准的 `.ttml` 文件的基本格式应该如下，整体结构和 HTML 非常类似，有 `<head>` 和 `<body>` 两个标签构成主体内容。`<body>` 如其名为主体内容标签，而 `<head>` 可以放置如下标签：

- `<metadata />`：用于放置字幕文件的 meta 信息的容器标签
- `<styling />`：用于放置预定义的 `<style>` 样式的容器标签
- `<layout />`：用于放置预定义的 `<region>` 布局的容器标签

```xml
<tt xml:lang="" xmlns="http://www.w3.org/ns/ttml">
  <head>
    <metadata>
      <ttm:title>Timed Text TTML Example</ttm:title>
      <ttm:copyright>The Authors (c) 2006</ttm:copyright>
    </metadata>
    <styling>
      <style xml:id="default"
        tts:color="white"
        tts:fontFamily="proportionalSansSerif"
        tts:fontSize="100%"
        tts:textAlign="center"
      />
    </styling>
    <layout>
      <region xml:id="area"
        style="default"
        tts:extent="100% 10%"
        tts:origin="0 90%"
        tts:backgroundColor="black"
        tts:displayAlign="after"
      />
    </layout>
  </head>
  <body region="area">
    <div>
      <p xml:id="sub1" begin="0s" end="10s">
        Hello World!
      </p>
    </div>
  </body>
</tt>
```

从上面的示例可以看出来，整体的结构非常的简单。通过 `<style/>` 标签可以预定义一套样式，这套样式可以赋给 `<region/>` 标签方便预设布局的时候提供对应的样式，最终将预设布局赋值给内容标签。说预设和预定义的意思其实就是想说如果你不想使用预设的样式，你也可以直接在内容标签中使用对应的标签属性进行复写。

主体内容这的话看起来和 HTML 非常相似，规范中定义我们可以使用 `<div>`、`<p>`、`<br/>`、`<span>`这几个标签来描述内容。`<div>` 用于对内容进行分块，所有的内容都应该包裹在 `<div>` 标签中。`<p>` 是用于包裹单条字幕的最小标签，所有对应这条字幕的描述都需要包裹在这个标签中。当然如果想要对某条字幕的部分内容进行配置，则可以将需要配置的内容使用 `<span>` 标签进行包裹。如果想要对内容进行换行，则使用 `<br/>` 标签即可。

### 字幕样式

TTML 的字幕样式配置和 CSS 其实整体是十分像的，只是它改成了标签属性的形式。它支持设置字幕的字体、字号、颜色、大小、行高、排列方式等文字样式，以及边框、背景、位置等字幕块的样式。

### 字幕位置
众多的样式属性中，位置属性是最重要的。TTML 提供了下列三种属性让我们对字幕位置进行自定义。

- `tts:extent`：用于定义字幕的尺寸，例如 `tts:extent="100% 10%"` 表示的是字幕宽度为 100%，高度为 10%。
- `tts:origin`：用于定义字幕左上角的绘制原点，例如 `tts:origin="0% 90%"` 表示的是以内容左上角为原点，(0, 90%) 的位置开始绘制。
- `tts:position`：该属性是 TTML2 中新增的属性，用于强制定义字幕位置。区别于 origin 是左上角的偏移，position 是根据设置的属性动态原点的偏移。例如 `tts:position="70% 50%"` 的话则是相对于字幕块的`(70%, 50%)`点作为原点整体字幕偏移相对于内容区域的`(70%, 50%)`。

可以看到，相对于 Web 的盒子布局，我们需要额外的手动定义字幕的尺寸和位置，这对于习惯了浏览器自己绘制渲染的我们来说还是非常不习惯的。特别是文字的布局如果没有 CSS 的自动计算，实际上是非常麻烦的，包括字幕内容的多变以及字号行高样式都需要考虑进去。

### 字幕动画
相对于其它字幕格式，支持动画是 TTML 的一大特色。它借鉴了 SVG 的 SMIL 动画标签规范，提供了以下下三组标签让我们可以对字幕动画进行描述。

- `set`：用于定义在某段时间内字幕内容的样式变化，例如 `<set begin="1s" dur="1s" tts:color="red"/>` 表示的是 1s 后将字幕颜色设置成红色并在 1s 后取消设置。
- `animate`：TTML2 新增的动画属性，支持使用关键帧的形式定义某段时间内字幕样式变化。例如`<animate keyTimes="0;0.2;1" tts:color="red;green;blue"/>` 表示字幕在 0s 的时候为红色，0.2s 后线性转变为绿色，1s 后再线性转变成蓝色。支持多个样式属性变化定义。
- `animation`：多个 animate 或者 set 动画标签的容器标签。

可以看到 set 支持状态的变化但是其实本质是动态的属性修改，直到 TTML2 增加了 animate 标签后 TTML 才算是真正意义上的支持了“动画”。通过关键帧我们能更方便的定义一系列的属性变化并进行自动的补间计算。

## TTML vs WebVTT

单从 Web 上来看的话，浏览器兼容性好、配置简单、自动布局而且还支持 CSS 定义样式的 WebVTT 无疑是更优秀的。不过 TTML 浏览器兼容性虽然不咋地，但是在广播电视电影等公司的数字媒体设备中的兼容性还是非常不错的，而且除了文本之外，TTML2 还新增了音频、图像、字体等富媒体内容的内嵌，字幕内容的丰富性和无障碍性方面都有不俗的表现。

不过 TTML 规范因为制定时间比较早的原因所以采用了 XML 协议，现在看来在 Web 上是不讨喜的，特别是 Chrome 还明确指出[这与他们想要删除 XML 的依赖支持的理念违背而将不予以实现][12]。可以预见的是在很长的一段时间内，TTML 的浏览器兼容性应该都不会好就是了。

当然针对不复杂的 TTML 字幕，和 WebVTT 的相互转换是比较简单的，下图是同等效果的 TTML 和 WebVTT 字幕文件的内容对比。

![](https://p5.ssl.qhimgs4.com/t012097aba84c4b4a1e.png)

## 后记

TTML 不仅兼容性不好，资料也是少的可怜，国外的资料少的可能，国内的资料抱歉我没搜到。好在文档不是很多，稍微啃一下还是能啃明白的。本文可以算是国内第一篇正儿八经的介绍 TTML 字幕的文章了，希望能帮助大家快速了解 TTML 规范。总体个人感觉上 TTML 是将样式和内容内嵌在一起，整体和 SVG 会比较类似，方便了多平台的渲染统一。但是 TTML 这个规范在使用难易度以及兼容性上其实相较于 WebVTT 来说都是不足的。特别是这种不足会越来越大，剩下的优势也就是富媒体内容和动画这块了。作为在 Web 上实现同样功能的两种规范，后续如果真的有这两方面的需求的话，我个人猜测在 WebVTT 上增加这方面的支持的可能性会更大一点。

**参考资料：**

- [《Open Source Support for TTML Subtitles Status Quo and Outlook》][13]
- [《Timed Text Markup Language 2 (TTML2)》][14]
- [《Timed Text Markup Language 1 (TTML1) (Third Edition)》][15]


  [1]: https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API
  [2]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/track
  [3]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Video_Text_Tracks_Format
  [4]: https://w3c.github.io/ttml2/index.html
  [5]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/track
  [6]: http://www.chinaw3c.org/emmyawardttml-pr.html
  [7]: https://docs.microsoft.com/en-us/openspecs/ie_standards/ms-ttml/16bc3854-9a56-48b1-97e5-ae5d41de67d5
  [8]: https://developer.mozilla.org/en-US/docs/Related/IMSC/Basics
  [9]: https://github.com/sandflow/imscJS
  [10]: https://developer.mozilla.org/en-US/docs/Related/IMSC/Using_the_imscJS_polyfill
  [11]: https://mdn.github.io/imsc/imscjs-demo/imscjs-demo.html
  [12]: https://groups.google.com/a/chromium.org/forum/#!topic/blink-dev/vXuOTK5M0hM
  [13]: https://www.youtube.com/watch?v=k58umpO_EnM
  [14]: https://www.w3.org/TR/2018/REC-ttml2-20181108/#intro
  [15]: https://www.w3.org/TR/2018/REC-ttml1-20181108/
