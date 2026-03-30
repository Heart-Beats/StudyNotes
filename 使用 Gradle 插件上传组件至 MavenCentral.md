## 使用 Gradle 插件发布组件至 MavenCentral



[TOC]



### 1. MavenCentral 账号配置

首先需要注册一个sonatype的账号，用于后续我们发布，官方地址：[central.sonatype.com/](https://link.juejin.cn/?target=https%3A%2F%2Fcentral.sonatype.com%2F)

<img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/68df6909840e42d798b5842ac828c7bc~tplv-k3u1fbpfcp-jj-mark:3024:0:0:0:q75.awebp#?w=1918&h=1039&s=451572&e=png&b=161c38" alt="index" style="zoom: 50%;" />

点击 signin 后，有账号可以直接登陆，没有则点击 signUp 按条件注册一个。

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20241118153706303.png" alt="image-20241118153706303" style="zoom:50%;" />

==如若有社交账号，更推荐使用社交账号注册，这样会更方便快捷。==





#### 1.1 命名空间创建

在注册账号之后，登录进去，首先需要创建一个 NameSpace 名称空间。在发布组件的时候，必须选择一个名称空间，在 Maven 生态中，也可以将 NameSpace 看作为 groupId。它是描述发布到 Maven Central 的任何组件所需的三个坐标之一，即 groupId、artifactId、version。

![image-20241118160943272](https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20241118160943272.png)



如若使用 GitHub 注册的话，点击进去已经就会自动创建好命名空间了，如下图所示：

![image-20241118161417567](https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20241118161417567.png)

当然，如果这里没有命名空间自动创建的话，也可以点击右上角的 **Add NameSpace** 新增命名空间，命名空间支持域名以及具有代码托管服务的网址两种方式。



##### 1.1.1 域名

如果你拥有自己的域名，那么groupId的命名方式即为域名的反转。

例如，如果您控制 `ahzoo.cn`，则可以使用以 `cn.ahzoo`开头的任何 groupId ，例如 `cn.ahzoo.domain`、`cn.ahzoo.testsupport`等。

其他示例包括：

- `test.ahzoo.cn` -> `cn.ahzoo`
- `ahzoo.cn` -> `cn.ahzoo`

> groupId应该完全反转域名，即使域名包含连字符或其他会导致无效Java包名称的字符。同时连字符在groupId中是完全支持的，所以无需额外更改Java包名来匹配它。



##### 1.1.2 代码托管服务

如果你使用的是代码托管服务，groupId的示例如下：

| 服务   | 示例命名空间       |
| ------ | ------------------ |
| GitHub | io.github.username |
| Gitee  | io.gitee.username  |



#### 1.2 验证命名空间

命名空间创建完成后会生成一个密钥，复制这个密钥。

然后根据命名空间的创建方式，我们选择不同的验证方式：域名或者代码托管服务。



##### 1.2.1 域名

如果你是通过域名创建的命名空间，需要使用此方式验证。

新建一个**DNS TXT**记录，记录值为刚才复制的密钥。



##### 1.2.2  代码托管服务

如果你是通过代码托管服务创建的命名空间，需要使用此方式验证。

在代码仓库中，新建一个公共存储仓库：例如 `github.com/ahzoo/verification-key`。



#### 1.3 验证

上面的工作准备好后，点击验证即可，验证通过如下：

![图片](https://s.ahzoo.cn/img/java/24/260003.webp)



------



### 2. 签名

将组件发布到中心仓之前，必须要对文件使用 PGP 签名。可以使用 GnuPG 或 GPG 进行签名操作。发布时必须携带 `.md5`和 `.sha1`加密后的文件。



#### 2.1 安装 GnuPG

在 [GnuPG官网](https://www.gnupg.org/download/) 选用适合你的操作系统的文件格式即可下载并安装。

执行命令验证是否成功安装：

```shell
$ gpg --version
```



#### 2.2  生成 OpenPGP 密钥对

```shell
$ gpg --full-generate-key
```

根据提示完成以下步骤：

1. **选择密钥类型**
   GPG 会提示选择密钥类型：

   ```shell
   $ gpg --full-generate-key
   gpg (GnuPG) 2.4.7; Copyright (C) 2024 g10 Code GmbH
   This is free software: you are free to change and redistribute it.
   There is NO WARRANTY, to the extent permitted by law.
   
   Please select what kind of key you want:
      (1) RSA and RSA
      (2) DSA and Elgamal
      (3) DSA (sign only)
      (4) RSA (sign only)
      (9) ECC (sign and encrypt) *default*
     (10) ECC (sign only)
     (14) Existing key from card
   Your selection?
   ```

   通常选择 **1 (RSA and RSA)**，即同时支持加密和签名。

2. **设置密钥长度**
   推荐选择 **4096 位** 密钥长度（更加安全）：

   ```shell
   RSA keys may be between 1024 and 4096 bits long.
   What keysize do you want? (3072)
   ```

   输入 `4096` 并按回车。

3. **设置密钥有效期**
   设置密钥的有效期（可以根据需求选择）：

   ```shell
   Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
   ```

   - 输入 `0` 表示密钥永不过期。
   - 或者输入例如 `1y`（1年有效）然后回车。

4. **确认设置**
   GPG 会提示确认密钥设置：

   ```shell
   Is this correct? (y/N)
   ```

   输入 `y` 并按回车。

5. **填写用户信息**
   输入你的用户标识，包括名字、邮箱和备注信息：

   ```shell
   Real name: Your Name
   Email address: your.email@example.com
   Comment: Optional comment
   ```

   填写完毕后，按回车确认。

6. **设置密码**
   用户信息填写确认回车后，即提示设置密钥的密码，用于保护私钥的访问。选择一个安全的密码，并妥善保存。



#### 2.3 列出密钥

```shell
$ gpg --list-keys

[keyboxd]
---------
pub   ed25519 2024-11-18 [SC]
      D2A305B337C1D3206CADA87E5A34250FEF68B93D
uid           [ultimate] ZhangLei <913305160@qq.com>
sub   cv25519 2024-11-18 [E]

pub   rsa4096 2025-01-23 [SC]
      DBA10F0026F6C0F9399BF706052ECFA3B0DEE40F
uid           [ultimate] ZhangLei (MavenCentral Publish Use) <913305160@qq.com>
sub   rsa4096 2025-01-23 [E]
```



输出显示公钥环文件的路径。以 pub开头的行显示公钥的大小、密钥 ID和创建日期。某些值可能会因你的 GnuPG 版本而异，但你肯定会看到密钥 ID 或其一部分（称为短 ID，即密钥 ID 的最后 8 个字符，这时可以使用这条命令输出gpg：`gpg --list-keys --keyid-format short`）。

下一行显示密钥的 UID，它由名称、注释和电子邮件组成。

```shell
$ gpg --list-keys

[keyboxd]
---------
pub   ed25519/EF68B93D 2024-11-18 [SC]
      D2A305B337C1D3206CADA87E5A34250FEF68B93D
uid         [ultimate] ZhangLei <913305160@qq.com>
sub   cv25519/02E58925 2024-11-18 [E]

pub   rsa4096/B0DEE40F 2025-01-23 [SC]
      DBA10F0026F6C0F9399BF706052ECFA3B0DEE40F
uid         [ultimate] ZhangLei (MavenCentral Publish Use) <913305160@qq.com>
sub   rsa4096/323EE1BB 2025-01-23 [E]
```



#### 2.4 更新密钥有效期

密钥生成的默认有效期限为三年，但是某些情况下该期限可能不满足需求，因此需要修改它，这时可使用如下命令：

```shell
$ gpg --edit-key  [密钥 ID]

Secret key is available.

sec  ed25519/0EE41461FB92CD0B
     created: 2024-11-18  expires: [expires: 2025-08-09]       usage: SC
     trust: ultimate      validity: ultimate
ssb  cv25519/5EA43C6920EF17CB
     created: 2024-11-18  expires: [expires: 2025-08-09]       usage: E
[ultimate] (1). HanXiaotong <hanxiaotongtong@163.com>

gpg>$
```

进入编辑模式后，你可以使用 `expire` 命令来修改有效期。例如，要将有效期延长到 5 年，你可以这样操作

```shell
gpg>$ expire
Changing expiration time for the primary key.
Please specify how long the key should be valid.
0 = key does not expire
<n>  = key expires in n days
<n>w = key expires in n weeks
<n>m = key expires in n months
<n>y = key expires in n years
Key is valid for? (0) 5y
Key expires at Fri 09 Aug 2030 00:00:00 UTC
Is this correct? (y/N) y

sec  ed25519/0EE41461FB92CD0B
     created: 2024-11-18  expires: [expires: 2030-08-09]       usage: SC
     trust: ultimate      validity: ultimate
ssb  cv25519/5EA43C6920EF17CB
     created: 2024-11-18  expires: [expires: 2030-08-09]       usage: E
[ultimate] (1). HanXiaotong <hanxiaotongtong@163.com>
```

按照提示操作，选择合适的有效期时长（如上面例子中的`5y`表示 5 年），然后确认更改（`y`）。最后，使用`save`命令保存更改：

```shell
gpg>$ save
```



#### 2.5 导出密钥

- **导出公钥**

  将公钥导出到文件中，便于分发：

  ```shell
  gpg --export --armor [密钥ID] > public-key.asc
  ```

  这会生成一个名为 `public-key.asc` 的文件，其中包含你的公钥。

- **导出私钥**

  如果需要备份或用于其他工具（如 Gradle 签名），可以导出私钥：

  ```shell
  gpg --export-secret-keys --armor [密钥ID] > private-key.asc
  ```



#### 2.6 将密钥用于 Gradle 签名

1. **将私钥导出为 `secring.gpg` 文件**（Gradle 的 `signing.secretKeyRingFile` 需要这个文件）：

   ```shell
   gpg --keyring secring.gpg --export-secret-keys [密钥ID] > ~/.gnupg/secring.gpg
   ```

2. **将文件路径配置到 `gradle.properties` 中**：

   ```properties
   signing.keyId=密钥ID
   signing.password=密钥密码
   signing.secretKeyRingFile=/path/to/secring.gpg
   ```



#### 2.7 测试密钥

可以通过以下命令使用密钥对内容进行签名来验证生成的密钥是否有效：

- **签名文件**

  ```shell
  gpg --default-key [密钥ID] --sign <文件名>
  ```

- **验证签名**

  ```shell
  gpg --verify [密钥ID] signed-file.txt
  ```



#### 2.8 分发公钥

由于其他人需要公钥来验证你的文件，因此你必须将你的公钥分发给密钥服务器：

```shell
$ gpg --keyserver keyserver.ubuntu.com --send-keys [密钥 ID]
```

由于 SKS 密钥服务器网络已被弃用，建议使用特定的 GPG 密钥服务器。当前支持的 GPG 密钥服务器包括：

- `keyserver.ubuntu.com`
- `keys.openpgp.org`
- `pgp.mit.edu`



#### 2.9 导入公钥(校验公钥分发)

将公钥从密钥服务器导入到本地机器中：

```shell
$ gpg --keyserver keyserver.ubuntu.com --recv-keys [密钥 ID]
```



------



### 3. 发布组件至 MavenCentral

> 自 2024 年 3 月 12 日起，所有注册都将通过 Central Portal 进行， 因此目前将组件发布到  MavenCentral 上可以有两种方式：
>
> 1. 通过 Central Portal 发布
> 2. 通过 OSSRH 发布（旧版）
>
> 两者间的不同可以通过学习官方文档 [中央门户和传统 OSSRH 有何不同？](https://central.sonatype.org/faq/what-is-different-between-central-portal-and-legacy-ossrh/)



#### 3.1 通过 Central Portal 发布

官方文档可见 [注册通过中央门户发布](https://central.sonatype.org/register/central-portal/)



##### 3.1.1 编写脚本

这个新版编写脚本需要通过 RestApi 相关接口实现组件的上传，相关官方文档可见：[使用 Portal Publisher API 进行发布](https://central.sonatype.org/publish/publish-portal-api/)



##### 3.1.2 使用插件

目前暂无官方插件可以使用，但是可以使用官方文档中推荐的开源[社区插件](https://central.sonatype.org/publish/publish-portal-gradle/#community-plugins)，这里优先推荐以下两款插件：

1. [Medivh-Publish](https://github.com/medivh-project/medivh-publisher)

   该插件基本可实现与 maven-publish 无缝迁移，相关配置与其一致，使用文档可见：[详细文档](https://github.com/medivh-project/medivh-publisher/blob/main/doc/zh/document.adoc)

2. [gradle-maven-publish-plugin](https://github.com/vanniktech/gradle-maven-publish-plugin)

   该插件非常强大，可兼容发布不同的组件：

   - `com.android.library`
   - `org.jetbrains.kotlin.jvm`
   - `org.jetbrains.kotlin.multiplatform`
   - `java`
   - `java-library`
   - `java-gradle-plugin`
   - `com.gradle.plugin-publish`
   - `java-platform`
   - `version-catalog`

   同时也支持发布开源组件至 Maven Central 中央门户与旧版 OSSRH，也支持发布到其他的 Maven 仓库地址。

   

   相关使用文档见 [**Gradle Maven 发布插件**](https://vanniktech.github.io/gradle-maven-publish-plugin/central/)





#### 3.2 通过 OSSRH 发布（旧版）

官方文档可见 [注册通过 OSSRH 发布](https://central.sonatype.org/register/legacy/)

需要注意的是，<font color='red'>通过 OSSRH 发布的帐户，必须使用用户名和密码方法注册</font>。



##### 3.2.1 编写脚本

主要依赖于两个插件：

- signing

- maven-publish

  

编写发布脚本，在工程下新建 `android_publish_mavencentral.gradle`:

```groovy
if (versions == null || versions.publish_version == null) {
  throw new IllegalStateException("Unable to reference publish_version!")
} else if (module_group == null || module_name == null) {
  throw new IllegalStateException("Must provide module_group and module_name!")
}

apply plugin: 'maven-publish'
apply plugin: 'signing'

task androidSourcesJar(type: Jar) {
  archiveClassifier.set('sources')
  if (project.plugins.findPlugin("com.android.library")) {
    // For Android libraries
    from android.sourceSets.main.java.srcDirs
    from android.sourceSets.main.kotlin.srcDirs
  } else {
    // For pure Kotlin libraries, in case you have them
    from sourceSets.main.java.srcDirs
    from sourceSets.main.kotlin.srcDirs
  }
}

artifacts {
  archives androidSourcesJar
}

group = module_group
version = versions.publish_version

// 相关私密信息不可直接定义在项目中，最好定义在用户的 Gradle 主目录的 gradle.properties 文件或者环境变量中
ext["signing.keyId"] = hasProperty('signing.keyId') ? property('signing.keyId') : System.getenv('SIGNING_KEY_ID')
ext["signing.password"] = hasProperty('signing.password') ? property('signing.password') : System.getenv('SIGNING_PASSWORD')
ext["signing.secretKeyRingFile"] = hasProperty('signing.secretKeyRingFile') ? property('signing.secretKeyRingFile') : System.getenv('SIGNING_SECRET_KEY_RING_FILE')
ext["ossrhUsername"] = hasProperty('ossrhUsername') ? property('ossrhUsername') : System.getenv('OSSRH_USERNAME')
ext["ossrhPassword"] = hasProperty('ossrhPassword') ? property('ossrhPassword') : System.getenv('OSSRH_PASSWORD')
ext["sonatypeStagingProfileId"] = hasProperty('sonatypeStagingProfileId') ? property('sonatypeStagingProfileId') : System.getenv('SONATYPE_STAGING_PROFILE_ID')

File secretPropsFile = project.rootProject.file('local.properties')
if (secretPropsFile.exists()) {
  Properties p = new Properties()
  new FileInputStream(secretPropsFile).withCloseable { is -> p.load(is) }
  p.each { name, value -> ext[name] = value }
}

publishing {
  publications {
    release(MavenPublication) {
      // The coordinates of the library, being set from variables that
      // we'll set up later
      groupId module_group
      artifactId module_name
      version versions.publish_version

      // Two artifacts, the `aar` (or `jar`) and the sources
      if (project.plugins.findPlugin("com.android.library")) {
        artifact("$buildDir/outputs/aar/${project.getName()}-release.aar")
      } else {
        artifact("$buildDir/libs/${project.getName()}-${version}.jar")
      }
      artifact androidSourcesJar

      // Mostly self-explanatory metadata
      pom {
        packaging 'aar'
        name = module_name
        description = '😍 A beautiful, fluid, and extensible dialogs API for Kotlin & Android.'
        url = 'https://github.com/Heart-Beats/material-dialogs'
        licenses {
          license {
            name = 'Apache 2.0 License'
            url = 'https://github.com/Heart-Beats/material-dialogs/blob/main/LICENSE.md'
          }
        }
        developers {
          developer {
            id = 'afollestad'
            name = 'Aidan Follestad'
            email = 'dont-email-me@af.codes'
          }
          // Add all other devs here...
        }
        // Version control info - if you're using GitHub, follow the format as seen here
        scm {
          connection = 'scm:git:github.com/afollestad/material-dialogs.git'
          developerConnection = 'scm:git:ssh://github.com/afollestad/material-dialogs.git'
          url = 'https://github.com/Heart-Beats/material-dialogs/tree/main'
        }
        // A slightly hacky fix so that your POM will include any transitive dependencies
        // that your library builds upon
        withXml {
          def dependenciesNode = asNode().appendNode('dependencies')
          project.configurations.implementation.allDependencies.each {
            def dependencyNode = dependenciesNode.appendNode('dependency')
            dependencyNode.appendNode('groupId', it.group)
            dependencyNode.appendNode('artifactId', it.name)
            dependencyNode.appendNode('version', it.version)
          }
        }
      }
    }
  }
  // The repository to publish to, Sonatype/MavenCentral
  repositories {
    maven {
      // This is an arbitrary name, you may also use "mavencentral" or
      // any other name that's descriptive for you
      name = "sonatype"
      url = "https://s01.oss.sonatype.org/service/local/staging/deploy/maven2/"
      credentials {
        username ossrhUsername
        password ossrhPassword
      }
    }
  }
}

signing {
  useGpgCmd() //使用 gpg-agent
  sign publishing.publications
}

afterEvaluate {
  publishReleasePublicationToSonatypeRepository.dependsOn assembleRelease
}
```



上述脚本中除了相关的环境变量，其他的项目设置可根据项目详情进行调整，这里介绍一下相关环境变量值的设置。



签名和上传的凭证可以存储在`gradle.properties` 用户主目录中的文件中。内容如下：

```groovy
signing.keyId=YourKeyId
signing.password=YourPublicKeyPassword
signing.secretKeyRingFile=PathToYourKeyRingFile

ossrhUsername=token-username
ossrhPassword=token-password
```

- 签名相关

  [Gradle 的Signing Plugin](https://docs.gradle.org/current/userguide/signing_plugin.html#sec:signatory_credentials)官方文档（摘录如下）提供了前 3 个字段值的指导：

  - `signing.keyId`： 公钥ID（keyId的最后8位字符，可以用来`gpg -K --keyid-format short`获取）

  - `signing.password`：用于保护您的私钥的密码

  - `signing.secretKeyRingFile`：包含您的私钥的密钥环文件的绝对路径。（自 gpg 2.1 起，需要使用命令导出密钥 `gpg --keyring secring.gpg --export-secret-keys > ~/.gnupg/secring.gpg`）

  

- 上传用户名和密钥的生成

  ![image-20241119115448709](https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20241119115448709.png)

  ![image-20241119121936850](https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20241119121936850.png)

  最后将生成的值替换文件定义中的 ossrhUsername 与 ossrhPassword 即可。

  

以上脚本编写完成后，Gradle sync 结束后点击以下命令即可完成组件上传至 MavenCentral:

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20241119133521992.png" alt="image-20241119133521992" style="zoom: 80%;" />





##### 3.2.2 使用插件

除了自己编写脚本以外，也可通过引入 Gradle 插件来帮助我们完成这一工作，这里推荐使用：[gradle-maven-publish-plugin](https://github.com/vanniktech/gradle-maven-publish-plugin)


相关使用文档见 [**Gradle Maven 发布插件**](https://vanniktech.github.io/gradle-maven-publish-plugin/central/)
