# Vuex调用接口的三个阶段

![](https://p0.ssl.qhimg.com/t01e379f6a0712e1847.jpg)

本文源自3月11日作者在公司内部的一次“泛前端分享”，是作者在开发IoT智能设备联动场景项目过程中的一些经验总结。文中代码可以视作伪代码，不包含任何涉及真实项目的内容。

Vuex是开发复杂Vue应用的必备工具，为跨组件共享数据提供了适合Vue自身的解决方案。关于Vuex的详细介绍，推荐阅读官网文档：https://vuex.vuejs.org/。

Vuex调用接口的三个阶段，总体上体现了项目在迭代中不断优化调用逻辑、重新组织代码和抽象实现细节的过程。

- 关注点分离及可维护代码：关注点分离（SoC，Separation of Concerns）是软件架构设计的一个重要原则，体现为以单一职责为目标来划分模块，通过将逻辑归类、分组，创建出相互独立但又有机统一的代码实体。关注点分离的代码，其模块职责清晰、关系明确，便于排错和维护，是代码整体可维护性的基础。
- 橄榄形接口与同构映射器：橄榄形接口比喻调用服务从整体上入口和出口小，但内涵逻辑丰富。这种接口对外部收敛，简单、直接，但将主要逻辑封装在了内部，便于集中处理请求和响应。同构映射（isomorphism mapping）是一个数学概念，在这里借用于形容自定义的、与Vuex辅助方法一致的服务映射。
- 响应归一及三级错误处理：响应的归一化（normaliztion）的目的是统一不同服务端接口返回数据的格式，以及请求错误的响应格式。三级错误处理分别是网络错误、服务错误和接口错误，这些错误可以作为响应以归一化的形式返回，也可以同步设置到Vuex的状态对象，成为响应式数据实时体现在界面组件上。

## 创建演示环境

![](https://p3.ssl.qhimg.com/t01267167d660212e86.jpg)

qvk是一个集成现代前端工程化最佳实践的通用Web开发环境，可用于开发传统C/S架构的Web应用、SPA（单页应用）、H5（App内嵌页）等。

qvk初始版集成以下Web框架和打包工具。

- [ThinkJS](https://thinkjs.org/)：基于MVC模式的简单易用、功能强大的Node.js开发框架。
- [Vue.js](https://cn.vuejs.org/index.html)：渐进式JavaScript框架，前端组件式开发主流选择。
- [Webpack](https://webpack.js.org/)：目前使用最广泛的前端资源模块打包工具。

## 用法

### 1. 拷贝代码

```shell
git clone git@github.com:qqvk/qvk.git
```

### 2. 安装依赖、初始化及启动服务

```shell
cd qvk          // 进入项目目录
npm install     // 安装依赖
npm run init    // 初始化
npm start       // 启动项目
```

## 第一阶段：关注点分离及可维护代码 

![](https://p4.ssl.qhimg.com/t013613227e5b87b362.jpg)

上图左侧为Vuex架构，右侧是演示环境代码模块的依赖关系。以下是相应文件的代码，主要是lib/service1.js和store/store1.js，代表第一阶段：

lib/endpoints.js

```js
/**
 * 默认导出API配置
 */
export default {
    // 1. 取得用户设备列表
    getUserDeviceList: { method: 'GET', endpoint: '/getUserDeviceList'},
    // 2. 取得用户场景列表
    getUserSceneList: { method: 'GET', endpoint: '/getUserSeceneList' },
    // 3. 查询场景
    getUserScene: { method: 'GET', endpoint: '/getUserScene' }
}
/**
 * 命名导出全局环境
 */
export const ENV = 'https://the-service-address'

```

lib/factory.js

```js
import API, { ENV } from './endpoints'

/**
 * 默认导出工厂方法：根据服务名称和服务参数返回请求的url及options
 */
export default ({ serviceName = '', serviceArguments = {} }) => {
    const { method, endpoint } = API[serviceName]
    const urlBase = `${ENV}${endpoint}`
    const { queryString, headers } = getQueryStringAndHeaders(serviceArguments)

    let url, body, options
    if (method == 'POST') {
        url = urlBase;
        body = queryString
        options = { headers, method, body }
    }
    if (method == 'GET') {
        url = `${urlBase}?${queryString}`
        options = { headers, method }
    }
    return {
        url,
        options
    }
}
/**
 * getQueryStringAndHeaders()及其他Helpers（略）
 */
```

lib/service1.js

```js
import factory from './factory'

export default {
    // 取得用户场景列表
    async getUserSceneList() {
        const {
            url,
            options
        } = factory({ serviceName: 'getUserSceneList'})
        const res = await fetch(url, { ...options }).then(res => res.json())
        return res
    },
    // 取得用户设备列表
    async getUserDeviceList() {
        const {
            url,
            options
        } = factory({ serviceName: 'getUserSceneList'})
        const res = await fetch(url, { ...options }).then(res => res.json())
        return res
    },
    // 取得用户场景详情
    async getUserScene({ scene_id }) {
        const {
            url,
            options
        } = factory({ 
            serviceName: 'getUserScene', 
            serviceArguments: { scene_id }
        })
        const res = await fetch(url, { ...options }).then(res => res.json())
        return res
    }
}
```

store/store1.js

```js 
import SERVICE from '../lib/service1'

const store = {
    state: {},
    actions: {
        getUserSceneList() {
            return SERVICE['getUserSceneList']()
        },
        getUserScene(store, {scene_id}) {
            return SERVICE['getUserScene']({scene_id})
        }
    }
}

export default new Vuex.Store(store)
```

第一阶段的service1.js和store1.js实现了关注点分离。前者负责请求后端API，后者负责在Vue组件和服务之间映射接口。这一阶段的问题是代码逻辑重复：service1.js导出的3个接口调用的内部逻辑几乎完全一样（除了`getUserScene()`需要接收一个参数），而store1.js中`actions`中映射的逻辑也是重复的。

## 第二阶段：橄榄形接口与同构映射器

![](https://p1.ssl.qhimg.com/t01d6b38ec79d6ca464.jpg)

第二阶段要解决第一阶段的问题。首先，把重复逻辑提炼出来，构造“橄榄形”接口。

提炼重复逻辑的第一步是新建一个`serve()`函数，然后在每个接口中调用`serve()`。结果当然也是重复的：每个接口都是重复调用`serve()`。第二步是把所有接口调用整合起来，通过动态生成每个接口的方式达到“收敛”接口的目的。

收敛接口的实现方式有两种：第一种是动态生成导出对象的方法，第二种使用代理动态拦截请求，详见代码：

lib/service2.js

````js
import factory from './factory'
// import API from '../lib/endpoints'

function serve({ serviceName = '', serviceArguments = {} }) {
    const {
        url,
        options
    } = factory({ serviceName, serviceArguments})
    return fetch(url, { ...options }).then(res => res.json())
}
// 第二种实现方式
export default new Proxy({}, {
    get(target, serviceName) {
        return serviceArguments => serve({ serviceName, serviceArguments})
    }
})

// 第一种实现方式
// export default Object.keys(API).reduce((pre, serviceName) => {
//     pre[serviceName] = serviceArguments => serve({ serviceName, serviceArguments})
//     return pre
// }, {})
````

如上所示，service2.js解决了service1.js的问题，消除了重复代码，把所有接口收敛为只有4-5行代码。这几行代码就是所有请求的总入口和总出口。这就是“橄榄形”尖尖的两头儿。

接下来通过自定义同构映射器来改造store1.js（参见上一节）。所谓同构映射器，就是与Vuex内置的`mapActions`和`mapMutations`辅助方法构造相同的映射函数。通过自定义这些映射函数，可以把原本重复的代码抽离出来，并实现在Vuex中以函数声明方式注册自定义服务，这与在Vue组件中使用Vuex的方式是一样的：

store/store2.js

```js
import { mapActions, mapMutations } from './store2.mapper'

const store = {
    state: {},
    mutations: {
        ...mapMutations({
            getUserSceneList: 'scenes',
            getUserScene: 'scene',
            getUserDeviceList: 'devices'
        })
    },
    actions: {
        ...mapActions([
            'getUserSceneList',
            'getUserScene',
            'getUserDeviceList'
        ])
    }
}

export default new Vuex.Store(store)
```

为了实现以上store2.js的调用，需要增加一个模块store2.mapper.js：

store/store2.mapper.js

```js
import SERVICE from '../lib/service2'

// 命名导出同构action映射器
export const mapActions = API => API.reduce((pre, serviceName) => {
    pre[serviceName] = ({ commit }, serviceArguments) => {
        return SERVICE[serviceName](serviceArguments).then(res => {
          	// 把异步响应数据提交到mutation
            commit(serviceName, res.data)
            return res
        })
    }
    return pre
}, {})
// 命名导出同构mutation映射器
export const mapMutations = MAP => Object.keys(MAP).reduce((pre, serviceName) => {
    pre[serviceName] = (state, data) => {
      	// mutation根据配置把数据添加到state
        state[MAP[serviceName]] = data
    }
    return pre
}, {})
```

第二阶段通过重构在service2.js中以几行代码实现了“橄榄形”接口的两个端点，而“橄榄”内部的逻辑将在第三阶段进行充实。此外，第二阶段通过自定义同构映射器简化了Vuex核心代码，而新增的store2.mapper.js则为第三阶段实现响应归一化提供了关口。

## 第三阶段：响应归一及三级错误处理

![](https://p1.ssl.qhimg.com/t01efda645aa484b66b.jpg)

如前所述，第二阶段新增的store2.mapper.js为第三阶段实现响应归一化处理提供了关口，也就是写代码的地方。第三阶段的store3.js与store2.js没有区别，只是引用了新的store3.mapper.js：

store/store3.js

```js 
// 除改为引用store/store3.mapper.js，其余同store/store2.js
```

对后端请求返回的响应有正常响应，也有非正常响应和错误。另外，如果项目中要调用不同的服务端接口，这些接口返回的数据格式可能或多或少会有一些差异。为了在前端较为一致地实现响应与错误处理，有必对这些“响应”进行归一化处理，即自定义一个标准的响应格式。如下所示，store3.mapper.js借鉴了`fetch`请求的响应格式，以`{ ok: true/false, payload: data/error }`作为归一化格式：

store/store3.mapper.js

```js
import SERVICE from '../lib/service3'

export const mapActions = API => API.reduce((pre, serviceName) => {
    pre[serviceName] = ({ commit }, serviceArguments) => {
        return SERVICE[serviceName](serviceArguments).then(res => {
            commit(serviceName, res.data)
          	// 响应归一化：正常响应
            if(res.code === 0) {
                return {
                    ok: true,
                    payload: res
                }
            }
          	// 响应归一化：非正常响应和各种错误
            return {
                ok: false,
                payload: res
            }
        })
    }
    return pre
}, {})

export const mapMutations = MAP => Object.keys(MAP).reduce((pre, serviceName) => {
    pre[serviceName] = (state, data) => {
        state[MAP[serviceName]] = data
    }
    return pre
}, {})
```

响应的归一化之所以放在store3.mapper.js这一层处理，是因为归一化不仅要涵盖正常和非正常响应，还要涵盖错误。而我们说的错误大致可以分三类或三级：

- 网络错误，包含断网、弱网等，断网会导致请求立即失败，弱网会导致请求超时；
- 系统错误，通常由于后端服务不能正常提供响应导致，如服务下线；
- 接口错误，指的是由于请求本身问题导致接口返回了错误响应。

以下是service3.js实现三级错误处理的代码，其中包括两种实现超时的方式：使用`AbortController`超时中断请求和使用包装约定（promise）接管`fetch`响应，然后超时拒绝约定（reject promise）。

lib/service3.js

```js
import factory from './factory'

function serve({ serviceName = '', serviceArguments = {} }) {
    let {
        url,
        options
    } = factory({ serviceName, serviceArguments})

    const controller = new AbortController()
    const signal = controller.signal

    // 超时实现方式一：AbortController
    // setTimeout(() => {
    //     controller.abort()
    // }, 10)
    // return fetch(url, { ...options, signal }).then(/*...*/).catch(/*...*/)

    // 超时实现方式二：包装Promise（及AbortController中断请求）
    return new Promise((resolve, reject) => {
        TIMEOUT_GUARD({ reject, controller })

        // url = '/index/s500' 模拟服务器内部错误响应
        fetch(url, { ...options, signal }).then(resolve, reject)
    })
    .then(res => {
        const { ok, status, statusText } = res
        if(ok) {
            return res.json().then(res => {
                const { code, msg, reqid } = res
                if (code === 0) {
                    return res
                } else {
                  	// 第三级错误：接口返回错误
                    return {
                        code: 9001,
                        error: res
                    }
                }
            })
        } else {
            // 第二级错误：远程服务错误
            return {
                code: 8001,
                error: { status, statusText }
            }
        }
    })
    .catch(error => {
      	// 第一级错误：网络错误（超时或断网）
        // 如果使用第一种超时实现方式，则会有这个错误
        if(error.name === 'AbortError') {
            return {
                code: 7001,
                error
            }
        }
        // 如果使用第二种超时实现方式，则直接返回错误，不再包装
        if(error.code === 7002) return error
        // 其他请求错误，比如网络中断，统一为一种编码
        return {
            code: 7000,
            error
        }
    })
    // 第二种超时实现方式，定义超时拒绝约定（promise）的辅助函数
    function TIMEOUT_GUARD({ reject, controller }) {
        setTimeout(() => {
            reject({
                code: 7002,
                error: new Error('请求超时')
            })
            controller.abort()
        }, 10)
    }
}

export default new Proxy({}, {
    get(target, serviceName) {
        return serviceArguments => serve({ serviceName, serviceArguments})
    }
})
```

如上代码所示，service3.js通过在`serve()`函数内部实现分级处理错误，适配了响应归一化所要求的数据格式（所有错误都返回`code`大于0的错误对象），同时也丰富了“橄榄”形接口的内部逻辑，让“橄榄”真正成形。

## 结束语

本文以Vuex调用接口为例，逐步递进地展示了获取后端数据逻辑不断优化、组织、抽象、提炼的过程。这些过程本质上是为了写出“性价比”最高的代码，即以尽量少的代码实现尽量复杂的功能：代码少，维护就容易；组织好，调试就方便；抽象准，理解就简单。正如作者翻译的一本畅销交互设计专著《简约至上》中所提到的“简约设计四策略”：组织、隐藏、删除、转移。这四个策略同样适用于代码、逻辑的抽象和简化。本文描述的“三个阶段”总结起来，也可以大致归入其中某个策略。

最后，本文虽然是以Vuex为例来演示，但背后的原则和道理是相通的。因此，本文应该对在React开发中使用Redux也有帮助。



