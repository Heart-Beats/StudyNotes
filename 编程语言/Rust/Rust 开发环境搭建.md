## Rust 开发环境搭建

[TOC]



> 安装 Rust
>
> ​        `rustup` 是 Rust 的安装程序，也是它的版本管理程序。 强烈建议使用 `rustup` 来安装 Rust，当然如果你有异心，请寻找其它安装方式，请参见 [Rust 其它安装方法](https://forge.rust-lang.org/infra/other-installation-methods.html#other-rust-installation-methods)。
>
> ​        至于版本，现在 Rust 稳定版特性越来越全了，因此下载最新稳定版本即可。



### 1. 在 Windows 上安装 Rustup



#### 1.1  安装 MSYS2

> msys2是一种在Windows平台上模拟Linux运行环境的技术，它的一个优点就在于利用pacman包管理器，我们可以比较轻松的使用Linux包管理器的方式来安装一整套可以在Windows上运行的Linux工具。如果你只是想要在Windows上简单运行一些Linux程序，那么msys2是一个很好的选择。

详细的使用可见： [使用msys2打造优雅的开发环境 ](https://www.cnblogs.com/52fhy/p/15158765.html) ， 我们这里使用中科大的镜像地址：

- 安装 msys2

  - 官网：https://www.msys2.org/
  - github: https://github.com/msys2/msys2-installer
  - 镜像地址：https://mirrors.ustc.edu.cn/msys2/distrib/x86_64/
    

- 配置 pacman 镜像

  点击安装路径的 `mingw64.exe` 启动，在 MSYS2 环境下直接运行命令替换镜像源：

  ```shell
  sed -i "s#mirror.msys2.org/#mirrors.ustc.edu.cn/msys2/#g" /etc/pacman.d/mirrorlist*
  ```

  然后执行 `pacman -Sy` 刷新软件包数据即可。



#### 1.2  安装 Rustup

MSYS2 安装配置好后，就可以 <font color="red">在 MSYS2 环境下 </font>直接安装 rustup：

```shell
curl https://sh.rustup.rs -sSf | sh
```

之后，根据以下输出进行配置:

```shell
$ curl https://sh.rustup.rs -sSf | sh
info: downloading installer

Welcome to Rust!

This will download and install the official compiler for the Rust
programming language, and its package manager, Cargo.

Rustup metadata and toolchains will be installed into the Rustup
home directory, located at:

  D:\RustUp\.rustup

This can be modified with the RUSTUP_HOME environment variable.

The Cargo home directory is located at:

  D:\RustUp\.cargo

This can be modified with the CARGO_HOME environment variable.

The cargo, rustc, rustup and other commands will be added to
Cargo's bin directory, located at:

  D:\RustUp\.cargo\bin

This path will then be added to your PATH environment variable by
modifying the HKEY_CURRENT_USER/Environment/PATH registry key.

You can uninstall at any time with rustup self uninstall and
these changes will be reverted.

Current installation options:


   default host triple: x86_64-pc-windows-msvc
     default toolchain: stable (default)
               profile: default
  modify PATH variable: yes

1) Proceed with standard installation (default - just press enter)
2) Customize installation
3) Cancel installation
>
```

这里可以配置 `RUSTUP_HOME` 及 `CARGO_HOME` 环境变量来修改 rustup 、cargo 的安装路径，确认没问题后按下 1，等待。

如下所示完成后，即表示您就已经安装了 `Rust` 和 `rustup`：

```shell
Current installation options:


   default host triple: x86_64-pc-windows-msvc
     default toolchain: stable (default)
               profile: default
  modify PATH variable: yes

1) Proceed with standard installation (default - just press enter)
2) Customize installation
3) Cancel installation
>1

info: profile set to 'default'
info: default host triple is x86_64-pc-windows-msvc
info: syncing channel updates for 'stable-x86_64-pc-windows-msvc'
info: latest update on 2024-06-13, rust version 1.79.0 (129f3b996 2024-06-10)
info: downloading component 'cargo'
info: downloading component 'clippy'
info: downloading component 'rust-docs'
info: downloading component 'rust-std'
 18.3 MiB /  18.3 MiB (100 %)  17.5 MiB/s in  1s ETA:  0s
info: downloading component 'rustc'
 57.7 MiB /  57.7 MiB (100 %)  39.7 MiB/s in  1s ETA:  0s
info: downloading component 'rustfmt'
info: installing component 'cargo'
info: installing component 'clippy'
info: installing component 'rust-docs'
 15.4 MiB /  15.4 MiB (100 %)   1.6 MiB/s in  8s ETA:  0s
info: installing component 'rust-std'
 18.3 MiB /  18.3 MiB (100 %)  12.9 MiB/s in  1s ETA:  0s
info: installing component 'rustc'
 57.7 MiB /  57.7 MiB (100 %)  11.0 MiB/s in  5s ETA:  0s
info: installing component 'rustfmt'
info: default toolchain set to 'stable-x86_64-pc-windows-msvc'

  stable-x86_64-pc-windows-msvc installed - rustc 1.79.0 (129f3b996 2024-06-10)


Rust is installed now. Great!

To get started you may need to restart your current shell.
This would reload its PATH environment variable to include
Cargo's bin directory (D:\RustUp\.cargo\bin).

Press the Enter key to continue.

```

 

#### 1.3 检查安装是否成功

检查是否正确安装了 Rust，可打开终端并输入下面这行，此时能看到最新发布的稳定版本的版本号、提交哈希值和提交日期：

```shell
❯ rustc -V
rustc 1.79.0 (129f3b996 2024-06-10)

❯ cargo -V
cargo 1.79.0 (ffa9cf99a 2024-06-03)
```

注意：这个终端并不是 在 MSYS2 环境下 对应的终端，而是<font color="red">系统本身的终端 </font>。

如果没看到此信息：

1. 如果你使用的是 Windows，请检查 Rust 或 `%USERPROFILE%\.cargo\bin` 是否在 `%PATH%` 系统变量中。
2. 如果你使用的是 Windows 下的 Linux 子系统，请关闭并重新打开终端，再次执行以上命令。



#### 1.4 更新

要更新 Rust，在终端执行以下命令即可更新：

```bash
$ rustup update
```



#### 1.5 卸载

要卸载 Rust 和 `rustup`，在终端执行以下命令即可卸载：

```bash
$ rustup self uninstall
```



------





### 2 . 在 Linux 或 macOS 上安装 rustup

在 Linux  上安装 rustup ， 可以使用字节的 rsproxy 进行安装使用，主页：https://rsproxy.cn/。相关介绍如下：



#### 2.1 服务介绍

由于国内拉取 crates.io 以及安装 Rust 会面临流量出境不稳定的问题，我们提供了一个国内镜像代理以帮助国内 Rust 生态发展，欢迎大家使用。



#### 2.2  配置说明



##### 2.2.1 设置 Rustup 镜像

修改配置 ~/.zshrc or ~/.bashrc

```bash
export RUSTUP_DIST_SERVER="https://rsproxy.cn"
export RUSTUP_UPDATE_ROOT="https://rsproxy.cn/rustup"
```



##### 2.2.2 安装 Rust

请先完成步骤一的环境变量导入并 source rc 文件或重启终端生效

```bash
curl --proto '=https' --tlsv1.2 -sSf https://rsproxy.cn/rustup-init.sh | sh
```





------





### 3.  配置 Cargo 工具



> Rust 官方提供了非常强大的构建系统和包管理器 `Cargo`。Cargo 可以为你处理很多任务，比如下载 crate 依赖项、编译 crate、构建代码、生成可分发的 crate，并将它们上传到 crates.io —— Rust 社区的 crate 注册表。
>
> 
>
> Rust 中的 crate，类似于其它编程语言中的`“包”或者“库”`。目前，Rust 中约定不做翻译。

Rust 和 Cargo 捆绑，或者说 Rust 安装器中内置了 Cargo。因此，成功安装 Rust 之后，Cargo 也会随之安装，并主动配置环境变量。





#### 3.1 配置 Cargo 国内镜像源

Rust 官方默认的 Cargo 源服务器为 crates.io，其同时也是 Rust 官方的 crate 管理仓库，放置在 github。


Cargo 的“注册表源”与 crates.io 本身相同。也就是说，Cargo 也有一个在 github 存储库中提供的索引。该存储库匹配 `crates.io index` 的格式，即 github 仓库 `https://github.com/rust-lang/crates.io-index`，由该存储库的索引指示下载包的配置。


但是，Rust 官方服务器部署在北美洲，中国大陆用户下载速度较慢，甚至反复中断下载。因此笔者建议中国大陆用户使用国内镜像源，但如果你愿意等待较长时间，可以采用默认的官方源。


提供了 Rust 工具链镜像源的站点，一般也会提供 Cargo 国内镜像源服务。目前，国内 cargo 镜像源有：中国科学技术大学源、上海交通大学源、清华大学源、字节跳动以及 rustcc 社区源。


Cargo 支持**更换 crates.io 源索引**，通过 `$HOME/.cargo/config` 文件配置。自定义 Cargo 源有两种方法，笔者推荐使用第一种：

1. 创建 `$HOME/.cargo/config` 文件（各操作系统及版本均大致相同），然后在 config 文件内写入下述配置内容。其中协议推荐使用 git，但对于 https 和 git 协议，一般各镜像源都支持，并且是可以互换的。如果你所处的环境中不允许使用 git 协议，或者配置 git 协议后不能正常获取和编译 crate，可以换 https 协议再试试。

   ```toml
   [source.crates-io]
   registry = "https://github.com/rust-lang/crates.io-index"
   # 指定镜像
   replace-with = '镜像源名' # 如：tuna、sjtu、ustc，或者 rustcc
   
   # 注：以下源配置一个即可，无需全部
   
   # 中国科学技术大学
   [source.ustc]
   registry = "https://mirrors.ustc.edu.cn/crates.io-index"
   # >>> 或者 <<<
   registry = "git://mirrors.ustc.edu.cn/crates.io-index"
   
   # 上海交通大学
   [source.sjtu]
   registry = "https://mirrors.sjtug.sjtu.edu.cn/git/crates.io-index/"
   
   # 清华大学
   [source.tuna]
   registry = "https://mirrors.tuna.tsinghua.edu.cn/git/crates.io-index.git"
   
   #  字节跳动
   [source.rsproxy]
   registry = "https://rsproxy.cn/crates.io-index"
   
   # rustcc社区
   [source.rustcc]
   registry = "https://code.aliyun.com/rustcc/crates.io-index.git"
   ```

   **cargo 1.68 版本开始支持稀疏索引**：不再需要完整克隆 crates.io-index 仓库，可以加快获取包的速度。如果您的 cargo 版本大于等于 1.68，可以在 $HOME/.cargo/config 中添加如下内容：

   以下配置仅以中国科学技术大学源为示例，其它源配置类同。

   ```toml
   [source.crates-io]
   replace-with = 'ustc'
   
   [source.ustc]
   registry = "sparse+https://mirrors.ustc.edu.cn/crates.io-index"
   ```

   

   ==最终的配置可如下所示，这里采用更优的字节镜像==：

   ```toml
   [source.crates-io]
   replace-with = 'rsproxy-sparse'
   
   [source.rsproxy]
   registry = "https://rsproxy.cn/crates.io-index"
   
   [source.rsproxy-sparse]
   registry = "sparse+https://rsproxy.cn/index/"
   
   [registries.rsproxy]
   index = "https://rsproxy.cn/crates.io-index"
   
   [net]
   git-fetch-with-cli = true
   ```

   

2. 或者在项目工程结构中，与 Cargo.toml 同级目录的 .cargo 文件夹下创建 config 文件，config 文件配置方法和内容与第一种相同。

3. 除了自己配置镜像以外，还可以使用==镜像管理工具：**`crm`**== ，通过它能够对 `Cargo` 镜像源进行简单的添加、修改、删除操作，并能帮助您快速的切换不同的 `Cargo` 镜像源，这里不再对使用方法作介绍，具体地址：https://github.com/wtklbm/crm。



#### 3.2  使用 cargo 管理 crate

可以通过 `cargo install` 和 `cargo uninstall` 管理本地环境可执行 crate。

`cargo install` 用于在本地环境安装可执行 crate。Linux/WSL、macOS 环境默认路径为 `$HOME/.cargo/bin`，Windows 环境默认路径为 `%USERPROFILE%\.cargo\bin`。



本书中，我们将会实践 Rust 的模糊测试库 cargo-fuzz，我们既可以通过 `cargo install cargo-fuzz` 来将其可执行程序安装到本地环境。如果需要一次安装多个，通过空格分隔即可，假设我们也需要安装 Rust 语言开发的优秀书籍构建工具 mdbook。执行如下图 3.2-1 所示命令：

![cargo install](https://rust-guide.niqin.com/zh-cn/css/cargo/4.2-1-cargo-install.png)

<center>图 3.2-1</center>

在图 3.2-1 中，各处标记反映了如下信息——

- 标记 1 处为我们将要执行的安装命令 `cargo install mdbook cargo-fuzz`，我们要将 mdbook 和 cargo-fuzz 的可执行程序安装到本地环境。
- 标记 2 处信息表示当前使用的 Cargo 源服务器地址，笔者使用的是中国科学技术大学提供的 Cargo 镜像源。
- 标记 3 处表示 mdboo、cargo-fuzz 这 2 个可执行 crate 安装时，需要依赖编译的 crate 数量，我们可以看到达到了 253 个依赖项。
- 另外，安装过程中，我们还可以看到分为下载和编译 2 个阶段。

当安装完成后，会在命令窗口底部提示安装路径，版本等信息。如图 3.2-2 底部 2 行所示。

![cargo installed](https://rust-guide.niqin.com/zh-cn/css/cargo/4.2-2-cargo-installed.png)

<center>图 3.2-2</center>

我们根据图 3.2-2 中提示的 crate 安装后的路径，查看是否安装成功。执行查看命令 ll（Windows CMD 窗口请使用 dir）查看安装位置所在目录，如图 3.2-3 所示，2 个红框内的可执行程序，表示已经安装成功。

![cargo bin](https://rust-guide.niqin.com/zh-cn/css/cargo/4.2-3-cargo-bin.png)

<center>图 3.2-3</center>

如果需要卸载本地环境的可执行程序 cargo-fuzz，执行 `cargo uninstall cargo-fuzz` 命令即可。同样，可以一次卸载多个本地环境的可执行程序。如图 3.2-4 所示。

![cargo uninstall](https://rust-guide.niqin.com/zh-cn/css/cargo/4.2-4-cargo-uninstall.png)

<center>图 3.2-4</center>