# Web标准：前端的原力

> 本文是作者根据为“360第六届前端星计划”录制的在线培训课程整理的提纲。

Web标准是构成Web基础、运行和发展的一系列标准的总称。如果把前端开发人员比喻成“孙悟空”，那么Web标准就是“如来佛的手掌”。可以毫不夸张地说：对前端从业者来说，Web标准意味着能力，代表着舞台，象征着空间，指引着发展。

Web标准并不是由一家标准组织制定，涉及IETF、Ecma、W3C和WHATWG等。本文按Web标准组织分别简述相关Web标准，为前端学习Web标准提供指导。

## IETF

IETF，全称Internet Engineering Task Force（互联网工程任务组），成立于1986年。Internet其名的TCP/IP协议由IETF标准化。

1991年，Web发明人Tim Berners-Lee总结了其Web服务器和浏览器中实现的HTTP协议，也就是HTTP 0.9：

- HTTP/0.9：https://www.w3.org/Protocols/HTTP/AsImplemented.html

HTTP 0.9全文不到700个单词，定义了最简单的浏览器与服务器通信获得HTML页面的协议。这个协议只定义了GET请求。

随着Web的迅速流行，很多Web服务器在0.9版基础上增加了扩展。为了把这些扩展及时记录下来，IETF成立HTTP Working Group（HTTP WG）着手制定HTTP/1.0。1996年5月，IETF发布了一份RFC（Request for Comments，征求意见稿）：RFC 1945。IETF的RFC可以接受为正式标准，也可以作为参考文档。RFC 1945就是一份参考文档（也就是HTTP/1.0）：

- HTTP/1.0：https://tools.ietf.org/html/rfc1945

HTTP/1.0增加了HEAD和POST方法。增加了可选的HTTP版本号。增加了HTTP头部字段描述请求和响应。增加了3位数的响应码（1xx保留，2xx成功，3xx重定向，4xx客户端错误，5xx服务器错误。）HTTP/1.0已经达到20000单词。

仅仅9个月后，1997年1月HTTP/1.1就发布了。HTTP/1.1很大程度上也是对HTTP/1.0的改进，增加了持久连接、强制服务器头部、更好的缓存和分块编码。为Web的发展奠定了基础。

1999年5月被更新版替代。2014年5月再次被更新。每次更新，之前的版本就废弃了。HTTP/1.1已经长达305页，100000单词。

- HTTP/1.1：
  - https://tools.ietf.org/html/rfc2068
  - https://tools.ietf.org/html/rfc2616
  - https://tools.ietf.org/html/rfc7230 ... https://tools.ietf.org/html/rfc7235

HTTP最初是纯文本协议。HTTP消息是明文发送的。可以被任意截获和查看。HTTPS通过使用TLS（Transport Layer Security）协议对传输消息进行加密

- The Transport Layer Security (TLS) Protocol Version 1.3：https://tools.ietf.org/html/rfc8446

HTTP/1.1是纯文协议，解析不便，而且一个连接只能请求一个资源。随着HTTP请求量越来越大，这种低效越来越明显。尽管人们想出各种方案来提升效率，比如静态资源服务器分片、合并请求，但效果有限，而且会带来新问题。

HTTP/2是对谷歌SPDY的标准化。包括多路利用的字节流、请求优化级和HTTP头部压缩。2012年，HTTP Working Group注意到SPDY的成功，提议制定新版本的HTTP。2015年5月，HTTP/2也就是RFC 7450被批准为正式标准：

- HTTP/2：https://tools.ietf.org/html/rfc7540

因为HTTP/2是基于SPDY的，在此之前，很多浏览器其实已经支持HTTP/2（Firefox、Chrome、Opera），2015年年底前所有浏览器都支持HTTP/2（Internet Explorer 11、Edge、Safari）。

目前HTTP/2通信已经占全球43.8%（https://w3techs.com/technologies/details/ce-http2）。

## Ecma

**Ecma International**成立于1961年，C#、Dart语言由该组织标准化。当然，JavaScript也是由Ecma标准化的。TC39负责ECMA-262，即ECMAScript标准的制定。

- 1997年6月：[ECMA-262 1st edition](https://www.ecma-international.org/publications/files/ECMA-ST-ARCH/ECMA-262,%201st%20edition,%20June%201997.pdf)（110页）
- 1998年8月：[ECMA-262 2nd edition](https://www.ecma-international.org/publications/files/ECMA-ST-ARCH/ECMA-262,%202nd%20edition,%20August%201998.pdf)
- 1999年12月：[ECMA-262 3rd edition](https://www.ecma-international.org/publications/files/ECMA-ST-ARCH/ECMA-262,%203rd%20edition,%20December%201999.pdf)
- ECMA-262 4th edition：不存在
- 2009年12月：[ECMA-262 5th edition](https://www.ecma-international.org/publications/files/ECMA-ST-ARCH/ECMA-262%205th%20edition%20December%202009.pdf)（252页）
- 2011年6月：[ECMA-262 5.1 edition](https://www.ecma-international.org/publications/files/ECMA-ST-ARCH/ECMA-262%205.1%20edition%20June%202011.pdf)
- 2015年6月：[ECMA-262 6th edition](https://www.ecma-international.org/publications/files/ECMA-ST-ARCH/ECMA-262%206th%20edition%20June%202015.pdf)（566页）
- 2016年6月：[ECMA-262 7th edition](https://www.ecma-international.org/publications/files/ECMA-ST-ARCH/ECMA-262%207th%20edition%20June%202016.pdf)（556页）
- 2017年6月：[ECMA-262 8th edition](https://www.ecma-international.org/publications/files/ECMA-ST-ARCH/ECMA-262%208th%20edition%20June%202017.pdf)（885页）
- 2018年6月：[ECMA-262 9th edition](https://www.ecma-international.org/publications/files/ECMA-ST-ARCH/ECMA-262%209th%20edition%20June%202018.pdf)（805页）
- 2019年6月：[ECMA-262.pdf](https://www.ecma-international.org/publications/files/ECMA-ST/ECMA-262.pdf)（764页）

历史版本：https://www.ecma-international.org/publications/standards/Ecma-262-arch.htm

当前版本：https://www.ecma-international.org/publications/standards/Ecma-262.htm

## W3C

W3C，即World Wide Web Consortium（万维网联盟），1994年在美国MIT成立，是Web标准的主要制定者。目前有效的正式推荐标准有近300个（293个）：

- The Latest Recommendation：https://www.w3.org/TR/?status=rec&version=latest

### 概览

- BOM：BOM（Browser Object Model，浏览器对象模型）HTML5规范中有一部分涵盖了BOM的主要内容，因为W3C希望将JavaScript在浏览器中最基础的部分标准化。
  - window对象，也就是ECMAScript中定义的Global对象。网页中所有全局对象、变量和函数都暴露在这个对象上。
  - location对象，通过`location`对象可以以编程方式操纵浏览器的导航系统。
  - navigator对象，对象提供关于浏览器的信息。
  - screen对象，保存着客户端显示器的信息。
  - history对象，提供了操纵浏览器历史记录的能力。
- DOM：DOM（Document Object Model，文档对象模型）是HTML和XML文档的编程接口。DOM表示由多层节点构成的文档，通过它开发者可以添加、删除和修改页面的各个部分。脱胎于网景和微软早期的DHTML（Dynamic HTML，动态HTML），DOM现在是真正跨平台、语言无关的表示和操作网页的方式。
- DOM Level 2和Level 3：DOM1（DOM Level 1）主要定义了HTML和XML文档的底层结构。DOM2（DOM Level 2）和DOM3（DOM Level 3）在这些结构之上加入更多交互能力，提供了更高级的XML特性。实际上，DOM2和DOM3是按照模块化的思路来制定标准的，每个模块之间有一定关联，但分别针对某个DOM子集。这些模式如下所示。
  - DOM Core：在DOM1核心部分的基础上，为节点增加方法和属性。
  - DOM Views：定义基于样式信息的不同视图。
  - DOM Events：定义通过事件实现DOM文档交互。
  - DOM Style：定义以编程方式访问和修改CSS样式的接口。
  - DOM Traversal and Range：新增遍历DOM文档及选择文档内容的接口。
  - DOM HTML：在DOM1 HTML部分的基础上，增加属性、方法和新接口。
  - DOM Mutation Observers：定义基于DOM变化触发回调的接口。这个模块是DOM4级模块，用于取代Mutation Events。
- 动画与canvas图形：requestAnimationFrame及使用`<canvas>`绘制2D图形及使用WebGL绘制3D图形。

以下是对与前端开发相关主要W3C Web标准的筛选，包括CSS、DOM、Graphics、HTML、HTTP、Performance、Security和Web API这几个标签。这些只是目前已经成为推荐标准的部分。还有更多处于WD（Working Draft，工作草案）、CR（Candidate Recommandation，候选推荐标准）、PR（Proposed Recommandation，提议推荐标准）状态的标准草稿，比如Web Payment、Web of Things，甚至关于小程序的提案。

### CSS

1. [CSS Containment Module Level 1](https://www.w3.org/TR/2019/REC-css-contain-1-20191121/)
2. [Selectors Level 3](https://www.w3.org/TR/2018/REC-selectors-3-20181106/)
3. [CSS Fonts Module Level 3](https://www.w3.org/TR/2018/REC-css-fonts-3-20180920/)
4. [CSS Basic User Interface Module Level 3 (CSS3 UI)](https://www.w3.org/TR/2018/REC-css-ui-3-20180621/)
5. [CSS Color Module Level 3](https://www.w3.org/TR/2018/REC-css-color-3-20180619/)
6. [CSS Namespaces Module Level 3](http://www.w3.org/TR/2014/REC-css-namespaces-3-20140320/)
7. [CSS Style Attributes](http://www.w3.org/TR/2013/REC-css-style-attr-20131107/)
8. [Selectors API Level 1](http://www.w3.org/TR/2013/REC-selectors-api-20130221/)
9. [Media Queries](http://www.w3.org/TR/2012/REC-css3-mediaqueries-20120619/)
10. [A MathML for CSS Profile](http://www.w3.org/TR/2011/REC-mathml-for-css-20110607/)
11. [Cascading Style Sheets Level 2 Revision 1 (CSS 2.1) Specification](http://www.w3.org/TR/2011/REC-CSS2-20110607/)
12. [Associating Style Sheets with XML documents 1.0 (Second Edition)](http://www.w3.org/TR/2010/REC-xml-stylesheet-20101028/)
13. [Document Object Model (DOM) Level 2 Style Specification](http://www.w3.org/TR/2000/REC-DOM-Level-2-Style-20001113/)

### DOM

1. [Server-Sent Events](http://www.w3.org/TR/2015/REC-eventsource-20150203/)
2. [Progress Events](http://www.w3.org/TR/2014/REC-progress-events-20140211/)
3. [Element Traversal Specification](http://www.w3.org/TR/2008/REC-ElementTraversal-20081222/)
4. [Document Object Model (DOM) Level 3 Core Specification](http://www.w3.org/TR/2004/REC-DOM-Level-3-Core-20040407/)
5. [Document Object Model (DOM) Level 3 Load and Save Specification](http://www.w3.org/TR/2004/REC-DOM-Level-3-LS-20040407/)
6. [Document Object Model (DOM) Level 3 Validation Specification](http://www.w3.org/TR/2004/REC-DOM-Level-3-Val-20040127/)
7. [XML Events](http://www.w3.org/TR/2003/REC-xml-events-20031014/)
8. [Document Object Model (DOM) Level 2 HTML Specification](http://www.w3.org/TR/2003/REC-DOM-Level-2-HTML-20030109/)
9. [Document Object Model (DOM) Level 2 Style Specification](http://www.w3.org/TR/2000/REC-DOM-Level-2-Style-20001113/)
10. [Document Object Model (DOM) Level 2 Traversal and Range Specification](http://www.w3.org/TR/2000/REC-DOM-Level-2-Traversal-Range-20001113/)
11. [Document Object Model (DOM) Level 2 Views Specification](http://www.w3.org/TR/2000/REC-DOM-Level-2-Views-20001113/)
12. [Document Object Model (DOM) Level 2 Core Specification](http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/)
13. [Document Object Model (DOM) Level 2 Events Specification](http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/)

### Graphics

1. [Graphics Accessibility API Mappings](https://www.w3.org/TR/2018/REC-graphics-aam-1.0-20181002/)
2. [WAI-ARIA Graphics Module](https://www.w3.org/TR/2018/REC-graphics-aria-1.0-20181002/)
3. [HTML Canvas 2D Context](http://www.w3.org/TR/2015/REC-2dcontext-20151119/)
4. [WebCGM 2.1](http://www.w3.org/TR/2010/REC-webcgm21-20100301/)
5. [Scalable Vector Graphics (SVG) Tiny 1.2 Specification](http://www.w3.org/TR/2008/REC-SVGTiny12-20081222/)
6. [Portable Network Graphics (PNG) Specification (Second Edition)](http://www.w3.org/TR/2003/REC-PNG-20031110/)
7. [Mobile SVG Profiles: SVG Tiny and SVG Basic](http://www.w3.org/TR/2003/REC-SVGMobile-20030114/)

### HTML

1. [HTML Media Capture](https://www.w3.org/TR/2018/REC-html-media-capture-20180201/)
2. [HTML 5.2](https://www.w3.org/TR/2017/REC-html52-20171214/)
3. [HTML 5.1 2nd Edition](https://www.w3.org/TR/2017/REC-html51-20171003/)
4. [Encrypted Media Extensions](https://www.w3.org/TR/2017/REC-encrypted-media-20170918/)
5. [Media Source Extensions™](https://www.w3.org/TR/2016/REC-media-source-20161117/)
6. [Web Storage (Second Edition)](http://www.w3.org/TR/2016/REC-webstorage-20160419/)
7. [HTML Canvas 2D Context](http://www.w3.org/TR/2015/REC-2dcontext-20151119/)
8. [XHTML+RDFa 1.1 - Third Edition](http://www.w3.org/TR/2015/REC-xhtml-rdfa-20150317/)
9. [RDFa Core 1.1 - Third Edition](http://www.w3.org/TR/2015/REC-rdfa-core-20150317/)
10. [RDFa Lite 1.1 - Second Edition](http://www.w3.org/TR/2015/REC-rdfa-lite-20150317/)
11. [HTML+RDFa 1.1 - Second Edition](http://www.w3.org/TR/2015/REC-html-rdfa-20150317/)
12. [HTML5 Image Description Extension (longdesc)](http://www.w3.org/TR/2015/REC-html-longdesc-20150226/)
13. [CSS Style Attributes](http://www.w3.org/TR/2013/REC-css-style-attr-20131107/)
14. [Internationalization Tag Set (ITS) Version 2.0](http://www.w3.org/TR/2013/REC-its20-20131029/)
15. [Mobile Web Best Practices 1.0](http://www.w3.org/TR/2008/REC-mobile-bp-20080729/)
16. [Document Object Model (DOM) Level 2 HTML Specification](http://www.w3.org/TR/2003/REC-DOM-Level-2-HTML-20030109/)
17. [Ruby Annotation](http://www.w3.org/TR/2001/REC-ruby-20010531/)

### HTTP

1. [Server-Sent Events](http://www.w3.org/TR/2015/REC-eventsource-20150203/)

### Performance

1. [Trace Context - Level 1](https://www.w3.org/TR/2020/REC-trace-context-1-20200206/)
2. [WebAssembly Core Specification](https://www.w3.org/TR/2019/REC-wasm-core-1-20191205/)
3. [WebAssembly JavaScript Interface](https://www.w3.org/TR/2019/REC-wasm-js-api-1-20191205/)
4. [WebAssembly Web API](https://www.w3.org/TR/2019/REC-wasm-web-api-1-20191205/)
5. [High Resolution Time Level 2](https://www.w3.org/TR/2019/REC-hr-time-2-20191121/)
6. [User Timing Level 2](https://www.w3.org/TR/2019/REC-user-timing-2-20190226/)
7. [Performance Timeline](http://www.w3.org/TR/2013/REC-performance-timeline-20131212/)
8. [Page Visibility (Second Edition)](http://www.w3.org/TR/2013/REC-page-visibility-20131029/)
9. [Navigation Timing](http://www.w3.org/TR/2012/REC-navigation-timing-20121217/)

### Security

1. [Web Authentication:An API for accessing Public Key Credentials Level 1](https://www.w3.org/TR/2019/REC-webauthn-1-20190304/)
2. [Web Cryptography API](https://www.w3.org/TR/2017/REC-WebCryptoAPI-20170126/)
3. [Content Security Policy Level 2](https://www.w3.org/TR/2016/REC-CSP2-20161215/)
4. [Subresource Integrity](http://www.w3.org/TR/2016/REC-SRI-20160623/)
5. [Cross-Origin Resource Sharing](http://www.w3.org/TR/2014/REC-cors-20140116/)

### Web API

1. [WebAssembly JavaScript Interface](https://www.w3.org/TR/2019/REC-wasm-js-api-1-20191205/)
2. [High Resolution Time Level 2](https://www.w3.org/TR/2019/REC-hr-time-2-20191121/)
3. [Pointer Events](https://www.w3.org/TR/2019/REC-pointerevents2-20190404/)
4. [User Timing Level 2](https://www.w3.org/TR/2019/REC-user-timing-2-20190226/)
5. [WebDriver](https://www.w3.org/TR/2018/REC-webdriver1-20180605/)
6. [HTML Media Capture](https://www.w3.org/TR/2018/REC-html-media-capture-20180201/)
7. [Indexed Database API 2.0](https://www.w3.org/TR/2018/REC-IndexedDB-2-20180130/)
8. [Encrypted Media Extensions](https://www.w3.org/TR/2017/REC-encrypted-media-20170918/)
9. [Web Cryptography API](https://www.w3.org/TR/2017/REC-WebCryptoAPI-20170126/)
10. [WebIDL Level 1](https://www.w3.org/TR/2016/REC-WebIDL-1-20161215/)
11. [Media Source Extensions™](https://www.w3.org/TR/2016/REC-media-source-20161117/)
12. [Geolocation API Specification 2nd Edition](https://www.w3.org/TR/2016/REC-geolocation-API-20161108/)
13. [Pointer Lock](https://www.w3.org/TR/2016/REC-pointerlock-20161027/)
14. [Vibration API (Second Edition)](https://www.w3.org/TR/2016/REC-vibration-20161018/)
15. [Web Storage (Second Edition)](http://www.w3.org/TR/2016/REC-webstorage-20160419/)
16. [Web Notifications](http://www.w3.org/TR/2015/REC-notifications-20151022/)
17. [HTML5 Web Messaging](http://www.w3.org/TR/2015/REC-webmessaging-20150519/)
18. [Server-Sent Events](http://www.w3.org/TR/2015/REC-eventsource-20150203/)
19. [Indexed Database API](http://www.w3.org/TR/2015/REC-IndexedDB-20150108/)
20. [Metadata API for Media Resources 1.0](http://www.w3.org/TR/2014/REC-mediaont-api-1.0-20140313/)
21. [Progress Events](http://www.w3.org/TR/2014/REC-progress-events-20140211/)
22. [Performance Timeline](http://www.w3.org/TR/2013/REC-performance-timeline-20131212/)
23. [Page Visibility (Second Edition)](http://www.w3.org/TR/2013/REC-page-visibility-20131029/)
24. [Touch Events](http://www.w3.org/TR/2013/REC-touch-events-20131010/)
25. [Selectors API Level 1](http://www.w3.org/TR/2013/REC-selectors-api-20130221/)
26. [Navigation Timing](http://www.w3.org/TR/2012/REC-navigation-timing-20121217/)
27. [Element Traversal Specification](http://www.w3.org/TR/2008/REC-ElementTraversal-20081222/)

## WHATWG

WHATWG（Web Hypertext Application Technology Working Group，Web超文本应用技术工作组），致力于“Maintaining and evolving HTML since 2004”（维护和推动HTML发展）。

WHATWG目前与W3C合作制定HTML和DOM标准。

> 参见“Memorandum of Understanding Between W3C and WHATWG”（W3C与WHATWG谅解备忘录）：https://www.w3.org/2019/04/WHATWG-W3C-MOU.html

除了HTML和DOM标准，WHATWG也在制定其他Web相关标准。

- HTML Living Standard：https://html.spec.whatwg.org/multipage/
- DOM Living Standard：https://dom.spec.whatwg.org/
- Encoding Living Standard：https://encoding.spec.whatwg.org/
- Fetch Living Standard：https://fetch.spec.whatwg.org/
- Stream Living Standard：https://streams.spec.whatwg.org/
- Console Living Standard：https://console.spec.whatwg.org/

> 更多背景：请自行在互联网上搜索“HTML5设计原理”。

## 小结

Web标准主要由W3C（万维网联盟）负责规划和制定，但IETF、Ecma、WHATWG也是Web标准的重要制定者。Web标准的制定总体上是开放性、国际性的，浏览器厂商和其他Web标准实现者拥有较多话语权，但前端开发者也有很多途径参与Web标准的制定。

Web标准不仅是前端开发必须遵循的规范，也是前端行业发展的基石。任何人，只要希望在前端行业有所成就、有所作为，有所创新，有所突破，不断学习、研究、掌握和实践Web标准绝对是不二法门。从这个意义说，Web标准是所有前端开发者的原力所在，对Web标准了解和掌握的程度，决定了每一个前端从业者的命运。

希望每位同学都能认真学习Web标准，在前端开发领域大显身手。

### 参考资料

- *HTTP/2 in Action*（2019，Manning）
- *Professional JavaScript for Web Developers 4th Edition*（2019，John Wiley & Sons, Inc.）