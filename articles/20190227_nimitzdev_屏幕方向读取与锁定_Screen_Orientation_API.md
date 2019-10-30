## 什么是 Screen Orientation API

Screen Orientation API 为 Web 应用提供了读取设备当前屏幕方向、旋转角度、锁定旋转方向、获取方向改变事件的能力。使得特定应用在屏幕方向方面增强用户体验，如视频和游戏。该标准目前处于工作组草案状态，最近一个修改为 1 月 29 日。

## 浏览器支持情况

![Can I use Screen Orientation API?](https://p5.ssl.qhimg.com/t015eb41b808e2abb4a.png)

## 属性结构

Screen Orientation API 通过在 `Screen` 接口上扩展属性 `orientation` 为我们提供该 API 的所有功能：

```web-idl
partial interface Screen {
  [SameObject] readonly attribute ScreenOrientation orientation;
};
```

ScreenOrientation 的定义如下：

```web-idl
[Exposed=Window]
interface ScreenOrientation : EventTarget {
  Promise<void> lock(OrientationLockType orientation);
  void unlock();
  readonly attribute OrientationType type;
  readonly attribute unsigned short angle;
  attribute EventHandler onchange;
};
```

接下来我们就来解释如何使用与读取这些方法和属性。

## 读取屏幕方向

读取屏幕方向主要通过 `type` 和 `angle` 两个属性，前者返回旋转方向的描述，后者返回旋转的角度

### angle

`angle` 属性代表了以设备的自然位置开始，逆时针方向上所旋转的角度。如将手机逆时针旋转90度变为横屏，那么此时 `angle` 则返回 90 。

### type

 `type` 属性主要通过描述来表达屏幕的旋转方向，`type ` 的返回值总共有四个，对应着四个不同的旋转方向：

`portrait-primary`：竖屏状态并且旋转角度为 0 度，也就是设备的自然位置

`portrait-secondary`：竖屏状并且即旋转角度为 180 度，也就是倒着拿的位置

`landscape-primary`：横屏状态并且旋转角度为 90 度

`landscape-secondary`：横屏状态并且旋转角度为 180 度

## 锁定屏幕方向

> 出于一些安全方面的考虑，锁定方向时必须使页面处于全屏状态

### 锁定

锁定屏幕通过 `lock` 方法，调用 `lock`  方法需要传入锁定的方向描述字符串，随后该方法会返回一个 Promise。

| 描述字符串          | 功能                             |
| ------------------- | -------------------------------- |
| portrait-primary    | 竖屏主方向                       |
| portrait-secondary  | 竖屏次方向                       |
| landscape-primary   | 横屏主方向                       |
| landscape-secondary | 横屏次方向                       |
| portrait            | 竖屏方向(primary + secondary)    |
| landscape           | 横屏方向(primary + secondary)    |
| natural             | 设备的自然方向                   |
| any                 | 锁定四个方向，即锁定当前屏幕方向 |

Example:

```javascript
async function lockPortrait() {
    // 首先进入全屏模式
    await document.documentElement.requestFullscreen();
    
    // 锁定竖屏方向
    await screen.orientation
        		.lock('portrait')
    			.catch(e => alert(e.message));
}
```

### 解锁

解锁不需要额外参数，只需要调用 `unlock` 即可：

```javascript
function unlock() {
    screen.orientation.unlock();
}
```

## 屏幕方向改变事件

通过为 `onchange` 赋值或通过 `addEventListener` 都可以添加事件监听：

```javascript
function rotationChange() {
    console.log('rotation changed to:', screen.orientation.type);
}

screen.orientation.addEventListener('change', rotationChange);
```

## 小结

透过本文，其实要使用这个 API 并不困难，并且在某些场景下，我们还能直接通过 `lock` 方法改变屏幕的旋转方向，提升浏览体验。并且移动端上的 Chrome 和 FIrefox 支持得很好，可以考虑在你的下一个项目中使用。

简单的演示可以访问 https://codepen.io/NimitzDEV/pen/LaEapX

## 参考链接

https://www.w3.org/TR/2019/WD-screen-orientation-20190129/