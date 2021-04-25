## Gitlab 的使用



[TOC]





### 1. 账号相关



#### 1.1 注册账号

-   用户操作

    首先，打开我们内部使用的部署的 Gitlab 服务器：http://172.22.81.20:80 ，不出意外就会进入如下登录页面：

    <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419090516403.png" alt="image-20210419090516403" style="zoom: 65%;" />

    点击上方图片中红框部分即可进入注册账号页面：

    <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419090646955.png" alt="image-20210419090646955" style="zoom: 65%;" />

    对于上方的注册信息填写，建议填写真实姓名和公司邮箱，用户名随意。填写成功注册后，会回到登录页面，同时上方有如下提示信息：

    <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419091404634.png" alt="image-20210419091404634" style="zoom: 65%;" />

    这时候只需要等待管理员验证邮箱和账号通过即可登录。

    

-   管理员操作

    用户成功创建账号后，管理员即会收到一封确认用户的邮件，点开邮件中的请求地址登录即可看到如下页面：

    <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419115351149.png" alt="image-20210419115351149" style="zoom: 65%;" />

    依次点击上图中的位置，即可确认用户的邮箱和账号，随后用户即可登录 Gitlab。

    

#### 1.2  登录账号

管理员批准账号后，用户的注册邮箱稍等片刻即会收到确认批准的邮件，使用我们刚刚注册的账号登录 Gitlab, 初次登录时会出现如下欢迎界面：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419100619933.png" alt="image-20210419100619933" style="zoom: 65%;" />

这里需要我们设置一下自己在团队中的信息，共有如下选项：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419100757130.png" alt="image-20210419100757130" style="zoom: 65%;" />

我们开发人员使用默认选择即可。点击 `Get Started!` 之后即可进入个人主页如下：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419115848216.png" alt="image-20210419115848216" style="zoom: 65%;" />

因为目前管理员未给此账号分配任何组和项目，所以会有以上选项，一般情况下我们无需创建项目和组，由上级领导邀请即可。



如果你想设置一些自己账号的信息，可点击右上角的头像，选择 `Edit Profile`，这里可以编辑设置自己的头像、时区、所在城市等等。

还有一个比较常用的设置是更改 Gitlab 的外观，如图：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419130052252.png" alt="image-20210419130052252" style="zoom:65%;" />

这里可以更改 Gitlab 的主题色，代码显示风格以及本地化显示等等，这里不作过多介绍。



------



### 2.仓库相关

在正式使用 Gitlab 的仓库功能之前，我们还需要进行一个设置：添加 ==SSH Keys==。



#### 2.1  SSH 与 SSH Keys

>   **Secure Shell** (**SSH**) 是一个允许两台电脑之间通过安全的连接进行数据交换的**网络协议**。通过**加密**保证了数据的保密性和完整性。SSH采用**公钥**加密技术来**验证远程主机**，以及(必要时)允许远程主机验证用户。

我们常用的基于此协议实现的的程序为 **OpenSSH**，一般情况下系统都已默认安装，如若提示命令未发现可自行百度安装。

因为我们是作为 SSH 客户端，所以我们需要生成 **SSH 密钥对**，它最直观的作用：**让你方便的登录到 SSH 服务器，而无需输入密码**。由于无需发送密码到网络中，SSH 也被认为是更加安全验证方式。



接下来我们就可以生成 SSH 秘钥对，**ssh-keygen 命令**就是用于 ssh 生成、管理和转换认证密钥，它支持RSA和DSA两种认证密钥。具体选项如下：

```shell
-b：指定密钥长度；
-e：读取openssh的私钥或者公钥文件；
-C：添加注释；
-f：指定用来保存密钥的文件名；
-i：读取未加密的ssh-v2兼容的私钥/公钥文件，然后在标准输出设备上显示openssh兼容的私钥/公钥；
-l：显示公钥文件的指纹数据；
-N：提供一个新密语；
-P：提供（旧）密语；
-q：静默模式；
-t：指定要创建的密钥类型。
```

但一般我们无需使用这些选项也可使用，命令行输入：`ssh-keygen` 一直回车直至出现下图类似即可：

![image-20210419141045542](https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419141045542.png)



这就代表已经正常生成了 SSH 秘钥对， 接下来我们仅需要把其中的公钥添加到自己的 Gitlab 账号设置中即可。



#### 2.2 添加 SSH Keys

Windows 系统需要打开 `C:\Users\当前用户\\.ssh\id_rsa.pub` 此路径对应的文件，全选拷贝其中的内容。其他系统仅需命令行运行 `cat ~/.ssh/id_rsa.pub`

拷贝显示的所有内容。接下来登录自己的 Gitlab 账号，进入用户设置页面点击 SSH Keys 如下：

 <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419142250909.png" alt="image-20210419142250909" style="zoom:65%;" />

将刚才拷贝的内容粘贴到 `Key` 下方的输入框，Title 默认对应公钥中的注释，可以自行修改为自己想要的标识名称，`Expires at` 为失效时间，默认可不设置代表永久不失效。

点击下方的 `Add key` 添加成功即可得到如下类似页面：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419143101896.png" alt="image-20210419143101896" style="zoom:65%;" />



#### 2.3 添加群组



##### 2.3.1 创建群组

为了更方便地进行团队开发协作管理，可以使用群组。群组允许你管理、协作多个项目。群组的成员可以访问群组下的所有项目。

接下来我们就尝试创建一个群组，依次点击如下图中的指示位置：

![image-20210419144306829](https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419144306829.png)

随后就进入创建群组页面：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419144443941.png" alt="image-20210419144443941" style="zoom: 65%;" />

我们可以设置群组的名称、访问地址以及可见性，对于可见性一般设置 Private ：群组及其项目只能由其成员查看。这里先以管理员账号创建一个测试群组，创建结果如下：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419145248531.png" alt="image-20210419145248531" style="zoom:65%;" />



##### 2.3.2 创建项目

群组创建完成之后，就可以给这个群组添加一些项目，这里我们也使用管理员账号创建项目为例，点击上图中的 群组概览 —-> 新建项目 ， 如下：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419150501220.png" alt="image-20210419150501220" style="zoom:65%;" />

我们即可按照自己的需求给这个群组创建一个新的项目，这里已创建一个空白项目为例，得到对应的页面如下：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419150853964.png" alt="image-20210419150853964" style="zoom:65%;" />

这里我们将要创建一个带有自述文件( README.md ) 的 Gitlab Test 项目，创建成功如下所示：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419151305387.png" alt="image-20210419151305387" style="zoom: 65%;" />

因该项目是由管理员创建，且群组中未添加其他成员，因此当前项目创建完成后默认仅管理员可见，可以点击左侧的成员选项为项目邀请访问成员或者群组：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419151936962.png" alt="image-20210419151936962" style="zoom: 65%;" />

因为介绍群组使用方式，这里就不作为介绍对象。



##### 2.3.3 添加成员

群组创建完成后，即可为群组邀请相应的成员，点击创建的群组得到主页面如下：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419152519395.png" alt="image-20210419152519395" style="zoom:65%;" />

Gitlab Test 即为我们刚刚创建的项目，点击左侧的成员选项得到如下页面：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419152650399.png" alt="image-20210419152650399" style="zoom: 65%;" />

你会发现这里群组成员邀请页面与项目成员邀请页面基本一致，所以了解如何给群组添加成员后也就会如何给项目添加成员了。接下来让我们开始添加成员吧！



点击 Gitlab 成员的输入框即可得到服务器中的所有用户，支持搜索用户名，即 @ 后面的部分，也支持同时添加多个用户：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419153453429.png" alt="image-20210419153453429" style="zoom:65%;" />

点击选择角色权限，选择框如下：

![image-20210419153757889](https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419153757889.png)

-   Guest：可以创建issue、发表评论，不能读写版本库

-   Reporter：可以克隆代码，不能提交，可以赋予测试、产品经理此权限

-   Developer：可以克隆代码、开发、提交、push，可以赋予开发人员此权限

-   MainMaster：可以创建项目、添加tag、保护分支、添加项目成员、编辑项目，一般GitLab管理员或者CTO才有此权限

    

这里我们基本上选择 Developer 即可，访问过期时间可以默认不填，邀请成功得到如下页面：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419154211412.png" alt="image-20210419154211412" style="zoom:65%;" />

此时，我们以邀请的用户登录 Gitlab，登录成功首页即会如下图所示，群组成员即可查看群组里的项目：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419154431521.png" alt="image-20210419154431521" style="zoom:65%;" />



#### 2.3.4 项目操作

点击用户账号下可见的项目，这里以先创建的 Gitlab Test 为例：

1.  克隆项目

    <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419154951619.png" alt="image-20210419154951619" style="zoom:65%;" />

    点击箭头位置即可得到该仓库对应的 SSH 访问连接，使用 Git 相应的命令克隆该仓库，若出错，请检查账号的 SSH Keys 是否配置完成。 

2.   新建分支

    除了克隆仓库后在本地新建分支提交文件外，我们也可以在 Gitlab 远程创建分支添加文件提交：

    <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419155439899.png" alt="image-20210419155439899" style="zoom:65%;" />

    点击新建分支：

    <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419155539687.png" alt="image-20210419155539687" style="zoom:65%;" />

    创建成功会默认切换到 test 分支：

    <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419155639688.png" alt="image-20210419155639688" style="zoom:65%;" />

    我们再来给该分支创建一个文件（同创建分支操作，选项不同）：

    <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419155934864.png" alt="image-20210419155934864" style="zoom:65%;" />

    提交后我们的 test  分支下文件就会变成如下所示：

    <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419160137880.png" alt="image-20210419160137880" style="zoom:65%;" />

3.   合并请求

     每次提交文件到 Gitlab 后，都会出现如下箭头指示的一个创建合并请求的按钮：

     <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419160455062.png" alt="image-20210419160455062" style="zoom:65%;" />

     当需要将我们的分支合并到其他分支上去时，就可以点击此按钮：

     <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419161324480.png" alt="image-20210419161324480" style="zoom:65%;" />

     其中需要注意：

     -   Assignee：选择 review 此次合并请求提交的人

     -   Reviewer：选择 review 此次合并请求提交的人

     -   Merge options：1. 合并请求接受后默认删除被合并分支   ——–> 不建议勾选     2. 合并请求接受后简化提交记录  ———-> 不建议勾选

         

     提交此合并请求后，相应的Assignee 和 Reviewer 即可在相应的项目首页查看到相应的请求：

     <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419163210443.png" alt="image-20210419163210443" style="zoom:65%;" />

     可以查看提交和变更内容，如果觉得合并没有任何问题的话可以点击合并（并不是所有人都有合并到某些分支的权限，可能需要分配）。合并成功后，相应的分支即会多出这些提交记录，我们可以通过如下步骤查看分支图来确认合并是否成功：

     <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210419163818601.png" alt="image-20210419163818601" style="zoom:65%;" />

     这时我们本地就可以使用 Git 获取分支最新的提交了。

