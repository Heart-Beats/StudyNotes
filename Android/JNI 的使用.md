## JNI 的使用



[toc]



### 1. JNI 与 NDK 的介绍以及区别

1.  JNI

    JNI，全名 Java Native Interface，是 Java 本地接口，JNI 是 Java 调用 Native 语言的一种特性，==通过 JNI 可以使得 Java 与 C/C++ 进行交互==。简单点说就是 JNI 是 Java 中调用 C/C++ 的统称。

    

2.  NDK

    NDK 全名 Native Develop Kit，官方说法：==Android NDK 是一套允许使用 C 和 C++ 等语言，以原生代码实现部分应用的工具集==。借助它可以快速开发 C/C++ 动态库，并自动把 so 和应用打包成 APK。

    

3.  区别

    JNI 和 NDK 都是调用 C/C++ 代码库，但 ==JNI 可以在 Java 和 Android 中同时使用，NDK 只能在 Android 里面使用==。



------



### 2.  Android 中 JNI 的实现

在 Android 中编译 c/c++ 代码 主要有两种方式：

1.  ndk-build + [Android.mk](http://android.mk/) + [Application.mk](http://application.mk/) 
2.  CMake + CMakeLists.txt



由于 CMake 是现在 Android 默认创建 Native 应用的方式，所以就不介绍 ndk-build 的方式，感兴趣的可见[使用`ndk-build`实现NDK](https://juejin.cn/post/6844903632173793287#heading-14)，接下来重点介绍使用 CMake 的方式。



#### 2.1 CMake 环境配置

首先，需要下载 NDK 和 CMake 工具，如下图所示：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210804211501307.png" alt="image-20210804211501307" style="zoom: 67%;" /> 

若无特殊要求，下载其中最新的版本即可，随后设置 NDK 的地址为下载好的 NDK 路径，如下：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210804212907497.png" alt="image-20210804212907497" style="zoom: 80%;" /> 



#### 2.2  CMake 实现 JNI

在 Android  中通过 CMake 实现 JNI 主要有以下几个步骤：

1. 配置项目对 C/C++ 的编译支持
2. 声明  Java Native 方法
3. C/C++ 实现 Java Native 方法
4. 编译 C/C++ 源码生成动态库 `.so`
5. 加载 so 库调用 Native 方法



##### 2.2.1 配置项目对 C/C++ 的编译支持

主要是通过在 Gradle 构建脚本中指定 NDK 的配置，可以使用 cmake 和 ndk-build 两种编译方式。借助 AndroidStudio，可以有两种方式方便地配置 CMake 编译：

1. Add C++ To Module

    <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/Add%20C%2B%2B%20to%20Module.gif" alt="Add C++ to Module" style="zoom: 67%;" />

    在需要添加 C++ 支持的 Module (图中为 `:app`) 上右键如图所示操作，点击 OK 后，Module 下会生成一个 cpp 目录，其中生成文件如下：

    <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210804225958094.png" alt="image-20210804225958094" style="zoom:67%;" />

    - CMakeLists.txt

        CMake 编译文件，后续会解释其中内容

    - xxx.cpp：

        C ++ 源文件，其中可以实现 JNI 方法

    

    同时 `build.gradle` 构建脚本文件会添加 CMake 的支持，如下：

    ```groovy
    
    ```



2. 

