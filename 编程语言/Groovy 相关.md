## Groovy 相关

[TOC]



### 1. Groovy 中的闭包（Closure）

>   Groovy 中的==闭包是一个开放，匿名的代码块==，可以接受参数，返回值并分配给变量



#### 1.1 闭包的写法

```groovy
//执行一句话  
{ printf 'Hello World' }                                   
    
//闭包有隐式参数it，且不用申明      
{ println it }                   

//闭包有隐式参数it，申明了也无所谓                
{ it -> println it }      
    
// name 是自定义的参数名  
{ name -> println name }                 

 //多个参数的闭包
{ String x, int y ->                                
    println "hey ${x} the value is ${y}"    
}

// 带有可变参数的闭包
{ String... args -> args.join('') }
```



#### 1.2 Closure 对象

==定义的每一个闭包都是一个 `Closure` 对象==，因此可以把一个闭包赋值给一个变量，如下：

```groovy
def innerClosure = {
    printf("hello")
 }

def hello = { String x ->
    printf("hello ${x}")
 }
```

还可以将其作为方法的参数类型：

```groovy
void setOnClickListener(Closure closure) {
        this.onClickListener = closure
}
```



#### 1.3 执行闭包方式

1.  括号 + 参数

    ```groovy
    //执行innerClosure 闭包
    innerClosure ()
    
    //带参数的闭包
    hello("world")
    ```

    可以看出，这种方式和执行方法没有区别。

    

2.  调用call方法

    ```groovy
    innerClosure.call()
    
    hello.call("world")
    ```



#### 1.4 柯里化

在计算机科学中，柯里化（Currying）是把多个参数的函数变换成接受一个单一参数的函数，并且新的函数。

简单说就是，==可预先配置部分参数，在使用时接受剩余函数==。groovy闭包也提供了柯里化的方法，根据预先配置最左边参数还是最右边参数，又可分为左柯里化 curry 和右柯里化rcurry，如下：

```groovy
def nCopies = { int n, String str -> str*n }    //定义一个闭包，接受两个参数

# 左柯里化
def twice = nCopies.curry(2)                  
assert twice('bla') == 'blabla'                 
assert twice('bla') == nCopies(2, 'bla')  

# 右柯里化
def blah = nCopies.rcurry('bla')                
assert blah(2) == 'blabla'                      
assert blah(2) == nCopies(2, 'bla')
```



如果闭包参数大于2，若想指定具体某个参数的值，执行柯里化操作，此时需要使用 ncurry 方法：

```groovy
def volume = { double l, double w, double h -> l*w*h }      
def fixedWidthVolume = volume.ncurry(1, 2d)    //指定第二个参数的值2，并返回新闭包                 
assert volume(3d, 2d, 4d) == fixedWidthVolume(3d, 4d)       
def fixedWidthAndHeight = volume.ncurry(1, 2d, 4d)    //指定从第二个参数开始，后续参数的值，并返回新的闭包          

assert volume(3d, 2d, 4d) == fixedWidthAndHeight(3d)
```



------





### 2. 闭包内的 this，owner，delegate 对象

在闭包内部，有三个内置对象 this，owner，delegate，可以直接 this，owner，delegate 调用，或者调用相应的 get 方法：

-   `getThisObject()` ： this
-   `getOwner()` ： owner
-   `getDelegate()` ：delegate



-   **this**：==对应于定义闭包的那个类，如果在内部类中定义，指向的是内部类==

-   **owenr**： ==对应于定义闭包的那个类或者闭包，如果在闭包中定义，对应闭包，否则同 this 一致==

-   **delegate**： ==默认是和 owner 一致，或者自定义 delegate 指向==

    

用以下示例代码验证一下：

```groovy
class OuterClass {
    
    class InnerClass {
        
        def outerClosure = {
            def innerClosure = { }
            printfMsg("innerClosure", innerClosure)
            println("------")
            printfMsg("outerClosure", outerClosure)
        }
        
        void printfMsg(String flag, Closure closure) {
            def thisObject = closure.getThisObject()
            def ownerObject = closure.getOwner()
            def delegate = closure.getDelegate()
            println("${flag} this: ${thisObject.toString()}")
            println("${flag} owner: ${ownerObject.toString()}")
            println("${flag} delegate: ${delegate.toString()}")
        }
        
    }

    def callInnerMethod() {
        def innerClass = new InnerClass()
        innerClass.outerClosure.call()
        println("------")
        println("outerClosure toString ${innerClass.outerClosure.toString()}")
    }

    static void main(String[] args) {
        new OuterClass().callInnerMethod()
    }
}
```

执行输出结果如下：

```ruby
innerClosure this: com.example.groovy.bean.OuterClass$InnerClass@e874448
innerClosure owner: com.example.groovy.bean.OuterClass$InnerClass$_closure1@5bfbf16f
innerClosure delegate: com.example.groovy.bean.OuterClass$InnerClass$_closure1@5bfbf16f
------
outerClosure this: com.example.groovy.bean.OuterClass$InnerClass@e874448
outerClosure owner: com.example.groovy.bean.OuterClass$InnerClass@e874448
outerClosure delegate: com.example.groovy.bean.OuterClass$InnerClass@e874448
------
outerClosure toString com.example.groovy.bean.OuterClass$InnerClass$_closure1@5bfbf16f
```

因此，**this** 永远是该闭包的定义类，**owenr** 则是定义该闭包的类或闭包，闭包优先级更高。





### 3. delegate 的使用

delegate 是闭包中的重头戏，前面已经说了，闭包可以设置 delegate 对象，**==设置 delegate 的意义就是将闭包和一个具体的对象关联起来，闭包内部可以访问对象的属性和方法==**。



如下代码所示：

```groovy
# Person.groovy
class Person {
    String name
    int age

    void eat(String food) {
        println("你喂的${food}真难吃")
    }
    
    @Override
    String toString() {
        return "Person{" +
                "name='" + name + '\'' +
                ", age=" + age +
                '}'
    }
}

# Main.groovy
def cc = {
    name = "hanmeimei"
    age = 26
 }
```

我们定义 Person 实体类，再定义一个名字叫 cc 的闭包，若想在闭包里修改 Person 的 name 和 age，还想调用 eat 方法，这个怎么关联起来？



这就需要设置闭包的 delegate，如下：

```groovy
cc.delegate = person
cc.call()
```

是不是很简单，完整代码如下：

```groovy
class Main {
    
    def cc = {
        name = "hanmeimei"
        age = 26
        eat("油条")
    }
    
    static void main(String... args) {
        Main main = new Main()
        Person person = new Person(name: "lilei", age: 14)
        println person.toString()

        main.cc.delegate = person
        main.cc.call()
        println person.toString()
	}
}

#打印结果
Person{name='lilei', age=14}
你喂的油条真难吃
Person{name='hanmeimei', age=26}
```

可以看到，在闭包中就可以直接访问被代理对象的属性和方法。



这就又有一个问题了，若闭包所在的类或所在的闭包中有与代理对象同名的属性或方法，这时又该调用谁呢？groovy 为我们设定了几个代理的策略：

-   `Closure.OWNER_FIRST`：==默认策略==，优先在 owner 寻找，owner 中没有再在 delegate 中寻找

-   `Closure.DELEGATE_FIRST`：优先在 delegate 寻找，delegate 中没有再在 owner 中寻找

-   `Closure.OWNER_ONLY`：只在 owner 中寻找

-   `Closure.DELEGATE_ONLY`：只在 delegate 中寻找

-   `Closure.TO_SELF`：暂时没有用到，哎不知道啥意思

    

为了验证，现在修改一下 Main.groovy 的代码，如下：

```groovy
class Main {
    
    void eat(String food){
        println "我根本不会吃，不要喂我${food}"
    }
    
    def cc = {
        name = "hanmeimei"
        age = 26
        eat("油条")
    }

    static void main(String... args) {
        Main main = new Main()
        Person person = new Person(name: "lilei", age: 14)
        println person.toString()

        main.cc.delegate = person
		// main.cc.setResolveStrategy(Closure.DELEGATE_FIRST)
        main.cc.setResolveStrategy(Closure.OWNER_FIRST)
        main.cc.call()
        println person.toString()
	}
}

#打印结果
Person{name='lilei', age=14}
我根本不会吃，不要喂我油条
Person{name='hanmeimei', age=26}
```

可以看到，我们给 cc 闭包的 owner 中添加了一个与代理对象相同定义的 eat 方法，此时修改代理策略为 owner 优先，即会执行 owner  中的同名方法。



### 4. 仿照 Android DSL 定义闭包

在 Android 中我们熟悉的 build.gradle 配置，其实也是闭包，这下面肯定是你熟悉的代码：

```groovy
android {
    compileSdkVersion 25
    buildToolsVersion "25.0.2"

    defaultConfig {
        minSdkVersion 15
        targetSdkVersion 25
        versionCode 1
        versionName "1.0"
    }
}
```

理解了 delegate 后，我们也可以自己写出此形式的闭包，如下：

```groovy
# Android.groovy
class Android {
    private int mCompileSdkVersion
    private String mBuildToolsVersion
    private ProductFlavor mProductFlavor

    Android() {
        this.mProductFlavor = new ProductFlavor()
    }

    void compileSdkVersion(int compileSdkVersion) {
        this.mCompileSdkVersion = compileSdkVersion
    }

    void buildToolsVersion(String buildToolsVersion) {
        this.mBuildToolsVersion = buildToolsVersion
    }

    void defaultConfig(Closure closure) {
        closure.setDelegate(mProductFlavor)
        closure.setResolveStrategy(Closure.DELEGATE_FIRST)
        closure.call()
    }
    
    @Override
     String toString() {
        return "Android{" +
                "mCompileSdkVersion=" + mCompileSdkVersion +
                ", mBuildToolsVersion='" + mBuildToolsVersion + '\'' +
                ", mProductFlavor=" + mProductFlavor +
                '}'
    }
}

# ProductFlavor.groovy
class ProductFlavor {
    private int mVersionCode
    private String mVersionName
    private int mMinSdkVersion
    private int mTargetSdkVersion

    def versionCode(int versionCode) {
        mVersionCode = versionCode
    }

    def versionName(String versionName) {
        mVersionName = versionName
    }

    def minSdkVersion(int minSdkVersion) {
        mMinSdkVersion = minSdkVersion
    }


    def targetSdkVersion(int targetSdkVersion) {
        mTargetSdkVersion = targetSdkVersion
    }

    @Override
    String toString() {
        return "ProductFlavor{" +
                "mVersionCode=" + mVersionCode +
                ", mVersionName='" + mVersionName + '\'' +
                ", mMinSdkVersion=" + mMinSdkVersion +
                ", mTargetSdkVersion=" + mTargetSdkVersion +
                '}'
    }
}
```

这两个实体，就相当于闭包的被代理对象，那么我们闭包怎么写呢？如下：

```groovy
//闭包定义
def android = {
        compileSdkVersion 25
        buildToolsVersion "25.0.2"
        defaultConfig {
            minSdkVersion 15
            targetSdkVersion 25
            versionCode 1
            versionName "1.0"
        }
}

//调用
Android bean = new Android()
android.delegate = bean
android.call()
println bean.toString()

//打印结果
Android{mCompileSdkVersion=25, mBuildToolsVersion='25.0.2', mProductFlavor=ProductFlavor{mVersionCode=1, mVersionName='1.0', mMinSdkVersion=15, mTargetSdkVersion=25}}
```



