# Ajax基础知识点

[TOC]



#### 1. Ajax简介

Ajax被认为是 Asynchronous（异步） JavaScript and XML的缩写。现在，允许浏览器无需刷新当前页面而与服务器通信的技术都被叫做Ajax。

**不用刷新整个页面便可与服务器通信的方法：**

 - `flash`
 - `java applet`
 - 框架：如果使用了一组框架构建了一个网页，可以只更新其中的一个框架，而不必惊动整个页面。
 - 隐藏的iframe
 - **XMLHttpRequest**：该对象是对`JavaScript`的一个扩展，可使网页与服务器通信，是创建`Ajax`应用的最佳选择。实际上通常把`Ajax`当成`XMLHttpRequest`对象的代名词。



----------



#### 2. Ajax工具包

Ajax并不是一项新技术，它实际上是几种技术，每种技术各尽其职，以一种全新的方式聚合在一起。

 - 服务器端语言：服务器需要具备向浏览器发送特定信息的能力，**Ajax与服务器端语言无关。**
 - `XML`（eXtensible Markup Language，可扩展标记语言）：是一种描述数据的格式，**Ajax程序需要某种格式化的格式来在服务器端和客户端之间传递信息，XML是其中一种选择。**
 - 使用 `XHTML`（eXtended Hypertext Markup Language，可扩展超媒体标记语言）和 `CSS`（Cascading Style Sheet，级联样式单）**标准化呈现**。
 - 使用 `DOM`（Document Object Model，文本对象模型）**实现动态显示和交互**。
 - 使用XMLHttp组件 `XMLHttpRequest对象` 进行**异步数据读取**。
 - 使用 `JavaScript` **绑定和处理所有数据**。



----------



#### 3. Ajax的缺陷

1. 由JavaScript和Ajax引擎导致的浏览器的兼容（使用JS库可以不用考虑）。
2. 页面局部刷新，导致后退等功能失效。
3. 对流媒体的支持没有Flash，JavaApplet好。
4. 一些手持设备（如手机、PDA等）支持性差。



----------



#### 4. XMLHttpRequest的概述

XMLHttpRequest最早是在IE5中以ActiveX组件的形式实现的，非W3C标准。

 - **创建XMLHttpRequest对象**：因为非标准，所以实现方法不统一
    - 在IE7之前把XMLHttpRequest实现为一个ActiveX对象，IE7之后统一为XMLHttpRequest对象。

    - 其它浏览器把它实现为一个本地的JavaScript对象。

        ```javascript
        如： function getHttpObject(){
                var xhr = false;
                //如果返回对象则为true，返回null为false
                if(window.XMLHttpRequest){ 
                    xhr = new XMLHttpRequest();
                }else if(window.ActiveXObject){
                    xhr = new ActiveXObject("Microsoft.Http");
                }
                return xhr;
            }
        ```

        XMLHttpRequest在不同浏览器上的实现是兼容的，所以可以用同样的方式访问XMLHttpRequest实例的属性和方法，而不论这个实例的创建方法是什么。

 - **XMLHttpRequest的方法：**

    | 方法                                  | 描述                                                         |
    | ------------------------------------- | ------------------------------------------------------------ |
    | `abort()`                             | 停止当前请求                                                 |
    | `getAllResponseHeaders()`             | 把HTTP请求的所有响应首部作为键/值对返回                      |
    | `getResponseHeaders("header")`        | 返回指定首部的字符串值                                       |
    | `open("method", "url")`               | 建立对服务器的调用。method参数可以是GET、POST或PUT，url参数可以是相对URL或绝对URL |
    | `send(content)`                       | 向服务器发送请求                                             |
    | `setRequestHeader("header", "value")` | 把指定首部设为指定的值，在设置任何首部之前必须调用open（）   |

- **XMLHttpRequest的属性：**

    | 属性                 | 描述                                                         |
    | -------------------- | ------------------------------------------------------------ |
    | `onreadystatechange` | 每次readyState改变都会触发这个事件处理器，通常会调用一个JS函数 |
    | `readyState`         | 请求的状态，有5个可选值：0—未初始化，1—正在加载，2—加载完毕，3—交互中，4—完成 |
    | `responseText`       | 服务器的响应，表示为一个字符串                               |
    | `responseXML`        | 服务器的响应，表示为XML，这个对象可以解析为DOM对象           |
    | `status`             | 服务器的HTTP状态码（200对应OK，404对应NotFound等）           |
    | `statusText`         | HTTP状态码的相应文本（OK或NotFound等）                       |


 - **发送请求：**利用XMLHttpRequest实例与服务器进行通信包含以下3个关键部分：

     - **onreadystatechange事件处理函数**：
     由服务器触发，依靠更新XMLHttpRequest实例的readyState来通知客户端当前的通信状态，每次readyState属性的改变都会触发onreadystatechange事件。

     - **open方法**：
     在某些情况下，有些浏览器会把多个XMLHttpRequest请求的结果缓存在同一个URL。如果对每个请求的响应不同，就会带不来不好的结果。因此将时间戳追加到URL的最后，就能确保URL的唯一性，从而避免浏览器缓存结果。
     如：`var url = str + "?time=" + new date()；`
       
     - **send方法**：
     当向send()方法提供参数时，要确保open()中指定的方法POST，若选用的是GET请求，则不会发送任何数据，参数为null即可。

 - **接收响应：**在Ajax处理过程中，XMLHttpRequest的如下属性可被服务器更改：

    - readyState：Ajax请求的当前状态。

     - 0：代表未初始化，还未调用`open()`方法

     - 1：代表正在加载，`open()`已被调用，但`send()`还没有调用

     - 2：代表加载完毕，`send()`已被调用，请求开始

     - 3：代表交互中，服务器正在发送响应

     - **4：代表完成，响应发送完毕**

    - status：在XMLHttpRequest对象中，服务器发送的状态码都保存在status属性里。

        > 三位数的状态码是服务器发送的响应中最重要的头部信息，并且属于超文本传输协议中的一部分。常用状态码及其含义：
        >
        > - 200：一切正常(OK)
        > - 304：没有被修改(Not Modified)
        > - 403：禁止访问(Forbidden)
        > - 404：没有找到页面(Not Found)
        > - 500：内部服务器出错(Internal Service Error)

    - responseText：包含了从服务器发送的数据，它是一个HTML，XML或者普通文本，这取决与服务器发送的内容。

    - responseXML：只有服务器发送了带有正确头部信息的数据时，responseXML属性才是可用的，MIME类型必须为text/XML。如果服务器返回的是XML，数据才会存储在这个属性中。



----------



#### 5. 数据格式提要

在服务器端，Ajax是一门与语言无关的技术，在业务逻辑层使用任何服务器端语言都可以。但是从服务器端接收数据时，那些数据必须以浏览器能够理解的格式发送。服务器端的编程语言只能以如下三种格式返回数据：



##### 5.1  XML

服务器返回此类型需要使用responseXML属性获取数据，可以使用DOM来解析数据。

- **优点：**

  - XML是一种通用的数据格式。
  - 不必把数据强加到已经定义好的格式中，而是要为数据自定义标记。
  -  利用DOM可以完全掌控文档。

- **缺点：**

   - 如果文档来自于服务器，就必须得保证文档有正确的头部信息。若文档类型不正确，那么responseXML的值将是空的。
   - 当浏览器接收到长的XML文件后，DOM解析可能会变得很复杂。

   


##### 5.2  JSON

 JSON(JavaScript Object Notation)是一种简单的数据格式，比XMl更轻巧，是JavaScript的原生格式，因此在JavaScript中处理JSON数据不需要任何特殊的API或工具包。

 > JSON格式规则：
    对象是一个无序的键值对集合，一个对象以一对花括号（"{ }"）开始和结束，键值对写法为："键":"值"，这里的冒号为赋值，每个键值对之间以逗号（","）相隔。其中值可为数字、字符串、布尔值和对象，甚至可为函数。

- **解析JSON：** **eval()**会把一个字符串参数当作JS代码执行，因为JSON的字符串就是由JS代码构成，所以它本身是可执行的。

    ```js
    如： var jsonStr = "{'name': '张三'}";
         var testObject = eval("("+ jsonStr + ")");
         //此时 testObject.name == "张三"
    ```

     **注意：JSON字符串需要用"()"包装起来，否则会解析失败。**

- **优点：**

   - 作为一种数据传输格式，JSON和XML很相似，但是它更加灵巧。

   -  JSON不需要从服务器端发送含有特定的内容类型的头部信息。

- **缺点：**

   - 语法过于严谨
   - 代码不易读
   - eval函数存在风险

   


##### 5.3  HTML

 HTML由一些普通文本组成，如果服务器通过XMLHttpRequest发送HTML，文本将存储在responseText属性中。此时可以不必从responseText属性中解析数据，因为它已经是希望的格式，可以直接更新元素的innerHTML属性来使用它。

- **优点：**

  - 从服务器端返回的HTML代码在浏览器中不需要用JavaScript进行解析;
  - HTML的可读性好。
  - HTML代码块与innerHTML属性搭配，效率高。

- **缺点：**

  - 若需要通过Ajax更新一篇文档的多个部分，HTML不合适。
  - innerHTML并非DOM标准（但浏览器普遍支持）。

  


##### 5.4  对比小结

- 若应用程序不需要与其他应用程序共享数据时，使用HTML片段返回数据是最简单的。
- 若数据需要重用，JSON文件是一个不错的选择，其在性能和文件大小方面有优势。
- 当远程应用程序未知时，XML文档是首选，因为XML文档是web服务领域的“世界语”。



----------



#### 6.  jQuery中的Ajax

jQuery对Ajax操作进行了封装，在jQuery中最底层的方法是**`$.Ajax()`**；第二层是**`load()`，`$.get()`和`$.post()`**；第三层是**`$.getScript()`**和**`$.getJSON()`**。**因为使用方便，所以更偏向于开发。**



 - **load（）：**jQuery中最为简单和常用的Ajax方法，能载入远程的HTML代码并插入到指定DOM元素中，它的结构是：`load(url, [data], [callback])`

    |      参数名称      |   类型   |                            说明                             |
    | :----------------: | :------: | :---------------------------------------------------------: |
    |       `url`        |  String  |                    请求HTML页面的URL地址                    |
    |   `data（可选）`   | JSON对象 | 发送到服务器的key/value数据会作为QueryString附加到请求URL中 |
    | `callback（可选）` | Function |          请求完成时的回调函数，无论请求成功或失败           |

    **注意：**

    1. 如果只需加载目标HTML中的某些元素，可以给URL参数指定选择符，URL参数的语法结构为“url selector”（url与选择器之间有一个空格）。
    2. 传递方式：`load()`方法的传递方式根据参数data自动来定，如果没有参数data，采用GET方式，否则为POST方式。
    3. 对于必须在加载完才能继续的操作，`load()`方法提供了回调函数，该函数有三个参数：代表请求返回内容的data，代表请求状态的textStatus对象和XMLHttpRequest对象。

    

- **$.get()或$.post()：**使用get/post方式来进行异步请求，它的结构是：`$.get(url, [data], [callback], [type])`

    |      参数名称      |   类型   |                             说明                             |
    | :----------------: | :------: | :----------------------------------------------------------: |
    |       `url`        |  String  |                    请求HTML页面的URL地址                     |
    |   `data（可选）`   | JSON对象 | 发送到服务器的key/value数据会作为QueryString附加到请求URL中  |
    | `callback（可选）` | Function |                     请求成功时的回调函数                     |
    |   `type（可选）`   |  String  | 服务器返回内容的格式，包括xml、html、script、json、text和_default |

    **注意：**

    1. `$.get()`方法的回调函数只有两个参数：

        - `data`代表返回内容，可以是XML文档、JSON文件、HTML片段等；
        - `textStatus`代表请求状态，其值可能为success，error，notmodify和timeout四种。通常在此方法中对返回的数据进行分析并加入到指定的元素中。
    2. `$.get()`和`$.post()`方法是jQuery中的全局函数，而`find()`等方法都是对jQuery对象进行操作的方法。

    

- **$.getJSON()：**使用get方式请求JSON数据,它的结构是：`$.getJSON(url, [data], [callback])`，参数定义与`$.get()`里面的参数定义相同，但此时回调函数中的参数`data`已经是个JSON对象。

    **注意：** 若给`$.get()`方法的type参数传入JSON，则它与`$.getJSON()`效果相同。因此，请求JSON数据有三个方法：

    1. `$.get(url, args, function(data){ }, "JSON")`
    2. `$.post(url, args, function(data){ }, "JSON")`
    3. `$.getJSON(url, args, function(data){ } )`

    

----------



#### 7.使用JackSon生成JSON字符串

1. 导入jar包

2. 具体使用步骤：

    - 创建`org.codehaus.jackson.map.ObjectMapper`对象
    - 调用`ObjectMapper`对象的`writeValueAsString`方法把Java对象或集合转为JSON字符串

    ```java
    如： ObjectMapper mapper = new ObjectMapper()；
        String jsonStr = mapper.writeValueAsString(custom);
    ```

3. 注意：

    - JackSon 根据`getter`方法来定位JSON对象的属性而不是字段。
    - 可以在`getter`方法上添加注解：`org.codehaus.jackson.annotate.JSONIgnore`，在转为JSON对象时则会忽略该属性！

