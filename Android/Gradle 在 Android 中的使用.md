# Gradle 在 Android 中的应用

[TOC]



> Gradle 是目前流行的一种构建工具，它可以帮我们管理项目中的差异、依赖、编译、打包、部署......，同时还可以定义满足自己需要的构建逻辑,写入到 build.gradle 中供日后复用。



### 1. Gradle 构建



#### 1.1 创建 Gradle 构建

Gradle 既然是构建工具，那么肯定是针对具体的项目的，接下来我们就看看使用它可以构建怎样的项目结构？



##### 1.1.1 构建单软件多模块项目

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





##### 1.1.2 微调项目结构

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



##### 1.1.3 构建多软件多模块项目（复合构建）

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

        同时必须在 android  模块的 build.gradle 中给其设置 group ，这样 server-application 才能通过坐标引用它，如

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



#### 1.2  Gradle 配置构建环境

> Gradle 可在以下的位置中按照优先级的顺序找到第一个选项应用：
>
> - 命令行，使用`-P`/ `--project-prop` [environment options 设置](https://docs.gradle.org/current/userguide/command_line_interface.html#sec:environment_options)。
> - `gradle.properties` 在` GRADLE_USER_HOME`目录中
> - `gradle.properties` 在项目根目录中
> - `gradle.properties` 在 Gradle 安装目录中



##### 1.2.1  Gradle 属性

以下属性可用于配置 Gradle 构建环境：

- **org.gradle.caching=(true,false)**： 启用构建缓存
- **org.gradle.caching.debug=(true,false)**： debug 模式启用构建缓存
- **org.gradle.configureondemand=(true,false)**：启用孵化配置，仅配置必要的项目
- **org.gradle.console=(auto,plain,rich,verbose)**：自定义控制台输出颜色或详细程度，默认值取决于 Gradle 的调用方式
- **org.gradle.daemon=(true,false)**：启用守护进程，默认开启
- **org.gradle.daemon.idletimeout=(# of idle millis)**： 守护进程在指定的空闲毫秒数后自行终止，默认三小时
- **org.gradle.debug=(true,false)**：Gradle 将在启用远程调试的情况下运行构建，侦听端口 5005。会等待调试器连接
- **org.gradle.java.home=(path to JDK home)**：为 Gradle 构建过程指定 Java 主目录。该值可以设置为 `jdk` 或 `jre` 路径，使用 jdk 更安全，未设置使用 `JAVA_HOME`
- **org.gradle.jvmargs=(JVM arguments)**：指定用于 Gradle 守护进程的 JVM 参数
- **org.gradle.logging.level=(quiet,warn,lifecycle,info,debug)**：设置 Gradle 的日志级别，不区分大小写，默认 lifecycle
- **org.gradle.parallel=(true,false)**：任务并行执行
- **org.gradle.priority=(low,normal)**：指定 Gradle 守护进程及其启动的所有进程的调度优先级。默认为`normal`
- **org.gradle.vfs.verbose=(true,false)**：在[查看文件系统](https://docs.gradle.org/current/userguide/gradle_daemon.html#sec:daemon_watch_fs)时配置详细日志记录。 默认为关闭
- **org.gradle.vfs.watch=(true,false)**：切换[监视文件系统](https://docs.gradle.org/current/userguide/gradle_daemon.html#sec:daemon_watch_fs)
- **org.gradle.warning.mode=(all,fail,summary,none)**：当设置为`all`,`summary`或 时`none`，Gradle 将使用不同的警告类型显示
- **org.gradle.workers.max=(max # of worker processes)**：使用最多给定数量的工作人员，默认为 cpu 处理器数



##### 1.2.2 系统属性

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



##### 1.2.3 环境变量

以下环境变量可用于 `gradle` 命令。请注意，命令行选项和系统属性优先于环境变量。

- **GRADLE_OPTS**：指定启动 Gradle 客户端 VM 时要使用的 JVM 参数
- **GRADLE_USER_HOME**：指定 Gradle 用户主目录，未设置则默认为 `$USER_HOME/.gradle`
- **JAVA_HOME**：指定用于客户端 VM 的 JDK 安装目录，此 VM 也用于守护程序，除非在 Gradle 属性文件中指定了不同的 `org.gradle.java.home`



##### 1.2.4 项目属性

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



##### 1.2.5 配置 JVM 内存

可以通过以下方式调整 Gradle 的 JVM 选项：

1. 通过 `gradle.properties` 

    ```groovy
    org.gradle.jvmargs=-Xmx2g -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
    ```

2. 通过环境变量

    ```groovy
    JAVA_OPTS="-Xmx64m -XX:MaxPermSize=64m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8"
    ```



##### 1.2.6 通过 HTTP 代理访问网络

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





#### 1.3  Gradle 守护进程

Daemon（守护进程）是一个长期存在的进程，不仅能够避免每次构建的 JVM 启动成本，而且能够在内存中缓存有关项目结构、文件、任务等的信息，并且在可用系统内存不足时会在空闲时自行停止。从 Gradle 3.0 开始，Gradle 守护进程默认启用。



##### 1.3.1 获取守护进程状态

要获取正在运行的 Gradle 守护程序及其状态的列表，请使用该`--status`命令，输出示例如下：

```bash
    PID VERSION                 STATUS
  28411 3.0                     IDLE
  34247 3.0                     BUSY
```



##### 1.3.2 禁用守护进程

1. 通过 `GRADLE_USER_HOME/gradle.properties` 文件

    ```groovy
    org.gradle.daemon=false
    ```

2. 通过环境变量

    ```groovy
    GRADLE_OPTS="-Dorg.gradle.daemon=false"
    ```

两种方式具有相同的效果，但第一种方式对大部分人来说更方便。



##### 1.3.3 停止现有的守护进程

一般情况下无需自主停止守护进程，如果需要明确停止运行守护进程，只需执行下面的命令：

```shell
 gradle --stop
```

这将终止所有使用用于执行命令的相同版本的 Gradle 启动的守护进程。



#### 1.4  初始化脚本

初始化脚本（又名*init scripts*）类似于 Gradle 中的其他脚本。但是，这些脚本在整个项目构建开始之前运行。



##### 1.4.1 使用初始化脚本

有以下几种使用初始化脚本的方法：

1. 通过命令行

    ```shell
    gradle [-I | --init-script] 脚本路径
    ```

2. 在 `USER_HOME/.gradle/` 目录中创建 `init.gradle` 文件

3. 在 `USER_HOME/.gradle/init.d` 中创建以 `.gradle`（或`.init.gradle.kts`对于 Kotlin）结尾的文件 

    

Gradle  会依次按照上面顺序全部执行一遍来查找初始化脚本，同时 `USER_HOME/.gradle/init.d`  目录下的脚本会按照字母顺序执行。这就意味着==可以有多个初始化脚本在构建前被执行==。



##### 1.4.2  编写初始化脚本

类似于 Gradle 构建脚本，init 脚本是 Groovy 或 Kotlin 脚本。每个 init 脚本都有一个与之关联的 [Gradle](https://docs.gradle.org/current/dsl/org.gradle.api.invocation.Gradle.html) 实例。init 脚本中的任何属性引用和方法调用都将委托给该`Gradle`实例。每个 init 脚本还实现了 [Script](https://docs.gradle.org/current/dsl/org.gradle.api.Script.html) 接口，那么我们可以用它来做什么呢？



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

    ```groovy
    //init.gradle
    
    apply plugin: EnterpriseRepositoryPlugin
    
    class EnterpriseRepositoryPlugin implements Plugin<Gradle> {
    
        private static String ENTERPRISE_REPOSITORY_URL = "https://repo.gradle.org/gradle/repo"
    
        void apply(Gradle gradle) {
            // ONLY USE ENTERPRISE REPO FOR DEPENDENCIES
            gradle.allprojects { project ->
                project.repositories {
    
                    // Remove all repositories not pointing to the enterprise repository url
                    all { ArtifactRepository repo ->
                        if (!(repo instanceof MavenArtifactRepository) ||
                              repo.url.toString() != ENTERPRISE_REPOSITORY_URL) {
                            project.logger.lifecycle "Repository ${repo.url} removed. Only $ENTERPRISE_REPOSITORY_URL is allowed"
                            remove repo
                        }
                    }
    
                    // add the enterprise repository
                    maven {
                        name "STANDARD_ENTERPRISE_REPO"
                        url ENTERPRISE_REPOSITORY_URL
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



#### 1. 2 Gradle Build 生命周期

Gradle 进行构建时，会经历3个生命周期：

1.  初始化阶段

2.  配置阶段

3.  执行阶段

    

    <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/23948686-7b9eb1ab625b9786.image" alt="img" style="zoom: 80%;" />

##### 1.2.1 初始化阶段

初始化阶段确定有多少工程需要构建，创建整个项目层次，并为每个 module 创建一个 Project 对象。项目初始化阶段会执行 setting.gradle 文件，setting.gradle 中所配置的 module 路径会决定 Gradle 创建哪些 project。



##### 1.2.2 配置阶段

配置阶段会执行 Project 对象和 Task 对象的代码，可以称这个阶段为配置阶段，配置阶段主要执行读取配置参数，创建 Task 对象，根据 Task 之间的依赖关系，构建出有向无环图，进而规定 Task 的执行顺序。**对于 task 对象而言，需要明确区分配置和执行这两个阶段**。整个配置阶段的运行顺序参照顶层 build.gradle 所代表的 Project 对象 -> setting.gradle 所声明的 Project 对象的顺序执行。



##### 1.2.3 执行阶段

执行阶段会按照配置中规定的顺序执行所有的 Task ，调用 Task 的 doFirst、doLast 方法传入的闭包会存入 Task 的 actions 列表（Task 中的 doFirst、doLast 方法均可调用多次）。

Gradle 生命周期提供了丰富的回调接口帮助使用者方便的 Hook 整个 Build 流程，可用的函数在上图中均有展示。同时如果使用的 IDE 是 Android Studio 或者 IntelliJ ，可在 Build 窗口中看到配置阶段和执行阶段，在 Build Output 中配置阶段输出以  `> Configure project :`  开头，执行阶段以 `> Task :` 开头。



------



#### 1.3 Gradle Task 

> Gradle 的构建实际上是基于任务（工作单元）的一个有向无环图 (DAG)，创建任务图后，Gradle 会确定哪些任务需要以何种顺序运行，然后继续执行它们。
>
> <img src="https://docs.gradle.org/current/userguide/img/task-dag-examples.png" alt="示例任务图" style="zoom: 25%;" />
>
> Task（任务）可以理解为 gradle 的执行单元，gradle 通过执行一个个 Task 来完成整个项目构建工作。
>
> 它由多个action组成，action 就是一个代码块，里面是需要执行的代码，比如编译，打包，生成 javadoc，发布等



##### 1.3.1 自定义 Task

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



##### 1.3.2 Task 之间可以存在依赖关系

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



##### 1.3.3 Gradle 自定义方法

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



##### 1.3.4 系统预置 task

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



#### 1.4 Gradle 项目依赖管理

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



#### 1.4.5 Gradle project

在 Android 中每个 module 就对应着一个 project，gradle 在编译时期会为每一个 project 创建一个 Project 对象用来构建项目。这一过程是在初始化阶段，通过解析 settings.gradle 中的配置来创建相应的 Project。

<img src="https://s0.lgstatic.com/i/image/M00/26/55/CgqCHl7xxneADC6uAAAwMY8f2jo857.png" alt="Drawing 15.png" style="zoom:50%;" />

上图 settings.gradle 中导入了 3 个 project，但是实际上还会有一个根 project，使用 ./gradlew project 查看，如下所示：

<img src="https://s0.lgstatic.com/i/image/M00/26/4A/Ciqc1F7xxoCANfOBAAEhWOUbtnQ479.png" alt="Drawing 16.png" style="zoom:50%;" />

我们可以在根 project 中统筹管理所有的子 project，具体在 LagouGradle 路径下的 build.gradle 中进行设置，如下所示：

<img src="https://s0.lgstatic.com/i/image/M00/26/55/CgqCHl7xxoqASIQyAAJT5Xo0vsE094.png" alt="Drawing 17.png" style="zoom:50%;" />

这样写的好处是项目中所有 module 的配置都统一写在一个地方，统筹管理。比如经常会在主项目的 build.gradle 中添加包过滤，解决依赖冲突，如下所示：

<img src="https://s0.lgstatic.com/i/image/M00/26/4A/Ciqc1F7xxpOAT_XTAAKMtjb8INs789.png" alt="Drawing 18.png" style="zoom:50%;" />



------



#### 1.4.6 buildSrc 统筹依赖管理

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



#### 1.7 解决依赖冲突



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

    

