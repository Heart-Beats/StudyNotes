[TOC]

#### 1. ﻿JavaScript的组成部分

  - ECMAScript（核心）：作为核心，它规定了语言的组成部分：语法、类型、语句、关键字、保留字、操作符、对象。

  - DOM（文档对象模型）：DOM把整个页面映射为一个多层节点结果，开发人员可借助DOM提供的API，轻松地删除、添加、替换或修改任何节点。

  - BOM （浏览器对象模型）：支持可以访问和操作浏览器窗口的浏览器对象模型，开发人员可以控制浏览器显示的页面以外的部分。

    

----------



#### 2. JS与Java的一些不同点

- **JS中存在匿名函数：**

    `liNodes[i].onclick = function () {    };`

    这里function()为JS中的匿名函数，此处onclick响应函数即为这个匿名函数。

    也可以有另一种写法：

    ```javascript
    liNodes[i].onclick = f ；
    function f() {
     }
    ```

    两者是等效的。

 - **变量的定义方式不同：**

  由于JS是弱类型语言，因此在声明变量时不需要给定类型，在ES5中若给定类型统一用var 代替。其中直接声明赋值代表全局变量，用var 来声明代表局部变量。

 - **函数的定义方式不同：**

     JS定义函数时，函数的参数不需要类型,也不需要定义函数返回值。同时JS可以在函数中定义内部函数，并且仅能在函数中调用这个内部函数。

 - **正则表达式的定义方式不同：**

    在Java中，正则表达式一般定义为String类型，而在JS中正则为一个类型。定义方式： `var regex = /正则表达式主体/修饰符(可选)`

    | 修饰符 |                          描述                          |
    | :----: | :----------------------------------------------------: |
    |   i    |                执行对大小写不敏感的匹配                |
    |   g    | 执行全局匹配（查找所有匹配而非在找到第一个匹配后停止） |
    |   m    |                      执行多行匹配                      |

    -  **使用字符串方法：**在 JS 中，正则表达式通常用于两个字符串方法 : `search()` 和 `replace()`。

        - **`search()` ：** 用于检索字符串中指定的子字符串，或检索与正则表达式相匹配的子字符串，并返回子串的起始位置。

            ```javascript
            如： var str = "Visit Runoob!"; 
            	 var n = str.search(/Runoob/i);   // n= 6
            ```

            

        - **`replace()` ：** 用于在字符串中用一些字符替换另一些字符，或替换一个与正则表达式匹配的子串。

            ```javascript
            如： var str = "Visit Runoob!";
            	 var n = str.replace(/Runoob/i，“”);   // n = "Visit "
            ```

            

    - **使用正则方法：**

        - **`test（）`：**用于检测一个字符串是否匹配某个正则表达式，如果字符串中含有匹配的文本，则返回 true，否则返回 false。

            ```javascript
            如： var patt = /e/g; 
            	 var flag = patt.test("The best things in life are free!");   // flag = true
            ```

        - **`exec()`：**用于检索字符串中的正则表达式的匹配。

            该函数若匹配到文本，则返回一个结果数组。否则，返回 null。数组中的元素分别对应着整个正则表达式、正则第一个子表达式、第二个子表达式  ...  第n个子表达式 所匹配到的结果

            ```javascript
            如： var patt=/([^e]+)(e)/g; 
            	 var array=patt1.exec("The best things in life are free");    // array = [The ,Th, e]
            ```

            

----------



#### 3. JS中的作用域

 - **在ES5中只有全局作用域和函数局部作用域，没有Java中的块级作用域{}**，但是可以实现类似块作用域的功能，如下：

    ```javascript
      (function(){
      	for(var i =0;i<10;i++){
      
      	}
      })();
      console.log(i);
    ```

      这种写法为**立即调用函数表达式（IIFE）**，这其实就创建了一个局部作用域，该作用域声明的变量只有在该块内有效，外部访问不了。这种写法的好处就是可以做到不污染全局变量。

 - 在ES5中，其中变量有两种声明方式：

    1. 显式声明： var 变量名，代表局部变量，仅在函数作用域有效。

    2. 隐式声明： 直接变量名 ，代表全局变量。

        **注：**函数的参数都为局部变量。

- **变量提升：**其实就是将变量的声明提升到函数的最上面。

   如：

   ```javascript
   function test() {
       var a, b;
       (function () {  
           alert(a);
           alert(b);
           var a = b = 3;
           alert(a);
           alert(b);
       })();
       alert(a);
       alert(b);
   }
   ```

   在JS解释时会变为：

   ```javascript
   function test() {
       var a = undefined;
       var b = undefined;
       (function () { 
          var a = undefined;
           alert(a);
           alert(b);
           a = 3；
           b = 3；
           alert(a);
           alert(b);
       })();
       alert(a);
       alert(b);
   }
   ```

    因此结果依次输出 undefined、 undefined、 3 、3 、undefined、 3。

    正是由于变量提升，当全局变量在函数体内声明赋值后，这个变量再被var 声明，它就显式地变为了局部变量，失去全局变量的特性。

    如：

   ```javascript
   function test() {
           c = 3;       //全局变量
           var c = 2;  //局部变量
           alert（c）；
   }
   ```

   会被JS解释为：

   ```javascript
       function test() {
      	    var c = undefined;
               c = 3;   //局部变量    
               c = 2;  //局部变量
               alert（c）；
       }
   ```

   因此结果输出2。

 - **ES6中的块级作用域：**通常用`let`和`const`来声明，**`let`表示变量、`const`表示常量**。let和const都是块级作用域。

    > {}大括号内的代码块即为let 和 const的作用域。

    - **let：** 作用域是它所在当前代码块，不会被提升到当前函数的最顶部。

        如：

        ```javascript
        function test() {
            if(bool) {
               let test = 'hello man'
            } else {
                //test 在此处访问不到
                console.log(test)
            }
        }
        ```

    - **const ：**它声明的变量都会被认为是常量，意思就是它的值被设置完成后就不能再修改了。

        ```javascript
        const name = 'lux'
         name = 'joe' //再次赋值此时会报错
        ```

        但是如果const声明一个对象，对象的属性是可以被修改的。抽象一点儿说，就是这个对象的地址不可改变。

        ```javascript
         const student = { name: 'cc' }；
         student.name = 'yy'；            // 没问题
         student  = { name: 'yy' }；     // 报错
        ```

