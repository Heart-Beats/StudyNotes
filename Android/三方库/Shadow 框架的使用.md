## Shadow 框架的插件化原理及集成使用

[toc]



### 1. Shadow 框架的简介



Shadow 是腾讯开源的一款插件化框架，开源地址：https://github.com/Tencent/Shadow。

其原理是使用宿主代理的方式实现组件的生命周期。它主要有两个最大的两个亮点：

1.  零反射

2.  框架自身动态化

    

------



### 2. 框架结构分析

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/tstmp_20210621104350.png" alt="tstmp_20210621104350" style="zoom:67%;" />

<center>框架结构图</center>



#### 2.1 主要类说明

-   **PluginContainerActivity** ：代理 Activity
-   **ShadowActivity**：插件 Activity 统一父类，在打包时通过 Transform 统一替换
-   **ComponentManager**：管理插件和宿主代理的对应关系
-   **PluginManager**：装载插件
-   **PluginLoader**：管理插件 Activity 生命周期等等



#### 2.2 插件 Activity 的实现

主要看以下几个地方：

1.  如何替换插件 Activity 的父类
2.  宿主中如何启动插件 Activity
3.  插件中如何启动插件 Activity



##### 2.2.1 替换插件 Activity 的父类

Shadow 中有一个比较巧妙的地方，就是插件开发的时候，插件的 Activity 还是正常继承 Activity，在打包的时候，会通过 Transform 替换其父类为 ShadowActivity。

projects/sdk/core/transform 和 projects/sdk/core/transform-kit 两个项目就是 Transform，入口是 ShadowTransform。这里对 Transform 做了一些封装，提供了友好的开发方式，这里就不多做分析了，我们主要看下 TransformManager。

```kotlin
class TransformManager(ctClassInputMap: Map<CtClass, InputClass>,
                       classPool: ClassPool,
                       useHostContext: () -> Array<String>
) : AbstractTransformManager(ctClassInputMap, classPool) {

    override val mTransformList: List<SpecificTransform> = listOf(
            ApplicationTransform(),
            ActivityTransform(),
            ServiceTransform(),
            InstrumentationTransform(),
            RemoteViewTransform(),
            FragmentTransform(ctClassInputMap),
            DialogTransform(),
            WebViewTransform(),
            ContentProviderTransform(),
            PackageManagerTransform(),
            KeepHostContextTransform(useHostContext())
    )
}
```

这里的 mTransformList 就是要依次执行的 Transform 内容，也就是需要替换的类映射。我们以 ApplicationTransform 和 ActivityTransform 为例：

```kotlin
class ApplicationTransform : SimpleRenameTransform(
        mapOf(
                "android.app.Application"
                        to "com.tencent.shadow.core.runtime.ShadowApplication"
                ,
                "android.app.Application\$ActivityLifecycleCallbacks"
                        to "com.tencent.shadow.core.runtime.ShadowActivityLifecycleCallbacks"
        )
)

class ActivityTransform : SimpleRenameTransform(
        mapOf(
                "android.app.Activity"
                        to "com.tencent.shadow.core.runtime.ShadowActivity"
        )
)
```

可以看到，打包过程中，插件的 Application 会被替换成 ShadowApplication，Activity 会被替换成 ShadowActivity，这里主要看一下 ShadowActivity 的继承关系：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210621105413840.png" alt="image-20210621105413840" style="zoom:67%;" />

为何插件 Activity 可以不用继承 Activity 呢？因为在代理 Activity 的方式中，插件 Activity 是被当作一个普通类来使用的，只要负责执行对应的生命周期即可。



##### 2.2.2 宿主中如何启动插件 Activity

宿主中启动插件 Activity 原理如下图：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210621105559309.png" alt="image-20210621105559309" style="zoom:67%;" />



核心代码实现：

```java
class SamplePluginManager extends FastPluginManager {
    public void enter(final Context context, long fromId, Bundle bundle, final EnterCallback callback) {
        // ...
        // 启动 Activity
        onStartActivity(context, bundle, callback);
        // ...
    }

    private void onStartActivity(final Context context, Bundle bundle, final EnterCallback callback) {
        // ...
        final String className = bundle.getString(Constant.KEY_ACTIVITY_CLASSNAME);
        // ...
        final Bundle extras = bundle.getBundle(Constant.KEY_EXTRAS);
        if (callback != null) {
            // 创建 loading view
            final View view = LayoutInflater.from(mCurrentContext).inflate(R.layout.activity_load_plugin, null);
            callback.onShowLoadingView(view);
        }
        executorService.execute(new Runnable() {
            @Override
            public void run() {
                // ...
                // 加载插件
                InstalledPlugin installedPlugin = installPlugin(pluginZipPath, null, true);
                // 创建插件 Intent
                Intent pluginIntent = new Intent();
                pluginIntent.setClassName(
                        context.getPackageName(),
                        className
                );
                if (extras != null) {
                    pluginIntent.replaceExtras(extras);
                }
                // 启动插件 Activity
                startPluginActivity(context, installedPlugin, partKey, pluginIntent);
                // ...
            }
        });
    }
}
```

在 SamplePluginManager.enter 中，调用 onStartActivity 启动插件 Activity，其中开线程去加载插件，然后调用 startPluginActivity。
startPluginActivity 实现在其父类 FastPluginManager 里：

```java
class FastPluginManager {
    public void startPluginActivity(Context context, InstalledPlugin installedPlugin, String partKey, Intent pluginIntent) throws RemoteException, TimeoutException, FailedException {
        Intent intent = convertActivityIntent(installedPlugin, partKey, pluginIntent);
        if (!(context instanceof Activity)) {
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        }
		mPluginLoader.startActivityInPluginProcess(intent);	
    }
}
```

其中的重点是 convertActivityIntent，将插件 intent 转化成宿主的 intent，然后调用 mPluginLoader.startActivityInPluginProcess(intent)  通过 AMS 启动插件。
下面重点看看 convertActivityIntent 的实现：

```java
class FastPluginManager {
    public Intent convertActivityIntent(InstalledPlugin installedPlugin, String partKey, Intent pluginIntent) throws RemoteException, TimeoutException, FailedException {
        // 创建 mPluginLoader
        loadPlugin(installedPlugin.UUID, partKey);
        // 先调用 Application onCreate 方法
        mPluginLoader.callApplicationOnCreate(partKey);
        // 转化插件 intent 为 代理 Activity intent
        return mPluginLoader.convertActivityIntent(pluginIntent);
    }
}
```

这里涉及到了 Binder 的使用，需要了解 Binder 相关的知识，代码比较繁琐，这里就不具体分析代码实现了，用一张图理顺一下对应的关系：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210621110923720.png" alt="image-20210621110923720" style="zoom:67%;" />

可以简单的理解为，调用 mPluginLoader 中的方法，就是调用 DynamicPluginLoader 中的方法，调用 mPpsController 的方法，就是调用 PluginProcessService 中的方法。

所以这里的 mPluginLoader.convertActivityIntent 相当于调用了 DynamicPluginLoader.convertActivityIntent：

```kotlin
internal class DynamicPluginLoader(hostContext: Context, uuid: String) {
    fun convertActivityIntent(pluginActivityIntent: Intent): Intent? {
        return mPluginLoader.mComponentManager.convertPluginActivityIntent(pluginActivityIntent)
    }
}
```

最终调用到了 ComponentManager.convertPluginActivityIntent 方法：

```kotlin
abstract class ComponentManager : PluginComponentLauncher {
    override fun convertPluginActivityIntent(pluginIntent: Intent): Intent {
        return if (pluginIntent.isPluginComponent()) {
            pluginIntent.toActivityContainerIntent()
        } else {
            pluginIntent
        }
    }

    private fun Intent.toActivityContainerIntent(): Intent {
        val bundleForPluginLoader = Bundle()
        val pluginComponentInfo = pluginComponentInfoMap[component]!!
        bundleForPluginLoader.putParcelable(CM_ACTIVITY_INFO_KEY, pluginComponentInfo)
    }

    private fun Intent.toContainerIntent(bundleForPluginLoader: Bundle): Intent {
        val className = component.className!!
        val packageName = packageNameMap[className]!!
        component = ComponentName(packageName, className)
        val containerComponent = componentMap[component]!!
        val businessName = pluginInfoMap[component]!!.businessName
        val partKey = pluginInfoMap[component]!!.partKey

        val pluginExtras: Bundle? = extras
        replaceExtras(null as Bundle?)

        val containerIntent = Intent(this)
        containerIntent.component = containerComponent

        bundleForPluginLoader.putString(CM_CLASS_NAME_KEY, className)
        bundleForPluginLoader.putString(CM_PACKAGE_NAME_KEY, packageName)

        containerIntent.putExtra(CM_EXTRAS_BUNDLE_KEY, pluginExtras)
        containerIntent.putExtra(CM_BUSINESS_NAME_KEY, businessName)
        containerIntent.putExtra(CM_PART_KEY, partKey)
        containerIntent.putExtra(CM_LOADER_BUNDLE_KEY, bundleForPluginLoader)
        containerIntent.putExtra(LOADER_VERSION_KEY, BuildConfig.VERSION_NAME)
        containerIntent.putExtra(PROCESS_ID_KEY, DelegateProviderHolder.sCustomPid)
        return containerIntent
    }
}
```

在 toContainerIntent 中，创建了新的 宿主代理 Activity 的 intent，这里的 containerComponent 对应的就是前面在 Manifest 里注册的 PluginDefaultProxyActivity，返回代理 activity intent 以后，调用 mPluginLoader.startActivityInPluginProcess(intent) 最终就会由 AMS 启动了代理 Activity。
PluginDefaultProxyActivity 继承自 PluginContainerActivity，这个也就是整个框架的代理 Activity，在 PluginContainerActivity 里，就是常规的分发生命周期了。中间通过 HostActivityDelegate 分发生命周期:

```kotlin
class ShadowActivityDelegate(private val mDI: DI) : HostActivityDelegate, ShadowDelegate() {
    // ...
    override fun onCreate(savedInstanceState: Bundle?) {
        // ...
        // 设置 application，resources 等等
        mDI.inject(this, partKey)
        // 创建插件资源
        mMixResources = MixResources(mHostActivityDelegator.superGetResources(), mPluginResources)
        // 设置插件主题
        mHostActivityDelegator.setTheme(pluginActivityInfo.themeResource)
        try {
            val aClass = mPluginClassLoader.loadClass(pluginActivityClassName)
            // 创建插件 activity
            val pluginActivity = PluginActivity::class.java.cast(aClass.newInstance())
            // 初始化插件 activity
            initPluginActivity(pluginActivity)
            mPluginActivity = pluginActivity
            //设置插件AndroidManifest.xml 中注册的WindowSoftInputMode
            mHostActivityDelegator.window.setSoftInputMode(pluginActivityInfo.activityInfo.softInputMode)
            // 获取 savedInstanceState
            val pluginSavedInstanceState: Bundle? = savedInstanceState?.getBundle(PLUGIN_OUT_STATE_KEY)
            pluginSavedInstanceState?.classLoader = mPluginClassLoader
            // 调用插件 activity onCreate 
            pluginActivity.onCreate(pluginSavedInstanceState)
            mPluginActivityCreated = true
        } catch (e: Exception) {
            throw RuntimeException(e)
        }
    }

    // 获取插件资源
    override fun getResources(): Resources {
        if (mDependenciesInjected) {
            return mMixResources;
        } else {
            return Resources.getSystem()
        }
    }
}
```



##### 2.2.3 插件中如何启动插件 Activity

上面说到过，插件 Activity 会在打包过程中替换其父类为 ShadowActivity，很明显了，在插件中启动 Activity 即调用 startActivity，自然就是调用 ShadowActivity 的 startActivity 了。startActivity 在其父类 ShadowContext 里实现，我们来具体看下：

```kotlin
class ShadowContext extends SubDirContextThemeWrapper {
    public void startActivity(Intent intent) {
        final Intent pluginIntent = new Intent(intent);
        // ...
        final boolean success = mPluginComponentLauncher.startActivity(this, pluginIntent);
        // ...
    }
}
```

可以看到，是通过 mPluginComponentLauncher.startActivity 继续调用的，mPluginComponentLauncher 就是 ComponentManager 的一个实例，是在前面说到的初始化插件 Activity 的时候设置的。内部实现就比较简单了：

```java
abstract class ComponentManager : PluginComponentLauncher {
    override fun startActivity(shadowContext: ShadowContext, pluginIntent: Intent): Boolean {
        return if (pluginIntent.isPluginComponent()) {
            shadowContext.superStartActivity(pluginIntent.toActivityContainerIntent())
            true
        } else {
            false
        }
    }
}

public class ShadowContext extends SubDirContextThemeWrapper {
    public void superStartActivity(Intent intent) {
        // 调用系统 startActivity
        super.startActivity(intent);
    }
}
```

通过调用 toActivityContainerIntent 转化 intent 为代理 Activity 的 intent，然后调用系统 startActivity 启动代理 Activity，剩下的步骤就和上面宿主启动插件 Activity 中讲到的一样了。

到现在，我们就对框架中 Activity 的启动基本了解了。



#### 2.3 Service 实现



Service 的实现，我们直接看 插件中如何启动的即可。看一下 ShadowContext 中的 startService 实现：

```java
public class ShadowContext extends SubDirContextThemeWrapper {
    public ComponentName startService(Intent service) {
        if (service.getComponent() == null) {
            return super.startService(service);
        }
        Pair<Boolean, ComponentName> ret = mPluginComponentLauncher.startService(this, service);
        if (!ret.first)
            return super.startService(service);
        return ret.second;
    }
}
```

也是调用 mPluginComponentLauncher.startService，这里我们就比较熟悉了，就是 ComponentManager.startService：

```kotlin
abstract class ComponentManager : PluginComponentLauncher {
    override fun startService(context: ShadowContext, service: Intent): Pair<Boolean, ComponentName> {
        if (service.isPluginComponent()) {
            // 插件service intent不需要转换成container service intent，直接使用intent
            val component = mPluginServiceManager!!.startPluginService(service)
            // ...
        }
        return Pair(false, service.component)
    }
}
```

这里直接调用 PluginServiceManager.startPluginService：

```kotlin
class PluginServiceManager(private val mPluginLoader: ShadowPluginLoader, private val mHostContext: Context) {
    fun startPluginService(intent: Intent): ComponentName? {
        val componentName = intent.component
        // 检查所请求的service是否已经存在
        if (!mAliveServicesMap.containsKey(componentName)) {
            // 创建 Service 实例并调用 onCreate 方法
            val service = createServiceAndCallOnCreate(intent)
            mAliveServicesMap[componentName] = service
            // 通过startService启动集合
            mServiceStartByStartServiceSet.add(componentName)
        }
        mAliveServicesMap[componentName]?.onStartCommand(intent, 0, getNewStartId())
        return componentName
    }

    private fun createServiceAndCallOnCreate(intent: Intent): ShadowService {
        val service = newServiceInstance(intent.component)
        service.onCreate()
        return service
    }
}
```

可以看到，在 Shadow 中对 Service 的处理很简单，直接调用其生命周期方法。



#### 2.4 BroadcastReceiver 实现

广播的实现也比较常规，在插件中动态注册和发送广播，直接调用系统的方法即可，因为广播不涉及生命周期等复杂的内容。需要处理的就是在 Manifest 中静态注册的广播。这个理论上也和我们之前讲解 [插件化原理](https://juejin.im/post/5d235f8b51882554c007af06) 时候实现基本一致，解析 Manifest 然后进行动态注册。不过在 Shadow 的 demo 里，并没有做解析，就是直接写在了代码里。

```java
//宿主的 AndroidManifest.xml
        <receiver android:name="com.tencent.shadow.sample.plugin.app.lib.usecases.receiver.MyReceiver">
            <intent-filter>
                <action android:name="com.tencent.test.action" />
            </intent-filter>
        </receiver>

// SampleComponentManager
public class SampleComponentManager extends ComponentManager {
    
    public List<BroadcastInfo> getBroadcastInfoList(String partKey) {
        List<ComponentManager.BroadcastInfo> broadcastInfos = new ArrayList<>();
        if (partKey.equals(Constant.PART_KEY_PLUGIN_MAIN_APP)) {
            broadcastInfos.add(
                    new ComponentManager.BroadcastInfo(
                            "com.tencent.shadow.sample.plugin.app.lib.usecases.receiver.MyReceiver",
                            new String[]{"com.tencent.test.action"}
                    )
            );
        }
        return broadcastInfos;
    }
}
```



#### 2.5 ContentProvider 实现

关于 ContentProvider 的实现，其实和之前 [插件化原理](https://juejin.im/post/5d235f8b51882554c007af06) 文章中思路是一致的，也是通过注册代理 ContentProvider 然后分发给插件 Provider，这里就不多做介绍了。



------



### 3. Shadow 的集成使用



#### 3.1 环境准备

1.  克隆仓库：`git clone git@github.com:Tencent/Shadow.git`

2.  编译代码，建议先在命令行编译一次：

    -   在编译前，**必须**设置 `ANDROID_HOME` 环境变量。

    -   在编译时，**必须**使用 `gradlew` 脚本，以保证采用了项目配置的Gradle版本，即命令行运行：

        ```shell
        ./gradlew build
        ```

    过程中没有出错即代表编译成功，后续即可使用 Gradle 的 task 进行发布：

    <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/shadow-publish.gif" alt="shadow-publish" style="zoom: 80%;" />

    该任务执行完成之后就可以在项目中使用 Shadow 相关的 SDK。

3.  修改发布相关的配置以及查看版本号

    -   修改发布配置

        `buildScripts/gradle/maven.gradle `文件中配置了Shadow的Maven发布脚本，可以修改其中的两个 GroupID 变量：`coreGroupId`、`dynamicGroupId` 以及 `setScm` 方法中的两个URL到自己的版本库地址。

        还可以将 `mavenLocal()` 改为自己发布的目标 Maven 仓库，之后执行 `./gradlew publish` 即可将 Shadow SDK 发布到 Maven 仓库。

        

    -   查看版本号

        构建的版本号可以在 `build/pom` 目录中查看生成的 pom 文件中查看，如：

        <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210719111017658.png" alt="image-20210719111017658" style="zoom: 80%;" />

        上图即可看出发布的构建 name 为 `activity-container`， group 为 `com.tencent.shadow.core.test`， version 为 `local-e66e0bb4-SNAPSHOT`，即后续若想依赖它，则相关的坐标就是：`com.tencent.shadow.core.test:activity-container:local-e66e0bb4-SNAPSHOT`



#### 3.2 项目接入

前面介绍的是初始化 Shadow 的相关配置，如果远程仓库上有相关版本而且无需修改可以直接依赖时，可以忽略它。

接下来看看应该如何在项目中使用它？



##### 3.2.1  宿主

首先，需要清楚 Shadow 的框架结构，不了解的可查看 [ Shadow 框架结构分析](#2. 框架结构分析) 其中的图例。

为了方便使用，我给 Shadow 单独封装了模块，示例可见 [Shadow 模块](https://github.com/Heart-Beats/AndroidApplicationTest/tree/master/shadow)，下面介绍其中相关的结构 ：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210719113239860.png" alt="image-20210719113239860"  />

如图所示，主要分为三部分：

-   plugin-aidl：

    主要为了实现宿主与插件进行双向通信的 AIDL 接口，因为宿主与插件属于不同进程。

    

-   plugin-manager：

    该部分对应 [Shadow 框架结构](#2. 框架结构分析) 中的 PluginManager 部分，主要通过它来实现插件的管理。在这里需要注意 `com.tencent.shadow.dynamic.impl`  下的两个类：`ManagerFactoryImpl` 和 `WhiteList`，它们的包名和类名必须固定，前者会找到 PluginManager  的动态实现，后者为 PluginManager  下配置的白名单，白名单中都为包名，PluginManager 可以加载宿主中位于白名单内的类。

    

    在这里你可能会想到为啥这两个类的包名和类名需要固定以及为啥需要白名单？

    1.  这两个类在 Shadow 框架中是通过反射进行处理的，具体可见 [`ManagerImplLoader.MANAGER_FACTORY_CLASS_NAME` ](https://github.com/Tencent/Shadow/blob/89a753c50ab542ac1d2aa5f88cc828221f2e00ba/projects/sdk/dynamic/dynamic-host/src/main/java/com/tencent/shadow/dynamic/host/ManagerImplLoader.java#L28) 以及 [`ImplLoader.WHITE_LIST_CLASS_NAME` ](https://github.com/Tencent/Shadow/blob/89a753c50ab542ac1d2aa5f88cc828221f2e00ba/projects/sdk/dynamic/dynamic-host/src/main/java/com/tencent/shadow/dynamic/host/ImplLoader.java#L28) 对其相关的处理。
    2.  从图中可以看出 `plugin-manager` 其实是个应用模块，它会打包成 APK 然后在宿主中通过 Shadow 装载它，因此它与宿主也不在同一进程中，因此这就意味着：宿主与它都有单独的 ClassLoader 。正常情况下是无法直接宿主中的类，不过通过 Shadow 在 PluginManager 中给其添加白名单，就可访问宿主中的相关类。

    如果无需对插件实现特殊管理，此模块中的内容不建议修改。

    

    在此模块中，PluginManager  的动态实现类为 `MyPluginManager`，它继承自 `PluginManagerThatUseDynamicLoader`，由上层父类中定义的有一个抽象方法需要实现：

    ```java
    // PluginManagerThatUseDynamicLoader extends BasePluginManager
    public abstract class BasePluginManager {
        
        ...
        
        /**
         * PluginManager的名字
         * 用于和其他 PluginManager 区分持续化存储的名字
         */
        abstract protected String getName();
        
        ...
    }
    ```

    PluginManager  在解压插件压缩包读取相关信息时会创建数据库并存入相关信息，此过程中会根据该方法的返回值创建相关的数据库名字。因此不同的 PluginManager  需要不同的名字，避免数据混乱。



-   shadow-init:

    该模块才是真正意义上对 Shadow 接入的封装，看看有哪些比较重要的部分吧！

    -   logger 包：该包中的类用于实现 Shadow 运行过程中的相关日志打印
    -   managerupdater 包：其中主要实现 PluginManagerUpdater 接口，实现 PluginManager 的动态更新
    -   `MainPluginProcessService` 类：继承自 `PluginProcessService`，为 [Shadow 框架结构](#2. 框架结构分析) 中的 PluginProcessService 部分，内容可为空。
    -   `Shadow` 类：主要实现 PluginManager 的初始化以及该对象的获取

    其中需要注意的是：MainPluginProcessService 为四大组件的 Service，需要在 AndroidManifest.xml 中注册，其实该文件中还有其他比较重要的部分，看看该模块中的此组件是怎样的？

    ```xml
    <?xml version="1.0" encoding="utf-8"?>
    <manifest xmlns:android="http://schemas.android.com/apk/res/android"
        package="com.hl.shadow">
    
        <application
            android:allowBackup="true"
            android:allowClearUserData="true"
            android:largeHeap="true"
            android:supportsRtl="true">
    
    
            <!--dynamic activity 注册
              注意 configChanges 需要全注册
              theme需要注册成透明
              -->
    
            <activity
                android:name="com.hl.my_runtime.PluginDefaultProxyActivity"
                android:launchMode="standard"
                android:screenOrientation="portrait"
                android:configChanges="mcc|mnc|locale|touchscreen|keyboard|keyboardHidden|navigation|
                                       screenLayout|fontScale|uiMode|orientation|screenSize|smallestScreenSize|layoutDirection"
                android:hardwareAccelerated="true"
                android:theme="@style/PluginContainerActivity"
                android:multiprocess="true"
                android:process=":plugin" />
    
            <activity
                android:name="com.hl.my_runtime.PluginSingleInstance1ProxyActivity"
                android:configChanges="mcc|mnc|locale|touchscreen|keyboard|keyboardHidden|navigation|
                                       screenLayout|fontScale|uiMode|orientation|screenSize|smallestScreenSize|layoutDirection"
                android:hardwareAccelerated="true"
                android:launchMode="singleInstance"
                android:multiprocess="true"
                android:process=":plugin"
                android:screenOrientation="portrait"
                android:theme="@style/PluginContainerActivity" />
    
            <activity
                android:name="com.hl.my_runtime.PluginSingleTask1ProxyActivity"
                android:configChanges="mcc|mnc|locale|touchscreen|keyboard|keyboardHidden|navigation|
                                       screenLayout|fontScale|uiMode|orientation|screenSize|smallestScreenSize|layoutDirection"
                android:hardwareAccelerated="true"
                android:launchMode="singleTask"
                android:multiprocess="true"
                android:process=":plugin"
                android:screenOrientation="portrait"
                android:theme="@style/PluginContainerActivity" />
            <!--dynamic activity注册 end -->
    
            <provider
                android:name="com.tencent.shadow.core.runtime.container.PluginContainerContentProvider"
                android:authorities="com.tencent.shadow.contentprovider.authority.dynamic2"
                android:process=":plugin" />
    
            <service
                android:name=".MainPluginProcessService"
                android:process=":plugin" />
        </application>
    
    </manifest>
    ```

    1.  其中的 activity 都为相关的壳子 Activity，具体作用可看 [宿主中如何启动插件 Activity](#2.2.2 宿主中如何启动插件 Activity) 中的原理图
    2.  provider 为 Shadow 框架中已实现的，需要注意 authorities 不可重复
    3.  service 对应 MainPluginProcessService，不再多介绍



##### 3.2.2  插件

首先，也先来认识一下插件工程的结构，如下图：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210719154757401.png" alt="image-20210719154757401"  />

主要有三个不可缺少的部分：

1.  loader

    对应图中的 `my-loader` 模块，其中主要实现插件组件的动态加载。

    需要注意的类为：`com.tencent.shadow.dynamic.loader.impl` 包下的 `CoreLoaderFactoryImpl`，此类的包名与类名也必须固定，具体见

    [`DynamicPluginLoader.CORE_LOADER_FACTORY_IMPL_NAME`](https://github.com/Tencent/Shadow/blob/89a753c50ab542ac1d2aa5f88cc828221f2e00ba/projects/sdk/dynamic/dynamic-loader-impl/src/main/kotlin/com/tencent/shadow/dynamic/loader/impl/DynamicPluginLoader.kt#L36) 即可了解。

    

    这里还有一个类需要了解一下：MyComponentManager ，它继承自 ComponentManager，主要功能是管理组件和宿主中注册的壳子之间的配对关系，需要实现以下三个方法：

    ```kotlin
    abstract class ComponentManager : PluginComponentLauncher {
        
        // 配置插件 Activity 到代理壳子 Activity 的对应关系
        abstract fun onBindContainerActivity(pluginActivity: ComponentName): ComponentName
    
        // 配置对应宿主中预注册的代理壳子 ContentProvider 的信息
        abstract fun onBindContainerContentProvider(pluginContentProvider: ComponentName): ContainerProviderInfo
    
        // 配置宿主中预注册的壳子 Broadcast 信息，随后会在插件中找到相应的 Receiver 动态注册
        abstract fun getBroadcastInfoList(partKey: String): List<BroadcastInfo>?
    }
    ```

    配置完成之后，Shadow 即可使用正确的方式启动相关的组件。

    

2.  runtime

    对应图中的 `my-runtime` 模块，其中为相关的代理壳子 Activity 类，并无其他部分。

    这里 `PluginContainerActivity` 的实现类有多个，主要是为了对应不同 launchMode 的 Activity，可视个人情况决定是否需要修改定制。

    

3. plugin

   对应图中的 `plugin` 模块，其中存放相关的插件应用。这里的插件应用与正常的应用并无二样，是可以单独启动运行的。

   那么究竟它是如何能被插件化使用呢？这里就涉及到 Shadow Gradle 的插件，它会在代码编译时通过 Transform 将相关的组件转化为 Shadow 能识别的组件。

   因此，插件中我们需要应用此 Gradle  插件：

   -   添加插件路径地址

       ```groovy
       buildscript {
       	repositories{
       		// shadow repository，即 3.1 环境准备中 Shadow 发布到的仓库地址
       	}
           
          dependencies {
               classpath "com.tencent.shadow.core:gradle-plugin:$shadow_version"
           }
       }
       ```

   -   应用此插件， 这里以 [Shadow 官方 demo 插件中的构建脚本](https://github.com/Tencent/Shadow/blob/master/projects/sample/source/sample-plugin/sample-app/build.gradle) 为例：

       ```groovy
       //app 的 build.gradle
       apply plugin: 'com.android.application'
       apply plugin: 'com.tencent.shadow.plugin' 
       
       android {
           
        	defaultConfig {
               applicationId 'com.tencent.shadow.sample.plugin.app'
           }
           
           // 将插件applicationId设置为和宿主相同
           productFlavors {
               plugin {
                   dimension 'Shadow'
                   applicationId HOST_APP_APPLICATION_ID
               }
           }
           
         //  ...
       }
       
       //...
       
       shadow {
           transform {
       //        useHostContext = ['abc']
           }
       
           packagePlugin {
               pluginTypes {
                   debug {
                       loaderApkConfig = new Tuple2('sample-loader-debug.apk', ':sample-loader:assembleDebug')
                       runtimeApkConfig = new Tuple2('sample-runtime-debug.apk', ':sample-runtime:assembleDebug')
                       pluginApks {
                           pluginApk1 {
                               businessName = 'sample-plugin-app'
                               partKey = 'sample-plugin-app'
                               buildTask = ':sample-app:assemblePluginDebug'
                               apkPath = 'projects/sample/source/sample-plugin/sample-app/build/outputs/apk/plugin/debug/sample-app-plugin-debug.apk'
                               hostWhiteList = ["com.tencent.shadow.sample.host.lib"]
                               dependsOn = ['sample-base']
                           }
                           pluginApk2 {
                               businessName = 'sample-plugin-app2'
                               partKey = 'sample-plugin-app2'
                               buildTask = ':sample-app:assemblePluginDebug'
                               apkPath = 'projects/sample/source/sample-plugin/sample-app/build/outputs/apk/plugin/debug/sample-app-plugin-debug2.apk'
                               hostWhiteList = ["com.tencent.shadow.sample.host.lib"]
                               dependsOn = ['sample-base']
                           }
                           sampleBase {
                               businessName = 'sample-plugin-app'
                               partKey = 'sample-base'
                               buildTask = ':sample-base:assemblePluginDebug'
                               apkPath = 'projects/sample/source/sample-plugin/sample-base/build/outputs/apk/plugin/debug/sample-base-plugin-debug.apk'
                               hostWhiteList = ["com.tencent.shadow.sample.host.lib"]
                           }
                       }
                   }
       
                   release {
                       loaderApkConfig = new Tuple2('sample-loader-release.apk', ':sample-loader:assembleRelease')
                       runtimeApkConfig = new Tuple2('sample-runtime-release.apk', ':sample-runtime:assembleRelease')
                       pluginApks {
                           pluginApk1 {
                               businessName = 'sample-plugin-app'
                               partKey = 'sample-plugin-app'
                               buildTask = ':sample-app:assemblePluginRelease'
                               apkPath = 'projects/sample/source/sample-plugin/sample-app/build/outputs/apk/plugin/release/sample-app-plugin-release.apk'
                               hostWhiteList = ["com.tencent.shadow.sample.host.lib"]
                               dependsOn = ['sample-base']
                           }
                           pluginApk2 {
                               businessName = 'sample-plugin-app2'
                               partKey = 'sample-plugin-app2'
                               buildTask = ':sample-app:assemblePluginRelease'
                               apkPath = 'projects/sample/source/sample-plugin/sample-app/build/outputs/apk/plugin/release/sample-app-plugin-release2.apk'
                               hostWhiteList = ["com.tencent.shadow.sample.host.lib"]
                               dependsOn = ['sample-base']
                           }
                           sampleBase {
                               businessName = 'sample-plugin-app'
                               partKey = 'sample-base'
                               buildTask = ':sample-base:assemblePluginRelease'
                               apkPath = 'projects/sample/source/sample-plugin/sample-base/build/outputs/apk/plugin/release/sample-base-plugin-release.apk'
                               hostWhiteList = ["com.tencent.shadow.sample.host.lib"]
                           }
                       }
                   }
               }
       
               loaderApkProjectPath = 'projects/sample/source/sample-plugin/sample-loader'
               runtimeApkProjectPath = 'projects/sample/source/sample-plugin/sample-runtime'
       
               archiveSuffix = System.getenv("PluginSuffix") ?: ""
               archivePrefix = 'plugin'
               destinationDir = "${getRootProject().getBuildDir()}"
       
               version = 4
               compactVersion = [1, 2, 3]
               uuidNickName = "1.1.5"
           }
       ```

       主要需要注意 `pluginApks{}` 中的内容：
       
       -   pluginApk1、pluginApk2 ：表示插件1、插件2 依次类推
       -   businessName：businessName 相同的插件，context 获取的 Dir 是相同的。businessName 留空，表示和宿主相同业务，直接使用宿主的 Dir
       -   partKey：插件的唯一标识，一个 partKey 需要对应一个唯一的插件
       -   buildTask：对应插件应用的打包任务
       -   apkPath：执行 `buildTask` 后插件 APK 所在的路径
       -   hostWhiteList：白名单，可以用来在插件中加载宿主相关包下的类
       -   dependsOn：该插件运行之前需要依赖的插件
       
       其他的部分一般采用默认值即可，无需修改。同步之后命令行执行：
       
       ```shell
       ./gradlew packageDebugPlugin 
       
       #或
       
       ./gradlew packageReleasePlugin 
       ```
       
       即可在根项目下的 build 目录中生成对应的 `plugin-debug.zip` 或 `plugin-release.zip` 压缩包。
       
       

4.  plugin-aidl 

    相关的 AIDL 模块，需要和宿主中的 AIDL  模块保持一致，主要是为了实现宿主和插件的双向通信，这里不作过多展开介绍。感兴趣的读者需要自行了解一下 AIDL 的相关知识，使用示例可参考 [TestService](https://github.com/Heart-Beats/ShadowPlugin/blob/main/plugin/test/src/main/java/com/hl/myplugin/TestService.kt) 中的相关部分。



##### 3.2.3 宿主中启动插件

经过前番折腾，宿主和插件中相应的工作已经准备完毕了，这时候就可以启动插件，在启动插件之前需要在应用初始化时初始化 PluginManager，如下：

```kotlin
class MyApplication : Application() {

    override fun onCreate() {
        //...
        
        if (mApplication.isProcess(":plugin")) {
            // 插件进程也有 log 打印需要初始化
            LoggerFactory.setILoggerFactory(AndroidLoggerFactory.getInstance())

            //在全动态架构中，Activity组件没有打包在宿主而是位于被动态加载的 runtime，
            //为了防止插件crash后，系统自动恢复crash前的Activity组件，此时由于没有加载runtime而发生classNotFound异常，导致二次crash
            //因此这里恢复加载上一次的runtime
            DynamicRuntime.recoveryRuntime(mApplication)

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                WebView.setDataDirectorySuffix("plugin")
            }
        } else {
            //PluginManager.apk文件路径
            this.assets.list("plugins")?.first { it.contains("My-PluginManager") }?.also { pluginManagerName ->
                val pluginManagerSavePath =
                    File(this.getExternalFilesDir(null), "plugins/$pluginManagerName").absolutePath
                val pluginManagerZipPath =
                    this.putFileOfAssetsToPath("plugins/$pluginManagerName", pluginManagerSavePath)
                Shadow.initDynamicPluginManager(pluginManagerZipPath)
            }
        }
        
        //...        
    }
}
```

这里将打包的 PluginManager APK 放在应用的 Assets/plugins 的目录下，并在运行时存放到应用私有文件目录下并初始化 PluginManager。



PluginManager 初始化就可以在想要启动 Shadow 插件的地方调用其 enter 方法，该方法定义如下：

```java
public interface PluginManager {

    /**
     * @param context context
     * @param formId  标识本次请求的来源位置，用于区分入口
     * @param bundle  参数列表
     * @param callback 用于从PluginManager实现中返回View
     */
    void enter(Context context, long formId, Bundle bundle, EnterCallback callback);
}
```

其中 formId 可以用来区分启动插件中的 Activity 还是 Service，为了方便起见，我对 bundle 中的相关 Key 作了定义，`MyPluginManager` 中会读取相关 Key 的数据并作处理。目前  定义的 Key  如下：

```kotlin
object Constant {
	/**
     * 插件 apk/zip 路径
     */
    const val KEY_PLUGIN_ZIP_PATH = "pluginZipPath"

    /**
     * partKey 用来区分入口， 用来实现多个插件不同的加载
     */
    const val KEY_PLUGIN_PART_KEY = "KEY_PLUGIN_PART_KEY"

    /**
     * 启动的插件 Activity 或 Service 路径
     */
    const val KEY_CLASSNAME = "KEY_CLASSNAME"

    /**
     * 需要传入到启动插件里的参数，为 Bundle，它会传递存放在启动的 Intent 的 extras 字段中
     */
    const val KEY_EXTRAS = "KEY_EXTRAS"

    /**
     * 打开 Activity 传入的 formId
     */
    const val FROM_ID_START_ACTIVITY = 1001L

    /**
     * 打开 Service 传入的 formId
     */
    const val FROM_ID_CALL_SERVICE = 1002L

    /**
     *  启动 Intent 的 action
     */
    const val KEY_INTENT_ACTION = "KEY_INTENT_ACTION"
}
```

根据以上的 key 传入对应的数据，宿主和插件中相关的设置没有任何问题，即可正常启动插件，同时传入的 EnterCallback 对象的 `onEnterComplete` 方法会得到回调。怎么样？是不是感觉虽然有些麻烦但还是比较简单的，当你接入 Shadow 并能成功启动相关插件时，相信你会享受它的神奇的！





#### 3.3 集成使用注意点

1. 插件 APP 中需要加入插件的 falvor，同时对应的 applicationId 必须与宿主保持一致。

   ```groovy
   // 将插件applicationId设置为和宿主相同
    productFlavors {
          plugin {
              dimension 'Shadow'
              applicationId HOST_APP_APPLICATION_ID
          }
    }
   ```

   

2. 插件中 loader 和 runtime 除了 Shadow 依赖，可以无需其他任何依赖，尤其注意不可有 `androidx.core:core` 相关的依赖，否则打包插件运行时会有异常。

3. 启动插件中相关的四大组件时，Intent 传递的序列化对象会由于跨进程不能被插件 app 的 `PathClassLoader` 所加载而导致反序列化异常，解决方法：

   -   打包插件时添加宿主白名单：hostWhiteList，处于白名单中的包的类，加载时会被宿主的 PathClassLoader 加载。

       ```groovy
       shadow {
           packagePlugin {
               pluginTypes {
                   debug {
       				// ...
                       pluginApks {
                           pluginApk1 {  
                               hostWhiteList = ["com.example.zhanglei.myapplication.fragments"]
                           }
                       }
                   }
               }
       		// ...
           }
       }
       ```

   -   Intent  跨进程在不同的 app 传递数据时不要传递序列化的对象，而应该传递基本数据类型 + String 。

4. 宿主若想和插件实现双向通信，建议使用 AIDL 方式进行， PluginManager 中可以再添加个宿主接口白名单，用于获取 Service 绑定后的回调。

5. 四大组件在插件中使用是和在正常应用中一样的，都需要在 `AndroidManifest` 中注册，==同时同一插件进程中四大组件只可注册一次，并且注册的组件类需要确实存在==， 否则启动相关组件时会异常。

