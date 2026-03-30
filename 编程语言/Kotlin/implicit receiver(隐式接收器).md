## implicit receiver

[TOC]



Kotlin 的 implicit receiver。这是一个我们写 Kotlin 经常会用的东西，虽然你可能都没听过这个词，但你一定用过它。Kotlin 的很多高级功能，都利用到了这个概念——比如协程，协程是重度依赖它的，非常重。所以，弄明白它是个什么、怎么用、怎么去发挥它最大的价值，对我们的能力提升是非常有帮助的。





### 1. 定义：其实就是 `this`

我们从它的定义说起。它的名字 implicit receiver，直接翻译到中文的话，叫隐式的接收器或者说接收者。啥叫「接收」啊？所谓的接收，其实指的就是接收调用，或者说接受调用。接受函数的调用啊，接受属性的访问啊。比如这个 `user.name`：

```java
user.name
```



左边的 `user` 就是它的 receiver。谁的 receiver？对于 `name` 的访问的 receiver。

而 implicit receiver，隐式的 receiver，指的就是不用写也自动存在的 receiver。也就是如果我把这个 `user.` 给删了，它依然能取到某个 `User` 对象的 `name`：

```java
name
```



那么这个隐式地被应用的 `User` 对象，就是对这个 `name` 的访问的 implicit receiver，隐式的 receiver。这就是 implicit receiver 的定义。



不过，咱把脑子转个弯想一下，这其实就是啥？就是 `this` 呗？对吧？

所谓的 implicit receiver，其实就是指的这个 `this`。

但 Java 里却没有隐式 receiver 这个概念，这是在 Kotlin 才增加了的概念。为啥呢？因为 Java 里的 `this` 很简单，就叫 `this` 就行了，不需要额外的专用名字；而 Kotlin 对它进行了一些关键的拓展，在拓展的同时，为了方便描述和沟通，就也给它起了专属的名字：implicit receiver。

那么它做了什么关键拓展呢？咱来从它的基本特性说起。



------



### 2. 嵌套的 implicit receiver

`this`，或者说隐式的 receiver，是可以嵌套的，比如在 Java 里我们可以这么写：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/uPic/2024/01/31/teTGqD.jpg" alt="img" style="zoom:50%;" />

我在这个内部类的里面，想访问内部类和外部类的成员都是可以的，是吧：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/uPic/2024/01/31/aTNk9u.jpg" alt="img" style="zoom:50%;" />

这个 `innerInt` 是 `InnerClass` 里的，所以它等价于加上 `this` 的写法：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/uPic/2024/01/31/2RtRKH.jpg" alt="img" style="zoom:50%;" />

而下面的 `outerInt` 属于外面的 `OuterClass`，但为了避免歧义，Java 不允许我们直接写 `this`：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/uPic/2024/01/31/QXhRWT.png" alt="img" style="zoom:50%;" />

而需要显式地加上 `OuterClass` 的前缀：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/uPic/2024/01/31/yXE61u.png" alt="img" style="zoom:50%;" />

而上面的 `innerInt` 如果展开，前缀是 `InnerClass`：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/uPic/2024/01/31/kNA0mo.png" alt="img" style="zoom:50%;" />

也就是说，<font color="red">在内部类的里面，是有内部类和外部类的双重 `this` 的</font>。对吧？

另外，对于它们同名的成员变量或者方法，如果我也省略掉 `this`：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/uPic/2024/01/31/3ByeHC.png" alt="img" style="zoom:50%;" />

拿到的就是内部类的成员。如果想拿外部类的，就必须把 `this` 写完整：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/uPic/2024/01/31/bX6cvd.jpg" alt="img" style="zoom:50%;" />

到现在为止，做 Java 的基本是都懂的。我们继续。



在 Kotlin 里，也是一样的逻辑。只不过写法稍微变了一下：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/uPic/2024/01/31/KcY611.jpg" alt="img" style="zoom:50%;" />

所以，Java 和 Kotlin 不仅都有 implicit receiver，而且也都是能嵌套的，同一个方法里可以有多个 `this`，或者说多个 implicit receiver。对吧？

这是基本概念。



#### 2.1 Kotlin 增加的 implicit receiver 嵌套：通过函数的 receiver 指定

然后，Kotlin 对于这种嵌套，又新增了一类场景——咱刚才看的是通过内部类来嵌套是吧？Kotlin 让我们还可以直接通过函数来嵌套新的 `this`。比如你有一个在类型内部声明的扩展函数：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/uPic/2024/01/31/g6a7tT.jpg" alt="img" style="zoom:50%;" />

——这种函数叫 member extension function，成员扩展函数，其实就是字面意思：它既是成员函数又是扩展函数，对吧？

这种「成员扩展函数」有一个问题：一方面，因为它是 `Int` 的扩展函数，所以你需要对 `Int` 类型的对象才能调用它；但同时，它也是 `IntMultiplier` 的成员函数，所以你还要求你对 `IntMultiplier` 对象调用它：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/uPic/2024/01/31/VPT6wc.jpg" alt="img" style="zoom:50%;" />

也就是说，这里需要的是个双重 receiver：既要这个直接的 `Int`，又要那个外部的 `IntMultiplier`，缺一不可。——那我到底对谁调用？



Java 没有扩展函数的概念，所以不存在这种写法，但 Kotlin 是可以的。Kotlin 提供的解法是，你专门创建一个函数，并给它设置一个函数类型的参数：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/uPic/2024/01/31/VS5VtZ.jpg" alt="img" style="zoom:50%;" />

函数不用做什么特别的事，关键是执行一下它的那个函数类型的参数：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/uPic/2024/01/31/7xVu5M.jpg" alt="img" style="zoom:50%;" />

另外，你要给这个函数类型的参数，设置一个 receiver 的类型：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/uPic/2024/02/29/v3BY3V.png" alt="v3BY3V" style="zoom:50%;" />

这么一指定，就把参数的函数体内部——注意，是这个 `block` 的函数体，不是外部函数本身的函数体——在它内部强行安插了一个隐式的 receiver。换句话说，我在调用这个外部函数的时候，它的函数类型的参数的大括号里就有一个 `IntMultiplier` 类型的 `this` 了：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/uPic/2024/01/31/7dxanX.jpg" alt="img" style="zoom:50%;" />

那么，我在里面就可以这么写了：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/uPic/2024/01/31/l0C5eA.jpg" alt="img" style="zoom:50%;" />

哎，就这么通过给参数设置 receiver 的方式，我强行插了一层 `this`，不用写内部类也实现了这种「双重 `this`」的环境，是吧？

但是需要注意，这个 `this` 它也不是从空气里蹦出来的：当我们这么声明 `block` 参数的时候，就只有对 `IntMultiplier` 类型的对象才能调用它。不过咱这个例子里，外部函数正好也是在 `IntMultiplier` 类里声明的，所以直接写就行：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/uPic/2024/01/31/7Tpzd3.jpg" alt="img" style="zoom:50%;" />

但这种结构并不是必须的，你也可以用你能想到的其他方式去写这种安插。比如我可以直接给 `Int` 写个扩展函数，去插入一个 `Int` 类型的 `this`：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/uPic/2024/01/31/tX1erz.jpg" alt="img" style="zoom:50%;" />

那么我就能把里面这层 `this` 也做成隐式的了：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/uPic/2024/01/31/1JJBU7.jpg" alt="img" style="zoom:50%;" />

或者我如果不想写成扩展函数，我想把 `Int` 对象放在参数里来提供，也是行的：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/uPic/2024/01/31/ohSo92.jpg" alt="img" style="zoom:50%;" />

只要把调用的格式对应地调整一下就可以了：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/uPic/2024/01/31/GpEKSi.jpg" alt="img" style="zoom:50%;" />

写法多种多样，但套路是一样的，对吧？

通过这种写法，我们就可以任意地往代码里插入我们指定的 implicit receiver，或者说指定的 `this`，去应对「多个 `this`」的需求场景了。

而且==实际上，Kotlin 已经给我们提供了一套通用的函数。比如我例子里的代码，其实可以直接换成 `apply()` 和 `with()`==：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/uPic/2024/01/31/9PnOzD.jpg" alt="img" style="zoom:50%;" />

这两个函数 ，写 Kotlin 的应该很多人都用过吧？但是，也有很多人并不明白它本质上是怎么一回事。实际上，它就是像我刚才说的那样，通过函数类型的参数来强行插入了一层 `this`。

不管是使用 Kotlin 现成的函数还是我们自己来实现，Kotlin 允许我们通过这种「指定」的方式来手动安插新的 `this` 到代码里，而不用非得用内部类才能实现。之前 Java 里嵌套的 `this`，对应的全都是嵌套的类型结构；而 Kotlin 对能力这么一扩充，`this` 的嵌套就变得非常自由了。所以，Kotlin 引入了 implicit receiver 的概念，来方便我们对这种扩充了的场景进行描述和沟通。而本质上，所谓的 implicit receiver，指的依然是那些 `this`——那些不用写的 receiver——这个本质是没有变的。



------



### 3. 协程里的应用

Kotlin 的官方代码，以及很多第三方库，都重度地依赖这个叫做 implicit receiver 的东西。虽然我们可以说「它不就是 `this` 嘛」，但关键是，它给我们带来了很大的方便，怎么叫其实是次要的。随便举个例子，我们知道协程的启动是一定要用 `CoroutineScope` 才行的：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/uPic/2024/01/31/FM05XC.jpg" alt="img" style="zoom:50%;" />

但是为什么在协程的内部再启动新的协程，就不用写 `CoroutineScope` 了？

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/uPic/2024/01/31/804653.jpg" alt="img" style="zoom:50%;" />

因为它有一个隐式的 `CoroutineScope` 作为 `this` 被提供了：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/uPic/2024/01/31/xPdX0J.jpg" alt="img" style="zoom:50%;" />

怎么提供的？还是一样的方法：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/uPic/2024/01/31/oIgj1h.jpg" alt="img" style="zoom:50%;" />