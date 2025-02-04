# 代码混淆

[TOC]



### 1. 代码混淆器（ProGuard）



- 介绍

  由于跨平台的需要，**Java** **字节码** 中包括了很多源代码信息，如变量名、方法名，并且通过这些名称来访问变量和方法，这些 **符号带有许多语义信息**，很 **容易被反编译成 Java 源代码**。为了防止这种现象，可以使用 Java 混淆器对 Java 字节码进行混淆。

  代码混淆也被称为 **花指令**，它 **将计算机程序的代码转换成一种功能上等价，但是难以阅读和直接理解的形式**，即使反编译成功也很难得出程序的真正语义。混淆器的 **作用** 不仅仅是 **保护代码**，它也有 **精简编译后程序大小** 的作用，其 **通过缩短变量和函数名以及丢失部分无用信息等方式，能使得应用包体积减小**。

  

- 形式

  目前代码混淆的形式主要有 以下**三种**

  1. **将代码中的各个元素，比如类、函数、变量的名字改变成无意义的名字**。例如将 **hasValue** 转换成单个的字母 **a**。这样，反编译阅读的人就无法通过名字来猜测用途。

  2. **重写** 代码中的 **部分逻辑**，将它变成 **功能上等价**，但是又 **难以理解** 的形式。比如它会 **改变循环的指令、结构体**。

  3. **打乱代码的格式**，比如多加一些空格或删除空格，或者将一行代码写成多行，将多行代码改成一行。

     

- 作用

  在 **Android SDK** 里面集成了一个工具 — **Proguard**，它是一个免费的 **Java** 类文件 **压缩、优化、混淆、预先校验** 的工具。它的 **主要作用** 大概可以概括为 **两点**：

  1. **瘦身：它可以检测并移除未使用到的类、方法、字段以及指令、冗余代码，并能够对字节码进行深度优化。最后，它还会将类中的字段、方法、类的名称改成简短无意义的名字**。

  2. **安全：增加代码被反编译的难度，一定程度上保证代码的安全**。

     

  作用具体可以细分四点：

  1. 压缩（Shrinking）：默认开启，以减小应用体积，移除未被使用的类和成员，并且 **会在优化动作执行之后再次执行**，因为优化后可能会再次暴露一些未被使用的类和成员
  
  2. 优化（Optimization）：默认开启，在 **字节码级别执行优化**，让应用 **运行的更快**
  
  3. 混淆（Obfuscation）：默认开启，增大反编译难度，类和类成员会被随机命名，除非用 优化字节码 等规则进行保护
  
  4. 预检（Preveirfy）：在 Java 平台上对处理后的代码进行预检，确保加载的 class文件是可执行的
  
     

------



### 2. 混淆配置

使用混淆，我们只需配置如下代码即可：

```groovy
buildTypes {
    release {
            // 1、是否进行混淆
            minifyEnabled true

            // 2、开启zipAlign可以让安装包中的资源按4字节对齐，这样可以减少应用在运行时的内存消耗
            zipAlignEnabled true

            // 3、移除无用的resource文件：当 ProGuard 把部分无用代码移除的时候，
            // 这些代码所引用的资源也会被标记为无用资源，然后系统通过资源压缩功能将它们移除
            // 需要注意的是目前资源压缩器目前不会移除values/文件夹中定义的资源（例如字符串、尺寸、样式和颜色）
            shrinkResources true

            // 4、混淆文件的位置，其中 proguard-android.txt 为 sdk 默认的混淆配置，位于android-sdk/tools/proguard/proguard-android.txt
            // 此外，proguard-android-optimize.txt 也为sdk默认的混淆配置，但它默认打开了优化开关, 可配置相关代码为无效代码
            // 而 proguard-rules.pro 是该模块下的混淆配置。
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'

            signingConfig signingConfigs.realse
    }
}
```

接下来，我们就了解一下 sdk 默认的混淆配置，也就是 `proguard-android-optimize.txt` 这个文件的内容：

```shell
# 启动优化相关的一些配置
# 指定更精细级别的优化
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
# 表示对代码优化的次数，一般为 5
-optimizationpasses 5
# 允许改变作用域
-allowaccessmodification
# 关闭预验证
-dontpreverify

# 表示混淆时不使用大小写混合类名
-dontusemixedcaseclassnames

# 表示不跳过 library 中的非 public 类
-dontskipnonpubliclibraryclasses

# 表示打印混淆的详细信息
-verbose

#表示对注解中的参数进行保留
-keepattributes *Annotation*

# 表示不混淆如下声明的两个类，这两个类基本上也用不上，是接入 Google 原生的一些服务时使用的
-keep public class com.google.vending.licensing.ILicensingService
-keep public class com.android.vending.licensing.ILicensingService

# 表示不混淆任何包含 native 方法的类名以及 native 方法名，这个和刚才验证的结果是一致的
-keepclasseswithmembernames class * {
    native <methods>;
}
      
# 表示不混淆 View 中的 setXXX() 和 getXXX() 方法，因为属性动画需要有相应的 setter 和 getter 方法实现
-keepclassmembers public class * extends android.view.View {
   void set*(***);
   *** get*();
}
      
# 表示不混淆 Activity 中参数是 View 的方法，因为有这么一种用法，在 XML 中配置 android:onClick="btnClick" 属性，混淆就找不到了
-keepclassmembers class * extends android.app.Activity {
   public void *(android.view.View);
}
      
# 表示不混淆枚举的 values() 和 valueOf() 方法
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}
      
# 表示不混淆 Parcelable 实现类中的 CREATOR 字段，毫无疑问，CREATOR 字段是绝对不能改变的，包括大小写都不能变，不然整个 Parcelable 工作机制都会失效
-keepclassmembers class * implements android.os.Parcelable {
  public static final android.os.Parcelable$Creator CREATOR;
}
      
# 表示不混淆 R 文件中的所有静态字段，我们都知道 R 文件是通过字段来记录每个资源 id ，字段名如果被混淆，id 就找不到了
-keepclassmembers class **.R$* {
    public static <fields>;
}
      
# 表示对 android.support 包下的代码不警告，因为 support 包中的所有代码都在兼容性上做了足够的判断，因此不用担心代码会出问题
# 所以直接忽略警告就可以了
-dontwarn android.support.**
      
# 表示不混淆 android.support.annotation.Keep 这个注解类的所有东西
-keep class android.support.annotation.Keep
      
# 表示不混淆使用了 class android.support.Keep 注解的类的所有东西
-keep @android.support.annotation.Keep class * {*;}
      
# 表示不混淆类名和类中使用了 class android.support.Keep 注解的方法
-keepclasseswithmembers class * {
    @android.support.annotation.Keep <methods>;
}
      
# 表示不混淆类名和类中使用了 class android.support.Keep 注解的属性
-keepclasseswithmembers class * {
    @android.support.annotation.Keep <fields>;
}
      
# 表示不混淆类名和类中使用了 class android.support.Keep 注解的构造方法
-keepclasseswithmembers class * {
    @android.support.annotation.Keep <init>(...);
}
```



之前一些 AGP 老版本，我们新建工程默认使用的是：proguard-android.txt，那么它和 proguard-android-optimize.txt 有啥区别呢？

从字面的维度看，就多了一个 optimize（优化）这个单词，实际就是多了优化这一部分，==proguard-android-optimize.txt 相对于 proguard-android.txt 开启了优化相关的配置==：

```shell
# proguard-android-optimize.txt 新增了以下优化规则
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5
-allowaccessmodification
-dontpreverify

# proguard-android-optimize.txt 删除了关闭优化指令的配置
# -dontoptimize
```



在执行完 **ProGuard** 之后，ProGuard 都会在 `${project.buildDir}/outputs/mapping/${flavorDir}/` 生成以下文件：

| **文件名**  |                             描述                             |
| :---------: | :----------------------------------------------------------: |
|  dump.txt   |                  APK中所有类文件的内部结构                   |
| mapping.txt | 提供原始与混淆过的类、方法和字段名称之间的转换，可以通过 `android-sdk/tools/proguard/bin/proguardgui.bat` 工具进行分析处理 |
|  seeds.txt  |                   列出未进行混淆的类和成员                   |
|  usage.txt  |                     列出从APK移除的代码                      |



------



### 3. `ProGuard` 规则



#### 3.1 基本指令

- **-ignorewarning**：是否忽略警告
- **-optimizationpasses n**：指定代码的压缩级别(在0~7之间，默认为5)
- **-dontusemixedcaseclassnames**：是否使用大小写混合(windows大小写不敏感，建议加入)
- **-dontskipnonpubliclibraryclasses**：是否混淆非公共的库的类
- **-dontskipnonpubliclibraryclassmembers**：是否混淆非公共的库的类的成员
- **-dontpreverify**：混淆时是否做预校验(Android不需要预校验，去掉可以加快混淆速度)
- **-verbose**：混淆时是否记录日志(混淆后会生成映射文件)
- **-obfuscationdictionary dictionary_path**：指定外部模糊字典
- **-classobfuscationdictionary dictionary_path**：指定class模糊字典
- **-packageobfuscationdictionary dictionary_path**：指定package模糊字典
- **-optimizations !code/simplification/arithmetic,!field/\*,!class/merging/\*,!code/allocation/variable**：混淆时所采用的算法(谷歌推荐算法)
- **-libraryjars libs(\*.jar;)**: 指定要保留不混淆的库（JAR 文件）
- **-renamesourcefileattribute SourceFile**：将文件来源重命名为“SourceFile”字符串
- **-keepattributes \*Annotation\***：保持注解不被混淆
- **-keep class \* extends java.lang.annotation.Annotation {\*;}**：保持注解不被混淆
- **-keep interface \* extends java.lang.annotation.Annotation { \*; }**：保持注解不被混淆
- **-keepattributes Signature**：保持泛型不被混淆
- **-keepattributes EnclosingMethod**：保持反射不被混淆
- **-keepattributes Exceptions**：保持异常不被混淆
- **-keepattributes InnerClasses**：保持内部类不被混淆
- **-keepattributes SourceFile,LineNumberTable**：抛出异常时保留代码行号
- **-printmapping proguardMapping.txt** ：指定映射文件的名称（默认 mapping.txt ）



#### 3.2  keep 关键字

|          **关键字**          |                           **描述**                           |
| :--------------------------: | :----------------------------------------------------------: |
|            `keep`            |    保持类和类成员，防止被移除或者被重命名，==即保持原样==    |
|         `keepnames`          | 保持类和类成员，防止被重命名，==即类名不混淆，若成员不被使用会被移除== |
|      `keepclassmembers`      | 保持类成员，防止被移除或者被重命名，==即类名混淆，类中成员保持原样== |
|    `keepclassmembernames`    | 保持类成员，防止被重命名， ==即类名混淆，若成员不被使用会被移除== |
|   `keepclasseswithmembers`   | 保持拥有该成员的类和成员，防止被移除或者被重命名，==即类若有指定通配符匹到的成员，则类名与该成员保持原样，其他成员混淆== |
| `keepclasseswithmembernames` | 保持拥有该成员的类和成员，防止被重命名，==即类若有指定通配符匹到的成员，则类名与该成员保持原样，其他成员混淆，且若其他成员不被使用会被移除== |

其中，`keepnames`、`keepclassmembernames`  以及 `keepclasseswithmembernames` 使用较多，都是在其成员不被使用时会被移除，更能优化代码。

注意： `keepnames` 与 `keepclasseswithmembernames` 的区别在于 `keepclasseswithmembernames` 需要使用通配符匹配相关成员，仅匹配到才会生效。


#### 3.3 通配符

| **通配符** |                             描述                             |
| :--------: | :----------------------------------------------------------: |
|  <fields>  |                      匹配类中所有的字段                      |
| <methods>  |                      匹配类中所有的方法                      |
|   <init>   |                    匹配类中所有的构造方法                    |
|     *      | ==匹配任意长度字符，但不包含分隔符`.`==。例如：类名是 `com.dream.androidreversedemo.MainActivity`，使用 `com.*` 或者 `com.dream.*` 是无法匹配的，因为 * 无法匹配包名中的分隔符，正确的匹配方式是`com.dream.*.*`或者`com.dream.androidreversedemo.*` |
|     **     | ==匹配任意长度字符，包含分隔符`.`==。例如：上面匹配规则我们可以使用`com.**`或者`com.dream.**`来进行匹配 |
|    ***     | ==匹配一个任意参数类型==。例如：`void set*(***)`就能匹配传入任意的参数类型，`***get(*)`就能匹配任意返回值的类型 |
|    ...     | ==匹配任意多个的任意类型参数==。例如：`void test(...)`就能匹配`void test(String str)`或者`void test(int a,double b)`这些方法 |



#### 3.3 通用示例

1. 不混淆某个类

   ```shell
   -keep public class com.android.proguard.example.Test { *; }
   ```

2.  不混淆某个包所有的类

   ```shell
   -keep class com.android.proguard.example.** { *; }
   ```

3. 不混淆某个类的子类

   ```shell
   -keep public class * extends com.android.proguard.example.Test { *; }
   ```

4. 不混淆所有类名中包含了“model”的类及其成员

   ```shell
   -keep public class **.*model*.** {*;}
   ```

5. 不混淆某个接口的实现

   ```shell
   -keep public class **.*model*.** {*;}
   ```

6. 不混淆某个类的构造方法

   ```shell
   -keepclassmembers class com.android.proguard.example.Test {
       public <init>();
   }
   ```

7. 不混淆某个类的特定的方法

   ```shell
   -keepclassmembers class com.android.proguard.example.Test {
        public void test(java.lang.String);
   }
   ```

8. 不混淆某个类的内部类

   ```shell
   -keep class com.android.proguard.example.Test$* {
          *;
   }
   ```




#### 3.4 示例

如何保留实现了 `com.dream.test.BaseJsonData` 接口的类的所有信息不被混淆？



一个清晰的思路很重要，仔细分析一下：

1. 首先要保证 `com.dream.test.BaseJsonData` 接口不被混淆
2. 然后保证实现 `com.dream.test.BaseJsonData` 接口的类不被混淆
3. 最后就是匹配类中所有的成员不被混淆，可以使用通配符 *



因此，可以使用如下写法：

```shell
# 保证  com.dream.test.BaseJsonData 接口不被混淆
-keep class com.dream.test.BaseJsonData
# 保证实现 com.dream.test.BaseJsonData 接口的类不被混淆
-keep class * implements com.dream.test.BaseJsonData{
# 匹配类中所有的成员不被混淆，可以使用通配符 *
    *;
}
```

其中，由于默认混淆文件 `proguard-android-optimize.txt`  中对 `android.support.annotation.Keep` 注解处理的存在，如果 `com.dream.test.BaseJsonData` 非三方库中的类，可以给该类加上 `@Keep` 注解，也能保证该类不会被混淆，因此：

```java
@Keep                              [等价于]
class com.dream.test.BaseJsonData   <＝＝>   -keep class com.dream.test.BaseJsonData
```



------



### 4. 配置模板

```shell
# --------------------------------------------基本指令区--------------------------------------------#
-ignorewarnings                                     # 是否忽略警告
-optimizationpasses 5                               # 指定代码的压缩级别(在0~7之间，默认为5)
-dontusemixedcaseclassnames                         # 是否使用大小写混合(windows大小写不敏感，建议加入)
-dontskipnonpubliclibraryclasses                    # 是否混淆非公共的库的类
-dontskipnonpubliclibraryclassmembers               # 是否混淆非公共的库的类的成员
-dontpreverify                                      # 混淆时是否做预校验(Android不需要预校验，去掉可以加快混淆速度)
-verbose                                            # 混淆时是否记录日志(混淆后会生成映射文件)

# 混淆时所采用的算法(谷歌推荐算法)
-optimizations !code/simplification/arithmetic,!field/*,!class/merging/*,!code/allocation/variable

# 将文件来源重命名为 "SourceFile" 字符串
-renamesourcefileattribute SourceFile

# 保持注解不被混淆
-keepattributes *Annotation*
-keep class * extends java.lang.annotation.Annotation {*;}

# 保持泛型不被混淆
-keepattributes Signature
# 保持反射不被混淆
-keepattributes EnclosingMethod
# 保持异常不被混淆
-keepattributes Exceptions
# 保持内部类不被混淆
-keepattributes InnerClasses
# 抛出异常时保留代码行号
-keepattributes SourceFile,LineNumberTable

# 输出混淆映射文件名称及路径
-printmapping proguardMapping.txt

# --------------------------------------------默认保留区--------------------------------------------#
# 保持基本组件不被混淆
-keep public class * extends android.app.Fragment
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Application
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider
-keep public class * extends android.app.backup.BackupAgentHelper
-keep public class * extends android.preference.Preference

# 保持 Google 原生服务需要的类不被混淆
-keep public class com.google.vending.licensing.ILicensingService
-keep public class com.android.vending.licensing.ILicensingService

# Support包规则
-dontwarn android.support.**
-keep public class * extends android.support.v4.**
-keep public class * extends android.support.v7.**
-keep public class * extends android.support.annotation.**

# 保持 native 方法不被混淆
-keepclasseswithmembernames class * {
    native <methods>;
}

# 保留自定义控件(继承自View)不被混淆
-keep public class * extends android.view.View {
    *** get*();
    void set*(***);
    public <init>(android.content.Context);
    public <init>(android.content.Context, android.util.AttributeSet);
    public <init>(android.content.Context, android.util.AttributeSet, int);
}

# 保留指定格式的构造方法不被混淆
-keepclasseswithmembers class * {
    public <init>(android.content.Context, android.util.AttributeSet);
    public <init>(android.content.Context, android.util.AttributeSet, int);
}

# 保留在Activity中的方法参数是view的方法(避免布局文件里面onClick被影响)
-keepclassmembers class * extends android.app.Activity {
    public void *(android.view.View);
}

# 保持枚举 enum 类不被混淆
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# 保持R(资源)下的所有类及其方法不能被混淆
-keep class **.R$* { *; }

# 保持 Parcelable 序列化的类不被混淆(注：aidl文件不能去混淆)
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# 需要序列化和反序列化的类不能被混淆(注：Java反射用到的类也不能被混淆)
-keepnames class * implements java.io.Serializable

# 保持 Serializable 序列化的类成员不被混淆
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    !private <fields>;
    !private <methods>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# 保持 BaseAdapter 类不被混淆
-keep public class * extends android.widget.BaseAdapter { *; }
# 保持 CusorAdapter 类不被混淆
-keep public class * extends android.widget.CursorAdapter{ *; }

# ------------------------------------------AndroidX混淆------------------------------------------#
 -keep class com.google.android.material.** {*;}
 -keep class androidx.** {*;}
 -keep public class * extends androidx.**
 -keep interface androidx.** {*;}
 -dontwarn com.google.android.material.**
 -dontnote com.google.android.material.**
 -dontwarn androidx.**

# --------------------------------------------webView区--------------------------------------------#
# WebView处理，项目中没有使用到webView忽略即可
# 保持Android与JavaScript进行交互的类不被混淆
-keep class **.AndroidJavaScript { *; }
-keepclassmembers class * extends android.webkit.WebViewClient {
     public void *(android.webkit.WebView,java.lang.String,android.graphics.Bitmap);
     public boolean *(android.webkit.WebView,java.lang.String);
}
-keepclassmembers class * extends android.webkit.WebChromeClient {
     public void *(android.webkit.WebView,java.lang.String);
}

# 网络请求相关
-keep public class android.net.http.SslError

# --------------------------------------------删除代码区--------------------------------------------#
# 删除代码中Log相关的代码
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
    public static int e(...);
}


# --------------------------------------------可定制化区--------------------------------------------#
#---------------------------------1.实体类---------------------------------



#--------------------------------------------------------------------------

#---------------------------------2.与JS交互的类-----------------------------



#--------------------------------------------------------------------------

#---------------------------------3.反射相关的类和方法-----------------------



#--------------------------------------------------------------------------

#---------------------------------2.第三方依赖--------------------------------



#--------------------------------------------------------------------------
```

