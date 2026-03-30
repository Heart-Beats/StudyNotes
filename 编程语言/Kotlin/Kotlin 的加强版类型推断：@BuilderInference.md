# Kotlin 的加强版类型推断：@BuilderInference



[TOC]



泛型是 Java 里一个很方便的特性，它的优势很多，其中之一就是提高了代码的复用能力，让我们只用写一个类或者接口或者方法，就能在调用时去应用到不同的类型：

```java
List<String> list1 = new ArrayList<>(); // String
List<Integer> list2 = new ArrayList<>(); // Integer
List<Service> list3 = new ArrayList<>(); // Service
TextView textView = findViewById(R.id.textView); // TextView
ImageView imageView = findViewById(R.id.imageView); // ImageView
```



这种动态应用本来就很方便了，泛型还允许我们在调用时连类型都不用指定，而是让代码自动推断：

<img src="https://rengwuxian.com/content/images/2024/11/3-2.webp" alt="img" style="zoom:50%;" />

<img src="https://rengwuxian.com/content/images/2024/11/4-1.webp" alt="img" style="zoom:50%;" />

而 Kotlin 在沿袭了 Java 泛型的这些功能的同时，还进行了多项进化，其中就包括咱这期要聊的话题：它支持一种更强、更深的类型推断。





### 1. flow() 的类型推断

Java 的类型推断，是通过上下文信息来推断类型的。比如通过方法参数的类型来推断，或者通过赋值的目标变量的类型来推断：

<img src="https://rengwuxian.com/content/images/2024/11/5-1.webp" alt="img" style="zoom:50%;" />

<img src="https://rengwuxian.com/content/images/2024/11/6-1.webp" alt="img" style="zoom:50%;" />



Kotlin 也可以做这类推断：

<img src="https://rengwuxian.com/content/images/2024/11/7-1.webp" alt="img" style="zoom:50%;" />

另外，Kotlin 还能做一种加强的推断：它不仅能看函数的参数类型，还能钻进参数里，通过参数内部的内容来做更深的类型推断。什么叫参数内部呢？就是当你的参数是函数类型的时候：

<img src="https://rengwuxian.com/content/images/2024/11/8-1.webp" alt="img" style="zoom:50%;" />

Kotlin 有能力钻到它的大括号的里面，去一行行分析里面的代码，来进行类型推断。 比如我如果只调用 flow {}，它会报错，这是因为 flow() 是个泛型函数：

<img src="https://rengwuxian.com/content/images/2024/11/9.webp" alt="img" style="zoom:50%;" />

而我既没有指明类型参数的类型，也没有给出足够的上下文让它去做类型推断。 如果我直接写明：

<img src="https://rengwuxian.com/content/images/2024/11/10.webp" alt="img" style="zoom:50%;" />

它就不报错了。 或者，我也可以在大括号里生产一个 Flow 的元素：

<img src="https://rengwuxian.com/content/images/2024/11/11.webp" alt="img" style="zoom:50%;" />

Kotlin 也可以从中推断出类型，所以也不会报错。 而这种推断，是 Java 所没有的。



------



### 2. @BuilderInference

它是怎么推断的呢？



它并不是对每一行代码都检查，而是只查看对 this 的每一次函数调用，通过这些调用来进行类型推断，然后把推断出的类型汇总之后得到外部函数的推断类型。

我这么说可能比较绕，我来举实际的例子。就还以 flow() 函数为例，它这个大括号，实际上是一个函数类型的参数，也就是这个：

<img src="https://rengwuxian.com/content/images/2024/11/12.webp" alt="img" style="zoom:50%;" />

这个函数类型的参数，它的参数类型、返回值类型、是不是挂起函数，这些对类型推断都不重要：

<img src="https://rengwuxian.com/content/images/2024/11/13.webp" alt="img" style="zoom:50%;" />

<img src="https://rengwuxian.com/content/images/2024/11/14.webp" alt="img" style="zoom:50%;" />

<img src="https://rengwuxian.com/content/images/2024/11/15.webp" alt="img" style="zoom:50%;" />

关键在于，它设置了一个 receiver 类型：

<img src="https://rengwuxian.com/content/images/2024/11/16.webp" alt="img" style="zoom:50%;" />

这么写，可以让大括号里有一个这个类型的 this，也就是所谓的 implicit receiver，隐式的 receiver。那么大括号里有了这个 FlowCollector 类型的 this，就可以在里面调用它的函数，比如我这个 emit()，生产 Flow 元素的函数，其实就是它下面的：

<img src="https://rengwuxian.com/content/images/2024/11/17.webp" alt="img" style="zoom:50%;" />

<img src="https://rengwuxian.com/content/images/2024/11/18.webp" alt="img" style="zoom:50%;" />

然后呢，这个 FlowCollector 是一个泛型类型：

![img](https://rengwuxian.com/content/images/2024/11/19.webp)

而 emit() 的参数就是它的类型参数的类型，也就是这个 T：

<img src="https://rengwuxian.com/content/images/2024/11/20.webp" alt="img" style="zoom:50%;" />

那么，Kotlin 就会在实际的调用中利用 emit() 的传入参数来作为推断出的实例化类型，也就是外面的 FlowCollector 的 T 的类型。比如我这里填入的是个字符串：

<img src="https://rengwuxian.com/content/images/2024/11/21.webp" alt="img" style="zoom:50%;" />

那么 Kotlin 就会推断出这个 T 的类型是 String：

![img](https://rengwuxian.com/content/images/2024/11/22.webp)

这种推断其实比较特殊：<font color="red">典型的类型推断，是用对象的类型来得出函数的参数和返回值类型</font>，比如用 FlowCollector 对象的实例化类型来推断出 emit() 的参数类型；而这个，它是反过来的，<font color="red">它是由函数调用来推断出对象的实例化类型</font>，**也就是由 emit() 的参数类型推断出 FlowCollector 的 T 的类型**。 这个 FlowCollector 的 T，其实是用的 flow() 函数的类型参数。所以推断出了它的 T，也就等于推断出了 flow() 函数的 T。也就是对咱这个例子来说，flow() 函数的实例化类型就是 String：

<img src="https://rengwuxian.com/content/images/2024/11/23.webp" alt="img" style="zoom:50%;" />

整个类型推断的逻辑，就是这样的。它不是直接看函数调用时的传入参数的类型，而是要求参数必须是函数类型的，然后去看这个函数类型的参数的内部代码，去进行类型推断：

<img src="https://rengwuxian.com/content/images/2024/11/24.webp" alt="img" style="zoom:50%;" />

另外，Kotlin 还要求我们必须给这个参数设置一个 receiver 类型：

<img src="https://rengwuxian.com/content/images/2024/11/25.webp" alt="img" style="zoom:50%;" />

并且，这个 receiver 还需要是泛型类型的，同时我们还要用函数的类型参数来作为它的实例化类型——或者直白地说，就是要把这个 T 写在这里：

<img src="https://rengwuxian.com/content/images/2024/11/26.webp" alt="img" style="zoom:50%;" />

这样，整个链条就全都接上了，从技术的角度，我们就可以让 Kotlin 通过在大括号里对 this 的调用来推断类型了。 而在实操的角度，Kotlin 还有一个语法上的额外要求：我们还要给参数加上一个叫 BuilderInference 的注解：

<img src="https://rengwuxian.com/content/images/2024/11/27.webp" alt="img" style="zoom:50%;" />

因为这种推断默认是不开启的，我们需要加上这个 @BuilderInference 来手动开启它。为什么这么设计？一般是出于向前兼容性、代码的复杂性和可读性以及编译性能之类的综合考虑——具体我不知道，没考证过。



因此，kotlin 的类型推断 plus 需要满足以下条件：

1. 参数必须是函数类型的
2. 这个函数类型的参数需要设置一个 receiver 类型，同时这个  receiver 为泛型类
3. 参数需要添加 BuilderInference 注解

即通用定义如下：

```kotlin
fun <T>funName(@BuilderInference block: suspend Recevier<T>.()-> Unit)
```



------



### 3. 多次调用和综合推断

咱写的是大括号里只有一次函数调用，那么就只有一次类型推断：

<img src="https://rengwuxian.com/content/images/2024/11/28.webp" alt="img" style="zoom:50%;" />

而如果我们进行多次调用，Kotlin 会对多次调用的结果进行综合之后，得出统一的推断类型：

<img src="https://rengwuxian.com/content/images/2024/11/29.webp" alt="img" style="zoom:50%;" />