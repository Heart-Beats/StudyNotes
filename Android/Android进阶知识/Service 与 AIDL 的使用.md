## Service 和 AIDL 的使用

[TOC]





### 1. Service

>   -   `Service` (服务) 是一个一种可以在后台执行长时间操作而没有用户界面的应用组件。
>-   服务可由其他应用组件启动（如 `Activity` ），若没进行绑定，服务一旦启动将在后台一直运行，即使启动服务的组件（ `Activity` ）已销毁也不受影响。
>   -   组件也可以绑定到服务，以与之进行交互，甚至是执行进程间通信 ( `IPC` )，这时组件销毁时服务也会停止。



该类中的常用方法如下：

```java
public abstract class Service extends ContextWrapper implements ComponentCallbacks2, ContentCaptureManager.ContentCaptureClient {
        
    // 创建时回调
    public void onCreate() {
    }

    // startService 时回调
    public @StartResult int onStartCommand(Intent intent, @StartArgFlags int flags, int startId) {
        onStart(intent, startId);
        return mStartCompatibility ? START_STICKY_COMPATIBILITY : START_STICKY;
    }
    
    // bindService 时的回调
    @Nullable
    public abstract IBinder onBind(Intent intent);
    
    // unbindService 时的回调
    public boolean onUnbind(Intent intent) {
        return false;
    }
    
    // 当 onUnbind 返回 true 时，重新绑定时的回调
    public void onRebind(Intent intent) {
    }
    
    // 销毁停止时的回调
    public void onDestroy() {
    }
    
    // 内部的停止方法，若想停止并获取结果使用 stopSelfResult(startId)
    public final void stopSelf() {
        stopSelf(-1);
    }
}
```

这里 `onStartCommand()` 的返回值很重要，共有如下四种不同的取值：

1.  `START_STICKY`

    -   ==粘性的==

    -   `onStartCommand()` 使用这个返回值执行后，如果 `service` 进程被 kill 掉，保留 `service` 的状态为开始状态，但不保留递送的 `intent` 对象；系统随后会尝试重新创建 `service`，由于服务状态为开始状态，所以创建服务后一定会调用 `onStartCommand (Intent, int, int)` 方法。如果在此期间没有任何启动命令被传递到 `service` , 那么参数 `Intent` 将为 `null` 。

        

2.  `START_NOT_STICKY`

    -   ==非粘性的==

    -   使用这个返回值时 , 如果在执行完 `onStartCommand()` 后 , 服务被异常 `kill` 掉 ，系统不会自动重启该服务。

        

3.  `START_REDELIVER_INTENT`

    -   ==重传 `Intent`==

    -   使用这个返回值时，如果在执行完 `onStartCommand()` 后，服务被异常 kill 掉，系统会自动重启该服务 , 并将 Intent 的值传入。

        

4.  `START_STICKY_COMPATIBILITY`

    -   ==`START_STICKY` 的兼容版本== , 但不保证服务被 `kill` 后一定能重启。







#### 1.1 Service 的基本生命周期

提到生命周期就不得不说到关于 Service 的两种启动方法：

-   `startService`
-    `bindService`



##### 1.1.1 startService

此方式启动的 Service 会一直无限运行，只有调用了它的 `stopService()` 或 `stopSelf()` 方法时，才会停止运行并销毁。



生命周期：

-   startService：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/e43a95d7b7ceedec2905a01ef96b00fc35a498a9/images/startService生命周期.png" alt="startService生命周期"  />

​		==若 service 没被创建，调用 `startService()` 后会执行 `onCreate()` ----> `onStartCommand()`，若 service 已创建，`startService()` 只会执行 `onStartCommand()`。==



-   stopService：

    ![stopService生命周期](https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/stopService%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F.png)
    
    ==`stopService()` 在 Service 被绑定时无法停止销毁。==
    
    



##### 1.1.2 bindService

启动的服务和调用者之间是典型的 client-server 模式，调用者是 client，Service 则是 server 端。
*              Service 只有一个，但绑定到 Service 上面的 client 可以有多个。
*              client 可以通过 IBinder 接口获取 Service 实例，实现 client 端调用 Service 中的方法以实现交互。
*              启动的 Service 的生命周期与其绑定的 client 息息相关。当 client 销毁时，会自动与 Service 解除绑定，当然，也可以调用 Context 的 `unbindService()` 方法手动与 Service 解除绑定。==当没有任何 client 与 Service 绑定时，Service 就会自行销毁==。



生命周期：

-   bindService：

    <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/bindService%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F.svg" alt="bindService生命周期"  />

    没啥特殊的，就是 bindService 时 Service  若没创建会创建 Service 示例，并在绑定成功后收到 `onBind()` 回调。

    

-   unbindService：

    <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/7c9cc04b178bcafd5a79ee41bbed178430bb582e/images/unbindService 生命周期.svg" alt="unbindService 生命周期" style="zoom:80%;" />

    unbindService 将组件与 Service 解绑后会收到 `onUnbind()` 回调，此时该 Service 若无任何组件与其绑定，则会自行销毁。



#### 1.2  Service 的启动方式

通过上节介绍，可以了解到启动 Service 有 `startService()` 和 `bindService()` 两种方式。



##### 1.2.1 startService

==该启动方式，`app` 杀死、`Activity` 销毁没有任何影响，服务都不会销毁停止运行，所以此方式适合后台一直运行的任务，但无法调用 Service 中的方法进行交互==。

比如：播放音乐、下载文件、进程保活…



停止方式：主动 `stopService()`



##### 1.2.1 bindService

==该启动方式依赖于客户端生命周期，当客户端 `Activity` 销毁时，即使没有调用 `unbindService()` 方法，`Service` 也会销毁停止运行。所以此方式适合短时使用同时与 Service 产生交互的任务==。

比如：通过 Service 跨进程传输数据…



停止方式：Service 无任何绑定即会自动停止



##### 1.2.3 startService + bindService

==该启动方式 Service 可以在后台一直运行，同时还可以与 Service 产生交互，调用它的方法==。

比如：播放并控制音乐、下载文件并更新进度…



停止方式：需要解除绑定并 `stopService()`



#### 1.3 Service 和 Thread 的区别

既然提到 Service  可以执行后台任务，那么也可以使用线程呀？那么看看有啥不同吧！



首先看看定义：

-   Thread 

    线程为程序执行的最小单元，Android 中的 UI 线程就是其中一种。

-   Service  

    安卓中的四大组件之一，为一种特殊的机制，其实是一种轻量级的 `IPC` 通信。

    

其次，需要了解一下 Thread 的局限性：

==`Thread` 的运行是独立于 `Activity` 的但依赖于进程，也就是说当应用进程被杀死或者线程体运行完毕时就会停止运行==。

当 `Activity` 被 `finish` 后，是无法对其进行管理的。同时 `Thread` 运行过程中对其进行控制操作也非常麻烦，而且也无法通过它实现 IPC（跨进程）通信。

 

那么，就可以了解到 Service 是可以做到这些的。

==默认情况下， Service 是运行在当前 app 进程的 UI 主线程中，可以在 AndroidManifest 文件中配置 `android:process` 指定它所在的进程。==

因此，==与 Activity 一样，Service 是无法直接在其内部执行耗时任务的，需要开启子线程去执行，否则就会产生 ANR==。



#### 1.4 IntentService

在介绍 IntentService 之前先说明一下使用传统的 Service 会有何问题：

1.  无法直接处理耗时任务，需要内部开启子线程
2.  `startService()` 启动之后需要手动去停止



那么 IntentService 就是为了解决这些问题而生的，看下该类的主要内容：

```java
@Deprecated
public abstract class IntentService extends Service {

    // 该 Handler 在子线程中创建
    private final class ServiceHandler extends Handler {
        
        public ServiceHandler(Looper looper) {
            super(looper);
        }

        @Override
        public void handleMessage(Message msg) {
            onHandleIntent((Intent)msg.obj);
            // 处理完任务后自动停止
            stopSelf(msg.arg1);
        }
    }
    
    @Override
    public void onCreate() {
        super.onCreate();
        HandlerThread thread = new HandlerThread("IntentService[" + mName + "]");
        thread.start();

        mServiceLooper = thread.getLooper();
        mServiceHandler = new ServiceHandler(mServiceLooper);    
    }
    
    @Override
    public void onStart(@Nullable Intent intent, int startId) {
        Message msg = mServiceHandler.obtainMessage();
        msg.arg1 = startId;
        msg.obj = intent;
        
        // startService() 时将信息发送到 ServiceHandler 中
        mServiceHandler.sendMessage(msg);
    }
    
    /**
	 * 该方法的返回值为 Service 的标志位：
	 *
	 *  @see Service.START_STICKY_COMPATIBILITY： START_STICKY 的兼容版本，但不保证服务被kill后一定能重启
	 *
	 *  @see Service.START_STICKY： 粘性的，如果 service 进程被 kill 掉，保留 service 的状态为开始状态，但不保留传送的 intent 对象。随后系统会尝试重新创建 service，创建后即会重新调用 onStartCommand(Intent,int,int) 方法。如果在此期间没有任何启动命令被传递到 service，那么参数 Intent 将为null
	 *
	 *  @see Service.START_NOT_STICKY： 非粘性的，在执行完 onStartCommand 后，服务被异常 kill 掉，系统不会自动重启该服务
	 *
	 *  @see Service.START_REDELIVER_INTENT： 重传 Intent，在执行完 onStartCommand 后，服务被异常 kill 掉，系统会自动重启该服务，并将 Intent 的值传入
	 *
	 */
    @Override
    public int onStartCommand(@Nullable Intent intent, int flags, int startId) {
        onStart(intent, startId);
        return mRedelivery ? START_REDELIVER_INTENT : START_NOT_STICKY;
    }
    
    @Override
    public void onDestroy() {
        mServiceLooper.quit();
    }
    
    @Override
    @Nullable
    public IBinder onBind(Intent intent) {
        return null;
    }
    
    // startService() -----> ServiceHandler 的 handleMessage() ------> onHandleIntent()
    @WorkerThread
    protected abstract void onHandleIntent(@Nullable Intent intent);
    
}
```

从上述代码中就可以看出它的主要特征：

1.  会创建独立的 `worker` 线程来处理所有的 `Intent` 请求，并最终执行复写的 `onHandleIntent()` 方法；
2.  请求任务处理完成后，`IntentService` 会自动停止，无需调用 `stopSelf()` 方法停止 `Service` ；



因此，==对于那种需要后台处理某些任务，处理完成即退出是非常适合使用 IntentService 的，如：下载文件。==



#### 1.5 Android 8.0 对后台服务的限制

上节中可以看到 IntentService 被标记废弃了，这是由于 Android 8.0(API 26) 以后系统不允许后台应用创建后台服务，创建后台服务需要使用 `JobScheduler` 来由系统进行调度任务的执行。那么怎样应用会被认定为后台呢？



如果满足以下任意条件，应用将被视为处于前台：

- 具有可见 Activity (不管该 Activity 已启动还是已暂停)；
- 具有前台服务；
- 另一个前台应用已关联到该应用(不管是通过绑定到其中一个服务，还是通过使用其中一个内容提供程序)；
- IME；
- 壁纸服务；
- 通知侦听器；
- 语音或文本服务。

如果以上条件均不满足，应用将被视为处于后台。



因此，Android 8.0 引入了一种全新的方法，即 ==`Context.startForegroundService()` 以在前台启动新服务==。系统创建服务后应在==五秒的时间内调用该服务的 `startForeground()` 方法以显示新服务的用户可见通知==。如果未在此时间限制内未调用 `startForeground()` 方法，则系统将停止服务并声明此应用为 `ANR`。



但在一些特殊情况下，还是可以创建后台服务的：

1. 处理对用户可见的任务时，后台应用将被置于一个临时白名单中并持续数分钟。位于白名单中时，应用可以无限制地启动服务，并且其后台服务也可以运行。
    - 处理一条高优先级 Firebase 云消息传递 (FCM) 消息；
    - 接收广播，例如短信/彩信消息；
    - 从通知执行 PendingIntent。
2. `bindService()` 方法不受后台限制。



##### 1.5.1 前台服务



使用步骤：

1. 添加权限 

    创建一个前台服务，首先需要请求前台服务权限（Android  9 -  <u>API 级别 28</u> 及以上 ），如下：

    ```xml
    <manifest xmlns:android="http://schemas.android.com/apk/res/android" ...>
    
        <uses-permission android:name="android.permission.FOREGROUND_SERVICE"/>
    
        <application ...>
            ...
        </application>
    </manifest>
    ```
    这是一个正常的权限，系统会自动将其授予请求的应用程序。

    

2.  创建前台服务

    创建一个前台服务与创建一个正常服务没太大区别，只是需要在 Service 创建之后调用 `startForeground()`  来启动前台服务，如下：

    ```kotlin
    class TestService : Service() {
        
       override fun onCreate() {
          super.onCreate()
           
            // Android 8.0 调用 startForefround() 方法启动服务
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                setForegroundService();
            }
       }
        
       private fun  setForegroundService() {
           
           // 创建通知渠道
            val CHANNEL_ID = 1
            val channelName = getString(R.string.channel_name)
           // 设置通知的优先级
            val importance = NotificationManager.IMPORTANCE_LOW
            val channel = NotificationChannel(CHANNEL_ID, channelName, importance)
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
    
           // 设置前台服务通知的点击事件
           val pendingIntent: PendingIntent =
            Intent(this, ExampleActivity::class.java).let { notificationIntent ->
                PendingIntent.getActivity(this, 0, notificationIntent, 0)
            }
           
           // 创建通知
            val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
                    .setContentTitle(getText(R.string.notification_title))
                    .setContentText(getText(R.string.notification_message))
                    .setSmallIcon(R.drawable.icon)
                    .setContentIntent(pendingIntent)
                    .setTicker(getText(R.string.ticker_text))
                    .build()
    
            // Notification ID cannot be 0.
            startForeground(NOTIFICATION_ID, notification)
       }
    
       override fun onBind(intent: Intent): IBinder? {
    		return null
       }
    }
    ```

    在这里有两个点需要注意一下：

    1. Android 8.0 以上创建通知需要先创建通知渠道，再使用渠道 id 创建通知
    2. 前台服务的通知优先级必须为 `PRIORITY_LOW` 或更高，通知优先级详细见[设置渠道的重要性级别](https://github.com/Heart-Beats/StudyNotes/blob/master/Android/Android进阶知识/Android组件使用总结.md#622-设置重要性级别)

    

3. 注册服务

    ```xml
    <manifest xmlns:android="http://schemas.android.com/apk/res/android" ...>
    
        <application ...>
    
            <service
                android:name="com.hl.myplugin.TestService"
                android:enabled="true"
                android:exported="false" />
        </application>
    
    </manifest>
    ```

    

4. 声明前台服务类型

    如果在 Android 10（API 级别 29）或更高版本访问前台服务中的位置信息，则需要声明 `<service>` 组件的前台服务类型为 location；

     如果在 Android 11（API 级别 30）或更高版本访问前台服务中的摄像头或麦克风，则需要声明 `<service>` 组件的前台服务类型为  camera 或 microphone。

    ```xml
    <manifest xmlns:android="http://schemas.android.com/apk/res/android" ...>
    
        <application ...>
    
            <service ...
                android:foregroundServiceType="location|camera|microphone"/>
        </application>
    
    </manifest>
    ```

    在运行时，如果前台服务只需要访问清单中声明的类型的子集，则可以使用以下代码片段中的逻辑来限制服务的访问：

    ```kotlin
    val notification: Notification = ...
    // 开启前台服务的重载方法
    startForeground(NOTIFICATION_ID, notification, FOREGROUND_SERVICE_TYPE_LOCATION or FOREGROUND_SERVICE_TYPE_CAMERA)
    ```

    

    但 Android 11（API 级别 30）为了帮助保护用户隐私，对前台服务何时可以访问设备的位置、摄像头或麦克风进行了限制。当应用程序在后台运行启动前台服务时，前台服务有以下限制：

    - 除非用户已授予应用程序 [`ACCESS_BACKGROUND_LOCATION`](https://developer.android.google.cn/reference/android/Manifest.permission#ACCESS_BACKGROUND_LOCATION) 权限，否则 前台服务无法访问位置。

    - 前台服务无法访问麦克风或摄像头。

        

    如果启动的服务对位置、麦克风和摄像头的访问受到限制，那么在调试时 Logcat 中会显示以下消息：

    ```shell
    Foreground service started from background can not have location/camera/microphone access: service SERVICE_NAME
    ```

    

    **限制豁免：**

    在某些情况下，即使应用程序在后台运行时启动了前台服务 ，它仍然可以在应用程序在前台运行时（“使用中”）访问位置、相机和麦克风信息。在这些情况下，==如果服务声明了一个 [前台服务类型](https://developer.android.google.cn/guide/components/foreground-services#types) 为 `location`，并且服务由一个具有[`ACCESS_BACKGROUND_LOCATION`](https://developer.android.google.cn/reference/android/Manifest.permission#ACCESS_BACKGROUND_LOCATION) 权限的应用程序启动，那么该服务即使在后台启动但在前台运行时仍可访问位置信息==。

    以下包含这些情况：

    - 该服务由系统组件启动。
    - 该服务通过与[应用小部件](https://developer.android.google.cn/guide/topics/appwidgets/overview)交互启动。
    - 该服务通过与通知交互来启动。
    - 该服务作为[`PendingIntent`](https://developer.android.google.cn/reference/android/app/PendingIntent)从不同的可见应用程序发送的启动 。
    - 该服务由在设备所有者模式下运行的[设备策略控制器](https://developer.android.google.cn/work/dpc/build-dpc)应用程序启动。
    - 该服务由提供`VoiceInteractionService`.
    - 该服务由具有`START_ACTIVITIES_FROM_BACKGROUND`特权权限的应用程序启动 。

    

5. 启动前台服务

    ```kotlin
    // Android 8.0使用 startForegroundService 在前台启动服务
    if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.O){
       startForegroundService(Intent(this,TestService::class.java)
    }else{
      startService(Intent(this,TestService::class.java))
    }
    ```

    

6. 移除前台服务

    调用 `stopForeground(removeNotification: Boolean)` 方法即可移除前台服务，参数代表是否删除状态栏通知。

    注意： ==`stopForeground()` 并不会使服务停止运行，若想停止服务，仍需调用 `stopService()`==



##### 1.5.2 JobIntentService

由于前台服务在通知栏上会显示该 `Service` 正在运行，这可能会带来不好的用户体验。如果还是希望使用服务在后台默默工作、通过使用服务开启子进程等等，那么就可以使用 `JobIntentService`。



`JobIntentService` 用于处理被加入到队列的 job/service 任务。当运行在 Android O 或更高版本时，任务将作为 `job` 通过 `JobScheduler.enqueue()` 进行分发；当运行在较老版本的平台上时，任务仍旧会使用 `Context.startService()` 执行。



使用步骤：

1. 在 Manifest 中声明 Permission

    `JobIntentService` 处理了亮屏/锁屏，因此需要在 `AndroidManifest.xml` 中添加 `android.Manifest.permission.WAKE_LOCK` 权限，如下：

    ```xml
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    ```

    

2. 在 Manifest 中声明 Service

    `JobIntentService` 本质上也是一个 `Service`，因此需要在 `AndroidManifest.xml` 声明，以便系统与之交互，如下：

    ```xml
    <service android:name="SimpleJobIntentService" 
             android:permission="android.permission.BIND_JOB_SERVICE" > 
        ... 
    </service>
    ```

    

3.  创建 JobIntentService 的实现类

    与 IntentService 的 `onHandleIntent()` 方法相似，只需重写 `onHandleWork()` 方法处理相应的逻辑即可：

    ```kotlin
    class SimpleJobIntentService : JobIntentService() {
    
    	companion object {
    		private const val JOB_ID = 1
    
    		fun enqueueWork(context: Context, work: Intent) {
    			enqueueWork(context, SimpleJobIntentService::class.java, JOB_ID, work)
    		}
    	}
    
    	override fun onHandleWork(intent: Intent) {
            // 具体逻辑
    	}
    }
    ```

    

4. 启动服务

    ```kotlin
    SimpleJobIntentService.enqueueWork(context, new Intent());
    ```

    可以看出，它使用起来非常简单，因为已经封装了大量的内部逻辑，只需要调用 `enqueueWork()` 静态方法就可以了。



------



### 2. Service 的保活

Android 系统会尽可能长的延续一个应用程序进程，但在内存过低的时候，仍然会不可避免需要移除旧的进程。为了决定哪些进程留下，哪些进程被杀死，系统根据在进程中在运行的组件及组件的状态，为每一个进程分配了一个优先级等级。优先级最低的进程首先被杀死。这个进程重要性的层次结构主要有五个等级。



#### 2.1 进程的五个常用等级:

主要分为：

1.  **前台进程（Foreground process）**

2.  **可见进程（Visible process）**

3.  **服务进程 （Service process）**

4.  **后台进程 （Background process）**

5.  **空进程**

    

了解这些以后，你就能明白为啥不建议在 Activity 中开线程处理耗时任务？

主要原因如下：

-   Activity 中开线程做耗时操作，切到桌面会变成后台进程
-   启动 Service 新建线程处理耗时任务，这时会变为服务进程

因为服务进程的优先级比后台进程的优先级高，所以此方式处理耗时任务更好。 同时，==使用 Service 将会保证 app 至少有服务进程的优先级==。



##### 2.1.1 **前台进程**

前台进程是用户当前做的事所必须的进程，如果满足下面各种情况中的一种，一个进程被认为是在前台：

1.  进程持有一个正在与用户交互的 Activity。

2.  进程持有一个 Service，这个 Service 处于这几种状态:

    -   Service 与用户正在交互的 Activity 绑定。

    -   Service 是在前台运行的，即它调用了 `startForeground()`。

    -   Service 正在执行它的生命周期回调函数 —— `onCreate()`、 `onStart()` 或 `onDestroy()`。

3.  进程持有一个 BroadcastReceiver，这个 BroadcastReceiver 正在执行它的 `onReceive()` 方法。

    

杀死前台进程需要用户交互，因为前台进程的优先级是最高的。



##### 2.1.2 可见进程

如果一个进程不含有任何前台的组件，但仍可被用户在屏幕上所见。当满足如下任一条件时，进程被认为是可见的：

1.  进程持有一个 Activity，这个 Activity 不在前台，但是仍然被用户可见，即处于 `onPause()` 状态。

2.  进程持有一个 Service，这个 Service 和一个可见的 Activity 绑定。

    

可见的进程也被认为是很重要的，一般不会被销毁，除非是为了保证所有前台进程的运行而不得不杀死可见进程的时候。



##### 2.1.3 服务进程

如果一个进程中运行着一个 Service，这个 Service 是通过 `startService()` 开启的，并且不属于上面两种较高优先级的情况（未进行任何绑定），这个进程就是一个服务进程。



尽管服务进程没有和用户可以看到的东西绑定，但是它们一般在做的事情是用户关心的，比如后台播放音乐，后台下载数据等。所以系统会尽量维持它们的运行，除非系统内存不足以维持前台进程和可见进程的运行需要。



##### 2.1.4 后台进程

如果进程不属于上面三种情况，但是它持有一个用户不可见的activity（Activity的 `onStop()` 被调用，但是 `onDestroy()` 没有调用的状态），就认为进程是一个后台进程。



后台进程不直接影响用户体验，系统会为了前台进程、可见进程、服务进程而任意杀死后台进程。

通常会有很多个后台进程存在，它们会被保存在一个 LRU (least recently used) 列表中，这样就可以确保用户最近使用的 Activity 最后被销毁，即最先销毁时间最远的 Activity。





##### 2.1.5 空进程

如果一个进程不包含任何活跃的应用组件，则认为是空进程。



例如：一个进程当中已经没有数据在运行，但是内存当中还为这个应用驻留了一个进程空间。

保存这种进程的唯一理由是为了缓存的需要，为了加快下次要启动这个进程中的组件时的启动时间。系统为了平衡进程缓存和底层内核缓存的资源，经常会杀死空进程。





#### 2.2 Service 保活的常用技巧



1.  设置最高优先级

    ```xml
    <service  
         android:name="com.dbjtech.acbxt.waiqin.UploadService"  
         android:enabled="true" >  
         <intent-filter android:priority="1000" >  
             <action android:name="xxxx" />  
         </intent-filter>  
    </service>
    ```

    如上，Service 对于 intent-filter 可以通过 `android:priority = “1000”` 这个属性设置最高优先级，1000是最高值，如果数字越小则优先级越低，同时适用于广播。

    

2.  使用前台服务

    Service 创建时通过 `startForeground()` 方法把 Service 提升为前台进程级别，在 `onDestroy()` 里面要记得调用 `stopForeground() `方法。

    

3.  复写`onStartCommand()` 方法，返回 `START_STICKY`

    当 Service 因内存不足被 kill，当内存又有的时候，Service 就会被重新创建启动。

    注意：但是不能保证任何情况下都被重建，比如进程被干掉了….

    

4.  `onDestroy()` 方法里发广播重启 Service

    Service + Broadcast 方式，就是当 Service 走 `onDestory()` 的时候，发送一个自定义的广播，当收到广播的时候，重新启动 Service。

    注意：第三方应用或是在 setting 里-应用-强制停止时，APP 进程就直接被干掉了，`onDestroy()` 方法都进不来，所以无法保证会执行

    

5.  监听系统广播判断 Service 状态

    通过系统的一些广播，比如：手机重启、界面唤醒、应用状态改变等等监听并捕获，然后判断我们的 Service 是否还存活决定是否重新启动。

    

6.  Application 加上 Persistent 属性 

    该属性相当于将该进程设置为常驻内存进程，即系统应用。一般为安装在/system/app下的 app，正常的三方应用安装在 /data/app 下。



------



### 3. AIDL 的使用

> Android 接口定义语言 (AIDL)，利用它定义客户端与服务均认可的编程接口，以便二者使用进程间通信 (IPC) 进行相互通信。
>
> 跨进程通信 (IPC) 的方式很多，AIDL 是其中一种。还有 `Binder`、文件共享、`Messenger`、`ContentProvider` 和 `Socket` 等进程间通信的方式。AIDL 是接口定义语言，只是一个工具。具体通信还是得用Binder 来进行。Binder 是 Android 独有的跨进程通信方式，只需要一次拷贝，更快速和安全。
>
> 官方推荐用 `Messenger` 来进行跨进程通信，但是 `Messenger` 是以串行的方式来处理客户端发来的消息，如果大量的消息同时发送到服务端，服务端仍然只能一个个处理。因此对于大量的并发请求，这种情况就得用 AIDL 。其实 Messenger 的底层也是 AIDL，只不过系统做了层封装，简化使用。



#### 3.1 Messenger (串行处理)



##### 3.1.1 服务端

1. 创建一个 Handler 对象，并实现 `hanlemessage` 方法，用于接收来自客户端的消息，并作处理
2. 创建一个 Messenger，封装 Handler
3. `messenger.getBinder()` 方法获取一个 IBinder 对象，通过 `onBind` 返回给客户端



使用示例如下：

```java
public class MessengerService extends Service {
    
    // 存储客户端发送的 Messenger 对象
    ArrayList<Messenger> mClients = new ArrayList<Messenger>();
    
    int mValue = 0;
    
    /**
     *  客户端请求注册 Messenger 
     */
    static final int MSG_REGISTER_CLIENT = 1;
    
    /**
     * 客户端请求反注册 Messenger 
     */
    static final int MSG_UNREGISTER_CLIENT = 2;
    

    /**
     * 客户端请求设值，相当于请求其他命令
     */
    static final int MSG_SET_VALUE = 3;
    

    class IncomingHandler extends Handler {
        
        @Override
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case MSG_REGISTER_CLIENT:
                    mClients.add(msg.replyTo);
                    break;
                case MSG_UNREGISTER_CLIENT:
                    mClients.remove(msg.replyTo);
                    break;
                case MSG_SET_VALUE:
                    mValue = msg.arg1;
                    for (int i=mClients.size()-1; i>=0; i--) {
                        try {
                            // 取得客户端传送的 Messenger，发送消息回 Messenger 实现双向通信
                            mClients.get(i).send(Message.obtain(null, MSG_SET_VALUE, mValue, 0));
                        } catch (RemoteException e) {
							// 客户端有可能在此过程中死了产生异常，需要移除
                            mClients.remove(i);
                        }
                    }
                    break;
                default:
                    super.handleMessage(msg);
            }
        }
    }
    
    final Messenger mMessenger = new Messenger(new IncomingHandler());
    
    @Override
    public IBinder onBind(Intent intent) {
        return mMessenger.getBinder();
    }
}
```

注意：==该Service 在声明时必须对外开放，即 `android:exported="true"`==



##### 3.1.2 客户端

1. 在 Activity 中绑定服务
2. 创建 ServiceConnection ，在其 `onServiceConnected()`  方法中通过参数 IBinder 将 Messenger 实例化 
3. 使用 Messenger 向服务端发送命令，或需要接收服务器端的返回信息，则还要创建一个 `Messenger(handler)`，并将这个 Messenger 传递给服务端，在handler 中接收处理服务端的消息，这就实现了客户端和服务端的双向通信



使用示例如下：

```java
public class MessengerServiceActivities extends Activity{

    // 向服务端发送命令的 Messenger
    private Messenger mService = null;
    
    private boolean mIsBound;
    
    private TextView mCallbackText;
    
    private class IncomingHandler extends Handler {
        @Override
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case MessengerService.MSG_SET_VALUE:
                    mCallbackText.setText("Received from service: " + msg.arg1);
                    break;
                default:
                    super.handleMessage(msg);
            }
        }
    }
    
    // 接收服务端返回消息的 Messenger
    private final Messenger mMessenger = new Messenger(new IncomingHandler());

    private ServiceConnection mConnection = new ServiceConnection() {
        
        public void onServiceConnected(ComponentName className, IBinder service) {
			// 连接时获取与服务端交互的 Messenger
            mService = new Messenger(service);
            mCallbackText.setText("Attached.");

            try {
                // 将需要接收服务端返回消息的 Messenger 发送在消息体中
                Message msg = Message.obtain(null, MessengerService.MSG_REGISTER_CLIENT);
                msg.replyTo = mMessenger;
                mService.send(msg);
                
                // 向服务端发送设值命令
                msg = Message.obtain(null, MessengerService.MSG_SET_VALUE, this.hashCode(), 0);
                mService.send(msg);
            } catch (RemoteException e) {
                // xxx
            }

            Toast.makeText(this, R.string.remote_service_connected, Toast.LENGTH_SHORT).show();
        }
        
        public void onServiceDisconnected(ComponentName className) {
            mService = null;
            mCallbackText.setText("Disconnected.");
            Toast.makeText(this, R.string.remote_service_disconnected,Toast.LENGTH_SHORT).show();
        }
    };
    
    void doBindService() {
        bindService(new Intent(this, MessengerService.class), mConnection, Context.BIND_AUTO_CREATE);
        mIsBound = true;
        mCallbackText.setText("Binding.");
    }
    
    void doUnbindService() {
        if (mIsBound) {
            if (mService != null) {
                try {
                    // 解绑时移除服务端中添加的 Messenger，取消消息接收
                    Message msg = Message.obtain(null, MessengerService.MSG_UNREGISTER_CLIENT);
                    msg.replyTo = mMessenger;
                    mService.send(msg);
                } catch (RemoteException e) {
                    //xxx
                }
            }
            
            unbindService(mConnection);
            mIsBound = false;
            mCallbackText.setText("Unbinding.");
        }
    }
}
```





#### 3.2  AIDL(并行处理)



步骤：

1. 创建 .aidl 文件：

    定义 AIDL 接口

    

2. 实现接口：

    Android SDK 工具会基于 .aidl 文件，使用 Java 编程语言生成继承自 `IInterface` 接口的接口。生成的接口拥有一个继承自 Binder 类名为 Stub 的内部抽象类，并声明 AIDL 接口中的抽象方法。大概结构如下：

    ```java
    public interface IInterface{
        public IBinder asBinder();
    }
    
    public interface xxxInterface extends android.os.IInterface{
    
        public static abstract class Stub extends android.os.Binder implements xxxInterface{
            
            @Override 
            public android.os.IBinder asBinder() {
              	return this;
            }
            
            xxxx
        }
        
        // AIDL 中声明的抽象方法
        xxxx
    }
    ```

    

3. 向客户端公开接口：

    实现 Service 并重写 onBind(),从而返回 Stub 类的实现.



##### 3.2.1 定义 AIDL 接口

 在 `src/main` 下面创建 aidl 目录，然后新建 `IPersonManager.aidl` 文件，里面声明方法用于客户端调用，服务端实现。如下：

```java
package com.xfhy.allinone.ipc.aidl;
import com.xfhy.allinone.ipc.aidl.Person;
interface IPersonManager {
    List<Person> getPersonList();
    //in: 从客户端流向服务端
    boolean addPerson(in Person person);
}
```

这个接口和平常我们定义接口时差别不是很大，需要注意的是==即使 Person 和 PersonManager 在同一个包下面还是得导包，这是AIDL的规则==。



1. **AIDL 支持的数据类型**

    在 AIDL 文件中，不是所有数据类型都是可以使用的，支持的数据类型如下：

    - Java 编程语言中的所有原语类型（如 int、long、char、boolean 等）

    - String 和 CharSequence

    - List：只支持 ArrayList，里面每个元素都必须能够被 AIDL 支持

    - Map：只支持HashMap，里面的每个元素都必须被 AIDL 支持，包括 key 和 value

    - Parcelable：所有实现了Parcelable接口的对象

    - AIDL：所有的AIDL接口本身也可以在 AIDL 文件中使用

        

2. **定义传输的对象**

    在 kotlin 或 Java 这边需要定义好这个需要传输的对象 Person,，或者定义在 aidl 目录下， 但需要通过 `sourceSet{}` 将此目录定义为 kotlin 或 java 源码目录，这里以在 kotlin 下为示例：

    ```kotlin
    class Person(var name: String? = "") : Parcelable {
        constructor(parcel: Parcel) : this(parcel.readString())
    
        override fun toString(): String {
            return "Person(name=$name) hashcode = ${hashCode()}"
        }
    
        override fun writeToParcel(parcel: Parcel, flags: Int) {
            parcel.writeString(name)
        }
    
        fun readFromParcel(parcel: Parcel) {
            this.name = parcel.readString()
        }
    
        override fun describeContents(): Int {
            return 0
        }
    
        companion object CREATOR : Parcelable.Creator<Person> {
            override fun createFromParcel(parcel: Parcel): Person {
                return Person(parcel)
            }
    
            override fun newArray(size: Int): Array<Person?> {
                return arrayOfNulls(size)
            }
        }
    ```

    然后得在 aidl 的相同目录下也需要声明一下这个 Person 对象，新建一个 Person.aidl：

    ```java
    package com.xfhy.allinone.ipc.aidl;
    
    parcelable Person;
    ```

    注意：==当需要传递对象时，则该对象必须实现 Parcelable 接口并且需要指示数据走向的方向标记==

    都完成了之后，rebuild 一下，AS 会自动生成`IPersonManager.java` 接口文件。
    
    

##### 3.3.2 方向标记（ in，out，inout）

> Android两个进程间[内存](https://so.csdn.net/so/search?q=内存&spm=1001.2101.3001.7020)相互独立不能互相访问，跨进程传输非默认类型对象需要先序列化，而不能直接简单传递引用，序列化的目的是将对象数据以能够在内存中流通的形式从一个进程传递到另一个进程，两个进程对象的传递类似深度clone，client端将对象数据写入Parcel（**writeToParcel**），server端从Parcel（**readFromParcel**）读取对象数据并重新创建一个同样的对象将读取到的数据填充到此对象，但这两个对象并不是一样的，只是他们的数据完全一样。


两个进程中要传递的对象必须实现 **Parcelable** 接口，AIDL 中序列化的对象传递还必须指定定向 tag，tag 表示数据的流通方向。

| 方向标记 |                             意义                             |
| :------: | :----------------------------------------------------------: |
|    in    | 数据只能**由 cilent 端流向 server 端，server 端可以收到此对象的所有数据，收到之后会重新创建一个新的对象将数据填充进去，因为cilent 端和 server 端是两个不同的对象，所以 server 端对数据的修改不会影响到 client 端的对象** |
|   out    | 数据只能**由 server 端流向 client 端，client 端会创建一个无参对象传递给 server 端后，server 端相当于收到的是空对象，没有 client 端此对象的任何数据，但是 server 端对此空对象的操作会反向影响到 cilent 端** |
|  inout   | 数据可在服务端与客户端之间双向流通，服务端和客户端同步共用一个对象，**即 server 端能收到 cilent 端发过来的对象的数据，server 端对此对象的操作也能影响到 cilent 端** |

原语类型（基本类型）默认是 in，inout  开销很大，因此慎用。==调用 AIDL 生成接口的为客户端，实现接口方为服务端==。





##### 3.2.2 服务端实现接口

定义一个 Service， 然后将其 process 设置成一个新的进程，与主进程区分开，模拟跨进程访问，它里面需要实现 `.aidl` 生成的接口，如下：

```kotlin
class RemoteService : Service() {

    private val mPersonList = mutableListOf<Person?>()

    private val mBinder: Binder = object : IPersonManager.Stub() {
        
        override fun getPersonList(): MutableList<Person?> = mPersonList

        override fun addPerson(person: Person?): Boolean {
            return mPersonList.add(person)
        }
    }

    override fun onBind(intent: Intent?): IBinder? {
        return mBinder
    }

    override fun onCreate() {
        super.onCreate()
        mPersonList.add(Person("Garen"))
        mPersonList.add(Person("Darius"))
    }
}
```

实现的 `IPersonManager.Stub` 是一个 Binder，需要通过 `onBind()` 返回，客户端需要通过这个 Binder 来跨进程调用 Service 这边的服务。



##### 3.2.3 客户端与服务端进行通信

客户端这边需要通过 `bindService()` 来连接此 Service，进而实现通信。客户端的 `onServiceConnected()` 回调会接收 Service 的 `onBind()` 方法所返回的 binder 实例。再调用 `XxxInterface.Stub.asInterface(service)` 就能转换取得 XxxInterface 实例。如下：

```kotlin
class AidlActivity : TitleBarActivity() {

    companion object {
        const val TAG = "xfhy_aidl"
    }

    private var remoteServer: IPersonManager? = null

    private val serviceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            log(TAG, "onServiceConnected")
            //在onServiceConnected调用IPersonManager.Stub.asInterface 获取接口类型的实例
            //通过这个实例调用服务端的服务
            remoteServer = IPersonManager.Stub.asInterface(service)
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            log(TAG, "onServiceDisconnected")
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_aidl)

        btnConnect.setOnClickListener {
            connectService()
        }
        btnGetPerson.setOnClickListener {
            getPerson()
        }
        btnAddPerson.setOnClickListener {
            addPerson()
        }
    }

    private fun connectService() {
        val intent = Intent()
        //action 和 package(app的包名)
        intent.action = "com.xfhy.aidl.Server.Action"
        intent.setPackage("com.xfhy.allinone")
        val bindServiceResult = bindService(intent, serviceConnection, Context.BIND_AUTO_CREATE)
        log(TAG, "bindService $bindServiceResult")

        //如果targetSdk是30,那么需要处理Android 11中的程序包可见性  具体参见:        https://developer.android.com/about/versions/11/privacy/package-visibility
    }

    private fun addPerson() {
        //客户端调服务端方法时,需要捕获以下几个异常:
        //RemoteException 异常：
        //DeadObjectException 异常：连接中断时会抛出异常；
        //SecurityException 异常：客户端和服务端中定义的 AIDL 发生冲突时会抛出异常；
        try {
            val addPersonResult = remoteServer?.addPerson(Person("盖伦"))
            log(TAG, "addPerson result = $addPersonResult")
        } catch (e: RemoteException) {
            e.printStackTrace()
        } catch (e: DeadObjectException) {
            e.printStackTrace()
        } catch (e: SecurityException) {
            e.printStackTrace()
        }
    }

    private fun getPerson() {
        val personList = remoteServer?.personList
        log(TAG, "person 列表 $personList")
    }

    override fun onDestroy() {
        super.onDestroy()
        //最后记得unbindService
        unbindService(serviceConnection)
    }
}
```

测试时先 getPerson 再 addPerson 最后 getPerson，输出日志：

```shell
2020-12-24 12:41:00.170 24785-24785/com.xfhy.allinone D/xfhy_aidl: bindService true
2020-12-24 12:41:00.906 24785-24785/com.xfhy.allinone D/xfhy_aidl: onServiceConnected
2020-12-24 12:41:04.253 24785-24785/com.xfhy.allinone D/xfhy_aidl: person 列表 [Person(name=Garen), Person(name=Darius)]
2020-12-24 12:41:05.952 24785-24785/com.xfhy.allinone D/xfhy_aidl: addPerson result = true
2020-12-24 12:41:09.022 24785-24785/com.xfhy.allinone D/xfhy_aidl: person 列表 [Person(name=Garen), Person(name=Darius), Person(name=盖伦)]
```

注意：==在客户端调用这些远程方法时是同步调用，在主线程调用可能会导致 ANR，应该在子线程去调用==。



##### 3.2.4 oneway 关键字（异步）

将 aidl 接口的方法前加上 `oneway` 关键字则这个方法就是异步调用，不会阻塞调用线程。当客户端调用服务端的方法不需要知道返回结果时，使用异步调用可以提高客户端的执行效率。



##### 3.2.5 线程安全

**AIDL 的方法是在服务端的 Binder 线程池中执行的**，所以多个客户端同时进行连接且操作数据时可能存在多个线程同时访问的情形。这时就需要在服务端 AIDL 方法中处理多线程同步问题。

先看下服务端的 AIDL 方法是在哪个线程中:

```kotlin
override fun addPerson(person: Person?): Boolean {
    log(TAG, "服务端 addPerson() 当前线程 : ${Thread.currentThread().name}")
    return mPersonList.add(person)
}

//日志输出
服务端 addPerson() 当前线程 : Binder:3961_3
```

可以看到，确实是在非主线程中执行的，那确实会存在多线程安全问题。这就需要将 mPersonList 的类型修改为 CopyOnWriteArrayList，以确保线程安全：

```kotlin
//服务端
private val mPersonList = CopyOnWriteArrayList<Person?>()

override fun getPersonList(): MutableList<Person?> = mPersonList

//客户端
private fun getPerson() {
    val personList = remoteServer?.personList
    personList?.let {
        log(TAG, "personList ${it::class.java}")
    }
}

//输出日志
personList class java.util.ArrayList
```

另外还有 ConcurrentHashMap 也是同样的道理，这里就不验证了。



##### 3.2.6 AIDL 监听器(观察者? 双向通信?)

上面的案例中，只能在客户端每次去调服务端的方法然后获得结果。若想服务端数据有变动就通知一下客户端，这就需要添加监听器了。



因为这个监听器 Listener 是需要跨进程的，这里首先就需要为这个 Listener 创建一个 aidl 的回调接口`IPersonChangeListener.aidl`

```java
interface IPersonChangeListener {
 	 // 这里由服务端调用此接口，因此服务端其实充当 "Client"，数据流通方向标记为 in 更合理
	  void onPersonDataChanged(in Person person);
}
```

有了监听器，还需要在 `IPersonManager.aidl` 中加上注册/反注册监听的方法：

```java
interface IPersonManager {
    ......
    void registerListener(IPersonChangeListener listener);
    void unregisterListener(IPersonChangeListener listener);
}
```

现在我们在服务端实现这个注册/反注册的方法，这还不简单吗? 搞一个` List<IPersonChangeListener>` 来存放 Listener 集合，当数据变化的时候遍历这个集合，通知一下这些Listener就行。



仔细想想这样真的行吗?  这个 `IPersonChangeListener` 是需要跨进程的，那么客户端每次传过来的对象是经过序列化与反序列化的，服务端这边接收到的根本不是客户端传过来的那个对象。 虽然传过来的 Listener 不同，但是用来通信的 Binder 是同一个，利用这个原理 Android 提供了一个 `RemoteCallbackList` 的东西，专门用于存放监听接口的集合的。`RemoteCallbackList` 内部将数据存储于一个 ArrayMap 中，key 就是用来传输的 binder，value 就是监听接口的封装。如下：

```java
//RemoteCallbackList.java  源码有删减
public class RemoteCallbackList<E extends IInterface> {
    ArrayMap<IBinder, Callback> mCallbacks = new ArrayMap<IBinder, Callback>();

    private final class Callback implements IBinder.DeathRecipient {
        final E mCallback;
        final Object mCookie;

        Callback(E callback, Object cookie) {
            mCallback = callback;
            mCookie = cookie;
        }
    }

    public boolean register(E callback, Object cookie) {
        synchronized (mCallbacks) {
            IBinder binder = callback.asBinder();
            Callback cb = new Callback(callback, cookie);
            mCallbacks.put(binder, cb);
            return true;
        }
    }
}
```

`RemoteCallbackList` 内部在操作数据的时候已经做了线程同步的操作，所以不需要单独做额外的线程同步操作。现在来实现一下这个注册/反注册方法：

```kotlin
private val mListenerList = RemoteCallbackList<IPersonChangeListener?>()

private val mBinder: Binder = object : IPersonManager.Stub() {
    .....
    override fun registerListener(listener: IPersonChangeListener?) {
        mListenerList.register(listener)
    }

    override fun unregisterListener(listener: IPersonChangeListener?) {
        mListenerList.unregister(listener)
    }
}
```

`RemoteCallbackList` 添加与删除数据对应着 `register()/unregister()`方法，然后我们模拟一下服务端数据更新的情况，开个线程每隔 5 秒添加一个 Person 数据，然后通知一下观察者：

```kotlin
//死循环 每隔5秒添加一次person,通知观察者
private val serviceWorker = Runnable {
    while (!Thread.currentThread().isInterrupted) {
        Thread.sleep(5000)
        val person = Person("name${Random().nextInt(10000)}")
        log(AidlActivity.TAG, "服务端 onDataChange() 生产的 person = $person}")
        mPersonList.add(person)
        onDataChange(person)
    }
}
private val mServiceListenerThread = Thread(serviceWorker)

//数据变化->通知观察者
private fun onDataChange(person: Person?) {
    //1. 使用RemoteCallbackList时,必须首先调用beginBroadcast(), 最后调用finishBroadcast(). 得成对出现
    //这里拿到的是监听器的数量
    val callbackCount = mListenerList.beginBroadcast()
    for (i in 0 until callbackCount) {
        try {
            //这里try一下避免有异常时无法调用finishBroadcast()
            mListenerList.getBroadcastItem(i)?.onPersonDataChanged(person)
        } catch (e: RemoteException) {
            e.printStackTrace()
        }
    }
    
    //3. 最后调用finishBroadcast()  必不可少
    mListenerList.finishBroadcast()
}

override fun onCreate() {
    .....
    mServiceListenerThread.start()
}

override fun onDestroy() {
    super.onDestroy()
    mServiceListenerThread.interrupt()
}
```

服务端实现好了，客户端就比较好办：

```kotlin
private val mPersonChangeListener = object : IPersonChangeListener.Stub() {
    override fun onPersonDataChanged(person: Person?) {
        log(TAG, "客户端 onPersonDataChanged() person = $person}")
    }
}

private fun registerListener() {
    remoteServer?.registerListener(mPersonChangeListener)
}

private fun unregisterListener() {
    remoteServer?.asBinder()?.isBinderAlive?.let {
        remoteServer?.unregisterListener(mPersonChangeListener)
    }
}
```

因为是需要跨进程通信的，所以需要继承自 IPersonChangeListener.Stub 从而生成一个监听器对象。最后输出日志如下:

```shell
服务端 onDataChange() 生产的 person = Person(name=name9398) hashcode = 130037351}
客户端 onPersonDataChanged() person = Person(name=name9398) hashcode = 217703225}
```



##### 3.2.7 Binder 死亡通知

服务端进程可能随时会被杀掉，这时需要在客户端能够被感知到 binder 已经死亡，从而做一些收尾清理工作或者进程重新连接。有如下 4 种方式能知道服务端是否已经挂掉：

1. 调用 binder 的 `pingBinder()` 检查，返回 false 则说明远程服务失效
2. 调用 binder 的 `linkToDeath()` 注册监听器，当远程服务失效时，就会收到==回调==
3. 绑定 Service 时用到的 ServiceConnection 有个 `onServiceDisconnected()` 回调在服务端断开时也能收到==回调==
4. 客户端调用远程方法时，抛出 `DeadObjectException(RemoteException)`



写份代码验证一下，在客户端修改为如下:

```kotlin
private val mDeathRecipient = object : IBinder.DeathRecipient {
    
    override fun binderDied() {
        //监听 binder died
        log(TAG, "binder died")
        //移除死亡通知
        mService?.unlinkToDeath(this, 0)
        mService = null
        //重新连接
        connectService()
    }
}

private val serviceConnection = object : ServiceConnection {
    
    override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
        this@AidlActivity.mService = service
        log(TAG, "onServiceConnected")

        //给binder设置一个死亡代理
        service?.linkToDeath(mDeathRecipient, 0)

        mRemoteServer = IPersonManager.Stub.asInterface(service)
    }

    override fun onServiceDisconnected(name: ComponentName?) {
        log(TAG, "onServiceDisconnected")
    }
}
```

绑定服务之后,将服务端进程杀掉,输出日志如下:

```shell
//第一次连接
bindService true
onServiceConnected, thread = main

//杀掉服务端 
binder died, thread = Binder:29391_3
onServiceDisconnected, thread = main

//重连
bindService true
onServiceConnected, thread = main
```

确实是监听到服务端断开连接的时刻，然后重新连接也是 ok 的。 

注意：==`binderDied()` 方法是运行在子线程的，`onServiceDisconnected()`是运行在主线程的，如果要在这里更新UI，得注意一下==。



##### 3.2.8 权限验证

有没有注意到，目前的 Service 是完全暴露的，任何 app 都可以访问这个 Service 并且远程调用 Service 的服务，这样不太安全。可以在清单文件中加入自定义权限，然后在 Service 中校验一下客户端有没有这个权限即可。如下：

```xml
<permission
    android:name="com.xfhy.allinone.ipc.aidl.ACCESS_PERSON_SERVICE"
    android:protectionLevel="normal" />
```

客户端需要在清单文件中声明这个权限:

```xml
<uses-permission android:name="com.xfhy.allinone.ipc.aidl.ACCESS_PERSON_SERVICE"/>
```

服务端 Service 校验权限:

```kotlin
override fun onBind(intent: Intent?): IBinder? {
    val check = checkCallingOrSelfPermission("com.xfhy.allinone.ipc.aidl.ACCESS_PERSON_SERVICE")
    if (check == PackageManager.PERMISSION_DENIED) {
        log(TAG,"没有权限")
        return null
    }
    log(TAG,"有权限")
    return mBinder
}
```

