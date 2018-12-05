![](https://p0.ssl.qhimg.com/t0137eedca1196c5ab1.png)


> 人生无根蒂，飘如陌上尘。分散逐风转，此已非常身。落地为兄弟，何必骨肉亲！得欢当作乐，斗酒聚比邻。盛年不重来，一日难再晨。及时当勉励，岁月不待人。 晋.陶渊明《杂诗》

笔者做面试官时候，除了考察常规的前端技能、框架的特性外，经常会出一些很简单的算法题目。这种经典题目的好处是言简意赅，在很短的时间就可以完成。但却能考察出工程师的基本计算机功力，以及知识储备。特别对于 Javascript 而言，还可以避免技术栈不同对于工程师能力的误判。

下面就是一道笔者经常考核的题目：

**创建一个函数来判断给定的表达式中的大括号是否闭合，返回 True/False，对于空字串，返回 True：**

```Javascript
var expression = "{{}}{}{}"
var expressionFalse = "{}{{}";

function isBalanced(exp) {}
```

题目本身比较简单。不同的同学拿到题目会有不同的第一反应。

有的同学仅仅查找各种括号的个数，这种是不可以的，这种括号是不匹配的：`}{`。

有很多同学试图使用正则表达式解决问题。其思路是找到所有邻接的匹配的括号对，然后将其替换为空，直到不能替换为止。此时如果最后得到的字符串为空即为匹配，否则不匹配，代码很简洁，如下：

```Javascript
function isBalanced(exp) {
  var reg =  /\{\}/g, len;
  do{
      len  = exp.length;
      exp = exp.replace(reg, "")
  } while (len != exp.length)
  return exp.length === 0
}
```

好像也是可以的。但是问题点至少有二：

第一、此算法的最坏的时间复杂度是 O(n^2)级别的，对于长篇大论是不友好的。

第二、此算法的正则表达式普适性较差，对于表达式含有其他干扰字符时候需要频繁修改正则表达式。当正则表达式过于复杂时候，反过来又会影响到检索效率。

其实，有时候最淳朴的做法，可能会更有效。

大家在数据结构课程中曾经学习过“栈”这种数据结构。“栈”是一种满足后进先出的抽象数据结构。这个结构在这道题目中可以帮助到我们。

思路如下：

1. 巡检字符串，将括号分类，一类是左括号、一类是右括号。
2. 左括号看作是入栈信号，右括号是出栈信号。
3. 当出栈时，如果栈定没有与之匹配的元素，则宣告不匹配。
4. 当巡检完毕，如果得到空栈，则匹配，否则不匹配。

写成代码大致就是这样，时间复杂度是 O(n)：

```Javascript
function isBalanced(exp){
	let info = exp.split("")
	let stack = []

	for(let i = 0; i < info.length; ++i){
                let el = info[i]
		if (el == "{"){
			stack.push("{")
		}
		else if (el == "}"){
			if(stack.length === 0){
				return false;
			}
			stack.pop()
		}
	}

	return stack.length === 0
}
```

在 Javascript 里，Array 可以很方便的模拟栈的行为。读者有兴趣也可以自己实现一个简单的栈，用以丰富自己的代码工具箱。

另外，由于题目中的括号情形比较简单，很多同学用标志位来解决，即当为左括号时候，置标志位，为右括号时候，当标志位存在，取消标志位，否则判定不匹配。最后没有标志位则为匹配。这种解法，对于题目中的状况是可以的。

我们还可以把题目再向前面推进一步，看一看更一般的括号和字符串的情形：

**实现函数 isBalanced，用 true 或 false 表示给定的字符串的括号是否平衡（一一对应）。注意了是要支持三种类型的括号{}，[]，和()。带有交错括号的字符串应该返回 false。**

```Javascript
isBalanced('(foo { bar (baz) [boo] })') // true
isBalanced('foo { bar { baz }')         // false
isBalanced('foo { (bar [baz] } )')      // false
```

基本思路和上面的解法是类似的。只是这里面需要注意两点：

1. 过滤掉非括号的干扰字符。
2. 每一种右括号有一种唯一的左括号与之对应。出现右括号时候，栈顶的左括号必须是和它匹配的。

对于第二种，大家应该很自然的联想到用 JSON 对象控制，这个是可以的。其实在 ES6 中，有 Map 这样的数据结构作为更专业的键值对存储结构可以使用。同时，一些好玩的语法和特性如扩展语法，箭头函数可以让我们把程序写得更加一气呵成。下面是一个可行的代码：

```Javascript
const isBalanced = (str) => {
	const map = new Map([
		["{", "}"],
		["[", "]"],
		["(", ")"]
	])

	let stack = [];

	for(let i = 0 ; i < str.length; ++i){
		let node = str[i]

		if (map.has(node)){
			stack.push(node)
		}
		else if ([...map.values()].includes(node)){
			if (stack[stack.length - 1] !==
                                [...map.entries()].filter(el=>el[1]===node).pop().shift()
                         ){
				return false
			}
			stack.splice(stack.length-1, 1)
		}
	}

	return stack.length === 0
}
```

很喜欢 ES6 的这些扩充，和这些新的数据结构。使得撰写 Javascript 有一种特别愉悦的体验。

让我们再次扩充一下这道题目。要求严格限制括号的顺序，即中括号外围只能是大括号，内部只能是小括号。也即：括号只能以大括号、中括号、小括号的顺序只能前面的包含后面的，不能后面的包含前面的，用代码来表示一下：

```Javascript
isStrictBalanced('foo { bar (baz) [boo] }')  // true
isStrictBalanced('(foo { bar (baz) [boo] })')  // false
```

这样的需求怎么解决呢？

聪明的你可能已经想出了答案，其实就是在入栈时候判断一下当前的优先级就好了。这里可能需要判断一下当前的字符和栈顶元素的关系。这里，我们如果用 Array 的 pop API，则会破坏 stack 的结构。上例中，我们用 length 来取得，这里我们用...语法来实现数组的复制，同时在上例基础上，进行一些重构，得到下列代码：

```Javascript
const isStrictBalanced = (str) => {
    const map = new Map([
        ["{", "}"],
        ["[", "]"],
        ["(", ")"]
    ])
    let stack = [], keys = [...map.keys()], values = [...map.values()];
    for(let i = 0 ; i < str.length; ++i){
        let node = str[i]
        if (map.has(node)){
            if (stack.length){
                let arr = [node, [...stack].pop()]
                    .map(el => keys.indexOf(el))

                if (arr[0] < arr[1]){
                    return false
                }
            }
            stack.push(node)
        }
        else if (values.includes(node)){
            let needKey = [...map.entries()].filter(el=>el[1]===node).pop().shift()
            if ([...stack].pop() !== needKey){
                return false
            }
            stack.pop()
        }
    }
    return stack.length === 0
}
```

从括号匹配的最简单情形，我们已经扩展到了比较复杂的括号匹配情形。至此，在逐步迭代的需求中给大家展示了栈的实际应用以及 ES6 中 Map 和扩展语法的使用。在面试的实际，即时反应很重要，也许并不拘泥于一种解法，从一点开始，逐步深入，慢慢延展，方能达到融会贯通，活学活用，这恐怕也是面试官比较看中的。
