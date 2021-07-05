# Android 中依赖注入框架 Hilt





### 1. 依赖注入

>   ==依赖项注入 (DI)== 是一种广泛用于编程的技术，非常适用于 Android 开发。遵循 DI 的原则可以为良好的应用架构奠定基础。
>
>   实现依赖项注入可为您带来以下优势：
>
>   -   重用代码
>   -   易于重构
>   -   易于测试



#### 1.1  什么是依赖注入？

类通常需要引用其他类。例如，`Car` 类可能需要引用 `Engine` 类。这些必需类称为依赖项，在此示例中，`Car` 类依赖于拥有 `Engine` 类的一个实例才能运行。

类可通过以下三种方式获取所需的对象：

1.  类构造其所需的依赖项。在以上示例中，`Car` 将创建并初始化自己的 `Engine` 实例。如：

    ```kotlin
    class Car {
    
        private val engine = Engine()
    
        fun start() {
            engine.start()
        }
    }
    
    fun main(args: Array) {
        val car = Car()
        car.start()
    }
    ```

2.  从其他地方抓取。某些 Android API（如 `Context` getter 和 `getSystemService()`）的工作原理便是如此。

3.  ==以参数形式提供。应用可以在构造类时提供这些依赖项，或者将这些依赖项传入需要各个依赖项的函数==。在以上示例中，`Car` 构造函数将接收 `Engine` 作为参数。

第三种方式就是依赖项注入！使用这种方法，您可以获取并提供类的依赖项，而不必让类实例自行获取。



 `Car` 类自己构造其所需依赖的对象  `Engine` 类时，会带来以下两点问题：

-   `Car` 和 `Engine` 密切相关 ：`Car` 的实例使用一种类型的 `Engine`，并且无法轻松使用子类或替代实现。如果 `Car` 要构造自己的 `Engine`，您必须创建两种类型的 `Car`，而不是直接将同一 `Car` 重用于 `Gas` 和 `Electric` 类型的引擎。
-   对 `Engine` 的强依赖使得测试更加困难。`Car` 使用 `Engine` 的真实实例，因此您无法使用[测试替身](https://en.wikipedia.org/wiki/Test_double)针对不同的测试用例修改 `Engine`。



而如果使用依赖项注入，则可以很轻松地解决上述问题：重用 `Car` 和轻松测试 `Car` 。Android 中有两种主要的依赖项注入方式：

-   **构造函数注入**：将某个类的依赖项传入其构造函数。

-   **字段注入（或 setter 注入）**：某些 Android 框架类（如 Activity 和 Fragment）由系统实例化，因此无法进行构造函数注入。使用字段注入时，依赖项将在创建类后实例化。代码如下所示：

    ```kotlin
    class Car {
        lateinit var engine: Engine
    
        fun start() {
            engine.start()
        }
    }
    
    fun main(args: Array) {
        val car = Car()
        car.engine = Engine()  // Car 类实例化后设置  Engine 实例
        car.start()
    }
    ```

**注意**：依赖项注入基于[控制反转](https://en.wikipedia.org/wiki/Inversion_of_control)原则，根据该原则，通用的代码可以控制特定代码的执行。



#### 1.2 自动依赖项注入

在上面的示例中，自行创建、提供并管理不同类的依赖项，而不依赖于库，这种方式称为手动依赖项注入或人工依赖项注入。在 `Car` 示例中，只有一个依赖项，但如果依赖项和类越多，手动依赖项注入就越繁琐，因此手动依赖项注入会带来多个问题：

-   对于大型应用，获取所有依赖项并正确连接它们可能需要大量样板代码。**在多层架构中，要为顶层创建一个对象，必须提供其下层的所有依赖项**。例如，要制造一辆真车，可能需要引擎、传动装置、底盘以及其他部件；而要制造引擎，则需要汽缸和火花塞。
-   如果无法在传入依赖项之前构造依赖项，则需要编写并维护管理内存中依赖项生命周期的自定义容器（或依赖关系图）。即依赖项在使用它的类实例化之后创建。



有一些库通过自动执行创建和提供依赖项来解决此问题。它们归为两类：

1.  基于反射的解决方案，可在运行时连接依赖项。
2.  静态解决方案，可生成在编译时连接依赖项的代码。

[Dagger](https://dagger.dev/) 是适用于 Java、Kotlin 和 Android 的热门依赖项注入库，由 Google 进行维护。Dagger 为您创建和管理依赖关系图，从而便于您在应用中使用依赖注入（DI）。它提供了完全静态和编译时依赖项，解决了基于反射的解决方案（如 [Guice](https://en.wikipedia.org/wiki/Google_Guice)）的诸多开发和性能问题。



[Hilt](https://developer.android.google.cn/training/dependency-injection/hilt-android) 是推荐用于在 Android 中实现依赖项注入的 Jetpack 库。Hilt 通过为项目中的每个 Android 类提供容器并自动管理其生命周期，定义了一种在应用中执行 DI 的标准方法。

Hilt 在热门 DI 库 [Dagger](https://developer.android.google.cn/training/dependency-injection/dagger-basics) 的基础上构建而成，因而能够受益于 Dagger 提供的编译时正确性、运行时性能、可伸缩性和 Android Studio 支持。



------



### 2. 使用 Hilt 实现依赖项注入

>   Hilt 是 Android 的依赖项注入库，可减少在项目中执行手动依赖项注入的样板代码。同时为项目中的每个 Android 类提供容器并自动管理其生命周期，提供了一种在应用中使用 DI（依赖项注入）的标准方法，它是对 Dagger 的场景化，只能供安卓应用使用。





#### 2.1 添加依赖项

首先，需要将 `hilt-android-gradle-plugin` 插件添加到项目的根级 `build.gradle` 文件中：

```groovy
buildscript {
    ...
    dependencies {
        ...
        classpath 'com.google.dagger:hilt-android-gradle-plugin:2.28-alpha'
    }
}
```

然后，应用 Gradle 插件并在 `app/build.gradle` 文件中添加以下依赖项：

```groovy
// 注意：同时使用 Hilt 和数据绑定的项目需要 Android Studio 4.0 或更高版本。

...
apply plugin: 'kotlin-kapt'
apply plugin: 'dagger.hilt.android.plugin'

android {
    ...
}

dependencies {
    implementation "com.google.dagger:hilt-android:2.28-alpha"
    kapt "com.google.dagger:hilt-android-compiler:2.28-alpha"
}
```

Hilt 使用 [Java 8 功能](https://developer.android.google.cn/studio/write/java8-support)。如需在项目中启用 Java 8，请将以下代码添加到 `app/build.gradle` 文件中：

```groovy
android {
  ...
  compileOptions {
    sourceCompatibility JavaVersion.VERSION_1_8
    targetCompatibility JavaVersion.VERSION_1_8
  }
}
```



#### 2.2 Hilt 的相关注解



##### 2.2.1 `@HiltAndroidApp`

所有使用 Hilt 的应用都必须包含一个带有 `@HiltAndroidApp` 注解的 `Application` 类。 它会触发 Hilt 的代码生成操作，生成的代码包括应用的一个基类，该基类充当应用级依赖项容器，如下：

```kotlin
@HiltAndroidApp
class ExampleApplication : Application() { ... }
```

同时生成的这一 Hilt 组件会附加到 `Application` 对象的生命周期，并为其提供依赖项。此外，它也是应用的父组件，这意味着，其他组件可以访问它提供的依赖项。



##### 2.2.2 `@AndroidEntryPoint`

在 `Application` 类中设置了 Hilt 且有了应用级组件后，Hilt 可以为带有 `@AndroidEntryPoint` 注解的其他 Android 类提供依赖项，`@AndroidEntryPoint` 会为项目中的每个 Android 类生成一个单独的 Hilt 组件。这些组件可以从它们各自的父类接收依赖项，如[组件层次结构](https://developer.android.google.cn/training/dependency-injection/hilt-android#component-hierarchy)中所述。



Hilt 目前支持以下 Android 类：

-   `Activity`
-   `Fragment`
-   `View`
-   `Service`
-   `BroadcastReceiver`

如果使用 `@AndroidEntryPoint` 为某个 Android 类添加注解，则还必须为依赖于该类的 Android 类添加注释。例如，如果您为某个 Fragment 添加注解，则还必须为使用该 Fragment 的所有 Activity 添加注解，例如：

```kotlin
@AndroidEntryPoint
class ExampleActivity : AppCompatActivity() { 
    
    @Inject lateinit var fragment: ExampleFragment
  
    ... 
}

@AndroidEntryPoint
class ExampleFragment : Fragment() { ... }
```



==**注意**：在 Hilt 对 Android 类的支持方面还要注意以下几点：==

1.  Hilt 仅支持继承自 [`ComponentActivity`](https://developer.android.google.cn/reference/kotlin/androidx/activity/ComponentActivity) 的 Activity，如 [`AppCompatActivity`](https://developer.android.google.cn/reference/kotlin/androidx/appcompat/app/AppCompatActivity)。

2.  Hilt 仅支持继承自 `androidx.Fragment` 的 Fragment。

    

##### 2.2.3 `@Inject`

为了执行字段注入，Hilt 需要知道如何从相应组件提供必要依赖项的实例并绑定。

向 Hilt 提供绑定信息的一种方法是构造函数注入。在某个类的构造函数中使用 `@Inject` 注释，以告知 Hilt 如何提供该类的实例：

```kotlin
class AnalyticsAdapter @Inject constructor(
  private val service: AnalyticsService
) { ... }
```

在一个类的代码中，带有 `@Inject` 注解的构造函数的参数即是该类的依赖项。在本例中，`AnalyticsService` 是 `AnalyticsAdapter` 的一个依赖项。因此，Hilt 还必须知道如何提供 `AnalyticsService` 的实例。



**注意**：在构建编译时，Hilt 会为 Android 类生成 [Dagger](https://developer.android.google.cn/training/dependency-injection/dagger-basics) 组件。然后，Dagger 会检查您的代码，并执行以下步骤：

- 构建并验证依赖关系图，确保没有未满足的依赖关系且没有依赖循环。
- 生成它在运行时用来创建实际对象及其依赖项的类。



##### 2.2.4 `@Module`

有时，有些类型不能通过构造函数注入，发生这种问题的原因有多样，例如：

1. 接口无构造参数，因此无法通过 Hilt 注入接口；
2. 外部库的构造函数不为我们所有，也无法通过 Hilt 注入；



这时候就需要使用 `@Module` 注解，声明其为 Hilt 模块，它会告知 Hilt 如何提供某些类型的实例。同时还必须使用 `@InstallIn` 为 Hilt 模块添加注解，以告知 Hilt 每个模块将用在或安装在哪个 Android 类中。==在 Hilt 模块中提供的依赖项可以在它安装到的所有 Android 类关联的组件中使用==。



**注意**：由于 Hilt 的代码生成操作需要访问使用 Hilt 的所有 Gradle 模块，因此编译 `Application` 类的 Gradle 模块还需要在其传递依赖项中包含您的所有 Hilt 模块和通过构造函数注入的类（不是很明白！！！）。



##### 2.2.5 `@Binds`

`@Binds` 注解会告知 Hilt 在需要提供接口的实例时要使用哪种实现。



以 `AnalyticsService` 为例。如果 `AnalyticsService` 是一个接口，则无法通过构造函数注入它，这时应向 Hilt 提供绑定信息，方法是在 Hilt 模块内创建一个==带有 `@Binds` 注解的抽象函数==。

这个抽象函数会向 Hilt 提供以下信息：

1. 返回类型会告知 Hilt 该函数提供哪个接口的实例。
2. 参数会告知 Hilt 需要提供哪个实现。

```kotlin
interface AnalyticsService {
  fun analyticsMethods()
}

// Constructor-injected, because Hilt needs to know how to
// provide instances of AnalyticsServiceImpl, too.
class AnalyticsServiceImpl @Inject constructor(
  ...
) : AnalyticsService { ... }

@Module
@InstallIn(ActivityComponent::class)
abstract class AnalyticsModule {

  @Binds
  abstract fun bindAnalyticsService(
    analyticsServiceImpl: AnalyticsServiceImpl
  ): AnalyticsService
}
```

Hilt 模块 `AnalyticsModule` 带有 `@InstallIn(ActivityComponent::class)` 注解，它意味着该模块中的所有依赖项都可以在应用的所有 Activity 中使用。



2.2.6 `@Provides` 

接口不是无法通过构造函数注入类型的唯一一种情况，如果某个类来自外部库或者必须使用[构建器模式](https://en.wikipedia.org/wiki/Builder_pattern)创建实例，也无法通过构造函数注入。



以前面的例子来说，如果 `AnalyticsService` 类不直接归我们所有，我们可以告知 Hilt 如何提供此类型的实例，方法是在 Hilt 模块内创建一个==带有 `@Provides`  注解的普通函数==。

这时，该函数会向 Hilt 提供以下信息：

1. 返回类型会告知 Hilt 该函数提供哪个类型的实例。
2. 参数会告知 Hilt 该函数需要的相应类型的依赖项。
3. 函数主体会告知 Hilt 如何提供相应类型的实例，每当需要提供该类型的实例时，Hilt 都会执行函数主体。

```kotlin
@Module
@InstallIn(ActivityComponent::class)
object AnalyticsModule {

  @Provides
  fun provideAnalyticsService(
    // Potential dependencies of this type
  ): AnalyticsService {
      return Retrofit.Builder()
               .baseUrl("https://example.com")
               .build()
               .create(AnalyticsService::class.java)
  }
}
```

