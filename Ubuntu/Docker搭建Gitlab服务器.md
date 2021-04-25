## Docker 上搭建 GitLab服务器

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

            ![image-20210422171842850](https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20210422171842850.png)
            
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



### 2. Docker 搭建 GitLab



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



#### 2.2 运行容器

执行命令：

```shell
docker run --detach --hostname gitlab.xxx.com \
	--publish 444:443 --publish 81:80 --publish 23:22 \ 
    --volume /home/gitlab/config:/etc/gitlab \
    --volume /home/gitlab/logs:/var/log/gitlab \
    --volume /home/gitlab/data:/var/opt/gitlab \
    --restart always  --name gitlab  gitlab/gitlab-ce 
```

-   **--hostname 或 -h** ：指定容器中绑定的域名，会在创建镜像仓库的时候使用到，这里绑定 `gitlab.xxx.com`

-   **--publish 或 -p** ：容器与宿主的端口映射

    | 协议  | 容器使用端口 | 宿主机映射端口 |
    | :---: | :----------: | :------------: |
    |  ssh  |      22      |       23       |
    | http  |      80      |       81       |
    | https |     443      |      444       |

-   **--volume 或 -v** ：挂载数据卷，容器与宿主机的存储映射

    | 宿主机的位置        | 容器的位置      | 作用                     |
    | ------------------- | --------------- | ------------------------ |
    | /home/gitlab/config | /etc/gitlab     | 用于存储 GitLab 配置文件 |
    | /home/gitlab/logs   | /var/log/gitlab | 用于存储日志             |
    | /home/gitlab/data   | /var/opt/gitlab | 用于存储应用数据         |

-   **gitlab/gitlab-ce**：镜像的仓库名，也可以使用镜像 ID，可以通过 `docker images` 来确认

    

通过 `docker ps` 命令看到 gitlab 容器就证明已经运行成功：

```shell
[root@localhost ~]# docker ps
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                    PORTS                                                          NAMES
9e12ae220c14        5d8ab6b06918        "/assets/wrapper"   13 minutes ago      Up 13 minutes (healthy)   0.0.0.0:23->22/tcp, 0.0.0.0:81->80/tcp, 0.0.0.0:444->443/tcp   gitlab
```



#### 2.3 配置 GitLab

经过上述配置，容器 GitLab 的全局唯一配置都保存在容器内部的 `/etc/gitlab/gitlab.rb` 文件中，我们可以进入容器内部通过 **shell** 来打开这个编辑这个文件：

```shell
docker exec -it gitlab /bin/bash 'gedit /etc/gitlab/gitlab.rb'
```

当然，我们也可以编辑宿主与容器对应位置的文件：`/home/gitlab/config`



1.  配置外部访问地址

    打开配置文件，在文件尾部加入以下内容：

    ```shell
    # 配置http协议所使用的访问地址,不加端口号默认为80，修改需与 run 时定义的容器 http 端口一致 
    external_url 'http://172.22.81.20'
    
    # 配置ssh协议所使用的访问地址和端口
    gitlab_rails['gitlab_ssh_host'] = '172.22.81.20' #注意这里仅仅只填 IP 即可
    gitlab_rails['gitlab_shell_ssh_port'] = 23 # 此端口是run时22端口映射的23端口
    ```

    上面的配置完成之后，就可以重新加载 gitlab 配置：

    ```shell
    docker exec -it gitlab /bin/bash 'gitlab-ctl reconfigure'
    ```

    命令执行完成之后，打开浏览器地址栏输入 `http://172.22.81.20`，首次登录需要修改管理员（root）的密码，至少8位字符，设置完后再进入登录页面，即可用 root 账号 + 设置的密码登录。

    

2.  配置邮箱服务

    GitLab 的使用过程中涉及到大量的邮件，而邮件服务你可以选择使用 Postfix、endmai、 SMTP 其中一种，这里选用最方便的 `SMTP`， 打开配置文件 `/etc/gitlab/gitlab.rb` 且末尾添加如下内容：

    ```shell
    #配置邮箱服务  ---> 这里使用了 QQ 邮箱
    gitlab_rails['smtp_enable'] = true
    gitlab_rails['smtp_address'] = "smtp.qq.com"  #smtp 服务器地址
    gitlab_rails['smtp_port'] = 465
    gitlab_rails['smtp_user_name'] = "913305160@qq.com" # 使用的 QQ 邮箱 
    gitlab_rails['smtp_password'] = "npuxbgwplkpzcaij"   # QQ 邮箱开通 smtp 时返回的授权码
    gitlab_rails['smtp_domain'] = "qq.com"
    gitlab_rails['smtp_authentication'] = "login"
    gitlab_rails['smtp_enable_starttls_auto'] = true
    gitlab_rails['smtp_tls'] = true
    
    #配置邮箱来源与展示的名称
    gitlab_rails['gitlab_email_enabled'] = true
    gitlab_rails['gitlab_email_from'] = '913305160@qq.com' #发出邮件的用户,需要和 smtp_user_name 保持一致
    gitlab_rails['gitlab_email_display_name'] = 'Gitlab'   #发件时显示的名称
    user['git_user_email'] = '913305160@qq.com'
    ```

    之后重新加载 gitlab 配置：`docker exec -it gitlab /bin/bash 'gitlab-ctl reconfigure'`，完成之后测试邮件发送：

    ```shell
    #该命令执行会比较久
    gitlab-rails console
    
    Notify.test_email('xxxxxxxxx@qq.com', '测试消息', '测试消息内容').deliver_now
    ```

    成功之后，这里测试的邮箱就会收到测试邮件，这就证明配置的 gitlab 邮件服务没有任何问题。

    ==注意：root 用户必须配置有效邮箱，因为发件流程为：邮件服务邮箱 —–> root 用户邮箱 —–> GitLab 注册用户邮箱==



------



### 3. GitLab的数据备份

#### 3.1 修改备份配置

打开配置文件 `/etc/gitlab/gitlab.rb` 且末尾添加如下内容：

```shell
#修改备份配置
gitlab_rails['manage_backup_path'] = true
gitlab_rails['backup_path'] = "/var/opt/gitlab/backups" #使用默认备份文件路径, 可修改为容器内其他已存在的目录
gitlab_rails['backup_keep_time'] = 604800  #单位：秒，备份文件最多保存一周
```

重新加载 gitlab 配置并执行备份命令：

```shell
docker exec -it gitlab /bin/bash

gitlab-ctl reconfigure   #加载配置
gitlab-rake gitlab:backup:create  #备份数据
```

随后在容器内 `  /var/opt/gitlab/backups` 目录下，即宿主机的 `/home/gitlab/data/backups` 目录下就会生成一个名字类似  1619144614_2021_04_23_13.10.3_gitlab_backup.tar 的压缩文件，这就表示 Gitlab 服务器的数据备份成功。



#### 3.2 添加定时备份脚本

1.  首先创建一个备份脚本  ` sudo touch /home/backup-script/gitlab_auto_backup.sh`：

    ```shell
    #指定以 bash 执行脚本，避免 cron 执行时重定向 shell
    #!/bin/bash  
    
    echo "当前日期：$(date )"
    time=$(date "+%Y-%m-%d_%H-%M") #获取当前时间并格式化 
    save_path="/home/备份硬盘/Gitlab_Backup/$time"
    
    function delete_old_backup(){
    	echo "开始删除旧备份文件"
    	cd $(dirname $1)
    	ls | grep -v $time | xargs rm -rf
    	echo "删除旧备份文件完成"
    }
    
    function copy_lastest_backup(){
    	echo "开始创建目录：$save_path"
    	mkdir -p "/home/备份硬盘/Gitlab_Backup/$time" #一次性创建多层次目录
    
    	backup_path=/home/gitlab/data/backups
    	lastest_backup_path=$backup_path/$(ls -t $backup_path/| head -1)
    		
    	cp -r $lastest_backup_path $save_path
    	echo	"拷贝最新备份数据($lastest_backup_path)到$save_path完成"
    }
    
    printf "开始备份 GitLab 数据 ==========\n"
    docker exec -i gitlab /bin/bash -c 'gitlab-rake gitlab:backup:create' #这里不能以 tty(-t) 执行, 必须使用 -i
    printf "备份 GitLab 数据完成\n"
    
    copy_lastest_backup
    
    delete_old_backup $save_path
    printf  '=============================\n\n'
    ```

    

2.  再给其添加可执行权限并执行它：

    ```shell
    sudo chmod +x /home/backup-script/gitlab_auto_backup.sh
    sudo . /home/backup-script/gitlab_auto_backup.sh
    ```

    若执行完成之后在 `/home/备份硬盘/Gitlab_Backup/` 生成了 .tar 格式的 gitlab 备份文件，说明脚本手动执行没有问题。

    

3.  接下来就可以使用 crontab 添加一个定时任务来执行此脚本：

    -   开启 cron 日志，Ubuntu系统默认是不打开 cron 日志的，执行如下命令：

        ```shell
        sudo gedit /etc/rsyslog.d/50-default.conf
        ```

        在打开的文件中找到以 `#cron.*` 开头的这一行，去掉前面的注释，然后重启系统日志：`sudo service rsyslog restart`。

        这样 cron 运行时就可以通过 `sudo tail /var/log/cron.log` 查看它的日志了。

        

    -   继续执行 `sudo crontab -u root  -e` 进入编辑 **root 用户的crontab文件**，该文件每一行代表一项定时任务，都会以 root 用户执行，在尾部添加如下内容：

        ```shell
        0 2 * * * /home/backup-script/gitlab_auto_backup.sh >>/home/backup-script/gitlab_backup_log.txt 2>&1 </dev/null &
        ```

        以上任务表示：每天两点执行 `gitlab_auto_backup.sh` 脚本同时将正确和错误日志都追加输出到  `gitlab_backup_log.txt` 文件中。

        -   \>：覆盖写入文件，清空已有内容并重写；
        -   \>>：追加写入文件，在已有内容后插入；

    

    -    重新启动 cron服务，然后就会定时执行设定好的脚本：

         ```shell
         sudo service cron restart   #重新启动 cron 服务
         ```

         可以使用以下命令查看相关日志：

         ```shell
         sudo tail /var/log/cron.log #查看 cron 执行的日志
          
         sudo cat /home/backup-script/gitlab_backup_log.txt  #查看脚本执行的输出日志
         ```

         


#### 3.3 Crontab 的介绍



>   linux 系统是由 cron (crond) 这个系统服务来控制的。通常，crond 会在后台一直运行，crontab 存储的指令被守护进程激活，每一分钟检查是否有预定的作业需要执行。这类作业一般称为cron jobs。
>
>   Linux 系统上面原本就有非常多的计划性工作，因此这个系统服务是默认启动的。
>
>   另 外, 由于使用者自己也可以设置计划任务，所以， Linux 系统也提供了使用者控制计划任务的命令：crontab 命令。



##### 3.3.1 crontab 命令

1.  命令格式：crontab  [ -u user ]   [ -i ]   { -e  |  -l  |  -r }
    -   -u：用来设定某个用户的 crontab 服务，此参数一般由 root 用户来运行。如果不指定用户则表示当前登录用户的 crontab 文件
    -   -e：编辑某个用户的crontab文件内容
    -   -l：显示某个用户的crontab文件内容
    -   -r：删除某个用户的crontab文件
    -   -i：在删除用户的crontab文件时给确定提示



##### 3.3.2 crontab文件的格式



<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/20170416161735666.png" alt="img" style="zoom:80%;" />



```shell
#格式与取值范围:
 .---------------- minute (0 - 59)
 |  .------------- hour (0 - 23)
 |  |  .---------- day of month (1 - 31)
 |  |  |  .------- month (1 - 12) OR jan,feb,mar,apr ...
 |  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7) OR sun,mon,tue,wed,thu,fri,sat
 |  |  |  |  |
 *  *  *  *  * command
```

其中，command 为要执行的命令，可以是系统命令，也可以是自己编辑的脚本文件。

以上非命令字段中还可以使用以下特殊字符：

-   星号（*）：代表所有可能的值，即默认就为每天的每分钟都执行
-   逗号（,）：可以用逗号隔开的值指定一个列表范围，例如：“1,3,5”
-   中杠（-）：表示一个整数范围，例如："2-5" 表示 “2,3,4,5”
-   正斜杠（/）：表示指定时间的间隔频率，例如 “0-23/2” 表示每两小时执行一次；*/10：在minute 字段中表示每10分钟执行一次。

通过以上组合即可精确到任务精确到每个字段的执行频率。



##### 2.3.3  关于crontab服务的指令

-   service crond start ：启动服务
-   service crond stop ：关闭服务
-   service crond restart ：重启服务
-   service crond reload ：重新载入配置
-   service crond status ：启动服务



##### 2.3.4 command 执行任务注意事项

1.  **crontab所执行的命令有输出内容的话，是一件非常危险的事情。因为该输出内容会以邮件的形式发送给用户（发送失败需要配置邮件服务器 ：postfix），内容存储在邮件文件**：

    ```shell
    /var/spool/mail/$user
    ```

    **邮件文件一般存放在根分区，根分区一般相对较小，如果这个文件一直写入所占控件过大会造成根分区写满而无法登录服务器**。

2.  执行命令输出重定向：

    ==在shell中，每个进程都和三个系统文件相关联：标准输入stdin，标准输出 stdout 和标准错误 stderr，三个系统文件的文件描述符分别为0，1 和 2==。所以2>&1的意思就是将标准错误也输出到标准输出当中。

    -   不输出内容

        ```shell
        */5 * * * * /root/XXXX.sh &>/dev/null
        ```

        `&>/dev/null`  等价于 `1>/dev/null 2>&1` ，表示标准输出写入空同时标准错误写入标准输出，即标准输出、标准错误都不写入

    -    正确和错误日志都输出到 /tmp/log

        ```shell
        */1 * * * * /root/XXXX.sh > /tmp/log 2>&1 
        ```

    -   只输出正确日志到 /tmp/log

        ```shell
        */1 * * * * /root/XXXX.sh > /tmp/log # 等同于   */1 * * * * /root/XXXX.sh 1>/tmp/log 
        ```

    -   只输出错误日志到 /tmp/load.log

        ```shell
        */1 * * * * /root/XXXX.sh 2> /tmp/log
        ```

    因此，脚本执行需要怎样的输出日志可根据自己的需求定制。

