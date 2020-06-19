typora-copy-images-to: upload

# Kotlin

[TOC]





### 1. 变量



#### 1.1 变量的声明与赋值

```kotlin
🏝️
var v: View
```

**注意点：**

- 使用关键字`var`声明变量
- 变量名在前，类型在后，中间以`:`分隔
- 语句结尾不需分号（`;`）

但上述此种写法会被`IDE`报错：



这是由于未对变量进行初始化，必须得给它赋值或者声明为`abstract`，既然这样就给它赋空值null：

```kotlin
🏝️
class Sample {
    var v: View = null
    // 👆这样写 IDE 仍然会报错，Null can not be a value of a non-null type View
}
```

可仍然报错，这是由于Kotlin 的空安全设计。



#### 1.2 Kotlin 的空安全设计

在 Kotlin 里面，所有的变量默认都是不允许为空的，对于一些可以为空值的变量，你可以在类型右边加一个 `?` 号，解除它的非空限制：

```kotlin
🏝️
class User {
    var name: String? = null
}
```

加了问号之后，一个 Kotlin 变量就像 Java 变量一样没有非空的限制，自由自在了。这种类型之后加 `?` 的写法，在 Kotlin 里叫**可空类型**。

由于对空引用的调用会导致空指针异常，所以 Kotlin 在可空变量直接调用的时候 IDE 会报错：

```kotlin
🏝️
var view: View? = null
view.setBackgroundColor(Color.RED)
// 👆这样写会报错，Only safe (?.) or non-null asserted (!!.) calls are allowed on a nullable receiver of type View?
```

「可能为空」的变量，Kotlin 不允许用，即使在用之前进行非空判断也不能保证多线程情况下它非空，那么 Kotlin 里是这么解决这个问题的呢？它用的不是 `.` 而是 `?.`：

```kotlin
🏝️
view?.setBackgroundColor(Color.RED)
```

上面写法同样会对变量做一次非空确认之后再调用方法，这是 Kotlin 的写法，并且它可以做到线程安全，因此这种写法叫做「**safe call**」。

另外还有一种双感叹号的用法：

```kotlin
🏝️
view!!.setBackgroundColor(Color.RED)
```

它会告诉编译器，我保证这里的 view 一定是非空的，编译器你不要帮我做检查了，有什么后果我自己承担。这种调用为非空断言「**non-null asserted call**」，实际上和 Java 没什么两样，无法享受 Kotlin 的空安全设计带来的好处（在编译时做检查，而不是运行时抛异常）。

以上就是 Kotlin 的空安全设计。



#### 1.3 延迟初始化

有些时候我们很想告诉编译器「我很确定我用的时候绝对不为空，但第一时间我没法给它赋值」，Kotlin 给我们提供了一个选项：延迟初始化：

```kotlin
🏝️
lateinit var view: View
```

这个 `lateinit` 的意思是：告诉编译器我没法第一时间就初始化，但我肯定会在使用它之前完成初始化的。

它的作用就是让 IDE 不要对这个变量检查初始化和报错。换句话说，加了这个 `lateinit` 关键字，这个变量的初始化就全靠你自己了，编译器不帮你检查了。



#### 1.4 类型推断

Kotlin 有个很方便的地方是，如果你在声明的时候就赋值，那不写变量类型也行：

```kotlin
🏝️
var name: String = "Mike"
👇
var name = "Mike"
```

这个特性叫做「类型推断」，它跟动态类型是不一样的，无法在变量初始化后赋值其他类型对象（如：先赋值字符串再赋值数字的方式在 Groovy 里是可以的），因此，Kotlin是一门静态编译型语言。



#### 1.5 val 和 var

声明变量的方式也不止 var 一种，我们还可以使用 val：

```kotlin
🏝️
val size = 18
```

val 是 Kotlin 在 Java 的「变量」类型之外，又增加的一种变量类型：只读变量。它只能赋值一次，不能修改。而 var 是一种可读可写变量。

> var 是 variable 的缩写，val 是 value 的缩写。



------



### 2. 函数



#### 2.1 函数的声明

```kotlin
🏝️
👇                      👇
fun cook(name: String): Food {
    ...
}
```

- 以 fun 关键字开头

- 返回值写在了函数和参数后面，若返回值为空，使用`Unit`，并且可以省略：

    ```kotlin
    🏝️
                👇
    fun main(): Unit {}
    // Unit 返回类型可以省略
    fun main() {}
    ```

- 函数参数也可以有可空的控制，根据前面说的空安全设计，在传递时需要注意：

    ```kotlin
    🏝️
    // 👇可空变量传给不可空参数，报错
    var myName : String? = "rengwuxian"
    fun cook(name: String) : Food {}
    cook(myName)
      
    // 👇可空变量传给可空参数，正常运行
    var myName : String? = "rengwuxian"
    fun cook(name: String?) : Food {}
    cook(myName)
    
    // 👇不可空变量传给不可空参数，正常运行
    var myName : String = "rengwuxian"
    fun cook(name: String) : Food {}
    cook(myName)
    ```



#### 2.2 属性的 getter/setter 函数

在 Java 里面的 field 经常会带有 getter/setter 函数，在 Kotlin 里，这种 getter / setter 是怎么运作的呢？

```kotlin
🏝️
class User {
    var name = "Mike"
    fun run() {
        name = "Mary"
        // 👆的写法实际上是👇这么调用的
        // setName("Mary")
        // 建议自己试试，IDE 的代码补全功能会在你打出 setn 的时候直接提示 name 而不是 setName
        
        println(name)
        // 👆的写法实际上是👇这么调用的
        // print(getName())
        // IDE 的代码补全功能会在你打出 getn 的时候直接提示 name 而不是 getName
    }
}
```

那么若想自定义 getter/setter 函数又该怎么做到呢？

```kotlin
🏝️
class User {
    var name = "Mike"
        👇
        get() {
            return field + " nb"
        }
        👇   👇 
        set(value) {
            field = "Cute " + value
        }
}
```

以上就实现了 getter/setter 函数的自定义，但格式上和 Java 有一些区别：

- getter / setter 函数有了专门的关键字 get 和 set

- getter / setter 函数位于 var 所声明的变量下面

- setter 函数参数是 value

    

前面讲过 val 是只读变量，只读的意思就是说 val 声明的变量不能进行重新赋值，也就是说不能调用 setter 函数，因此，val 声明的变量是不能重写 setter 函数的，但它可以重写 getter 函数：

```kotlin
🏝️
val name = "Mike"
    get() {
        return field + " nb"
    }
```

这就说明==val 所声明的只读变量，在取值的时候仍然可能被修改==，这也是和 Java 里的 final 的不同之处。



------



### 3. 类型



#### 3.1 基本类型

在 Kotlin 中，所有东西都是对象，Kotlin 中使用的基本类型有：数字、字符、布尔值、数组与字符串。

```kotlin
🏝️
var number: Int = 1 // 👈还有 Double Float Long Short Byte 都类似
var c: Char = 'c'
var b: Boolean = true
var array: IntArray = intArrayOf(1, 2) // 👈类似的还有 FloatArray DoubleArray CharArray 等，intArrayOf 是 Kotlin 的 built-in 函数
var str: String = "string"
```

这里有两个地方和 Java 不太一样：

- Kotlin 里的 Int 和 Java 里的 int 以及 Integer 不同，主要是在装箱方面不同。

    Java 里的 int 是 unbox 的，而 Integer 是 box 的：

    ```java
    ☕️
    int a = 1;
    Integer b = 2; // 👈会被自动装箱 autoboxing
    ```

    Kotlin 里，Int 是否装箱根据场合来定：

    ```kotlin
    🏝️
    var a: Int = 1 // unbox
    var b: Int? = 2 // box
    var list: List<Int> = listOf(1, 2) // box
    ```

    Kotlin 在语言层面简化了 Java 中的 int 和 Integer，但是我们对是否装箱的场景还是要有一个概念，因为这个牵涉到程序运行时的性能开销。

    ==**因此在日常的使用中，对于 Int 这样的基本类型，尽量用不可空变量**==。

- Java 中的数组和 Kotlin 中的数组的写法也有区别：

    ```java
    ☕️
    int[] array = new int[] {1, 2};
    ```

    而在 Kotlin 里，上面的写法是这样的：

    ```kotlin
    🏝️
    var array: IntArray = intArrayOf(1, 2)
    // 👆这种也是 unbox 的
    ```

简单来说，原先在 Java 里的基本类型，类比到 Kotlin 里面，条件满足如下之一就不装箱：

1. 不可空类型。
2. 使用 IntArray、FloatArray 等专门的基本类型数组。



#### 3.2 类和对象

现在可以来看看我们的老朋友 `MainActivity` 了，重新认识下它：

```kotlin
🏝️
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        ...
    }
}
```

我们可以对比 Java 的代码来看有哪些不同：

```java
☕️
public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        ...
    }
}
```

1. 首先是类的可见性：Java 中的 public 在 Kotlin 中可以省略，**Kotlin 的类默认是 public 的**。

2. 类的继承的写法：Java 里用的是 `extends`，而在 Kotlin 里使用 `:`，但其实 **`:` 不仅可以表示继承，还可以表示 Java 中的 `implement`**。

    

    举个例子，假设我们有一个 interface 叫 Impl：

    ```kotlin
    🏝️
    interface Impl {}
    ```

    > Kotlin 里定义一个 interface 和 Java 没什么区别。

    java中实现此接口：

    ```java
    ☕️
    public class MainActivity extends AppCompatActivity implements Impl { }
    ```

    kotlin中实现此接口：

    ```kotlin
    🏝️
    class MainActivity : AppCompatActivity(), Impl {}
    ```

    

3. 构造方法的写法不同：

    - Java 里省略了默认的构造函数：

        ```java
          ☕️
          public class MainActivity extends AppCompatActivity {
              // 👇默认构造函数
              public MainActivity() {
              }
          }
        ```

    - Kotlin 里我们注意到 AppCompatActivity 后面的 `()`，这其实也是一种省略的写法，等价于：

        ```kotlin
          🏝️                   
          class MainActivity constructor() : AppCompatActivity() {
                                  👆
          }
        ```

        不过其实更像 Java 的写法是这样的：

        ```kotlin
        🏝️
        // 👇注意这里 AppCompatActivity 后面没有 '()'
        class MainActivity : AppCompatActivity {
            constructor() {
            }
        }
        ```

        Kotlin 把构造函数单独用了一个 `constructor` 关键字来和其他的 `fun` 做区分。

    - override 的不同
        - Java 里面 `@Override` 是注解的形式。
        
        - Kotlin 里的 `override` 变成了关键字。
        
        - Kotlin 省略了 `protected` 关键字，也就是说，==**Kotlin 里的 `override` 函数的可见性是继承自父类的**==。
        
            

    除了以上这些明显的不同之外，还有一些不同点从上面的代码里看不出来，但当你写一个类去继承 `MainActivity` 时就会发现：

    

    1. Kotlin 里的 MainActivity 无法继承：
    
        ```kotlin
        🏝️
        // 👇写法会报错，This type is final, so it cannot be inherited from
        class NewActivity: MainActivity() {
    }
        ```

        原因是 ==**Kotlin 里的类默认是 final 的**==，而 Java 里只有加了 `final ` 关键字的类才是 final 的。

        那么有什么办法解除 final 限制么？我们可以使用 `open` 来做这件事：
    
        ```kotlin
        🏝️
    open class MainActivity : AppCompatActivity() {}
        ```

        这样一来，我们就可以继承了。
    
        ```kotlin
        🏝️
    class NewActivity: MainActivity() {}
        ```

        但是要注意，此时 NewActivity 仍然是 final 的，也就是说，==`open` 没有父类到子类的遗传性==。

        

        而刚才说到的 `override` 是有遗传性的：
    
        ```kotlin
        🏝️
        class NewActivity : MainActivity() {
            // 👇onCreate 仍然是 override 的
            override fun onCreate(savedInstanceState: Bundle?) {
                ...
            }
    }
        ```

        如果要关闭 `override` 的遗传性，只需要给方法前加上`final`关键字：
    
        ```kotlin
        🏝️
        open class MainActivity : AppCompatActivity() {
            // 👇加了 final 关键字，作用和 Java 里面一样，关闭了 override 的遗传性，使方法不可继承
            final override fun onCreate(savedInstanceState: Bundle?) {
                ...
            }
    }
        ```

        

    2. Kotlin 里除了新增了 `open` 关键字之外，也有和 Java 一样的 `abstract` 关键字：
    
        ```kotlin
        🏝️
        abstract class MainActivity : AppCompatActivity() {
            abstract fun test()
    }
        ```

        子类如果需要实例化同样要实现这个 abstract 函数的：
    
        ```kotlin
        🏝️
        class NewActivity : MainActivity() {
            override fun test() {}
    }
        ```

        在 Kotlin 中，实例化一个对象非常简单，没有 `new` 关键字：
    
        ```kotlin
        🏝️
        fun main() {
            var activity: Activity = NewActivity()
    }
        ```

        通过 `MainActivity` 的学习，我们知道了 Java 和 Kotlin 中关于类的声明主要关注以下几个方面：
    
        - 类的可见性和开放性
        - 构造方法
        - 继承
        - override 函数



#### 3.3 类型的判断和强转

在Kotlin当中也有多态这个特性，因此在实际工作中我们很可能会遇到需要使用子类才有的函数。



比如我们先在子类中定义一个函数：

```kotlin
🏝️
class NewActivity : MainActivity() {
    fun action() {}
}
```

那么接下来这么写是无法调用该函数的：

```kotlin
🏝️
fun main() {
    var activity: Activity = NewActivity()
    // 👆activity 是无法调用 NewActivity 的 action 方法的
}
```



- 类型判断

    此时就需要使用 `is` 关键字进行「类型判断」，并且因为编译器能够进行类型推断，可以帮助我们省略强转的写法：

    ```kotlin
    🏝️
    fun main() {
        var activity: Activity = NewActivity()
        if (activity is NewActivity) {
            // 👇的强转由于类型推断被省略了
            activity.action()
        }
    }
    ```

    

- 类型强转

    那么能不能不进行类型判断，直接进行强转调用呢？可以使用 `as` 关键字：

    ```kotlin
    🏝️
    fun main() {
        var activity: Activity = NewActivity()
        (activity as NewActivity).action()
    }
    ```

    这种写法如果强转类型操作是正确的当然没问题，但如果强转成一个错误的类型，程序就会抛出一个异常。

    

- 类型安全强转

    我们更希望能进行安全的强转，可以更优雅地处理强转出错的情况。

    这一点，Kotlin 在设计上自然也考虑到了，我们可以使用 `as?` 来解决：

    ```kotlin
    🏝️
    fun main() {
        var activity: Activity = NewActivity()
        // 👇'(activity as? NewActivity)' 之后是一个可空类型的对象，所以，需要使用 '?.' 来调用
        (activity as? NewActivity)?.action()
    }
    ```

    它的意思就是说如果强转成功就执行之后的调用，如果强转不成功就不执行。



------



### 4. Kotlin 里那些「不 Java」的写法



#### 4.1 Constructor

##### 4.1.1 构造器

- Java

    ```java
    ☕️
    public class User {
        int id;
        String name;
          👇   👇
        public User(int id, String name) {
            this.id = id;
            this.name = name;
        }
    }
    ```

- Kotlin

    ```kotlin
    🏝️
    class User {
        val id: Int
        val name: String
             👇
        constructor(id: Int, name: String) {
     //👆 没有 public
            this.id = id
            this.name = name
        }
    }
    ```

可以发现有两点不同：

1. Java 中构造器和类同名，Kotlin 中使用 `constructor` 表示。

2. Kotlin 中构造器没有 public 修饰，因为默认可见性就是公开的。

    

##### 4.1.2 初始化代码块

​	除了构造器，Java 里常常配合一起使用的 init 代码块，在 Kotlin 里的写法也有了一点点改变：你需要给它加一个 `init` 前缀。

- Java

    ```java
    ☕️
    public class User {
       👇
        {
            // 初始化代码块，先于下面的构造器执行
        }
        
        public User() {
        }
    }
    ```

- Kotlin

    ```kotlin
    🏝️
    class User {
        👇
        init {
            // 初始化代码块，先于下面的构造器执行
        }
        
        constructor() {
        }
    }
    ```

正如上面标注的那样，Kotlin 的 init 代码块和 Java 一样，都在实例化时执行，并且执行顺序都在构造器之前。



#### 4.2 final：只读变量

Kotlin 中的 `val` 和 Java 中的 `final` 类似，表示只读变量，不能修改。这里分别从成员变量、参数和局部变量来和 Java 做对比：

- Java

    ```java
    ☕️
     👇
    final int final1 = 1;
                 👇  
    void method(final String final2) {
         👇
        final String final3 = "The parameter is " + final2;
    }
    ```

- Kotlin

    ```kotlin
    🏝️
    👇
    val fina1 = 1
           // 👇 参数是没有 val 的
    fun method(final2: String) {
        👇
        val final3 = "The parameter is " + final2
    }
    ```

可以看到不同点主要有：

- final 变成了 val。

- ==Kotlin 函数参数默认是 val 类型==，所以参数前不需要写 val 关键字，Kotlin 里这样设计的原因是保证了参数不会被修改，而 Java 的参数可修改（默认没 final 修饰）会增加出错的概率。

    

从 `final` 到 `val`，只是方便了一点点，但却让它的使用频率有了巨大的改变。这种改变是会影响到代码质量的：在该加限制的地方加上限制，就可以减少代码出错的概率。

不过 `val` 和 `final` 还是有一点区别的，虽然 `val` 修饰的变量不能二次赋值，但可以通过自定义变量的 getter 函数，让变量每次被访问时，返回动态获取的值。



#### 4.3 static property / function

在 Java 里面写常量，我们用的是 `static` + `final`。而在 Kotlin 里面，除了 `final` 的写法不一样，`static` 的写法也不一样，而且是更不一样。确切地说：在 `Kotlin` 里，静态变量和静态方法这两个概念被去除了。

那如果想在 Kotlin 中像 Java 一样通过类直接引用该怎么办呢？Kotlin 的答案是 ==**`companion object`**==：

```kotlin
🏝️
class Sample {
    ...
       👇
    companion object {
        val anotherString = "Another String"
    }
}
```

为啥 Kotlin 越改越复杂了？不着急，我们先看看 `object` 是个什么东西。



##### 4.3.1 **`object`**

​	Kotlin 里的 `object` ——首字母小写的，不是大写，Java 里的 `Object` 在 Kotlin 里不用了。

> Java 中的 `Object` 在 Kotlin 中变成了 ==`Any`，和 `Object` 作用一样：作为所有类的基类==。

​	而 `object` 不是类，像 `class` 一样在 Kotlin 中属于关键字：

```kotlin
🏝️
object Sample {
    val name = "A name"
}
```

​	它的意思很直接：**创建一个类，并且创建一个这个类的对象**。这个就是 `object` 的意思：对象。

​	在代码中如果要使用这个对象，直接通过它的类名就可以访问：

```kotlin
🏝️
Sample.name
```

​	这不就是单例么，所以在 Kotlin 中创建单例不用像 Java 中那么复杂，只需要把 `class` 换成 `object` 就可以了。

​	

**使用场景：**

1. 单例类

    我们看一个单例的例子，分别用 Java 和 Kotlin 实现：

    - Java 中实现单例类（非线程安全）：

        ```java
        ☕️
        public class A {
            private static A sInstance;
            
            public static A getInstance() {
                if (sInstance == null) {
                    sInstance = new A();
                }
                return sInstance;
            }
        
            // 👇还有很多模板代码
            ...
        }
        ```

        可以看到 Java 中为了实现单例类写了大量的模版代码，稍显繁琐。

    - Kotlin 中实现单例类：

        ```kotlin
         🏝️
        // 👇 class 替换成了 object
        object A {
            val number: Int = 1
            fun method() {
                println("A.method()")
            }
        }    
        ```

        和 Java 相比的不同点有：

        - 和类的定义类似，但是把 `class` 换成了 `object` 。
        - 不需要额外维护一个实例变量 `sInstance`。
        - 不需要「保证实例只创建一次」的 `getInstance()` 方法。

        相比 Java 的实现简单多了。

        

        > 这种==通过 `object` 实现的单例是一个饿汉式的单例，并且实现了线程安全==。

2. 继承类和实现接口

    Kotlin 中不仅类可以继承别的类，可以实现接口，`object` 也可以：

    ```kotlin
    🏝️
    open class A {
        open fun method() {
            ...
        }
    }
    
    interface B {
        fun interfaceMethod()
    }
      👇      👇   👇
    object C : A(), B {
    
        override fun method() {
            ...
        }
    
        override fun interfaceMethod() {
            ...
        }
    }
    ```

    为什么 object 可以实现接口呢？简单来讲 object 其实是把两步合并成了一步，既有 class 关键字的功能，又实现了单例，这样就容易理解了。

3. 匿名类

    另外，Kotlin 还可以创建 Java 中的匿名类，只是写法上有点不同：

    - Java：

        ```java
        ☕️                                              👇 
        ViewPager.SimpleOnPageChangeListener listener = new ViewPager.SimpleOnPageChangeListener() {
            @Override // 👈
            public void onPageSelected(int position) {
                // override
            }
        };
        ```

    - Kotlin：

        ```kotlin
        🏝️          
        val listener = object: ViewPager.SimpleOnPageChangeListener() {
            override fun onPageSelected(position: Int) {
                // override
            }
        }        
        ```

        和 Java 创建匿名类的方式很相似，只不过把 `new` 换成了 `object:`：

        - Java 中 `new` 用来创建一个匿名类的对象
        - Kotlin 中 `object:` 也可以用来创建匿名类的对象

        这里的 `new ` 和 `object:` 修饰的都是接口或者抽象类。



##### 4.3.2 **`companion object`**

用 `object` 修饰的对象中的变量和函数都是静态的，但有时候，我们只想让类中的一部分函数和变量是静态的该怎么做呢：

```kotlin
🏝️
class A {
          👇
    object B {
        var c: Int = 0
    }
}
```

如上，可以在类中创建一个对象，把需要静态的变量或函数放在内部对象 B 中，外部可以通过如下的方式调用该静态变量：

```kotlin
🏝️
A.B.c
  👆
```

类中嵌套的对象可以用 `companion` 修饰：

```kotlin
🏝️
class A {
       👇
    companion object B {
        var c: Int = 0
    }
}
```

`companion` 可以理解为伴随、伴生，表示修饰的对象和外部类绑定。

但这里有一个小限制：==**一个类中最多只可以有一个伴生对象，但可以有多个嵌套对象**==。就像皇帝后宫佳丽三千，但皇后只有一个。

这样的好处是调用的时候可以省掉对象名：

```kotlin
🏝️
A.c // 👈 B 没了
```

所以，**当有 `companion` 修饰时，对象的名字也可以省略掉**：

```kotlin
🏝️
class A {
                // 👇 B 没了
    companion object {
        var c: Int = 0
    }
}
```

这就是这节最开始讲到的，Java 静态变量和方法的等价写法：`companion object` 变量和函数。但是这并不算真正意义上的静态变量和函数。

- 静态初始化

    Java 中的静态变量和方法，在 Kotlin 中都放在了 `companion object` 中。因此 Java 中的静态初始化在 Kotlin 中自然也是放在 `companion object` 中的，像类的初始化代码一样，由 `init` 和一对大括号表示：

    ```kotlin
    🏝️
    class Sample {
           👇
        companion object {
             👇
            init {
                ...
            }
        }
    }
    ```



##### 4.3.3 **top-level property / function 声明**

除了静态函数这种简便的调用方式，Kotlin 还有更方便的东西：「`top-level declaration` 顶层声明」。其实就是把属性和函数的声明不写在 `class` 里面，这个在 Kotlin 里是允许的：

```kotlin
🏝️
package com.hencoder.plus

// 👇 属于 package，不在 class/object 内
fun topLevelFuncion() {
}
```

这样写的属性和函数，不属于任何 `class`，而是==直接属于 `package`，它和静态变量、静态函数一样是全局的==，但用起来更方便：你在其它地方用的时候，就连类名都不用写：

```kotlin
🏝️
import com.hencoder.plus.topLevelFunction // 👈 直接 import 函数

topLevelFunction()
```

写在顶级的函数或者变量有个好处：在 Android Studio 中写代码时，IDE 很容易根据你写的函数前几个字母自动联想出相应的函数。这样提高了写代码的效率，而且可以减少项目中的重复代码。



- 命名相同的顶级函数

    顶级函数不写在类中可能有一个问题：如果在不同文件中声明命名相同的函数，使用的时候会不会混淆？来看一个例子：

    - 在 `org.kotlinmaster.library` 包下有一个函数 method：

        ```kotlin
        🏝️
        package org.kotlinmaster.library1
                                   👆
        fun method() {
            println("library1 method()")
        }
        ```

    - 在 `org.kotlinmaster.library2` 包下有一个同名函数：

        ```kotlin
        🏝️
        package org.kotlinmaster.library2
                                   👆
        fun method() {
            println("library2 method()")
        }
        ```

    在使用的时候如果同时调用这两个同名函数会怎么样：

    ```kotlin
    🏝️
    import org.kotlinmaster.library1.method
                               👆
    fun test() {
        method()
                           👇
        org.kotlinmaster.library2.method()
    }
    ```

    Kotlin可以看到当出现两个同名顶级函数时，IDE 会自动加上包前缀来区分，这也印证了**「顶级函数属于包**」的特性。

    

##### 4.3.4 **使用选择对比**

那在实际使用中，在 `object`、`companion object` 和 top-level 中该选择哪一个呢？简单来说按照下面这两个原则判断：

- 如果想写工具类的功能，直接创建文件，写 top-level「顶层」函数。
- 如果需要继承别的类或者实现接口，就用 `object` 或 `companion object`。



#### 4.4 静态常量

Java 中，除了上面讲到的的静态变量和方法会用到 `static`，声明常量时也会用到，那 Kotlin 中声明常量会有什么变化呢？

- Java 中声明常量：

    ```java
    ☕️
    public class Sample {
                👇     👇
        public static final int CONST_NUMBER = 1;
    }
    ```

- Kotlin 中声明常量：

    ```kotlin
    🏝️
    class Sample {
        companion object {
             👇                  // 👇
            const val CONST_NUMBER = 1
        }
    }
    
    const val CONST_SECOND_NUMBER = 2
    ```

发现不同点有：

- ==Kotlin 的常量必须声明在对象（包括伴生对象）或者「top-level 顶层」中==，因为常量是静态的。
- Kotlin 新增了修饰常量的 `const` 关键字。

除此之外还有一个区别：

- ==**Kotlin 中只有基本类型和 String 类型可以声明成常量**==。

    

原因是 Kotlin 中的常量指的是 「compile-time constant 编译时常量」，它的意思是「编译器在编译的时候就知道这个东西在每个调用处的实际值」，因此可以在编译时直接把这个值硬编码到代码里使用的地方。

而非基本和 String 类型的变量，可以通过调用对象的方法或变量改变对象内部的值，这样这个变量就不是常量了，来看一个 Java 的例子，比如一个 User 类：

```java
☕️
public class User {
    int id; // 👈 可修改
    String name; // 👈 可修改
    public User(int id, String name) {
        this.id = id;
        this.name = name;
    }
}
```

在使用的地方声明一个 `static final` 的 User 实例 `user`，它是不能二次赋值的：

```java
☕️
static final User user = new User(123, "Zhangsan");
  👆    👆
```

但是可以通过访问这个 `user` 实例的成员变量改变它的值：

```java
☕️
user.name = "Lisi";
      👆
```

所以 **Java 中的常量可以认为是「伪常量」**，因为可以通过上面这种方式改变它内部的值。而 Kotlin 的常量因为限制类型必须是基本类型，所以不存在这种问题，更符合常量的定义。



#### 4.5 数组和集合

##### 4.5.1 数组

1. 声明并创建一个 String 数组

    - Java 中的写法：

        ```java
        ☕️
        String[] strs = {"a", "b", "c"};
              👆        👆
        ```

    - Kotlin 中的写法：

        ```kotlin
        🏝️
        val strs: Array<String> = arrayOf("a", "b", "c")  //创建一个指定元素的数组
                    👆              👆
        
        val ints:IntArray = IntArray(5){i: Int -> i+1}   //创建一个指定长度的数组并初始化 （0,1,2,3,4,5）
        ```

        可以看到 Kotlin 中的数组是一个拥有泛型的类，创建函数也是泛型函数，和集合数据类型一样。

        

        将数组泛型化有什么好处呢？对数组的操作可以像集合一样功能更强大，由于泛型化，Kotlin 可以给数组增加很多有用的工具函数：

        - `get() / set()`
        - `contains()`
        - `first()`
        - `find()`

        这样数组的实用性就大大增加了。

2. 取值和修改

    Kotlin 中获取或者设置数组元素和 Java 一样，可以使用方括号加下标的方式索引：

    ```kotlin
    🏝️
    println(strs[0])
       👇      👆
    strs[1] = "B"
    ```

3. 不支持协变

    Kotlin 的数组编译成字节码时使用的仍然是 Java 的数组，但在语言层面是泛型实现，这样会失去协变 (covariance) 特性，就是子类数组对象不能赋值给父类的数组变量：

    - Kotlin

        ```kotlin
        🏝️
        val strs: Array<String> = arrayOf("a", "b", "c")
                          👆
        val anys: Array<Any> = strs // compile-error: Type mismatch
                        👆
        ```

    - 而这在 Java 中是可以的：

        ```java
        ☕️
        String[] strs = {"a", "b", "c"};
          👆
        Object[] objs = strs; // success
          👆
        ```

4. 使用场景：在一些性能需求比较苛刻的场景，并且元素类型是基本类型时，用数组好一点。不过这里要注意一点，Kotlin 中要用==专门的基本类型数组类 (`IntArray` `FloatArray` `LongArray`) 才可以免于装箱==。也就是说元素不是基本类型时，相比 `Array`，用 `List` 更方便些。



##### 4.5.2 **集合**

Kotlin 和 Java 一样有三种集合类型：List、Set 和 Map，它们的含义分别如下：

- `List` 以固定顺序存储一组元素，元素可以重复。
- `Set` 存储一组不可重复的元素，通常没有固定顺序。
- `Map` 存储 键-值 对的数据集合，键不可重复，但不同的键可以对应相同的值。



1. **List：**

    - 创建

        - Java 中创建一个列表：

            ```java
            ☕️
            List<String> strList = new ArrayList<>();
            strList.add("a");
            strList.add("b");
            strList.add("c"); // 👈 添加元素繁琐
            ```

        - Kotlin 中创建一个列表：

            ```kotlin
            🏝️            
            val strList = listOf("a", "b", "c")  //创建一个指定元素的list
            
            val strList2 = List(5){index: Int -> index+1}  //创建一个指定长度的list并初始化 [0,1,2,3,4,5]
            ```

            能看到的是 Kotlin 中创建一个 `List` 特别的简单，有点像创建数组的代码。

    - 协变

        ​	 Kotlin 中的 `List` 多了一个特性：支持 covariant（协变）。也就是说，可以把子类的 `List` 赋值给父类的 `List` 变量：

        - Kotlin：

            ```kotlin
            🏝️
            val strs: List<String> = listOf("a", "b", "c")
                            👆
            val anys: List<Any> = strs // success
                           👆
            ```

        - 而这在 Java 中是会报错的：

            ```java
            ☕️
            List<String> strList = new ArrayList<>();
                   👆
            List<Object> objList = strList; // 👈 compile error: incompatible types
                  👆  
            ```

            对于协变的支持与否，`List` 和数组刚好反过来了。

    - 和数组的区别：Kotlin 中数组和 MutableList 的 API 是非常像的，主要的区别是==数组的元素个数不能变==。

        

2. Set

    - 创建

        - Java 中创建一个 `Set`：

            ```java
            ☕️
            Set<String> strSet = new HashSet<>();
            strSet.add("a");
            strSet.add("b");
            strSet.add("c");
            ```

        - Kotlin 中创建相同的 `Set`：

            ```kotlin
            🏝️           
            val strSet = setOf("a", "b", "c")  
            ```

    - 协变

        和 `List` 类似，`Set` 同样具有 covariant（协变）特性。

        

3. Map

    - 创建

        - Java 中创建一个 `Map`：

            ```java
            ☕️
            Map<String, Integer> map = new HashMap<>();
            map.put("key1", 1);
            map.put("key2", 2);
            map.put("key3", 3);
            map.put("key4", 3);
            ```

        - Kotlin 中创建一个 `Map`：

            ```kotlin
            🏝️         
            val map = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key4" to 3)
            ```

            和上面两种集合类型相似创建代码很简洁。`mapOf` 的每个参数表示一个键值对，`to` 表示将「键」和「值」关联，这个叫做「中缀表达式」。

    - 取值和修改

        - Kotlin 中的 Map 除了和 Java 一样可以使用 `get()` 根据键获取对应的值，还可以使用方括号的方式获取：

            ```kotlin
            🏝️
                             👇
            val value1 = map.get("key1")
                           👇
            val value2 = map["key2"]
            ```

        - 类似的，Kotlin 中也可以用方括号的方式改变 `Map` 中键对应的值：

            ```kotlin
            🏝️       
                          👇
            val map = mutableMapOf("key1" to 1, "key2" to 2)
                👇
            map.put("key1", 2)
               👇
            map["key1"] = 2    
            ```

            这里用到了「操作符重载」的知识，实现了和数组一样的「Positional Access Operations」。

            

4. 可变集合/不可变集合

    上面修改 `Map` 值的例子中，创建函数用的是 `mutableMapOf()` 而不是 `mapOf()`，因为只有 `mutableMapOf()` 创建的 `Map` 才可以修改。Kotlin 中集合分为两种类型：只读的和可变的。这里的只读有两层意思：

    - 集合的 size 不可变

    - 集合中的元素值不可变

        

    以下是三种集合类型创建不可变和可变实例的例子：

    - `listOf()`： 创建不可变的 `List`，`mutableListOf()`： 创建可变的 `List`。

    - `setOf()` ：创建不可变的 `Set`，`mutableSetOf()` ：创建可变的 `Set`。

    - `mapOf()`： 创建不可变的 `Map`，`mutableMapOf()`： 创建可变的 `Map`。

        

    可以看到，有 `mutable` 前缀的函数创建的是可变的集合，没有 `mutbale` 前缀的创建的是不可变的集合，不过不可变的可以通过 `toMutable*()` 系函数转换成可变的集合：

    ```kotlin
    🏝️
    val strList = listOf("a", "b", "c")
                👇
    strList.toMutableList()
    
    val strSet = setOf("a", "b", "c")
                👇
    strSet.toMutableSet()
    
    val map = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key4" to 3)
             👇
    map.toMutableMap()
    ```

    然后就可以对集合进行修改了，这里有一点需要注意下：

    - `toMutable*()` ：==返回的是一个新建的集合，原有的集合还是不可变的==，所以只能对函数返回的集合修改。

    

5. `Sequence`

    除了集合 Kotlin 还引入了一个新的容器类型 `Sequence`，它和 `Iterable` 一样用来遍历一组数据并可以对每个元素进行特定的处理，先来看看如何创建一个 `Sequence`。

    - 创建

        - 类似 `listOf()` ，使用一组元素创建：

            ```kotlin
            🏝️
            sequenceOf("a", "b", "c")
            ```

        - 使用 `Iterable` 创建：

            ```kotlin
            🏝️
            val list = listOf("a", "b", "c")
            list.asSequence()
            ```

            这里的 `List` 实现了 `Iterable` 接口。

        - 使用 lambda 表达式创建：

            ```kotlin
            🏝️                          // 👇 第一个元素
            val sequence = generateSequence(0) { it + 1 }
                                              // 👆 lambda 表达式，负责生成第二个及以后的元素，it 表示前一个元素
            ```



#### 4.6  可见性修饰符

 Kotlin 中的可见性修饰符，Kotlin 中有四种可见性修饰符：

- `public `：公开，可见性最大，哪里都可以引用。
- `private`：私有，可见性最小，根据声明位置不同可分为类中可见和文件中可见。
- `protected`：保护，相当于 `private` + 子类可见。
- `internal`：内部，仅对 module 内可见。



1.  `public`

    Java 中没写可见性修饰符时，表示包内可见，只有在同一个 `package` 内可以引用；

    Kotlin 中如果不写可见性修饰符，就表示公开，和 Java 中 `public` 修饰符具有相同效果。在 Kotlin 中 `public` 修饰符「可以加，但没必要」。

2.  `private`

    - Java 中的 `private` 表示类中可见，作为内部类时对外部类「可见」。

    - ==Kotlin 中的 `private` 表示类中或所在文件内可见，作为内部类时对外部类「不可见」==。

        `private` 修饰的变量「类中可见」和 「文件中可见」:

        ```kotlin
        🏝️
        class Sample {
            private val propertyInClass = 1 // 👈 仅 Sample 类中可见
        }
        
        private val propertyInFile = "A string." // 👈 范围更大，整个文件可见
        ```

    - ==可以修饰外部类和接口==

        - Java 中一个文件只允许一个外部类，所以 `class` 和 `interface` 不允许设置为 `private`，因为声明 `private` 后无法被外部使用，这样就没有意义了。

        - Kotlin 允许同一个文件声明多个 `class` 和 top-level 的函数和属性，所以 Kotlin 中允许类和接口声明为 `private`，因为同个文件中的其它成员可以访问：

            ```kotlin
            🏝️                   
            private class Sample {
                val number = 1
                fun method() {
                    println("Sample method()")
                }
            }
                        // 👇 在同一个文件中，所以可以访问
            val sample = Sample()
            ```

3.  `protected`

    - Java 中 `protected` 表示包内可见 + 子类可见。

    - Kotlin 中 `protected` 表示 `private` + 子类可见。

        Kotlin 相比 Java `protected` 的可见范围收窄了，原因是 Kotlin 中不再有「包内可见」的概念了，相比 Java 的可见性着眼于 `package`，Kotlin 更关心的是 module。

4.  `internal`

    在 Android 的官方 sdk 中，有一些方法只想对 sdk 内可见，不想开放给用户使用（因为这些方法不太稳定，在后续版本中很有可能会修改或删掉）。为了实现这个特性，会在方法的注释中添加一个 Javadoc 方法 `@hide`，用来限制客户端访问：

    ```java
    ☕️
    /**
    * @hide 👈
    */
    public void hideMethod() {
        ...
    }
    ```

    但这种限制不太严格，可以通过反射访问到限制的方法。针对这个情况，Kotlin 引进了一个更为严格的可见性修饰符：`internal`。

    

    `internal` 表示修饰的类、函数仅对 module 内可见，这里的 module 具体指的是一组共同编译的 kotlin 文件，常见的形式有：

    - Android Studio 里的 module
    - Maven project

    > 我们常见的是 Android Studio 中的 module 这种情况，Maven project 仅作了解就好，不用细究。

    `internal` 在写一个 library module 时非常有用，当需要创建一个函数仅开放给 module 内部使用，不想对 library 的使用者可见，这时就应该用 `internal` 可见性修饰符。



------



### 5. Kotlin 中那些「更方便的」用法



#### 5.1 构造器

##### 5.1.1 主构造器

```kotlin
🏝️
               👇       
class User constructor(name: String) {
    //                  👇 这里与构造器中的 name 是同一个
    var name: String = name
}
```

这里有几处不同点：

- `constructor` 构造器移到了类名之后
- 类的属性 `name` 可以引用构造器中的参数 `name`

这个写法叫「主构造器 primary constructor」。之前写在类中的构造器被称为「次构造器」。在 ==Kotlin 中一个类最多只能有 1 个主构造器（也可以没有）==，而次构造器是没有个数限制。

主构造器中的参数除了可以在类的属性中使用，还可以在 `init` 代码块中使用：

```kotlin
🏝️
class User constructor(name: String) {
    var name: String
    init {
        this.name = name
    }
}
```

其中 `init` 代码块是紧跟在主构造器之后执行的，这是因为主构造器本身没有代码体，`init` 代码块就充当了主构造器代码体的功能。

另外，==如果类中有主构造器，那么其他的次构造器都需要通过 `this` 关键字调用主构造器，可以直接调用或者通过别的次构造器间接调用==。如果不调用 IDE 就会报错：

```kotlin
🏝️
class User constructor(var name: String) {
    constructor(name: String, id: Int) {
    // 👆这样写会报错，Primary constructor call expected
    }
}
```

我们从主构造器的特性出发，一旦在类中声明了主构造器，就包含两点：

- 必须性：创建类的对象时，不管使用哪个构造器，都需要主构造器的参与
- 第一性：在类的初始化过程中，首先执行的就是主构造器

这也就是主构造器的命名由来。



当一个类中同时有主构造器与次构造器的时候，需要这样写：

```kotlin
🏝️
class User constructor(var name: String) {
                                   // 👇  👇 直接调用主构造器
    constructor(name: String, id: Int) : this(name) {
    }
                                                // 👇 通过上一个次构造器，间接调用主构造器
    constructor(name: String, id: Int, age: Int) : this(name, id) {
    }
}
```

在使用次构造器创建对象时，`init` 代码块是先于次构造器执行的。所以初始化执行顺序：==主构造器 --> `init`代码块 -->次构造器==

通常情况下，主构造器中的 `constructor` 关键字可以省略：

```kotlin
🏝️
class User(name: String) {
    var name: String = name
}
```

但有些场景，`constructor` 是不可以省略的，例如在主构造器上使用「可见性修饰符」或者「注解」：

- 可见性修饰符我们之前已经讲过，它修饰普通函数与修饰构造器的用法是一样的，这里不再详述：

    ```kotlin
    🏝️
    class User private constructor(name: String) {
    //           👆 主构造器被修饰为私有的，外部就无法调用该构造器
    }
    ```



##### 5.1.2 主构造器里声明属性

之前讲了主构造器中的参数可以在属性中进行赋值，其实还可以在主构造器中直接声明属性：

```kotlin
🏝️
           👇
class User(var name: String) {
}
// 等价于：
class User(name: String) {
  var name: String = name
}
```

如果在主构造器的参数声明时加上 `var` 或者 `val`，就等价于在类中创建了该名称的属性（property），并且初始值就是主构造器中该参数的值。



#### 5.2 函数简化

##### 5.2.1 使用 `=` 连接返回值

我们已经知道了 Kotlin 中函数的写法：

```kotlin
🏝️
fun area(width: Int, height: Int): Int {
    return width * height
}
```

其实，这种只有一行代码的函数，还可以这么写：

```kotlin
🏝️
                                      👇
fun area(width: Int, height: Int): Int = width * height
```

`{}` 和 `return` 没有了，使用 `=` 符号连接返回值。

我们之前讲过，Kotlin 有「类型推断」的特性，那么这里函数的返回类型还可以隐藏掉：

```kotlin
🏝️
//                               👇省略了返回类型
fun area(width: Int, height: Int) = width * height
```

不过，在实际开发中，还是推荐显式地将返回类型写出来，增加代码可读性。



##### 5.2.2 参数默认值

Java 中，允许在一个类中定义多个名称相同的方法，但是参数的类型、个数或顺序必须不同，这就是方法的重载：

```java
☕️
public void sayHi(String name) {
    System.out.println("Hi " + name);
}

public void sayHi() {
    sayHi("world"); 
}
```

在 Kotlin 中，也可以使用这样的方式进行函数的重载，不过还有一种更简单的方式，那就是「参数默认值」：

```kotlin
🏝️
                           👇
fun sayHi(name: String = "world") = println("Hi " + name)
```

这里的 `world` 是参数 `name` 的默认值，当调用该函数时不传参数，就会使用该默认值。

这就等价于上面 Java 写的重载方法，当调用 `sayHi` 函数时，参数是可选的：

```kotlin
🏝️
sayHi("kaixue.io")
sayHi() // 使用了默认值 "world"
```

既然与重载函数的效果相同，那 Kotlin 中的参数默认值有什么好处呢？仅仅只是少写了一些代码吗？

其实在 Java 中，每个重载方法的内部实现可以各不相同，这就无法保证重载方法内部设计上的一致性，而 Kotlin 的参数默认值就解决了这个问题。



##### 5.2.3 命名参数

具体用法如下：

```kotlin
🏝️
fun sayHi(name: String = "world", age: Int) {
    ...
}
      👇   
sayHi(age = 21)  //直接sayHi(21) IDE会报错参数不匹配
```

在调用函数时，显式地指定了参数 `age` 的名称，无需关心参数的位置，这就是「命名参数」。Kotlin 中的每一个函数参数都可以作为命名参数。



再来看一个有非常多参数的函数的例子：

```kotlin
🏝️ 
fun sayHi(name: String = "world", age: Int, isStudent: Boolean = true, isFat: Boolean = true, isTall: Boolean = true) {
    ...
}
```

对于这个函数的调用，我们一般使用与命名参数相对的==「位置参数」==，也就是按位置顺序填写参数进行调用：

```kotlin
🏝️
sayHi("world", 21, false, true, false)
```

当看到后面一长串的布尔值时，我们很难分清楚每个参数的用处，可读性很差。所以我们最好通过命名参数进行调用：

```kotlin
🏝️
sayHi(name = "wo", age = 21, isStudent = false, isFat = true, isTall = false)
```

可有些时候我们并不想把每个命名参数都写出，这时就需要混用位置参数与命名参数了。当一个函数被调用时，如果混用位置参数与命名参数，那么所有的命名参数都应该放在位置参数之后：

```kotlin
🏝️
fun sayHi(name: String = "world", age: Int) {
    ...
}

sayHi(name = "wo", 21) // 👈 IDE 会报错，Mixing named and positioned arguments is not allowed
sayHi("wo", age = 21) // 👈 这是正确的写法
```

因此，在定义函数时，我们最好将默认参数放在参数列表的最后，这样不仅可以避免混用位置参数与命名参数带来的错误，还可以在调用函数时使用参数默认值更简单：

```kotlin
🏝️
fun sayHi(age: Int, name: String = "world") {
    ...
}
      👇   
sayHi(21)  //不同于默认参数在前面，此种写法不会报错
```



##### 5.2.4 本地函数（嵌套函数）

首先来看下这段代码，这是一个简单的登录的函数：

```kotlin
🏝️
fun login(user: String, password: String, illegalStr: String) {
    // 验证 user 是否为空
    if (user.isEmpty()) {
        throw IllegalArgumentException(illegalStr)
    }
    // 验证 password 是否为空
    if (password.isEmpty()) {
        throw IllegalArgumentException(illegalStr)
    }
}
```

该函数中，检查参数这个部分有些冗余，我们又不想将这段逻辑作为一个单独的函数对外暴露。这时可以使用嵌套函数，在 `login` 函数内部声明一个函数：

```kotlin
🏝️
fun login(user: String, password: String, illegalStr: String) {
    fun validate(value: String) {
        if (value.isEmpty()) {
                                              👇
            throw IllegalArgumentException(illegalStr)
        }
    }
    validate(user)
    validate(password)
}
```



#### 5.3 字符串

##### 5.3.1 字符串模板

在 Java 中，字符串与变量之间是使用 `+` 符号进行拼接的，Kotlin 中也是如此：

```kotlin
🏝️
val name = "world"
println("Hi " + name)
```

但是当变量比较多的时候，可读性会变差，写起来也比较麻烦。

Java 给出的解决方案是 `String.format`：

```java
☕️
System.out.print(String.format("Hi %s", name));
```

Kotlin 为我们提供了一种更加方便的写法：

```kotlin
🏝️
val name = "world"
//         👇 用 '$' 符号加参数的方式
println("Hi $name")
```

这种方式就是把 `name` 从后置改为前置，简化代码的同时增加了字符串的可读性。

除了变量，`$` 后还可以跟表达式，但表达式是一个整体，所以我们要用 `{}` 给它包起来：

```kotlin
🏝️
val name = "world"
println("Hi ${name.length}") 
```

其实就跟四则运算的括号一样，提高语法上的优先级，而单个变量的场景可以省略 `{}`。



字符串模板还支持转义字符，比如使用转义字符 `\n` 进行换行操作：

```kotlin
🏝️
val name = "world!\n"
println("Hi $name") // 👈 会多打一个空行
```

字符串模板的用法对于我们 Android 工程师来说，其实一点都不陌生。

首先，Gradle 所用的 Groovy 语言就已经有了这种支持：

```groovy
def name = "world"
println "Hi ${name}"
```

在 Android 的资源文件里，定义字符串也有类似用法：

```xml
<string name="hi">Hi %s</string> 
```

```java
☕️
getString(R.id.hi, "world");
```



##### 5.3.2 raw string (原生字符串)

有时候我们不希望写过多的转义字符，这种情况 Kotlin 通过「原生字符串」来实现。

用法就是使用一对 `"""` 将字符串括起来：

```kotlin
🏝️
val name = "world"
val myName = "kotlin"
           👇
val text = """
      Hi $name!
    My name is $myName.\n
"""
println(text)
```

这里有几个注意点：

- 输出的内容与写的内容完全一致，转义字符不会被转义

- ==`$` 符号引用变量仍然生效==

    

这就是「原生字符串」。输出结果如下：

```
      Hi world!
    My name is kotlin.\n
```

但对齐方式看起来不太优雅，原生字符串还可以通过 `trimMargin()` 函数去除每行前面的空格：

```kotlin
🏝️
val text = """
     👇 
      |Hi world!
    |My name is kotlin.
""".trimMargin()
println(text)
```

输出结果如下：

```
Hi world!
My name is kotlin.
```

这里的 `trimMargin()` 函数有以下几个注意点：

- `|` 符号为默认的边界前缀，输出时 `|` 符号以及它前面的空格都会被删除
- 边界前缀还可以使用其他字符，比如 `trimMargin("/")`，默认参数为“|”



#### 5.4 数组和集合

##### 5.4.1 数组与集合的操作符

首先声明如下 `IntArray` 和 `List`：

```kotlin
🏝️
val intArray = intArrayOf(1, 2, 3)
val strList = listOf("a", "b", "c")
```

接下来，对它们的操作函数进行讲解：

- `forEach`：遍历每一个元素

    ```kotlin
    🏝️
    //              👇 lambda 表达式，i 表示数组的每个元素
    intArray.forEach { i ->
        print(i + " ")
    }
    // 输出：1 2 3 
    ```

    除了「lambda」表达式，这里也用到了「闭包」的概念，这又是另一个话题了，这里先不展开。

- `filter`：对每个元素进行过滤操作，如果 lambda 表达式中的条件成立则留下该元素，否则剔除，最终生成新的集合

    ```kotlin
    🏝️
    // [1, 2, 3]
          ⬇️
    //  {2, 3}
    
    //            👇 注意，这里变成了 List
    val newList: List = intArray.filter { i ->
        i != 1 // 👈 过滤掉数组中等于 1 的元素
    }
    ```

- `map`：遍历每个元素并执行给定表达式，最终形成新的集合

    ```kotlin
    🏝️
    //  [1, 2, 3]
           ⬇️
    //  {2, 3, 4}
    
    val newList: List = intArray.map { i ->
        i + 1 // 👈 每个元素加 1
    }
    ```

- `flatMap`：遍历每个元素，并为每个元素创建新的集合，最后合并到一个集合中

    ```kotlin
    🏝️
    //          [1, 2, 3]
                   ⬇️
    // {"2", "a" , "3", "a", "4", "a"}
    
    intArray.flatMap { i ->
        listOf("${i + 1}", "a") // 👈 生成新集合
    }
    ```

这里是以数组 `intArray` 为例，集合 `strList` 也同样有这些操作函数。Kotlin 中还有许多类似的操作函数，这里就不一一列举了。



##### 5.4.2 Range

在 Java 语言中并没有 `Range` 的概念，Kotlin 中的 `Range` 表示区间的意思，也就是范围。区间的常见写法如下：

```kotlin
🏝️
              👇      👇
val range: IntRange = 0..1000 
```

这里的 `0..1000` 就表示从 0 到 1000 的范围，**包括 1000**，数学上称为闭区间 [0, 1000]。除了这里的 `IntRange` ，还有 `CharRange` 以及 `LongRange`。

Kotlin 中没有纯的开区间的定义，不过有半开区间的定义：

```kotlin
🏝️
                         👇
val range: IntRange = 0 until 1000 
```

这里的 `0 until 1000` 表示从 0 到 1000，但**不包括 1000**，这就是半开区间 [0, 1000) 。



`Range` 这个东西，天生就是用来遍历的：

```kotlin
🏝️
val range = 0..1000
//     👇 默认步长为 1，输出：0, 1, 2, 3, 4, 5, 6, 7....1000,
for (i in range) {
    print("$i, ")
}
```

这里的 `in` 关键字可以与 `for` 循环结合使用，表示挨个遍历 `range` 中的值。除了使用默认的步长 1，还可以通过 `step` 设置步长：

```kotlin
🏝️
val range = 0..1000
//               👇 步长为 2，输出：0, 2, 4, 6, 8, 10,....1000,
for (i in range step 2) {
    print("$i, ")
}
```

以上是递增区间，Kotlin 还提供了递减区间 `downTo` ，不过递减没有半开区间的用法:

```kotlin
🏝️
//            👇 输出：4, 3, 2, 1, 
for (i in 4 downTo 1) {
    print("$i, ")
}
```

其中 `4 downTo 1` 就表示递减的闭区间 [4, 1]。这里的 `downTo` 以及上面的 `step` 都叫做「中缀表达式」，之后会做介绍。



##### 5.4.3 `Sequence`

==序列 `Sequence` 又被称为「惰性集合操作」==，关于什么是惰性，我们通过下面的例子来理解：

```kotlin
🏝️
val sequence = sequenceOf(1, 2, 3, 4)
val result: Sequence<Int> = sequence
    .map { i ->
        println("Map $i")
        i * 2 
    }
    .filter { i ->
        println("Filter $i")
        i % 3  == 0 
    }
👇
println(result.first()) // 👈 只取集合的第一个元素
```

- ==惰性的概念首先就是说定义时不会立即执行，它只是定义了一个执行流程==，只有 `result` 被使用到的时候才会执行

- 当「👇」的 `println` 执行时数据处理流程是这样的：

    - 取出元素 1 -> map 为 2 -> filter 判断 2 是否能被 3 整除
    - 取出元素 2 -> map 为 4 -> filter 判断 4 是否能被 3 整除
    - ...

    ==惰性指当出现满足条件的第一个元素的时候，`Sequence` 就不会执行后面的元素遍历了==，即跳过了 `4` 的遍历。

    

    而 `List` 是没有惰性的特性的：

    ```kotlin
    🏝️
    val list = listOf(1, 2, 3, 4)
    val result: List = list
        .map { i ->
            println("Map $i")
            i * 2 
        }
        .filter { i ->
            println("Filter $i")
            i % 3  == 0 
        }
    👇
    println(result.first()) // 👈 只取集合的第一个元素
    ```

    包括两点：

    - 声明之后立即执行

    - 数据处理流程如下：

        - {1, 2, 3, 4} -> {2, 4, 6, 8}

        - 遍历判断是否能被 3 整除

            

    `Sequence` 这种类似懒加载的实现有下面这些优点：

    - 一旦满足遍历退出的条件，就可以省略后续不必要的遍历过程。
    - 像 `List` 这种实现 `Iterable` 接口的集合类，每调用一次函数就会生成一个新的 `Iterable`，下一个函数再基于新的 `Iterable` 执行，每次函数调用产生的临时 `Iterable` 会导致额外的内存消耗，而 `Sequence` 在整个流程中只有一个。

    因此，==`Sequence` 这种数据类型可以在数据量比较大或者数据量未知的时候，作为流式处理的解决方案==。



#### 5.5 条件控制

##### 5.5.1 `if/else`

首先来看下 Java 中的 `if/else` 写法：

```java
☕️
int max;
if (a > b) {
    max = a;
} else {
    max = b;
}
```

在 Kotlin 中，这么写当然也可以，不过，==Kotlin 中 `if` 语句还可以作为一个表达式赋值给变量==：

```kotlin
🏝️
       👇
val max = if (a > b) a else b
```

另外，Kotlin 中弃用了三元运算符（条件 ? 然后 : 否则），不过我们可以使用 `if/else` 来代替它。

上面的 `if/else` 的分支中是一个变量，其实还可以是一个代码块，代码块的最后一行会作为结果返回：

```kotlin
🏝️
val max = if (a > b) {
    println("max:a")
    a // 👈 返回 a
} else {
    println("max:b")
    b // 👈 返回 b
}
```



##### 5.5.2 `when`

在 Java 中，用 `switch` 语句来判断一个变量与一系列值中某个值是否相等：

```java
☕️
switch (x) {
    case 1: {
        System.out.println("1");
        break;
    }
    case 2: {
        System.out.println("2");
        break;
    }
    default: {
        System.out.println("default");
    }
}
```

在 Kotlin 中变成了 `when`：

```kotlin
🏝️
👇
when (x) {
   👇
    1 -> { println("1") }
    2 -> { println("2") }
   👇
    else -> { println("else") }
}
```

这里与 Java 相比的不同点有：

- 省略了 `case` 和 `break`，前者比较好理解，后者的意思是 Kotlin 自动为每个分支加上了 `break` 的功能，防止我们像 Java 那样写错
- Java 中的默认分支使用的是 `default` 关键字，Kotlin 中使用的是 `else`



与 `if/else` 一样，`when` 也可以作为表达式进行使用，分支中最后一行的结果作为返回值。需要注意的是，这时就必须要有 `else` 分支，使得无论怎样都会有结果返回，除非已经列出了所有情况：

```kotlin
🏝️
val value: Int = when (x) {
    1 -> { x + 1 }
    2 -> { x * 2 }
    else -> { x + 5 }
}
```

 Kotlin 中多种情况执行同一份代码时，可以将多个分支条件放在一起，用 `,` 符号隔开，表示这些情况都会执行后面的代码：

```kotlin
🏝️
when (x) {
    👇
    1, 2 -> print("x == 1 or x == 2")
    else -> print("else")
}
```



在 `when` 语句中，我们还可以使用表达式作为分支的判断条件：

- 使用 `in` 检测是否在一个区间或者集合中：

    ```kotlin
    🏝️
    when (x) {
       👇
        in 1..10 -> print("x 在区间 1..10 中")
       👇
        in listOf(1,2) -> print("x 在集合中")
       👇 // not in
        !in 10..20 -> print("x 不在区间 10..20 中")
        else -> print("不在任何区间上")
    }
    ```

- 或者使用 `is` 进行特定类型的检测：

    ```kotlin
    🏝️
    val isString = when(x) {
        👇
        is String -> true
        else -> false
    }
    ```

- 还可以省略 `when` 后面的参数，每一个分支条件都可以是一个布尔表达式：

    ```kotlin
    🏝️
    when {
       👇
        str1.contains("a") -> print("字符串 str1 包含 a")
       👇
        str2.length == 3 -> print("字符串 str2 的长度为 3")
    }
    ```

当分支的判断条件为表达式时，哪一个条件先为 `true` 就执行哪个分支的代码块。



##### 5.5.3 `for`

我们知道 Java 对一个集合或数组可以这样遍历：

```kotlin
☕️
int[] array = {1, 2, 3, 4};
for (int item : array) {
    ...
}
```

而 Kotlin 中 对数组的遍历是这么写的：

```kotlin
🏝️
val array = intArrayOf(1, 2, 3, 4)
          👇
for (item in array) {
    ...
}
```

这里与 Java 有几处不同：

- 在 Kotlin 中，表示单个元素的 `item` ，不用显式的声明类型

- Kotlin 使用的是 `in` 关键字，表示 `item` 是 `array` 里面的一个元素

    

另外，Kotlin 的 `in` 后面的变量可以是任何实现 `Iterable` 接口的对象。

在 Java 中，我们还可以这么写 `for` 循环：

```kotlin
☕️
for (int i = 0; i <= 10; i++) {
    // 遍历从 0 到 10
}
```

但 Kotlin 中没有这样的写法，那应该怎样实现一个 0 到 10 的遍历呢？

其实使用上面讲过的区间就可以实现啦，代码如下：

```kotlin
🏝️
for (i in 0..10) {
    println(i)
}
```

还可以使用`repeat`来实现简单的重复达到此效果：

```kotlin
repeat(10){ i ->
    println(i)
}
```



##### 5.5.4 `try-catch`

关于 `try-catch` 我们都不陌生，在平时开发中难免都会遇到异常需要处理，那么在 Kotlin 中是怎样处理的呢，先来看下 Kotlin 中捕获异常的代码：

```kotlin
🏝️
try {
    ...
}
catch (e: Exception) {
    ...
}
finally {
    ...
}
```

可以发现 Kotlin 异常处理与 Java 的异常处理基本相同，但也有几个不同点：

1.  ==Kotlin 中的异常是不会被检查的，只有在运行时如果抛出异常，才会出错==。但在 Java 中，调用抛出异常的方法时，一定需要对异常进行处理，否则就会报错：

    ```java
    ☕️
    public class User{
        void sayHi() throws IOException {
        }
        
        void test() {
            sayHi();
            // 👆 IDE 报错，Unhandled exception: java.io.IOException
        }
    }
    ```

    但在 Kotlin 中，调用上方 `User` 类的 `sayHi` 方法时不会报错：

    ```kotlin
    🏝️
    val user = User()
    user.sayHi() // 👈 正常调用，IDE 不会报错，但运行时会出错
    ```

2. ==Kotlin 中 `try-catch` 语句也可以是一个表达式，允许代码块的最后一行作为返回值==：

    ```kotlin
    🏝️
               👇       
    val a: Int? = try { parseInt(input) } catch (e: NumberFormatException) { null }
    ```



##### 5.5.5 `?.` 和 `?:`

我们知道空安全调用 `?.`，在对象非空时会执行后面的调用，对象为空时就会返回 `null`。如果这时将该表达式赋值给一个不可空的变量：

```kotlin
🏝️
val str: String? = "Hello"
var length: Int = str?.length
//                👆 ，IDE 报错，Type mismatch. Required:Int. Found:Int?
```

报错的原因就是 `str` 为 null 时我们没有值可以返回给 `length`



这时就可以使用 Kotlin 中的 Elvis 操作符 `?:` 来兜底：

```kotlin
🏝️
val str: String? = "Hello"
                             👇
val length: Int = str?.length ?: -1
```

它的意思是如果左侧表达式 `str?.length ` 结果为空，则返回右侧的值 `-1`。Elvis 操作符还有另外一种常见用法，如下：

```kotlin
🏝️
fun validate(user: User) {
    val id = user.id ?: return // 👈 验证 user.id 是否为空，为空时 return 
}

// 等同于

fun validate(user: User) {
    if (user.id == null) {
        return
    }
    val id = user.id
}
```



##### 5.5.6 `==` 和 `===`

我们知道在 Java 中，`==` 比较的如果是基本数据类型则判断值是否相等，如果比较的是 `String` 则表示引用地址是否相等， `String` 字符串的内容比较使用的是 `equals()` ：

```java
☕️
String str1 = "123", str2 = "123";
System.out.println(str1.equals(str2));
System.out.println(str1 == str2); 
```

Kotlin 中也有两种相等比较方式：

- `==` ：可以对基本数据类型以及 `String` 等类型进行内容比较，==相当于 Java 中的 `equals`==

- `===` ：对引用的内存地址进行比较，==相当于 Java 中的 &#61; &#61;==

    

可以发现，Java 中的 `equals` ，在 Kotlin 中与之相对应的是 `==`，这样可以使我们的代码更加简洁。

下面再来看看代码示例：

```kotlin
🏝️
val str1 = "123"
val str2 = "123"
println(str1 == str2) // 👈 内容相等，输出：true

val str1= "字符串"
val str2 = str1
val str3 = str1
print(str2 === str3) // 👈 引用地址相等，输出：true
```

其实 Kotlin 中的 `equals` 函数是 `==` 的操作符重载，关于操作符重载，这里先不讲，之后会讲到。



------



### 6. 泛型



>  「泛型」，它的意思是把具体的类型泛化，编码的时候用符号来指代类型，在使用的时候，再确定它的类型。编码时确定类型，降低类型转换错误的发生。



#### 6.1  Java 中的泛型



先看一个常见的使用场景：

```java
☕️
TextView textView = new Button(context);
// 👆 这是多态

List<Button> buttons = new ArrayList<Button>();
List<TextView> textViews = buttons;
// 👆 多态用在这里会报错 incompatible types: List<Button> cannot be converted to List<TextView>
```

==Java 的泛型本身具有「不可变性 Invariance」==，Java 里面认为 `List<TextView>` 和 `List<Button>` 类型并不一致，也就是说，子类的泛型（`List<Button>`）不属于泛型（`List<TextView>`）的子类。

这是因为Java 的泛型类型会在编译时发生**类型擦除**，为了保证类型安全，不允许这样赋值。但数组并没有在编译时擦除类型：

```java
☕️
TextView[] textViews = new Button[10];
```

但是在实际使用中，我们的确会有这种类似的需求，需要实现上面这种赋值。Java 提供了「泛型通配符」 `? extends` 和 `? super` 来解决这个问题。



##### 6.1.1 「上界通配符」：`? extends`  --> 生产者

在 Java 里面是这么解决的：

```java
☕️
List<Button> buttons = new ArrayList<Button>();
      👇
List<? extends TextView> textViews = buttons;
```

这个 `? extends` 叫做「上界通配符」，可以使 Java 泛型具有「==协变性 Covariance==」，协变就是允许子类对象赋值给父类引用。

> 在继承关系树中，子类继承自父类，可以认为父类在上，子类在下。`extends` 限制了泛型类型的父类型，所以叫上界。

它有两层意思：

1. 其中 `?` 是个通配符，表示这个 `List` 的泛型类型是一个**未知类型**，默认为 `? extends Object` 。
2. `extends` 限制了这个未知类型的上界，也就是泛型类型必须满足这个的限制条件，这里和定义 `class` 的 `extends` 关键字有点不一样：
    - 它的范围不仅是所有直接和间接子类，还包括上界定义的父类本身，也就是 `TextView`。
    - 它还有 `implements` 的意思，即这里的上界也可以是 `interface`。



根据刚才的描述，下面几种情况都是可以的：

```java
☕️
List<? extends TextView> textViews = new ArrayList<TextView>(); // 👈 本身
List<? extends TextView> textViews = new ArrayList<Button>(); // 👈 直接子类
List<? extends TextView> textViews = new ArrayList<RadioButton>(); // 👈 间接子类
```

现在来看看在使用了上界通配符之后，`List` 的使用上有没有什么问题：

```java
☕️
List<? extends TextView> textViews = new ArrayList<Button>();
TextView textView = textViews.get(0); // 👈 get 可以
textViews.add(textView);
//             👆 add 会报错，no suitable method found for add(TextView)
```

前面说到 `List<? extends TextView>` 的泛型类型是个未知类型 `?`，编译器也不确定它是啥类型，只是有个限制上界。

所以 `get()` 取出的对象，肯定是 `TextView` 或者它的子类，可以根据多态的特性赋值；但是 `add()` 添加元素时，并不能确定  `List<? extends TextView>` 的泛型类型，为了保证类型安全，因此不可添加任何元素。



正是由于这个限制，==使用了 `? extends` 泛型通配符的 `List`，只能够向外提供数据被消费==，从这个角度来讲，向外提供数据的一方称为==「生产者 Producer」==。对应的还有一个概念叫「消费者 Consumer」，对应 Java 里面另一个泛型通配符 `? super`。



##### 6.1.2 「下界通配符」：`? super` --> 消费者

先看一下它的写法：

```java
☕️
     👇
List<? super Button> buttons = new ArrayList<TextView>();
```

这个 `? super` 叫做「下界通配符」，可以使 Java 泛型具有==「逆变性 Contravariance」==。

> 与上界通配符对应，这里 super 限制了通配符 ? 的子类型，所以称之为下界。

它也有两层意思：

- 通配符 `?` 表示 `List` 的泛型类型是一个**未知类型**。

- `super` 限制了这个未知类型的下界，也就是泛型类型必须满足这个 `super` 的限制条件。

    - `super` 我们在类的方法里面经常用到，这里的范围不仅包括 `Button` 的直接和间接父类，也包括下界 `Button` 本身。

    - `super` 同样支持 `interface`。

        

根据刚才的描述，下面几种情况都是可以的：

```java
☕️
List<? super Button> buttons = new ArrayList<Button>(); // 👈 本身
List<? super Button> buttons = new ArrayList<TextView>(); // 👈 直接父类
List<? super Button> buttons = new ArrayList<Object>(); // 👈 间接父类
```

对于使用了下界通配符的 `List`，我们再看看它的 `get` 和 `add` 操作：

```java
☕️
List<? super Button> buttons = new ArrayList<TextView>();
Object object = buttons.get(0); // 👈 get 出来的是 Object 类型
Button button = ...
buttons.add(button); // 👈 add 操作是可以的
```

虽然不知道它的具体类型，不过在 Java 里任何对象都是 `Object` 的子类，所以这里可以把它赋值给 `Object`；

`Button` 对象一定是这个未知类型的子类型，根据多态的特性，这里是可以通过 `add` 添加 `Button` 对象的。

注意：这里也仅仅只能添加Button对象，也就是==使用了下界通配符的 `List` 仅支持添加下界自身==，因为也只有下界自身一定是这个未知类型的对象，所以 `list` 才可以添加。



==使用下界通配符 `? super` 的泛型 `List`==，只能读取到 `Object` 对象，一般没有什么实际的使用场景，==通常也只拿它来添加数据==，也就是消费已有的 `List<? super Button>`，往里面添加 `Button`，因此这种泛型类型声明称之为「==消费者 Consumer==」。



##### 6.1.3  小结

Java 的泛型本身是不支持协变和逆变的，但可以使用泛型通配符 `?` 来达到此效果：

- `? extends` ：可使泛型支持协变，但是「只能读取不能修改」，这里的修改仅指对泛型集合添加元素，如果是 `remove(int index)` 以及 `clear` 当然是可以的。
- `? super`： 可使泛型支持逆变，但是「只能修改不能读取」，这里说的不能读取是指不能按照泛型类型读取，你如果按照 `Object` 读出来再强转当然也是可以的。

以上也被称为 PECS 法则：「*Producer-Extends, Consumer-Super*」。



#### 6.2 kotlin 中的泛型

##### 6.2.1 泛型通配符 `out` 和 `in`

和 Java 泛型一样，Kolin 中的泛型本身也是不可变的。

- 关键字 `out` ：支持协变，等同于 Java 中的上界通配符 `? extends`。
- 关键字 `in`  ：支持逆变，等同于 Java 中的下界通配符 `? super`。

```kotlin
🏝️
var textViews: List<out TextView>
var textViews: List<in TextView>
```

换了个写法，但作用是完全一样的。==`out` 表示，我这个变量或者参数只用来输出，不用来输入，你只能读我不能写我；`in` 就反过来，表示它只用来输入，不用来输出，你只能写我不能读我。==



说了这么多 `List`，其实泛型在非集合类的使用也非常广泛，就以「生产者-消费者」为例子：

```kotlin
🏝️
class Producer<T> {
    fun produce(): T {
        ...
    }
}

val producer: Producer<out TextView> = Producer<Button>()
val textView: TextView = producer.produce() // 👈 相当于 'List' 的 `get`
```

再来看看消费者：

```kotlin
🏝️            
class Consumer<T> {
    fun consume(t: T) {
        ...
    }
}

val consumer: Consumer<in Button> = Consumer<TextView>()
consumer.consume(Button(context)) // 👈 相当于 'List' 的 'add'
```



##### 6.2.2 声明处的 `out` 和 `in`

在前面的例子中，在声明 `Producer` 的时候已经确定了泛型 `T` 只会作为输出来用，但是每次都需要在使用的时候加上 `out TextView` 来支持协变，写起来很麻烦。

Kotlin 提供了另外一种写法：可以在声明类的时候，给泛型符号加上 `out` 关键字，表明泛型参数 `T` 只会用来输出，在使用的时候就不用额外加 `out` 了。

```kotlin
🏝️             👇
class Producer<out T> {
    fun produce(): T {
        ...
    }
}

val producer: Producer<TextView> = Producer<Button>() // 👈 这里不写 out 也不会报错
val producer: Producer<out TextView> = Producer<Button>() // 👈 out 可以但没必要
```

与 `out` 一样，可以在声明类的时候，给泛型参数加上 `in` 关键字，来表明这个泛型参数 `T` 只用来输入。

```kotlin
🏝️            👇
class Consumer<in T> {
    fun consume(t: T) {
        ...
    }
}

val consumer: Consumer<Button> = Consumer<TextView>() // 👈 这里不写 in 也不会报错
val consumer: Consumer<in Button> = Consumer<TextView>() // 👈 in 可以但没必要
```



##### 6.2.3 `*` 号

前面讲到了 Java 中单个 `?` 号也能作为泛型通配符使用，相当于 `? extends Object`。
		它在 Kotlin 中有等效的写法：==`*` 号，相当于 `out Any`==。

```kotlin
🏝️            👇
var list: List<*>
```

==和 Java 不同的地方是，如果你的类型定义里已经有了 `out` 或者 `in`，那这个限制在变量声明时也依然在，不会被 `*` 号去掉。==

比如你的类型定义里是 `out T : Number` 的，那它加上 `<*>` 之后的效果就不是 `out Any`，而是 `out Number`。



##### 6.2.4 where关键字

Java 中声明类或接口的时候，可以使用 `extends` 来设置边界，将泛型类型参数限制为某个类型的子集：

```java
☕️                
//                👇  T 的类型必须是 Animal 的子类型
class Monster<T extends Animal>{
}
```

注意这个和前面讲的声明变量时的泛型类型声明是不同的东西，这里并没有 `?`。同时这个边界是可以设置多个，用 `&` 符号连接：

```java
☕️
//                            👇  T 的类型必须同时是 Animal 和 Food 的子类型
class Monster<T extends Animal & Food>{ 
}
```

Kotlin 只是把 `extends` 换成了 `:` 冒号。

```kotlin
🏝️             👇
class Monster<T : Animal>
```

设置多个边界可以使用 `where` 关键字：

```kotlin
🏝️                👇
class Monster<T> where T : Animal, T : Food
```



##### 6.2.5 reified 关键字

由于 Java 中的泛型存在类型擦除的情况，任何在运行时需要知道泛型确切类型信息的操作都没法用了。比如你不能检查一个对象是否为泛型类型 `T` 的实例：

```java
☕️
<T> void printIfTypeMatch(Object item) {
    if (item instanceof T) { // 👈 IDE 会提示错误，illegal generic type for instanceof
        System.out.println(item);
    }
}
```

Kotlin 里同样也不行：

```kotlin
🏝️
fun <T> printIfTypeMatch(item: Any) {
    if (item is T) { // 👈 IDE 会提示错误，Cannot check for instance of erased type: T
        println(item)
    }
}
```

这个问题，在 Java 中的解决方案通常是额外传递一个 `Class<T>` 类型的参数，然后通过 `Class#isInstance` 方法来检查：

```java
☕️                             👇
<T> void check(Object item, Class<T> type) {
    if (type.isInstance(item)) {
               👆
        System.out.println(item);
    }
}
```

Kotlin 中同样可以这么解决，不过还有一个更方便的做法：使用关键字 `reified` 配合 `inline` 来解决：

```kotlin
🏝️ 👇         👇
inline fun <reified T> printIfTypeMatch(item: Any) {
    if (item is T) { // 👈 这里就不会在提示错误了
        println(item)
    }
}
```

具体在后续讲到 `inline` 的时候会详细说明，这里就不过多延伸了。



#### 6.3 Java与Kotlin中的泛型不一致

其实为 4.5 章节提到过的 Java 和 Kotlin  的数组和集合在泛型上的区别：

1. Java 里的数组是支持协变的，而 Kotlin 中的数组 `Array` 不支持协变：

    这是因为在 Kotlin 中数组是用 `Array` 类来表示的，这个 `Array` 类是个泛型类，kotlin中的泛型本身是具有不可变性的，除非使用泛型通配符 `out` 和 `in` ，所以不支持协变。

    

2. Java 中的 `List` 接口不支持协变，而 Kotlin 中的 `List` 接口支持协变：

    Java 中的 `List` 不支持协变，原因在上文已经讲过了，需要使用泛型通配符来解决。

    在 Kotlin 中，实际上 `MutableList` 接口才相当于 Java 中的 `List`。而  `List` 接口使用了泛型通配符 `out`，是个生产者，只可读不可写，所以不会有类型安全上的问题，自然可以支持协变。



------



### 7. Lambda表达式



#### 7.1 高阶函数——Higher-Order Function

> 一个函数的参数或返回值可为函数，这样的函数称为高阶函数。  也就是这个函数可以根据传入的方法不同，动态去做不同的事。



在 Java 里是不允许把方法作为参数传递的，但是我们有一个历史悠久的变通方案：接口。我们可以通过接口的方式来把方法包装起来：

```java
public interface Wrapper {
  int method(int param);
}
```

然后把这个接口的类型作为外部方法的参数类型：

```java
int a(Wrapper wrapper) {
  return wrapper.method(1);
}
```

在调用外部方法时，传递接口的对象来作为参数：

```java
a(wrapper1);
a(wrapper2);
```



但在 Kotlin 里面，函数的参数也可以是函数类型的：

```kotlin
fun a(funParam: Fun): String {
  return funParam(1);
}
```

当一个函数含有函数类型的参数的时，如果你调用它，就必须传入一个函数类型的对象给它；



但是上述的写法是错误的，Kotlin 中并没有 `Fun` 这个关键字来标记这个变量是个「函数类型」，因为函数类型不是一「个」类型，而是一「类」类型，它可以有各种各样不同的参数和返回值的类型的搭配，这些搭配属于不同的函数类型。

例如，无参数无返回值 `() -> Unit` 和单 Int 型参数返回 String `(Int ) -> String` 是两种不同的函数类型，所以不能只用 Fun 这个词来表示「这个参数是个函数类型」，就好像不能用 Class 这个词来表示「这个参数是某个类」，因为你需要指定，具体是哪种函数类型对象，而不能笼统地一句说「它是函数类型」就完了。



所以==对于函数类型的参数，需要指明它有几个参数、参数的类型是什么以及返回值类型是什么==，那么写下来就大概是这个样子：

```kotlin
fun a(funParam: (Int) -> String): String {
  return funParam(1)
}
```

只有这样写，调用的人才知道应该传一个怎样的函数类型的参数给你。

同样的，函数类型不只可以作为函数的参数类型，还可以作为函数的返回值类型：

```kotlin
fun c(param: Int): (Int) -> Unit {
  ...
}
```

这种==「参数或者返回值为函数类型的函数」，在 Kotlin 中就被称为「高阶函数」——Higher-Order Functions==。



#### 7.2 函数引用 （`::mothed`）

除了作为函数的参数和返回值类型，你把函数赋值给一个变量也是可以的。

不过对于一个声明好的函数，不管是你要把它作为参数传递给函数，还是要把它赋值给变量，都得在函数名的左边加上双冒号才行：

```kotlin
fun b(param: Int){
    //todo
}

a(::b)
val d = ::b
```

这种双冒号的写法叫做函数引用 Function Reference，这是官方的说法。



实际上，在 Kotlin 里一个函数名的左边加上双冒号，它就不表示这个函数本身了，而表示一个对象，或者说一个指向对象的引用，但，这个对象可不是函数本身，而是一个和这个函数具有相同功能的对象。你可以怎么用函数，就能怎么用这个加了双冒号的对象：

```kotlin
b(1) // 调用函数
d(1) // 用对象 d 后面加上括号来实现 b() 的等价操作
(::b)(1) // 用对象 ::b 后面加上括号来实现 b() 的等价操作
```

再说一遍，==这个双冒号的这个东西，它不是一个函数，而是一个对象，一个函数类型的对象，它复制了原函数的功能，但它并不是原函数。==



对象是不能加个括号来调用的，但是函数类型的对象可以。它是 Kotlin 的语法糖，其实是个假的调用，实际上它真正调用的是这个对象的 invoke() 函数：

```kotlin
d(1) // 实际上会调用 d.invoke(1)
(::b)(1) // 实际上会调用 (::b).invoke(1)
```

所以你可以对一个函数类型的对象调用 invoke()，但不能对一个函数这么做：

```kotlin
b.invoke(1) // 报错
```

因为只有函数类型的对象才有这个自带的 invoke() 可以用，而函数，并不是函数类型的对象，它也不是一个对象。



#### 7.3 匿名函数

要传一个函数类型的参数，或者把一个函数类型的对象赋值给变量，除了用双冒号来拿现成的函数使用，你还可以直接把这个函数挪过来写：

```kotlin
a(fun b(param: Int): String {
  return param.toString()
});

val d = fun b(param: Int): String {
  return param.toString()
}
```

另外，这种写法的话，函数的名字其实就没用了，所以你可以把它省掉：

```kotlin
a(fun(param: Int): String {
  return param.toString()
});

val d = fun(param: Int): String {
  return param.toString()
}
```

因为这个函数没有名字，所以也被称为匿名函数。另外呢，先前带有名字的写法，Kotlin 是不允许的，既然使用的函数要名字也没有用，Kotlin 干脆就不许它有名字。



#### 7.4 Lambda表达式

首先看看 在 Java 里设计一个回调的时候是怎样的：

```java
public interface OnClickListener {
  void onClick(View v); //该方法会在需要时调用：this.listener.onClick(v)
}

public void setOnClickListener(OnClickListener listener) {
  this.listener = listener;
}
```

通过匿名内部类对象使用：

```java
view.setOnClickListener(new OnClickListener() {
  @Override
  void onClick(View v) {
    switchToNextPage();
  }
});
```


​		在 Kotlin 里回调的设计就可以使用高阶函数改成这样了：

```kotlin
fun setOnClickListener(onClick: (View) -> Unit) {
  this.onClick = onClick  //在需要的时候通过直接使用 this.onClick(v)调用函数类型对象的 invoke(v)
}
```

可以通过传入匿名函数来使用：

```kotlin
view.setOnClickListener(fun(v: View): Unit {
  switchToNextPage()
})
```

匿名函数还能更简化一点，写成 Lambda 表达式的形式：

```kotlin
					  //👇 最外层的大括号不可少
view.setOnClickListener({ v: View ->
  switchToNextPage()
})
```



如果 Lambda 是函数的最后一个参数，你可以把 Lambda 写在括号的外面：

```kotlin
view.setOnClickListener() { v: View ->
  switchToNextPage()
}
```

而如果 Lambda 是函数唯一的参数，你还可以直接把括号去了：

```kotlin
view.setOnClickListener { v: View ->
  switchToNextPage()
}
```

另外，如果这个 Lambda 是单参数的，那么它的这个参数也可以省略掉不写：

```kotlin
view.setOnClickListener {
  switchToNextPage()
}
```

就算如果你想用这个参数，也是可以不写，因为 Kotlin 的 Lambda 对于省略的唯一参数有默认的名字：`it`

```kotlin
view.setOnClickListener {
  switchToNextPage()
  it.setVisibility(GONE)
}
```



但它是怎么知道自己的参数个数、类型和返回值类型的？原来我们调用的函数在声明时就已明确需要传入的函数类型对象：

```kotlin
fun setOnClickListener(onClick: (View) -> Unit) {
  this.onClick = onClick
}
```

这里面把这个函数的参数类型和返回值都写得清清楚楚，所以 Lambda 才不用写的。但是，当你要把一个匿名函数赋值给变量而不是作为函数参数传递时：

```kotlin
val b = fun(param: Int): String {
  return param.toString()
}
```

如果也简写成 Lambda 的形式：

```kotlin
val b = { param: Int ->
  return param.toString()
}
```

就不能省略掉 Lambda 的参数类型了，因为它无法从上下文中推断出这个参数的类型：

```kotlin
val b = {
  return it.toString() // it 报错
}
```

如果你出于场景的需求或者个人偏好，就是想在这里省掉参数类型，那么需要给左边的变量指明类型（函数类型）：

```kotlin
val b: (Int) -> String = {
  return it.toString() // it 可以被推断出是 Int 类型
}
```

另外 ==Lambda 的返回值不是用 return 来返回，而是直接取最后一行代码的值==：

```kotlin
val b: (Int) -> String = {
  it.toString() // it 可以被推断出是 Int 类型
}
```

这个一定注得意，==Lambda 的返回值别写 return，如果你写了，它会把这个作为它外层的函数的返回值来直接结束外层函数==。当然如果就是想这么做那是没问题的，但如果只是想返回 Lambda，这么写就会出错了。

另外因为 Lambda 是个代码块，它总能根据最后一行代码来推断出返回值类型，所以它的返回值类型确实可以不写。实际上，Kotlin 的 Lambda 也是写不了返回值类型的，语法上就不支持。



#### 7.5 匿名函数和 Lambda 表达式的本质

**==Kotlin 的匿名函数和 Lambda 表达式的本质：都是函数类型的对象==**



Kotlin 的 Lambda 跟 Java 8 的 Lambda 是不一样的，Java 8 的 Lambda 只是一种便捷写法，本质上并没有功能上的突破，而 Kotlin 的 Lambda 是实实在在的对象。

所以在 Kotlin 里「函数并不能传递，传递的是对象」和「匿名函数和 Lambda 表达式其实都是对象」，双冒号加函数名的函数引用也并不是指向原函数，而是指向一个不可见的函数类型对象。



#### 7.6 对比Java中的Lambda

1. ==Java 8 允许用 Lambda 表达式来创建匿名类对象==，但它本质上还是在创建一个匿名类对象，只是一种简化写法而已；而 Kotlin 里的 Lambda 和 Java 本质上就是不同的，因为 ==Kotlin 的 Lambda 是实实在在的函数类型的对象==，功能更强，写法更多更灵活。

2. Kotlin 是不支持使用 Lambda 的方式来简写匿名类对象的，因为有函数类型的参数，所以这种单函数接口的写法就直接没必要了，也就无需支持。另外，Kotlin 中创建匿名内部类对象是使用 `object` 达到的。

3. 当和 Java 交互时，Kotlin 支持使用 Lambda 的方式来简写匿名类对象：即函数参数是 Java 的单抽象方法的接口。但这并不是Kotlin **增加**了功能，而是对于来自 Java 的单抽象方法的接口，Kotlin 会为它们额外创建一个把参数替换为函数类型的桥接方法，让你可以间接地创建 Java 的匿名类对象。

    

    这就是为什么，当你在 Kotlin 里调用 `View.java` 这个类的 `setOnClickListener()` 的时候，可以传 Lambda 给它来创建 `OnClickListener` 对象，但你照着同样的写法写一个 Kotlin 的接口，可却不能传入 Lambda。因为 Kotlin 期望我们直接使用函数类型的参数，而不是用接口这种折中的方案。



------



### 8. 扩展函数和扩展属性



Kotlin 有个特别好用的功能叫扩展，你可以给已有的类去额外添加函数和属性，而且既不需要改源码也不需要写子类。

写个叫 `dp` 的扩展属性来把 `dp` 值转成像素值：

```kotlin
val Float.dp
  get() = TypedValue.applyDimension(
    TypedValue.COMPLEX_UNIT_DIP,
    this,
    Resources.getSystem().displayMetrics
  )

...

val RADIUS = 200f.dp
```

但是稍微高级一点的用法很多人就不太行了，尤其是扩展函数和函数引用混在一起的时候就更是瞬间蒙圈。



#### 8.1 扩展函数的好处

1. **Java 的 `Math.pow()`**

    在 Java 里我们如果想做幂运算——也就是几的几次方——要用静态方法 `pow(a, n)`

    ```java
    Math.pow(2, 10); // 2 的 10 次方
    ```

    这个 `pow(a, n)` 方法是 `Math` 类的一个静态方法，这类方法我们用得比较多的是 `max()` 和 `min()`

    ```java
    Math.max(1, 2); // 2
    Math.min(1, 2); // 1
    ```

    比较两个数的大小，用静态方法很符合直觉；但是幂运算的话，静态方法就不如成员方法来得更直观了：

    ```java
    2.pow(10); // 要是 Java 里能这样写就好了
    ```

    但我们只能选择静态方法。为什么？很简单，因为 Integer、Float、Double 这几个类没提供这个方法，所以我们只能用 Math 类的静态方法。

2. **Kotlin 的扩展函数 `Float.pow()`**

    在 Kotlin 里，我们用的不是 Java 的 Integer、Float、Double，而是另外几个名字相同或相像的 Kotlin 自己新创造的类。这几个类同样没有提供 `pow()` 这个函数，但我们依然可以用看起来像是成员函数的方式来做幂运算。

    ```kotlin
    2f.pow(10) // Kotlin 可以这么写
    ```

    为什么？因为 `Float.pow(n: Int)` 是 Kotlin 给 `Float` 这个类增加的一个扩展函数：

    ```kotlin
    // kotlin.util.MathJVM.kt
    public actual inline fun Float.pow(n: Int): Float
    					//👇这里的this代表的是调用这个扩展函数的Float对象
        = nativeMath.pow(this.toDouble(), n.toDouble()).toFloat()
    ```

    ==在声明一个函数的时候在函数名的左边写个类名再加个点，你就能对这个类的对象调用这个函数了。这种函数就叫「扩展函数，Extension **Functions**」==。

    

    这种用法给我们的开发带来了极大的便利，我们可以用它来做很多事。举个例子：

    - `pow()`

    - AndroidX 的 KTX 库里有一个对于 `ComponentActivity` 类的扩展函数叫 `viewModels()`：

        ```kotlin
        @androidx.annotation.MainThread
        public inline fun <reified VM : ViewModel> ComponentActivity.viewModels(noinline factoryProducer: (() -> 	                          ViewModelProvider.Factory)? ): kotlin.Lazy<VM> {}
        ```

        只要引用了对应的 KTX 库，在 Activity 里你可以直接就调用这个函数来很方便地初始化 `ViewModel`，而不需要重写 Activity 类：

        ```kotlin
        class MainActivity : AppCompatActivity() {
        
          val model: MyViewModel by viewModels()
        
          ...
        
        }
        ```

    - 类似的用法可以有很多很多，限制你的是想象力。所以对于扩展函数，更需要注意的是谨慎和克制：需要用了再用，而不要因为它很酷很方便就能用则用。因为这些方便的东西如果太多，就会变成对你和同事的打扰。



#### 8.2 扩展函数的写法

扩展函数写在哪都可以，但写的位置不同，作用域就也不同。所谓作用域就是说你能在哪些地方调用到它。

最简单的写法就是把它写成 Top Level 也就是顶层的，让它不属于任何类，这样就能在任何类里使用它。这也和成员函数的作用域很像——哪里能用到这个类，哪里就能用到类里的这个函数：

```kotlin
package com.rengwuxian

fun String.method1(i: Int) {
  ...
}

"rengwuxian".method1(1)
```

但这个函数它是个 Top-level Function，它谁也不属于，或者说它只属于它所在的 package。那它为什么可以被这个类的对象调用呢？——因为它在函数名的左边呀！

==在 Kotlin 里，当你给声明的函数名左边加上一个类名的时候，表示你要给这个函数限定一个 Receiver——直译的话叫接收者，其实也就是哪个类的对象可以调用这个函数==。限制只有通过某个类的对象才能调用这个函数，这就是扩展函数的本质。



#### 8.3 成员扩展函数

除了写成 Top Level 的，扩展函数也可以写在某个类里：

```kotlin
class Example {

  fun String.method2(i: Int) {
    ...
  }

}
```

然后你就可以在这个类里调用这个函数，但必须使用那个前缀类的对象来调用它：

```kotlin
class Example {

  fun String.method2(i: Int) {
    ...
  }

  "rengwuxian".method2(1) // 可以调用

}
```

所以它既是外部类的成员函数，又是前缀类的扩展函数。

==这种既是成员函数、又是扩展函数的函数，它们的用法跟 Top Level 的扩展函数一样，只是由于它同时还是成员函数，所以只能在它所属的类里面被调用，到了外面就不能用了==：

```kotlin
class Example {

  fun String.method2(i: Int) {
    ...
  }

  ...

  "rengwuxian".method2(1) // 可以调用

}

"rengwuxian".method2(1) // 类的外部不能调用
```

这个也好理解，之所以把扩展函数写在类的里面，不就是为了让它不要被外界看见造成污染嘛。



#### 8.4 指向扩展函数的引用

##### 8.4.1 扩展函数的引用和调用

之前 Lambda 中说过函数是可以使用双冒号被指向的：

```kotlin
Int::toFloat //代表指向与Int类的 toFloat 方法等价的对象的引用
```

当时也提了，其实指向的并不是函数本身，而是和函数等价的一个对象，这也是为什么可以对这个引用调用 invoke()，却不能对函数本身调用：

```kotlin
(Int::toFloat)(1) // 等价于 1.toFloat()
Int::toFloat.invoke(1) // 等价于 1.toFloat()
1.toFloat.invoke() // 报错
```

为了简单起见，我们通常可以把这个「指向和函数等价的对象的引用」称作是「指向这个函数的引用」。普通函数可以被指向，扩展函数同样也是可以被指向的：

```kotlin
fun String.method1(i: Int) {

}

...

String::method1
```

不过如果这个扩展函数不是 Top-Level 或者嵌套函数的，也就是说如果它是某个类的成员函数，它就不能被引用了：

```kotlin
class Extensions {

  fun String.method1(i: Int) {
    ...
  }

  ...

  String::method1 // 报错
}
```

为什么？你想啊，==一个成员函数怎么引用：类名加双冒号加函数名；扩展函数：Receiver 的类名加双冒号加函数名==。所以成员扩展函数，在引用的时候是无法确定使用类名还是Receiver 的类名加双冒号加函数名，这是有歧义的，所以 Kotlin 就干脆不许我们引用既是成员函数又是扩展函数的函数了，一了百了。



同样，跟普通函数的引用一样，扩展函数的引用也可以被调用，直接调用或者用 invoke() 都可以，不过要记得把 Receiver 也就是接收者或者说调用者填成第一个参数：

```kotlin
(String::method1)("rengwuxian", 1)
String::method1.invoke("rengwuxian", 1)

// 以上两句都等价于：
"rengwuxian".method1(1)
```



##### 8.4.2 扩展函数的引用赋值给变量

同样的，扩展函数的引用也可以赋值给变量：

```kotlin
		//👇Lambda形式的扩展函数类型声明	
val a: String.(Int) -> Unit = String::method1
```

然后你再拿着这个变量去调用，或者再次传递给别的变量，都是可以的：

```kotlin
a("rengwuxian", 1)
a.invoke("rengwuxian", 1)
"rengwuxian".a(1)
```



##### 8.4.3 有无 Receiver 的变量的互换

另外大家可能会发现，当你拿着一个函数的引用去调用的时候，不管是一个普通的成员函数还是扩展函数，你都需要把 Receiver 也就是接收者或者调用者作为第一个参数填进去。

```kotlin
(String::method1)("rengwuxian", 1)  // 等价于 "rengwuxian".method1(1)
(Int::toFloat)(1) // 等价于 1.toFloat()
```

为什么？因为你拿到的是函数引用而不是调用这个函数的对象，所以 Kotlin 要想支持让我们拿着函数的引用去调用，就必须给个途径让我们提供调用者。最终就是：在这种调用方式下，增加一个函数参数，让我们把第一个参数的位置填上调用者。

这其实是和 Java 里面反射调用 `Method` 的机制是一致的，但在 Kotlin 中，如果是在类中直接使用 `::method` 拿到该类的函数引用，则是无需提供调用者的：

```kotlin
class Extensions {

  fun method1(i: Int) {
    ...
  }

  fun method2() {
    ::method1.invoke(1)  //无需提供调用者
    Extensions::method1.invoke(this,1)  //此种方式需要提供调用者
  }

}
```

这其实也很好理解：`::method` 此种方式拿到的成员函数引用的调用者所属类默认为所在类，那么调用者自然默认为 `this`，也就无需提供了。此外还有一种情况是在顶级函数「`top-level declaration`  」中：

```kotlin
  fun method1(i: Int) {
    ...
  }

  fun method2() {
    ::method1.invoke(1)  //无需提供调用者
  }
```

但这种方式与在类中稍微有点不同，因为顶级函数不属于任何类，所以函数引用也是和任何类无关的，因此无需也不能为它指明调用者。



1. 有 Receiver --> 无Receiver

    但同时又有一个问题，既然有 Receiver 的函数可以以无 Receiver 的方式来调用，那……它可以赋值给无 Receiver 的函数类型的变量吗？

    ```kotlin
    val b: (String, Int) -> Unit = String::method1 // 这样可以吗？
    ```

    答案是，可以的。在 Kotlin 里，每一个有 Receiver 的函数——其实就是成员函数（接收者为所属类对象 ）和扩展函数——它的引用都可以赋值给两种不同的函数类型变量：一种是有 Receiver 的，一种是没有 Receiver 的：

    ```kotlin
    val a: String.(Int) -> Unit = String::method1   //a 为 Lambda 类型的扩展函数类型引用
    val b: (String, Int) -> Unit = String::method1  //b 为 Lambdal 类型的普通函数函数类型引用
    ```

    这两种写法都是合法的。而且同样的，这两种类型的变量也可以互相赋值来进行转换：

    ```kotlin
    val a: String.(Int) -> Unit = String::method1
    val b: (String, Int) -> Unit = String::method1
    val c: String.(Int) -> Unit = b   // 因为它们两个通过 invoke 方式调用的参数与返回值都是一致的
    val d: (String, Int) -> Unit = a  //
    ```

2. 无 Receiver --> 有Receiver

    既然这两种类型的变量可以互相赋值来转换，那不就是说无 Receiver 的函数引用也可以赋值给有 Receiver 的变量？
    这样的话，是不是一个普通的无 Receiver 的函数也可以直接赋值给有 Receiver 的变量？

    ```kotlin
    fun method3(s: String, i: Int) {
    
    }
    
    ...
    
    val e: (String, Int) -> Unit = ::method3
    val f: String.(Int) -> Unit = ::method3 // 这种写法也行哦
    ```

    通过这些类型的互相转换，你可以把一个本来没有 Receiver 的函数变得可以通过 Receiver 来调用：

    ```kotlin
    fun method3(s: String, i: Int) {
    
    }
    
    ...
    
    val f: String.(Int) -> Unit = ::method3
    "rengwuxian".method3(1) // 不允许调用，报错
    "rengwuxian".f(1) // 可以调用
    ```

    当然了也可以进行反向操作，去把一个有 Receiver 的函数变得不能用 Receiver 调用：

    ```kotlin
    fun String.method1(i: Int) {
    
    }
    
    ...
    
    val b: (String, Int) -> Unit = String::method1
    "rengwuxian".method1(1) // 可以调用
    "rengwuxian".b(1) // 不允许调用，报错
    ```

    这样收窄功能好像没什么用？不过我还是要把这个告诉你，因为这样你的知识体系才是完整的。



#### 8.5 扩展属性

除了扩展函数，Kotlin 的扩展还包括扩展属性。它跟扩展函数是一个逻辑，就是在声明的属性左边写上类名加点，这就是一个扩展属性了，英文原名叫 Extension Property。

```kotlin
val Float.dp
  get() = TypedValue.applyDimension(
    TypedValue.COMPLEX_UNIT_DIP,
    this,
    Resources.getSystem().displayMetrics
  )

...

val RADIUS = 200f.dp
```

它的用法和扩展函数一样，但少了扩展函数在引用上以及 Receiver 上的一些比较绕的问题，所以很简单。有些东西写成扩展属性是比扩展函数要更加直观和方便的，所以虽然它很简单，但研究一下绝对有好处。



------



