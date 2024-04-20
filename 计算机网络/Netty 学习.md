### Netty 学习



[TOC]





> Netty 是基于Java NIO 实现的开源网络通信框架， 它在高性能网络编程中有着大量的应用，比如很多公司会基于 Netty 来实现 OA、消息网关、云盘等涉及大量客户端并发访问的应用，一些开源中间件也将 Netty 作为底层的网络通讯组件，比如 RocketMQ、ElasticSearch、Dubbo、Hadoop等。
>
> 
>
> 那么，既然 Netty 是基于Java NIO 实现的，为什么不直接使用 Java NIO 呢？
>
> 
>
> 原生的 Java NIO 编程，对编程能力要求比较高，需要处理连接异常、网络闪断、拆包粘包、网络拥塞、长短连接等各种各样的网络通讯细节问题，对于大部分人和中小公司来说，这是一件非常困难且耗时的事情。并且，原生 Java NIO 还有一个臭名昭著的 *Epoll Bug*，它会导致 Selector空轮询，最终导致 CPU 100%。
>
> 
>
> 因此，Netty 这个网络通信框架诞生了，Netty 在底层帮我们处理了各类网络通讯细节问题，并且做了很多性能优化，也提供了很多高阶功能。基于 Netty 简化后的网络编程 API，我们只需要专注于业务处理逻辑，就可以很轻松地开发出高性能、高并发、高可靠的应用程序。





### 1. Netty 入门示例

首先需要引入 Netty 的依赖，这里以 Maven 引入为例：

```xml
<dependency>
    <groupId>io.netty</groupId>
    <artifactId>netty-all</artifactId>
    <version>4.1.94.Final</version>
</dependency>
```



#### 1.1 服务端

```java
class NettyServer {

    public static void main(String[] args) {
        // Acceptor 线程池
        EventLoopGroup parentGroup = new NioEventLoopGroup();
        // Processor 线程池
        EventLoopGroup childGroup = new NioEventLoopGroup();

        try {
            // 1、服务器端的启动器，负责装配下方的netty组件，启动服务器
            ServerBootstrap serverBootstrap = new ServerBootstrap()
                    // 2、创建 NioEventLoopGroup，可以简单理解为 线程池 + Selector
                    .group(parentGroup, childGroup)
                    // 3、选择服务器的 Socket 实现类， NioServerSocketChannel 表示基于 NIO 实现
                    .channel(NioServerSocketChannel.class)
                    .option(ChannelOption.SO_KEEPALIVE, true) // 对ServerSocketChannel的一些配置
                    .option(ChannelOption.SO_BACKLOG, 1024)
                    // 4、childHandler 的作用是监听客户端与服务端读写通道的成功连接，作用是添加别的自定义 handler
                    .childHandler(new ChannelInitializer<NioSocketChannel>() {
                        @Override
                        protected void initChannel(NioSocketChannel nioSocketChannel) throws Exception {

                            // 5、自定义 handler，即业务处理类， 使用上一个处理器的处理结果
                            nioSocketChannel.pipeline().addLast(new NettyServerHandler());
                        }
                    });

            // 6、ServerSocketChannel 绑定 8080 端口, 同步等待 Netty Server 启动，并监控端口
            ChannelFuture channelFuture = serverBootstrap.bind(8080).sync();

            // 同步阻塞等待 Netty Server 关闭
            channelFuture.channel().closeFuture().sync();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }finally {
            parentGroup.shutdownGracefully();
            childGroup.shutdownGracefully();
        }
    }
}
```

大部分都是模板代码，主要分为以下六步：

1. 定义启动器，负责装配 Nettty 组件， 这里服务端采用：`ServerBootstrap`
2. 创建事件循环组，可以理解为 Selector + 线程池 的组合
3. Channel 实现，定义与客户端进行通信的通道
4. 定义 ChannelInitializer， 监听通道的成功连接
5. 自定义业务处理类， 即添加自定义  `ChannelHandler`，常使用继承自 `ChannelInboundHandlerAdapter` 的子类
6. 绑定监控端口号，同步等待客户端连接



按照上述模板步骤即可实现服务器的配置启动，接下来就只需要关注自己的业务处理即可，即上述的第五步。示例如下：

```java
class NettyServerHandler extends ChannelInboundHandlerAdapter {

    /**
     * 当收到客户端的消息时，调用此方法
     */
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        // 1.读取请求的内容
        ByteBuf requestBuffer = (ByteBuf) msg;
        byte[] requestBytes = new byte[requestBuffer.readableBytes()];
        requestBuffer.readBytes(requestBytes);
        String request = new String(requestBytes, "UTF-8");
        System.out.println("接收到的请求：" + request);

        // 2.写入响应
        String response = "你好，我收到你的消息了";
        ByteBuf responseBuffer = Unpooled.copiedBuffer(response.getBytes());
        ctx.write(responseBuffer);
    }

    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
        // flush 客户端响应
        ctx.flush();
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
        // 出现异常时，关闭与客户端的连接
        ctx.close();
    }
}
```

也基本为模板代码，只需要在 channelRead 方法中处理数据的输入/输出就能实现与客户端的通信。



#### 1.2 客户端

```java
class NettyClient {
    	
    public static void main(String[] args) throws InterruptedException {
        NioEventLoopGroup group = new NioEventLoopGroup();

        try {
            // 1、启动类
            Bootstrap bootstrap = new Bootstrap()
                    // 2、添加EventLoop
                    .group(group)
                    // 3、选择客户端的 Socket 实现类，NioSocketChannel 表示基于 NIO 实现
                    .channel(NioSocketChannel.class)
                    .option(ChannelOption.TCP_NODELAY, true)
                    // 4、childHandler 的作用是监听客户端与服务端读写通道的成功连接，作用是添加别的自定义 handler
                    .handler(new ChannelInitializer<NioSocketChannel>() {
                        @Override
                        protected void initChannel(NioSocketChannel channel) throws Exception {

                            // 5、自定义 handler，即业务处理类， 使用上一个处理器的处理结果
                            channel.pipeline().addLast(new NettyClientHandler());
                        }
                    });

            //6、指定要连接的服务器和端口号，使用 sync() 进行同步阻塞，直到连接建立
            ChannelFuture channelFuture = bootstrap.connect("localhost", 8080).sync();

            // 同步阻塞等待 channel 关闭
            channelFuture.channel().closeFuture().sync();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            group.shutdownGracefully().sync();
        }
    }
}
```

与服务端类似，客户端大部分也是模板代码，也分为以下六步：

1. 定义启动器，负责装配 Nettty 组件， 这里客户端采用：`Bootstrap`
2. 创建事件循环组，可以理解为 Selector + 线程池 的组合
3. Channel 实现，定义与服务端进行通信的通道
4. 定义 ChannelInitializer， 监听通道的成功连接
5. 自定义业务处理类， 即添加自定义  `ChannelHandler`，常使用继承自 `ChannelInboundHandlerAdapter` 的子类
6. 指定连接的服务器和端口号，同步等待连接建立



同样的，客户端的业务处理类与服务端也相似，如下所示：

```java
class NettyClientHandler extends ChannelInboundHandlerAdapter {

    /**
     * 与 Server 建立连接后，调用此方法
     */
    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        byte[] requestBytes = "你好，我发送第一条消息".getBytes();
        ByteBuf byteBuf = Unpooled.copiedBuffer(requestBytes);

        // 向服务端发送数据
        ctx.writeAndFlush(byteBuf);
    }

    /**
     * 当收到服务端的消息时，调用此方法
     */
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        // 读取服务端的响应
        ByteBuf responseBuffer = (ByteBuf) msg;
        byte[] responseBytes = new byte[responseBuffer.readableBytes()];
        responseBuffer.readBytes(responseBytes);
        String response = new String(responseBytes, "UTF-8");
        System.out.println("接收到服务端的响应：" + response);
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
		// 出现异常时，关闭与服务端的连接
        ctx.close();
    }
}
```



------



### 2. Netty 常用核心组件

通过上面的示例，可以看出 Netty 的编程基于一定的范式，常用的组件就是那么几个， 那么接下来就看看这些常用的核心组件。



#### 2.1 Bootstrap

Bootstrap 类是 Netty 提供的一个便利工厂类，可以通过它来完成 Netty 客户端或服务端的组件组装，以及 Netty 程序的初始化。

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/20211017221146803.png" alt="img" style="zoom: 50%;" />

- **`ServerBootstrap`：**服务端的组件组装工厂类
- **`Bootstrap`：**客户端的组件组装工厂类



#### 2.2 Channel

在 Netty 中，通道（Channel）是核心概念之一，代表着网络连接。Channel 负责进行网络通信：既可以写入数据到对端，也可以从对端读取数据。



Netty 没有直接使用 Java NIO 的 Channel 通道，而是自己对 Channel 通道进行了封装。对应于不同的协议，Netty 中常见的通道类型如下：

- `NioSocketChannel`：TCP Socket 传输通道
- `NioServerSocketChannel`：TCP Socket 服务器端监听通道
- `NioDatagramChannel`：UDP 传输通道
- `NioSctpChannel`：Sctp 传输通道
- `NioSctpServerChannel`：Sctp 服务器端监听通道
- `OioSocketChannel`：同步阻塞式 TCP Socket 传输通道
- `OioServerSocketChannel`：同步阻塞式 TCP Socket 服务器端监听通道
- `OioDatagramChannel`：同步阻塞式 UDP 传输通道
- `OioSctpChannel`：同步阻塞式 Sctp 传输通道
- `OioSctpServerChannel`：同步阻塞式 Sctp 服务器端监听通道



这里只介绍最核心的 NioSocketChannel 和 NioServerSocketChannel 。



在 Netty 的 NioSocketChannel 内部封装了一个 Java NIO 的 SelectableChannel 成员。通过这个内部的 Java NIO 通道，Netty 的 NioSocketChannel 通道上的 IO 操作，最终会落地到 Java NIO 的 SelectableChannel 底层通道：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/20211017221207585.png" alt="img" style="zoom: 50%;" />

在 Netty 中，将有接收关系的 `NioServerSocketChannel` 和 `NioSocketChannel` ，叫作**父子通道**。其中 NioServerSocketChannel 是服务端负责监听和接收客户端连接的，也叫父通道（Parent Channel）。对于每一个接收到的 NioSocketChannel 传输类通道，也叫子通道（Child Channel）。

> 本质上，Netty 中的父子通道其实可以理解成 Java NIO 中的 **ServerSocketChannel** 和 **SocketChannel** 。



通道的抽象类 `AbstractChannel` 的构造函数如下：

```java
protected AbstractChannel(Channel parent) {
    this.parent = parent;                 // 父通道
    id = newId();
    unsafe = new Unsafe();                 // 底层的NIO 通道,完成实际的IO操作
    pipeline = new ChannelPipeline();     // 一条通道，拥有一条流水线
}
```

几乎所有的通道实现类都继承了 AbstractChannel 抽象类，都拥有上面的 `parent` 和 `pipeline` 两个属性成员：

- **parent**

  每一条通道都会有一个父通道。对于 `NioServerSocketChannel` 来说，其父通道为 null；而对于 `NioSocketChannel` 来说，其父通道为  `NioServerSocketChannel` ；

- **pipeline**

  每个通道拥有一条属于自己的 ChannelPipeline 处理器流水线，Netty 对通道进行初始化时，默认将 pipeline 初始化为 `DefaultChannelPipeline` 实例。



#### 2.3 Handler

在 Netty 中，Handler 是核心的业务处理组件，从开发人员的视角看，有 **入站** 和 **出站** 两种类型。

- **入站**

  触发的方向为自底向上，即从底层 Channel 通道往 Hander 处理器，一般都继承 `ChannelInboundHandler` 入站处理器。当数据或者信息入站到 Netty 通道时，Netty 将触发 ChannelInboundHandler 对应的入站 API，进行入站操作处理；

- **出站**

  触发的方向为自顶向下，即从 Hander 处理器往底层 Channel 通道，一般都继承 `ChannelOutboundHandler` 出站处理器。当业务处理完成后，需要操作 Java NIO 底层通道时，通过一系列的 ChannelOutboundHandler 出站处理器，完成 Netty 通道到底层通道的操作。

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/20211017221224509.png" alt="img" style="zoom: 67%;" />

> ChannelInboundHandler 的默认实现为 ChannelInboundHandlerAdapter，叫作通道入站处理适配器;
>
> ChanneOutboundHandler 的默认实现为 ChanneloutBoundHandlerAdapter，叫作通道出站处理适配器。

这两个默认的通道处理适配器，分别实现了入站操作和出站操作的基本功能。如果要实现自己的业务处理器，不需要从零开始去实现处理器的接口，只需要继承通道处理适配器即可。



#### 2.4 ChannelPipeline

一条 Netty 通道需要很多的 Handler 业务处理器来处理业务。每条通道内部都有一条流水线（Pipeline）将 Handler 装配起来。


Netty 的业务处理器流水线 **ChannelPipeline** 是基于责任链设计模式（Chain of Responsibility）来设计的，内部是一个双向链表结构，能够支持动态添加、删除Handler业务处理器。



请求在入站处理器中的流动次序是**从前到后**，在出站处理器中的流动次序是**从后往前**。

<img src="https://files.tpvlog.com/tpvlog/network/20211017221241599.png" alt="img" style="zoom: 50%;" />



#### 2.5 ChannelHandlerContext

在 Handler 业务处理器被添加到流水线 Pipeline 中时，会创建一个通道处理器上下文 **ChannelHandlerContext**，它代表了 ChannelHandler 和 ChannelPipeline 之间的关联。



ChannelHandlerContext 中包含了有许多方法，主要可以分为两类：

1. 第一类是获取上下文所关联的 Netty 组件实例，如所关联的通道、流水线、上下文内部的 Handler 业务处理器等；
2. 第二类是入站和出站处理方法。



在 `Channel`、`ChannelPipeline`、`ChannelHandlerContext` 三个类中，会有同样的出站和入站处理方法，但是它们的行为有所不同：

- 如果通过 Channel 或 ChannelPipeline 来调用，则会在整条流水线中传播；
- 如果是通过 ChannelHandlerContext 来调用，则只会从当前的节点开始执行 Handler 业务处理器，并传播到同类型 Handler 的下一站。



<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/20211017221257805.jpg" alt="img" style="zoom: 50%;" />



所以总结一下，Channel、Handler、ChannelHandlerContext 三者的关系为：

1. 每个 Channel 通道拥有一条 ChannelPipeline 通道流水线，流水线节点为 ChannelHandlerContext 上下文对象，每一个 ChannelHandlerContext中包裹了一个 ChannelHandler 处理器；

2. 在 ChannelHandler 的入站/出站处理方法中，Netty 都会传递一个 ChannelHandlerContext 实例作为参数。在业务处理中，通过 ChannelHandlerContext 可以获取 ChannelPipeline 实例或者 Channel 实例。

   



#### 2.6 ByteBuf

ByteBuf 是一个字节容器，内部是一个字节数组。 Netty 没有直接使用 Java NIO 中的 ByteBuffer，而是自己是实现了一个 **BtyeBuf**。与 Java NIO 的ByteBuffer 相比，ByteBuf 的优势如下：

- Pooling（池化），减少了内存复制和GC，提升了效率；
- 支持自动扩容，使用更方便。



ByteBuf 通过三个整型属性有效地区分可读数据和可写数据，使得读写之间相互没有冲突。这三个属性定义在 AbstractByteBuf 抽象类中，分别是：

- **readerIndex（读指针）**

  指示读取的起始位置。每读取一个字节，readerIndex 自动增加 1。一旦 readerIndex 与 writerIndex 相等，则表示 ByteBuf 不可读了；

- **writerIndex（写指针）**

  指示写入的起始位置。每写一个字节，writerIndex 自动增加1。一旦增加到 writerIndex 与 capacity() 容量相等，则表示 ByteBuf 已经不可写了；

- **maxCapacity（最大容量）**

  表示 ByteBuf 可以扩容的最大容量。当向 ByteBuf 写数据的时候，如果容量不足，可以进行扩容。扩容的最大限度由 maxCapacity 的值来设定，超过 maxCapacity 就会报错。



从逻辑上来讲，ByteBuf 内部可以分为四个部分，具体如下图所示：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/20211017221333142.png" alt="img" style="zoom: 80%;" />

- 废弃：表示已经使用完的废弃的无效字节；
- 可读：ByteBuf 保存的有效数据，从 ByteBuf 中读取的数据都来自这一部分；
- 可写：写入到 ByteBuf 的数据都会写到这一部分中；
- 可扩容：该 ByteBuf 最多还能扩容的大小。



#### 2.7 Decoder

Netty 从底层的 Java 通道读取字节数据，传入 Netty 通道的流水线中，随后开始入站处理。在入站处理过程中，需要将 ByteBuf 字节数据，解码成 Java POJO 对象。这个解码过程，可以通过 Netty 的 Decoder 解码器去完成。



所有的 Netty 中的 Decoder 解码器，都是 Inbound 入站处理器类型，都直接或者间接地实现了 ChannelInboundHandler 接口，负责处理“入站数据”。解码器能将上一站 Inbound 入站处理器传过来的输入（Input）数据，进行数据的解码或者格式转换，然后输出（Output）到下一站 Inbound 入站处理器。



#### 2.8   Encoder

在 Netty 的业务处理完成后，业务处理的结果往往是某个 Java POJO 对象，需要编码成最终的 ByteBuf 二进制类型，通过流水线写入到底层的 Java 通道。

所有的 Netty 中的 Encoder 编码器，都是 Outbound 出站处理器类型，都直接或者间接地实现了 ChannelOutboundHandler 接口，负责处理“出站数据”。编码器将上一站 Outbound 出站处理器传过来的输入（Input）数据进行编码或者格式转换，然后传递到下一站 ChannelOutboundHandler 出站处理器。



------



### 3.  Netty 架构解析



通过上述示例，我们大概了解了 Netty 整体是基于 ***主从Reactor模式***  实现的一个网络通信框架，它的编程遵循一定的“范式”，比如上述的 `NettyClient`和 `NettyServer`，很多都是一些模板代码。接下来，来看看 Netty 的整体架构和一些核心设计思路。



#### 3.1 整体架构

Netty 官网给出了有关 Netty 的整体功能模块结构，我们可以清晰地看出 Netty 的整体架构分为三个模块：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/20211017221351282.png" alt="img" style="zoom:80%;" />

- **Core 核心层**

   Core 核心层是 Netty 最精华的内容，它提供了底层网络通信的通用抽象和实现，包括可扩展的事件模型、通用的通信 API、支持零拷贝的 ByteBuf 等。

   

- Protocol Support 协议支持层

   协议支持层基本上覆盖了主流协议的编解码实现，如 HTTP、SSL、Protobuf、压缩、大文件传输、WebSocket、文本、二进制等主流协议，此外 
   Netty 还支持自定义应用层协议。Netty 丰富的协议支持降低了用户的开发成本，基于 Netty 我们可以快速开发 HTTP、WebSocket 等服务。

   

- Transport Service 传输服务层

   传输服务层提供了网络传输能力的定义和实现方法。它支持 Socket、HTTP 隧道、虚拟机管道等传输方式。Netty 对 TCP、UDP 等数据传输做了抽象和封装，用户可以更聚焦在业务逻辑实现上，而不必关系底层数据传输的细节。





#### 3.2  逻辑架构

再来看看 Netty 的逻辑架构，可以看到 Netty 采用了典型的三层网络架构进行设计和开发：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/20211017221411342.png" alt="img" style="zoom: 67%;" />



1. 网络通信层

   网络通信层的职责是执行网络 I/O 的操作。它支持多种网络协议和 I/O 模型的连接操作。当网络数据读取到内核缓冲区后，会触发各种网络事件，这些网络事件会分发给事件调度层进行处理。

   

   网络通信层的核心组件包含 **BootStrap、ServerBootStrap、Channel** 三个组件。BootStrap 和 ServerBootStrap 分别负责客户端和服务端的启动，它们是非常强大的辅助工具类；Channel 是网络通信的载体，提供了与底层 Socket 交互的能力。





2. 事件调度层

   事件调度层的职责是通过 **Reactor 线程模型** 对各类事件进行聚合处理，通过 Selector 主循环线程集成多种事件（ I/O 事件、信号事件、定时事件等），实际的业务处理逻辑是交由服务编排层中相关的 Handler 完成。

   

   事件调度层的核心组件包括 **EventLoopGroup、EventLoop**。

   EventLoopGroup 本质是一个线程池，主要负责接收 I/O 请求，并分配线程执行处理请求。EventLoopGroups、EventLoop 与 Channel 的关系如下：

   1. 一个 EventLoopGroup 往往包含一个或者多个 EventLoop。EventLoop 用于处理 Channel 生命周期内的所有 I/O 事件，如 accept、connect、read、write 等 I/O 事件；
   2. EventLoop 同一时间会与一个线程绑定，每个 EventLoop 负责处理多个 Channel；
   3. 每新建一个 Channel，EventLoopGroup 会选择一个 EventLoop 与其绑定，该 Channel 在生命周期内都可以对 EventLoop 进行多次绑定和解绑。

   <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/20211017221428713.png" alt="img" style="zoom: 50%;" />

   

   Netty 通过创建不同的 EventLoopGroup 参数配置，就可以支持 Reactor 的三种线程模型：

   - **单线程模型**：EventLoopGroup 只包含一个 EventLoop，Boss 和 Worker 使用同一个 EventLoopGroup；
   - **多线程模型**：EventLoopGroup 包含多个 EventLoop，Boss 和 Worker 使用同一个 EventLoopGroup；
   - **主从多线程模型**：EventLoopGroup 包含多个 EventLoop，Boss 是主 Reactor，Worker 是从 Reactor，它们分别使用不同的 EventLoopGroup，主 Reactor 负责新的网络连接 Channel 创建，然后把 Channel 注册到从 Reactor。





3. 服务编排层

   服务编排层的职责是负责组装各类服务，它是 Netty 的核心处理链，用以实现网络事件的动态编排和有序传播。
   

   服务编排层的核心组件包括 **ChannelPipeline**、**ChannelHandler、ChannelHandlerContext**。

   

   ChannelPipeline 是 Netty 的核心编排组件，**负责组装各种 ChannelHandler**，实际数据的编解码以及加工处理操作都是由 ChannelHandler 完成的。ChannelPipeline 内部通过双向链表将不同的 ChannelHandler 链接在一起。当 I/O 读写事件触发时，ChannelPipeline 采用责任链模式，依次调用 ChannelHandler 链表对 Channel 的数据进行拦截和处理。
   

   ChannelPipeline 本身是线程安全的，每一个 Channel 都会绑定一个新的 ChannelPipeline，一个 ChannelPipeline 关联一个 EventLoop，一个 EventLoop 仅会绑定一个线程：

   <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/20211017221315911.png" alt="img" style="zoom: 50%;" />

   

   ChannelPipeline 中包含入站 ChannelInboundHandler 和出站 ChannelOutboundHandler 两种处理器，我们结合客户端和服务端的数据收发流程，来理解 Netty 的这两个概念：

   <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/20211017221504657.png" alt="img" style="zoom: 50%;" />

   

   以客户端为例，数据从客户端发向服务端，该过程称为 **出站**，反之则称为 **入站**。数据入站会由一系列 InBoundHandler 处理，然后再以相反方向的 OutBoundHandler 处理后完成出站。我们经常使用的编码 Encoder 是出站操作，解码 Decoder 是入站操作。
   

   服务端接收到客户端数据后，需要先经过 Decoder 入站处理后，再通过 Encoder 出站通知客户端。所以客户端和服务端一次完整的请求应答过程可以分为三个步骤：**客户端出站（请求数据）、服务端入站（解析数据并执行业务逻辑）、服务端出站（响应结果）**。




以上便是 Netty 的逻辑架构，可以看出 Netty 的架构分层设计得非常合理，屏蔽了底层 NIO 以及框架层的实现细节，对于业务开发来说，只需要关注业务逻辑的编排和实现即可。





#### 3.3 线程模型

了解 Netty 核心组件的概念以及它的整体/逻辑架构后，我们再来从 Netty 服务端处理请求的流程，了解下 Netty 的线程模式。



前面说了，Netty 采用了**主从Reactor模式**，服务端启动时，创建了两个 `NioEventLoopGroup`，它们实际是两个独立的 Reactor 线程池，一个用于监听客户端的连接请求，并与客户端建立 TCP 连接；另一个用于处理 I/O 相关的读写操作或者执行系统 Task、定时任务 Task 等。

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/20211017221535470.png" alt="img" style="zoom: 80%;" />

上图是Netty服务端处理请求的流程：

1. 首先，创建两个 `NioEventLoopGroup` —— boosGroup 和 workerGroup，我们可以把它们看成独立的线程池，服务端会采用 ServerBootStrap 进行装配；
2. boosGroup 内部的 ServerSocket 会监听指定端口，等待客户端的连接请求；
3. 当客户端请求建立连接时，boosGroup 中的 NioEventLoop 线程会负责连接的建立，然后将建立完连接的 NioSocketChannel 交给 workerGroup 线程池处理；
4. workerGroup 线程池中有许多 NioEventLoop 线程，一个 NioSocketChannel 只能由一个 NioEventLoop 线程处理；
5. NioEventLoop 会为每个注册到它内部的 NioSocketChannel，创建一条 Pipeline 流水线，然后将请求交给流水线内部的 Handler 依次处理。



------



### 4. Netty 核心原理

相关知识参考如下思维导图：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/20211017221551612.png" alt="img" style="zoom: 33%;" />



#### 4.1 **Bootstrap 引导器**

我们在使用 Netty 时，首先就需要使用 Bootstrap（客户端）和 ServerBootstrap（服务端）来对 Netty 中的各类核心组件进行装配。接下来就看看 Bootstrap 和 ServerBootstrap 的底层原理。



##### 4.1.1 Bootstrap 启动流程

我们先来回顾一下 Netty 中的 **AbstractBootstrap** 类，它是 `Bootstrap` 和 `ServerBootstrap` 的抽象父类，封装了一些公有方法：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/20211018224442194.png" alt="img" style="zoom:67%;" />

> 事实上，即使我们不使用 Bootstrap，也可以手动创建 Channel、完成各种设置和启动、注册到 EventLoop，但是整个过程会比较麻烦。所以，通常都是基于 Bootstrap 工具类完成 Netty 核心组件的拼装。



Bootstrap 的启动流程，也就是 Netty 组件的组装、配置，以及 Netty 服务端或客户端的启动流程。以服务端 ServerBootstrap 的使用为例，Netty Server的启动流程，一共可以分为以下几个步骤：

- 配置 EventLoopGroup 线程组；
- 配置 Channel 的类型；
- 设置 ServerSocketChannel 对应的 Handler；
- 设置网络监听的端口；
- 设置 SocketChannel 对应的 Handler；
- 配置 Channel 参数；
- 启动 Netty Server。

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/20211018224503343.png" alt="img" style="zoom: 50%;" />



###### 4.1.1.1 分配 Reactor 线程池

首先，创建一个服务端的 ServerBootstrap 实例，ServerBootstrap 支持无参构造函数（后续分析 ServerBootstrap 源码时再详细讲解它的内部构造）：

```java
// 创建一个服务端的启动器
ServerBootstrap bootstrap = new ServerBootstrap();
```

接着，创建两个 Reactor 线程池，并赋值给 ServerBootstrap 启动器实例：

```java
// boss线程池
EventLoopGroup bossLoopGroup = new NioEventLoopGroup(1);
// worker线程池
EventLoopGroup workerLoopGroup = new NioEventLoopGroup(10);
// 分配线程池
bootstrap.group(bossLoopGroup, workerLoopGroup);
```

上述这两个 NioEventLoopGroup 线程池，一个负责监听客户端的连接事件并建立连接，名为 **bossLoopGroup**；另一个负责监听读写 IO 事件和 Handler 业务处理，名为 **workerLoopGroup**。


事实上，ServerBootstrap 支持在<font color="red">*单线程*</font>、<font color="red">*多线程*</font>和<font color="red">*主从多线程*</font>间切换，也就是也可以只配置一个线程池，并且可以控制线程池中的线程数量。这种灵活的配置方式可以最大程度地满足不同用户的个性化定制需求。



###### 4.1.1.2  设置父 Channel 类型

Netty 不止支持 Java NIO，也支持阻塞式 IO（也叫 BIO 或 OIO ）。下面配置的是 Java NIO 类型的 Channel，方法如下：

```java
bootstrap.channel(NioServerSocketChannel.class);
```

当然，我们可以指定 `OioServerSocketChannel.class` 等等其他类型的 IO。

> ServerBootstrap 内部会通过反射的方式创建 NioServerSocketChannel 对象，NioServerSocketChannel 本质是对 `java.nio.channels.ServerSocketChannel` 的封装。



###### 4.1.1.3 设置父 Channel 的 Handler

设置 ServerSocketChannel 对应的 Handler：

```java
bootstrap.handler(new LoggingHandler(LogLevel.INFO));    // LoggingHandler是自定义的Handler
```



###### 4.1.1.4 设置父 Channel 监听端口

底层本质是通过 `java.net.ServerSocket` 监听端口：

```java
bootstrap.localAddress(new InetSocketAddress(port));
```



###### 4.1.1.5 配置父 Channel 参数

通过 ServerBootstrap 的 `option()` 方法，可以对 NioServerSocketChannel 进行参数配置，底层本质是设置 ServerSocket 的参数：

```JAVA
bootstrap.option(ChannelOption.SO_KEEPALIVE, true);
bootstrap.option(ChannelOption.ALLOCATOR, PooledByteBufAllocator.DEFAULT);
```



###### 4.1.1.6 配置子 Channel 参数

通过 ServerBootstrap 的 `childOption()` 方法，可以对每一个 NioSocketChannel 进行参数配置，本质也是设置底层的 Socket 参数：

```JAVA
bootstrap.childOption(ChannelOption.SO_KEEPALIVE, true);
bootstrap.childOption(ChannelOption.TCP_NODELAY, true);
```



###### 4.1.1.7 配置子 Channel 的 Pipeline

父 Channel 会负责连接的建立，连接建立完成后都会创建一个新的子 Channel，即 **NioSocketChannel**。每一个子 Channel 都拥有自己的独立 Pipeline，我们可以对它进行装配：

```java
bootstrap.childHandler(new ChannelInitializer<SocketChannel>() {
    // 建立客户端连接时，会创建一个子通道并初始化
    protected void initChannel(SocketChannel ch) throws Exception {
        // 向子通道的流水线添加Handler业务处理器
        ch.pipeline().addLast(new XXXXHandler());
    }
});
```

上述 `ChannelInitializer.initChannel()` 方法会在子 Channel 被创建后调用。



另外，父 Channel 也就是 NioServerSocketChannel，也是拥有 Pipeline 的，但是它的处理逻辑是固定的：接受新连接，创建子通道，初始化子通道，所以不需要特别配置。如果我们希望 NioServerSocketChannel 在建立连接后进行特殊的业务处理，可以使用 `ServerBootstrap.handler(ChannelHandler handler)` 方法，为父通道设置 ChannelInitializer 初始化器，后面分析源码时会详细讲解。



###### 4.1.1.8 绑定并启动

ServerBootstrap 的 `bind()` 方法会绑定端口并返回一个 ChannelFuture 对象，因为整个过程是异步的，所以调用 `ChannelFuture.sync()` 同步等待绑定过程的完成：

```JAVA
ChannelFuture channelFuture = bootstrap.bind().sync();
Logger.info(" 服务器启动成功，监听端口: " + channelFuture.channel().localAddress());
```

至此，Netty Server启动完成。

> Netty中的IO操作，都会返回异步任务实例（如ChannelFuture实例），可以通过阻塞等待或者增加事件监听器两种方式，获得 IO 操作的真正结果。



###### 4.1.1.9 等待 Channel 关闭

如果要阻塞当前线程直到通道关闭，可以使用 `Channel.closeFuture()` 方法，获取通道关闭的异步任务。然后调用 `sync()` 方法，阻塞等待直到通道被关闭：

```java
ChannelFuture closeFuture = channelFuture.channel().closeFuture();
closeFuture.sync();
```

另外还需要注意，关闭 Channel 后，需要释放 Reactor 线程池资源：

```java
// 释放掉所有资源，包括创建的反应器线程
workerLoopGroup.shutdownGracefully();
bossLoopGroup.shutdownGracefully();
```

> 关闭 EventLoopGroup 线程池时，会关闭内部的 EventLoop 线程，也会关闭内部的 Selector 选择器、轮询线程以及所有子通道。在子通道关闭后，会释放掉底层的资源，如 TCP Socket 文件描述符等。





##### 4.1.2 ServerBootstrap 源码分析

我们已经从使用层面了解了 ServerBootstrap 的启动流程，再来从源码层面分析 ServerBootstrap 的机理。ServerBootstrap 本质是对父类 AbstractBootstrap 的增强，增加了对主从 Reactor 模式的支持。



###### 4.1.2.1 构造

ServerBootstrap 提供了两种类型的构造器，我们一般都是使用无参构造器：

```java
// ServerBootstrap.java

public ServerBootstrap() { }

private ServerBootstrap(ServerBootstrap bootstrap) {
    super(bootstrap);
    childGroup = bootstrap.childGroup;
    childHandler = bootstrap.childHandler;
    synchronized (bootstrap.childOptions) {
        childOptions.putAll(bootstrap.childOptions);
    }
    childAttrs.putAll(bootstrap.childAttrs);
}
```

父类 AbstractBootstrap 的构造：

```java
// AbstractBootstrap.java

AbstractBootstrap() {
}

AbstractBootstrap(AbstractBootstrap<B, C> bootstrap) {
    group = bootstrap.group;
    channelFactory = bootstrap.channelFactory;
    handler = bootstrap.handler;
    localAddress = bootstrap.localAddress;
    synchronized (bootstrap.options) {
        options.putAll(bootstrap.options);
    }
    attrs.putAll(bootstrap.attrs);
}
```



###### 4.1.2.2 group 方法

ServerBootstrap 的 group 方法用于分配 EventLoopGroup 线程池，通过方法的重载信息可以看出，Netty 可以在 <font color="red">*单线程*</font>、<font color="red">*多线程*</font>  和 <font color="red">*主从多线程* </font> 之间切换：

```java
// ServerBootstrap.java

public class ServerBootstrap extends AbstractBootstrap<ServerBootstrap, ServerChannel> {

    private volatile EventLoopGroup childGroup;

    @Override
    public ServerBootstrap group(EventLoopGroup group) {
        // 如果只使用一个线程池，则主从Reactor模式退化为单Reactor模式
        return group(group, group);
    }

    public ServerBootstrap group(EventLoopGroup parentGroup, EventLoopGroup childGroup) {
        super.group(parentGroup);
        if (this.childGroup != null) {
            throw new IllegalStateException("childGroup set already");
        }
        this.childGroup = ObjectUtil.checkNotNull(childGroup, "childGroup");
        return this;
    }
    //...
}
```

来看父类 AbstractBootstrap 的 `group(EventLoopGroup group)` 方法：

```java
// AbstractBootstrap.java

volatile EventLoopGroup group;

public B group(EventLoopGroup group) {
    ObjectUtil.checkNotNull(group, "group");
    if (this.group != null) {
        throw new IllegalStateException("group set already");
    }
    this.group = group;
    return self();
}
```

也就是说，Main Reactor 线程池本质是在父类中设置的，ServerBootstrap 只是配置子线程池和相关参数。



###### 4.1.2.3 channel 方法

ServerBootstrap 的 channel 方法继承自父类 AbstractBootstrap：

```java
// AbstractBootstrap.java

public B channel(Class<? extends C> channelClass) {
    return channelFactory(new ReflectiveChannelFactory<C>(ObjectUtil.checkNotNull(channelClass, "channelClass")
    ));
}

public B channelFactory(ChannelFactory<? extends C> channelFactory) {
    ObjectUtil.checkNotNull(channelFactory, "channelFactory");
    if (this.channelFactory != null) {
        throw new IllegalStateException("channelFactory set already");
    }

    this.channelFactory = channelFactory;
    return self();
}
```

其实就是实例化了一个用于创建 Channel 的工厂，后续 ServerBootstrap 调用 bind 方法时会通过反射创建 NioServerSocketChannel 对象：

```java
// ReflectiveChannelFactory.java

public class ReflectiveChannelFactory<T extends Channel> implements ChannelFactory<T> {

    private final Constructor<? extends T> constructor;

    public ReflectiveChannelFactory(Class<? extends T> clazz) {
        ObjectUtil.checkNotNull(clazz, "clazz");
        try {
            this.constructor = clazz.getConstructor();
        } 
        //...
    }

    @Override
    public T newChannel() {
        try {
            // 通过反射调用Channel的无参构造函数，完成对象实例化
            return constructor.newInstance();
        } 
        //...
    }
}
```

我们来看下 NioServerSocketChannel 的构造就会明白，它的底层实际是封装了JDK 的 ServerSocketChannel：

```java
// NioServerSocketChannel.java

public NioServerSocketChannel() {
    this(newSocket(DEFAULT_SELECTOR_PROVIDER));
}

public NioServerSocketChannel(SelectorProvider provider) {
    this(newSocket(provider));
}

private static ServerSocketChannel newSocket(SelectorProvider provider) {
    try {
        return provider.openServerSocketChannel();
    } catch (IOException e) {
        throw new ChannelException(
            "Failed to open a server socket.", e);
    }
}
```

SelectorProvider 是 JDK NIO 中的抽象类实现，通过 `openServerSocketChannel()` 方法可以创建服务端的 ServerSocketChannel。SelectorProvider 会根据 OS 类型和版本的不同，返回不同的实现类。



###### 4.1.2.4  option 和 attr 方法

option 用于对父 Channel（即 NioServerSocketChannel ）本身的底层 TCP 参数进行配置，而 attr 用于配置父 Channel 的自定义属性（后续可以在 Pipineline 中使用这些属性）。


这个两个方法同样是父类AbstractBootstrap的方法：

```java
// AbstractBootstrap.java

public abstract class AbstractBootstrap<B extends AbstractBootstrap<B, C>, C extends Channel> implements Cloneable {
    private final Map<ChannelOption<?>, Object> options = new LinkedHashMap<ChannelOption<?>, Object>();
    private final Map<AttributeKey<?>, Object> attrs = new ConcurrentHashMap<AttributeKey<?>, Object>();

    public <T> B option(ChannelOption<T> option, T value) {
        ObjectUtil.checkNotNull(option, "option");
        synchronized (options) {
            if (value == null) {
                options.remove(option);
            } else {
                options.put(option, value);
            }
        }
        return self();
    }

    public <T> B attr(AttributeKey<T> key, T value) {
        ObjectUtil.checkNotNull(key, "key");
        if (value == null) {
            attrs.remove(key);
        } else {
            attrs.put(key, value);
        }
        return self();
    }    
}
```

AbstractBootstrap 只是将这些配置值保存到内部的字段中，后续初始化 Channel 时再使用它们。



1. AttributeKey

   通过 `ServerBootstrap.attr()` 设置的 Channel 自定义属性，都保存到了 AbstractBootstrap 内部的一个 ConcurrentHashMap 中，这个 Map 的键是 AttributeKey。ServerBootstrap 在后续的初始化 Channel 过程中，会将这些属性值设置到 Channel 中。
   

   Netty 中有一个 AttributeMap 接口，根据接口契约，它的实现类必须是线程安全的，attr 方法的入参就是一个 AttributeKey 对象，泛型用来指明Value 值类型，返回的是一个 Attribute 对象，内部封装了实际的 Value 值：

   ```java
   public interface AttributeMap {
       /**
        * 获取指定Key对应的Value，Value的类型即泛型T
        */
       <T> Attribute<T> attr(AttributeKey<T> key);
   
       /**
        * 指定的Key是否存在
        */
       <T> boolean hasAttr(AttributeKey<T> key);
   }
   ```

   我们使用 AttributeMap 时，本质把原始 Key 封装成 AttributeKey，原始 Value 封装成 Attribute：

   <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/20211018224533129.png" alt="img" style="zoom:50%;" />

   Netty 中的所有 Channel 都实现了 AttributeMap 接口：

   ```java
   public interface Channel extends AttributeMap, ChannelOutboundInvoker, Comparable<Channel> { 
   }
   ```

   所以，我们可以在自定义的 ChannelHandler 业务处理器中直接使用 AttributeKey，比如：

   ```java
   public class DispatcherHandler extends ChannelInboundHandlerAdapter {
   
       private AttributeKey<String> key = AttributeKey.valueOf("Id");
   
       @Override
       public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
           Attribute<String> channelAttr = ctx.channel().attr(key);
           // 将Value值设置为1
           channelAttr.set("1");
   
           Attribute<String> contextAttr = ctx.attr(key);
           assert contextAttr.get() == "1"
       }
   }
   ```

   注意，在 Netty 4.1 版本以后 `ChannelHandlerContext` 和 `Channel` 的 `attr` 方法设置的属性作用域是完全相同的，也就是说：

   ```java
   Channel.attr() == ChannelHandlerContext.attr()
   ```

   我们可以看下 AbstractChannelHandlerContext 的 attr 方法，内部就是先获取所属的 Channel：

   ```java
   // AbstractChannelHandlerContext.java
   
   public <T> Attribute<T> attr(AttributeKey<T> key) {
       return channel().attr(key);
   }
   ```

   

2. ChannelOption

   再来看 ChannelOption， ChannelOption 主要是用于配置 Channel 底层的原生参数，比如 TCP 参数等等。这些参数的 Key 已经在 ChannelOption 中以静态变量的方式写死了，我们只能指定其 value 值，如果通过 ChannelOption 设置了一个不存在的 Key，Netty 会以日志形式提示错误信息，但是不会抛出异常。

   

   我们通过 `ServerBootstrap.option()` 的代码可以看到，ServerBootstrap 会将属于 Channel 的 option  对象和 value 存放到内部的 LinkedHashMap 中。后续当 ServerBootstrap 绑定到具体的端口时，在其 `init()` 方法当中，会将这个 Map 中的每一项绑定到具体 Channel 中：

   ```java
   // ServerBootstrap.java
   
   @Override
   void init(Channel channel) {
       setChannelOptions(channel, newOptionsArray(), logger);
       //...
   }
   ```

   ```java
   // AbstractBootstrap.java
   
   static void setChannelOptions(
       Channel channel, Map.Entry<ChannelOption<?>, Object>[] options, InternalLogger logger) {
       // 遍历并为Channel设置参数
       for (Map.Entry<ChannelOption<?>, Object> e: options) {
           setChannelOption(channel, e.getKey(), e.getValue(), logger);
       }
   }
   
   private static void setChannelOption(
       Channel channel, ChannelOption<?> option, Object value, InternalLogger logger) {
       try {
           if (!channel.config().setOption((ChannelOption<Object>) option, value)) {
               logger.warn("Unknown channel option '{}' for channel '{}'", option, channel);
           }
       }
       //...
   }
   ```

   内部调用了 Channel 的 `config()` 方法，返回一个 ChannelConfig 对象，然后调用该对象的 setOption 方法：

   ```java
   // DefaultServerSocketChannelConfig.java
   
   public <T> boolean setOption(ChannelOption<T> option, T value) {
       validate(option, value);
       // 限定了Option只能是指定范围的类型
       if (option == SO_RCVBUF) {
           setReceiveBufferSize((Integer) value);
       } else if (option == SO_REUSEADDR) {
           setReuseAddress((Boolean) value);
       } else if (option == SO_BACKLOG) {
           setBacklog((Integer) value);
       } else {
           return super.setOption(option, value);
       }
       return true;
   }
   ```

   最后，我们来看下常用的 ChannelOption 有哪些：

   - **SO_RCVBUF / SO_SNDBUF**

     此为TCP参数。每个 TCP socket（套接字）在内核中都有一个发送缓冲区和一个接收缓冲区，这两个选项就是用来设置 TCP 连接的这两个缓冲区大小的。TCP 的全双工的工作模式以及 TCP 的滑动窗口便是依赖于这两个独立的缓冲区及其填充的状态。

     

   - **TCP_NODELAY**

     此为 TCP 参数。表示是否立即发送数据，默认值为 True（ Netty 默认为 true，而操作系统默认为 false）。该值用于设置是否关闭 Nagle 算法，该算法将小的碎片数据连接成更大的报文（或数据包）来最小化所发送报文的数量，如果需要发送一些较小的报文，则需要禁用该算法。Netty 默认禁用该算法，从而最小化报文传输的延时。

     

   - **SO_KEEPALIVE**

     此为 TCP 参数。表示底层 TCP 协议的心跳机制。true 为连接保持心跳，默认值为 false。启用该功能时，TCP 会主动探测空闲连接的有效性。可以将此功能视为 TCP 的心跳机制，需要注意的是：默认的心跳间隔是 7200s，即 2 小时。Netty 默认关闭该功能。

     

   - **SO_REUSEADDR**

     此为 TCP 参数。设置为 true 时表示地址复用，默认值为 false。有四种情况需要用到这个参数设置：

     1. 当有一个有相同本地地址和端口的 socket1 处于 `TIME_WAIT` 状态时，而我们希望启动的程序的 socket2 要占用该地址和端口。例如在重启服务且保持先前端口时；

     2. 有多块网卡或用 IP Alias 技术的机器在同一端口启动多个进程，但每个进程绑定的本地 IP 地址不能相同；

     3. 单个进程绑定相同的端口到多个 socket（套接字）上，但每个 socket 绑定的 IP 地址不同；

     4. 完全相同的地址和端口的重复绑定。但这只用于 UDP 的多播，不用于 TCP。

        

   - **SO_LINGER**

     此为 TCP 参数。表示关闭 socket 的延迟时间，默认值为 -1，表示禁用该功能：

     - -1：表示 `socket.close()` 方法立即返回，但操作系统底层会将发送缓冲区全部发送到对端；

     - 0：表示 `socket.close()` 方法立即返回，操作系统放弃发送缓冲区的数据，直接向对端发送 RST 包，对端收到复位错误。

     - 正整数值：表示调用 `socket.close()` 方法的线程被阻塞，直到延迟时间到来、发送缓冲区中的数据发送完毕，若超时，则对端会收到复位错误。

       

   - **SO_BACKLOG**

     此为  TCP 参数。表示服务器端接收连接的队列长度，如果队列已满，客户端连接将被拒绝。Linux 中默认为 128。如果连接建立频繁，服务器处理新连接较慢，可以适当调大这个参数。

     

   - **SO_BROADCAST**

     此为 TCP 参数。表示设置广播模式。



###### 4.1.2.5 childOption和childAttr方法

childOption 和 childAttr 这两个方法与上一节中的 option 和 attr 方法类似，只不过它们是作用于子 Channel，也就是 NioSocketChannel：

```java
// ServerBootstrap.java

public class ServerBootstrap extends AbstractBootstrap<ServerBootstrap, ServerChannel> {

    private final Map<ChannelOption<?>, Object> childOptions = 
        new LinkedHashMap<ChannelOption<?>, Object>();

    private final Map<AttributeKey<?>, Object> childAttrs = 
        new ConcurrentHashMap<AttributeKey<?>, Object>();

    public <T> ServerBootstrap childOption(ChannelOption<T> childOption, T value) {
        ObjectUtil.checkNotNull(childOption, "childOption");
        synchronized (childOptions) {
            if (value == null) {
                childOptions.remove(childOption);
            } else {
                childOptions.put(childOption, value);
            }
        }
        return this;
    }

    public <T> ServerBootstrap childAttr(AttributeKey<T> childKey, T value) {
        ObjectUtil.checkNotNull(childKey, "childKey");
        if (value == null) {
            childAttrs.remove(childKey);
        } else {
            childAttrs.put(childKey, value);
        }
        return this;
    }    
}
```

ServerBootstrap 只是将这些配置值保存到内部的字段中，后续初始化 Channel 时再使用它们。



###### 4.1.2.6 childHandler 方法

ServerBootstrap 的 childHandler 方法用于给子 Channel 分配一个业务处理器：

```java
// ServerBootstrap.java

private volatile ChannelHandler childHandler;

public ServerBootstrap childHandler(ChannelHandler childHandler) {
    this.childHandler = ObjectUtil.checkNotNull(childHandler, "childHandler");
    return this;
}
```

我们在装配 ServerBootstrap 时，一般会使用 **ChannelInitializer** 这个类，关于它的作用这里简单提一下，后续对 ChannelHandler 源码讲解时再深入说明。



Netty 中的每一个 Channel 通道，都拥有一条自己的 Pipeline 流水线，流水线负责装配自己的 Handler 业务处理器。那么，什么时候进行装配呢？一般是在 Channel 初始化时就完成的。比如下面的示例代码：

```java
// 装配子 Channel 流水线
serverBootstrap.childHandler(new ChannelInitializer<SocketChannel>() {
    // 有连接到达时，会创建一个 NioSocketChannel
    protected void initChannel(SocketChannel ch) throws Exception {
        // 为这个 NioSocketChannel 的 Pipeline 流水线添加一个 Handler 业务处理器
        ch.pipeline().addLast(new NettyDiscardHandler());
    }
});
```



###### 4.1.2.7 bind 方法

ServerBootstrap 的 bind 方法最为复杂，核心流程可以分为四个阶段：

1. 创建 NioServerSocketChannel 对象；
2. 初始化 NioServerSocketChannel 对象，比如设置  Channel 参数，装配 Pipeline 等等；
3. 将 NioServerSocketChannel 注册到 EventLoopGroup 的某个 EventLoop 中；
4. 为 NioServerSocketChannel 执行端口绑定。



整个流程大量运用了 ChannelFuture，所以比较晦涩，我们来通过源码看一下：

```java
// AbstractBootstrap.java

public ChannelFuture bind() {
    validate();
    SocketAddress localAddress = this.localAddress;
    if (localAddress == null) {
        throw new IllegalStateException("localAddress not set");
    }
    return doBind(localAddress);
}

private ChannelFuture doBind(final SocketAddress localAddress) {
    // 1.创建、初始化、注册Channel
    final ChannelFuture regFuture = initAndRegister();
    final Channel channel = regFuture.channel();
    if (regFuture.cause() != null) {
        return regFuture;
    }

    // 2.1 如果注册完成
    if (regFuture.isDone()) {
        // 3.绑定端口
        ChannelPromise promise = channel.newPromise();
        doBind0(regFuture, channel, localAddress, promise);
        return promise;
    } 
    // 2.2 如果没有注册完成
    else {
        final PendingRegistrationPromise promise = new PendingRegistrationPromise(channel);
        // 添加一个回调监听器
        regFuture.addListener(new ChannelFutureListener() {
            @Override
            public void operationComplete(ChannelFuture future) throws Exception {
                Throwable cause = future.cause();
                if (cause != null) {
                    promise.setFailure(cause);
                } else {
                    // 3.绑定端口
                    promise.registered();
                    doBind0(regFuture, channel, localAddress, promise);
                }
            }
        });
        return promise;
    }
}
```

其实核心步骤就是在 `initAndRegister` 和 `doBind0` 这两个方法中完成的： initAndRegister() 负责 Channel 初始化和注册，doBind0() 用于端口绑定。



- initAndRegister

  initAndRegister 方法分为三个步骤：

  1. 通过 ChannelFactory 工厂创建了 Channel；
  2. 对 Channe l进行初始化配置；
  3. 从 EventLoopGroup 中选择一个 EventLoop，注册该 Channel。

  ```java
  // AbstractBootstrap.java
  
  final ChannelFuture initAndRegister() {
      Channel channel = null;
      try {
          // 1.创建一个 Channel，对于 ServerBootstrap 来说，一般是 NioServerSocketChannel
          channel = channelFactory.newChannel();
          // 2.初始化 Channel
          init(channel);
      } catch (Throwable t) {
          //...
      }
      // 3.注册 Channel 到 Selector（每个 NioEventLoop 内部都有一个 java.nio.channels.Selector）
      ChannelFuture regFuture = config().group().register(channel);
      return regFuture;
  }
  ```

  EventLoopGroup 中的每一个 EventLoop 对象内部都封装了 java.nio.channels.Selector。

  

  我们来看下 `ServerBootstrap.init()` 方法是如何对 Channel 进行初始化的：

  ```java
  // ServerBootstrap.java
  
  @Override
  void init(Channel channel) {
      // 1.为 ServerSocketChannel 配置 TCP 等参数
      setChannelOptions(channel, newOptionsArray(), logger);
      // 2.为 ServerSocketChannel 配置自定义属性
      setAttributes(channel, newAttributesArray());
  
      ChannelPipeline p = channel.pipeline();
      final EventLoopGroup currentChildGroup = childGroup;
      final ChannelHandler currentChildHandler = childHandler;
      final Entry<ChannelOption<?>, Object>[] currentChildOptions = newOptionsArray(childOptions);
      final Entry<AttributeKey<?>, Object>[] currentChildAttrs = newAttributesArray(childAttrs);
  
      // 3.装配 pipeline 流水线
      p.addLast(new ChannelInitializer<Channel>() {
          @Override
          public void initChannel(final Channel ch) {
              // 注意：这里的 ch 就是上面的 ServerSocketChannel
              final ChannelPipeline pipeline = ch.pipeline();
              // 这个 Handler 就是我们通过 ServerBootstrap.handler(XXX) 装配的
              ChannelHandler handler = config.handler();
              if (handler != null) {
                  // 将自定义的 Handler 添加到  Pipeline中
                  pipeline.addLast(handler);
              }
              // 向 ServerSocketChannel（父Channel）所属的 EventLoop 中提交一个异步任务
              ch.eventLoop().execute(new Runnable() {
                  @Override
                  public void run() {
                      // ServerBootstrapAcceptor 用于将建立连接的 SocketChannel 转发给子 Reactor 线程池
                      pipeline.addLast(new ServerBootstrapAcceptor(
                          ch, currentChildGroup, currentChildHandler, currentChildOptions, currentChildAttrs));
                  }
              });
          }
      });
  }
  
  ```

  上面的重点是对 ServerSocketChannel 的 pipeline 流水线的装配：

  1. 首先，ServerSocketChannel 初始化时，会在流水线中添加一个 ChannelInitializer 处理器。这是一个特殊的**入站**处理器，它的 initChannel 方法会在该 ServerSocketChannel 注册完成后被调用；

  2. ChannelInitializer 的 initChannel 方法，会向 Pipieline 添加我们自定义的 Handler；

  3. 接着，向所属的 EventLoop 中提交一个异步任务，这个任务的作用就是在 ServerSocketChannel 的流水线中添加一个 ServerBootstrapAcceptor 处理器。ServerBootstrapAcceptor 也是一个特殊的**入站**处理器，它的作用就是当建立新的 SocketChannel 连接时，将 SocketChannel 注册到子 Reactor 线程池中的一个 EventLoop上；

  4. 最后，ChannelInitializer 会被从 ServerSocketChannel 的流水线中移除，防止多次执行。

     

  也就是说，当 ServerSocketChannel 初始化并注册完成后，它的 Pipeline 流水线最终只有我们自定义的 Handler 和一个 ServerBootstrapAcceptor处理器：

  <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/20211018224600616.png" alt="img" style="zoom: 50%;" />

  

- doBind0

  ServerSocketChannel 的初始化和注册完成后，还需要进行最后一步操作——绑定端口。整个流程的核心操作就是：调用 JDK 底层进行端口绑定，并触发 Pipeline 的 `channelActive` 事件，把 `OP_ACCEPT` 事件注册到 Channel 的事件集合中。

  ```java
  // AbstractBootstrap.java
  
  private static void doBind0( final ChannelFuture regFuture, final Channel channel,
      final SocketAddress localAddress, final ChannelPromise promise) {
  
      // 向 ServerSocketChannel 所属的 EventLoop 中提交一个异步任务
      channel.eventLoop().execute(new Runnable() {
          @Override
          public void run() {
              if (regFuture.isSuccess()) {
                  channel.bind(localAddress, promise).addListener(ChannelFutureListener.CLOSE_ON_FAILURE);
              } else {
                  promise.setFailure(regFuture.cause());
              }
          }
      });
  }
  ```

  上述整个流程是异步的，也就是说只是向 EventLoop（确切说是NioEventLoop）提交了一个异步任务，EventLoop 内部包含了一个任务队列，以及唯一个工作线程，会不断的从队列取出任务执行。

  

  我们来看实际的端口绑定操作：

  ```java
  // DefaultChannelPipeline.java
  
  @Override
  public final ChannelFuture bind(SocketAddress localAddress, ChannelPromise promise) {
      // 选择 Pipeline 中的队尾节点进行端口绑定
      return tail.bind(localAddress, promise);
  }
  ```

  很奇怪，端口绑定操作竟然是在 Pipeline 中执行的，而且是选择了尾部的 Handler 执行：

  ```java
  // AbstractChannelHandlerContext.java
  
  @Override
  public ChannelFuture bind(final SocketAddress localAddress, final ChannelPromise promise) {
      //...
      // 从 tail 开始往前，找到第一个出站的 Handler，此时只有 ServerBootstrapAcceptor 满足
      final AbstractChannelHandlerContext next = findContextOutbound(MASK_BIND);
      EventExecutor executor = next.executor();
      if (executor.inEventLoop()) {
          // 绑定端口
          next.invokeBind(localAddress, promise);
      } else {
          safeExecute(executor, new Runnable() {
              @Override
              public void run() {
                  next.invokeBind(localAddress, promise);
              }
          }, promise, null, false);
      }
      return promise;
  }
  
  private void invokeBind(SocketAddress localAddress, ChannelPromise promise) {
      if (invokeHandler()) {
          try {
              // 调用出站 Handler 的 bind 方法
              ((ChannelOutboundHandler) handler()).bind(this, localAddress, promise);
          } catch (Throwable t) {
              notifyOutboundHandlerException(t, promise);
          }
      } else {
          bind(localAddress, promise);
      }
  }
  ```

  最后看 invokeBind 操作，又回到了 DefaultChannelPipeline：

  ```java
  // DefaultChannelPipeline.java
  
  public void bind(
      ChannelHandlerContext ctx, SocketAddress localAddress, ChannelPromise promise) {
      // 关键是这里
      unsafe.bind(localAddress, promise);
  }
  ```

  上面的 unsafe 其实是一个定义在 `io.netty.channel.Channel` 中的类，封装了 Channel 对底层的 NIO 操作，所以 bind 操作本质就是ServerSocketChannel 的 bind 操作：

  ```java
  // AbstractChannel.AbstractUnsafe.java
  
  public final void bind(final SocketAddress localAddress, final ChannelPromise promise) {
      assertEventLoop();
  
      if (!promise.setUncancellable() || !ensureOpen(promise)) {
          return;
      }
  
      boolean wasActive = isActive();
      try {
          // 利用原生的NIO ServerSocketChannel完成端口绑定
          doBind(localAddress);
      } catch (Throwable t) {
          safeSetFailure(promise, t);
          closeIfClosed();
          return;
      }
  
      if (!wasActive && isActive()) {
          // 完成端口绑定后，Channel 处于 Active 状态，调用 pipeline.fireChannelActive() 触发 channelActive 事件
          invokeLater(new Runnable() {
              @Override
              public void run() {
                  pipeline.fireChannelActive();
              }
          });
      }
  
      safeSetSuccess(promise);
  }
  ```

  最终会执行 NioServerSocketChannel 的 doBind 方法：

  ```java
  // NioServerSocketChannel.java
  
  @Override
  protected void doBind(SocketAddress localAddress) throws Exception {
      // 获取Java NIO中的原生ServerSocketChannel绑定端口
      if (PlatformDependent.javaVersion() >= 7) {
          javaChannel().bind(localAddress, config.getBacklog());
      } else {
          javaChannel().socket().bind(localAddress, config.getBacklog());
      }
  }
  ```

  从上面代码可以看出，绕了这么一大圈，本质就是用 Java NIO 的 ServerSocketChannel 完成端口的绑定。Netty 之所以绕这么一大圈，是因为**端口绑定**这一操作在 Netty 里定义为 **出站** 操作，Netty 中 Channel 相关的所有操作都会通过 Pipeline 流水线触发，这也是为什么在 Pipeline 接口中定义 bind 方法的原因。

  

  此外，端口绑定完成后，会触发 Pipeline 的 channelActive 事件：

  ```java
  // DefaultChannelPipeline.java
  
  public final ChannelPipeline fireChannelActive() {
      // 从 head 开始触发 channelActive 事件
      AbstractChannelHandlerContext.invokeChannelActive(head);
      return this;
  }
  ```

  ```java
  // AbstractChannelHandlerContext.java
  
  static void invokeChannelActive(final AbstractChannelHandlerContext next) {
      EventExecutor executor = next.executor();
      if (executor.inEventLoop()) {
          next.invokeChannelActive();
      } else {
          executor.execute(new Runnable() {
              @Override
              public void run() {
                  next.invokeChannelActive();
              }
          });
      }
  }
  
  ```

  可以看到，事件从 Head 节点开始触发，执行完 channelActive 事件传播之后，Head 节点会调用 `readIfIsAutoRead()` 方法触发 Channel 的 read 事件：

  ```java
  // DefaultChannelPipeline.HeadContext.java
  
  public void channelActive(ChannelHandlerContext ctx) {
      // 传播channelActive事件
      ctx.fireChannelActive();
  
      readIfIsAutoRead();
  }
  
  private void readIfIsAutoRead() {
      if (channel.config().isAutoRead()) {
          channel.read();
      }
  }
  ```

  最终调用到 AbstractNioChannel 中的 `read()` 方法，又从 Pipieline 的 tail 节点开始触发传递 `read` 事件，注意这个 `read` 是一个 Outbound 出站事件：

  ```java
  // AbstractNioChannel.java
  
  public Channel read() {
      pipeline.read();
      return this;
  }
  ```

  ```java
  // DefaultChannelPipeline.java
  
  public final ChannelPipeline read() {
      // 触发传递read出站事件
      tail.read();
      return this;
  }
  ```

  ```java
  // AbstractChannelHandlerContext.java
  
  public ChannelHandlerContext read() {
      // 获取下一个Outbound Handler
      final AbstractChannelHandlerContext next = findContextOutbound(MASK_READ);
      EventExecutor executor = next.executor();
      if (executor.inEventLoop()) {
          // 触发read事件
          next.invokeRead();
      } else {
          Tasks tasks = next.invokeTasks;
          if (tasks == null) {
              next.invokeTasks = tasks = new Tasks(next);
          }
          executor.execute(tasks.invokeReadTask);
      }
      return this;
  }
  ```

  最终会传递到 head 节点：

  ```java
  // DefaultChannelPipeline.HeadContext.java
  
  public void read(ChannelHandlerContext ctx) {
      unsafe.beginRead();
  }
  ```

  底层最终调用 AbstractNioChannel 的 doBeginRead 方法：

  ```java
  // AbstractNioChannel.java
  
  protected void doBeginRead() throws Exception {
      final SelectionKey selectionKey = this.selectionKey;
      if (!selectionKey.isValid()) {
          return;
      }
  
      readPending = true;
      final int interestOps = selectionKey.interestOps();
      if ((interestOps & readInterestOp) == 0) {
          selectionKey.interestOps(interestOps | readInterestOp);
      }
  }
  ```

  上述的 `readInterestOp` 参数就是在前面初始化 ServerSocketChannel 所传入的 `SelectionKey.OP_ACCEPT` 事件，所以至此 EventLoop 才会开始监听该 ServerSocketChannel 上的 `OP_ACCEPT` 事件。



###### 4.1.2.8 ServerBootstrapAcceptor

最后，我们来看下 ServerBootstrapAcceptor 这个**入站** Handler 处理器，它的作用就是当 NioServerSocketChannel 完成新的 SocketChannel 连接建立后，将这些 Channel 注册到子 Reactor 线程池中：

```java
// ServerBootstrap.java

private static class ServerBootstrapAcceptor extends ChannelInboundHandlerAdapter {

    private final EventLoopGroup childGroup;
    private final ChannelHandler childHandler;
    private final Entry<ChannelOption<?>, Object>[] childOptions;
    private final Entry<AttributeKey<?>, Object>[] childAttrs;
    private final Runnable enableAutoReadTask;

    ServerBootstrapAcceptor(
        final Channel channel, EventLoopGroup childGroup, ChannelHandler childHandler,
        Entry<ChannelOption<?>, Object>[] childOptions, Entry<AttributeKey<?>, Object>[] childAttrs) {
        this.childGroup = childGroup;
        this.childHandler = childHandler;
        this.childOptions = childOptions;
        this.childAttrs = childAttrs;
        enableAutoReadTask = new Runnable() {
            @Override
            public void run() {
                channel.config().setAutoRead(true);
            }
        };
    }

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) {
        // 1.收到一个新建立连接的 SocketChannel
        final Channel child = (Channel) msg;
        // 2.在 Channel的pipeline 中添加业务处理器
        child.pipeline().addLast(childHandler);
        // 3.配置 Channel 的参数和自定义属性
        setChannelOptions(child, childOptions, logger);
        setAttributes(child, childAttrs);

        try {
            // 4.向子 Reactor 线程池（也就是子 EventLoopGroup）注册该 Channel
            childGroup.register(child).addListener(new ChannelFutureListener() {
                @Override
                public void operationComplete(ChannelFuture future) throws Exception {
                    if (!future.isSuccess()) {
                        forceClose(child, future.cause());
                    }
                }
            });
        } catch (Throwable t) {
            forceClose(child, t);
        }
    }
    //...
}
```

> 服务端 ServerSocketChannel 的 channelRead 事件只会在新连接接入时触发。

ServerBootstrapAcceptor 通过 `childGroup.register()` 方法，将 NioSocketChannel 注册到 Worker 工作线程中，并注册 `OP_READ` 事件到 NioSocketChannel 的事件集合。



关于服务端如何处理客户端新建连接的具体源码（`ServerBootstrap.register()`），这里不贴了，它的内部会调用`pipeline.fireChannelRegistered()` 方法传播 `channelRegistered` 事件，然后再调用 `pipeline.fireChannelActive()` 方法传播 `channelActive` 事件，最终会将 `SelectionKey.OP_READ `事件注册到 Channel 的事件集合。



------

至此，ServerBootstrap 的源码就分析完了，从源码层面看 Netty Server 的启动流程， 对后续 Netty 的深入使用非常有帮助，总结一下整个流程：

- **创建服务端 Channel**：本质是创建 JDK 底层原生的 Channel，并初始化几个重要的属性，包括 id、unsafe、pipeline 等；
- **初始化服务端 Channel**：设置 Socket 参数以及用户自定义属性，并添加两个特殊的处理器 ChannelInitializer 和 ServerBootstrapAcceptor；
- **注册服务端 Channel**：调用 JDK 底层将 Channel 注册到 Selector 上；
- **端口绑定**：调用 JDK 底层进行端口绑定，并触发 channelActive 事件，把 `OP_ACCEPT`事件注册到 Channel 的事件集合中。

> 至于客户端使用的Bootstrap，底层源码和 ServerBootstrap是类似的，可以自行阅读 Netty 源码。
