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

