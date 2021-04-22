## Docker 上搭建 Gitlab服务器

[TOC]



### 1. [安装 Docker Engine](https://docs.docker.com/engine/install/ubuntu/#prerequisites)



安装步骤：

1.  卸载旧版本

    Docker 的旧版本被称为`docker`，`docker.io`或`docker-engine`。如果安装了这些，需要卸载它们：

    ```shell
     sudo apt-get remove docker docker-engine docker.io containerd runc
    ```

    如果 `apt-get` 报告未安装这些软件包，则可以继续安装，同时若成功卸载旧版本， `/var/lib/docker/` 目录下的镜像和容器数据也会保留不会主动删除。如想删除已安装的镜像和容器可执行：

    ```shell
     sudo rm -rf /var/lib/docker
     sudo rm -rf /var/lib/containerd
    ```

    

2.  安装 Docker Engine

    -   设置存储库

        在首次安装Docker Engine之前，需要设置Docker存储库，之后就可以从存储库安装和更新Docker（推荐安装方法）：

        ```shell
        #1. 更新apt软件包索引并安装软件包以允许apt通过HTTPS使用存储库：
         sudo apt-get update
         
         sudo apt-get install \ 
         	apt-transport-https \
            ca-certificates \
            curl \
            gnupg \
            lsb-release
            
        #2. 添加Docker的官方GPG密钥：
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        
        #3. 使用以下命令来设置稳定的存储库
        echo \
          "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
          $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        ```

        

    -   安装 Docker Engine

        1.  更新`apt`软件包索引，并安装*最新版本*的Docker Engine和容器化的容器：

            ```shell
            sudo apt-get update
            sudo apt-get install docker-ce docker-ce-cli containerd.io
            ```

        2.  安装*特定版本*的Docker Engine

            a. 列出您的仓库中可用的版本：

            ```shell
            apt-cache madison docker-ce
            ```

            正常运行结果如下：

            ![image-20210422171842850](https://gitee.com/HeartBeats_huan/note-picture/raw/master/images/image-20210422171842850.png)
            
            b. 使用第二列中的版本字符串安装特定版本，例如`5:18.09.1~3-0~ubuntu-xenial`
            
            ```shell
            sudo apt-get install docker-ce=<VERSION_STRING> docker-ce-cli=<VERSION_STRING> containerd.io
            ```
            
            

3.  验证安装是否成功

    ```shell
    sudo docker run hello-world
    ```

    此命令下载测试镜像并在容器中运行它。容器运行时，它会打印参考消息并退出



------



### 2. Docker 搭建 Gitlab



#### 2.1 拉取gitlab镜像

```shell
docker pull gitlab/gitlab-ce
```

注意：如果没有指定对应的版本，默认会拉取 **latest**版本。

拉取完成之后通过 `docker images` 命令看到 `gitlab` 镜像证明已经拉取成功：

```shell
[root@localhost ~]# docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
gitlab/gitlab-ce    latest              5d8ab6b06918        4 days ago          1.43GB
```



