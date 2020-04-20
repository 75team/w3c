

一位伦敦的Python工程师Oliver Russell最近做了一个好玩的尝试，用33行代码“实现了”React。

他实现的“React”主要涉及如下抽象：

- 我们传一个**取得**状态并**返回**虚拟DOM的函数
- “React”在浏览器中将虚拟DOM**渲染**为真实DOM
- 状态改变，“React”再次运行函数并返回新虚拟DOM
- “React”高效更新真实DOM，以匹配新虚拟DOM

由此可见，这个实现的功能还十分有限。只涉及虚拟DOM生成、差异比较和真实DOM渲染。

全部实现代码如下图所示。

![](https://p2.ssl.qhimg.com/t010b33ec691fd272aa.jpg)

- 无注释版：https://github.com/leontrolski/leontrolski.github.io/blob/master/33-line-react.js
- 有注释版：https://github.com/leontrolski/leontrolski.github.io/blob/master/33-line-react-with-comments.js

这个实现参考了Mithril（https://mithril.js.org/）的语法。对外主要暴露了两个函数：

- m()：Mithril风格的hyperscript辅助函数，用于创建虚拟DOM
- m.render()：DOM挂载与渲染逻辑

其中m()接收如下参数：

- 标签名（如 `'tr'`）及 `.`分隔的类名
- （可选的）`{string: any}`对象，包含添加给DOM节点的所有属性
- 任意嵌套的子节点，可以是其他虚拟DOM或字符串

返回虚拟DOM对象，比如：

```json
{
    tag: 'div',
    attrs: {},
    classes: [],
    children: [
        {
            tag: 'h3',
            attrs: {},
            classes: [],
            children: [
                'current player: x'
            ]
        },
        {
            tag: 'table',
            attrs: {},
            classes: [],
            children: [
                {
                    tag: 'tr',
                    attrs: {},
                    classes: [],
                    children: [
...
```

虽然在很多人眼里这还是一个“玩具”，但用Oliver Russell的话说：“（对于一般的单面应用）用这33行代码替换React也不会有人看得出来。”为此，他还基于这个“React”写了几个例子。

**Noughts and Crosses**

![](https://p3.ssl.qhimg.com/t017b49b4df6ef65367.jpg)

- https://leontrolski.github.io/33-line-react.html

**Calendar Picker**

![](https://p5.ssl.qhimg.com/t01fb70de62d8a8cf9e.jpg)

- https://leontrolski.github.io/33-line-react-calendar.html

**Snake**

![](https://p5.ssl.qhimg.com/t0125b5b767b99b9ed3.jpg)

- https://leontrolski.github.io/33-line-react-snake.html

笔者也基于这个“React”写了一个非常简单的ToDo：

```js
class toDoDemo {
  constructor() {
    this.todos = []
    this.render = () => m.render(
      document.getElementById('example'),
      {children: [this.showToDos()]},
    )
    this.render() 
  }
  
  showToDos() { 
    return m('div', [
      m('h3', 'ToDo示例'),
      m('input', { placeholder: '添加todo' }),
      m('button',
        {
          onclick: (e) => this.addTodo(e)
        },
        '+'
       ),
      m('ul', 
        this.todos.map((item, i) => m('li', [
          m('span', item), 
          m('button', 
            { 
              onclick: () => this.removeTodo(i) 
            }, 
            '-'
           )
        ])))
      ])
  }
  
  removeTodo(i) {
    this.todos.splice(i,1)
    this.render()    
  }
  
  addTodo(e) {
    const input = e.target.previousSibling
    const todo = input.value
    if(!todo.trim()) return
    input.value = ''
    this.todos.push(todo)
    this.render()    
  }
}

new toDoDemo()
```

- https://code.h5jun.com/zelix/

有兴趣的的读者不妨花点时间研究一下这个“33-line-react”，包括上面的几个示例。

#### 参考链接：

- https://leontrolski.github.io/33-line-react.html
- https://news.ycombinator.com/item?id=22776753

