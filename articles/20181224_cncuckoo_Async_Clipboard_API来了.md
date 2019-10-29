# Async Clipboard API来了

如果我问：你知道“剪贴板”（clipboard）吗？

恐怕没人不知道。我们每天都不知道自己要在电脑或手机上“复制”、“粘贴”多少回。每次“复制”、“粘贴”的背后，都会用到“剪贴板”。

根据“维基百科”：

The clipboard is a data buffer used for short-term data storage and/or data transfer between documents or applications used by cut, copy and paste operations and provided by the operating system. 

翻译一下：

剪贴板是一种数据缓存，用于文档或应用间短期数据的存储/转移，在用户执行剪切、复制和粘贴操作时会用到，由操作系统提供。

这里最重要的一点在于，“剪贴板”是“由操作系统提供”的，因此它是系统级的一个软件特性。

对于前端开发者来说，如果我问：你知道怎么操作“剪贴板”吗？

很多人的第一反应可能是：使用clipboard.js吧……

clipboard.js的原理

clipboard.js（https://clipboardjs.com/）是在Github上有24000多个星，其流行程度可见一斑。关于这个库的用法，大家可以自己去看，我们这里主要分析其实现原理，以便了解目前操作剪贴板的主流技术。

简单来说，clipboard.js利用了两个已有的Web API（前者属于HTML5，后者属于HTML Editing API）：

- HTMLInputElement.select()
- document.execCommand()

相应地，原理也只有两步。

第一步，创建临时的texterea元素、通过CSS隐藏起来，然后把要复制的文本赋值给这个文本区，再选择这个文本区中的所有内容：

    // https://github.com/zenorocha/clipboard.js/blob/master/src/clipboard-action.js
    /**
     * Creates a fake textarea element, sets its value from `text` property,
     * and makes a selection on it.
     */
    // selectFake()
    // 创建临时的texterea元素
    this.fakeElem = document.createElement('textarea');
    // 隐藏这个元素
    this.fakeElem.style.position = 'absolute';
    this.fakeElem.style[ isRTL ? 'right' : 'left' ] = '-9999px';
    // 把要复制的文本赋给文本区并选择全部内容
    this.fakeElem.value = this.text;
    this.selectedText = select(this.fakeElem);
    // 触发复制
    this.copyText();

第二步，通过脚本触发copy操作，如果成功则文本会写入剪贴板，然后根据执行结果派发自定义事件：

    // https://github.com/zenorocha/clipboard.js/blob/master/src/clipboard-action.js
    /**
     * Executes the copy operation based on the current selection.
     */
    // copyText()
    succeeded = document.execCommand(this.action);
    this.handleResult(succeeded);
    
    /**
      * Fires an event based on the copy operation result.
      * @param {Boolean} succeeded
      */
    handleResult(succeeded) {
        this.emitter.emit(succeeded ? 'success' : 'error', {
            action: this.action,
            text: this.selectedText,
            trigger: this.trigger,
            clearSelection: this.clearSelection.bind(this)
        });
    }

如前所述，剪贴板是由操作系统提供的，是系统级的。浏览器厂商为安全和用户体验考虑，只信任用户通过应用、文档或脚本触发的复制操作。而且，复制到剪贴板的内容来源还必须是已有的DOM元素。

以上复制操作的结果是将文本内容写入剪贴板。如果要读取剪贴板中的内容，必须给粘贴（paste）事件操作注册处理程序，通过e.clipboardData.getData()方法获取剪贴板中的内容。这样可以在用户把内容粘贴到目标输入框之前，对剪贴板上的内容进行一些预处理。但这不是本文的重点。

虽然clipboard.js使用的这种技术几乎所有浏览器都支持，但也存在诸多缺陷。

已有技术的缺陷

以前的技术存在什么失陷呢？除了前面需要通过编程方式通过execCommand模拟用户触发剪贴板的复制操作之外，还有：

- execCommand的初衷是编辑DOM，而且浏览器间实现存在不少差异
- 复制粘贴操作是同步的，会阻塞主线程，导致页面无法响应
- 如果进而再弹窗申请授权，则可能会惹恼用户
- 相应地，妨碍对某些类型的数据（如图片）进行无害化处理或转码操作
- 而为避免外部利用，有时候转码又是必需的

为了克服这些问题，W3C开始着手制定相关标准：Clipboard API and events（https://www.w3.org/TR/clipboard-apis/）。

Clipboard API and events定义了Async Clipboard API，相应地增加了clipboardchange事件。

Async Clipboard API

换句话说，为避免阻塞主线程，这个新标准引入了基于Promise的异步剪贴板API。由于剪贴板是系统级软件特性，所以相应的API挂载到了navigator上面：

    navigator.clipboard

这个clipboard对象有4个方法：

    Promise<DataTransfer> read();
    Promise<DOMString> readText();
    Promise<void> write(DataTransfer data);
    Promise<void> writeText(DOMString data);

两个读剪贴板，两个写剪贴板。

支持读写以下数据类型：

- text/plain
- text/uri-list
- text/csv
- text/css
- text/html
- application/xhtml+xml
- image/png
- image/jpg, image/jpeg
- image/gif
- image/svg+xml
- application/xml, text/xml
- application/javascript
- application/json
- application/octet-stream

read()

    navigator.clipboard.read().then(function(data) {
      for (var i = 0; i < data.items.length; i++) {
        if (data.items[i].type == "text/plain") {
          console.log("Your string: ", data.items[i].getAs("text/plain"));
        } else {
          console.error("No text/plain data on clipboard.");
        }
      }
    });

readText()

    navigator.clipboard.readText().then(function(data) {
      console.log("Your string: ", data);
    });

write(data)

    var data = new DataTransfer();
    data.items.add("text/plain", "Howdy, partner!");
    navigator.clipboard.write(data).then(function() {
      console.log("Copied to clipboard successfully!");
    }, function() {
      console.error("Unable to write to clipboard. :-(");
    });

writeText(data)

    navigator.clipboard.writeText("Howdy, partner!").then(function() {
      console.log("Copied to clipboard successfully!");
    }, function() {
      console.error("Unable to write to clipboard. :-(");
    });

注意事项

1. navigator.clipboard只能在“安全上下文”中使用。什么是“安全上下文”？简单说，就是locahost和HTTPS环境下。（可以通过window.isSecureContext属性取得。）
2. 桌面浏览器中目前只有Chrome、Firefox和Opera支持，Safari和IE/Edge还不支持；而且，Chrome也只支持readText()和writeText()。

参考链接：

- https://clipboardjs.com/
- https://www.w3.org/TR/clipboard-ap
- https://developers.google.com/web/updates/2018/03/clipboardapi
- https://w3c.github.io/webappsec-secure-contexts
