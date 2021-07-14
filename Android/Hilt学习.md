# Android 中依赖注入框架 Hilt

[toc]





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
        classpath 'com.google.dagger:hilt-android-gradle-plugin:2.37'
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
    implementation "com.google.dagger:hilt-android:2.37"
    kapt "com.google.dagger:hilt-compiler:2.37"
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



#### 2.2 Hilt 的常用相关注解



##### 2.2.1 `@HiltAndroidApp`

所有使用 Hilt 的应用都必须包含一个带有 `@HiltAndroidApp` 注解的 `Application` 类。 它会触发 Hilt 的代码生成操作，生成的代码包括应用的一个基类，该基类充当应用级依赖项容器，如下：

```kotlin
@HiltAndroidApp
class ExampleApplication : Application() { ... }
```

同时生成的这一 Hilt 组件会附加到 `Application` 对象的生命周期，并为其提供依赖项。此外，它也是应用的父组件，这意味着，其他组件可以访问它提供的依赖项。



##### 2.2.2 `@AndroidEntryPoint`

在 `Application` 类中设置了 Hilt 且有了应用级组件后，Hilt 可以为带有 `@AndroidEntryPoint` 注解的其他 Android 类提供依赖项，`@AndroidEntryPoint` 会为项目中的每个 Android 类生成一个单独的 Hilt 组件。这些组件可以从它们各自的父类接收依赖项，如[组件层次结构](#3.4 组件层次结构)中所述。



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

该注解在 Hilt 中主要有两方面作用：

1. 执行依赖注入
2. 对有构造函数的依赖提供 Hilt 绑定



###### 2.2.3.1 执行依赖注入

`@AndroidEntryPoint` 注解为 Android 类生成的 Hilt 组件提供了应用所需的依赖，如果需要直接从组件获取依赖项，使用 `@Inject` 注解执行依赖注入即可：

```kotlin
@AndroidEntryPoint
class ExampleActivity : AppCompatActivity() {

  @Inject lateinit var analytics: AnalyticsAdapter
  ...
}
```

**注意**：==由 Hilt 注入的字段不能为私有字段。尝试使用 Hilt 注入私有字段会导致编译错误==。



###### 2.2.3.2 提供 Hilt 绑定

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



**注意**：由于 Hilt 的代码生成操作需要访问使用 Hilt 的所有 Gradle 模块，因此编译 `Application` 类的 Gradle 模块还需要在其传递依赖项中包含您的所有 Hilt 模块和通过构造函数注入的类（不是很明白？ app 模块中对依赖模块中的类进行依赖注入，自行提供 hilt 模块进行绑定？）。



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



##### 2.2.6 `@Provides`

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



##### 2.2.7 自定义注解 - 限定符

有时，我们可能需要让 Hilt 以依赖项的形式提供同一类型的不同实现，这就必须要向 Hilt 提供多个绑定。但显然直接通过 `@Binds` 或者 `@Provides` 是无法做到的，限定符在此时就==可以标识某个类型的特定绑定==。



以前面的例子来讲，如果需要拦截对 `AnalyticsService` 的调用，可以使用带有 [拦截器](https://square.github.io/okhttp/interceptors/) 的 `OkHttpClient` 对象。对于其他服务，可能需要以不同的方式拦截调用。在这种情况下，就需要告知 Hilt 如何提供两种不同的 `OkHttpClient` 实现。

1. 首先，定义用于绑定的限定符：

    ```kotlin
    @Qualifier  // hilt 中的注解，用于标识限定符
    @Retention(AnnotationRetention.BINARY)
    annotation class AuthInterceptorOkHttpClient
    
    @Qualifier
    @Retention(AnnotationRetention.BINARY)
    annotation class OtherInterceptorOkHttpClient
    ```

2. 然后，将 hilt 模块中绑定实例的方法加上限定符注解：

    ```kotlin
    @Module
    @InstallIn(ApplicationComponent::class)
    object NetworkModule {
    
      @AuthInterceptorOkHttpClient // 限定符
      @Provides
      fun provideAuthInterceptorOkHttpClient(authInterceptor: AuthInterceptor): OkHttpClient {
          return OkHttpClient.Builder()
                   .addInterceptor(authInterceptor)
                   .build()
      }
    
      @OtherInterceptorOkHttpClient // 限定符
      @Provides
      fun provideOtherInterceptorOkHttpClient(otherInterceptor: OtherInterceptor): OkHttpClient {
          return OkHttpClient.Builder()
                   .addInterceptor(otherInterceptor)
                   .build()
      }
    }
    ```

    虽然这两种方法具有相同的返回类型，但限定符将它们标记为两个不同的绑定。

3. 最后我们就可以通过使用相应的限定符为字段或参数添加注解来注入所需的特定类型：

    ```kotlin
    // As a dependency of another class.
    @Module
    @InstallIn(ActivityComponent::class)
    object AnalyticsModule {
    
      @Provides
      fun provideAnalyticsService(
        @AuthInterceptorOkHttpClient okHttpClient: OkHttpClient   //取得 @AuthInterceptorOkHttpClient 修饰的依赖
      ): AnalyticsService {
          return Retrofit.Builder()
                   .baseUrl("https://example.com")
                   .client(okHttpClient)
                   .build()
                   .create(AnalyticsService::class.java)
      }
    }
    
    // As a dependency of a constructor-injected class.
    class ExampleServiceImpl @Inject constructor(
      @AuthInterceptorOkHttpClient private val okHttpClient: OkHttpClient
    ) : ...
    
    // At field injection.
    @AndroidEntryPoint
    class ExampleActivity: AppCompatActivity() {
    
      @AuthInterceptorOkHttpClient
      @Inject lateinit var okHttpClient: OkHttpClient
    }
    ```

    最好的做法是，如果您向某个类型添加限定符，那么最好给它的默认实现也加一个限定符，否则容易出错，导致 hilt 注入错误的依赖。



##### 2.2.8  预定义限定符（`@ApplicationContext` 和 `@ActivityContext` ）

 Hilt 提供了一些预定义的限定符。例如，由于我们可能需要来自应用或 Activity 的 `Context` 类，因此 Hilt 提供了 `@ApplicationContext` 和 `@ActivityContext` 限定符。



同时每个 Hilt 组件都附带一组默认绑定，我们可以将其作为依赖项注入到自定义的绑定中。请注意，这些绑定都对应于常规 Activity 和 Fragment 类型，而不对应于它们的任何特定子类。这是因为，Hilt 会使用单个 ActivityComponent 组件来注入所有 Activity，每个 Activity 都有此组件的不同实例。

| Android 组件                | 默认绑定                                        |
| :-------------------------- | :---------------------------------------------- |
| `ApplicationComponent`      | `Application`                                   |
| `ActivityRetainedComponent` | `Application`                                   |
| `ActivityComponent`         | `Application` 和 `Activity`                     |
| `FragmentComponent`         | `Application`、`Activity` 和 `Fragment`         |
| `ViewComponent`             | `Application`、`Activity` 和 `View`             |
| `ViewWithFragmentComponent` | `Application`、`Activity`、`Fragment` 和 `View` |
| `ServiceComponent`          | `Application` 和 `Service`                      |

我们还可以使用 `@ApplicationContext` 获得应用上下文绑定、`@ActivityContext` 获得 Activity 上下文绑定：

```kotlin
class AnalyticsServiceImpl @Inject constructor(
  @ApplicationContext context: Context
) : AnalyticsService { ... }

// Application 绑定可以没有限定符
class AnalyticsServiceImpl @Inject constructor(
  application: Application
) : AnalyticsService { ... }


class AnalyticsAdapter @Inject constructor(
  @ActivityContext context: Context
) { ... }

// Activity 绑定可以没有限定符
class AnalyticsAdapter @Inject constructor(
  activity: FragmentActivity
) { ... }
```



##### 2.2.9  @EntryPoint

创建入口点，详情见[在 Hilt 不支持的类中注入依赖项](#4. 在 Hilt 不支持的类中注入依赖项)



------



### 3. Hilt 的组件



#### 3.1 为 Android 类生成的组件

对于我们可以直接执行依赖注入的每个 Android 类，Hilt 都为它生成了一个相关的组件，通过 `@InstallIn` 注解还可以将 Hilt 的模块与指定的组件关联，这时组件就可以获取到 Hilt 模块提供的绑定，与该组件关联的 Android 类就能直接执行依赖注入获取绑定的实例：



Hilt 提供了以下组件：

|          Hilt 组件          |              注入器面向的对象              |
| :-------------------------: | :----------------------------------------: |
|   `ApplicationComponent`    |               `Application`                |
| `ActivityRetainedComponent` |                `ViewModel`                 |
|     `ActivityComponent`     |                 `Activity`                 |
|     `FragmentComponent`     |                 `Fragment`                 |
|       `ViewComponent`       |                   `View`                   |
| `ViewWithFragmentComponent` | 带有 `@WithFragmentBindings` 注释的 `View` |
|     `ServiceComponent`      |                 `Service`                  |

**注意**：Hilt 不会为广播接收器生成组件，因为 Hilt 直接从 `ApplicationComponent` 注入广播接收器。



#### 3.2 组件生命周期

==Hilt 会按照相应 Android 类的生命周期自动创建和销毁生成的组件类的实例==。

|         生成的组件          |         创建时机         |         销毁时机          |
| :-------------------------: | :----------------------: | :-----------------------: |
|   `ApplicationComponent`    | `Application#onCreate()` | `Application#onDestroy()` |
| `ActivityRetainedComponent` |  `Activity#onCreate()`   |  `Activity#onDestroy()`   |
|     `ActivityComponent`     |  `Activity#onCreate()`   |  `Activity#onDestroy()`   |
|     `FragmentComponent`     |  `Fragment#onAttach()`   |  `Fragment#onDestroy()`   |
|       `ViewComponent`       |      `View#super()`      |        视图销毁时         |
| `ViewWithFragmentComponent` |      `View#super()`      |        视图销毁时         |
|     `ServiceComponent`      |   `Service#onCreate()`   |   `Service#onDestroy()`   |

**注意**：`ActivityRetainedComponent` 在配置更改后仍然存在，因此它在第一次调用 `Activity#onCreate()` 时创建，在最后一次调用 `Activity#onDestroy()` 时销毁。



#### 3.3 组件作用域

默认情况下，Hilt 中的所有绑定都未限定作用域。这意味着，每当应用请求绑定注入依赖时，Hilt 都会创建所需类型的一个新实例。

不过，==Hilt 也允许将绑定的作用域限定为特定组件，在该组件对应的 Android 类实例中获取到的此绑定都为单例==。

下表列出了生成的每个组件对应的作用域注解：

|                 Android 类                 |         生成的组件          |          作用域          |
| :----------------------------------------: | :-------------------------: | :----------------------: |
|               `Application`                |   `ApplicationComponent`    |       `@Singleton`       |
|                `View Model`                | `ActivityRetainedComponent` | `@ActivityRetainedScope` |
|                 `Activity`                 |     `ActivityComponent`     |    `@ActivityScoped`     |
|                 `Fragment`                 |     `FragmentComponent`     |    `@FragmentScoped`     |
|                   `View`                   |       `ViewComponent`       |      `@ViewScoped`       |
| 带有 `@WithFragmentBindings` 注释的 `View` | `ViewWithFragmentComponent` |      `@ViewScoped`       |
|                 `Service`                  |     `ServiceComponent`      |     `@ServiceScoped`     |

注意：==Hilt 模块中绑定的作用域要与模块安装到的组件一致==。如：绑定作用域为 `@Singleton`，那么模块则需要 `@InstallIn(ApplicationComponent::class)`



例如，对上面的 AnalyticsAdapter 类型限定作用域如下：

```kotlin
@ActivityScoped
class AnalyticsAdapter @Inject constructor(
  private val service: AnalyticsService
) { ... }
```

这时我们在同一 Activity 实例的生命周期内获取到的 AnalyticsAdapter 都会为同一对象，如果没有 `@ActivityScoped` 注解则每次获取到的都为不同对象。



#### 3.4 组件层次结构

将模块安装到组件后，其绑定就可以用作该组件中其他绑定的依赖项，也可以用作组件层次结构中该组件下的任何子组件中其他绑定的依赖项：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/Hilt%20%E7%94%9F%E6%88%90%E7%9A%84%E7%BB%84%E4%BB%B6%E7%9A%84%E5%B1%82%E6%AC%A1%E7%BB%93%E6%9E%84.png" alt="Hilt 生成的组件的层次结构" style="zoom:120%;" />

**注意**：默认情况下，如果在 View 中执行字段注入，`ViewComponent` 可以使用 `ActivityComponent` 中定义的绑定。如果还需要使用 `FragmentComponent` 中定义的绑定并且该 view 是 Fragment 的一部分，应将 `@WithFragmentBindings` 注释和 `@AndroidEntryPoint` 一起使用。



------



### 4. 在 Hilt 不支持的类中注入依赖项

Hilt 支持最常见的 Android 类。不过，有时我们可能需要在 Hilt 不支持的类中执行依赖注入。

这时候就需要使用 `@EntryPoint` 注解创建入口点，入口点允许 Hilt 使用它并不管理的代码提供依赖关系图中的依赖项。

注意：==入口点类似于模块，都是针对提供绑定的方式，安装到组件后，组件就拥有入口点中的所有依赖，需要在 Hilt不支持生成组件的类中手动调用相应的方法获取相关组件的指定依赖，这其实严格来说不能算作自动依赖注入。==

主要有以下几种不同的方法获取相应的依赖：

-   `EntryPointAccessors.fromApplication(Context context, Class<T> entryPoint)`
-   `EntryPointAccessors.fromActivity(Activity activity, Class<T> entryPoint) `
-   `EntryPointAccessors.fromFragment(Fragment fragment, Class<T> entryPoint)`
-   `EntryPointAccessors.fromView(View view, Class<T> entryPoint)`



例如，Hilt 并不直接支持内容提供器，如果需要在它内部使用 Hilt 来进行依赖注入，则需要为所需的每个绑定类型定义一个带有 `@EntryPoint` 注解的接口并添加限定符。然后，添加 `@InstallIn` 来指定要在其中安装入口点的组件，如下所示：

```kotlin
  @EntryPoint
  @InstallIn(ApplicationComponent::class)
  interface ExampleContentProviderEntryPoint {
    fun analyticsService(): AnalyticsService
  }
```

若想访问入口点，使用来自 `EntryPointAccessors` 的适当静态方法，==参数应该是组件实例或充当组件持有者的 `@AndroidEntryPoint` 对象，确保以参数形式传递的组件和使用的 `EntryPointAccessors` 静态方法都与 `@EntryPoint` 接口上的 `@InstallIn` 注解中的 Android 类匹配==：

```kotlin
class ExampleContentProvider: ContentProvider() {
    ...

  override fun query(...): Cursor {
    val appContext = context?.applicationContext ?: throw IllegalStateException()
    val hiltEntryPoint =
      EntryPointAccessors.fromApplication(appContext, ExampleContentProviderEntryPoint::class.java)

    val analyticsService = hiltEntryPoint.analyticsService()
    ...
  }
}
```

在该例中，我们必须使用 `ApplicationContext` 检索入口点，因为入口点安装在 `ApplicationComponent` 中。如果检索的绑定位于 `ActivityComponent` 中，应改用 `ActivityContext`，同时也应该调用 `EntryPointAccessors.fromActivity(...)` 方法。



关于 EntryPoint 的使用注意点，以如下代码为例：

```kotlin
@InstallIn(SingletonComponent::class)
@EntryPoint
interface TestEntryPoint {

   val entryPointName: String

   @ProvideQualifier
   fun getEntryPoint(): TestEntryPoint
}
```

1.  入口点中的所有方法都要提供绑定，如：上方的 `entryPointName` 虽然是属性，但也要提供绑定；
2.  提供绑定的方式与正常一致，有构造函数的使用 `@Inject`，无构造函数的通过 `@Module` ；
3.  方法上也可以使用限定符获取指定的依赖类型。

总结：入口点中的方法能直接指定具体类型的就使用具体类型（即构造函数可直接绑定），否则需要使用限定符注解同时又要调用指定方法，多此一举。



------



### 5. Hilt 的使用总结

Hilt 的使用主要有以下步骤：

1.  添加 Hilt 依赖

2.  定义生成 Hilt 组件

3.  提供 Hilt 绑定

4.  进行依赖注入

    

具体如下图所示：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/Hilt%20%E5%AE%9E%E7%8E%B0%E4%BE%9D%E8%B5%96%E6%B3%A8%E5%85%A5.png" alt="Hilt 实现依赖注入"  />

<center>高清图请点击<a href="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/Hilt%20%E5%AE%9E%E7%8E%B0%E4%BE%9D%E8%B5%96%E6%B3%A8%E5%85%A5.png">Hilt 实现依赖注入</a></center>



------



### 6. Hilt 对 Jetpack 组件的支持

Hilt 包含一些扩展，用于提供支持其他 Jetpack 库中的类。Hilt 目前支持以下 Jetpack 组件：

- `ViewModel`
- `WorkManager`

在添加 hilt 对相关 jetpack 组件的支持之前，确保应用已经[添加 Hilt 依赖](#2.1 添加依赖项)。



#### 6.1 使用 Hilt 注入 ViewModel

首先添加下面的依赖，启用 Hilt 对 ViewModel 的支持：

```groovy
dependencies {
  ...
  implementation 'androidx.hilt:hilt-lifecycle-viewmodel:1.0.0-alpha01'
  kapt 'androidx.hilt:hilt-compiler:1.0.0-alpha01' // 该注解处理器在 Hilt 注解处理器的基础上运行
}
```

在 `ViewModel` 对象的构造函数中使用 `@ViewModelInject` 注解来提供绑定一个 [`ViewModel`](https://developer.android.google.cn/topic/libraries/architecture/viewmodel)，同时还必须使用 `@Assisted` 为 `SavedStateHandle` 依赖项添加注解：

```kotlin
class ExampleViewModel @ViewModelInject constructor(
  private val repository: ExampleRepository,
  @Assisted private val savedStateHandle: SavedStateHandle
) : ViewModel() {
  ...
}
```

然后，带有 `@AndroidEntryPoint` 注解的 Activity 或 Fragment 可以使用 `ViewModelProvider` 或 `by viewModels()` [KTX 扩展](https://developer.android.google.cn/kotlin/ktx)照常获取 `ViewModel` 实例：

```kotlin
@AndroidEntryPoint
class ExampleActivity : AppCompatActivity() {
  private val exampleViewModel: ExampleViewModel by viewModels()
  ...
}
```

这时我们获取到的 ViewModel 对象其中相关的依赖也会自动注入。



#### 6.2 使用 Hilt 注入 WorkManager

类似，首先添加 Hilt 对 WorkManager 支持的依赖：

```groovy
dependencies {
  ...
  implementation 'androidx.hilt:hilt-work:1.0.0-alpha01'
  kapt 'androidx.hilt:hilt-compiler:1.0.0-alpha01'
}
```

在 `Worker` 对象的构造函数中使用 `@WorkerInject` 注解来注入绑定一个 [`Worker`](https://developer.android.google.cn/reference/kotlin/androidx/work/Worker)。同时只能在 `Worker` 对象中使用 `@Singleton` 作用域或者不限定作用域，还必须使用 `@Assisted` 为 `Context` 和 `WorkerParameters` 依赖项添加注解：

```kotlin
class ExampleWorker @WorkerInject constructor(
  @Assisted appContext: Context,
  @Assisted workerParams: WorkerParameters,
  workerDependency: WorkerDependency
) : Worker(appContext, workerParams) { ... }
```

然后，让 `Application` 类实现 `Configuration.Provider` 接口，注入 `HiltWorkFactory` 的实例，并将其传入 `WorkManager` 配置，如下所示：

```kotlin
@HiltAndroidApp
class ExampleApplication : Application(), Configuration.Provider {

  @Inject lateinit var workerFactory: HiltWorkerFactory  

  override fun getWorkManagerConfiguration() =
      Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .build()
}
```

