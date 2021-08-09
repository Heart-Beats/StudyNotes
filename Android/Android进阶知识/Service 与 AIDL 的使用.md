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





