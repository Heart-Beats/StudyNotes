# Gradle 的介绍

[TOC]



> Gradle 是目前流行的一种构建工具，它可以帮我们管理项目中的差异、依赖、编译、打包、部署......，同时还可以定义满足自己需要的构建逻辑,写入到 build.gradle 中供日后复用。



### 1.  创建 Gradle 构建

Gradle 既然是构建工具，那么肯定是针对具体的项目的，接下来我们就看看使用它可以构建怎样的项目结构？



#### 1.1 构建单软件多模块项目

首先，单软件多模块项目指的是什么呢？它通常对应的是项目由一个根模块与多个子模块组成，其中：根模块又依赖于子模块提供的某些功能特性从而实现工程化。

从 Gradle 来看，项目结构如下所示：

```groovy
//具有两个子项目的多项目构建
.
├── app
│   ...
│   └── build.gradle
├── lib
│   ...
│   └── build.gradle
└── settings.gradle
```

以上各个部分分别表示什么意思呢？在 Gradle 中，我们最应该关注的就是 .gradle 文件，接下来就开始分析：

- `settings.gradle`

    在 Gradle  中，它首先会解析项目根目录下的 settings.gradle 文件中的配置来构建整个工程，如上其中的内容就可为：

    ```groovy
    rootProject.name = 'basic-multiproject'  // 指定根项目的名称
    include 'app'                            // 指定需要构建的子模块, 默认找 ./app 作为子模块路径
    include 'lib'	                         // 指定需要构建的子模块							
    ```

- `app/build.gradle`

    app 模块的构建文件，其中该文件指明了模块的类型，依赖，打包配置……

- `lib/build.gradle`

    lib 模块的构建文件，其中该文件指明了模块的类型，依赖，打包配置……

注意：==这里根模块没有 Gradle 构建文件，只有定义要包含的子模块的设置文件，一般根模块的构建文件是用来做子模块的通用配置==



命名建议：

1. *保留子模块的默认模块名称*：可以在设置文件中配置自定义模块名称。
2. *对所有项目名称使用 kebab 大小写格式*，即如：kebab-case-formatting
3. *在设置文件中定义根模块名称*：“rootProject.name” 有效地为整个构建分配一个名称，用于构建扫描等报告。





#### 1.2 微调项目结构

单软件多模块项目始终由具有单个根的树表示，树中的每个元素代表一个模块，同时每个模块都有一个路径，代表它在项目树中的位置。一般情况下，该路径与模块在文件系统中的物理位置一致。但是此路径是可以配置的，项目树在 `settings.gradle` 文件中创建，它所在的位置也是根模块的位置。

一般可以进行如下配置来调整项目树：

1.  构建项目树

    在 `settings.gradle` 文件中，可以使用 `include` 方法来构建项目树：

    ```groovy
    include 'project1', 'project2:child', 'project3:child1'
    ```

    `include` 方法会将项目路径作为参数，如：==路径 “services:api” 默认映射到文件夹 “services/api”（相对于项目根目录）==，只需要指定树的叶子即可。同时这也意味着包含路径 “services:hotels:api” 将导致创建 3 个项目：“services”、“services:hotels”和“services:hotels:api”。

2.  修改项目树的元素

    在 `settings.gradle ` 文件中创建的项目树由所谓的*项目描述符组成*，可以随时读取和修改它们：

    ```groovy
    rootProject.name = 'main'                                 // 修改 Module 名称 
    include('project-a')
    
    println project(':project-a').name                        // 读取 Module 名称 
    project(':project-a').projectDir = file('my-project-a')   // 修改 Module 的路径 
    project(':project-a').buildFileName = 'project-a.gradle'  // 修改 Module 的构建脚本文件 
    ```



#### 1.3 构建多软件多模块项目（复合构建）

一般在大型系统中，会将软件分为几个独立的组件，再通过某些依赖关系将它们联系在一起运行。

如：

```groovy
├── android-app
│   └── settings.gradle
│
├── server-application
│   └── settings.gradle
│
├── build-logic
│   └── settings.gradle
│
└── platforms
    └── settings.gradle
```

上述结构与单软件多模块的架构最大的不同是多了好几个 `settings.gradle` 文件，这些含有 `settings.gradle` 的文件夹都能成为一个单独的 Gradle 构建组件，每个组件自身就可以是一个单软件多模块的项目。



接下来看看可以对它们做啥：

1.  定义组件内部结构
    -   使用  `include()` 给组件添加 Module 
    -   应用 Gradle 的核心插件声明 Module 类型（如：Android 应用、Java 库 …），这样才知道如何处理 Module 的相关源码
    
2. 连接不同的组件

    - 使组件（构建）彼此知道

        在 `settings.gradle` 中使用 `includeBuild(…)` 语句，让一个组件知道另一个组件的物理位置：

        ```groovy
        //server-application 的  settings.gradle
        
        // == Define locations for build logic ==
        pluginManagement {
            repositories {
                gradlePluginPortal()
            }
            includeBuild('../build-logic')
        }
        
        // == Define locations for components ==
        dependencyResolutionManagement {
            repositories {
                mavenCentral()
            }
        }
        includeBuild('../platforms')
        
        // == Define the inner structure of this component ==
        rootProject.name = 'server-application' // the component name
        include('app')
        ```

    - 声明组件之间的依赖关系

        使组件之间彼此知道之后，这时一个组件还是无法依赖另一个组件中的相关 Module 的，还需要进行一些其他配置。

        如  server-application 想要依赖  platforms 的相关模块，假设  platforms  有个 android 模块，这时  platforms   的 构建设置就会如下：

        ```groovy
        ...
        include(':android ')
        ...
        ```

        同时==必须在 android  模块的 build.gradle 中给其设置 group== ，这样 server-application 才能通过坐标引用它，如

        ```groovy
        // android 的 build.gradle
        ...
            
        group "com.hl.example"
        
        android{
            ...
        }
        
        ...
        ```

        这时若想在  server-application  的  app  模块中依赖它，只需要 如下所示：

        ```groovy
        // server-application/app/build.gradle
        
        dependences{
        	impletation 'com.hl.example:android'      //标准坐标依赖形式： [group]:[module]:[version]
        }
        ```

        

3. 使用伞构建

    如果所有构建都位于一个文件夹结构中，则可以在包含所有构建的根文件夹中创建一个伞形构建。然后，可以通过寻址其中一个构建来从根项目调用任务。

    伞形构建是定义跨构建[生命周期任务](https://docs.gradle.org/current/userguide/more_about_tasks.html#sec:lifecycle_tasks)的好地方。例如，可以定义一个 `checkFeatures` 任务，通过将 `build.gradle(.kts)` 文件添加到伞形构建中来方便地运行所选组件中的所有检查：

    ```groovy
    // This is an example of a lifecycle task that crosses build boundaries defined in the umbrella build.
    tasks.register('checkFeatures') {
        group = 'verification'
        description = 'Run all feature tests'
        dependsOn(gradle.includedBuild('admin-feature').task(':config:check'))
        dependsOn(gradle.includedBuild('user-feature').task(':data:check'))
        dependsOn(gradle.includedBuild('user-feature').task(':table:check'))
    }
    ```



------



### 2. 使用 Gradle 属性配置构建环境

> Gradle 可在以下的位置中按照优先级的顺序找到第一个选项应用：
>
> - 命令行，使用`-P`/ `--project-prop` [environment options 设置](https://docs.gradle.org/current/userguide/command_line_interface.html#sec:environment_options)。
> - `gradle.properties` 在` GRADLE_USER_HOME`目录中
> - `gradle.properties` 在项目根目录中
> - `gradle.properties` 在 Gradle 安装目录中



#### 2.1  Gradle 属性

以下属性可用于配置 Gradle 构建环境：

|                             属性                             |                             作用                             |
| :----------------------------------------------------------: | :----------------------------------------------------------: |
|              org.gradle.caching = (true, false)              |                         启用构建缓存                         |
|           org.gradle.caching.debug = (true, false)           |                    debug 模式启用构建缓存                    |
|         org.gradle.configureondemand = (true, false)         |                启用孵化配置，仅配置必要的项目                |
|      org.gradle.console = (auto, plain, rich, verbose)       | 自定义控制台输出颜色或详细程度，默认值取决于 Gradle 的调用方式 |
|              org.gradle.daemon = (true, false)               |                    启用守护进程，默认开启                    |
|      org.gradle.daemon.idletimeout = (# of idle millis)      |       守护进程在指定的空闲毫秒数后自行终止，默认三小时       |
|               org.gradle.debug = (true, false)               | Gradle 将在启用远程调试的情况下运行构建，侦听端口 5005。会等待调试器连接 |
|          org.gradle.java.home = (path to JDK home)           | 为 Gradle 构建过程指定 Java 主目录。该值可以设置为 `jdk` 或 `jre` 路径，使用 jdk 更安全，未设置使用 `JAVA_HOME` |
|             org.gradle.jvmargs = (JVM arguments)             |             指定用于 Gradle 守护进程的 JVM 参数              |
| org.gradle.logging.level = (quiet, warn, lifecycle, info, debug) |     设置 Gradle 的日志级别，不区分大小写，默认 lifecycle     |
|             org.gradle.parallel = (true, false)              |                         任务并行执行                         |
|             org.gradle.priority = (low, normal)              | 指定 Gradle 守护进程及其启动的所有进程的调度优先级。默认为`normal` |
|            org.gradle.vfs.verbose = (true, false)            | 在[查看文件系统](https://docs.gradle.org/current/userguide/gradle_daemon.html#sec:daemon_watch_fs)时配置详细日志记录。 默认为关闭 |
|             org.gradle.vfs.watch = (true, false)             | 切换[监视文件系统](https://docs.gradle.org/current/userguide/gradle_daemon.html#sec:daemon_watch_fs) |
|     org.gradle.warning.mode = (all, fail, summary, none)     | 当设置为`all`, `summary` 或  `none` 时，Gradle 将使用不同的警告类型显示 |
|     org.gradle.workers.max = (max # of worker processes)     |       使用最多给定数量的工作人员，默认为 cpu 处理器数        |



#### 2.2 系统属性

在 `gradle.properties` 文件中以 `systemProp.` 开头的为系统属性，如：

```groovy
systemProp.gradle.wrapperUser=myuser
systemProp.gradle.wrapperPassword=我的密码
```

以下系统属性可用，请注意，命令行选项优先于系统属性：

- **gradle.wrapperUser=(myuser)**：指定用户名以使用 HTTP 基本身份验证从服务器下载 Gradle 发行版
- **gradle.wrapperPassword=(mypassword)**：使用 Gradle 包装器指定用于下载 Gradle 发行版的密码
- **gradle.user.home=(path to directory)**：指定 Gradle 用户主目录
- **https.protocols**：以逗号分隔的格式指定支持的 TLS 版本。例如：`TLSv1.2,TLSv1.3`。

注意：==在多模块项目的构建中，仅根模块中的系统属性（以 `systemProp.`前缀开头的属性）会生效==。



#### 2.3 环境变量

以下环境变量可用于 `gradle` 命令。请注意，命令行选项和系统属性优先于环境变量。

- **GRADLE_OPTS**：指定启动 Gradle 客户端 VM 时要使用的 JVM 参数
- **GRADLE_USER_HOME**：指定 Gradle 用户主目录，未设置则默认为 `$USER_HOME/.gradle`
- **JAVA_HOME**：指定用于客户端 VM 的 JDK 安装目录，此 VM 也用于守护程序，除非在 Gradle 属性文件中指定了不同的 `org.gradle.java.home`



#### 2.4 项目属性

可以通过属性文件或者环境变量来设置项目的自定义属性：

1. 通过  `gradle.properties` 

    ```groovy
    org.gradle.project.foo=bar
    ```

2. 通过环境变量

    ```groovy
    ORG_GRADLE_PROJECT_foo=bar
    ```

之后就可以像使用变量一样使用其名称来访问项目属性，需要注意的是：

在使用之前最好使用 `Project.hasProperty(java.lang.String)` 方法判断属性是否存在，避免构建出错。



#### 2.5 配置 JVM 内存

可以通过以下方式调整 Gradle 的 JVM 选项：

1. 通过 `gradle.properties` 

    ```groovy
    org.gradle.jvmargs=-Xmx2g -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
    ```

2. 通过环境变量

    ```groovy
    JAVA_OPTS="-Xmx64m -XX:MaxPermSize=64m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8"
    ```



#### 2.6 通过 HTTP 代理访问网络

可以在 `gradle.properties` 中指定属性来配置  HTTP 或 HTTPS 代理：

- 配置 HTTP 代理

    ```groovy
    systemProp.http.proxyHost=www.somehost.org
    systemProp.http.proxyPort=8080
    systemProp.http.proxyUser=userid
    systemProp.http.proxyPassword=密码
    systemProp.http.nonProxyHosts=*.nonproxyrepos.com|localhost
    ```

- 配置 HTTPS 代理

    ```groovy
    systemProp.https.proxyHost=www.somehost.org
    systemProp.https.proxyPort=8080
    systemProp.https.proxyUser=userid
    systemProp.https.proxyPassword=密码
    systemProp.http.nonProxyHosts=*.nonproxyrepos.com|localhost
    ```



------



### 3.  Gradle 守护进程

Daemon（守护进程）是一个长期存在的进程，不仅能够避免每次构建的 JVM 启动成本，而且能够在内存中缓存有关项目结构、文件、任务等的信息，并且在可用系统内存不足时会在空闲时自行停止。从 Gradle 3.0 开始，Gradle 守护进程默认启用。



#### 3.1 获取守护进程状态

要获取正在运行的 Gradle 守护程序及其状态的列表，请使用该`--status`命令，输出示例如下：

```bash
    PID VERSION                 STATUS
  28411 3.0                     IDLE
  34247 3.0                     BUSY
```



#### 3.2 禁用守护进程

1. 通过 `GRADLE_USER_HOME/gradle.properties` 文件

    ```groovy
    org.gradle.daemon=false
    ```

2. 通过环境变量

    ```groovy
    GRADLE_OPTS="-Dorg.gradle.daemon=false"
    ```

两种方式具有相同的效果，但第一种方式对大部分人来说更方便。



#### 3.3 停止现有的守护进程

一般情况下无需自主停止守护进程，如果需要明确停止运行守护进程，只需执行下面的命令：

```shell
 gradle --stop
```

这将终止所有使用用于执行命令的相同版本的 Gradle 启动的守护进程。



------



### 4.  初始化脚本

初始化脚本（又名*init scripts*）类似于 Gradle 中的其他脚本。但是，这些脚本在整个项目构建开始之前运行。



#### 4.1 使用初始化脚本

有以下几种使用初始化脚本的方法：

1. 通过命令行

    ```shell
    gradle [-I | --init-script] 脚本路径
    ```

2. 在 `USER_HOME/.gradle/` 目录中创建 `init.gradle` 文件

3. 在 `USER_HOME/.gradle/init.d` 中创建以 `.gradle`（或 `.init.gradle.kts` 对于 Kotlin）结尾的文件 

    

Gradle  会依次按照上面顺序全部执行一遍来查找初始化脚本，同时 `USER_HOME/.gradle/init.d`  目录下的脚本会按照字母顺序执行。这就意味着==可以有多个初始化脚本在构建前被执行==。



#### 4.2  编写初始化脚本

类似于 Gradle 构建脚本，init 脚本是 Groovy 或 Kotlin 脚本。每个 init 脚本都有一个与之关联的 [Gradle](https://docs.gradle.org/current/dsl/org.gradle.api.invocation.Gradle.html) 实例。init 脚本中的任何属性引用和方法调用都将委托给该 `Gradle` 实例。每个 init 脚本还实现了 [Script](https://docs.gradle.org/current/dsl/org.gradle.api.Script.html) 接口，那么我们可以用它来做什么呢？



1. 配置项目

    这与在多模块构建中配置模块的方式类似，如配置使用的外部存储库：

    ```groovy
    //init.gradle
    
    allprojects {
        repositories {
            mavenLocal()
        }
    }
    ```

2. 声明外部依赖项

    初始化脚本中也可以添加外部依赖项，使用 `initscript()` 方法执行此操作，传递给该方法的闭包配置了一个 [ScriptHandler](https://docs.gradle.org/current/javadoc/org/gradle/api/initialization/dsl/ScriptHandler.html) 实例，可以通过向`classpath`配置添加依赖项来声明 init 脚本类路径。

    ```groovy
    //init.gradle
    
    initscript {
        repositories {
            mavenCentral()
        }
        dependencies {
            classpath 'org.apache.commons:commons-math:2.0'
        }
    }
    ```

3. 初始化脚本插件

    类似于 Gradle 构建脚本或 Gradle 设置文件，插件也可以应用于初始化脚本。

    ```kotlin
    apply<AliyunMavenRepositoryPlugin>()
    
    class AliyunMavenRepositoryPlugin: Plugin<Gradle> {
    
        override fun apply(gradle: Gradle) {
    
            println("开始应用插件，添加仓库地址为阿里云仓库")
    
            gradle.allprojects {
                repositories {
    
                    // jcenter {
    				// 	name = "aliyunJcenter" 
    				// 	url = uri("https://maven.aliyun.com/repository/jcenter")
    				
                    // }
                    // google {
                    // 	name = "aliyunGoogle"
    				// 	url = uri("https://maven.aliyun.com/repository/google")
                    // }
                    // mavenCentral {
                    // 	name = "aliyunMavenCentral"
                    // 	url = uri("https://maven.aliyun.com/repository/public")
                    // }
    
                    // central仓和jcenter仓的聚合仓
                    maven{
                        name = "aliyunPublic" 
                        url = uri("https://maven.aliyun.com/repository/public")
                    }
    
                    maven{
                        name = "aliyunMavenCentral"
                     	url = uri("https://maven.aliyun.com/repository/central")
                    }
    
                    maven{
                        name = "aliyunJcenter" 
                        url = uri("https://maven.aliyun.com/repository/public")
                    }
    
                    maven{
                       name = "aliyunGoogle"
                       url = uri("https://maven.aliyun.com/repository/google")
                    }
    
                    maven{
                       name = "aliyunGradlePlugin"
                       url = uri("https://maven.aliyun.com/repository/gradle-plugin")
                    }
                }
            }
        }
    }
    ```

    在 init 脚本中应用插件时，Gradle 会实例化插件并调用插件实例的 [Plugin.apply(T)](https://docs.gradle.org/current/javadoc/org/gradle/api/Plugin.html#apply-T-) 方法。该 `gradle` 对象作为参数传递，可用于配置构建的所有方面。

4. 初始化全局的属性或方法

    如涉及一些敏感信息的需要在构建中使用，可以将其放在初始化脚本中来保证不会被 Git 托管上传。



------



### 5. Gradle Build 生命周期

Gradle 进行构建时，会经历3个生命周期：

1.  初始化阶段

2.  配置阶段

3.  执行阶段

    <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/99987b264ab2348bed178526f381635efd8c1a01/images/Gradle build 生命周期.png" alt="Gradle build 生命周期" style="zoom:80%;" />

#### 5.1 初始化阶段

初始化阶段确定有多少工程需要构建，创建整个项目层次，并为每个 module 创建一个 Project 对象。项目初始化阶段会执行 setting.gradle 文件，setting.gradle 中所配置的 module 路径会决定 Gradle 创建哪些 project。



#### 5.2 配置阶段

配置阶段会执行 Project 对象和 Task 对象的代码，可以称这个阶段为配置阶段，配置阶段主要执行读取配置参数，创建 Task 对象，根据 Task 之间的依赖关系，构建出有向无环图，进而规定 Task 的执行顺序。**对于 task 对象而言，需要明确区分配置和执行这两个阶段**。整个配置阶段的运行顺序参照顶层 build.gradle 所代表的 Project 对象 -> setting.gradle 所声明的 Project 对象的顺序执行。



#### 5.3 执行阶段

执行阶段会按照配置中规定的顺序执行所有的 Task ，调用 Task 的 doFirst、doLast 方法传入的闭包会存入 Task 的 actions 列表（Task 中的 doFirst、doLast 方法均可调用多次）。

Gradle 生命周期提供了丰富的回调接口帮助使用者方便的 Hook 整个 Build 流程，可用的函数在上图中均有展示。同时如果使用的 IDE 是 Android Studio 或者 IntelliJ ，可在 Build 窗口中看到配置阶段和执行阶段，在 Build Output 中配置阶段输出以  `> Configure project :`  开头，执行阶段以 `> Task :` 开头。



------



### 6. Gradle Task

> Gradle 的构建实际上是基于任务（工作单元）的一个有向无环图 (DAG)，创建任务图后，Gradle 会确定哪些任务需要以何种顺序运行，然后继续执行它们。
>
> <img src="https://docs.gradle.org/current/userguide/img/task-dag-examples.png" alt="示例任务图" style="zoom: 25%;" />
>
> Task（任务）可以理解为 gradle 的执行单元，gradle 通过执行一个个 Task 来完成整个项目构建工作。
>
> 它由多个action组成，action 就是一个代码块，里面是需要执行的代码，比如编译，打包，生成 javadoc，发布等



#### 6.1 自定义 Task

我们可以在 build.gradle 中使用关键字 task 来自定义一个 Task。比如创建 build.gradle 文件，并添加 task，如下所示：

```groovy
tasks.register('A'){
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
tasks.register('A'){
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
tasks.register('A'){
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
tasks.register('A') {
    println '这是任务 A'

    doFirst {
        println '开始执行 A'
    }
}

tasks.register('B') {
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

注意：还有其他方法可以创建任务，不鼓励使用这些方法，并将在未来版本中弃用。例如，`task A`  、`tasks.create('C')`



#### 6.2 定位任务

通常，任务可通过 `tasks` 集合获得。使用返回*任务提供者*的方法 `register()`  或者 `named()` 可以定位到相关任务，如：

```groovy
tasks.register('hello')
tasks.register('copy', Copy)

println tasks.named('hello').get().name

println tasks.named('copy').get().destinationDir
```

还可以使用 `tasks.withType()` 方法访问特定类型的任务。这可以轻松避免代码重复并减少冗余：

```groovy
tasks.withType(Tar).configureEach {
    enabled = false
}

tasks.register('test') {
    dependsOn tasks.withType(Copy)
}
```

还可以使用 `tasks.getByPath()` 方法使用任务的路径从任何项目访问任务， `getByPath()` 可以使用任务名称、相对路径或绝对路径调用该方法。但这不是推荐的做法，因为它破坏了[任务配置避免](https://docs.gradle.org/current/userguide/task_configuration_avoidance.html#task_configuration_avoidance)和项目隔离。

```groovy
tasks.register('hello')

println tasks.getByPath('hello').path
println tasks.getByPath(':hello').path
println tasks.getByPath('project-a:hello').path
println tasks.getByPath(':project-a:hello').path
```



#### 6.3 配置任务 —— 类型、参数和依赖

1.  使用系统预置 Task

    自定义 task 时，还可以使用系统提供的各种显式 task 来完成相应的任务。如：

    ```groovy
    tasks.register('copy', Copy) {
       from 'src'
       into 'dst'
       include('**/*.txt', '**/*.xml', '**/*.properties')
    }
    ```

    如上的 task 就是使用 Copy 这个显式 task 将 src 中的文件复制到 dst 。

    除了 Copy 之外，还有很多其他显式的 task 可用，比如可以通过自定义 task 实现将编译后的 .class 输出到某一特定路径，具体实现如下所示：

    ```groovy
    tasks.register('javaCompile', JavaCompile) { //  1.指定是编译 Java 类的 task
        source('src')               //  2.指定需要编译类的文件路径
        include {
            'Demo.java'				// 3.指定需要编译哪一个 Java 类
        }
        classpath(files("."))			   // 4.设置用于编译源文件的类路径。
        destinationDir(file('./build'))   // 5.指定编译之后，生成 .class 文件的保存路径
    }
    ```

    gradle 提供的预置 Task Types 非常多，具体参见：https://docs.gradle.org/current/dsl/org.gradle.api.tasks.Copy.html 网页左侧的 Task types。

    

2.  将参数传递给任务构造函数

    与 `Task` 在创建后配置可变属性相反，也可以将参数值传递给 `Task` 类的构造函数。为了将值传递给 `Task` 的构造函数，必须使用 `@javax.inject.Inject` 。如下：

    ```groovy
    abstract class CustomTask extends DefaultTask {
        final String message
        final int number
    
        @Inject
        CustomTask(String message, int number) {
            this.message = message
            this.number = number
        }
    }
    ```

    然后可以创建一个任务，在参数列表的末尾传递构造函数参数。

    ```groovy
    tasks.register('myTask', CustomTask, 'hello', 42)
    ```

    

3.  向 Task  添加依赖 Task

    -   使用任务名称定义依赖项

        任务名称可以为同一项目中的任务，也可以是其他项目中的任务。要引用另一个项目中的任务，需要在任务名称前加上它所属项目的路径。下面是一个 `project-a:taskX` 添加依赖 `project-b:taskY` 的例子：

        ```groovy
        project('project-a') {
            tasks.register('taskX')  {
                dependsOn ':project-b:taskY'
                doLast {
                    println 'taskX'
                }
            }
        }
        
        project('project-b') {
            tasks.register('taskY') {
        		println '正在配置 :project-b:taskY'  // 配置阶段就会执行（Gradle Async）
                doLast {
                    println 'taskY'
                }
            }
        }
        ```

        输出如下：

        ```shell
        > gradle -q taskX 
        taskY 
        taskX
        ```

        

    -   使用 `TaskProvider` 对象定义依赖项

        除了任务名称，还可以使用 `TaskProvider` 声明依赖项，如：

        ```groovy
        def taskX = tasks.register('taskX') {
            doLast {
                println 'taskX'
            }
        }
        
        def taskY = tasks.register('taskY') {
            doLast {
                println 'taskY'
            }
        }
        
        // 通过此方法配置任务依赖
        taskX.configure {
            dependsOn taskY
        }
        ```

        执行后输出结果与使用任务名称一致。

        

    -   使用惰性块定义多个依赖

        使用惰性块时可以定义 Task 依赖单个 `Task` 或一组 `Task` 对象。以下示例 `taskX` 依赖项目中名称所有以 `lib` 开头的任务：

        ```groovy
        def taskX = tasks.register('taskX') {
            doLast {
                println 'taskX'
            }
        }
        
        // Using a Gradle Provider
        taskX.configure {
            dependsOn(provider {
                tasks.findAll { task -> task.name.startsWith('lib') }
            })
        }
        
        tasks.register('lib1') {
            doLast {
                println('lib1')
            }
        }
        
        tasks.register('lib2') {
            doLast {
                println('lib2')
            }
        }
        
        tasks.register('notALib') {
            doLast {
                println('notALib')
            }
        }
        ```

        执行输出如下：

        ```shell
        > gradle -q taskX 
        lib1 
        lib2 
        taskX
        ```

        

#### 6.4 Task 执行顺序控制

>   在某些情况下，控制 2  个任务的执行顺序很有用，而无需在这些任务之间引入显式依赖关系。任务排序和任务依赖之间的主要区别在于：排序规则不影响将执行哪些任务，只影响执行的顺序。



主要有两种可用的排序规则：==“ must run after ”== 和 ==“  should run after”==。

-   must run after

    `taskB.mustRunAfter(taskA)` 这种情况，无论何时 `taskB` 都将在 `taskA` 之后运行。

-    should run after

    排序规则类似但不那么严格，应该在排序有用但不是严格要求的情况下使用它。



有了这些规则，可以在 `taskA` 没有执行的情况下执行 `taskB` ，反之亦然。如：

```groovy
def taskX = tasks.register('taskX') {
    doLast {
        println 'taskX'
    }
}

def taskY = tasks.register('taskY') {
    doLast {
        println 'taskY'
    }
}

//①
taskY.configure {
    mustRunAfter taskX
}

// ②
taskY.configure {
    shouldRunAfter taskX
}
```

这两种情况下，执行 `gradle -q taskY taskX` ，输出都会如下：

```groovy
> gradle -q taskY taskX 
taskX 
taskY
```

但任务排序并不意味着任务执行，第二种情况就可以在 `taskY` 不导致 `taskX` 运行的情况下执行：

```shell
> gradle -q taskY 
taskY
```

注意：

1. 排序不意味着任务之间有任何执行依赖性，它是在两个任务都计划执行时才有效。

2. 使用运行时参数 `--continue`，则 `B` 可以在 `A` 失败的情况下执行。

3. 如果引入排序循环，“应该在之后运行” 排序规则将被忽略，如：

    ```groovy
    def taskX = tasks.register('taskX') {
        doLast {
            println 'taskX'
        }
    }
    def taskY = tasks.register('taskY') {
        doLast {
            println 'taskY'
        }
    }
    def taskZ = tasks.register('taskZ') {
        doLast {
            println 'taskZ'
        }
    }
    taskX.configure { dependsOn(taskY) }
    taskY.configure { dependsOn(taskZ) }
    taskZ.configure { shouldRunAfter(taskX) }
    ```

    输出如下：

    ```shell
    > gradle -q taskX
    任务Z
    任务Y
    任务X
    ```

    可以看出任务 Z 并不是在任务 X 之后执行。



#### 6.5 添加描述

给任务添加描述非常简单，使用 `description` 方法即可，如下：

```groovy
tasks.register('copy', Copy) {
   description 'Copies the resource directory to the target directory.'
   from 'resources'
   into 'target'
   include('**/*.txt', '**/*.xml', '**/*.properties')
}
```



#### 6.6 跳过任务

1. 使用谓词

    使用 `onlyIf()` 方法将谓词附加到任务，仅当谓词评估为真时才执行任务的操作。如下：

    ```groovy
    def hello = tasks.register('hello') {
        doLast {
            println 'hello world'
        }
    }
    
    hello.configure {
        onlyIf { !project.hasProperty('skipHello') }  //仅当闭包返回值为真时才执行任务
    }
    ```

    

2. 使用异常停止执行

    当任务执行时满足某些条件，可以抛出 `StopExecutionException` 异常，这会将当前任务的后续动作都跳过，执行下一个任务。如：

    ```groovy
    def compile = tasks.register('compile') {
        doLast {
            println 'We are doing the compile.'
        }
    }
    
    compile.configure {
        doFirst {
            // 这需要替换为满足的真实条件
            if (true) {
                throw new StopExecutionException()
            }
        }
    }
    tasks.register('myTask') {
        dependsOn('compile')
        doLast {
            println 'I am not affected'
        }
    }
    ```

    输出如下：

    ```shell
    > gradle -q myTask
    I am not affected
    ```

    

#### 6.7 启用和禁用任务

每个任务都有一个 `enabled`  属性，它默认为 `true` 。将其设置为 `false`  就会阻止任务执行。禁用的任务将被标记为已跳过，因此==也可以使用此方法跳过任务==。

```groovy
def disableMe = tasks.register('disableMe') {
    doLast {
        println 'This should not be printed if the task is disabled.'
    }
}

disableMe.configure {
    enabled = false
}
```

输出如下：

```shell
> gradle disableMe
> 任务 :disableMe SKIPPED

在 0 秒内构建成功
```



#### 6.8 任务超时

每个任务都有一个 `timeout` 属性，可用于限制其执行时间。当任务超时时，其任务执行线程被中断。如果运行时使用 `--continue` 参数，其他任务可以在它中断之后继续运行。

```groovy
tasks.register("hangingTask") {
    doLast {
        Thread.sleep(100000)
    }
    timeout = Duration.ofMillis(500)
}
```



#### 6.9 增量构建

> 任务输入与输出：
>
> 在最常见的情况下，任务接受一些输入并生成一些输出。如果使用前面的编译示例，可以看到源文件是输入，而在 Java 的情况下，生成的类文件是输出。其他输入可能包括诸如是否应包含调试信息之类的内容。
>
> 作为增量构建的一部分，Gradle 测试自上次构建以来是否有任何任务输入或输出发生了变化。如果没有，Gradle 可以认为任务是最新的，因此跳过执行其操作。



注册任务属性为输入或输出主要有以下方式：

- 自定义任务类型
- 运行时 API 



1. 自定义任务类型

    如果自定义任务作为类来实现，那么只需两个步骤即可使其与增量构建一起工作：

    - 为每个任务的输入和输出创建类型化属性（通过 getter 方法）

    - 为每个属性添加适当的注释，注释必须放在 getter 或 Groovy 属性上

        

    Gradle 支持三个主要类别的输入和输出：

    - 简单值：字符串和数字之类实现了 Serializable 的类型

    - 文件系统类型：包括标准`File` 类，但也包括 Gradle 的 [FileCollection](https://docs.gradle.org/current/javadoc/org/gradle/api/file/FileCollection.html) 类型及其子类

    - 嵌套值：不符合其他两个类别但具有自己的输入或输出属性的自定义类型

        

    例如，假设有一个任务处理不同类型的模板，例如 FreeMarker、Velocity、Moustache 等。它获取模板源文件并将它们与一些模型数据组合以生成模板文件的填充版本。

    此任务将具有三个输入和一个输出：

    - 模板源文件
    - 模型数据
    - 模板引擎
    - 输出文件的写入位置

    当编写自定义任务类时，很容易通过注释将属性注册为输入或输出。如：

    buildSrc/src/main/java/org/example/ProcessTemplates.java

    ```java
    package org.example;
    
    import java.util.HashMap;
    import org.gradle.api.DefaultTask;
    import org.gradle.api.file.ConfigurableFileCollection;
    import org.gradle.api.file.DirectoryProperty;
    import org.gradle.api.provider.Property;
    import org.gradle.api.tasks.*;
    
    public abstract class ProcessTemplates extends DefaultTask {
    
        @Input
        public abstract Property<TemplateEngineType> getTemplateEngine();  //模板引擎
    
        @InputFiles
        public abstract ConfigurableFileCollection getSourceFiles();   // 模板源文件
    
        @Nested
        public abstract TemplateData getTemplateData();              // 模型数据
    
        @OutputDirectory
        public abstract DirectoryProperty getOutputDir();           //输出文件的写入位置
    
        @TaskAction
        public void processTemplates() {
            // ...
        }
    }
    ```

    buildSrc/src/main/java/org/example/TemplateData.java

    ```java
    package org.example;
    
    import org.gradle.api.provider.MapProperty;
    import org.gradle.api.provider.Property;
    import org.gradle.api.tasks.Input;
    
    public abstract class TemplateData {
    
        @Input
        public abstract Property<String> getName();
    
        @Input
        public abstract MapProperty<String, String> getVariables();
    }
    ```

    执行 `gradle processTemplates` 输出如下：

    ```shell
    > gradle processTemplates
    > 任务：processTemplates
    
    在 0 秒内构建成功
    3 个可操作的任务：3 个最新的
    ```

    再次执行输出：

    ```shell
    > gradle processTemplates
    > 任务：processTemplates 最新
    
    在 0 秒内构建成功
    3 个可操作的任务：3 个最新的
    ```

    上述这些带注释的属性意味着，如果自上次 Gradle 执行任务以来，源文件、模板引擎、模型数据或生成的文件都没有发生变化，Gradle 将跳过该任务，这通常会节省大量时间。

    

    接下来，就看看 *增量构建属性* 中有哪些可以使用的注释：

    |           注解            |                     预期属性类型                     |                             描述                             |
    | :-----------------------: | :--------------------------------------------------: | :----------------------------------------------------------: |
    |         `@Input`          |               任何 `Serializable` 类型               |                       一个简单的输入值                       |
    |       `@InputFile`        |                       `File`*                        |                   单个输入文件（不是目录）                   |
    |     `@InputDirectory`     |                       `File`*                        |                   单个输入目录（不是文件）                   |
    |       `@InputFiles`       |                  `Iterable<File>`*                   |                     输入文件和目录的迭代                     |
    |       `@Classpath`        |                  `Iterable<File>`*                   |         代表 Java 类路径的输入文件和目录的可迭代对象         |
    |    `@CompileClasspath`    |                  `Iterable<File>`*                   |       代表 Java 编译类路径的输入文件和目录的可迭代对象       |
    |       `@OutputFile`       |                       `File`*                        |                   单个输出文件（不是目录）                   |
    |    `@OutputDirectory`     |                       `File`*                        |                   单个输出目录（不是文件）                   |
    |      `@OutputFiles`       |      `Map<String, File>`** 或`Iterable<File>`*       | 输出文件的可迭代或映射，使用文件树会关闭任务的[缓存](https://docs.gradle.org/current/userguide/build_cache.html#sec:task_output_caching) |
    |   `@OutputDirectories`    |      `Map<String, File>`** 或`Iterable<File>`*       | 一个可迭代的输出目录，使用文件树会关闭任务的[缓存](https://docs.gradle.org/current/userguide/build_cache.html#sec:task_output_caching) |
    |        `@Destroys`        |              `File`或`Iterable<File>`*               | 指定此任务删除的一个或多个文件。请注意，任务可以定义输入/输出或可销毁对象，但不能同时定义两者。 |
    |       `@LocalState`       |              `File`或`Iterable<File>`*               | 指定一个或多个代表[任务本地状态的](https://docs.gradle.org/current/userguide/custom_tasks.html#sec:storing_incremental_task_state)文件。当任务从缓存加载时，这些文件将被删除。 |
    |         `@Nested`         |                    任何自定义类型                    |                  一种自定义类型，可能未实现                  |
    |        `@Console`         |                       任何类型                       | 表示该属性既不是输入也不是输出。它只是以某种方式影响任务的控制台输出，例如增加或减少任务的详细程度。 |
    |        `@Internal`        |                       任何类型                       |        表示该属性在内部使用，但既不是输入也不是输出。        |
    |       `@ReplacedBy`       |                       任何类型                       |       表示该属性已被另一个替换，应作为输入或输出忽略。       |
    |     `@SkipWhenEmpty`      |              `File`或`Iterable<File>`*               | 与 `@InputFiles` 或 `@InputDirectory` 一起使用，如果相应的文件或目录为空，则告诉 Gradle 跳过任务，以及使用此注释声明的所有其他输入文件。 |
    |      `@Incremental`       | `Provider<FileSystemLocation>` 或者 `FileCollection` | 与 `@InputFiles` 或 `@InputDirectory` 用于指示 Gradle 跟踪对带注释的文件属性的更改，对于增量任务，可以通过``@InputChanges.getFileChanges()` 查询更改 |
    |        `@Optional`        |                       任何类型                       | 与[可选](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/Optional.html)API 文档中列出的任何属性类型注释一起使用。此注释禁用对相应属性的验证检查。有关更多详细信息，请参阅[验证部分](https://docs.gradle.org/current/userguide/more_about_tasks.html#sec:task_input_output_validation)。 |
    |     `@PathSensitive`      |              `File`或`Iterable<File>`*               | 与任何输入文件属性一起使用，告诉 Gradle 只将文件路径的给定部分视为重要的。例如，如果一个属性用 注释`@PathSensitive(PathSensitivity.NAME_ONLY)`，那么在不更改其内容的情况下移动文件不会使任务过时。 |
    | `@IgnoreEmptyDirectories` |              `File`或`Iterable<File>`*               | 与 `@InputFiles` 或 `@InputDirectory `一起使用，指示 Gradle 仅跟踪目录内容的更改，而不跟踪目录本身的差异。例如，在目录结构中的某处删除、重命名或添加空目录不会使任务过时。 |
    |  `@NormalizeLineEndings`  |              `File`或`Iterable<File>`*               | 与 `@InputFiles`, `@InputDirectory` 或 ` @Classpath` 一起使用，用于指示 Gradle 在计算最新检查或构建缓存键时规范化行尾。例如，在 Unix 行尾和 Windows 行尾（或反之亦然）之间切换文件不会使任务过时。 |

    注意： 这些注释的类型子类可被继承，同时子类可以重写覆盖相关属性的类型。

    

2. 运行时 API

    如果无权访问自定义任务类的源代码，则无法为它添加任何增量注释。此种情况下就需要使用运行时 API。

    这个运行时 API 是通过几个恰当命名的属性提供的，这些属性可用于每个 Gradle 任务：

    - [TaskInputs ](https://docs.gradle.org/current/dsl/org.gradle.api.Task.html#org.gradle.api.Task:inputs)类型的 [Task.getInputs ](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/TaskInputs.html)[()](https://docs.gradle.org/current/dsl/org.gradle.api.Task.html#org.gradle.api.Task:inputs)
    - [TaskOutputs](https://docs.gradle.org/current/dsl/org.gradle.api.Task.html#org.gradle.api.Task:outputs) 类型的[ Task.getOutputs ](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/TaskOutputs.html)[()](https://docs.gradle.org/current/dsl/org.gradle.api.Task.html#org.gradle.api.Task:outputs)
    - [Task.getDestroyables() ](https://docs.gradle.org/current/dsl/org.gradle.api.Task.html#org.gradle.api.Task:destroyables)类型 [TaskDestroyables](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/TaskDestroyables.html)

    这些对象具有允许指定构成任务输入和输出的文件、目录和值的方法。事实上，运行时 API 几乎具有与注释相同的特性。它所缺少的只是.`@Nested`。

    

    以之前的模板处理示例为例，看看它如何作为使用运行时 API 的临时任务：

    ```groovy
    tasks.register('processTemplatesAdHoc') {
        inputs.property('engine', TemplateEngineType.FREEMARKER)
        inputs.files(fileTree('src/templates'))
            .withPropertyName('sourceFiles')
            .withPathSensitivity(PathSensitivity.RELATIVE)
        inputs.property('templateData.name', 'docs')
        inputs.property('templateData.variables', [year: '2013'])
        outputs.dir(layout.buildDirectory.dir('genOutput2'))
            .withPropertyName('outputDir')
    
        doLast {
            // Process the templates here
        }
    }
    ```

    执行输出如下：

    ```shell
    > gradle processTemplatesAdHoc 
    > Task :processTemplatesAdHoc 
    
    BUILD SUCCESSFUL in 0s 
    3 个可操作的任务：3 个执行
    ```

    和以前一样，首先，应该为此编写一个自定义任务同时没有任务属性来存储根源文件夹、输出目录的位置或任何其他设置。这是故意强调这样一个事实，即运行时 API 不需要任务具有任何状态。在增量构建方面，上述临时任务的行为与自定义任务类相同。

    所有输入和输出的定义是通过在方法完成 `inputs` 和 `outputs` ，如 `property()`，`files()`和`dir()`。Gradle 对参数值执行最新检查，以确定任务是否需要再次运行。每个方法对应一个增量构建注释，例如 `inputs.property()` 对应 `@Input`、`outputs.dir() `对应 `@OutputDirectory`。





增量构建除了加快构建速度，还有一些其他重要的有益点：

- 推断任务依赖关系
- 输入和输出验证
- 持续构建
- 任务并行性



1. 推断任务依赖关系

    如果一个任务的输入设置为另一个任务的输出，这意味着第一个任务依赖于第二个。如：

    ```groovy
    tasks.register('packageFiles', Zip) {
        from processTemplates.map {it.outputs }
    }
    ```

    输出如下：

    ```shell
    > gradle clean packageFiles 
    > Task :processTemplates 
    > Task :packageFiles 
    
    BUILD SUCCESSFUL in 0s 
    5 个可操作的任务：4 个已执行，1 个是最新的
    ```

    显然 Gradle 会自动将` packageFiles` 依赖 `processTemplates`，此过程就是任务依赖关系的推断。

    上面的例子也可以写成：

    ```groovy
    tasks.register('packageFiles2', Zip) {
        from processTemplates
    }
    ```

    这是因为 `from()` 方法可以接受任务对象作为参数。在幕后，`from()` 使用 `project.files()` 方法包装参数，这反过来将任务的正式输出公开为文件集合。换句话说，这是一个特例！

    

2. 输入和输出验证

    增量构建注解为 Gradle 提供了足够的信息来对注解的属性执行一些基本的验证。特别是，它在任务执行之前对每个属性执行以下操作：

    - `@InputFile` ：验证该属性是否具有值以及该路径是否对应于存在的文件（而不是目录）。

    - `@InputDirectory`： 与 `@InputFile` 相同，但路径必须对应于目录。

    - `@OutputDirectory` ： 验证路径是否与文件不匹配，如果目录不存在，还会创建目录。

        

    此类验证提高了构建的稳健性，能够快速识别与输入和输出相关的问题。

    有时偶尔会想要禁用某些这种验证，特别是当输入文件可能不存在时。这就是 Gradle 提供 `@Optional` 注释的原因：使用它来告诉 Gradle 特定输入是可选的，因此如果相应的文件或目录不存在，构建不应失败。

    

3. 持续构建

    定义任务输入和输出的另一个好处是持续构建。由于 Gradle 知道任务依赖于哪些文件，因此如果任何输入发生变化，它可以自动再次运行任务。通过在运行 Gradle 时激活连续构建（通过`--continuous`或`-t`选项），您将使 Gradle 进入一种状态，在该状态下它会不断检查更改并在遇到此类更改时执行请求的任务。

    

4. 任务并行性

    定义任务输入和输出的最后一个好处是，当使用 “`--parallel`” 选项时，Gradle 可以使用此信息来决定如何运行任务。例如，Gradle 将在选择下一个要运行的任务时检查任务的输出，并避免并发执行写入同一输出目录的任务。

    



#### 6.10  任务规则

有时，希望任务的行为取决于参数的大范围或无限数值范围。提供此类任务的一种非常好且富有表现力的方式是任务规则：

```groovy
tasks.addRule("Pattern: ping<ID>") { String taskName ->

    if (taskName.startsWith("ping")) {
        task(taskName) {
            doLast {
                println "Pinging: " + (taskName - 'ping')
            }
        }
    }
}
```

输出如下：

```shell
> gradle -q pingServer1 
Ping：Server1
```

规则不仅在从命令行调用任务时使用。还可以在基于规则的任务上创建依赖关系：

```groovy
tasks.addRule("Pattern: ping<ID>") { String taskName ->

    if (taskName.startsWith("ping")) {
        task(taskName) {
            doLast {
                println "Pinging: " + (taskName - 'ping')
            }
        }
    }
}

tasks.register('groupPing') {
    dependsOn 'pingServer1', 'pingServer2'
}
```

输出如下：

```shell
> gradle -q groupPing 
Ping：Server1 
Ping：Server2
```

如果运行 `gradle -q tasks` 将找不到名为 `pingServer1` 或的任务 `pingServer2`，但此脚本正在根据运行这些任务的请求执行逻辑。



#### 6.11 终结器任务 —— 与依赖相反

当完成的任务计划运行时，终结器任务会自动添加到任务图中。

```groovy
def taskX = tasks.register('taskX') {
    doLast {
        println 'taskX'
    }
}
def taskY = tasks.register('taskY') {
    doLast {
        println 'taskY'
    }
}

taskX.configure { finalizedBy taskY }
```

执行 taskX 输出如下：

```shell
> gradle -q taskX 
taskX 
taskY
```

==即使完成的任务失败，也会执行终结器任务==：

```groovy
def taskX = tasks.register('taskX') {
    doLast {
        println 'taskX'
        throw new RuntimeException()
    }
}
def taskY = tasks.register('taskY') {
    doLast {
        println 'taskY'
    }
}

taskX.configure { finalizedBy taskY }
```

再次执行 taskX，输出如下：

```shell
> gradle -q taskX 
taskX 
taskY

失败：构建失败，出现异常。

* 其中：
构建文件 '/home/user/gradle/samples/build.gradle' 行：4 

* 出了什么问题：
任务 ':taskX' 执行失败。
> java.lang.RuntimeException（无错误消息）

* 尝试：
使用 --stacktrace 选项运行以获取堆栈跟踪。使用 --info 或 --debug 选项运行以获得更多日志输出。使用 --scan 运行以获得完整的见解。

* 在 https://help.gradle.org 获得更多帮助

BUILD FAILED in 0s
```

另一方面，==如果完成的任务没有做任何工作，则不会执行终结器任务，例如，如果它被认为是最新的或依赖的任务失败==。

因此，终结器任务在构建创建资源的情况下很有用，无论构建失败还是成功都必须清理该资源。



#### 6.12 生命周期任务

生命周期任务是本身不工作的任务。它们通常没有任何任务操作。生命周期任务可以代表几个概念：

- 工作流程步骤（例如，使用 运行所有检查`check`）

- 一个可构建的东西（例如，使用 为本机组件创建一个调试 32 位可执行文件`debug32MainExecutable`）

- 执行许多相同逻辑任务的便利任务（例如，使用 运行所有编译任务`compileAll`）

    

基本插件定义了几个 [标准的生命周期的任务](https://docs.gradle.org/current/userguide/base_plugin.html#sec:base_tasks)，如 `build`，`assemble `和 `check`。所有核心语言插件，如 [Java 插件](https://docs.gradle.org/current/userguide/java_plugin.html#java_plugin)，都应用基础插件，因此具有相同的基本生命周期任务集。

除非生命周期任务具有操作，否则其[结果](https://docs.gradle.org/current/userguide/more_about_tasks.html#sec:task_outcomes)由其任务依赖关系决定。如果执行这些依赖项中的任何一个，则将考虑生命周期任务 `EXECUTED`。如果所有任务依赖项都是最新的、已跳过或来自缓存，则将考虑生命周期任务 `UP-TO-DATE`。



------



### 7. 构建脚本中的一些知识



#### 7.1 项目 API

构建脚本通过配置*项目来*描述构建。项目是一个抽象概念，通常将 Gradle 项目映射到需要构建的软件组件，例如库或应用程序。每个构建脚本都与一个 [Project](https://docs.gradle.org/current/dsl/org.gradle.api.Project.html) 类型的对象相关联，并且当构建脚本执行时，它会配置这个 `Project`。

该 `Project` 对象提供了一些标准属性，这些属性在您的构建脚本中可用。下表列出了一些常用的：

|    属性名     |                             类型                             |        默认值        |
| :-----------: | :----------------------------------------------------------: | :------------------: |
|   `project`   | [Project](https://docs.gradle.org/current/dsl/org.gradle.api.Project.html) |   该`Project`实例    |
|    `name`     |                           `String`                           |    项目目录的名称    |
|    `path`     |                           `String`                           |    项目的绝对路径    |
| `description` |                           `String`                           |      项目的描述      |
| `projectDir`  |                            `File`                            |  包含构建脚本的目录  |
|  `buildDir`   |                            `File`                            | `*projectDir*/build` |
|    `group`    |                           `Object`                           |    `unspecified`     |
|   `version`   |                           `Object`                           |    `unspecified`     |
|     `ant`     | [AntBuilder](https://docs.gradle.org/current/javadoc/org/gradle/api/AntBuilder.html) | 一个`AntBuilder`实例 |



#### 7.2 [脚本API](https://docs.gradle.org/current/userguide/writing_build_scripts.html#sec:the_script_api)

当 Gradle 执行 Groovy 构建脚本 ( `.gradle`) 时，它会将脚本编译成一个实现 [Script](https://docs.gradle.org/current/dsl/org.gradle.api.Script.html) 的类。这意味着 `Script` 接口声明的所有属性和方法都可以在脚本中使用。 执行 Kotlin 构建脚本 ( `.gradle.kts`) 时，它会将脚本编译为 [KotlinBuildScript](https://gradle.github.io/kotlin-dsl-docs/api/org.gradle.kotlin.dsl/-kotlin-build-script/index.html) 的子类，也是类似。



#### 7.3 声明变量

1.  局部变量

    局部变量用 `def` 关键字声明。它们只在它们被声明的范围内可见。关键字与使用的构建脚本语言有关：

    ```groovy
    def dest = 'dest'
    
    tasks.register('copy', Copy) {
        from 'source'
        into dest
    }
    ```

    

2.  额外属性

    可以通过 `ext`  关键字为 Project 设置额外的属性或者使用 `ext` 块一次添加多个属性：

    ```groovy
    // build.gradle
    
    plugins {
        id 'java-library'
    }
    
    ext {
        springVersion = "3.1.0.RELEASE"
        emailNotification = "build@master.org"
    }
    ```

注意： ==这里的变量并不仅仅可以为普通对象，也可以是一个闭包==。因为闭包在 Groovy 中也是一个对象。



#### 7.4 配置对象

1. 配置任意对象

    可以通过以下非常易读的方式配置任意对象

    ```groovy
    import java.text.FieldPosition
    
    tasks.register('configure') {
        doLast {
            def pos = configure(new FieldPosition(10)) {
                beginIndex = 1
                endIndex = 5
            }
            println pos.beginIndex
            println pos.endIndex
        }
    }
    ```

    输出如下：

    ```groovy
    > gradle -q configure
    1
    5
    ```

    

2. 使用外部脚本配置任意对象

    build.gradle：

    ```groovy
    tasks.register('configure') {
        doLast {
            def pos = new java.text.FieldPosition(10)
            // Apply the script
            apply from: 'other.gradle', to: pos
            println pos.beginIndex
            println pos.endIndex
        }
    }
    ```

    other.gradle：

    ```groovy
    // Set properties.
    beginIndex = 1
    endIndex = 5
    ```

    输出如下：

    ```shell
    > gradle -q 配置
    1 
    5
    ```

    

#### 7.5 默认导入

为了使构建脚本更加简洁，Gradle 会自动向 Gradle 脚本添加一组导入语句。这意味着 `throw new org.gradle.api.tasks.StopExecutionException()` 可以使用`throw new StopExecutionException() ` 代替，具体默认导入包见：[Gradle 默认导入](https://docs.gradle.org/current/userguide/writing_build_scripts.html#script-default-imports)



------



### 8. 处理文件

几乎每个 Gradle 构建都以某种方式与文件交互：考虑源文件、文件依赖项、报告等。这就是 Gradle 附带一个全面的 API 的原因，它可以轻松执行所需的文件操作。



API 主要有两个部分：

- 指定要处理的文件和目录
- 指定如何处理它们



#### 8.1 复制单个文件

可以通过创建 Gradle 的内置 [复制](https://docs.gradle.org/current/dsl/org.gradle.api.tasks.Copy.html) 任务的实例并使用文件的位置和要放置它的位置对其进行配置来复制文件，如下：

```groovy
tasks.register('copyReport', Copy) {
    from layout.buildDirectory.file("reports/my-report.pdf")
    into layout.buildDirectory.dir("toArchive")
}
```

甚至可以在没有 `file()` 方法的情况下直接使用路径（*使用隐式字符串路径*）：

```groovy
tasks.register('copyReport2', Copy) {
    from "$buildDir/reports/my-report.pdf"
    into "$buildDir/toArchive"
}
```

尽管硬编码路径可以用作简单的示例，但它们也会使构建变得脆弱。最好使用可靠的单一事实来源，例如任务或共享项目属性。在以下修改后的示例中，我们使用在其他地方定义的报告任务，该任务将报告的位置存储在其 `outputFile` 属性中：

```groovy
tasks.register('copyReport3', Copy) {
    from myReportTask.outputFile
    into archiveReportsTask.dirToArchive
}
```



#### 8.2 复制多个文件

通过向 `from()` 方法提供多个参数，可以轻松地实现复制多个文件，如：

```groovy
tasks.register('copyReportsForArchiving', Copy) {
    from layout.buildDirectory.file("reports/my-report.pdf"), layout.projectDirectory.file("src/docs/manual.pdf")
    into layout.buildDirectory.dir("toArchive")
}
```

现在考虑另一个示例：如果想复制目录中的所有 PDF 而不必指定每个 PDF 怎么办？为此，请将包含或排除模式附加到复制规范。这里使用字符串模式来仅包含 PDF：

```groovy
tasks.register('copyPdfReportsForArchiving', Copy) {
    from layout.buildDirectory.dir("reports")
    include "*.pdf"   // 排除使用  exclude
    into layout.buildDirectory.dir("toArchive")
}
```

需要注意的是：==这种方式并不会复制子目录中的 PDF，若想复制子目录中的文件，需要使用 Ant 样式的 glob 模式 ( `**/*`)==。如：

```groovy
tasks.register('copyAllPdfReportsForArchiving', Copy) {
    from layout.buildDirectory.dir("reports")
    include "**/*.pdf"
    into layout.buildDirectory.dir("toArchive")
}
```

但要注意此方式的副作用：它会复制子目录以及子目录中的文件，如果只想复制没有目录结构的文件，则需要使用显式表达式。在[文件树](https://docs.gradle.org/current/userguide/working_with_files.html#sec:file_trees)的部分会更多地讨论文件树和文件集合之间的区别。



#### 8.3 复制目录层次结构

有时不仅需要复制文件，还需要复制它们所在的目录结构。这是指定目录作为 `from()` 参数时的默认行为，如以下示例所示，该示例将 `reports` 目录中的所有内容（包括其所有子目录）复制到目标：

```groovy
tasks.register('copyReportsDirForArchiving', Copy) {
    from layout.buildDirectory.dir("reports")
    into layout.buildDirectory.dir("toArchive")
}
```

此种方式仅仅会将 reports 下的文件和目录复制到 toArchive 目录下，而 reports  目录本身不会被复制。那么如何确保 `reports` 自己也被复制呢？这就需要添加为包含模式：

```groovy
tasks.register('copyReportsDirForArchiving2', Copy) {
    from(layout.buildDirectory) {
        include "reports/**"  // 这里的 include 仅使用于这个 from 方法
    }
    into layout.buildDirectory.dir("toArchive")
}
```



#### 8.4 创建档案（zip、tar 等）

从 Gradle 的角度来看，将文件打包到存档中实际上是一个副本，其中目标是存档文件而不是文件系统上的目录。这意味着创建档案看起来很像复制，具有所有相同的功能！

最简单的情况涉及归档目录的全部内容，本示例通过创建 `toArchive` 目录的 ZIP 来演示：

```groovy
tasks.register('packageDistribution', Zip) {
    archiveFileName = "my-distribution.zip"  // 指定压缩包名称
    
    from layout.buildDirectory.dir("toArchive")
    destinationDirectory = layout.buildDirectory.dir('dist')
}
```

注意这里==指定压缩包的存放目的地并不是使用 `into()`==。

每种类型的存档都有自己的任务类型，最常见的是 [Zip](https://docs.gradle.org/current/dsl/org.gradle.api.tasks.bundling.Zip.html)、[Tar](https://docs.gradle.org/current/dsl/org.gradle.api.tasks.bundling.Tar.html) 和 [Jar](https://docs.gradle.org/current/dsl/org.gradle.api.tasks.bundling.Jar.html)。它们都共享大部分配置选项`Copy`，包括过滤和重命名。



最常见的场景之一是将文件复制到存档的指定子目录中。例如，假设要将所有 PDF 打包到 `docs` 存档根目录中的一个目录中，但 `docs` 目录并不存在，因此必须将其创建为存档的一部分。可以通过 `into()` 为  PDF 添加一个声明来做到这一点：

```groovy
plugins {
    id 'base'
}

version = "1.0.0"

tasks.register('packageDistribution', Zip) {
    from(layout.buildDirectory.dir("toArchive")) {
        exclude "**/*.pdf"
    }

    from(layout.buildDirectory.dir("toArchive")) {
        include "**/*.pdf"
        into "docs"
    }
}
```



#### 8.5 解压档案

存档实际上是自包含的文件系统，因此解压它们就是将文件从该文件系统复制到本地文件系统，甚至复制到另一个存档中。Gradle 通过提供一些包装函数来实现这一点，这些函数使档案可用作文件的分层集合（[文件树](https://docs.gradle.org/current/userguide/working_with_files.html#sec:file_trees)）。

可以使用 [Project.zipTree(java.lang.Object)](https://docs.gradle.org/current/dsl/org.gradle.api.Project.html#org.gradle.api.Project:zipTree(java.lang.Object)) 和 [Project.tarTree(java.lang.Object)](https://docs.gradle.org/current/dsl/org.gradle.api.Project.html#org.gradle.api.Project:tarTree(java.lang.Object)) 这两个函数从相应的存档文件生成 [FileTree](https://docs.gradle.org/current/javadoc/org/gradle/api/file/FileTree.html)。然后可以在 `from()` 规范中使用该文件树，如下所示：

```groovy
tasks.register('unpackFiles', Copy) {
    from zipTree("src/resources/thirdPartyResources.zip") //解压生成文件树 
    into layout.buildDirectory.dir("resources")
}
```

同样，也可以通过 [过滤器](https://docs.gradle.org/current/userguide/working_with_files.html#sec:filtering_files) 控制解包哪些文件，甚至可以在解包时 [重命名文件](https://docs.gradle.org/current/userguide/working_with_files.html#sec:renaming_files)，同时借助 [eachFile()](https://docs.gradle.org/current/dsl/org.gradle.api.tasks.AbstractCopyTask.html#eachFile(org.gradle.api.Action)) 方法可以进行更高级的处理。例如，将存档的不同子树提取到目标目录中的不同路径中。



以下示例使用该方法将存档 `libs` 目录中的文件提取到根目标目录中，而不是提取到 `libs` 子目录中：

```groovy
tasks.register('unpackLibsDirectory', Copy) {
    from(zipTree("src/resources/thirdPartyResources.zip")) {
        include "libs/**"   // 仅提取驻留在libs目录中的文件子集
        eachFile { fcd ->
            fcd.relativePath = new RelativePath(true, fcd.relativePath.segments.drop(1))   // 通过 libs 从文件路径中删除段，将提取文件的路径重新映射到目标目录
        }
        includeEmptyDirs = false     // 忽略因重新映射而产生的空目录
    }
    into layout.buildDirectory.dir("resources")
}
```

注意：如果您是一名 Java 开发人员并且想知道为什么没有 `jarTree()` 方法，那是因为 `zipTree()` 非常适用于 JAR、WAR 和 EAR。



#### 8.6 创建 Uber 或 Fat JAR

在 Java 中，应用程序及其依赖项通常被打包为单独 的 JAR。但现在有另一种常见的需求：将依赖项的类和资源直接放入应用程序 JAR 中，创建所谓的 uber 或 fat JAR。

Gradle 使这种需求易于实现，如下就是将其他 JAR 文件的内容复制到应用程序 JAR 中：

```groovy
plugins {
    id 'java'
}

version = '1.0.0'

repositories {
    mavenCentral()
}

dependencies {
    implementation 'commons-io:commons-io:2.6'
}

tasks.register('uberJar', Jar) {
    archiveClassifier = 'uber'

    from sourceSets.main.output

    dependsOn configurations.runtimeClasspath  // 获取项目的运行时依赖项,依赖此任务，此任务会先执行 
    from {
        configurations.runtimeClasspath.findAll { it.name.endsWith('jar') }.collect { zipTree(it) }
    }
}
```



#### 8.7  创建目录

许多任务需要创建目录来存储它们生成的文件，这就是 Gradle 在明确定义文件和目录输出时自动管理任务的这方面的原因。所有核心 Gradle 任务都确保在必要时使用增量构建创建它们需要的任何输出目录。

如果需要手动创建目录，可以在构建脚本或自定义任务实现中使用 [Project.mkdir(java.lang.Object)](https://docs.gradle.org/current/dsl/org.gradle.api.Project.html#org.gradle.api.Project:mkdir(java.lang.Object)) 方法，如下：

```groovy
tasks.register('ensureDirectory') {
    doLast {
        mkdir "images" // 如果该目录已存在，则不执行任何操作
    }
}
```



#### 8.8 移动文件和目录

Gradle 没有用于移动文件和目录的 API，但可以使用 [Apache Ant 集成](https://docs.gradle.org/current/userguide/ant.html#ant) 轻松完成此操作，如下例所示：

```groovy
tasks.register('moveReports') {
    doLast {
        ant.move file: "${buildDir}/reports",
                 todir: "${buildDir}/toArchive"
    }
}
```

这不是一个常见的要求，应该谨慎使用，因为会丢失信息并且很容易破坏构建，通常最好复制目录和文件。



#### 8.9 复制时重命名文件

Gradle 允许使用 `rename()` 配置将其作为复制规范的一部分来执行，以下示例从具有它的任何文件的名称中删除 “-staging-” 标记：

```groovy
tasks.register('copyFromStaging', Copy) {
    from "src/main/webapp"
    into layout.buildDirectory.dir('explodedWar')

    rename '(.+)-staging(.+)', '$1$2'  // 使用正则去除文件名中的 -staging
}
```

可以为此使用正则表达式，如上例所示，或者使用更复杂的逻辑来确定目标文件名。例如，以下任务会截断文件名：

```groovy
tasks.register('copyWithTruncate', Copy) {
    from layout.buildDirectory.dir("reports")
    rename { String filename ->
        if (filename.size() > 10) {
            return filename[0..7] + "~" + filename.size()
        }
        else return filename
    }
    into layout.buildDirectory.dir("toArchive")
}
```



#### 8.10 删除文件和目录

可以使用 [Delete](https://docs.gradle.org/current/dsl/org.gradle.api.tasks.Delete.html) 任务或 [Project.delete(org.gradle.api.Action)](https://docs.gradle.org/current/dsl/org.gradle.api.Project.html#org.gradle.api.Project:delete(org.gradle.api.Action)) 方法轻松删除文件和目录。



例如，以下任务删除构建输出目录的全部内容：

```groovy
tasks.register('myClean', Delete) {
    delete buildDir
}
```

==如果想更好地控制删除哪些文件，则不能像复制文件一样使用包含和排除==。相反，必须使用内置的过滤机制 `FileCollection` 和 `FileTree`。下面的示例是从源目录中清除临时文件：

```groovy
tasks.register('cleanTempFiles', Delete) {
    delete fileTree("src").matching {
        include "**/*.tmp"
    }
}
```



#### 8.11 深入的文件路径

为了对文件执行某些操作，需要知道它在哪里，这就是文件路径提供的信息。Gradle 建立在标准 Java `File` 类的基础上，该类表示单个文件的位置，并提供新的 API 来处理路径集合。



##### 8.11.1 硬编码的文件路径

直接使用字符串代表文件路径这就是硬编码，虽易于理解，但对于真正的构建来说这不是一个好的做法。问题是路径经常改变，需要改变的地方越多，就越有可能错过一个并破坏构建。



在可能的情况下，应该使用任务、任务属性和 [项目属性](https://docs.gradle.org/current/userguide/writing_build_scripts.html#sec:extra_properties)（按优先顺序）来配置文件路径。例如，如果要创建一个打包 Java 应用程序的已编译类的任务，目标应该是这样的：

```groovy
def archivesDirPath = layout.buildDirectory.dir('archives')

tasks.register('packageClasses', Zip) {
    archiveAppendix = "classes"
    destinationDirectory = archivesDirPath

    from compileJava
}
```



##### 8.11.2 单个文件和目录

Gradle 提供了 [Project.file(java.lang.Object)](https://docs.gradle.org/current/dsl/org.gradle.api.Project.html#org.gradle.api.Project:file(java.lang.Object)) 方法来指定单个文件或目录的位置。相对路径是相对于项目目录解析的，而绝对路径保持不变。



以下是使用 `file()` 具有不同类型参数的方法的一些示例：

```groovy
// 使用相对路径
File configFile = file('src/config.xml')

// 使用绝对路径
configFile = file(configFile.absolutePath)

// Using a File object with a relative path
configFile = file(new File('src/config.xml'))

// Using a java.nio.file.Path object with a relative path
configFile = file(Paths.get('src', 'config.xml'))

// Using an absolute java.nio.file.Path object
configFile = file(Paths.get(System.getProperty('user.home')).resolve('global-config.xml'))
```

注意： ==永远不要使用 `new File(relative path)` ，因为这会创建一个相对于当前工作目录 (CWD) 的路径。Gradle 不能保证 CWD 的位置，这意味着依赖它的构建可能随时中断==。



在多项目构建中，该 `file()` 方法得到的相对路径始终为相对于当前项目目录的路径，该目录可能是子项目。如果要使用相对于*根项目*目录的路径，则需要使用特殊的 [Project.getRootDir()](https://docs.gradle.org/current/dsl/org.gradle.api.Project.html#org.gradle.api.Project:rootDir) 属性来构造绝对路径，如下所示：

```groovy
File configFile = file("$rootDir/shared/config.xml")   //rootDir 为 Project 的属性，它的 setter/ getter 方法在 Groovy中可以简化 
```



##### 8.11.3 文件集

一个文件集合是由多个文件组成的集合，这些文件可以没有任何相关性。



指定文件集合的推荐方法是使用 [ProjectLayout.files(java.lang.Object...)](https://docs.gradle.org/current/javadoc/org/gradle/api/file/ProjectLayout.html#files-java.lang.Object...-) 方法，该方法返回一个 `FileCollection` 实例。这种方法非常灵活，允许传递多个字符串、`File` 实例、字符串集合、`Files` 集合等等。如果任务已[定义输出](https://docs.gradle.org/current/userguide/more_about_tasks.html#sec:task_inputs_outputs)，甚至可以将任务作为参数传递。



与  `Project.file()` 方法一样， 以下示例演示了可以使用的各种参数类型中的一些  -—— 字符串、实例、列表和 `File Path`：

```groovy
FileCollection collection = layout.files('src/file1.txt',
                                  new File('src/file2.txt'),
                                  ['src/file3.csv', 'src/file4.csv'],
                                  Paths.get('src', 'file5.txt'))
```



文件集合在 Gradle 中有一些重要的属性，它们可以：

- 懒惰创建

- 迭代

- 过滤

- 合并

    

1. 懒惰创建

    当需要在构建运行时评估构成集合的文件时，文件集合的*延迟创建*非常有用。在下面的例子中，我们查询文件系统以找出特定目录中存在哪些文件，然后将它们组合成一个文件集合：

    ```groovy
    tasks.register('list') {
        doLast {
            File srcDir
    
            // Create a file collection using a closure
            collection = layout.files { srcDir.listFiles() }
    
            srcDir = file('src')
            println "Contents of $srcDir.name"
            collection.collect { relativePath(it) }.sort().each { println it }
    
            srcDir = file('src2')
            println "Contents of $srcDir.name"
            collection.collect { relativePath(it) }.sort().each { println it }
        }
    }
    ```

    执行输出如下：

    ```shell
    > gradle -q list 
    src 
    src/dir1 
    src/file1.txt 
    src2 
    src2/dir1 
    Contents of src2/dir2
    ```

    惰性创建的关键是将闭包（在 Groovy 中）或 `Provider`（在 Kotlin 中）传递给 `files()` 方法，同时闭包中的返回值为 `files()` 类型，例如 `List<File>`，`String`，`FileCollection` 等。





------





### 1.4 Gradle 项目依赖管理

> 依赖管理的条件：
>
> - 依赖外部类库的代码实现现有的功能，避免重复造轮子
> - 自动化依赖管理可以明确依赖的版本，能解决传递性依赖带来的版本冲突问题

##### 1.4.1 工件坐标(jar 包标志)

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



##### 1.4.2 仓库(jar 包的存放位置)

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



##### 1.4.3 依赖传递性

比如：A 依赖 B，如果 C 依赖 A，那么 C 依赖 B。
		 就是因为依赖的传递性，所以才会出现版本的冲突问题。以下通过一张图来了解下Gradle 的自动化依赖管理流程。

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/自动化依赖管理流程.png" alt="img" style="zoom: 80%;" />

<center>自动化依赖管理流程</center>

由图可得知，Gradle 工具从远程仓库下载 jar 包到本地仓库，Gradle 工具需要依赖配置文件，如果同一个 jar 经常使用会被存入到依赖缓存中。



##### 1.4.4 依赖阶段配置

在 `dependencies` 代码块内，可以从多种不同的依赖项配置中选择其一来声明库依赖项。每种依赖项配置都向 Gradle 提供了有关如何使用该依赖项的不同说明。下表介绍了可以对 Android 项目中的依赖项使用的各种配置。此表还将这些配置与自 Android Gradle 插件 3.0.0 起弃用的配置进行了比较。

|        新配置         | 已弃用旧配置 |                             行为                             | 注意                                                         |
| :-------------------: | :----------: | :----------------------------------------------------------: | ------------------------------------------------------------ |
|   `implementation`    |  `compile`   | 编译时该依赖对其它组件不可见，运行期间可见（”隔代“编译隔离） | 使用此依赖项配置代替 `api` 或 `compile`（已弃用）可以**显著缩短构建时间**，因为这样可以减少构建系统需要重新编译的模块数 |
|         `api`         |  `compile`   |              编译和运行时该依赖对其它组件都可见              | 拥有大量的 `api` 依赖项会显著增加构建时间。除非要将依赖项的 API 公开给单独的模块，否则库模块应改用 `implementation` 依赖项。 |
|     `compileOnly`     |  `provided`  |   编译时该依赖对其它组件可见，运行时不可见（不打包到apk）    | 不能将 `compileOnly` 配置与 AAR 依赖项配合使用               |
|     `runtimeOnly`     |    `apk`     |             仅运行时对其他组件可见（打包到APK）              | `implementation`：会将依赖添加到编译类路径`runtimeOnly`: 不会将依赖添加到编译类路径 |
| `annotationProcessor` |  `compile`   |                    仅依赖注解处理器时使用                    | Kotlin 项目应[使用 kapt](https://kotlinlang.org/docs/reference/kapt.html) 声明注解处理器依赖项 |
|     `lintChecks`      |              |              依赖代码检查库（`lint.jar`）时使用              |                                                              |
|     `lintPublish`     |              | Android 库依赖代码检查库打包 `AAR` 同时希望对其他组件传递并应用依赖的代码检查时使用 |                                                              |



------



### 1.4.5 Gradle project

在 Android 中每个 module 就对应着一个 project，gradle 在编译时期会为每一个 project 创建一个 Project 对象用来构建项目。这一过程是在初始化阶段，通过解析 settings.gradle 中的配置来创建相应的 Project。

<img src="https://s0.lgstatic.com/i/image/M00/26/55/CgqCHl7xxneADC6uAAAwMY8f2jo857.png" alt="Drawing 15.png" style="zoom:50%;" />

上图 settings.gradle 中导入了 3 个 project，但是实际上还会有一个根 project，使用 ./gradlew project 查看，如下所示：

<img src="https://s0.lgstatic.com/i/image/M00/26/4A/Ciqc1F7xxoCANfOBAAEhWOUbtnQ479.png" alt="Drawing 16.png" style="zoom:50%;" />

我们可以在根 project 中统筹管理所有的子 project，具体在 LagouGradle 路径下的 build.gradle 中进行设置，如下所示：

<img src="https://s0.lgstatic.com/i/image/M00/26/55/CgqCHl7xxoqASIQyAAJT5Xo0vsE094.png" alt="Drawing 17.png" style="zoom:50%;" />

这样写的好处是项目中所有 module 的配置都统一写在一个地方，统筹管理。比如经常会在主项目的 build.gradle 中添加包过滤，解决依赖冲突，如下所示：

<img src="https://s0.lgstatic.com/i/image/M00/26/4A/Ciqc1F7xxpOAT_XTAAKMtjb8INs789.png" alt="Drawing 18.png" style="zoom:50%;" />



------



### 1.4.6 buildSrc 统筹依赖管理

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



------



### 1.7 解决依赖冲突



##### 1.7.1 Maven

Maven 自动处理传递性依赖版本冲突：==按最短路径和优先声明原则来处理==

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/9082898-597dc426e99205ee.png" alt="img"  />

##### 1.7.2 Gradle

Gradle 自动处理传递性依赖版本冲突：==默认使用版本最高的==

大部分 Gradle 的默认策略没有问题， 但是有时有一些特殊的情况还是需要使用手动处理解决（比如：A 同时依赖 B 和 C , B 依赖了高版本的 D, C 依赖了低版本的 D，由于最终自动依赖了高版本的 D，就有可能导致 C 中调用的方法在高版本的 D 中不存在），以下便是 Gradle 的手动处理版本冲突：



###### 1.7.2.1 查找冲突的依赖库

若无法直接确定冲突的库和版本，可修改默认配置策略 ——> 查看冲突的 jar 包

- 首先在 module 下的 build.gradle 中加入如下配置

    ```groovy
    configurations.all{
      //修改默认冲突解决策略
      resolutionStrategy{
          // 修改 gradle不自动处理版本冲突
          failOnVersionConflict()
      }
    }
    ```

- 然后在右边的侧边栏找到 `Gradle`， 执行 help -> dependencies 即可查看冲突的 jar 包

    ```shell
    A conflict was found between the following modules:
    - org.slf4j:slf4j-api:1.6.1
    - org.slf4j:slf4j-api:1.5.8
    ```

    以上配置完，如果存在依赖 jar 包版本冲突问题，Gradle 将不再自动处理，build 会抛异常。



在确定了产生问题的库以及版本后，就可以考虑以下方式解决问题：

###### 1.7.2.2 排除传递性依赖

- 排除单个jar 包的传递性依赖

    ```groovy
    dependencies {
       compile (group: 'org.hibernate', name: 'hibernate-core', version: '3.6.3.Final'){
           // module 是 jar 的 name
           exclude group:"org.slf4j", module:"slf4j-api"
       }
    }
    ```

    此处的 module 指的是 jar 的 name，无需写版本，此配置的意义就是排除 hibernate-core 引入时 slf4f-api 的传递性依赖。也就是说我们的项目目前没有依赖任何版本的 slf4f-api。

- 排除所有 jar 的传递性依赖

    ```groovy
    dependencies {
        compile (group: 'org.hibernate', name: 'hibernate-core', version: '3.6.3.Final'){
            //transitive 默认为true，表示 Gradle 自动添加子依赖项，设置为false 则需要手动添加每个子依赖项
            transitive=false
        }
    }
    ```

    在真实开发中，需要自动添加子依赖的比较多，而手动添加的比较少，毕竟使用工具的主要目的是减少工作量，所以开发中此配置建议不使用。



###### 1.7.2.3 强制指定一个版本

给有冲突的 jar 包强制指定一个版本，在 build.gradle 中配置如下：

```groovy
configurations.all{
    resolutionStrategy{
        force 'org.slf4j:slf4j-api:1.7.24'
    }
}
```

再执行 `Gradle` 的help -> dependencies 可看到所有的 slf4j 都改为了1.7.24 的版本



###### 1.7.2.4 使用依赖替换策略

依赖替换规则的适用场景分为以下几种：

- 1.根据某些条件对依赖进行替换；

- 2.将本地依赖替换为外部依赖；

- 3.将外部依赖替换为本地依赖；

    

先解释一下 **外部依赖** 和 **本地依赖** 是什么？

-  外部依赖

    **外部依赖**，顾名思义，就是从远程仓库拉取的依赖，也常被称为 **三方库**：

    ```groovy
    // 从远程仓库拉取的开源代码库
    implementation 'io.reactivex.rxjava3:rxjava:3.0.0-RC0'
    ```

- 本地依赖

    **本地依赖**，也就是我们项目中常见的`module`：

    ```groovy
    implementation project(':library')
    ```

    

现在就可以考虑如何应用依赖替换策略：

1. 根据某些条件对依赖进行替换

    ```groovy
    configurations.all {
        //定义有关依赖性解决方案的策略
        resolutionStrategy {
            //制定每一个依赖的替换规则
            eachDependency { DependencyResolveDetails details ->
                    if (details.requested.group == 'com.squareup.okhttp3' && details.requested.name == 'okhttp') {
                        details.useVersion('4.2.2')
                    }
            }
        }
    }
    ```

    如上所示：项目中所有 `okhttp` 相关的依赖，在构建过程中版本都统一使用了`4.2.2`，这样就 **避免了依赖冲突**，开发者再也不需要针对每一个有 `okhttp` 依赖的三方库进行额外的`exclude`

2. 本地依赖替换为外部依赖

    此种情况最经典的场景就是`SDK`的发布测试，日常开发过程中，`sample`代码依赖本地的`module`；新版本发布后，示例代码便需要依赖远程仓库的最新代码：

    ```groovy
    final boolean useRemote = true
    configurations.all {
        /**
         * @see ResolutionStrategy*
         * */
        resolutionStrategy {
            dependencySubstitution {
                Properties properties = new Properties()
                properties.load(project.rootProject.project('uikit').file('gradle.properties').newReader())
                def uiKitVersionName = properties.getProperty('VERSION_NAME')
                if (useRemote) {
                    substitute project(':uikit') with module("net.shxgroup.android.uikit:uikit:$uiKitVersionName")
                }
            }
        }
    }
    ```

    这样就可以当 `useRemote` 值为 `true` 时，`sample` 依赖远程仓库，当值为 `false` 时，`sample` 依赖本地 `module`。

3.  外部依赖替换为本地依赖

    该规则和2非常相似，只不过将依赖替换的双方调换了而已，下面是官方的示例代码：

    ```groovy
    configurations.all {
        resolutionStrategy.dependencySubstitution {
            substitute module("org.utils:api") because "以开发测试环境工作" with project(":api")
        }
    }
    ```

    

