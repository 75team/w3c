很荣幸9月中旬代表360公司参加了W3C在福冈举办的TPAC会议，由于我平时研究内容偏向视觉方向，在众多提案中对周三的HTML 3D Element & Native glTF提案比较感兴趣。下面就详细介绍下这个提案的相关内容

## 背景

随着WebGL的不断普及，电子商务、智慧城市、广告教育、影音娱乐的诸多领域都迫切地需要使用到3D技术来提升用户体验。但就现状而言，很多网站或者广告商都仅仅需要3D来展示一个简单场景或单一物体，也就是说一个3D viewer就可以满足他们的需求，为此WebGL开发者制作了一个又一个功能及其相似的3D viewer。不少人表示，这是对于人力资源、时间以及网络流量的浪费。

## glTF

glTF是一种可以减少3D格式中与渲染无关的冗余数据并且在更加适合OpenGL簇加载的一种3D文件格式。glTF的提出是源自于3D工业和媒体发展的过程中，对3D格式统一化的急迫需求。glTF是对近二十年来各种3D格式的总结，使用最优的数据结构，来保证最大的兼容性以及可伸缩性。glTF使用json格式进行描述，也可以编译成二进制的内容：bglTF。glTF可以包括场景、摄像机、动画等，也可以包括网格、材质、纹理，甚至包括了渲染技术（technique）、着色器以及着色器程序。同时由于json格式的特点，它支持预留一般以及特定供应商的扩展。

![dfe81dceb9fbc9ae8f34719dd279769a.png](evernotecid://0A50264A-821C-4E5E-9BD3-FB0B69201A18/wwwevernotecom/191752691/ENResource/p31)

在官网的截图上我们看到，在没有glTF的时候，大家都要花很长的的时间来处理模型的载入。很多的游戏引擎或者工控渲染引擎，都使用的是插件的方式来载入各种格式的模型。可是，各种格式的模型都包含了很多无关的信息。比如说.blend格式包含了场景、灯光、摄像机信息，也包含了blender的元信息，这样在载入的时候会浪费很多的载入时间。当有glTF之后，可以将模型再加工成为glTF，这样渲染的程序只需要支持glTF格式就可以很顺利地处理各种情况了。

GLTF的基础结构如下:

(1)scene：整个场景的入口点，由node构成图（树）结构（类似OSG的场景组织）组成

(2)node：场景层级中的一个节点，可以包含位置变换，可以有子节点。同时，node通过指向mesh、camera、skin来描述node的形变

(3)camera：定义渲染场景的视点配置

(4)mesh：描述了在场景中出现的几何物体，并通过accessor（访问器）来访问其真实的几何数据，通过material（材质）来确定渲染外观

(5)skin：蒙皮描述模型绑定到骨骼上的参数，用来实现骨骼动画，其真实数据也是通过访问器来获取的

(6)animation：骨骼动画，描述某个节点怎么随着时间运动

(7)accessor：访问器，定义了如何从二进制数据源中获取数据，在mesh、animation、skin中都会用到访问器。其指向buffer和bufferview，在这里面存着真正的几何数据

(8)material：材质包含了定义物体模型外观的参数，特别是纹理参数

(9)texture：包括采样器和图片，定义如何将纹理映射到模型

![6909d88aa1b772bf215ebdf7c53cf50e.png](evernotecid://0A50264A-821C-4E5E-9BD3-FB0B69201A18/wwwevernotecom/191752691/ENResource/p32)



## 两个提案

这次的小组讨论的两个提案，分别是是由来自华为的余枝强提出的HTML 3D element方案和来自Microsoft的Sushanth提出的Native GLTF，概括来说两个提案基本上是在解决同一件问题:

    如何更方便地在web上展示3D模型。
    

### X-model提案

该提案的作者余枝强认为，3D已经成为了一种广受欢迎的表现形式，人们从纯展示逐步过渡到希望与现实世界有所互动。

下面展示了云端的3D内容服务器和客户端进行交互的场景：

![bc402ed8f24f267bf38f4f87273119ef.png](evernotecid://0A50264A-821C-4E5E-9BD3-FB0B69201A18/wwwevernotecom/191752691/ENResource/p30)

但是该场景面临3大挑战：

1. 目前只有底层的3D接口，这样很不方便
2. WEB 3D的性能不够好
3. 在AR支持层面上，用于内容及交互过程的没有一种简单的实现方式

为此他提出了xmodel这个标签，希望可以用一行代码来实现3D+AR的优质用户体验，并且可以在不同设备之间进行交互。

```
    <xmodel src="mycar.gltf" ></xmodel>
    
    // Attributes
    // mode = “ar” / mode = "3d" 进入AR或者3D展示模式
    // autoplay = true 自动播放动画
    // live = true 实时模式，可以控制物体的方向
    // syncState 同步到其他设备
```

下面的图中展示了他对于xmodel实现结构的构想：

![542eea097d7265fc737d0a2a0b0f1768.png](evernotecid://0A50264A-821C-4E5E-9BD3-FB0B69201A18/wwwevernotecom/191752691/ENResource/p33)

他希望xmodel作为web 3D-AR的high level接口，成为一个3D标签。



### Native glTF

Sushanth提出的这个提案是源于 W3C workshop 的 web games 中 Yasushi Ando提出的关于在浏览器中原生支持GLTF的讨论（https://www.w3.org/2018/12/games-workshop/papers/new-html-3D-element.txt）.

```
<scene controls vrenabled width="300">
      <source src="http://example.com/Monster_small.glb" type="model/gltf-binary" media="(min-width: 320px)">
      <source src="http://example.com/Monster.gltf" type="model/gltf+json" media="(min-width: 640px)">
      Message for unsupported browsers
</scene>
```

使用这样的方案，glTF将允许JavaScript操作场景、变换位置以及触发动画。因此他希望能够在整个社区内讨论该提案的价值以及API形态。

他认为，如果实现了对glTF的原生支持，将在如下方面获益：

#### 性能
单独的一个glTF文件不止可以描述单独的一个3D物体，它甚至可以描述整个场景。因此如果可以原生支持对glTF文件描述场景的遍历及渲染，就可以利用硬件的能力（多线程及图形API）从而追求更高的性能及更为丰富的场景。

#### 模型保护
如果有了原生支持，类似EME（Encrypted Media Extensions）这样的解决方案就可以用来对3D资产进行保护，这也是众多开发者所关心的。

#### Foreign Object
和SVG中的Foreign Object这一概念一样，未来我们可以允许将HTML的内容作为3D物体的材质，在3D场景中进行渲染。

#### Dev Tools Integration
浏览器集成的开发者工具（F12）可以很大程度上提升HTML开发者的开发体验，未来我们也可以同样地在集成的开发者工具中，对场景进行debug，查看节点的属性或观察性能指标等。

#### 3D IFrames
当3D在未来普及后，我们甚至可以想象，在AR/VR的场景中，一部分空间由domain1.com提供而另外一部分由domain2.com提供。这一模型和2D中的iframes很类似，这种可以让浏览器理解不同域的内容在场景中的嵌套会成为构建虚拟实境的基石。

### 结语

这两个提案的提出，在会上以及社区内引起了广泛的讨论，对于其反对的声音包括：
+ 如同当年video标签一样，我们创建这个3D标签旨在解决简单场景中的3D物体渲染，那应该如何界定复杂场景和简单场景的区别？
+ 很多厂商都在自己的环境中通过自定义标签等不同的方案实现了这样的功能（3D viewer），那原生的标签进行支持是否是有必要的？
+ 究竟是否能提供性能和使用感的提升？
+ ……

在我看来，3D是一种趋势，现行标准针对3D层面的思考是必要且必须的。新的用户需求带来了新的挑战，3D标签这一想法未来一定会成为现实，但是具体方案还需要不断推敲，奇舞周刊也会不断关注这一方向的最新消息。

    相关参考文章：

    《glTF格式初步了解》 https://blog.csdn.net/gamesdev/article/details/50494985
    《glTF格式介绍（1）——概要》 https://blog.csdn.net/qq_31709249/article/details/86477710
    《HTML 3D Element & Native glTF会议纪要》https://www.w3.org/2019/09/18-html-3d-minutes.html