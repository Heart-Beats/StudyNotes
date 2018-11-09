# git相关



[TOC]



### 1. log修改

1. 使用别名更改log显示方式: 

```
git config --global alias.lg "log --graph --pretty=format:'%Cred%h%Creset-%C(yellow)%dCreset %s %Cgreen(%cr)%C(bold blue)<%an>%Creset' --abbrev-commit --date=relative"
```

2. 运行该命令后使用: `git lg` 即可查看log日志

------



### 2. 版本回退

1. `git log`命令显示从最近到最远的提交日志，一大串类似1094adb...的是**commit id（版本号）**，Git的commit id是一个SHA1计算出来的一个非常大的数字，用十六进制表示。

2. 在Git中，用`HEAD`表示当前版本，也就是最新的提交，上一个版本就是`HEAD^`，上上一个版本就是`HEAD^^`，当然往上100个版本写100个^比较容易数不过来，所以写成`HEAD~100`。

3. 把当前版本回退到上一个版本，就可以使用git reset命令：

   ```
   git reset --hard HEAD^
   ```

4. 若回退版本后又想回到先前的版本，只要没回退之前显示git日志的命令行窗口还没有被关掉，找到对应版本的版本号，就可以使用`git reset`命令：

   ```
   git reset --hard 版本号（版本号没必要写全，前几位就可以）
   ```

5. 若回退版本后关闭了没回退之前显示git日志的命令行窗口，找不到回退之前的版本号，可以使用`git reflog`用来查看你的每一次命令，从而找到对应的版本号。

6. Git的版本回退速度非常快，因为Git在内部有个指向当前版本的`HEAD`指针，当你回退版本的时候，Git仅仅是把`HEAD`从一个版本指向另一个版本，然后顺便把工作区的文件更新了。

#### 总结：

   ​	① HEAD指向的版本就是当前版本，因此，Git允许我们在版本的历史之间穿梭，使用命令`git reset --hard commit_id`。
   ​	② 穿梭前，用`git log`可以查看提交历史，以便确定要回退到哪个版本。
   ​	③ 要重返未来，用`git reflog`查看命令历史，以便确定要回到未来的哪个版本。

------



### 3. 工作区和暂存区

- #### 工作区（Working Directory）

   就是你在电脑里能看到的目录。

- #### 版本库（Repository）

   工作区有一个隐藏目录`.git`，这个不算工作区，而是Git的版本库。

   Git的版本库里存了很多东西，其中最重要的就是称为**stage**（或者叫index）的暂存区，还有Git为我们自动创建的第一个分支`master`，以及指向`master`的一个指针叫`HEAD`。

   ![git-repo.png](https://i.loli.net/2018/11/07/5be2fc1117554.png)

   我们把文件往Git版本库里添加的时候，是分两步执行的：

   ​	第一步是用`git add`把文件添加进去，实际上就是把文件修改添加到暂存区；

   ​	第二步是用`git commit`提交更改，实际上就是把暂存区的所有内容提交到当前分支。

   因为我们创建Git版本库时，Git自动为我们创建了唯一的一个`master`分支，所以，现在，`git commit`就是往`master`分支上提交更改。

   **所以，`git add`命令实际上就是把要提交的所有修改放到暂存区（Stage），然后，执行`git commit`就可以一次性把暂存区的所有修改提交到分支。一旦提交后，如果你没有对工作区做任何修改，那么工作区就是“干净”的。因此，每次修改文件如果不把它`git add`到暂存区，那么它也就不会`commit`到版本库中。**

------




### 4. 撤销修改（不适用于创建新文件的修改）

- <u>**已修改，未暂存**</u>

  - **`git checkout -- file`**：可以丢弃工作区的修改

    命令`git checkout -- readme.txt`意思就是，把`readme.txt`文件在工作区的修改全部撤销，这里有两种情况：

     1. 一种是`readme.txt`自修改后还没有被放到暂存区，现在，撤销修改就回到和版本库一模一样的状态；
     2. 一种是`readme.txt`已经添加到暂存区后，又作了修改，现在，撤销修改就回到添加到暂存区后的状态。

    **`git checkout` 其实是用版本库里的版本替换工作区的版本，无论工作区是修改还是删除，都可以“一键还原”。**

     **注意：**`git checkout -- file`命令中的`-- `很重要，**没有`--`，就变成了“切换到另一个分支”的命令**。

  - **`git reset --hard`**：使用该命令可以一步到位地把你的修改完全恢复到未修改的状态

- <u>**已暂存，未提交**</u>

    - **`git reset HEAD <file>`**：可以把暂存区的修改撤销掉（unstage），重新放回工作区

       假若你对工作区的文件做了修改还`git add`到暂存区，这时就可以使用命令`git reset HEAD <file>`把暂存区的文件回退到工作区，但此时工作区的修改仍然存在，需要使用`git checkout -- file`丢弃工作区的修改。

         **注意：**`git reset`命令既可以回退版本，也可以把暂存区的修改回退到工作区。当我们用`HEAD`时，表示最新的版本。

    - **`git reset --hard`**：使用该命令可以一步到位地把你的修改完全恢复到未修改的状态


- <u>**已提交，未推送**</u>

    - **`git reset --hard origin/master`**：将本地仓库与远程仓库保存一致

       如果不但修改了文件，还从暂存区提交到了版本库，可以使用该命令撤销所有的修改。

      - 这种情况也可以回退到上一个版本。不过，这是有条件的，就是你还没有把自己的本地版本库推送到远程仓库。

- <u>**已推送**</u>

   - 如果既`git add`了，又`git commit`了，并且还`git push`了，这时代码已经进入远程仓库

     此时想恢复的话，由于你的本地仓库和远程仓库是等价的，你只需要先恢复本地仓库，再强制push到远程仓库就好了，可以依次执行下列命令：

     ```
     git reset --hard HEAD^`
     git push -f
     ```



#### 小结：

​	场景1：**已修改，未暂存**，想直接丢弃工作区的修改时，用命令`git checkout -- file`。

​	场景2：**已暂存，未提交**，想丢弃修改，分两步，第一步用命令`git reset HEAD <file>`，就回到了场景1，第二步按场景1操作。

​	**注意：场景1和场景2都可以使用命令`git reset --hard`来撤销修改。**

​	场景3：**已提交，未推送**，想要撤销本次提交，使用命令**`git reset --hard origin/master`**可以撤销本次提交和修改，当然，也可以回退到上个版本

​	场景4：**已推送**，想撤销修改，此时只能回退本地仓库版本，再强制push到远程仓库。可依次执行命令：**`git reset --hard HEAD^`**   **`git push -f`** 来撤销修改。



**总结：因此，综合来看只要掌握了`git reset --hard`的用法，就不用担心提交错误。**

​	**注意：git reset --hard 不会保存工作区的改动，回退到版本的初始状态；**

​		    **git reset  会保存工作区的改动，回退到版本的初始状态。**

------



### 5. 删除文件

- **`git rm`**：从版本库删除文件

  如果直接在文件管理器中把没用的文件删了，工作区和版本库就不一致，此时可以有两个选择：

  - 1. 确实要从版本库中删除该文件，那就用命令`git rm`删掉，并且`git commit`。
  - 2. 误删，可以使用`git checkout -- file`命令从版本库中恢复文件。


#### 小结：

​	命令`git rm`用于删除一个文件。如果一个文件已经被提交到版本库，那么你永远不用担心误删，但是要小心，你只能恢复文件到最新版本，你会丢失**最近一次提交后你修改的内容**。	

------



### 6. 远程仓库

> Git是分布式版本控制系统，同一个Git仓库，可以分布到不同的机器上。我们可以在GitHub上创建免费托管的Git仓库： 
>
> **准备工作：**
>
>  1. 使用 **`ssh-keygen -t rsa -C "youremail@example.com"`** 创建SSH Key，需要把邮件地址换成你自己的邮件地址，然后一路回车，使用默认值即可。
>
>     **如果一切顺利的话，可以在用户主目录里找到`.ssh`目录，里面有`id_rsa`和`id_rsa.pub`两个文件，这两个就是SSH Key的秘钥对，`id_rsa`是私钥，不能泄露出去，`id_rsa.pub`是公钥，可以放心地告诉任何人。**
>
>  2. 登陆GitHub，打开“Account settings”，“SSH Keys”页面：然后，点“Add SSH Key”，填上任意Title，在Key文本框里粘贴`id_rsa.pub`文件的内容即可。
>
>  3. 使用 **ssh -T git@github.com** 命令可以测试是否添加成功。
>
> **GitHub只要添加了公钥，那么就只允许拥有和公钥对应的私钥的电脑才能往GitHub上推送。**



#### 6.1. 添加远程库

如果在本地创建了一个Git仓库后，又想在GitHub创建一个Git仓库，并且让这两个仓库进行远程同步，这样，GitHub上的仓库既可以作为备份，又可以让其他人通过该仓库来协作。

- 1. 在GitHub上创建远程仓库：点击“Create a new repo”按钮；

- 2. 将本地仓库与远程仓库关联：

     ```
     git remote add origin git@github.com:stormzhang/test.git
     ```

     可将本地仓库与stormzhang账号下的test仓库关联，添加后，远程库的名字就是`origin`，这是Git默认的叫法，也可以改成别的，但是`origin`这个名字一看就知道是远程库。

- 3. 本地库内容推送到远程上： 

     ```
     git push -u origin master
     ```

     由于远程库是空的，我们第一次推送`master`分支时，加上了`-u`参数，Git不但会把本地的`master`分支内容推送的远程新的`master`分支，还会把本地的`master`分支和远程的`master`分支关联起来，在以后的推送或者拉取时就可以简化命令。

- 4. 本地提交后推送远程库： 

     ```
     git push origin master
     ```

     即可把本地`master`分支的最新修改推送至GitHub。

##### 小结：

  - 要关联一个远程库，使用命令**`git remote add origin git@server-name:path/repo-name.git`**；

  - 关联后，使用命令**`git push -u origin master`**第一次推送master分支的所有内容；

  - 此后，每次本地提交后，只要有必要，就可以使用命令**`git push origin master`**推送最新修改；

  分布式版本系统的最大好处之一是在本地工作完全不需要考虑远程库的存在，也就是有没有联网都可以正常工作，当有网络的时候，再把本地提交推送一下就完成了同步。



#### 6.2.  从远程库克隆

假设我们从零开发，那么最好的方式是先创建远程库，然后，从远程库克隆。

- 1. 在GitHub创建一个仓库，名为StudyGit；

  2. 本地新建StudyGit文件夹，在此目录下克隆远程库：

     ```
     git clone git@github.com:Heart-Beats/StudyGit.git
     ```

     若有`README.md`文件则表示克隆成功；

##### 小结：

  - 要克隆一个仓库，首先必须知道仓库的地址，然后使用**`git clone`**命令克隆。
  - Git支持多种协议，包括`https`，但通过`ssh`支持的原生`git`协议速度最快。

------



### 7.  分支管理

> 每次提交，Git都把它们串成一条时间线，这条时间线就是一个分支，在Git里，这个分支叫主分支，即`master`分支，**`master`指针始终指向主分支最新的提交，而`HEAD`指针始终指向当前的分支最新的提交**。
>
> ![git-br-initial.png](https://i.loli.net/2018/11/07/5be2fc36645d9.png)
>
> 每次提交，`master`分支都会向前移动一步，这样，随着你不断提交，`master`分支的线也越来越长。

​	

#### 7.1  创建与合并分支

当我们创建新的分支，例如`dev`时，Git新建了一个指针叫`dev`，指向`master`相同的提交，再把`HEAD`指向`dev`，就表示当前分支在`dev`上：

![git-br-create.png](https://i.loli.net/2018/11/07/5be2fc576eff5.png)

Git创建一个分支很快，因为除了增加一个`dev`指针，改改`HEAD`的指向，工作区的文件都没有任何变化！

不过，从现在开始，对工作区的修改和提交就是针对`dev`分支了，比如新提交一次后，`dev`指针往前移动一步，而`master`指针不变：

![git-br-dev-fd.png](https://i.loli.net/2018/11/07/5be2fc69ab62b.png)

假如我们在`dev`上的工作完成了，就可以把`dev`合并到`master`上。Git怎么合并呢？最简单的方法，就是直接把`master`指向`dev`的当前提交，就完成了合并：

![git-br-ff-merge.png](https://i.loli.net/2018/11/07/5be2fc7ab37a2.png)

所以Git合并分支也很快！就改改指针，工作区内容也不变！

合并完分支后，甚至可以删除`dev`分支。删除`dev`分支就是把`dev`指针给删掉，删掉后，我们就剩下了一条`master`分支：

![git-br-rm.png](https://i.loli.net/2018/11/07/5be2fc8f8e951.png)

##### 小结 ：Git中关于branch常用命令

- ​	查看分支：**`git branch`**
- ​	创建分支：**`git branch <branch-name>`**
- ​	切换分支：**`git checkout <branch-name>`**
- ​	创建+切换分支：**`git checkout -b <branch-name>`**
- ​	合并某分支到当前分支：**`git merge <branch-name>`**
- ​	删除分支：**`git branch -d <branch-name>`**



#### 7.2  解决冲突

当我们在不同的分支上对同一个文件的同一个位置作出不同的修改，在合并分支的时候，此文件就会产生合并冲突，此时我们就需要手动地将冲突的文件改成想要的样子，再进行提交即可完成合并。此时，若我们查看log，则可以看到3条提交记录，分别为：当前分支的`commit`、被合并分支的`commit`以及合并完成后的`commit`。

##### 小结：

- **当无法完成自动合并分支时，就必须首先解决冲突。解决冲突后，再提交，合并完成。**解决冲突就是把Git的合并失败的文件手动编辑为我们希望的内容，再提交。

**注意：**

1.  放弃合并： **`git merge --abort`** 
2.  查看两条分支上的不同：**`git diff <branch-name>`**
3.  查看分支合并图：**`git log --graph`**



#### 7.3  分支管理策略

通常，合并分支时若无冲突，Git默认使用`Fast forward`模式，但这种模式下，合并分支后，会丢掉分支信息。

如果要强制禁用`Fast forward`模式，Git就会在merge时生成一个新的commit，这样，从分支历史上就可以看出分支信息。

- ##### 使用`Fast forward`模式，merge后就像这样：

![git-br-ff-merge.png](https://i.loli.net/2018/11/07/5be2fca1c122a.png)

​	此时使用**`git log --graph`** 查看分支合并图如下：

​				![1541485528675.png](https://i.loli.net/2018/11/07/5be26155311db.png)

- ##### 不使用`Fast forward`模式，merge后就像这样：

![git-no-ff-mode.png](https://i.loli.net/2018/11/07/5be2fcb4cc360.png)

​	此时使用**`git log --graph`** 查看分支合并图如下：

​				![1541486481156.png](https://i.loli.net/2018/11/07/5be26152eb750.png)



那么，如何才可以不使用默认的`Fast forward`模式合并呢？

```
git merge --no-ff <branch-name> -m "Hello World"
```

使用上面命令即可 ，这里的`--no-ff`参数，表示禁用`Fast forward`，同时因为本次合并要创建一个新的commit，所以需要加上`-m`参数，把commit描述写进去。



- ##### 分支策略

  在实际开发中，我们应该按照几个基本原则进行分支管理：

  首先，`master`分支应该是非常稳定的，也就是仅用来发布新版本，平时不能在上面干活；

  那在哪干活呢？干活都在`dev`分支上，也就是说，`dev`分支是不稳定的，到某个时候，比如1.0版本发布时，再把`dev`分支合并到`master`上，在`master`分支发布1.0版本；

  你和你的小伙伴们每个人都在`dev`分支上干活，每个人都有自己的分支，时不时地往`dev`分支上合并就可以了。

  所以，团队合作的分支看起来就像这样：

![0.png](https://i.loli.net/2018/11/07/5be262612f89d.png)

##### 小结：

- 合并分支时，加上`--no-ff`参数就可以用普通模式合并，合并后的历史有分支，能看出来曾经做过合并，而`fast forward`合并就看不出来曾经做过合并。
- 关于分支策略，我们应该在实际开发中按照它的基本原则使用。



#### 7.4  Bug分支

软件开发中，bug就像家常便饭一样。有了bug就需要修复，在Git中，由于分支是如此的强大，所以，每个bug都可以通过一个新的临时分支来修复，修复后，合并分支，然后将临时分支删除。

那么，可能就会面临一个问题，当前分支的工作还没完成无法提交，但此时却必须要修复bug，怎么办？

还好Git为我们提供了一个`stash`功能，可以把当前工作现场“储藏”起来，等以后恢复现场后继续工作。运行**`git stash`**后使用`git status`查看工作区，就是干净的（除非有没有被Git管理的文件），因此可以放心地创建分支来修复bug。

修复完成后再切换回工作的dev分支，工作区是干净的，先前的工作现场存到哪去了？使用**`git stash list`**命令可以看到Git把stash内容存在某个地方了，但是需要恢复一下，有两个办法：

1.  使用**`git stash apply`**恢复，但是恢复后stash内容并不删除，需要用**`git stash drop`**来删除；
2.  使用**`git stash pop`**，恢复的同时把stash内容也删除

当然也可以多次stash，恢复的时候，先用`git stash list`查看，然后恢复指定的stash即可。

##### 小结：

- 修复bug时，我们会通过创建新的bug分支进行修复，然后合并，最后删除；
- 当手头工作没有完成时，先把工作现场`git stash`一下，然后去修复bug，修复后，再`git stash pop`，回到工作现场。
- 关于stash的相关命令：
  - 保存工作现场：**`git stash`**
  - 查看stash列表：**`git stash list`**
  - 恢复stash：**`git stash apply [序号]`**（默认恢复序号为0的stash）
  - 删除stash：**`git stash drop [序号]`**（默认删除序号为0的stash）
  - 恢复并删除stash：**`git stash pop [序号]`**（默认序号为0的stash）



#### 7.5  Feature分支

添加一个新功能时，肯定不希望因为一些实验性质的代码，把主分支搞乱了，所以，每添加一个新功能，最好新建一个feature分支，在上面开发，完成后，合并，最后，删除该feature分支。

##### 小结：

- 开发一个新feature，最好新建一个分支；
- 如果要丢弃一个没有被合并过的分支，可以通过**`git branch -D <name>`**强行删除。



#### 7.6  多人协作

当你从远程仓库克隆时，实际上Git自动把本地的`master`分支和远程的`master`分支对应起来了，并且，远程仓库的默认名称是`origin`。要查看远程库的信息，用**`git remote`**，或者用**`git remote -v`**显示更详细的信息：

![1541494485779.png](https://i.loli.net/2018/11/07/5be261541ce16.png)

上面显示了可以抓取和推送的`origin`的地址，如果没有推送权限，就看不到push的地址。



- **推送分支**

  推送分支，就是把该分支上的所有本地提交推送到远程库。推送时，要指定本地分支，这样，Git就会把该分支推送到远程库对应的远程分支上：

  ```
  $ git push origin master
  ```

  如果要推送其他分支，比如`dev`，就改成：

  ```
  $ git push origin dev
  ```

  但是，并不是一定要把所有的本地分支往远程推送，那么，哪些分支需要推送，哪些不需要呢？

  - `master`分支是主分支，因此要时刻与远程同步；
  - `dev`分支是开发分支，团队所有成员都需要在上面工作，所以也需要与远程同步；
  - `bug`分支只用于在本地修复bug，就没必要推到远程了，除非老板要看看你每周到底修复了几个bug；
  - `feature`分支是否推到远程，取决于你是否和你的小伙伴合作在上面开发。

- **抓取分支**

  多人协作时，大家都会往`master`和`dev`分支上推送各自的修改。

  当你的小伙伴从远程库clone时，默认情况下，你的小伙伴只能看到本地的`master`分支。不信可以用`git branch`命令看看：

  ```
  $ git branch
  * master
  ```

  现在，你的小伙伴要在`dev`分支上开发，就必须创建远程`origin`的`dev`分支到本地，于是他用这个命令创建本地`dev`分支：

  ```
  $ git checkout -b dev origin/dev
  ```

  现在，他就可以在`dev`上继续修改，然后，时不时地把`dev`分支`push`到远程：

  ```
  $ git add env.txt
  
  $ git commit -m "add env"
  [dev 7a5e5dd] add env
   1 file changed, 1 insertion(+)
   create mode 100644 env.txt
  
  $ git push origin dev
  Counting objects: 3, done.
  Delta compression using up to 4 threads.
  Compressing objects: 100% (2/2), done.
  Writing objects: 100% (3/3), 308 bytes | 308.00 KiB/s, done.
  Total 3 (delta 0), reused 0 (delta 0)
  To github.com:michaelliao/learngit.git
     f52c633..7a5e5dd  dev -> dev
  ```

  你的小伙伴已经向`origin/dev`分支推送了他的提交，而碰巧你也对同样的文件作了修改，并试图推送：

  ```
  $ cat env.txt
  env
  
  $ git add env.txt
  
  $ git commit -m "add new env"
  [dev 7bd91f1] add new env
   1 file changed, 1 insertion(+)
   create mode 100644 env.txt
  
  $ git push origin dev
  To github.com:michaelliao/learngit.git
   ! [rejected]        dev -> dev (non-fast-forward)
  error: failed to push some refs to 'git@github.com:michaelliao/learngit.git'
  hint: Updates were rejected because the tip of your current branch is behind
  hint: its remote counterpart. Integrate the remote changes (e.g.
  hint: 'git pull ...') before pushing again.
  hint: See the 'Note about fast-forwards' in 'git push --help' for details.
  ```

  推送失败，因为你的小伙伴的最新提交和你试图推送的提交有冲突，解决办法也很简单，Git已经提示我们，先用`git pull`把最新的提交从`origin/dev`抓下来，然后，在本地合并，解决冲突，再推送：

  ```
  $ git pull
  There is no tracking information for the current branch.
  Please specify which branch you want to merge with.
  See git-pull(1) for details.
  
      git pull <remote> <branch>
  
  If you wish to set tracking information for this branch you can do so with:
  
      git branch --set-upstream-to=origin/<branch> dev
  ```

  `git pull`也失败了，原因是没有指定本地`dev`分支与远程`origin/dev`分支的链接，根据提示，设置`dev`和`origin/dev`的链接：

  ```
  $ git branch --set-upstream-to=origin/dev dev
  Branch 'dev' set up to track remote branch 'dev' from 'origin'.
  ```

  再pull：

  ```
  $ git pull
  Auto-merging env.txt
  CONFLICT (add/add): Merge conflict in env.txt
  Automatic merge failed; fix conflicts and then commit the result.
  ```

  这回`git pull`成功，但是合并有冲突，需要手动解决，解决的方法和分支管理中的解决冲突完全一样。解决后，提交，再push：

  ```
  $ git commit -m "fix env conflict"
  [dev 57c53ab] fix env conflict
  
  $ git push origin dev
  Counting objects: 6, done.
  Delta compression using up to 4 threads.
  Compressing objects: 100% (4/4), done.
  Writing objects: 100% (6/6), 621 bytes | 621.00 KiB/s, done.
  Total 6 (delta 0), reused 0 (delta 0)
  To github.com:michaelliao/learngit.git
     7a5e5dd..57c53ab  dev -> dev
  ```



因此，多人协作的工作模式通常是这样：

1. 首先，可以试图用`git push origin <branch-name>`推送自己的修改；
2. 如果推送失败，则因为远程分支比你的本地更新，需要先用`git pull`试图合并；
3. 如果合并有冲突，则解决冲突，并在本地提交；
4. 没有冲突或者解决掉冲突后，再用`git push origin <branch-name>`推送就能成功！

如果`git pull`提示`no tracking information`，则说明本地分支和远程分支的链接关系没有创建，用命令**`git branch --set-upstream-to <branch-name> origin/<branch-name>`**。

这就是多人协作的工作模式，一旦熟悉了，就非常简单。

##### 小结：

- 查看远程库信息，使用**`git remote -v`**；
- 本地新建的分支如果不推送到远程，对其他人就是不可见的；
- 从本地推送分支，使用**`git push origin branch-name`**，如果推送失败，先用`git pull`抓取远程的新提交；
- 在本地创建和远程分支对应的分支，使用**`git checkout -b branch-name origin/branch-name`**，本地和远程分支的名称最好一致；
- 建立本地分支和远程分支的关联，使用**`git branch --set-upstream branch-name origin/branch-name`**；
- 从远程抓取分支，使用**`git pull`**，如果有冲突，要先处理冲突。



#### 7.7  Rebase

在上一节我们看到了，多人在同一个分支上协作时，很容易出现冲突。即使没有冲突，后push的童鞋不得不先pull，在本地合并，然后才能push成功。

每次合并再push后，分支变成了这样：

```
$ git log --graph --pretty=oneline --abbrev-commit
* d1be385 (HEAD -> master, origin/master) init hello
*   e5e69f1 Merge branch 'dev'
|\  
| *   57c53ab (origin/dev, dev) fix env conflict
| |\  
| | * 7a5e5dd add env
| * | 7bd91f1 add new env
| |/  
* |   12a631b merged bug fix 101
|\ \  
| * | 4c805e2 fix bug 101
|/ /  
* |   e1e9c68 merge with no-ff
|\ \  
| |/  
| * f52c633 add merge
|/  
*   cf810e4 conflict fixed
```

总之看上去很乱，有强迫症的童鞋会问：为什么Git的提交历史不能是一条干净的直线？

其实是可以做到的！

Git有一种称为rebase的操作，有人把它翻译成“变基”。

##### 小结：

- rebase操作可以把本地未push的分叉提交历史整理成直线；
- rebase的目的是使得我们在查看历史提交的变化时更容易，因为分叉的提交需要三方对比。

------



### 8.  标签管理

发布一个版本时，我们通常先在版本库中打一个标签（tag），这样，就唯一确定了打标签时刻的版本。**将来无论什么时候，取某个标签的版本，就是把那个打标签的时刻的历史版本取出来。**

Git的标签虽然是版本库的快照，但其实它就是指向某个commit的指针（**分支可以移动，标签不能移动**），所以，创建和删除标签都是瞬间完成的。

**tag就是一个让人容易记住的有意义的名字，它跟某个commit绑在一起。**



#### 8.1  创建标签

在Git中打标签非常简单，首先，切换到需要打标签的分支上，然后，使用**`git tag <tag-name> [commit-id]（默认为HEAD）`**就可以打一个新标签：

```
$ git tag v0.1
```

可以用命令**`git tag`**查看所有标签：

```
$ git tag
v0.1
```

有时候，如果忘了打标签，比如，现在现在我想对四周前的提交打标签，怎么办？方法是找到历史提交的commit id，然后打上就可以了：

![MINGW64cAndroidProjectCustomViewDemos.png](https://i.loli.net/2018/11/07/5be2932d5a035.png)

比方说要对`Update README.md`这次提交打标签，它对应的commit id是`250affe`，敲入命令：

```
$ git tag v1.0 250affe
```

可以用**`git show <tag-name>`**查看标签信息：

![PrtScr capture.png](https://i.loli.net/2018/11/07/5be2931b45a0b.png)

可以看到，`v1.0`确实打在`Update README.md`这次提交上。

还可以创建带有说明的标签，`-m`指定说明文字：

```
$ git tag v1.1 df9294a -m "版本1.1发布"  
```

用命令`git show <tag-name>`可以看到说明文字：

![MINGW64cAndroidProjectCustomViewDemos_2.png](https://i.loli.net/2018/11/07/5be294cb0a5d9.png)

**注意：**标签不是按时间顺序列出，而是按字母排序的，而且一个提交也可以给它贴上多个标签：

![MINGW64cAndroidProjectCustomViewDemos_3.png](https://i.loli.net/2018/11/07/5be29b0abb39b.png)

**注意：**标签总是和某个commit挂钩。如果这个commit既出现在master分支，又出现在dev分支，那么在这两个分支上都可以看到这个标签：

![MINGW64cAndroidProjectCustomViewDemos_4.png](https://i.loli.net/2018/11/07/5be29f95b225f.png)

如图所示，在master分支上给`hello`这个提交贴上`v2.0`的标签，切换到dev分支上，同样也有这个标签。



#### 8.2  操作标签

- 删除本地标签

  ```
  $ git tag -d v0.1
  ```

- 推送某个标签到远程

  ```
  $ git push origin v1.0
  ```

- 推送所有未推送的标签到远程

  ```
  $ git push origin --tags
  ```

- 删除远程标签

  - 先从本地删除：

    ```
    $ git tag -d v1.1
    ```

  - 再从远程删除。删除命令也是push，但是格式如下：

    ```
    $ git push origin :refs/tags/v1.1
    ```



#### 小结：Git中关于tag的命令

- 新建标签，默认为`HEAD`：**`git tag <tagname> [commit-id]`**
- 新建带说明的标签，默认为HEAD：**`git tag <tagname> [commit-id] -m "message"`**
- 查看所有标签：**`git tag`**
- 查看指定标签信息：**`git show <tag-name>`**

- 推送一个本地标签到远程：**`git push origin <tag-name>`**
- 推送所有未推送过的标签到远程：**`git push origin --tags`**
- 删除一个本地标签：**`git tag -d <tag-name>`**
- 删除一个远程标签（需要删除本地标签）：**`git push origin :refs/tags/<tag-name>`**

