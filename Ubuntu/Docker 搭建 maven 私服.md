# Docker 搭建 Maven 私服

[TOC]





## ✅ 一、准备工作

### 1. 确保已安装 Docker Desktop for Mac

- 打开终端，运行：

  ```bash
  docker --version
  ```

- 如果未安装，请从 [Docker 官网](https://www.docker.com/products/docker-desktop/) 下载安装。

- **建议配置国内镜像源**（否则拉取 `sonatype/nexus3` 镜像会非常慢）：使用清华或 daocloud 镜像加速。

------



## ✅ 二、创建本地数据目录（持久化）

```bash
# 创建目录
mkdir -p ～/nexus-data

# 设置权限（Nexus 容器内以 UID=200 用户运行）
sudo chown -R 200:200 ～/nexus-data
```

> 💡 说明：Nexus 容器默认使用 UID=200 的用户，必须确保该用户对挂载目录有读写权限，否则启动失败。

------



## ✅ 三、启动 Nexus 3 容器

```bash
docker run -d \
  --name nexus \
  -p 8081:8081 \
  -v ～/nexus-data:/nexus-data \
  --restart unless-stopped \
  sonatype/nexus3
```

- `-d`：后台运行
- `-p 8081:8081`：将容器的 8081 端口映射到本机
- `-v`：挂载数据目录，保证重启不丢数据
- `--restart`：容器随 Docker 启动自动恢复

> ⏱️ 首次启动需 1～3 分钟（初始化数据库等），可通过 `docker logs -f nexus` 查看进度。

------



## ✅ 四、访问 Nexus 管理界面

1. 打开浏览器，访问：
   👉 [http://localhost:8081](http://localhost:8081/)

2. 获取初始 admin 密码：

   ```bash
   docker exec -it nexus cat /nexus-data/admin.password
   ```

   复制输出的密码。

3. 登录后：

   - 修改 admin 密码
   - 跳过匿名访问设置（或按需启用）
   - 进入主界面

------



## ✅ 五、理解默认仓库（无需额外创建）

Nexus 3 默认已创建以下关键仓库：

| 类型       | 名称              | 用途                                           |
| :--------- | :---------------- | :--------------------------------------------- |
| **proxy**  | `maven-central`   | 代理 Maven Central（相当于缓存官方仓库）       |
| **hosted** | `maven-releases`  | 存放你发布的正式版 jar（如 1.0.0）             |
| **hosted** | `maven-snapshots` | 存放快照版本（如 1.0.0-SNAPSHOT）              |
| **group**  | `maven-public`    | **聚合以上所有仓库**，客户端只需配置这一个地址 |

✅ **推荐：Maven 客户端只使用 `maven-public` 这个 group 仓库！**

------



## ✅ 六、配置 Maven 客户端（`settings.xml`）

编辑 `～/.m2/settings.xml`（若无则新建）：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0
                              http://maven.apache.org/xsd/settings-1.0.0.xsd">

  <!-- 配置私服为所有仓库的镜像 -->
  <mirrors>
    <mirror>
      <id>nexus</id>
      <mirrorOf>*</mirrorOf>
      <url>http://localhost:8081/repository/maven-public/</url>
    </mirror>
  </mirrors>

  <!-- 激活 profile -->
  <profiles>
    <profile>
      <id>nexus</id>
      <repositories>
       <repository>
          <id>central</id>
          <url>http://central</url> <!-- 必须保留，配合 mirrorOf=* -->
          <releases><enabled>true</enabled></releases>
          <snapshots><enabled>true</enabled></snapshots>
        </repository>
      </repositories>
      <pluginRepositories>
        <pluginRepository>
          <id>central</id>
          <url>http://central</url>
          <releases><enabled>true</enabled></releases>
          <snapshots><enabled>true</enabled></snapshots>
        </pluginRepository>
      </pluginRepositories>
    </profile>
  </profiles>

  <activeProfiles>
    <activeProfile>nexus</activeProfile>
  </activeProfiles>

  <!-- 部署用的账号（用于 mvn deploy） -->
  <servers>
    <server>
      <id>nexus-releases</id>
      <username>admin</username>
      <password>你的新密码</password>
    </server>
    <server>
      <id>nexus-snapshots</id>
      <username>admin</username>
      <password>你的新密码</password>
    </server>
  </servers>

</settings>
```

> 🔐 安全建议：生产环境应创建专用部署账号（如 `deployer`），而非使用 `admin`。

------



## ✅ 七、测试使用

### 1. 测试依赖下载（验证代理）

```bash
mvn dependency:get -DgroupId=junit -DartifactId=junit -Dversion=4.13.2
```

- 第一次会从中央仓库拉取并缓存到 Nexus
- 第二次及以后直接从本地私服获取（速度极快）

### 2. 测试发布（验证 hosted 仓库）

在你的项目 `pom.xml` 中添加：

```xml
<distributionManagement>
  <repository>
    <id>nexus-releases</id>
    <url>http://localhost:8081/repository/maven-releases/</url>
  </repository>
  <snapshotRepository>
    <id>nexus-snapshots</id>
    <url>http://localhost:8081/repository/maven-snapshots/</url>
  </snapshotRepository>
</distributionManagement>
```

然后执行：

```bash
# 发布正式版
mvn deploy

# 或发布快照版（版本号需带 -SNAPSHOT）
mvn deploy
```

成功后可在 Nexus Web 界面的对应仓库中看到你的构件。

------



## ✅ 八、常用管理操作

| 操作                 | 命令                                         |
| :------------------- | :------------------------------------------- |
| 查看日志             | `docker logs -f nexus`                       |
| 停止服务             | `docker stop nexus`                          |
| 启动服务             | `docker start nexus`                         |
| 删除容器（保留数据） | `docker rm nexus`                            |
| 完全清理             | `docker rm -f nexus && rm -rf ～/nexus-data` |

------



## ✅ 九、进阶建议（生产环境）

1. **反向代理 + HTTPS**：用 Nginx 代理 `8081` 端口，配置域名和 SSL 证书。
2. **创建专用账号**：在 Nexus 中创建 `developer`、`deployer` 等角色，分配最小权限。
3. **定期备份**：备份 `～/nexus-data` 目录。
4. **资源限制**：通过 `-e INSTALL4J_ADD_VM_PARAMS="-Xms2g -Xmx2g"` 调整 JVM 内存。