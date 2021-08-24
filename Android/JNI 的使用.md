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



###### 2.2.1.1 Add C++ To Module

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/Add%20C%2B%2B%20to%20Module.gif" alt="Add C++ to Module" style="zoom: 67%;" />

在需要添加 C++ 支持的 Module (图中为 `:app`) 上右键如图所示操作，点击 OK 后，Module 下会生成一个 cpp 目录，其中生成文件如下：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210804225958094.png" alt="image-20210804225958094" style="zoom:67%;" />

- CMakeLists.txt

    CMake 编译文件，后续会解释其中内容

- xxx.cpp：

    C ++ 源文件，其中可以实现 JNI 方法



同时 `build.gradle` 构建脚本文件会添加 CMake 的支持，如下：

```groovy
// ...
android {
    
    defaultConfig {

        // ...
        externalNativeBuild {
            // 配置 CMake 的命令参数
            cmake {
                cppFlags ""
            }
        }
    }
    
    externalNativeBuild {
		// 配置 CMake 的版本以及 CMakeList.txt 的路径
        cmake {
            path "src/main/cpp/CMakeLists.txt"
            version "3.10.2"
        }
    }
    // ...
}

// ...
```

由于此方式声明  Java Native 方法，并不能自动提示为我们生成相应的 C++ 实现方法，因此更推荐第二种方式（Android Native Library）。



###### 2.2.1.1 Android Native Library

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210806180332802.png" alt="image-20210806180332802" style="zoom:80%;" />

如上图所示，创建一个类型为 Android Native Library 的 Module，创建完成以后该 Module 的目录如下：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210806180612762.png" alt="image-20210806180612762"  />

这时该 Module 就成为了一个原生库，与正常的 Android 库一样，可以直接使用 java 目录下类中的公开方法，其中的 Java Native 方法都可以在 cpp 目录下的源码找到对应的实现。



##### 2.2.2 声明  Java Native 方法

使用此方式创建 Java Native 方法非常简单，新建 `TestJNI.kt` :

```kotlin
class TestJNI {

	external fun test():String
}
```

如上， 在 Kotlin 中使用  ==`external`==  关键字声明 Native 方法， 在 Java 中使用 `native` 关键字声明，是不是非常简单呢，同时使用  Android Native Library  此方式，若 Java Native 方法未在 C/C++ 层实现，会有报错提示：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210819200536961.png" alt="image-20210819200536961" style="zoom:80%;" />



##### 2.2.3 C/C++ 实现 Java Native 方法

1. 静态注册

    点击上图中的 Create JNI function for test , 即会自动在对应的 C/C++ 层创建实现方法，如图：
    <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210819201008708.png" alt="image-20210819201008708" style="zoom:80%;" />

    

    多文件时会请求选择实现方法所在的文件，这里选择第二个，执行完毕如下图：

    <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210819202517425.png" alt="image-20210819202517425" style="zoom:80%;" />

    其中：

    - `extern "C"` ： 表示**使用C语言的方式来进行编译**

    - `JNIEXPORT jstring JNICALL`： 只需关注中间部分即这里的 jstring，它代表返回类型为 string， JNI 方法返回值与 Java、C++ 不太一样，具体上网查询

    - `Java_com_hl_nativelib_TestJNI_test(JNIEnv *env, jobject thiz)`：

        此为静态注册 JNI 方法的方法名固定格式：==全路径类名 + 方法名 + 参数1 JNIEnv + 参数2 jobject + 其他参数== 

        注意：

        1. `类名之间的包名`和方法名之间使用 `_` 进行分隔，若 Java Native 中的包名、类名或方法名中包括 `_` ，则使用 `_1` 代替。

        2. 如果在 Java 中声明的方法是 "静态的" ，则 native 方法也是 static，否则不是。

        3. 若 Java Native  方法对应的 JNI 方法是通过动态注册的，则不需要遵循上述规范。

            

2. 动态注册

    了解过上述方式，相信很容易发现它的弊端，就是每次都需要写很长的方法名，虽然可以通过 AS 方便地生成，但是每写一个 Java Native 方法都还得检查是否有对应的实现。

    而通过动态注册就可以使用 C/C++ 中的方法名不必按照静态注册的方法名规范，它可以运行时动态地将 Java Native 方法与 C/C++ 方法关联起来。

    

    首先，需要实现 `JNI_Onload()` 方法，它会在使用` System.loadLibarary()` 方法加载 so 库的时候得到调用，如下：

    ```c++
    extern "C"
    JNIEXPORT jint JNI_OnLoad(JavaVM *vm, void *reserved) {
    
        JNIEnv *env = NULL;
        if (vm->GetEnv((void **) &env, JNI_VERSION_1_6) != JNI_OK) {
            return JNI_ERR;
        }
        assert(env != NULL);
    
    // 注册native方法
        if (!registerMethods(env, JNIREG_CLASS, method_table, NUM_METHOES(method_table))) {
            return JNI_ERR;
        }
    
        return JNI_VERSION_1_6;
    }
    ```

    这个方法的声明为如上的固定格式，接着就需要动态注册 Native 方法了：

    ```c++
    #include <jni.h>
    #include <string>
    #include <assert.h>
    
    // ------------------------------- 以下是动态注册 --------------------------------
    
    jstring aaa(JNIEnv *env, jclass clazz) {
        std::string hello = "Hello from C++  by 动态注册";
        return env->NewStringUTF(hello.c_str());
    }
    
    jstring getStringWithDynamicReg(JNIEnv *env, jclass clazz, jobject context, jstring value) {
        const char *str = env->GetStringUTFChars(value, JNI_FALSE);
        return env->NewStringUTF(str);
    }
    
    
    
    /**
     * 所谓的动态注册 是指，动态注册JAVA的Native方法，使得c/c++里面方法名 可以和 java 的Native方法名可以不同，
     * 动态注册是将将二者方法名关联起来，以后在修改Native方法名时，只需修改动态注册关联的方法名称即可
     *  System.loadLibrary("xxx"); 这个方法还是必须要调用的，不管动态还是静态
     */
    #define JNIREG_CLASS "com/mirkowu/jintest/jni/JniDynamicRegisterTest"  //Java类的路径：包名+类名
    #define NUM_METHOES(x) ((int) (sizeof(x) / sizeof((x)[0]))) //获取方法的数量
    
    
    static JNINativeMethod method_table[] = {
            // 第一个参数a 是java native方法名，
            // 第二个参数 是native方法参数,括号里面是传入参的类型，外边的是返回值类型，
            // 第三个参数 是c/c++方法参数,括号里面是返回值类型，
            {"a", "()Ljava/lang/String;",                                     (jstring *) aaa},
            {"b", "(Ljava/lang/Object;Ljava/lang/String;)Ljava/lang/String;", (jstring *) getStringWithDynamicReg},
    
    };
    
    static int registerMethods(JNIEnv *env, const char *className,
                               JNINativeMethod *gMethods, int numMethods) {
        jclass clazz = env->FindClass(className);
        if (clazz == NULL) {
            return JNI_FALSE;
        }
        //注册native方法, 通过 RegisterNatives 方法把 C/C++ 中的方法映射到 Java 中的 native 方法
        if (env->RegisterNatives(clazz, gMethods, numMethods) < 0) {
            return JNI_FALSE;
        }
        return JNI_TRUE;
    }
    ```

    

    ==JNI 签名==：

    动态注册中 JNINativeMethod 结构体的第二个参数需注意，即上面代码中的 `method_table[]`。
    ==括号内代表传入参数的签名符号，为空可以不写，括号外代表返回参数的签名符号，为空填写 V，==对应关系入下表：

    | 签名符号 |     C/C++     |   java    |
    | :------: | :-----------: | :-------: |
    |    V     |     void      |   void    |
    |    Z     |   jboolean    |  boolean  |
    |    I     |     jint      |    int    |
    |    J     |     jlong     |   long    |
    |    D     |    jdouble    |  double   |
    |    F     |    jfloat     |   float   |
    |    B     |     jbyte     |   byte    |
    |    C     |     jchar     |   char    |
    |    S     |    jshort     |   short   |
    |    [Z    | jbooleanArray | boolean[] |
    |    [I    |   jintArray   |   int[]   |
    |    [J    |  jlongArray   |  long[]   |
    |    [D    | jdoubleArray  | double[]  |
    |    [F    |  jfloatArray  |  float[]  |
    |    [B    |  jbyteArray   |  byte[]   |
    |    [C    |  jcharArray   |  char[]   |
    |    [S    |  jshortArray  |  short[]  |

    这个 其实很好记的，除了 boolean 和 long，其他都是首字母大写。

    

    特殊的 String ：

    |      签名符号      |  C/C++  |  Java  |
    | :----------------: | :-----: | :----: |
    | Ljava/lang/String; | jstring | String |
    |  L完整包名加类名;  | jobject | class  |

    

    举个例子:

    | 函数定义                            | 函数签名                  |
    | ----------------------------------- | ------------------------- |
    | `String getString(int a, long[] b)` | `(I[J)Ljava/lang/String;` |

    如若无法确定方法签名，可以使用 `javap` 命令获取方法签名，如自定义类如下：

    ```java
    package com.demo;  
     public class SigTest {  
         public static final String name = null;  
         public int getName(int[] data,long index) {  
             return 0;  
         }  
     }  
    ```

    ```shell
    $ javac SigTest.java 
    $ javap -s -p com.demo.SigTest
    Compiled from "SigTest.java"
    public class com.demo.SigTest extends java.lang.Object{
    public static final java.lang.String name;
      Signature: Ljava/lang/String;
    public com.demo.SigTest();
      Signature: ()V
    public int getName(int[], long);
      Signature: ([IJ)I
    static {};
      Signature: ()V
    }
    ```

    - -s ：表示打印签名信息

    - -p： 表示打印所有函数和成员的签名信息，默认只打印public的签名信息

        

3.  Native 层代码反调用 Java 层代码

    这里需要涉及到一些 C++ 语言的运用，这里不作过多的展开，具体使用方式见：[**如何在C/C++中调用Java方法？**](https://zhuanlan.zhihu.com/p/97691316)



##### 2.2.4 编译 C/C++ 源码生成动态库 `.so`

因为使用 Cmake 方式来编译 C/C++ 代码，因此这里就需要了解  CMakeLists.txt 这个文件。



**通常一个CMakeLists.txt需按照下面的流程**：

```cmake
project(xxx)                                          #必须

add_subdirectory(子文件夹名称)                         #父目录必须，子目录不必

add_library(库文件名称 SHARED/STATIC 文件)              #生成共享/静态库，通常子目录(二选一)
add_executable(可执行文件名称 文件)                     #生成可执行文件，通常父目录(二选一)

include_directories(路径)                              #必须， 引入 .h 头文件路径
link_directories(路径)                                 #必须， 链接 .so/.a 库文件路径

target_link_libraries(库文件名称/可执行文件名称 链接的库文件名称)       #必须， 添加链接三方库或系统库
```

除了这些之外，就是些set变量的语句，if判断的语句，或者其他编译选项的语句，但基本结构都是这样的。



最常用的命令如下(仅供后期查询，初期不需要细看)：

```cmake
# 本CMakeLists.txt的project名称
# 会自动创建两个变量，PROJECT_SOURCE_DIR和PROJECT_NAME
# ${PROJECT_SOURCE_DIR}：本 CMakeLists.txt 所在的文件夹路径
# ${PROJECT_NAME}：本 CMakeLists.txt 的 project 名称
project(xxx)

# 获取路径下所有的.cpp/.c/.cc文件，并赋值给变量中
aux_source_directory(路径 变量)

# 给文件名/路径名或其他字符串起别名，用${变量}获取变量内容
set(变量 文件名/路径/...)

# 添加编译选项
add_definitions(编译选项)

# 打印消息
message(消息)

# 编译子文件夹的 CMakeLists.txt
add_subdirectory(子文件夹名称)

# 将.cpp/.c/.cc文件生成 .so动态库 或 .a 静态库
# 注意，库文件名称通常为 libxxx.so，在这里只要写 xxx 即可
add_library(库文件名称 SHARED/STATIC 文件)

# 将.cpp/.c/.cc 文件生成可执行文件，即可通过命令执行
add_executable(可执行文件名称 文件)

# 引入 .h 头文件路径
include_directories(路径)

# 链接 .so/.a 库文件路径
link_directories(路径)

# 对 add_library 或 add_executable 生成的文件进行链接操作
# 注意，库文件名称通常为 libxxx.so，在这里只要写 xxx 即可
target_link_libraries(库文件名称/可执行文件名称 链接的库文件名称)
```



如我们先前自动的 CMakeLists.txt  文件现在就如下：

```cmake
# 设置 cmake 最低请求版本
cmake_minimum_required(VERSION 3.10.2)

# 声明项目名称，加载时需要使用此名称
project("nativelib")

#将路径列表全部放到一个变量
aux_source_directory(. SRC_LIST)

#将指定文件生成动态库，添加到项目中
add_library(nativelib SHARED ${SRC_LIST} )

# 指定您希望 CMake 定位的 NDK 库的名称，并设置为变量
find_library(log-lib log )

# 添加链接三方库或系统库到 nativelib
target_link_libraries(nativelib ${log-lib} )
```



若想学习更详细的操作，可参考 [CMakeLists.txt的超傻瓜手把手教程](https://blog.csdn.net/qq_38410730/article/details/102477162)。



##### 2.2.5 加载 so 库调用 Native 方法

经过上述准备步骤后，就可以准备使用 Java Native 方法了。使用也非常简单，主要有两个步骤：

1. 加载

    主要使用 `System.loadLibrary(xxx)` 方法加载动态库，为方便使用，可以在 Java Native 方法所在类初始化时加载，如下所示：

    ```kotlin
    class TestJNI {
    
    	external fun test():String
    
    	companion object {
    		init {
    			System.loadLibrary("nativelib")
    		}
    	}
    }
    ```

    这样在调用 Java Native 方法时与其相关的动态库就已完成加载。

    

2. 调用

    调用 Java Native 方法与调用 Java 普通方法没有任何区别，静态的也可以使用类名调用，如下：

    ```kotlin
    class JNIFragment : Fragment{
        
    	override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    		super.onViewCreated(view, savedInstanceState)
    		this.displayInfo.text = TestJNI().test()
    	}
    }
    ```

    

