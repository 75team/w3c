> 基于Exchange Web Service 和 ThinkJS 实现定时发邮件功能。

最近开发一个项目，需要在Node.js程序里实现定期给管理员发邮件的功能。

笔者平时只会在Web界面收发邮件。对邮件的原理完全不懂（可能大学教过，然而全忘了），直到要解决这个问题。请教了几个业务的同事，得到的答复是：“你需要搭一个SMTP服务，还要装一个mail agent，巴拉巴拉……” 你们在说什么，我瞎了听不见……

![](https://p2.ssl.qhimg.com/t01046170a456027797.jpg)

听起来很复杂，有没有开箱即用的服务啊？一打听还真有。同事告知我司有提供Exchange服务。笔者的内心独白：“Exchange啊，我见过，跟outlook什么关系？”。好在最后还是在同事的帮助下，冰雪聪明的笔者实现了这个功能。踩了一些坑，记录一下，顺便复习一下基础知识。

## 名词解释

以上提到的那些名词我一个也没听懂，直到做完这个功能。先给大家解释一下：

- SMTP。简单邮件传输**协议**。实际常用于在不同的邮件服务器之间传输邮件。
- IMAP/POP。两者都是用于在本地查收邮件的**协议**。POP需要将邮件下载到本地存储。IMAP是POP的增强版，更偏云端一些，邮件存储在服务器，可以多设备访问。
- Email Agent。在邮件各个传输链路上的具体**程序**。可以理解成协议的实现者。

下面是一个传统的邮件从发送到接收的过程：

![](https://upload.wikimedia.org/wikipedia/commons/a/af/Schema_of_e-mail_delivery.png)

（图片来源：[维基百科](https://en.wikipedia.org/wiki/Email_agent_(infrastructure) )）

第一个教我的同事实际上是让我去安装图中各个小矩形里的具体程序（比如MUA，MSA，MTA，MRA），它们都是email agent。可以不恰当地将它们比喻成邮局的各个部门。

从图中可以看到SMTP主要用于发送邮件，而IMAP和POP主要用于本地获取查看邮件。

好，科普结束。以上内容跟本文主题无直接关系，逃……

下面是本文的主角：

## Exchange Web Service

先解释一下Exchange服务，它是微软开发的一个邮件和日历服务，运行在Windows Server操作系统上。它不同于SMTP和IMAP/POP等，并不是一个简单的协议，而是微软自己实现的一套服务。

而Exchange Web Service（简称EWS），是应用跟Exchange服务器通信的一种方式。简单地说，当你使用Exchange提供的邮件服务时，可以使用EWS发送或者接收邮件等。不过微软已经在2018年7月宣布停止在产品和功能上更新EWS，它推荐使用Microsoft Graph来访问邮箱服务。这不重要，因为已经安装的EWS不受影响，可以继续使用。

看看Exchange的架构（示例为Exchange on-premise版本，除此之外它还有online版）。

![](https://docs.microsoft.com/zh-cn/exchange/client-developer/exchange-web-services/media/ex2013_architecturesoverview.png)



（图片来源：[EWS应用和Exchange的架构](https://docs.microsoft.com/zh-cn/exchange/client-developer/exchange-web-services/ews-applications-and-the-exchange-architecture)）

回顾一下开头提到的场景，结合实际情况（即公司已有Exchange服务），要解决发邮件的问题只需关注图中的1、2、3。

可以把Node.js程序看做图中的EWS应用，它需要调用EWS的API跟Exchange服务器通信，从而实现发邮件的功能。

我们实现一个EWS发送邮件的程序需要实现两点：

- 鉴权。校验身份。
- 发送。将邮件内容发出去。

下面看看具体实现。

## 一个基于EWS的Node.js发邮件程序

微软官网提供了一套EWS Managed API，用于调用EWS的接口。但是很遗憾，它不支持Node.js。不过github上有Node.js版本：ews-javascript-api，可以直接从npm上安装。笔者最终没有用它，因为只是一个小小的发邮件功能，不必用这么全的第三方库。(其实是懒得看文档了)。

推荐EWS的同事使用了一个叫exchange-web-service的库，非常简单。不过笔者在使用的时候踩到了坑，后来看了一遍该库的代码，改进了一版代码，最终解决了问题，顺便加深了对EWS的理解。

先说说坑：

发邮件程序被设计成了一个接口（ThinkJS程序里的一个action）。这个接口需要先查数据库，按条件筛选出收件人。然后调用exchange-web-service库的方法，将邮件发送给筛选出来的收件人。伪代码如下：

```js
import ews from 'exchange-web-service';
// 配置邮箱帐号
ews.config('mail_account', 'mail_password', "https://mail_domain/Ews/Exchange.asmx", "mail_domain");

async checkNotifyUsersAction() {
  // 只允许命令行执行
  if (!this.isCli) { return this.fail("only allow invoked in cli mode"); }
  // 筛选收件人
  const recipients = await this.modelInstance.getRecipients();
  const title = '标题';
  const msg = `<![CDATA[ 你好 ]]>`;
  // 发件
  ews.sendMail(email, title, msg);
}
```

注意，这里`ews.sendMail`是没有被“await”的，因为这个库不支持promise，那么它能不能将邮件发送成功呢？当然不能。并且在调试的时候发现，先调用`ews.sendMail`，再执行筛选收件人的操作，就能收到邮件。为什么放在最后不行？

经过分析，发现ews.sendMail本身是异步操作，而筛选收件人的await能够hold住整个action的执行，为ews.sendMail的异步操作争取了时间，所以能发送成功。如果将sendMail放到最后执行，进程结束了，发送邮件的操作就终止了。

解决办法很简单，将这个库的接口都改为async/await方式。并将原先的调用方法改为`await ews.sendMail(email, title, msg);`即可。

根据这个库梳理了调用EWS的流程。

### Node.js调用EWS的原理

再解释两个名词：

- SOAP。是一种消息格式（本质是XML）。用特定的结构和标签约定了消息的格式，比如`<soap:Envelope>`、`<soap:Header>`、`<soap: Body>`。EWS使用SOAP来传递消息和指令。
- NTML。一种认证方式。用于鉴别访问者具有系统访问权限。EWS不止有一种认证方式，NTLM只是其中一种。

下面动手实现调用EWS的Node.js程序。

首先，构造SOAP格式的邮件内容。一个发送邮件的SOAP如下所示：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:m="http://schemas.microsoft.com/exchange/services/2006/messages" 
               xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <t:RequestServerVersion Version="Exchange2010" />
  </soap:Header>
  <soap:Body>
    <m:CreateItem MessageDisposition="SendAndSaveCopy">
      <m:SavedItemFolderId>
        <t:DistinguishedFolderId Id="sentitems" />
      </m:SavedItemFolderId>
      <m:Items>
        <t:Message>
          <t:Subject>测试</t:Subject>
          <t:Body BodyType="HTML">你好</t:Body>
          <t:ToRecipients>
            <t:Mailbox>
                <t:EmailAddress>recipient@example.com</t:EmailAddress>
            </t:Mailbox>
          </t:ToRecipients>
        </t:Message>
      </m:Items>
    </m:CreateItem>
  </soap:Body>
</soap:Envelope>
```



当然，EWS提供的远不止发邮件这么简单的功能。更多操作请参考官方文档。

构造完邮件内容之后，需要借助一个npm包：httpntlm。它实现了鉴权并发送邮件内容的功能。调用方法如下所示：

```js
httpntlm.post({
  username: 'xxx',
  password: 'xxx',
  domain: 'xxx',
  url: 'xxx',
  content: '' // SOAP邮件内容
})
```



### ThinkJS实现定时任务

发邮件的功能完成了，需要实现定时功能。定时功能当然要借助crontab啦。ThinkJS只需要几行配置就能搞定crontab，不用开发者多操心。参考文档：https://thinkjs.org/zh-cn/doc/3.0/crontab.html

问题来了，如何保证邮件不重复发送（即定时任务不重复执行）。

首先，config/crontab.js(ts)要配置`type: 'one'`。这样能保证在开多个worker的时候只有一个worker会执行定时任务。

其次，如果项目部署在多台机器，要保证只有一个机器能执行定时任务，这个可以通过环境变量来实现，比如当`process.env.CRONTAB`为`1`的时候才开启。可以在将代码部署到线上的时候匹配特定的机器名，并在这台机器的部署命令中设置参数` CRONTAB=1 `。

config/crontab.js代码如下：

```js
module.exports = [{
  immediate: false,
  cron: '0 14 * * 4,5',
  handle: 'api/crontab/xxx',
  type: 'one',
  enable: process.env.CRONTAB == '1'
}];
```

## 总结

本文介绍了邮件的基本原理和流程，EWS的用法，以及ThinkJS开发定时任务的注意事项。在开发过程中，顺带理解了SOAP、NTLM等协议。邮件功能还有其他开源的解决办法，比如基于SMTP等协议的开源项目nodemailer。希望本文能给大家带来启发，祝写码开心~

## 参考

[阮一峰：如何验证 Email 地址：SMTP 协议入门教程](http://www.ruanyifeng.com/blog/2017/06/smtp-protocol.html)

[JavaMail学习笔记（一）、理解邮件传输协议（SMTP、POP3、IMAP、MIME）](https://blog.csdn.net/xyang81/article/details/7672745)

[Microsoft NTLM文档](https://docs.microsoft.com/en-us/windows/desktop/secauthn/microsoft-ntlm)
