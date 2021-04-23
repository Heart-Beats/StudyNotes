# Xposed 开发



[TOC]



## 1. Xposed开发教程



###  1. 1 Xposed如何运作

在进行修改之前，您应该大致了解Xposed的工作原理（不过，如果您觉得太无聊，可以跳过本节）。如下：



在 Android 运行时有一个核心进程 `Zygote`。每一个应用程序都以其副本（“ fork”）的形式启动。手机启动时，此进程由 `/init.rc` 脚本启动。该进程位于`/system/bin/app_process`，它会加载所需的类并调用初始化方法。

在这时 `Xposed` 就可以发挥作用。当安装 `Xposed` 框架后，[一个可执行的继承自 app_process 的进程](https://github.com/rovo89/Xposed)会被复制到`/system/bin`。这个继承的进程启动过程会将一个额外的 jar 添加到类路径，并在某些位置可以从那里调用方法。例如，在创建 VM 之后，甚至在 `main` 调用 Zygote 方法之前。在这种方法中，我们是 Zygote 的一部分，可以在其上下文中发挥作用。

该 jar 位于 `/data/data/de.robv.android.xposed.installer/bin/XposedBridge.jar` 其源代码可以在[此处](https://github.com/rovo89/XposedBridge)找到。查看类  [XposedBridge](https://github.com/rovo89/XposedBridge/blob/master/src/de/robv/android/xposed/XposedBridge.java)，您可以看到该 `main` 方法。这就是上面所写的内容，在进程的开始就调用了它，并在那里完成了一些初始化，还加载了模块（稍后我将返回模块加载）。



#### 1.1.1 方法`Hook`/替换

真正让 Xposed 产生作用的是 “Hook” 方法调用的可能性。当你反编译 APK 完成需要进行修改时，你可以直接在任意位置插入/更改的命令。但是，之后你将需要重新编译/签名 APK，并且您只能分发整个软件包。若需使用 Xposed 进行 `Hook`，你就无需去修改源码中的方法逻辑。相反，你可以在方法之前和之后插入自己的代码，这些方法就是 Java 中可以清楚定位的最小单元。

`XposedBridge` 有一个私有的本地方法 `hookMethodNative`。该方法在继承自`app_process` 的进程中实现。它将方法类型更改为 “native” ，并将方法实现链接到其自己的 “native” 通用方法。这意味着，每次调用该 `Hook` 方法时，都会在没有调用者知道的情况下调用通用方法。在此方法中，XposedBridge 中的`handleHookedMethod` 方法会被调用，并将参数、`this` 引用等回传给调用者。调用者这时就可以更改它的参数、实例/静态变量、调用其他方法、更改方法返回值……或跳过其中的任何内容。这是非常灵活的。

现在，就让我们现在创建一个模块试试吧！



## 1.2 创建 Xposed 模块

Xposed 模块是普通的应用程序，只是带有一些特殊的元数据和文件。因此，需要创建一个新的Android项目，选择 Emtpy Activity 模板即可：

<img src="https://gitee.com/HeartBeats_huan/note-picture/raw/master/images/image-20210227212012577.png" alt="image-20210227212012577" style="zoom:50%;" />



若想要使项目成为 Xposed 模块，我们还需要下面几个步骤：

1. 将 Xposed Framework API 依赖到项目中

    您可以在[使用Xposed Framework API中](https://github.com/rovo89/XposedBridge/wiki/Using-the-Xposed-Framework-API)找到所需的步骤。确保记住API版本，下一步将需要它。

2. 修改 AndroidManifest.xml

    Xposed 安装程序中的模块列表将查找带有特殊元数据标志的应用程序，修改内容如下所示：

    ```xml
    <?xml version="1.0" encoding="utf-8"?>
    <manifest xmlns:android="http://schemas.android.com/apk/res/android"
        package="de.robv.android.xposed.mods.tutorial"
        android:versionCode="1"
        android:versionName="1.0" >
    
        <uses-sdk android:minSdkVersion="15" />
    
        <application
            android:icon="@drawable/ic_launcher"
            android:label="@string/app_name" >
    
    		<!-- 是否是xposed模块，xposed根据这个来判断是否是模块 -->
            <meta-data
                android:name="xposedmodule"
                android:value="true" />
            <!-- 模块描述，显示在xposed模块列表那里第二行 -->
            <meta-data
                android:name="xposeddescription"
                android:value="Easy example which makes the status bar clock red and adds a smiley" />
            <!-- 最低xposed版本号(lib文件名可知) -->
            <meta-data
                android:name="xposedminversion"
                android:value="53" />
        </application>
    </manifest>
    ```

3. 模块实现
    一个模块可以有多个入口点 —— 在Android系统启动时、即将加载新的应用程序时，初始化应用程序资源时等等，选择哪一个取决于我们要修改的内容，在模块中写好对应的实现即可。

    由于大部分我们使用  Xposed 的需求是针对特定应用进行修改，因此仅需实现 `IXposedHookLoadPackage` 接口即可，新建 `HookMain`  类如下：

    ```kotlin
    package com.hl.hlwhook
    
    class HookMain : IXposedHookLoadPackage {
        override fun handleLoadPackage(lpparam: XC_LoadPackage.LoadPackageParam?) {
    		XposedBridge.log("加载 app: " + lpparam.packageName)
        }
    }
    ```

    此日志方法将消息写入标准logcat（tag `Xposed`）和 `/ data / data / de.robv.android.xposed.installer / log / debug.log`（可通过Xposed安装程序轻松访问）。

4. 添加 `assets/xposed_init` 文件

    此时唯一缺少的就是 `XposedBridge` 的入口，它主要通过 `assets` 文件夹下的 `xposed_init` 文件完成，在此文件中，每一行包含一个类的全名，如下：

    <img src="https://gitee.com/HeartBeats_huan/note-picture/raw/master/images/image-20210227215831866.png" alt="image-20210227215831866" style="zoom: 67%;" />

    

到此刻，我们就可以尝试运行该 `Xposed` 模块了，将项目作为 Android 应用程序运行。由于这是第一次安装它，因此需要先启用它，然后才能使用。打开`Xposed Installer` 应用程序，并确保已安装 `Xposed` 框架,，然后转到模块选项卡，在这里就可以找到我们编写的 Xposed 模块，勾选启用它然后重新启动。当然，此时并不会看到任何区别，但是如果查看日志，应该就可以看到类似以下内容：

```shell
Loading Xposed (for Zygote)...
Loading modules from /data/app/com.hl.hlwhook-1.apk
  Loading class com.hl.hlwhook.HookMain
Loaded app: com.android.systemui
Loaded app: com.android.settings
... (many more apps follow)
```

这就表示您现在已经有了一个Xposed模块。