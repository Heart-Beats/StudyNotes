# Gradle 基础

[TOC]



### 1. Gradle Task

> Task（任务）可以理解为 gradle 的执行单元，gradle 通过执行一个个 Task 来完成整个项目构建工作。
>
> 它由多个action组成，action就是一个代码块，里面是需要执行的代码，比如编译，打包，生成javadoc，发布等



#### 1.1 自定义 Task

我们可以在 build.gradle 中使用关键字 task 来自定义一个 Task。比如创建 build.gradle 文件，并添加 task，如下所示：

```groovy
task A {
    println '这是任务 A'
}
```

如上就是定义了一个简单的 Task，然后在终端中就可以使用 `gradle + task名` 执行任务，同时查看打印结果：

```groovy
                                          //Windows 下 Android 项目中可以直接使用 gradlew，无需配置环境变量
D:\AndroidProject\flutter_demo_app\android>gradlew A

> Configure project :
这是任务 A

BUILD SUCCESSFUL in 1s
```

从结果中可以看出，打印日志是在 gradle 的配置（Configure）阶段执行的。

==gradle 的构建生命周期包含 3 部分：初始化阶段 --> 配置阶段 --> 执行阶段==。在 task A 中添加 doFirst 闭包，如下所示：

```groovy
task A {
    println '这是任务 A'
    doFirst {
        println '正在执行 A'
    }
}
```

再次执行 task A，打印结果如下所示：

```groovy
D:\AndroidProject\flutter_demo_app\android>gradlew A

> Configure project :
这是任务 A

> Task :A
正在执行 A

BUILD SUCCESSFUL in 796ms
1 actionable task: 1 executed
```



其中，doFirst 为 Task 类中的一个方法，共有三个重载方法如下：

```groovy
    Task doFirst(Action<? super Task> action);

    Task doFirst(Closure action);

    @Incubating
    Task doFirst(String actionName, Action<? super Task> action);
```

当执行 task 时，其内部的 Action 集合会按次序逐个执行，因此==可以借助 `doFirst()`, `doLast()` 等方法来控制 Action 在队列中的顺序，同时也是执行的顺序==：

```groovy
task A {
    println '这是任务 A'

    doFirst {
        println '我在开始执行'
    }

    doLast {
        println '我在最后执行'
    }

}
```

当然也可以指定 Task 的Actions，让它们依次执行，只需要调用`void setActions(List<Action<? super Task>> actions)`即可。

同时==gradle 在运行期会执行所有 task 的配置语句，然后才会执行指定的 Task==，假设有Task A 和 Task B 如下：

```groovy
task A {
    println '这是任务 A'

    doFirst {
        println '开始执行 A'
    }
}

task B {
    println '这是任务 B - 1'
    doFirst {
        println '正在执行 B'
    }

    println '这是任务 B - 2'
}
```

执行 Task A 打印结果如下：

```groovy
D:\AndroidProject\flutter_demo_app\android>gradlew A

> Configure project :
这是任务 A
这是任务 B - 1
这是任务 B - 2

> Task :A
开始执行 A

BUILD SUCCESSFUL in 821ms
1 actionable task: 1 executed
```



#### 1.2 Task 之间可以存在依赖关系

gradle 中的 Task 可以通过 dependsOn 来指定它依赖另一个 Task，如下所示：

```groovy
task A {
    println '配置任务 A'

    doFirst {
        println '开始执行 A'
    }
}

//另一种创建 Task 的方式
tasks.create('C') {
     println '配置任务 C'

     dependsOn('A')

    doFirst {
        println '开始执行 C'
    }
}
```

这样就通过 `dependsOn`  这个方法指定了 task C 依赖于 task A，再执行一下 task C 看看结果：

```groovy
D:\AndroidProject\flutter_demo_app\android>gradlew c

> Configure project :
配置任务 A
配置任务 C

> Task :A
开始执行 A

> Task :C
开始执行 C

BUILD SUCCESSFUL in 842ms
2 actionable tasks: 2 executed
```

可以看出虽然我们只是执行了 task C，但是因为依赖关系的存在，task A 也会被执行。

> gradle 会在配置 Configure 阶段，确定依赖关系。
>
> 对于 Android 项目来说即为执行各个 module 下的 build.gradle 文件，这样各个 build.gradle 文件中的 task 的依赖关系就被确认下来了，而这个依赖关系的确定就是在 Configuration 阶段。



#### 1.3 Gradle 自定义方法

我们可以在 build.gradle 中使用 `def` 关键字自定义方法，比如以下代码中自定义了 getDateTime 方法，并在 task 中使用此方法：

```groovy
def getDateTime(){
    LocalDateTime now = LocalDateTime.now(ZoneId.of('Asia/Shanghai'))
    return now.format(DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss"))
}

//另一种创建 tak 方式
task('my_task'){
    doFirst {
        println "当前日期时间：${getDateTime()}"  // 当前日期时间：2020/06/30 15:57:22
    }
}
```



#### 1.4 系统预置 task

自定义 task 时，还可以使用系统提供的各种显式 task 来完成相应的任务。具体就是使用关键字 type 来指定使用的是哪一个 task：

```groovy
task copy(type: Copy){
    from("src")
    into("dst")
}
```

如上的 task 就是使用 Copy这个显式 task 将 src 中的文件复制到 dst 。

除了 Copy 之外，还有很多其他显式的 task 可用，比如可以通过自定义 task 实现将编译后的 .class 输出到某一特定路径，具体实现如下所示：

```groovy
task compile(type: JavaCompile) { //  1.指定是编译 Java 类的 task
    source('src')               //  2.指定需要编译类的文件路径
    include {
        'Demo.java'				// 3.指定需要编译哪一个 Java 类
    }
    classpath(files("."))			   // 4.设置用于编译源文件的类路径。
    destinationDir(file('./build'))   // 5.指定编译之后，生成 .class 文件的保存路径
}
```

gradle 提供的预置 Task Types 非常多，具体参见：https://docs.gradle.org/current/dsl/org.gradle.api.tasks.Copy.html 网页左侧的 Task types。



------



### 2. Gradle 项目依赖管理

> 依赖管理的条件：
>
> - 依赖外部类库的代码实现现有的功能，避免重复造轮子
> - 自动化依赖管理可以明确依赖的版本，能解决传递性依赖带来的版本冲突问题

#### 2.1 工件坐标(jar 包标志)

- group : 指明 jar 包所在的分组
- name : 指明 jar 包的名称
- version: 指明 jar 包的版本

```groovy
dependencies {
    testCompile group: 'junit', name: 'junit', version: '4.12'
    // 简写
    // testCompile 'junit:junit:4.12'
}
```

在 dependencies 中指明依赖的 jar 包



#### 2.2 仓库(jar 包的存放位置)

- ==公共仓库(中央仓库)==
     Gradle 没有自己的中央仓库，可配置使用 Maven 的中央仓库：mavenCentral/jcenter
- ==私有仓库==
     配置从本地 maven 仓库中获取依赖的 jar 包，不远程加载 jar 包，使用 mavenLocal
- ==自定义 maven 仓库==
     自定义仓库来源，一般指向公司的 Maven 私服。
- ==文件仓库==
     本地机器上的文件路径，一般不使用，没有意义。因为构建工具的目的就是去除本机的影响，可以在任何地方公用同一份仓库数据，跟本机关联上就没有太大的意义，当然特殊情况下除外。

```groovy
repositories {
    // 配置私有仓库
    mvaenLocal()
    
    // 配置中央仓库
    // jcenter()
    mavenCentral()
    
    // 自定义 maven 仓库
    maven {
        url ''
        // 使用本地文件仓库仅仅后面的字符串为 本地文件仓库地址即可
    }
}
```

在 repositories 中配置仓库的指向，在这里面可配置多个仓库，会按配置的顺序去查找jar包，找到则获取，找不到继续到下一个配置的仓库去查找。一般是在最前面配置公司的私服，使用自定义仓库方式配置。



#### 2.3 依赖传递性

比如：A 依赖 B，如果 C 依赖 A，那么 C 依赖 B。
		 就是因为依赖的传递性，所以才会出现版本的冲突问题。以下通过一张图来了解下Gradle 的自动化依赖管理流程。

<img src="https://gitee.com/HeartBeats_huan/GraphBed/raw/master/%E7%AC%94%E8%AE%B0%E5%9B%BE%E7%89%87/%E8%87%AA%E5%8A%A8%E5%8C%96%E4%BE%9D%E8%B5%96%E7%AE%A1%E7%90%86%E6%B5%81%E7%A8%8B.png" alt="img" style="zoom: 80%;" />

<center>自动化依赖管理流程</center>

由图可得知，Gradle 工具从远程仓库下载 jar 包到本地仓库，Gradle 工具需要依赖配置文件，如果同一个 jar 经常使用会被存入到依赖缓存中。





### 3.  Gradle project

在 Android 中每个 module 就对应着一个 project，gradle 在编译时期会为每一个 project 创建一个 Project 对象用来构建项目。这一过程是在初始化阶段，通过解析 settings.gradle 中的配置来创建相应的 Project。

<img src="https://s0.lgstatic.com/i/image/M00/26/55/CgqCHl7xxneADC6uAAAwMY8f2jo857.png" alt="Drawing 15.png" style="zoom:50%;" />

上图 settings.gradle 中导入了 3 个 project，但是实际上还会有一个根 project，使用 ./gradlew project 查看，如下所示：

<img src="https://s0.lgstatic.com/i/image/M00/26/4A/Ciqc1F7xxoCANfOBAAEhWOUbtnQ479.png" alt="Drawing 16.png" style="zoom:50%;" />

我们可以在根 project 中统筹管理所有的子 project，具体在 LagouGradle 路径下的 build.gradle 中进行设置，如下所示：

<img src="https://s0.lgstatic.com/i/image/M00/26/55/CgqCHl7xxoqASIQyAAJT5Xo0vsE094.png" alt="Drawing 17.png" style="zoom:50%;" />

这样写的好处是项目中所有 module 的配置都统一写在一个地方，统筹管理。比如经常会在主项目的 build.gradle 中添加包过滤，解决依赖冲突，如下所示：

<img src="https://s0.lgstatic.com/i/image/M00/26/4A/Ciqc1F7xxpOAT_XTAAKMtjb8INs789.png" alt="Drawing 18.png" style="zoom:50%;" />



------



### 4. buildSrc 统筹依赖管理

随着项目越来越大，工程中的 module 越来越多，依赖的三方库也越来越多。一般情况下我们会在一个集中的地方统一管理这些三方库的版本。比如像谷歌官方推荐的使用 ext 变量，在根 module 的 build.gradle 中，使用 ext 集中声明各种三方库的版本，如下所示：

<img src="https://s0.lgstatic.com/i/image/M00/26/56/CgqCHl7xxqWAEgffAAGk5hqywVA752.png" alt="Drawing 19.png" style="zoom:50%;" />

然后在子 module 中，引用这些版本信息:

<img src="https://s0.lgstatic.com/i/image/M00/26/56/CgqCHl7xxq6AL2vaAAHwPPKyVNo666.png" alt="Drawing 20.png" style="zoom:50%;" />

但是这种写法有点小瑕疵：不支持 AS 的自动补充功能，也无法使用代码自动跟踪，因此可以考虑使用 buildSrc。

buildSrc 是 Android 项目中一个比较特殊的 project，在 buildSrc 中可以编写 Groovy 语言，但是现在谷歌越来也推荐使用 Kotlin 来编写编译语句。



先在根路径下创建目录 buildSrc，结构如下：

<img src="https://s0.lgstatic.com/i/image/M00/26/4A/Ciqc1F7xxriAUHEZAABrS7D3W5Y817.png" alt="Drawing 21.png" style="zoom:50%;" />

- ==注意：这个工程的只能有一个，并且名字必须为 buildSrc。==

创建好之后，在 buildSrc 中创建 build.gradle.kts 文件，并添加 Kotlin 插件：

<img src="https://s0.lgstatic.com/i/image/M00/26/4A/Ciqc1F7xxsGAMYgAAABS_wU3BLs527.png" alt="Drawing 22.png" style="zoom:50%;" />

编译工程有可能会报错，如下所示：

<img src="https://s0.lgstatic.com/i/image/M00/26/4A/Ciqc1F7xxsiAXosXAAG9tqr61q0366.png" alt="Drawing 23.png" style="zoom:50%;" />

只要添加 jcenter() 仓库即可：

```groovy
 repositories { 
 	jcenter() 
 } 
```

接下来在 buildSrc 中创建 src/main/java 目录，并在此目录下创建 Dependencies.kt（名字可随意取）。在 Dependencies.kt 中创建两个 object，分别用来管理工程中的版本信息以及依赖库：

<img src="https://s0.lgstatic.com/i/image/M00/26/4A/Ciqc1F7xxtCAVD7QAABV55LwZYk087.png" alt="Drawing 24.png" style="zoom:50%;" />

我们可以在 Versions 中添加各种项目中可能会引用到的版本：

<img src="https://s0.lgstatic.com/i/image/M00/26/4A/Ciqc1F7xxtiAOo-fAAHpeqvEX5Q157.png" alt="Drawing 25.png" style="zoom:50%;" />

然后在 Deps 中引用 Versions 中的定义的各个依赖版本：

<img src="https://s0.lgstatic.com/i/image/M00/26/56/CgqCHl7xxt-ADJo0AAIfd9-Y62o105.png" alt="Drawing 26.png" style="zoom:50%;" />

最后我们就可以在各个 module 中的 build.gradle 中直接使用 Deps 中的变量用来声明依赖，比如在 app module 的 build.gradle 中添加如下依赖：

<img src="https://s0.lgstatic.com/i/image/M00/26/4A/Ciqc1F7xxuWAFi1dAACYA6J2oxs814.png" alt="Drawing 27.png" style="zoom:50%;" />

上图中分别是使用 buildSrc 前后的对比，并且在使用 Deps 的过程中，studio 会给出自动提示，如下：

![image.gif](https://s0.lgstatic.com/i/image/M00/26/56/CgqCHl7xx4GAZqZQAHlyz8uwUhg260.gif)



### 5. 依赖冲突

