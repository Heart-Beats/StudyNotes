## Shadow 框架的插件化原理



### 1. Shadow 框架的简介



Shadow 是腾讯开源的一款插件化框架，原理是使用宿主代理的方式实现组件的生命周期。主要有两个两点：最大的两个亮点是：

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



### 3. 使用注意点

1.  插件 APP 中通过 `apply plugin: 'com.tencent.shadow.plugin'` 使用 Shadow Gradle 插件一定要在 `android{}` 之后，同时插件的 applicationId 需要与宿主保持一致。

2.  插件中 loader 和 runtime 除了 Shadow 依赖，可以无需其他任何依赖，尤其注意不可有 `androidx.core:core` 相关的依赖，否则打包插件运行时会有异常

3.  启动插件中相关的四大组件时，Intent 传递的序列化对象会由于跨进程不能被插件 app 的 PathClassLoader 所加载而导致反序列化异常，解决方法：

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

4.  宿主若想和插件实现双向通信，建议使用 AIDL 方式进行， PluginManager 中可以在添加个宿主接口，用于获取 Service 绑定后的回调。

5.  四大组件在插件中是和在正常应用中一样的，都需要在 `AndroidManifest` 中注册，否则启动相关组件时会异常。



