![](https://p0.ssl.qhimg.com/t019bf8a61337d21770.png)

> 纷纷红紫已成尘，布谷声中夏令新。夹路桑麻行不尽，始知身是太平人。 ——宋.陆游 《初夏绝句》 

我们在开发多Tab应用时候，常常会遇到多个Tab状态同步的问题。

想象如下场景：用户主界面，显示用户购物车内待结算的商品总数。此时，用户可能打开多个Tab。当用户添加新商品到购物车的时候，需要更新购物车的数量。

![](https://p1.ssl.qhimg.com/t016d1dfe8aa83f5cd0.png)

此时，当前页面需要向服务器发起请求，在得到添加成功响应的时候，可以更新用户界面。为了兼顾体验和可靠性，如果确信添加成功概率比较高的时候，也可以先更新界面，当多数返回错误的时候，可以给用户界面做状态回滚。为了下次展示方便，我们还会把这个数据写到LocalStorage里面。用户再次打开时候，可以优先从localStorage中取值。 

当前页面解决了，那么如果同时打开多个Tab该如何解决呢？这里使用StorageEvent可能是一种代价较小的解决方案。

StorageEvent是什么呢？

1. 是一种Event，可以通过标准的Event监听器操作。
1. 当storage变化时候，事件会被派发到所有同域下的其他页面。
1. 触发变化的当前页面，没有事件派发。

这里有一个简单的示例可以展示这个API的用法。

```JavaScript
const STORAGE_KEY = "cartlist"

const getStorage = () => {
	try {
		let rets = window.localStorage.getItem(STORAGE_KEY)
		
		if (rets === null) {
			return []
		}
		return JSON.parse(rets)
	}
	catch(e){
		return []
	}
}

const addCart = (value) => {
	let rets = getStorage()
	
	rets.push(value)
	
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rets))
	
	return rets	
}

const minusCart = (value) => {
	let rets = getStorage()
	let idx = rets.indexOf(value)
	
	if (idx !== -1){
		rets.splice(idx, 1)
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rets))
	}

	
	return rets	
}

const render = () => {
	let rets = getStorage()
	
	if (rets.length){
		$("#num").html(rets.length).show()
	}
	else {
		$("#num").hide()
	}
	
	$(".list li").each((i,el) => {
		if (rets.includes(i)){
			$(el).find("a:nth-child(1)").css("visibility", "hidden")
			$(el).find("a:nth-child(2)").css("visibility", "visible")
			
		}
		else {
			$(el).find("a:nth-child(1)").css("visibility", "visible")
			$(el).find("a:nth-child(2)").css("visibility", "hidden")
			
		}
	})
}

$(".list a").on("click", (e)=> {
	let opIdx = $(e.target).parent().find("a").index(e.target)
	let line = $(e.target).parent().parent()
	let idx = $(".list li").index(line)
	
	opIdx === 0 ? addCart(idx) : minusCart(idx)
	
	render()
	
	return false
})

window.addEventListener('storage', (e) => {
	render()
})

render()
```

其中，下面这行代码是实现的关键：

```JavaScript
window.addEventListener('storage', (e) => {
	render()
})
```

当我们注释掉这个语句，我们的页面同步就不能运行了。

读者可以打开多个Tab并观察页面的变化 https://jsbin.com/radekilosu/1/edit?html,css,js,output 。

实际上，这个事件e上还带有很多信息，方便编程时，对于事件做精确的控制。

| 字段        | 含义                                             |
| ----------- | ------------------------------------------------ |
| key         | 发生变化的storageKey                             |
| newValue    | 变换后新值                                       |
| oldValue    | 变换前原值                                       |
| storageArea | 相关的变化对象                                   |
| url         | 触发变化的URL，如果是frameset内，则是触发帧的URL |

上述各值都是只读的。

还有一点没有解决掉，就是触发storage变化的本页面，不能接收这个值，这个一般情况下是没问题。当然，为了一致性，我们可以自行new一个事件，在发生时候主动触发它。

此时我们可以包装一个新的Storage对象：

```JavaScript
var Storage = {
    setItem : function(k,v){
    　　localStorage.setItem(k,v);
    },
    removeItem : function(k){
    　　localStorage.removeItem(k);
    },
    clear: function (){},
    getItem: function(k)
```

此时，我们再包装一个函数：

```javascript
function (key, oldval, newval, url, storage){
    var se = document.createEvent("StorageEvent");
    se.initStorageEvent('storage', false, false, key, oldval, newval, url, storage);
    window.dispatchEvent(se);
}
```

此时，我们只需要再setItem、removeItem、clear中获取对应的值，并手动调用一下即可。

### 参考资料

1. https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
2. https://www.cnblogs.com/cczw/p/3196195.html