### VPN 开发

本文为在官方文档的基础上进行优化，原文档 [VPN](https://developer.android.com/guide/topics/connectivity/vpn?hl=zh-cn) 可点击链接进行查看。

#### 1. VPN

> Android 为开发者提供了用于创建虚拟专用网 (VPN) 解决方案的 API， 通过 VPN，实际不在网络中的设备也可以安全地访问该网络。
>
> 
>
> Android 包含一个内置的（PPTP 和 L2TP/IPSec）VPN 客户端，有时称为旧版 VPN。在 4.0（API 级别 14）引入了 API，以便应用开发者可以提供自己的 VPN 解决方案，开发者通常会出于以下某个原因构建 VPN 应用：
>
> - 提供内置客户端不支持的 VPN 协议。
> - 帮助用户在不进行复杂配置的情况下连接到 VPN 服务。



##### 1.1 用户体验

Android 提供界面来帮助用户配置、启动和停止 VPN 解决方案。系统界面也会让设备的使用者知晓活动的 VPN 连接。Android 会显示以下适用于 VPN 连接的界面组件：

- 在 VPN 应用首次变为活动状态之前，系统会显示一个连接请求对话框。该对话框会提示设备的使用者确认他们信任 VPN 并接受请求。

- VPN 设置屏幕（设置 > 网络和互联网 > VPN）会显示用户接受了连接请求的 VPN 应用。有一个用于配置系统选项或删除 VPN 的按钮。

- “快捷设置”栏显示当连接处于活动状态时的信息面板。点按标签会显示一个对话框，里面包含更多信息和指向“设置”的链接。

- 状态栏包含一个 VPN（钥匙）图标以表示有效连接。

  

VPN 应用还需要提供界面，以便用户配置服务的选项。例如，可能需要帐号身份验证设置。而且还需要显示以下界面：

- 用于手动启动和停止连接的控件。[始终开启的 VPN](https://developer.android.com/guide/topics/connectivity/vpn?hl=zh-cn#always-on) 可以在需要时连接，但允许用户在首次使用 VPN 时配置连接。
- 服务处于活动状态时发出的不可关闭通知。通知可以显示连接状态或提供更多信息，例如网络统计信息。点击该通知会将应用调入前台。在服务变为非活动状态后移除通知。



##### 1.2 VPN 服务

![`VpnService` 如何将 Android 网络连接到 VPN 网关](https://developer.android.com/static/images/guide/topics/connectivity/vpn-app-arch.svg?hl=zh-cn)

<center>图 1. VpnService 如何将 Android 网络连接到 VPN 网关</center>



之后应用会传输以下数据，用于将设备连接到 VPN 网关：

- 从本地接口的文件描述符读取传出的 IP 数据包，进行加密并发送到 VPN 网关。
- 将传入的数据包（从 VPN 网关接收并解密）写入本地接口的文件描述符。

==注意：在与 VPN 网关之间来回传输数据时，应用必须使用强加密算法。==



##### 1.3  添加 VPN  服务

要将 VPN 服务添加到应用中，需创建一个继承自 [`VpnService`](https://developer.android.com/reference/android/net/VpnService?hl=zh-cn) 的 Android 服务。在 AndroidManifest 中声明 VPN [服务](https://developer.android.com/guide/topics/manifest/service-element?hl=zh-cn)，并添加以下内容：

- 使用 [`BIND_VPN_SERVICE`](https://developer.android.com/reference/android/Manifest.permission?hl=zh-cn#BIND_VPN_SERVICE) 权限保护服务，以便只有系统可以绑定到您的服务。
- 使用 `"android.net.VpnService"` 过滤器来公布服务，以便系统能够找到您的服务。

示例如下：

```xml
<service android:name=".MyVpnService"
         android:permission="android.permission.BIND_VPN_SERVICE">
     <intent-filter>
         <action android:name="android.net.VpnService"/>
     </intent-filter>
</service>
    
```

现在，应用声明了该服务，系统可以在需要时自动启动和停止应用的 VPN 服务。例如，在运行[始终开启的 VPN](https://developer.android.com/guide/topics/connectivity/vpn?hl=zh-cn#always-on) 时，系统会控制您的服务。



##### 1.4 准备 VPN 服务

调用 [`VpnService.prepare()`](https://developer.android.com/reference/android/net/VpnService?hl=zh-cn#prepare(android.content.Context)) 即可使应用准备好成为用户当前的 VPN 服务。

 如果用户尚未授予应用的权限，则该方法会返回 Activity Intent。使用此 Intent 可开启一个请求用户授予 VPN 连接的权限请求框。如果用户已授予权限，则该方法会返回 `null`。



相关代码可如下：

```java
public void prepareVpnService() {
    Intent intent = VpnService.prepare(this);
    if (intent != null) {
        startActivityForResult(intent, 0);
    } else {
        onActivityResult(0, RESULT_OK, null);
    }
}
```

==注意：应用启动后需要始终调用 `VpnService.prepare()`，因为只有一个应用可以是当前准备好的 VPN 服务， 防止被其他应用修改。==



##### 1.5 连接 VPN 服务

服务运行后，就可以建立连接到 VPN 网关的新本地接口。要请求权限并将服务连接到 VPN 网关，需要按以下步骤完成：

1. 调用 [`VpnService.prepare()`](https://developer.android.com/reference/android/net/VpnService?hl=zh-cn#prepare(android.content.Context)) 以询问权限（需要时）。
2. 调用 [`VpnService.protect()`](https://developer.android.com/reference/android/net/VpnService?hl=zh-cn#protect(int)) 以将应用的隧道套接字保留在系统 VPN 外部，并避免发生循环连接。
3. 调用 [`DatagramSocket.connect()`](https://developer.android.com/reference/java/net/DatagramSocket?hl=zh-cn#connect(java.net.SocketAddress)) 以将应用的隧道套接字连接到 VPN 网关。
4. 调用 [`VpnService.Builder`](https://developer.android.com/reference/android/net/VpnService.Builder?hl=zh-cn) 方法以在设备上为 VPN 流量配置新的本地 [TUN](https://en.wikipedia.org/wiki/TUN/TAP) 接口。
5. 调用 [`VpnService.Builder.establish()`](https://developer.android.com/reference/android/net/VpnService.Builder?hl=zh-cn#establish())，以便系统建立本地 TUN 接口并开始通过该接口传送流量。

VPN 网关通常会在握手过程就本地 TUN 接口的设置给出建议。应用调用 [`VpnService.Builder`](https://developer.android.com/reference/android/net/VpnService.Builder?hl=zh-cn) 方法来配置服务，如以下示例所示：

```java
// 配置 VpnService
VpnService.Builder builder = new VpnService.Builder()
    .addAddress("192.168.2.2", 24)
    .addRoute("0.0.0.0", 0)
    .addDnsServer("192.168.1.1");

// 使用预定地址创建本地 TUN 接口。通常使用握手期间从 VPN 网关返回的值
ParcelFileDescriptor localTunnel = builder
    .establish();
```

- [`addAddress()`](https://developer.android.com/reference/android/net/VpnService.Builder?hl=zh-cn#addAddress(java.net.InetAddress, int))

  添加至少一个 IPv4 或 IPv6 地址以及系统指定为本地 TUN 接口地址的子网掩码。通常会在握手过程中收到来自 VPN 网关的 IP 地址和子网掩码。

- [`addRoute()`](https://developer.android.com/reference/android/net/VpnService.Builder?hl=zh-cn#addRoute(java.net.InetAddress, int))

  如果希望系统通过 VPN 接口发送流量，请至少添加一个路由。路由按目标地址过滤。要接受所有流量，请设置开放路由，例如 `0.0.0.0/0` 或 `::/0`。
  
- [`establish()`](https://developer.android.com/reference/android/net/VpnService.Builder?hl=zh-cn#establish()) 

  返回一个 [`ParcelFileDescriptor`](https://developer.android.com/reference/android/os/ParcelFileDescriptor?hl=zh-cn) 实例，供应用从接口缓冲区读取数据包或向其中写入数据包。如果应用尚未准备就绪或撤消了权限，[`establish()`](https://developer.android.com/reference/android/net/VpnService.Builder?hl=zh-cn#establish()) 方法会返回 `null`。



##### 1.6 启动 VPN 服务

VPN 服务可以通过以下方式启动：

- 应用启动服务，通常是因为用户点按了连接按钮。
- 系统启动服务，因为[始终开启的 VPN](https://developer.android.com/guide/topics/connectivity/vpn?hl=zh-cn#always-on) 已开启。

因为  VPN 服务也是一个 Service, 所以也就是 Service 的启动。



##### 1.7 停止 VPN 服务

用户可以使用应用界面来主动停止服务，除此之外， 在系统设置应用的 “VPN” 屏幕中执行如下操作，也会停止服务：

- 断开连接或删除 VPN 应用
- 关闭始终开启的 VPN

这两个操作到会触发系统调用 VPN 服务的 [`onRevoke()`](https://developer.android.com/reference/android/net/VpnService?hl=zh-cn#onRevoke()) 方法， 该方法默认会调用 `Service#stopSelf()`， 如下所示：

```java
public void onRevoke() {
    stopSelf();
}
```

但它可能不会在主线程上调用，如果在这里更新 UI 需要注意。

因此，对于资源的销毁， 可以在 `Service#onDestroy()` 进行统一处理：

- 通过调用 [`DatagramSocket.close()`](https://developer.android.com/reference/java/net/DatagramSocket?hl=zh-cn#close())，向 VPN 网关关闭受保护隧道套接字。
- 通过 [`ParcelFileDescriptor.close()`](https://developer.android.com/reference/android/os/ParcelFileDescriptor?hl=zh-cn#close())，关闭 parcel 文件描述符（无需清空它）。



------



#### 2. 始终开启的 VPN

Android 可以在设备启动时启动 VPN 服务，并在设备开启期间使该服务保持运行。此功能称为“始终开启的 VPN”，适用于 Android 7.0（API 级别 24）或更高版本。

虽然 Android 会维护服务生命周期，但 VPN 网关的连接由 VPN 服务负责。始终开启的 VPN 还可以屏蔽不使用 VPN 的连接。



##### 2.1 用户体验

在 Android 8.0 或更高版本中，系统会显示以下对话框，让设备的使用者知晓始终开启的 VPN：

- 如果始终开启的 VPN 连接断开或无法连接，则用户会看到一条不可关闭的通知。点按该通知会显示一个说明更多内容的对话框。当 VPN 重新连接或有人关闭始终开启的 VPN 选项时，通知会消失。
- 始终开启的 VPN 允许用户屏蔽不使用 VPN 的任何网络连接。开启此选项后，“设置”应用会警告用户必须在 VPN 连接之后才能连接互联网，用户可以继续或取消。



由于系统（而非用户）会启动和停止始终开启的连接，需要调整应用的行为和界面：

1. 停用任何断开连接的界面，因为系统和“设置”应用会控制连接。
2. 在每次应用启动后保存任何配置，并使用最新设置配置连接。由于系统会根据需要启动应用，因此用户可能并不总是想要配置连接。

还可以使用[托管配置](https://developer.android.com/work/managed-configurations?hl=zh-cn)来配置连接。借助托管配置，IT 管理员可远程配置 VPN。



##### 2.2 检测始终开启的 VPN

目前没有 API 可以确认系统是否已启动 VPN 服务，但是我们可以标记用户启动的 VPN 服务，步骤如下：

1. 创建 [`Intent`](https://developer.android.com/reference/android/content/Intent?hl=zh-cn) 实例以启动 VPN 服务。
2. 通过在 Intent 中 [放置 extra](https://developer.android.com/reference/android/content/Intent?hl=zh-cn#putExtra(java.lang.String, java.lang.String)) 来标记该 VPN 服务。
3. 在服务的 [`onStartCommand()`](https://developer.android.com/reference/android/app/Service?hl=zh-cn#onStartCommand(android.content.Intent, int, int)) 方法中，查找 `intent` 参数的 extra 中的标记。

如若未查找到相关标记，即代表是系统启动的 VPN 服务。



##### 2.3 屏蔽的连接

用户可以强制所有流量使用 VPN，系统会屏蔽所有不使用 VPN 的网络流量。用户可以在“设置”的 VPN 选项面板中找到“屏蔽未使用 VPN 的所有连接”开关。

**注意**：当非 VPN 流量被屏蔽时，不在[允许列表](https://developer.android.com/guide/topics/connectivity/vpn?hl=zh-cn#allowed-apps)中或者在[禁止列表](https://developer.android.com/guide/topics/connectivity/vpn?hl=zh-cn#disallowed-apps)中的应用会丢失网络连接。在生成允许或禁止列表时，请考虑警告用户。要了解详情，请参阅以下[按应用开启的 VPN](#3. 按应用开启的 VPN) 部分。



##### 2.4 停用始终开启的 VPN

如果应用目前无法支持始终开启的 VPN，可以将 [`SERVICE_META_DATA_SUPPORTS_ALWAYS_ON`](https://developer.android.com/reference/android/net/VpnService?hl=zh-cn#SERVICE_META_DATA_SUPPORTS_ALWAYS_ON) 服务元数据设置为 `false`，从而停用该选项（在 Android 8.1 或更高版本中）。按如下所示：

```xml
<service android:name=".MyVpnService"
         android:permission="android.permission.BIND_VPN_SERVICE">
     <intent-filter>
         <action android:name="android.net.VpnService"/>
     </intent-filter>
     <meta-data android:name="android.net.VpnService.SUPPORTS_ALWAYS_ON"
             android:value="false"/>
</service>
```

当应用停用始终开启的 VPN 时，系统会停用“设置”中的选项界面控件。



#### 3. 按应用开启的 VPN

VPN 应用可以过滤允许哪些已安装的应用通过 VPN 连接发送流量。==可以创建允许列表，也可以创建禁止列表，但不能同时创建这两者==。如果不创建允许或禁止列表，系统会通过 VPN 发送所有网络流量。



VPN 应用必须先设置列表，然后建立连接。如果需要更改列表，请建立新的 VPN 连接。示例代码如下：

```java
// 定义允许访问 VPN 的应用包名列表
String[] appPackages = {
    "com.android.chrome",
    "com.google.android.youtube",
    "com.example.a.missing.app"};

// 循环遍历定义的包名，在将应用程序添加到允许列表之前确认应用已安装
VpnService.Builder builder = new VpnService.Builder();
PackageManager packageManager = getPackageManager();
for (String appPackage: appPackages) {
  try {
    packageManager.getPackageInfo(appPackage, 0);
    builder.addAllowedApplication(appPackage);
  } catch (PackageManager.NameNotFoundException e) {
    // 应用未安装
  }
}

// 完成 VPN 接口配置.
ParcelFileDescriptor localTunnel = builder
    .addAddress("2001:db8::1", 64)
    .addRoute("::", 0)
    .establish();
```



##### 3.1 允许的应用

要将应用添加到允许列表中，请调用 [`VpnService.Builder.addAllowedApplication()`](https://developer.android.com/reference/android/net/VpnService.Builder?hl=zh-cn#addAllowedApplication(java.lang.String))。

- 允许的应用将会使用 VPN，而其他所有应用都将使用系统网络，就像 VPN 未运行一样。

- 当允许列表为空时，所有应用都将使用 VPN。



##### 3.2 禁止的应用

要将应用添加到禁止列表中，请调用 [`VpnService.Builder.addDisallowedApplication()`](https://developer.android.com/reference/android/net/VpnService.Builder?hl=zh-cn#addDisallowedApplication(java.lang.String))。

- 禁止的应用使用系统网络，就像 VPN 未运行一样，而所有其他应用都将使用 VPN。
- 当禁止列表为空时，所有应用都将使用 VPN。



#### 4. 绕过 VPN

VPN 服务还可让应用绕过 VPN 并选择自己的网络。要绕过 VPN，请在建立 VPN 接口时调用 [`VpnService.Builder.allowBypass()`](https://developer.android.com/reference/android/net/VpnService.Builder?hl=zh-cn#allowBypass())，启动 VPN 服务后，无法更改此值。



如果应用绕过 VPN 但没有将其进程或套接字绑定到特定网络，应用的网络流量仍会继续通过 VPN 发送。应用绑定到特定网络后，当有人屏蔽不通过 VPN 发送的流量时， 该应用会失去网络连接。



因此应用想绕过 VPN 使用特定网络发送流量时，需要分为两步：

1. 应用需在连接套接字之前调用 [`ConnectivityManager.bindProcessToNetwork()`](https://developer.android.com/reference/android/net/ConnectivityManager?hl=zh-cn#bindProcessToNetwork(android.net.Network)) 或 [`Network.bindSocket()`](https://developer.android.com/reference/android/net/Network?hl=zh-cn#bindSocket(java.net.Socket)) 等方法绑定特定网络。
2. 调用 `VpnService.Builder.allowBypass()` 绕过 VPN



------



#### 5. VPN 应用交互时序图

![image-20230625120038287](https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20230625120038287.png)