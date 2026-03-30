#  noinline 和 crossinline 



[TOC]



#### 1. 编译时常量

Java 里有个概念叫编译时常量 Compile-time Constant，直观地讲就是这个变量的值是固定不变的，并且编译器在编译的时候就能确定这个变量的值。

具体到代码上，就是这个变量需要是 final 的，类型只能是字符串或者基本类型，而且这个变量需要在声明的时候就赋值，等号右边还不能太复杂。


总之就是你得让编译器一眼瞟过去就能看出结果。这种编译时常量，会被编译器以内联的形式进行编译，也就是直接把你的值拿过去替换掉调用处的变量名来编译。这样一来，程序结构就变简单了，编译器和 JVM 也方便做各种优化。这，就是编译时常量的作用。



这种编译时常量，到了 Kotlin 里有了一个专有的关键字，叫 const：==一个变量如果以 const val 开头，它就会被编译器当做编译时常量来进行内联式编译==：

<img src="http://image.rengwuxian.com/2021/03/25/87c7dbb6ab7ac.jpg" alt="http://image.rengwuxian.com/2021/03/25/87c7dbb6ab7ac.jpg" style="zoom:50%;" />

——当然你得符合编译时常量的特征啊，不然会报错，不给编。

<img src="http://image.rengwuxian.com/2021/03/25/4379940dd7ce5.png" alt="http://image.rengwuxian.com/2021/03/25/4379940dd7ce5.png" style="zoom:50%;" />



------



#### 2.  **inline**

让变量内联用的是 const；而除了变量，Kotlin 还增加了对函数进行内联的支持。在 Kotlin 里，你==给一个函数加上 inline 关键字，这个函数就会被以内联的方式进行编译==。但！虽然同为内联，inline 关键字的作用和目的跟 const 是完全不同的。


编译时常量为什么这么多限制？因为只有符合这些限制，编译器和 JVM 才有能力做优化，从而这种内联操作也才有意义。稍微复杂一点，就优化不动了。什么叫「稍微复杂」我不知道，但是**函数**内联这种操作，绝对算得上是相当复杂了，绝对优化不动的。



其实真要较真起来，函数的内联确实会产生一种被动的优化：去掉一个函数，调用栈少了一层，性能的损耗肯定会少一些，但实际上调用栈本身所造成的性能损耗本来就是非常小的，这个优化跟没优化差不多。



这个事实可能不太符合我们的直觉，但你这样想一下：在我们看到的各种性能优化规范里，你有没有见过类似「少写几个方法来减少调用栈」这样的优化策略？没有吧？为什么？因为这种优化没有意义。


而同时，函数内联不同于常量内联的地方在于，函数体通常比常量复杂多了，而函数内联会导致函数体被拷贝到每个调用处，如果函数体比较大而被调用处又比较多，就会导致编译出的字节码变大很多。我们都知道编译结果的压缩是应用优化的一大指标，而函数内联对于这项指标是明显不利的。



所以靠 inline 来做性能优化？不存在的。那么问题就来了：inline 是干嘛用的呢？


事实上，inline 关键字不止可以内联自己的内部代码，还可以内联自己内部的内部的代码。什么叫「内部的内部」？就是自己的函数类型的参数。	


例如我把 hello() 函数的定义改成这样，给它增加一个函数类型的参数：

<img src="http://image.rengwuxian.com/2021/03/25/1c01f0d600291.jpg" alt="http://image.rengwuxian.com/2021/03/25/1c01f0d600291.jpg" style="zoom:50%;" />

相应地，在调用处也需要填上这个参数。我可以填成匿名函数的形式：

![http://image.rengwuxian.com/2021/03/26/4e78e232ee11e.png](http://image.rengwuxian.com/2021/03/26/4e78e232ee11e.png)

也可以简单点，写成 Lambda 表达式：

![http://image.rengwuxian.com/2021/03/26/3b2324c020c1f.png](http://image.rengwuxian.com/2021/03/26/3b2324c020c1f.png)

因为 Java 并没有对函数类型的变量的原生支持，Kotlin 需要想办法来让这种自己新引入的概念在 JVM 中落地。而它想的办法是什么呢？就是==用一个 JVM 对象来作为函数类型的变量的实际载体，让这个对象去执行实际的代码==。也就是说，在我对代码做了刚才那种修改之后，==程序在每次调用 hello() 的时候都会创建一个对象来执行 Lambda 表达式里的代码==，虽然这个对象是用一下之后马上就被抛弃，但它确实被创建了。


这有什么坏处？其实一般情况下也没什么坏处，多创建个对象算什么？但是你想一下，如果这种函数被放在循环里执行：

<img src="http://image.rengwuxian.com/2021/03/25/eb564f397c774.jpg" alt="http://image.rengwuxian.com/2021/03/25/eb564f397c774.jpg" style="zoom:50%;" />

内存占用是不是一下就飚起来了？而且关键是，你作为函数的创建者，并不知道、也没法规定别人在什么地方调用这个函数，也就是说，这个函数是否出现在循环或者界面刷新之类的高频场景里，是完全不可控的，这样一来……这一类函数就全都有了性能隐患了。



高阶函数是 Kotlin 相比起 Java 很方便的一个特性，但却有这么一个性能隐患，这……还让人怎么放心用啊？这就是 inline 关键字出场的时候了。

==inline 关键字不止可以内联自己的内部代码，还可以内联自己内部的内部的代码==，意思是什么呢，就是你的函数在被加了 inline 关键字之后，编译器在编译时不仅会把函数内联过来，而且会把它内部的函数类型的参数——那就是那些 Lambda 表达式——也内联过来。==换句话说，这个函数被编译器贴过来的时候是完全展开铺平的==：

<img src="http://image.rengwuxian.com/2021/03/25/270c306687c3d.png" alt="http://image.rengwuxian.com/2021/03/25/270c306687c3d.png" style="zoom:50%;" />

经过这种优化，是不是就避免了函数类型的参数所造成的临时对象的创建了？这样的话，是不是就不怕在循环或者界面刷新这样的高频场景里调用它们了？

<img src="http://image.rengwuxian.com/2021/03/25/e7b363d9830c3.jpg" alt="http://image.rengwuxian.com/2021/03/25/e7b363d9830c3.jpg" style="zoom:50%;" />



这，就是 inline 关键字的用处：

<p style="color: red; font-weight: bold;">高阶函数（Higher-order Functions）有它们天然的性能缺陷，通过 inline 关键字可让函数用内联的方式进行编译，来减少参数对象的创建，从而避免出现性能问题。 </p>



所以，inline 是用来优化的吗？是，但你不能无脑使用它，你需要确定它可以带来优化再去用它，否则可能会变成负优化。

其实换个角度想想：既然 inline 是优化，为什么 Kotlin 没有直接开启它，而要把它做成选项，而且还是个默认关闭的选项？就是因为它还真不一定是优化，加不加它需要我们自己去做判断。那怎么去做这个判断呢？很简单，<font color='red'>如果你写的是高阶函数，会有函数类型的参数，加上 inline 就对了</font>。



另外，Kotlin 的官方源码里还有一个 inline 的另类用法，在函数里直接去调用 Java 的静态方法：

<img src="http://image.rengwuxian.com/2021/03/25/b813ecbddc1fa.jpg" alt="http://image.rengwuxian.com/2021/03/25/b813ecbddc1fa.jpg" style="zoom:50%;" />

用偷天换日的方式来去掉了这些 Java 的静态方法的前缀，让调用更简单：

<img src="http://image.rengwuxian.com/2021/03/25/208bc966db81f.jpg" alt="http://image.rengwuxian.com/2021/03/25/208bc966db81f.jpg" style="zoom:50%;" />

这个很有必要跟提一下：这种用法不是 inline 被创造的初衷，也不是 inline 的核心意义，这属于一种相对偏门的另类用法。——不过这么用没什么问题啊，因为它的函数体简洁，并不会造成字节码膨胀的问题。你如果有类似的场景，也可以这么用。



------



#### 3.  **noinline**

说完 inline，我们来说另一个关键字：noinline。noinline 的意思很直白：inline 是内联，而 noinline 就是不内联。

不过它不是作用于函数的，而是作用于函数的参数：对于一个标记了 inline 的内联函数，你可以对它的任何一个或多个函数类型的参数添加 noinline 关键字：

<img src="http://image.rengwuxian.com/2021/03/25/994f82c4f8b20.png" alt="http://image.rengwuxian.com/2021/03/25/994f82c4f8b20.png" style="zoom:50%;" />

添加了之后，这个参数就不会参与内联了：

<img src="http://image.rengwuxian.com/2021/03/25/7ac0424ccba1c.png" alt="http://image.rengwuxian.com/2021/03/25/7ac0424ccba1c.png" style="zoom:50%;" />

好理解吧？好理解是好理解，（皱眉）可是这有什么用啊？为什么要关闭这种优化？

首先我们要知道，函数类型的参数，它本质上是个对象。我们可以把这个对象当做函数来调用，这也是最常见的用法：

<img src="http://image.rengwuxian.com/2021/03/25/22626dd21e981.png" alt="http://image.rengwuxian.com/2021/03/25/22626dd21e981.png" style="zoom:50%;" />

但同时我们也可以把它当做对象来用。比如把它当做返回值：

<img src="http://image.rengwuxian.com/2021/03/25/81bbcbe4e55d9.png" alt="http://image.rengwuxian.com/2021/03/25/81bbcbe4e55d9.png" style="zoom:50%;" />

但当我们把函数进行内联的时候，它内部的这些参数就不再是对象了，因为他们会被编译器拿到调用处去展开。也就是说，当你的函数被这样调用的时候：

<img src="http://image.rengwuxian.com/2021/03/25/df7405aa221e8.jpg" alt="http://image.rengwuxian.com/2021/03/25/df7405aa221e8.jpg" style="zoom:50%;" />

代码会被这样编译：

<img src="http://image.rengwuxian.com/2021/03/25/87c51bcd0e997.png" alt="http://image.rengwuxian.com/2021/03/25/87c51bcd0e997.png" style="zoom:50%;" />

哎？请问你找谁啊？

<img src="http://image.rengwuxian.com/2021/03/25/1078e24752790.jpg" alt="http://image.rengwuxian.com/2021/03/25/1078e24752790.jpg" style="zoom:50%;" />

发现问题了吗？当一个函数被内联之后，它内部的那些函数类型的参数就不再是对象了，因为它们的壳被脱掉了。换句话说，对于编译之后的字节码来说，这个对象根本就不存在。一个不存在的对象，你怎么使用？


所以当你要把一个这样的参数当做对象使用的时候，Android Studio 会报错，告诉你这没法编译

<img src="http://image.rengwuxian.com/2021/03/25/2c83ab83cbac5.png" alt="http://image.rengwuxian.com/2021/03/25/2c83ab83cbac5.png" style="zoom:50%;" />

那……我如果真的需要用这个对象怎么办？加上 noinline：

<img src="http://image.rengwuxian.com/2021/03/25/aa1ebd306b9ef.png" alt="http://image.rengwuxian.com/2021/03/25/aa1ebd306b9ef.png" style="zoom:50%;" />

加了 noinline 之后，这个参数就不会参与内联了：

<img src="http://image.rengwuxian.com/2021/03/25/57e3943a02694.jpg" alt="http://image.rengwuxian.com/2021/03/25/57e3943a02694.jpg" style="zoom:50%;" />

那我们就也可以正常使用它了。所以，noinline 的作用是什么？


<font color='red'>noinline 是用来局部地、指向性地关掉函数的内联优化的。</font>既然是优化，为什么要关掉？因为这种优化会导致函数中的函数类型的参数无法被当做对象使用，也就是说，这种优化会对 Kotlin 的功能做出一定程度的收窄。而当你需要这个功能的时候，就要手动关闭优化了。

这也是 ==inline 默认是关闭、需要手动开启的另一个原因：它会收窄 Kotlin 的功能==。


那么，我们应该怎么判断什么时候用 noinline 呢？很简单，比 inline 还要简单：你不用判断，Android Studio 会告诉你的。当你在内联函数里对函数类型的参数使用了风骚操作，Android Studio 拒绝编译的时候，你再加上 noinline 就可以了。



------



#### 4. **crossinline**

最后再来说 crossinline。这是个很有意思的关键字，刚才讲的 noinline 是局部关闭内联优化对吧？而这个 <font color='red'>crossinline，是局部加强内联优化。</font>


我们先来看代码。这里有一个内联函数，还有一个对它的调用：

<img src="http://image.rengwuxian.com/2021/03/25/37aaef195582a.png" alt="http://image.rengwuxian.com/2021/03/25/37aaef195582a.png" style="zoom:50%;" />

假如我往这个 Lambda 表达式里加一个 return：

<img src="http://image.rengwuxian.com/2021/03/25/201e423facad6.png" alt="http://image.rengwuxian.com/2021/03/25/201e423facad6.png" style="zoom:50%;" />

这个 return 会结束哪个函数的执行？是它外面的 hello() 还是再往外一层的 main()？


按照通常的规则，肯定是结束 hello() 的对吧？因为 hello() 离它近啊，return 所结束的肯定是**直接**包裹住它的那个函数。可是大家想一想，这个 hello() 是个内联函数对不对？内联函数在编译优化之后会怎么样？会被铺平是不是？而这个调用，在铺平后会变成这样：

<img src="http://image.rengwuxian.com/2021/03/25/53b6f2d9d54b3.png" alt="http://image.rengwuxian.com/2021/03/25/53b6f2d9d54b3.png" style="zoom:50%;" />

那你再看看，return 结束的是哪个函数？是外层的对吧？也就是说，对于内联函数，它的参数中 Lambda 的 return 结束的不是这个内联函数，而是那个调用这个内联函数的更外层的函数。是这个道理吧！


道理是这个道理，但这就有问题了。什么问题？我一个 return 结束哪个函数，竟然要看这个函数是不是内联函数！那岂不是我每次写这种代码都得钻到原函数里去看看有没有 inline 关键字，才能知道我的代码会怎么执行？那这也太难了吧！


这种不一致性会给我们带来极大困扰，因此 Kotlin 制定了一条规则：<font color='red'>Lambda 表达式里不允许使用 return，**除非——**这个 Lambda 是内联函数的参数</font>。

那这样的话规则就简单了：

1. ==Lambda 里的 return，结束的不是直接的外层函数，而是外层再外层的函数；==
2. ==但只有内联函数的 Lambda 参数可以使用 return。==

> *注：Lambda 可以用 return@label  的方式来显式指定返回的位置，但这个不是今天讨论的内容。*



这样就既消了歧义，也避免了需要反复查看每个函数是不是内联函数的麻烦。

不过……我们如果把事情再变复杂一点——最后一次了，不会更复杂了：

<img src="http://image.rengwuxian.com/2021/03/25/91731372432d1.png" alt="http://image.rengwuxian.com/2021/03/25/91731372432d1.png" style="zoom:50%;" />

这次，我用 runOnUiThread() 把这个参数放在了主线程执行，这是一种很常见的操作。


但，这就带来了一个麻烦：本来在调用处最后那行的 return 是要结束它外层再外层的 main() 函数的，但现在因为它被放在了 runOnUiThread() 里，hello() 对它的调用就变成了间接调用。所谓间接调用，直白点说就是它和外层的 hello() 函数之间的关系被切断了。和 hello() 的关系被切断，那就更够不着更外层的 main() 了，也就是说这个间接调用，导致 Lambda 里的 return 无法结束最外面的 main() 函数了。

<img src="http://image.rengwuxian.com/2021/03/25/0632396ff5697.png" alt="http://image.rengwuxian.com/2021/03/25/0632396ff5697.png" style="zoom:50%;" />

这就表示什么？当内联函数的 Lambda 参数在函数内部是间接调用的时候，Lambda 里面的 return 会无法按照预期的行为进行工作。


这就比较严重了，因为这造成了 Kotlin 这个语言的稳定性的问题了。结果是不可预测的，这能行吗，是吧？

那怎么办？Kotlin 的选择依然是霸气一刀切：内联函数里的函数类型的参数，不允许这种间接调用。

<img src="http://image.rengwuxian.com/2021/03/25/54916fcbf094b.png" alt="http://image.rengwuxian.com/2021/03/25/54916fcbf094b.png" style="zoom:50%;" />

解决了！解决不了问题，我就解决提出问题的人。


那我如果真的有这种需求呢？如果我真的需要间接调用，怎么办？使用 crossinline。

<font color='red'>crossinline 也是一个用在参数上的关键字。当你给一个需要被间接调用的参数加上 crossinline，就对它解除了这个限制，从而就可以对它进行间接调用了</font>：

<img src="http://image.rengwuxian.com/2021/03/25/3d355338e6c0e.png" alt="http://image.rengwuxian.com/2021/03/25/3d355338e6c0e.png" style="zoom:50%;" />

不过这就又会导致前面说过的「不一致」的问题，比如如果我在这个 Lambda 里加上一句 return：

<img src="http://image.rengwuxian.com/2021/03/25/6723ac462ebbe.png" alt="http://image.rengwuxian.com/2021/03/25/6723ac462ebbe.png" style="zoom:50%;" />



它结束的是谁？是包着它的 runOnUiThread()，还是依然是最外层的 main()？对于这种不一致，Kotlin 增加了一条额外规定：

<font color='red'>**内联函数里被 crossinline 修饰的函数类型的参数，将不再享有「Lambda 表达式可以使用 return」的福利。**</font>

所以这个 return 并不会面临「要结束谁」的问题，而是直接就不许这么写。

<img src="http://image.rengwuxian.com/2021/03/25/9b46c516f7be3.png" alt="http://image.rengwuxian.com/2021/03/25/9b46c516f7be3.png" style="zoom:50%;" />

也就是说，==间接调用和 Lambda 的 return，你只能选一个==。


那我如果就是两个都想要，怎么办呢？——这个我就没办法了，真不行。所以什么时候需要 crossinline？

当你需要突破内联函数的「不能间接调用参数」的限制的时候。但其实和 noinline 一样，你并不需要亲自去判断，只要在看到 Android Studio 给你报错的时候把它加上就行了。



------



#### 5.  **总结**

inline、noinline 和 crossinline 是三个很有用也很好用的关键字，我们在 Kotlin 的官方源码以及各种开源库的源码里也常会见到它们。

<img src="http://image.rengwuxian.com/2021/03/25/5c3d482ef115f.png" alt="http://image.rengwuxian.com/2021/03/25/5c3d482ef115f.png" style="zoom: 67%;" />

到现在，它们的含义和使用已经讲完了，过程很复杂，但结论很简单。总结下来就是：

1. `inline` 

   可以让你用内联——也就是函数内容直插到调用处——的方式来优化代码结构，从而减少函数类型的对象的创建；

2. `noinline` 

   局部关掉这个优化，来摆脱 inline 带来的「不能把函数类型的参数当对象使用」的限制；

3. `crossinline` 

   局部加强这个优化，让内联函数里的函数类型的参数可以在内联函数中间接调用。

