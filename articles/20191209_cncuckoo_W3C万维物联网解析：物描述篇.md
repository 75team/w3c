# W3C万维物联网解析：物描述篇

2019年10月21日，作者在[“W3C万维物联网标准简介”](https://mp.weixin.qq.com/s/cDrjKQ_YhpmVCA7BD2xNfQ)一文中简单介绍了W3C Web of Things（WoT）工作组制定的WoT标准以及它们的最新状态：

| 规范                                    | 当前状态           |
| --------------------------------------- | ------------------ |
| WoT Architecture                        | CR                 |
| WoT Thing Description                   | CR                 |
| WoT Scripting API                       | WD，Working Draft  |
| WoT Binding Templates                   | Working Group Note |
| WoT Security and Privacy Considerations | Working Group Note |

本系列将从WoT标准本身出发，对目前已经进入CR阶段（W3C标准的阶段参见下图）的WoT Architecture（WoT架构）、WoT Thing Description（WoT物描述）以及处于WD阶段的WoT Scripting API（WoT编程API）进行一次快速解析。

如下图所示，标准进入CR阶段意味着内容已经相对稳定，WD阶段则意味着较大的不确定性，而Working Group Note（工作组备忘）则变数很大。因此处于CR阶段的“架构”和“物描述”是值得花时间了解的（成为正式推荐标准REC的可能性很大），而处于WD阶段的编程API最近（2019年10月28日）刚刚做了一次大的内容改版，几乎完全废弃了上一版的内容，只能说接近稳定状态，但编程API始终是开发者所喜闻乐见的，所以本系列也会介绍。

![](https://p5.ssl.qhimg.com/t01a681425860dcff64.png)

> W3C Process Document，<https://www.w3.org/2019/Process-20190301/#recs-and-notes>



## 1. 物描述简介

WoT物描述，即Thing Description，简称TD，是WoT的核心组件。顾名思义，物描述（TD）就是对物的描述，其序列化（文本化）形式是一个JSON文档。

简单起见，可以将TD看成是描述物及其能力的入口（就像一个网站的index.html）。一个TD的实例由4个部分组成：关于物体本身的元数据、表示如何使用物体的交互可识别功能、方便机器理解的数据交互模式和与物体相关的其他物体或资源的链接。

WoT交互模型定义了三种交互可识别功能：属性、动作和事件 。其中，属性（在TD中以[`PropertyAffordance`](https://www.w3.org/TR/wot-thing-description/#propertyaffordance)类表示），可用于检测和控制参数，如取得当前属性的值或设置某个操作状态。动作（在TD中以[`ActionAffordance`](https://www.w3.org/TR/wot-thing-description/#actionaffordance) 类表示），对物理（因而耗时的）流程建模，也可用于抽象类似RPC的对既有平台的调用。事件（在TD中以[`EventAffordance`](https://www.w3.org/TR/wot-thing-description/#eventaffordance)类表示），用于推送通信模型，异步将通知、离散事件或值流发送给接收者。详情可参考WoT架构。

TD提供由URI模式（如`http`、`coap`等）标识的不同协议绑定的元数据、基于媒体类型（如`application/json`、 `application/cbor`）的内容类型和安全机制（用于认证、授权、保密等）。TD实现的序列化是基于[JSON](https://tools.ietf.org/html/rfc8259)的，其中JSON中的名称（属性/字段）引用预定义词汇表中的术语，同样也在WoT物描述标准中定义。此外，TD的JSON序列化遵循[JSON-LD 1.1](https://www.w3.org/TR/json-ld11/)语法，可以方便扩展和进行富语义处理。

下面展示了一个TD的示例，描述了名称为MyLampThing的物体。

```json
{
    "@context": "https://www.w3.org/2019/wot/td/v1",
    "id": "urn:dev:ops:32473-WoTLamp-1234",
    "title": "MyLampThing",
    "securityDefinitions": {
        "basic_sc": {"scheme": "basic", "in":"header"}
    },
    "security": ["basic_sc"],
    "properties": {
        "status" : {
            "type": "string",
            "forms": [{"href": "https://mylamp.example.com/status"}]
        }
    },
    "actions": {
        "toggle" : {
            "forms": [{"href": "https://mylamp.example.com/toggle"}]
        }
    },
    "events":{
        "overheating":{
            "data": {"type": "string"},
            "forms": [{
                "href": "https://mylamp.example.com/oh",
                "subprotocol": "longpoll"
            }]
        }
    }
}
```

没错，这就是一个标准的JSON文档。

看了这个TD示例，我们知道有一个名为`status`的**属性可识别功能**。而且，还有额外信息表明可以通过（安全形式的）HTTP协议的GET方法访问URI https://mylamp.example.com/status（在`forms`结构的`href`成员中声明）来访问这个属性，返回的是一个字符串值。使用GET方法并未明确说明，而是本文档定义一个假设默认值。

类似地，这个TD还指定了一个**动作可识别功能**，用于以POST方法请求资源https://mylamp.example.com/toggle来切换开关状态。这里的POST方法则是调用动作的一个默认假设值。

还有一个**事件可识别功能**，表示物体具有发送异步消息的机制。在此，通过使用HTTP的长轮询子协议轮询https://mylamp.example.com/oh，可以获得灯可能过热的事件。

这个例子也规定了一个**基本的安全模式**，即要求用户名和密码才能访问。注意，安全模式的名称首先在`securityDefinitions`中给出，然后通过在`security`项指定来激活。结合HTTP协议，这个例子示范了**HTTP Basic Authentication**的应用。至少一个顶级安全模式是强制性的，它是访问每个资源的默认条件。

**物描述支持在某些命名空间中添加上下文相关的定义。**这种机制可用于在物描述实例的内容中集成额外的语义，只要在给定命名空间下可以找到特定应用领域的规范信息（如逻辑规则）即可。

下面的例子扩展了前面的TD，在`@context`项中增加了第二个定义，声明以`saref`前缀来引用SAREF词汇表的命名空间。**SAREF词汇表包含描述照明设备及其他家居自动化设备的术语，这样术语可以作为`@type`属性中的语义标签嵌入在TD内**。在这个例子中，物体被打上了`saref:LightSwitch`标签，`status`属性可识别功能的表单被打上了`saref:GetCommand`的标签，`toggle`动作可识别功能的表单被打上了`saref:ToggleCommand`的标签，`overheating`事件可识别功能被打上了`saref:NotifyComman`的标签。

```json
{
    "@context": [
        "https://www.w3.org/2019/wot/td/v1",
        { "saref": "https://w3id.org/saref#" }
    ],
    "id": "urn:dev:ops:32473-WoTLamp-1234",
    "title": "MyLampThing",
    "@type": "saref:LightSwitch",
    "securityDefinitions": {"basic_sc": {
        "scheme": "basic",
        "in": "header"
    }},
    "security": ["basic_sc"],
    "properties": {
        "status": {
            "@type": "saref:OnOffState",
            "type": "string",
            "forms": [{
                "href": "https://mylamp.example.com/status"
            }]
        }
    },
    "actions": {
        "toggle": {
            "@type": "saref:ToggleCommand",
            "forms": [{
                "href": "https://mylamp.example.com/toggle"
            }]
        }
    },
    "events": {
        "overheating": {
            "data": {"type": "string"},
            "forms": [{
                "href": "https://mylamp.example.com/oh"
            }]
        }
    }
}
```

## 2. 命名空间

如前所述，物描述或TD的直观表示就是一个JSON-LD文档，而这个JSON文档中的名称（属性）来自预定义的几个词汇表。所有这些词汇表中的术语之间的关系，由物描述规范的信息模型定义。当前，物描述信息模型的版本由如下IRI定义：

https://www.w3.org/2019/wot/td/v1

物描述信息模型中用到的其他几个词汇表如下：

| 词汇表     | 命名空间IRI                              |
| ---------- | ---------------------------------------- |
| 核心       | https://www.w3.org/2019/wot/td#          |
| 数据模式   | https://www.w3.org/2019/wot/json-schema# |
| 安全       | https://www.w3.org/2019/wot/security#    |
| 超媒体控件 | https://www.w3.org/2019/wot/hypermedia#  |

## 3. 信息模型

TD信息模型构建于以下相互独立的词汇表之上：

- 核心TD词汇表，反映属性、动作和事件等交互可识别功能的交互模型；
- 数据模型词汇表，包括JSON Schema定义的部分术语；
- WoT安全词汇表，标识安全机制和配置要求；
- 超媒体控件词汇表，使用Web链接和表单编码REST风格通信的主要规范。

以上这些词汇表本质上都是一套术语，可以用来构建数据结构，在传统面向对象意义上可以理解为对象。对象是类的实例，拥有属性。在WoT的语境下，对象指的是物体及其交互可识别功能。

以下UML图展示了TD信息模型的概要，其中的表格表示类。从`Thing`类开始，带箭头的曲线表明了类之间的关系。为方便阅读，我们将全图分成4部分，每部分对应一个基本的词汇表。

![](https://p2.ssl.qhimg.com/t01b102a390b0e2f630.png)

**图1 TD核心词汇表**

![](https://p1.ssl.qhimg.com/t01ae6f0b663b9919a4.png)

**图2 JSON模式词汇表**



![](https://p0.ssl.qhimg.com/t01c38d9c634d41bb4d.png)

**图3 WoT安全词汇表**

![](https://p3.ssl.qhimg.com/t013336cc62a7e17c44.png)

**图4 超媒体控件词汇表**

### 3.1 预定义内容

为了让TD信息模型既适合树形文档的简单规则处理（即原始JSON处理）又适合富语义Web工具处理（如JSON-LD处理），物描述规范作出了一系列正式定义，以供构建TD信息模型。

下文中所有定义都会用到“集”（set）。直观来讲，集就是一组元素的集合，而其中的元素自身也可以是一个集。任何复杂的数据结构都可以以集来定义。特别地，**对象**是一个像下面这样递归定义的数据结构：

- 一个术语，可能属于也可以不属于某个词汇表，是一个对象。
- 一组名值对，其中名称是一个术语，而值是另一个对象，也是一个对象。

虽然以上定义不能避免对象包含同名名值对，但物描述规范通常不会考虑重名问题。元素名称都是数值的对象称为**数组**。类似地，元素名称都是（不属于任何词汇表的）术语的对象称为**映射**。映射包含的名值对中的所有名称在映射作用域内假设是唯一的。

另外，对象可以是某个类的实例。类（由一个词汇表术语表示）会使用被称为**签名**的一组词汇表术语预先定义。签名为空的类称为简单类型。

类的签名支持构建两个函数以进一步定义类：赋值函数和类型函数。类的赋值函数以构成类签名的词汇表术语作为参数，返回`true`或`false`。简单地理解，赋值函数的返回值表明签名中的元素在类实例化时是必需的还是可选的。类的类型函数同样以构成类签名的词汇表术语作为参数，返回另一个（表示该术语类型的）类。这两个函数是局部的（*partial*），即它们的作用域被限定为类签名。

在这两个函数的基础上，可以定义一个对象和类的实例关系（Instance Relation）。这个关系表示必须满足的约束。换句话说，如果满足下列两个条件，就可以说一个对象是一个类的实例。

- 对每一个类的赋值函数返回`true`的术语，对象都包含一个以该词汇表术语作为名称的名值对；
- 对每一个在对象名值对中被用作名称的类签名词汇表术语，这个名值对的值都是以该词汇表术语作为参数的该类的类型函数返回的类的实例。

根据以上定义，对象是所有简单类型的实例，无论其结构如何。为此，我们也为简单类型定义了一个实例关系：如果对象是一个符合给定词法形式（如`boolean`类型的`true`、`false`，`unsignedInt`类型的`1`、`2`、`3`等）的术语，则称其为相应简单类型的实例。

此外，基于通用的映射和数组结构可以派生出**限定类/参数化类**。说某对象是某个类的映射，或者是被某个类限定后映射的实例，那么这个对象作为映射，它包含的所有名值对的值都必须是这个类的实例。同样，对数组也一样。

最后，如果一个类的所有实例也都是另一个类的实例，则称前一个类为后一个类的**子类**。

有了以上定义，就可以将TD信息模型理解为一组类定义，包含一个类名（词汇表术语）、一个签名（一组词汇表术语）、一个赋值函数和一个类型函数。这些类定义分别由5.3节“类定义”中的多个表给出。每个表“赋值”列中的值“必需”或“可选”表示赋值函数对相应的词汇表术语返回`true`或`false`。

按照约定，简单类型由小写字母开头的名称表示。TD信息模型引用如下在XML Schema中定义的简单类型：`string`、`anyURI`、`dateTime`、`integer`、`unsignedInt`、`double`和`boolean`。它们的定义（如它们的词法形式的规范）超出了TD信息模型的范围。

另外，TD信息模型还定义了一个与词汇表术语对应的全局函数。这个函数接收一个类名和另一个词汇表术语作为参数，返回一个对象。如果返回的对象不是`null`，则该对象表示对该类实例的该词汇表术语赋值时使用的默认值。这个函数可以放宽前面提到的赋值函数的约束：**如果对象包含所有必需的赋值且未赋值的有默认值，则该对象就是某个类的实例。**所有默认值在“3.3 默认值定义”中的表里给出。在“3.2 类定义”的每个表中，如果TD信息模型中相应类与词汇表术语的组合有默认值，则“赋值”列的值就是“有默认值”。

这里引入的形式化不考虑作为抽象数据结构的对象与物理世界对象如物体之间可能存在的关系。不过，物描述规范也考虑到了TD信息模型在作为RDF资源集成到物理世界中更大的模型（ontology，存在）时需要重新解释所有词汇的可能性。规范的附录D.2“物描述存在”对此给出了解决方案。

### 3.2 举例：Thing

如前所述，TD信息模型定义了4个词汇表：核心词汇表、数据模式词汇表、安全词汇表和超媒体控件词汇表。

为简单起见，本文仅以核心词汇表中的`Thing`为例，介绍与`Thing`相关的词汇表术语。

`Thing`是对物或虚拟实体的抽象，其元数据和接口由WoT物描述来描述。虚拟实体是一或多个物的组合体。

| 词汇表术语          | 描述                                                         | 赋值 | 类型                     |
| ------------------- | ------------------------------------------------------------ | ---- | ------------------------ |
| @context            | JSON-LD关键字，定义在TD文档中使用被称为术语的简写名称        | 必需 | anyURI或数组             |
| @type               | JSON-LD关键字，用语义标记（或类型）给对象打上标签            | 可选 | string或string数组       |
| id                  | 物体的唯一标识符（URI，如自定义URN）                         | 必需 | anyURI                   |
| title               | 默认语言的人类友好的名称（在UI上显示的文本）                 | 必需 | string                   |
| titles              | 多语言人类友好的名称（以不同语言在UI上显示的文本）           | 可选 | MultiLanguage            |
| description         | 默认语言的人类友好的附加信息                                 | 可选 | string                   |
| descriptions        | 多语言人类友好的附加信息                                     | 可选 | MultiLanguage            |
| version             | 版本信息                                                     | 可选 | VersionInfo              |
| created             | 创建TD实例的时间                                             | 可选 | dateTime                 |
| modified            | 最后一次修改TD实例的时间                                     | 可选 | dateTime                 |
| support             | 以URI模式（如mailto、tel）表示的TD维护者的信息               | 可选 | anyURI                   |
| base                | 为TD文档中所有相对URI定义基准URI。在TD实例中，所有相对URI都使用RFC3986中定义的算法相对于基准URI解析<br />base不影响@context中使用的URI，以及在对TD实例进行语义处理时链接数据中使用的IRI | 可选 | anyURI                   |
| properties          | 物体所有基于属性的交互可识别功能                             | 可选 | PropertyAffordance的映射 |
| actions             | 物体所有基于动作的交互可识别功能                             | 可选 | ActionAffordance的映射   |
| events              | 物体所有基于事件 的交互可识别功能                            | 可选 | EventAffordance的映射    |
| links               | 指向与与TD相关的任意资源的Web链接                            | 可选 | Link的数组               |
| forms               | 描述如何执行操作的一组超媒体控件。表单是协议绑定序列化之后的形式。在当前TD版本中，所有可以在物体级别描述的操作均为一次性批量操作的物体属性 | 可选 | Form的数组               |
| security            | 从securityDefinitions中选取的安全定义的名称。访问资源时必须全部满足 | 必需 | string或string数组       |
| securityDefinitions | 安全配置（仅定义）名称的集合。除非在security项中使用，否则不会真正应用 | 必需 | SecurityScheme的映射     |

其他词汇表及词汇，有兴趣的读者可以自行参考WoT物描述规范。

## 4. 扩展阅读

关于W3C成立WoT工作组制定WoT标准的初衷，可以参考该文章。

- [W3C万维物联网解析：架构篇](https://mp.weixin.qq.com/s/xUANOpmJ22GmYWJcs4fgvQ)
- [“W3C万维物联网标准简介”](https://mp.weixin.qq.com/s/cDrjKQ_YhpmVCA7BD2xNfQ)
- 知乎用户“尧以俊德”的回答：<https://www.zhihu.com/question/26469697/answer/537098445>

## 5. 相关链接

- WoT Architecture：https://www.w3.org/TR/wot-architecture/
- WoT Thing Description：https://www.w3.org/TR/wot-thing-description/
- WoT Scripting API：https://www.w3.org/TR/wot-scripting-api/
- WoT Binding Templates:https://www.w3.org/TR/wot-binding-templates/
- WoT Security and Privacy Considerations：https://www.w3.org/TR/wot-security/
- WoT兴趣组：https://www.w3.org/2019/07/wot-ig-2019.html
- WoT工作组：https://www.w3.org/2016/12/wot-wg-2016.html