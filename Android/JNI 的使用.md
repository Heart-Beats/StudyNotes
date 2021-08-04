## JNI 的使用



[toc]



### 1. JNI 与 NDK 的介绍以及区别

1.  JNI

    JNI，全名 Java Native Interface，是 Java 本地接口，JNI 是 Java 调用 Native 语言的一种特性，==通过 JNI 可以使得 Java 与 C/C++ 进行交互==。简单点说就是 JNI 是 Java 中调用 C/C++ 的统称。

    

2.  NDK

    NDK 全名 Native Develop Kit，官方说法：==Android NDK 是一套允许使用 C 和 C++ 等语言，以原生代码实现部分应用的工具集==。借助它可以快速开发 C/C++ 动态库，并自动把 so 和应用打包成 APK。

    

3.  区别

    JNI 和 NDK 都是调用 C/C++ 代码库，但 ==JNI 可以在 Java 和 Android 中同时使用，NDK 只能在 Android 里面使用==。



### 2.  Android 中 JNI 的实现

在 Android 中编译 c/c++ 代码 主要有两种方式：

1.  ndk-build + [Android.mk](http://android.mk/) + [Application.mk](http://application.mk/) 
2.  CMake + CMakeLists.txt



由于 CMake 是现在 Android 默认创建 Native 应用的方式，所以就不介绍 ndk-build 的方式，感兴趣的可见[使用`ndk-build`实现NDK](https://juejin.cn/post/6844903632173793287#heading-14)，接下来重点介绍使用 CMake 的方式。



#### 2.1 CMake 环境配置

