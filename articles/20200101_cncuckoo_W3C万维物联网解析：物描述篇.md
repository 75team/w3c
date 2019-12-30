# W3C万维物联网解析：编程API篇

2019年10月21日，作者在[“W3C万维物联网标准简介”](https://mp.weixin.qq.com/s/cDrjKQ_YhpmVCA7BD2xNfQ)一文中简单介绍了W3C Web of Things（WoT）工作组制定的WoT标准以及它们的最新状态：

| 规范                                    | 当前状态           |
| --------------------------------------- | ------------------ |
| WoT Architecture                        | CR                 |
| WoT Thing Description                   | CR                 |
| WoT Scripting API                       | WD，Working Draft  |
| WoT Binding Templates                   | Working Group Note |
| WoT Security and Privacy Considerations | Working Group Note |

本系列将从WoT标准本身出发，对目前已经进入CR阶段（W3C标准的阶段参见下图）的WoT Architecture（WoT架构）、WoT Thing Description（WoT物描述）以及处于WD阶段的WoT Scripting API（WoT编程API）进行一次快速解析。

如下图所示，标准进入CR阶段意味着内容已经相对稳定，WD阶段则意味着较大的不确定性，而Working Group Note（工作组备忘）则变数很大。因此处于CR阶段的“架构”和“物描述”是值得花时间了解的（成为正式推荐标准REC的可能性很大），而处于WD阶段的编程API在2019年10月28日做了一次大的内容改版，几乎完全废弃了上一版的内容，只能说接近稳定状态，但编程API始终是开发者所喜闻乐见的，所以本系列也会介绍。

![](https://p5.ssl.qhimg.com/t01a681425860dcff64.png)

> W3C Process Document，<https://www.w3.org/2019/Process-20190301/#recs-and-notes>



## 1. 编程API简介

WoT Scripting API描述如何通过脚本暴露和消费物体，同时定义了通用的物发现API。基于WoT架构定义的“消费体”（consumed thing）和“暴露体”（consumed thing），这个规范提供了不同层次的交互操作能力。

首先，客户端通过消费TD（Thing Description）可以创建一个本地运行时资源模型，即消费体。消费体支持访问远程设备上的服务端物体暴露的属性、动作和事件。

其次，服务端负责暴露物体，为此需要：

- 定义TD
- 初始化一个实现该TD所定义WoT接口的软件栈，以服务于对暴露属性、动作和事件的请求
- 最终发布TD（比如发布到一个物体目录，以便消费者发现）

## 2. 支持的场景

编程API支持以下脚本使用场景。

### 2.1 消费物

- 消费物体的TD，如基于暴露WoT交互的TD创建一个编程对象：
  - 读取一或多个属性的值
  - 设置一或多个属性的值
  - 观察属性值的变化
  - 调用动作
  - 观察物体发出的事件
  - 推断（内省）TD，包括基于TD链接的资源

### 2.2 暴露物

- 暴露物体包括生成协议绑定以便访问底层功能
- 基于提供的字符串序列化格式的TD或既有物体对象创建本地要暴露的物体
- 给物体添加属性定义
- 从物体删除属性定义
- 给物体添加动作定义
- 从物体删除动作定义
- 给物体添加事件定义
- 从物体删除事件定义
- 发送事件，如通知订阅了该事件的所有监听程序
- 为外部请求注册处理程序
  - 取得属性的值
  - 更新属性的值
  - 执行动作：接收来自请求的参数，执行定义的动作，返回结果

### 2.3 发现物

- 通过发送广播请求在WoT网络中发现所有物体
- 发现在本地WoT运行时中运行的物体
- 发现邻近的物体，如通过NFC或蓝牙连接的物体
- 通过向一个注册表服务发送发现请求发现物体
- 通过物体描述定义的过滤器发现物体
- 通过语义查询发现物体
- 停止或阻止进行中的发现过程
- 可选地给发现过程指定超时时间，超时后停止/阻止继续发现

## 3. 接口及类型定义

### 3.1 ThingDescription类型

```web-idl
typedef object ThingDescription;
```

下面是通过URL获取一个ThingDescription类型实例的示例：

**例1：获取TD**

```js
try {
  let res = await fetch('https://tds.mythings.biz/sensor11');
  // ... 可以对res.headers进行额外检查
  let td = await res.json();
  let thing = new ConsumedThing(td);
  console.log("Thing name: " + thing.getThingDescription().title);
} catch (err) {
  console.log("Fetching TD failed", err.message);
}
```

此外，规范也定义了如何扩展TD和验证TD。

### 3.2 WOT接口

```web-idl
[SecureContext, Exposed=(Window,Worker)]
interface WOT {
  // methods defined in UA conformance classes
  Promise<ConsumedThing> consume(ThingDescription td);
  Promise<ExposedThing> produce(ThingDescription td);
  ThingDiscovery discover(optional ThingFilter filter = null);
};
```

WOT接口的实例将以某种名称暴露在`window`和`worker`中。由上面定义可知，WOT接口包含3个方法：

- `consume()`：以`td`为参数，返回Promise，解决为`ConsumedThing`对象，表示操作物体的客户端接口；
- `produce()`：以`td`为参数，返回Promise，解决为`ExposedThing`对象，该对象扩展包含服务器端接口的`ConsumedThing`对象；
- `discover()`：启动发现流程，并提供匹配`filter`参数的`ThingDescription`对象。

这3个方法可分别用于在客户端、服务端创建消费体、产生暴露体和发现TD。

### 3.3 ConsumedThing接口

`ConsumedThing`接口的定义如下所示，`ConsumedThing`的实例即消费体，拥有一系列操作物体的客户端API。

```web-idl
[SecureContext, Exposed=(Window,Worker)]
interface ConsumedThing {
  constructor(ThingDescription td);
  Promise<any> readProperty(
		DOMString propertyName,
		optional InteractionOptions options = null
		);
  Promise<PropertyMap> readAllProperties(
		optional InteractionOptions options = null
		);
  Promise<PropertyMap> readMultipleProperties(
		sequence<DOMString> propertyNames,
		optional InteractionOptions options = null
		);
  Promise<void> writeProperty(
		DOMString propertyName,
		any value,
		optional InteractionOptions options = null
		);
  Promise<void> writeMultipleProperties(
		PropertyMap valueMap,
		optional InteractionOptions options = null
		);
  Promise<any> invokeAction(
		DOMString actionName,
		optional any params = null,
		optional InteractionOptions options = null
		);
  Promise<void> observeProperty(
		DOMString name,
		WotListener listener,
		optional InteractionOptions options = null
		);
  Promise<void> unobserveProperty(DOMString name);
  Promise<void> subscribeEvent(
		DOMString name,
		WotListener listener,
		optional InteractionOptions options = null
		);
  Promise<void> unsubscribeEvent(DOMString name);
  ThingDescription getThingDescription();
};
dictionary InteractionOptions {
  object uriVariables;
};
typedef object PropertyMap;
callback WotListener = void(any data);
```

下面我们简单看一看`ConsumedThing`接口定义的成员。

- `constructor`()构造函数：在取得JSON对象表示的TD后，就可以以之为参数创建`ConsumedThing`对象。
- `getThingDescription()`方法：返回表示`ConsumedThing`对象的TD。在使用物体前，应用可以先检查TD中的元数据，以确定其能力。
- `InteractionOptions`字典：保存根据TD而决定需要暴露给应用脚本的交互选项。在当前版本的规范中，只支持URI模板变量，表现为WoT-TD中定义的解析之后的JSON对象。
- `PropertyMap`类型：代表字符串类型的属性名与该属性取值的映射。用于一次性操作多个属性。
- `readProperty()`方法：读取一个属性的值。接收字符串参数`propertyName`和可选的`InteractionOptions`类型的`options`参数。返回`any`类型的属性值。
- `readMultipleProperties()`方法：以一或多个请求读取多个属性的值。接收一个字符串序列参数`propertyNames`和一个可选的`InteractionOptions`类型的`options`参数。返回一个对象，键为`propertyNames`中的字符串，值为相应属性的值。
- `readAllProperties()`方法：以一或多个请求读取物体全部属性的值。接收一个字符串序列参数`propertyNames`和一个可选的`InteractionOptions`类型的`options`参数。返回一个对象，键为`propertyNames`中的字符串，值为相应属性的值。
- `writeProperty()`方法：写入一个属性。接收字符串参数`propertyName`、值参数`value`和可选的`InteractionOptions`类型的`options`参数。返回成功或失败。
- `writeMultipleProperties()`方法：一个请求写入多个属性。接收对象类型的`properties`参数，键为属性名，值为属性值，和可选的`InteractionOptions`类型的`options`参数。返回成功或失败。
- `WotListener`回调：用户提供接收`any`参数的回调，用于观察属性变化和处理事件通知。
- `observeProperty()`方法：请求订阅某个属性值变化的通知。接收一个字符串参数`propertyName`、一个`WotListener`回调`listener`和一个可选的`InteractionOptions`类型的`options`参数。返回成功或失败。
- `unobserveProperty()`方法：请求取消订阅某个属性值变化的通知。接收一个字符串参数`propertyName`，返回成功或失败。
- `invokeAction()`方法：请求调用某个动作并返回结果。接收一个字符串参数`actionName`、一个可选的`any`类型的参数`params`和一个可选的`InteractionOptions`类型的`options`参数。返回动作的结果或错误。
- `subscribeEvent()`方法：请求订阅事件通知。接收一个字符串参数`eventName`、、一个`WotListener`回调`listener`和一个可选的`InteractionOptions`类型的`options`参数。返回成功或失败。
- `unsubscribeEvent()`方法：请求取消订阅事件通知。接收一个字符串参数`eventName`，返回成功或失败。

下面是一个客户端脚本的例子，展示了如何通过URL获取TD、创建`ConsumedThing`、读取元数据（title）、读取属性值、订阅属性变化、订阅WoT事件以及取消订阅。

**例2：客户端API示例**

```js
try {
	let res = await fetch("https://tds.mythings.org/sensor11");
	let td = res.json();
	let thing = new ConsumedThing(td);
	console.log("Thing " + thing.getThingDescription().title + " consumed.");
} catch(e) {
	console.log("TD fetch error: " + e.message); },
};
try {
	// 订阅属性“temperature”变化的通知
	await thing.observeProperty("temperature", value => {
 		console.log("Temperature changed to: " + value);
	});
	// 订阅TD中定义的“ready”事件
	await thing.subscribeEvent("ready", eventData => {
 		console.log("Ready; index: " + eventData);
 		// 返回TD中定义的“startMeasurement”动作
 		await thing.invokeAction("startMeasurement", { units: "Celsius" });
 		console.log("Measurement started.");
	});
} catch(e) {
	console.log("Error starting measurement.");
}
setTimeout( () => {
	console.log("Temperature: " + await thing.readProperty("temperature"));
	await thing.unsubscribe("ready");
	console.log("Unsubscribed from the 'ready' event.");
},10000);
```

## 3.4 ExposedThing接口

`ExposedThing`接口是用于操作物体的服务器API，支持定义请求处理程序、属性、动作和事件接口。

```web-idl
[SecureContext, Exposed=(Window,Worker)]
interface ExposedThing: ConsumedThing {
  ExposedThing setPropertyReadHandler(
		DOMString name,
		PropertyReadHandler readHandler
		);
  ExposedThing setPropertyWriteHandler(
		DOMString name,
		PropertyWriteHandler writeHandler
		);
  ExposedThing setActionHandler(
		DOMString name, ActionHandler action);
		void emitEvent(DOMString name, any data);
		Promise<void> expose();
		Promise<void> destroy();
		};
callback PropertyReadHandler = Promise<any>(
        optional InteractionOptions options = null
        );
callback PropertyWriteHandler = Promise<void>(
		any value,
        optional InteractionOptions options = null
        );
callback ActionHandler = Promise<any>(
		any params,
        optional InteractionOptions options = null
        );
```

`ExposedThing`接口扩展`ConsumedThing`接口，可以基于一个完整的或不完整的`ThingDescription`对象构建实例。`ExposedThing`从`ConsumedThing`继承了以下方法：

- `readProperty()`
- `readMultipleProperties()`
- `readAllProperties()`
- `writeProperty()`
- `writeMultipleProperties()`
- `writeAllProperties()`

这些方法跟`ConsumedThing`中的方法拥有同样的算法，不同之处在于对底层平台发送请求可能会以本地方法或库实现，不一定需要调用网络操作。

`ExposedThing`中`ConsumedThing`接口的实现提供默认的方法与`ExposedThing`交互。

构建`ExposedThing`之后，应用脚本可以初始化它的属性并设置可选的读、写和动作请求处理程序（即由实现提供的默认值）。应用脚本提供的处理程序可以使用默认处理程序，从而扩展默认行为，但也可以绕过它们，重写默认行为。最后，应用脚本会在`ExposedThing`上调用`expose()`，以便开始服务外部请求。

以下是`ExposedThing`接口定义的成员。

- `PropertyReadHandler`回调：在收到外部读取某个属性的请求时调用的函数，定义如何处理该请求。返回承诺Promise并在`name`参数与属性匹配时解决为属性的值，或者未找到属性或者无法获取属性的值时以一个错误拒绝。

- `setPropertyReadHandler()`方法：接收字符串参数`name`和`PropertyReadHandler`类型的参数`readHandler`。设置在读取匹配`name`的属性时执行的处理程序。出错则抛出。返回`this`对象以支持连缀调用。

  `readHandler`回调函数应该实现读取属性的逻辑，且应该在底层平台收到读取属性的请求时由实现调用。

  对任意属性，必须最多有一个处理程序，因此新加的处理程序必须替换之前的处理程序。如果给定属性不存在任何 初始的处理程序，实现应该基于TD实现一个默认属性读取处理程序。

- `PropertyWriteHandler`回调：在收到外部写入某个属性的请求时调用的函数，定义如何处理该请求。参数中需要包含新的`value`并返回承诺Promise，在匹配`name`的属性更新为`value`时解决，如果没找到属性或者值无法更新则拒绝。

- `setPropertyWriteHandler()`方法：接收字符串参数`name`和`PropertyWriteHandler`类型的参数`writeHandler`。设置在写入匹配`name`的属性时执行的处理程序。出错则抛出。返回`this`对象以支持连缀调用。

  对任意属性，必须最多有一个处理程序，因此新加的处理程序必须替换之前的处理程序。如果给定属性不存在任何 初始的处理程序，实现应该基于TD实现一个默认属性更新处理程序。

- `ActionHandler`回调：在收到外部执行某个动作的请求时调用的函数，定义如何处理该请求。参数中需要包含`params`字典。返回承诺Promise，出错时拒绝，成功时解决。

- `setActionHandler()`方法：接收字符串参数`name`和`ActionHandler`类型的参数`action`。设置在匹配`name`的动作执行的处理程序。出错则抛出。返回`this`对象以支持连缀调用。

  `action`回调函数应该实现动作的逻辑，且应该在底层平台收到执行动作的请求时由实现调用。

  对任意动作，必须最多有一个处理程序，因此新加的处理程序必须替换之前的处理程序。

- `emitEvent()`方法：接收字符串参数`name`表示事件名称和`any`类型的参数`data`。

- `expose()`方法：开始服务外部对物体的请求，从而支持属性、动作和事件的WoT交互。

- `destroy()`方法：停止服务外部对物体的请求并销毁对象。注意，最终的取消注册应该在调用这个方法之前完成。

以下示例展示了如何基于先构造的不完全的TD对象创建`ExposedThing`。

**例3：创建包含简单属性的ExposedThing**

```js
try {
let temperaturePropertyDefinition = {
 type: "number",
 minimum: -50,
 maximum: 10000
};
let tdFragment = {
 properties: {
   temperature: temperaturePropertyDefinition
 },
 actions: {
   reset: {
     description: "Reset the temperature sensor",
     input: {
       temperature: temperatureValueDefinition
     },
     output: null,
     forms: []
   },
 },
 events: {
   onchange: temperatureValueDefinition
 }
};
let thing1 = await WOT.produce(tdFragment);
// 初始化属性
await thing1.writeProperty("temperature", 0);
// 添加服务处理程序
thing1.setPropertyReadHandler("temperature", () => {
  return readLocalTemperatureSensor();  // Promise
});
// 启动服务
await thing1.expose();
} catch (err) {
console.log("Error creating ExposedThing: " + err);
}
```

下面的例子展示了如何在已有的`ExposedThing`上添加或修改属性定义：取得其`td`属性，增加或修改，然后再用它创建另一个`ExposedThing`。

**例4：添加对象属性**

```js
try {
// 创建thing1 TD的深拷贝
let instance = JSON.parse(JSON.stringify(thing1.td));
const statusValueDefinition = {
 type: "object",
 properties: {
   brightness: {
     type: "number",
     minimum: 0.0,
     maximum: 100.0,
     required: true
   },
   rgb: {
     type: "array",
     "minItems": 3,
     "maxItems": 3,
     items : {
         "type" : "number",
         "minimum": 0,
         "maximum": 255
     }
   }
};
instance["name"] = "mySensor";
instance.properties["brightness"] = {
 type: "number",
 minimum: 0.0,
 maximum: 100.0,
 required: true,
};
instance.properties["status"] = statusValueDefinition;
instance.actions["getStatus"] = {
 description: "Get status object",
 input: null,
 output: {
   status : statusValueDefinition;
 },
 forms: [...]
};
instance.events["onstatuschange"] = statusValueDefinition;
instance.forms = [...];  // update
var thing2 = new ExposedThing(instance);
// TODO: add service handlers
await thing2.expose();
});
} catch (err) {
console.log("Error creating ExposedThing: " + err);
}
```

## 3.5 ThingDiscovery接口

发现是分布式应用，需要网络节点（客户端、服务器、目录服务）的供应与支持。这个API对多种IoT部署场景支持的典型发现模式的客户端进行建模。

`ThingDiscovery`对象接收一个过滤器参数，并提供了控制发现过程的属性和方法。

```web-idl
[SecureContext, Exposed=(Window,Worker)]
interface ThingDiscovery {
  constructor(optional ThingFilter filter = null);
  readonly attribute ThingFilter? filter;
  readonly attribute boolean active;
  readonly attribute boolean done;
  readonly attribute Error? error;
  void start();
  Promise<ThingDescription> next();
  void stop();
};
```

**发现结果**对应的内部槽位是一个内部队列，用于临时存储发现的`ThingDescription`对象，直到应用通过`next()`方法消费掉。

- `filter`属性表示针对此次发现指定的`ThingFilter`类型的发现过滤器。
- `action`属性在发现流程使用协议查找的过程中（如正在接收新TD）为`true`，否则为`false`。

- `done`属性在发现已经完成、没有更多结果且**发现结果**为空时为`true`。

- `error`属性表示发现过程中发生的最后一个错误。通常是导致发现停止的关键错误。

构建`ThingDiscovery`的过程如下。

- `start()`方法将`active`属性设置为`true`。`stop()`方法将`active`属性设置为`false`，但如果**发现结果**中的`ThingDescription`对象还没有被`next()`消费，`done`属性仍然可能是`false`。

- 在成功调用`next()`方法时，`active`属性可能是`true`或`false`，但`done`属性只有在`active`为`false`且发现结果为空时才会被设置为`true`。

下面总结一下`start()`、`next()`和`stop()`方法。

- `start()`方法：启动发现流程。

- `next()`方法：提供下一个发现的`ThingDescription`对象。

- `stop()`方法：停止或阻止发现过程。可能无法被所有发现方法或端点支持，不过任何后续发现的结果或错误都会被抛弃，而且发现对象也会被标记为不活跃。

#### 3.5.1 DiscoveryMethod枚举

```web-idl
typedef DOMString DiscoveryMethod;
```

表示要发现的类型：

- any：不限制
- local：只发现当前设备或通过有线/无线连接到当前设备的设备上定义的物体。
- directory：通过物体目录提供的服务发现
- multicast：使用设备所在网络支持的多播协议发现

#### 3.5.2 ThingFilter字典

包含发现物体限制类型名值对的对象。

```web-idl
dictionary ThingFilter {
  (DiscoveryMethod or DOMString) method = "any";
  USVString? url;
  USVString? query;
  object? fragment;
};
```

- `method`属性表示发现过程应该使用的发现类型。可能的值由`DiscoveryMethod`枚举定义，可以由解决方案以字符串值扩展（但不保证互操作性）。

- `url`属性表示当前发现方法的额外信息，如服务当前发现请求的目标实体的URL，比如一个物体目录（`method`值为`"directory"`时）或物体（`method`为其他值时）的URL。

- `query`属性表示实现接收的查询字符串，比如SPARQL或JSON查询。

- `fragment`属性表示用于逐个属性匹配发现物体的模板对象。

#### 3.5.3 ThingDiscovery示例

以下例子展示了发现本地硬件暴露的物体的`ThingDescription`的过程，不考虑本地硬件上运行着多少WoT运行时。注意，发现对象可能在内部**发现结果**队列变空之前告终（变不活跃），因此需要持续读取`ThingDescription`对象，直到`done`属性为`true`。这是典型的本地和目录类型的发现过程。

**例5：发现本地硬件上暴露的物体**

```js
let discovery = new ThingDiscovery({ method: "local" });
do {
  let td = await discovery.next();
  console.log("Found Thing Description for " + td.title);
  let thing = new ConsumedThing(td);
  console.log("Thing name: " + thing.getThingDescription().title);
} while (!discovery.done);
```

下面的例子展示如何发现一个物体目录服务上列出的物体的`ThingDescription`。为安全起见，设置了超时。

**例6：通过目录发现物体**

```js
let discoveryFilter = {
method: "directory",
url: "http://directory.wotservice.org"
};
let discovery = new ThingDiscovery(discoveryFilter);
setTimeout( () => {
 discovery.stop();
 console.log("Discovery stopped after timeout.");
},
3000);
do {
let td = await discovery.next();
console.log("Found Thing Description for " + td.title);
let thing = new ConsumedThing(td);
console.log("Thing name: " + thing.getThingDescription().title);
} while (!discovery.done);
if (discovery.error) {
console.log("Discovery stopped because of an error: " + error.message);
}
```

接下来的例子展示了一个开放式的多播发现过程，可能不会很快结束（取决于底层协议），因此最好通过超时来结束。这种情况也倾向于一个一个地交付结果。

**例7：在网络上发现物体**

```js
let discovery = new ThingDiscovery({ method: "multicast" });
setTimeout( () => {
 discovery.stop();
 console.log("Stopped open-ended discovery");
},
10000);
do {
let td = await discovery.next();
let thing = new ConsumedThing(td);
console.log("Thing name: " + thing.getThingDescription().title);
} while (!discovery.done);
```

## 4. 扩展阅读

关于W3C成立WoT工作组制定WoT标准的初衷，可以参考该文章。

- [W3C万维物联网解析：物描述篇](https://mp.weixin.qq.com/s/0dZfn-BKGiPXGGvgqnqedQ)
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
