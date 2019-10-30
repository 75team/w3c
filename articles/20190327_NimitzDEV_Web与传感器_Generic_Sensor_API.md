## 什么是 Generic Sensor API？

Generic Sensor API 提供了一组属性和方法，将传感器暴露给 Web 端应用。在这个标准中，规定了基本的接口和类，使得在实现各种传感器 API 时能够通过继承快速实现。在介绍完本标准后，我会举例使用其中一个传感器 API。

与 DeviceMotion 和 DeviceOrientation 这些已有的能够提供传感器数据的 API 相比之下，Generic Sensor API 体现出了许多好处：

1. Generic Sensor API 能够非常容易地扩展出新的传感器类，同时，扩展出的新类与父类接口保持一致。由于这些一致性，用于一个传感器的代码经过少量修改之后即可用于另一个传感器上
2. 你可以配置传感器，例如，设置适合你的应用的采样率
3. 你可以检测某个传感器是否可用
4. 传感器读数有着精度非常高的时间戳，使用高精度的时间戳可以与应用中的额其他活动进行同步
5. 传感器数据模型以及坐标系统有这非常明确的定义，使得浏览器厂商能够实现具有互通性的解决方案
6. 基于 Generic Sensor API 的接口不依赖 DOM 相关对象 （Navigator 以及 Window 对象），这给未来在 Service Worker，无头 JS 运行时（如嵌入式设备）带来应用的可能
7. 相对于旧的 API，Generic Sensor API 还带来了更好的安全和隐私保护能力

## Chrome 中已实现的传感器

| 类名                      | 传感器         |
| ------------------------- | -------------- |
| Accelerometer             | 加速度计       |
| Gyroscope                 | 陀螺仪         |
| LinearAccelerationSensor  | 线性加速传感器 |
| AbsoluteOrientationSensor | 绝对方向传感器 |
| RelativeOrientationSensor | 相对方向传感器 |
| AmbientLightSensor        | 环境光传感器   |
| Magnetometer              | 磁力计         |

接下来我们来详细了解 Generic Sensor API 中的属性和方法

## Generic Sensor API

### 传感器生命周期

![sensor-life-cycle](https://p2.ssl.qhimg.com/t015df60742e5c613ba.png)

首先构建传感器对象，进入空闲状态，调用 `start` 方法之后进行激活（激活中状态），如果发生错误，则回到空闲状态，成功则进入已激活状态。调用 `stop` 或出错，则返回空闲状态。

### 垃圾回收策略

- 当传感器属于“激活中”的状态并且注册了 `activated`, `reading`, `error` 事件时不会被回收
- 当传感器属于“已激活”的状态并且注册了 `reading`, `error` 事件时不会被回收

### SensorOptions

`SensorOptions` 是用于在构建传感器对象时传入的配置项，在 Generic Sensor API 的基类中支持一种设置

| 设置      | 作用            |
| --------- | --------------- |
| frequency | 采样率，单位 Hz |

### activated 属性

该属性用于检测当前传感器是否属于已激活的状态，是则返回 `true`

### hasReading 属性

该属性首先会检查最近一次读数的时间戳，如果有则返回 `true`

### timestamp 属性

该属性用于读取最近一次读数的时间戳的值

### start 方法

`start` 方法会开始对传感器数据进行采样，采样率可以在构建传感器对象时通过参数传入。

如果平台与传感器之间无法建立连接，将会抛出 `NotReadableError` 异常；

如果平台没有访问传感器的权限，将会抛出`NotAllowedError` 异常

### stop 方法

`stop` 方法将会停止对传感器的数据采样，并将传感器置为空闲状态

### reading 事件

当调用 `start` 方法之后，根据设定的采样率，将会按照采样率采样数据并通过该事件通知产生了读数

### active 事件

在传感器的生命周期中，如果状态从 `activating` 变更到 `activated` 时将会触发此事件

### error 事件

当操作传感器时或传感器出现异常时将会通过此事件抛出

## AmbientLightSensor

现在，我们将使用 `AmbientLightSensor` 为例，制作一个简单的页面，根据返回的数值（光照度 lux）改变背景，小于 100 lux 时变为黑色背景。

### 检测是否支持

首先通过简单的检查，查看当前平台是否支持此传感器

```javascript
if (window.AmbientLightSensor) {
    ...
} else {
    ...
}
```

### 初始化并添加事件处理

```javascript
const als = new AmbientLightSensor();
als.addEventListener('reading', () => {
    ...
})
```

### 调用 start 方法开始读数

```javascript
als.start();
```

### 效果

通过在 `reading` 事件中判断光照度，动态改变界面样式

![](https://p4.ssl.qhimg.com/t01c314319b22f9de2a.gif)

如果没有成功读取数值，先尝试在 flags 中将 Generic Sensor Extra Classes 开启：

![](https://p1.ssl.qhimg.com/t018886564e813a27c8.jpg)

## 最后

在 Chrome 中，一部分传感器实现已经是默认开启了，例如 `Gyroscope`, `Magnetometer` 等。通过传感器数据，在 Web 端将能实现更多更好的交互。

## 参考链接

- https://www.w3.org/TR/2019/WD-generic-sensor-20190307/
- https://www.w3.org/TR/2019/WD-ambient-light-20190307/
- https://developers.google.com/web/updates/2017/09/sensors-for-the-web