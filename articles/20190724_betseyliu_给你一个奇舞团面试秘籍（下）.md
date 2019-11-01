# 给你一个奇舞团面试秘籍（下）

亲爱的小伙伴们，还记得几周之前的算法秘籍吗？有上就一定会有下，这是奇舞周刊给你们的承诺！下面的代码更多的是一些常用函数的JS实现，收到秘籍的同学快来投简历吧，我在奇舞团等着大家~

## throttle

```javascript
  function throttle(fn, threshhold) {
    var last, timerId;
    threshhold || (threshhold = 250);

    return function() {
      var now = Date.now();
      if(last && now - last < threshhold) {
        clearTimeout(timerId);
        timerId = setTimeout(() => {
          fn.apply(this, arguments);
        }, threshhold)
      } else {
        last = now;
        fn.apply(this, arguments);
      }
    }
  }
```

## debounce

```javascript
  function debounce(fn, interval) {
    var timerId = null;

    return function() {
      clearTimeout(timerId);
      timerId = setTimeout(() => {
        fn.apply(this, arguments)
      }, interval)
    }
  }
```

## call

``` javascript
  Function.prototype.call = function(cxt, ...args) {
    ctx || (ctx = window);
    ctx.fn = this;

    let args = [];
    let r = eval(`ctx.fn(${args})`);
    delete ctx.fn;

    return r;
  }

```

## apply

```javascript
  Funtion.prototype.apply = function(ctx, args) {
    ctx || (ctx = window);
    ctx.fn = this;

    let r = eval(`ctx.fn(${args})`)
    delete ctx.fn;

    return r;
  }
```

## bind
```javascript
  Funtion.prototype.bind = function(obj) {
    if(type of this !== 'function') {
      return;
    }

    var _self = this;
    var args = [].slice.call(arguments, 1);
    return function() {
      return _self.apply(obj, args.concat([].slice.call(arguments)))
    }
  }
```


## new

new做了什么：
1. 创建了一个全新的对象。
2. 这个对象会被执行[[Prototype]]（也就是__proto__）链接。
3. 生成的新对象会绑定到函数调用的this。
4. 通过new创建的每个对象将最终被[[Prototype]]链接到这个函数的prototype对象上。
5. 如果函数没有返回对象类型Object(包含Functoin, Array, Date, RegExg, Error)，那么new表达式中的函数调用会自动返回这个新的对象。



```javascript
  function newOps (ctor) {
      if(typeof ctor !== 'function') {
        throw new Error('the first param must be a function');
      }

      const new0bj = Object.create(ctor.prototype);
      const args = [].slice.call(arguments, 1);

      const ctorReturnResult = ctor.apply(newObj, args);

      if((typeof ctorReturnResult === 'object' && typeof ctorReturnResult !== null) || typeof ctorReturnResult === 'function') {
        return ctorReturnResult;
      }
      return newObj;
    }
```

## 柯里化

``` javascript
function currying(fn) {
  const argArr = [];
  let closure = function(...args) {
    if(args.length > 0) {
      argArr = [...argArr, ...args];
      return closure;
    }
    return fn(...argArr);
  }
  return closure;
}
```

## 继承

``` javascript
function Dog(color) {

  Animal.apply(this, arguments);

  this.name = 'dog';

}

/* 注意下面两行 */

Dog.prototype = Object.create(Animal.prototype);

Dog.prototype.constructor = Dog;
```

## 斐波那契数列


#### R1
``` javascript
function fib(n) {
  if(n === 0 || n === 1) return n;
  return fib(n - 2) + fib(n - 1);
}
```


#### R2

```javascript
let fib = (function() {
  let memory = []
  return function(n) {
      if(memory[n] !== undefined) {
        return memory[n]
    }
    return memory[n] = (n === 0 || n === 1) ? n : fibonacci(n-1) + fibonacci(n-2)
  }
})()

```
