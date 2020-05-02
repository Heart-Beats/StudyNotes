# Android常见架构模式

> 对于我们 Android 开发者来说，常见的架构模式基本上就是 MVC，MVP，MVVM，这三种也是开发 GUI 应用程序常见的模式。类似设计模式，其实架构模式的目的不是为了让应用软件开发出来，而是让结构更清晰，分工更明确，扩展更方便等等。



[TOC]

------



### 1.架构的定义

​	架构是这样的：

- 为了解决**特定的问题**而提出

- 按照**特定的原则**将系统整体进行模块／组件／角色的划分

- 建立模块／组件／角色间的**沟通机制**

具体解释一下，首先是要有特定的问题，没有问题空谈架构，仿佛是空中楼阁，没有实用价值，而对应到不同的问题，会有不同的解决方式。


其次是模块的划分要根据特定的原则，没有原则随意划分，也就无从去评估一个架构的好坏。最后就是模块间的通信机制，让系统成为一个整体。

**最后，架构模式，其实更多的是一种思想，一种规则，往往一种架构模式可能会有不同的实现方式，而实现方式之间，只有合适与否，并没有对错之分。**

------



### 2. 如何分析一种架构模式

#### 2.1 架构解决了什么问题

​		知道了架构模式要解决的问题，我们才能针对性的去看，去想其解决方法是否得当，是否合适。

#### 2.2 架构模式是如何划分角色的

​		架构中最重要的就是角色 / 模块的划分，理解了架构模式中的角色划分，才能更好的理解其结构。

#### 2.3 角色间是如何通信的

​		角色间的通信也是重要的。相同的角色划分，采用不同的通信方式，往往就构成了不同的架构模式。

​		角色间通信我们可以理解为**数据的流向**。在 Android 开发中，通信中的数据可以理解为两种，一种是**数据结构**，也就是网络请求，本地存储等通信使用的 JavaBean，另一种是**事件**，也就是控件产生的动作，包括触摸，点击，滑动等等。我们在通信过程中，也主要关注这两种数据。

------



### 3. MVC 架构

![img](https://mmbiz.qpic.cn/mmbiz_png/sq6zbEZ01AnMbB2yxLc2ia8jkEOpENed5yQd7xPLoyagm79icLs1PpTdibHIndDOn0VFHmLqKpfK1ic2rkOsZF4Iug/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

#### 3.1 解决什么问题

我们可以看到，不使用架构进行开发，带来的问题是 Activity / Fragment 逻辑臃肿，不利于扩展。

所以 MVC 就要解决的问题就是：**控制逻辑，数据处理逻辑和界面交互耦合。**


其实我们作为程序员，写代码不仅要实现需求，还要让代码易读，易扩展。这一点，往往也能体现功力，并不是说使用了各种奇技淫巧才是大神。

#### 3.2 如何划分角色

为了解决上面的问题，MVC 架构里，将逻辑，数据，界面的处理划分为三个部分，模型(Model)-视图(View)-控制器(Controller)。

各个部分的功能如下：

- **Model 模型：**负责数据的加载和存储。
- **View 视图：**负责界面的展示。
- **Controller 控制器：**负责逻辑控制。

#### 3.3 如何通信（数据的流向）


在介绍如何通信之前，我们先解释一下通信中的数据是什么。其实在 Android 开发中，通信数据可以理解为两种，一种是**数据结构**，也就是网络请求，本地存储等通信使用的 JavaBean，另一种是**事件**，也就是控件产生的动作，包括触摸，点击，滑动等等。我们在通信过程中，也主要关注这两种数据。


**在 MVC 架构中，View 产生事件，通知到 Controller，Controller 中进行一系列逻辑处理，之后通知给 Model 去更新数据，Model 更新数据后，再将数据结构通知给 View 去更新界面。**


这就是一个完整 MVC 的数据流向。

#### 3.4 MVC 架构模式的优缺点

- **优点：**
    1. 结构清晰，职责划分清晰
    2. 降低耦合
    3. 有利于组件重用

- **缺点：**
    1. 一般来说，Activity / Fragment 会承担 View 和 Controller 两个角色，就会导致 Activity / Fragment 中代码较多
    2. Model 直接操作 View，View 的修改会导致 Controller 和 Model 都进行改动
    3. 增加了代码结构的复杂性

------



### 4. MVP 架构

![img](https://mmbiz.qpic.cn/mmbiz_png/sq6zbEZ01AnMbB2yxLc2ia8jkEOpENed5CWe8FFdYAWe2eBennrfDXZoHbmFxpoK5Dvy4Srdqria5ibABdYdqSiaicg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

#### 4.1 解决什么问题

MVP 要解决的问题和 MVC 大同小异：**控制逻辑，数据处理逻辑和界面交互耦合，同时能将 MVC 中的 View 和 Model 解耦。**

#### 4.2 如何划分角色

MVP 架构里，将逻辑，数据，界面的处理划分为三个部分，模型(Model)-视图(View)-控制器(Presenter)。

各个部分的功能如下：

- **Model 模型：**负责数据的加载和存储
- **View 视图：**负责界面的展示
- **Presenter 控制器**：负责逻辑控制

#### 4.3 如何通信（数据的流向）

我们可以看到，MVP 中的各个角色划分，和 MVC 基本上相似，那么区别在哪里呢？区别就在角色的通信上。



**MVP 和 MVC 最大的不同，就是 View 和 Model 不相互持有，都通过 Presenter 做中转**。View 产生**事件**，通知给 Presenter，Presenter 中进行逻辑处理后，通知 Model 更新数据，Model 更新数据后，通知**数据结构**给 Presenter，Presenter 再通知 View 更新界面。

这就是一个完整 MVP 的数据流向。

#### 4.4 MVP 架构模式的优缺点

- **优点：**
    1. 结构清晰，职责划分清晰
    2. 模块间充分解耦
    3. 有利于组件的重用

- **缺点：**
    1. 会引入大量的接口，导致项目文件数量激增
    2. 增大代码结构复杂性

------



### 5. MVVM 架构

![img](https://mmbiz.qpic.cn/mmbiz_png/sq6zbEZ01AnMbB2yxLc2ia8jkEOpENed5UIEB5MXiconDvkpCPwQJOLKzQuvbqZTCNg2XNqzA7S5tMVxKjPp1uxQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

#### 5.1  解决什么问题 

MVVM 要解决的问题和 MVC，MVP 大同小异：控制逻辑，数据处理逻辑和界面交互耦合，并且同时能将 MVC 中的 View 和 Model 解耦，还可以把 MVP 中 Presenter 和 View 也解耦。

#### 5.2 如何划分角色

MVVM 架构里，将逻辑，数据，界面的处理划分为三个部分，模型(Model)-视图(View)-逻辑(ViewModel)。

各个部分的功能如下：

- **Model 模型：**负责数据的加载和存储
- **View 视图：**负责界面的展示
- **ViewModel 控制器：**负责逻辑控制

#### 5.3 如何通信（数据的流向）

我们可以看到，MVVM中的各个角色划分，和 MVC，MVP 基本上相似，区别也是在于角色的通信上。

我们上面说到，在 MVP 中，就是 View 和 Model 不相互持有，都通过 Presenter 做中转。这样可以使 View 和 Model 解耦。

而在 MVVM 中，解耦做的更彻底，ViewModel 也不会持有 View。其中 ViewModel 中的改动，会自动反馈给 View 进行界面更新，而 View 中的事件，也会自动反馈给 ViewModel。

要达到这个效果，当然要使用一些工具辅助，比较常用的就是 **databinding**。在 MVVM 中，数据的流向是这样的：
**View 产生事件，自动通知给 ViewMode，ViewModel 中进行逻辑处理后，通知 Model 更新数据，Model 更新数据后，通知数据结构给 ViewModel，ViewModel 自动通知 View 更新界面。**

这就是一个完整 MVVM 的数据流向。

#### 5.4 MVVM 架构模式的优缺点

- **优点：**
    1. 结构清晰，职责划分清晰
    2. 模块间充分解耦
    3. 在 MVP 的基础上，MVVM 把 View 和 ViewModel 也进行了解耦

- **缺点：**
    1. Debug 困难，由于 View 和 ViewModel 解耦，导致 Debug 时难以一眼看出 View 的事件传递
    2. 代码复杂性增大

#### 5.5 MVVM在项目中划分

![img](https://upload-images.jianshu.io/upload_images/6444381-d0227c73131096d3.png?imageMogr2/auto-orient/strip|imageView2/2/w/960/format/webp)

- **View层：**Activity/Fragment，持有ViewModel引用，向ViewModel传递事件以及观察数据（LiveData）的变化

- **ViewModel层：**逻辑控制层，各种画面的ViewModel，持有Repository的引用，向Repository请求数据并向下设置数据（LiveData）

- **Model层：**数据层，各种repository存放不同类型的数据，并向外提供接口以复用

    ​	有以下几种类型数据：

    1. 网络数据：使用Retrofit + RxJava进行网络请求
    2. 本地数据库：选择合适的ORM数据库框架进行增删改查
    3. 本地文件：通过流访问
    4. 缓存：主要缓存请求比较耗时的数据，这样再次请求数据时的顺序就变为：请求-->缓存-->文件或数据库-->网络请求

