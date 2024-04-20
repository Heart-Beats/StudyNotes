# Socket编程



[TOC]



### 1. Socket 编程

> Socket，又称为套接字，Socket 是计算机网络通信的基本的技术之一。如今大多数基于网络的软件，如浏览器，即时通讯工具甚至是 P2P 下载都是基于Socket实现的。它属于 TCP/IP 协议簇中的传输层。



#### 1.1 文件描述符

- Open-Read-Write-Close

  Unix 的输入输出 (IO) 系统遵循 ==**Open-Read-Write-Close**== 这样的操作范本。

  当一个用户进程进行 IO 操作之前，它需要调用 Open 来指定并获取待操作文件或设备的读取/写入权限。一旦 IO 操作对象被打开，那么这个用户进程可以对这个对象进行一次或多次的读取/写入操作。

  Read 操作用来从 IO 操作对象读取数据，并将数据传递给用户进程。Write 操作用来将用户进程中的数据传递（写入）到 IO 操作对象。 

  当所有的 Read 和 Write 操作结束之后，用户进程需要调用 Close 来通知系统其完成对 IO 对象的使用。

- IPC

  在 Unix 开始支持进程间通信（InterProcess Communication，简称 IPC ）时，IPC 的接口就设计的类似文件 IO 操作接口。在 Unix 中，一个进程会有一套可以进行读取写入的 IO 描述符。IO 描述符可以是文件，设备或者是通信通道（socket 套接字）。

  

一个文件描述符由三部分组成：创建（打开 socket），读取写入数据（接收和发送到 socket）还有销毁（关闭 socket）。



在 Unix 系统中，类 [BSD](https://zh.wikipedia.org/wiki/BSD) 版本的 IPC 接口是作为 TCP 和 UDP 协议之上的一层进行实现的。消息的目的地使用 socket 地址来表示。**一个 socket 地址是由网络地址和端口号组成的通信标识符**。



进程间通信操作需要一对 socket，通过两个进程间的不同 socket 进行数据传输来完成。当一个消息执行发出后，这个消息在发送端的 socket 中处于排队状态，直到下层的网络协议将这些消息发送出去。当消息到达接收端的 socket 后，其也会处于排队状态，直到接收端的进程对这条消息进行了接收处理。



#### 1.2 TCP 和 UDP 通信

关于 socket 编程，有 UDP 和 TCP 这两种通信协议可以进行选择。



1. UDP

   数据报通信协议，就是常说的 UDP（User Data Protocol 用户数据报协议）。UDP 是一种无连接的协议，这就意味着每次发送数据报时，需要同时发送本机的 socket 描述符和接收端的 socket 描述符。因此，在每次通信时都需要发送额外的数据。

   

2. TCP

   流通信协议，也叫做 TCP(Transfer Control Protocol，传输控制协议)。和 UDP 不同，TCP 是一种基于连接的协议。在使用流通信之前，必须在通信的一对 socket 之间建立连接。其中一个 socket 作为服务器进行监听连接请求。另一个则作为客户端进行连接请求。一旦两个 socket 建立好连接，他们可以进行单向或双向数据传输。



下表为两者的简易区别：

|              | UDP                                        | TCP                                    |
| :----------- | :----------------------------------------- | -------------------------------------- |
| 是否连接     | 无连接                                     | 面向连接                               |
| 是否可靠     | 不可靠传输，不使用流量控制和拥塞控制       | 可靠传输，使用流量控制和拥塞控制       |
| 连接对象个数 | 支持一对一，一对多，多对一和多对多交互通信 | 只能是一对一通信                       |
| 传输方式     | 面向报文                                   | 面向字节流                             |
| 首部开销     | 首部开销小，仅 8 字节                      | 首部最小 20 字节，最大 60 字节         |
| 适用场景     | 适用于实时应用（IP电话、视频会议、直播等） | 适用于要求可靠传输的应用，例如文件传输 |



关于这两者的区别，现实生活中有非常形象的两个系统与之对应：

- UDP - 邮局系统

  只管信息的传递，但不能保证信息的有序、可达性。但是大部分信息会是可达不丢失的

- TCP - 电话系统

  信息传递之前需要建立连接，可保证信息的有序、可达性。

  



------



### 2.  Java 中的 socket 编程

通过上述介绍， socket 编程本质上就是通过不同的协议实现不同的进程之间通信。



#### 2.1 TCP 通信

这里先介绍基于 TCP 协议的 socket 编程， 因为这个协议远远比 UDP 协议使用的要广泛。

Java 中 TCP 的实现分为两个类：**`Socket`** 和 **`ServerSocket`**， Socket 可看做是通信连接两端的收发器，服务器与客户端都通过 Socket 来收发数据。

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5358f55c863a4270a9e5200d8b88cac2~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp" alt="在这里插入图片描述" style="zoom:50%;" />



##### 2.1.1 客户端

1. 开启 Socket

   ```java
   String host = "127.0.0.1";
   int port = 8919;
   Socket client = new Socket(host, port);
   ```

   如上所示，即可打开一个指定 IP  与 端口的 Socket。

   注意：0~1023 这些端口都已经被系统预留给一些常用的服务，如： 邮件，FTP和HTTP。因此需要选择一个大于 1023 的端口。

2. 写入/读取数据

   ```java
   // 写入数据
   Writer writer = new OutputStreamWriter(client.getOutputStream());
   writer.write("Hello From Client");
   writer.flush();
   writer.close();
   
   
   // 读取数据
   InputStream inputStream = client.getInputStream();
   BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
   StringBuilder stringBuffer = new StringBuilder();
   String line;
   while ((line = bufferedReader.readLine()) != null) {
       stringBuffer.append(line);
   }
   String result = stringBuffer.toString();
   System.out.println(result);
   
   inputStream.close();
   bufferedReader.close();
   ```

   正常的 IO 流操作，写入数据使用输出流，读取数据使用输入流。

3. 关闭 Socket

   ```java
   client.close();
   ```

   操作完成之后记得关闭 socket。



##### 2.1.2 服务端

1. 开启 Socket

   ```java
   int port = 8919;
   ServerSocket server = new ServerSocket(port);
   Socket socket = server.accept();
   ```

   这里的端口号需要与客户端一致，==**accept 方法是一个阻塞方法，在服务器端与客户端之间建立连接之前会一直等待阻塞**==，连接成功之后会返回客户端请求的 Socket（不同进程，非同一对象）。 

2. 写入/读取数据

   写入/读取数据的方式与客户端一致，这里不再作介绍。

3. 关闭 Socket

   与客户端一致，这里不再作介绍。





#### 2.2 UDP 通信

Java 中 UDP 的实现也分为两个类：**`DatagramPacket`** 和 **`DatagramSocket`**。

DatagramPacket 将数据字节填充到 UDP 包中，这称为**数据报（datagram)**。DatagramSocket 可以收发 UDP 数据报。

发送数据，需要将数据放到 DatagramPacket 中，使用 DatagramSocket 来发送这个包。接收数据，也可以从 DatagramSocket 中接收一个 DatagramPacket 对象，然后获取该包的内容。



<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20230626161407026.png" alt="image-20230626161407026" style="zoom: 80%;" />



因此可以看出：

- **UDP没有两台主机间唯一连接的概念**

- TCP socket 把网络连接看作是流：通过从 Socket 得到的输入和输出流来收发数据。**UDP不支持这一点，处理的总是单个数据报包。**

  因此对于有大量数据报的场景，可能产生阻塞。



##### 2.2.1 客户端

1. 开启 Socket

   ```java
   DatagramSocket client = new DatagramSocket(0);
   client.connect("localhost", 5555);
   client.setSoTimeout(4 * 1000);  // receive 方法接收数据时的阻塞超时时间，超过会抛出异常
   ```

   这里有以下几点需要说明一下：

   - **匿名端口**

     端口号为 0 即匿名端口，它可让操作系统自己选择一个端口，这里使用它是因为作为客户端并不用关心是用哪个端口发送的。

   - **连接指定的服务器**

     这里使用了 connect 方法连接指定服务器，但是 UDP 不是无连接吗？
     其实这个方法并不是真连接，而是在 DatagramSocket 对象中保存服务器端的 IP 和端口号，确保它只能往指定的地址和端口发送 UDP 包，不能往其他地址和端口发送。但这并不是 UDP 的限制（UDP 支持一对多），而是 Java 内置了安全检查。

   - **超时时间**

     设置超时对于 UDP 比 TCP 甚至更重要，因为 TCP 中会导致 IOException 异常的很多问题在 UDP 中只会悄无声息地失败。例如，如果远程主机未在目标端口监听，就会永远也收不到回音。

2. 发送/收取数据

   ```java
   // 写入数据
   InetAddress host = InetAddress.getByName("localhost");
   byte[] dataBytes = "Hello From Client".getBytes();
   DatagramPacket request = new DatagramPacket(dataBytes, dataBytes.length , host, 5555);
   client.send(request);
   
   
   // 读取数据
   byte[] bytes = new byte[1024];
   DatagramPacket response = new DatagramPacket(bytes, bytes.length);
   client.receive(response);
   String result = new String(response.getData(), response.getOffset(), response.getLength());
   System.out.println(result);
   ```

   注意：==**这里的 receive 方法也是一个阻塞方法，直到收到数据报后才会取消阻塞**==。

3. 关闭 Socket

   ```java
   client.close();
   ```

   



##### 2.2.1 服务端

1. 开启 Socket

   ```java
   int port = 5555;
   DatagramSocket server = new DatagramSocket(port);
   ```

   服务端不能选择一个匿名端口进行绑定 Socket， 需要定义客户端发送数据时指定的端口。 ==**UDP 端口与 TCP 端口独立非互斥，即可使用同一端口**==。同时也无需进行超时时间设置。

2. 发送/收取数据

   ```java
   // 读取客户端发送的数据
   byte[] bytes = new byte[1024];
   DatagramPacket request = new DatagramPacket(bytes, bytes.length);
   server.receive(request);
   String result = new String(response.getData(), response.getOffset(), response.getLength());
   System.out.println(result);
   
   // 返回给客户端的数据
   byte[] data = "Hello From Server".getBytes();
   DatagramPacket response = new DatagramPacket(data, data.length,request.getAddress(), request.getPort());
   server.send(response);
   ```

3. 关闭 Socket

   ```java
   server.close();
   ```




#### 2.3 安全通信

上面介绍的两种方式都是客户端和服务端直接进行通信，不涉及任何的身份验证。然而在实际生产中，此种方式并不安全，所以在 Java 中还有一个安全套接字，它在连接到套接字层使用 SSL/TLS 协议， 接下来看看如何进行使用？



##### 2.3.1 客户端

1. 开启 Socket

   ```java
   String host = "127.0.0.1";
   int port = 8919;
   
   SSLContext sslContext = initSSLContext();
   SSLSocketFactory factory = sslContext.getSocketFactory();
   SSLSocket sslSocketClient = (SSLSocket) factory.createSocket(host, port);
   
   private SSLContext initSSLContext() {
       //准备KeyStore相关信息
       String keyName = "SSL";
       try {
           //初始化SSLContext
           SSLContext sslContext = SSLContext.getInstance(keyName);
   
           // 客户端无需 KeyManager 参数
           sslContext.init(null, new TrustManager[]{new X509TrustManager() {
               @Override
               public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {
   
               }
   
               @Override
               public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {
   
               }
   
               @Override
               public X509Certificate[] getAcceptedIssuers() {
                   return new X509Certificate[0];
               }
           }}, new SecureRandom());
   
           return sslContext;
       } catch (Exception e) {
           throw new RuntimeException(e);
       }
   }
   ```

   可以看到与正常的 TCP 通信相比，这里使用的为 **SSLSocket**， 它实例化需要通过 **SSLSocketFactory**， 而 SSLSocketFactory 是从 **SSLContext**  获取到的，所以需要重点关注 SSLContext 如何实例化的。

2. 发送/收取数据

   ```java
   // 写入数据
   Writer writer = new OutputStreamWriter(sslSocketClient.getOutputStream());
   writer.write("Hello From Client");
   writer.flush();
   writer.close();
   
   
   // 读取数据
   InputStream inputStream = sslSocketClient.getInputStream();
   BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
   StringBuilder stringBuffer = new StringBuilder();
   String line;
   while ((line = bufferedReader.readLine()) != null) {
       stringBuffer.append(line);
   }
   String result = stringBuffer.toString();
   System.out.println(result);
   
   inputStream.close();
   bufferedReader.close();
   ```

   可以看出与 TCP 通信基本没区别，这是因为在与服务端进行数据交互时的 SSL 握手以及数据加解密都被底层默认给处理了。

3. 关闭 Socket

   ```java
   server.close();
   ```



##### 2.3.2 服务端

1. 开启 Socket

   ```java
   String host = "127.0.0.1";
   int port = 8919;
   
   SSLContext sslContext = initSSLContext();
   SSLServerSocketFactory serverSocketFactory = sslContext.getServerSocketFactory();
   SSLServerSocket serverSocket = (SSLServerSocket) serverSocketFactory.createServerSocket();
   serverSocket.bind(new InetSocketAddress(host, port));
   SSLSocket sslSocketServer = serverSocket.accept();
   
   private SSLContext initSSLContext() {
       // 确定当前工作目录
       String currentDirectory = System.getProperty("user.dir");
       // 构建相对路径
       File seckeyFile = new File(currentDirectory, "seckey");
   
       //准备KeyStore相关信息
       String keyName = "SSL";
       File keyStoreFile = seckeyFile;
       char[] keyStorePwd = "123456".toCharArray();
       char[] keyPwd = "123456".toCharArray();
       try {
           KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
           FileInputStream fileInputStream = new FileInputStream(keyStoreFile);
   
           //装载生成的 seckey
           keyStore.load(fileInputStream, keyStorePwd);
   
           //初始化KeyManagerFactory, KeyManager 是服务端用的，用于在客户端请求时发送证书及其公钥
           KeyManagerFactory kmf = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
           kmf.init(keyStore, keyPwd);
   
           //初始化SSLContext
           SSLContext sslContext = SSLContext.getInstance(keyName);
           sslContext.init(kmf.getKeyManagers(), new TrustManager[]{new X509TrustManager() {
   
               // 系统的证书管理
               private X509TrustManager defaultTm;
   
               // 自己的证书管理
               private X509TrustManager myTm;
   
               {
                   TrustManagerFactory tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
   
                   //此处使用 null 会使用默认信任存储来初始化 TrustManagerFactory。
                   tmf.init((KeyStore) null);
                   for (TrustManager trustManager : tmf.getTrustManagers()) {
                       if (trustManager instanceof X509TrustManager) {
                           defaultTm = (X509TrustManager) trustManager;
                           break;
                       }
                   }
   
                   tmf.init(keyStore);
                   for (TrustManager trustManager : tmf.getTrustManagers()) {
                       if (trustManager instanceof X509TrustManager) {
                           myTm = (X509TrustManager) trustManager;
                           break;
                       }
                   }
   
                   // 通过这两个证书管理，可实现信任自己的以及系统的证书
               }
   
               @Override
               public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {
                   try {
                       myTm.checkServerTrusted(chain, authType);
                   } catch (CertificateException e) {
                       // 如果这也失败，这将抛出另一个 CertificateException.
                       defaultTm.checkServerTrusted(chain, authType);
                   }
               }
   
               @Override
               public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {
                   // 如果打算使用客户端证书身份验证，执行与检查服务器相同的操作
                   defaultTm.checkClientTrusted(chain, authType);
               }
   
               @Override
               public X509Certificate[] getAcceptedIssuers() {
                   // 如果打算使用客户端证书身份验证，合并 "defaultTm" 和 "myTm" 的结果。
                   return defaultTm.getAcceptedIssuers();
               }
           }}, new SecureRandom());
   
           return sslContext;
       } catch (Exception e) {
           throw new RuntimeException(e);
       }
   }
   ```

   与正常的 TCP 通信流程类似，只是这里使用的 **SSLServerSocket** 作为服务端套接字，服务端这里创建 SSLContext 还涉及到了证书的使用，因为客户端请求数据时需要下发证书以及公钥进行握手验证。

2. 发送/收取数据

   写入/读取数据的方式与客户端一致，这里不再作介绍。

3. 关闭 Socket

   与客户端一致，这里不再作介绍。

