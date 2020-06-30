### JavaScript DOM编程

[TOC]



#### 1. DOM：Document Object Model

 - D：**文档**（HTM文档或XML文档）
 - O：**对象**（Document对象的属性或者方法）
 - M：**模型**
   
>DOM是针对XML（HTML）的基于树的API，他把一个文档表示为一颗家谱树（父、子、兄弟），DOM定义了Node的接口以及许多种节点类型来表示XML节点的多个方面



-------------------



#### 2. 节点及其类型

 - **元素节点**

 - **属性节点**：元素的属性，可以直接通过属性的方式来操作。

 - **文本节点**：是元素节点的子节点，其内容为文本。

    

--------------------



#### 3. 在HTML文档中什么位置编写JS代码？

 - 直接在HTML页面中：

    ```javascript
     eg：<button id =" buton " onclick =" alert(' Hello World ! ');">ClickMe </button>
    ```

    **缺点：**

    1. JS和HTML强耦合，不利于代码的维护			
    2. 若click相应的函数是比较复杂的，则需要先定义一个函数，然后再在onclick属性中引用
 - **一般地，在body节点之前编写JS代码，但需要利用`window.onload`事件**，该事件在当前文档加载完成之后触发，所以其中的代码可以获取到当前文档的任何节点（推荐使用）。

    

----------



#### 4. 获取元素节点

 - **`document.getElementById`**：根据id属性获取对应的单个元素节点。

 - **`document.getElementsByTagName`**：根据节点名获取指定的元素节点数组，数组对象length属性可以获取数组的长度。

    **注：**该方法为Node接口的方法，即任何一个元素节点都有这个方法
 - **`document.getElementsByName`**：根据节点的name属性获取符合条件的元素节点数组。

     IE的实现方式和W3C标准有差别：在HTML文档中若某节点（li）没有name属性，则IE使用`getElementsByName`不能获取到节点数组，但火狐可以。

 - 其他的两个方法，IE根本就不支持，所以不建议使用。

    

----------



#### 5. 获取属性节点

 - 通过元素节点的方式来获取和设置属性值（推荐使用）。

    ```javascript
    如: name: <input type = "text" name = "username" id = "name" value = "attrws"/>
    ```

    **属性节点即为某一指定的元素节点的属性**：

    1. 先获取指定的那个元素节点：`var nameNode = document.getElementById（“name”）`
    2. 再获取指定属性的值：`nameNode.value`
    3. 设置指定属性的值：`nameNode.value = “尚硅谷”`
 - 通过元素节点的**`getAttributeNode`**方法获取属性节点，然后再通过nodeValue来读写属性值。

    

----------



#### 6. 获取元素节点的子节点

 - **获取元素节点的所有子节点：**

    利用元素节点的`childNodes`方法可以获取指定元素节点的所有子节点，但该方法并不实用。

 - **获取元素节点的指定标签的所有子节点：**

   利用元素节点的`getElementsByTagName（“li”）`方法可以获取到该元素节点的所有标签为li的子节点。

 - **获取元素节点的首节点和尾节点：**

   通过元素节点的`firstChild`和`lastChild`可以获取。

   

----------



#### 7. 读写文本节点

>**文本节点一定是元素节点的子节点**

**步骤：**

1. 获取文本节点所在的元素节点
2. 通过`firstChild`方法定位到文本节点
3. 通过文本节点的`nodeValue`属性来读写文本节点的值



----------



#### 8. 节点的属性

>在文档中，任何一个节点都有nodeType、nodeName及nodeValue这三个属性，而id、name和value是具体的元素节点的属性。

|- | nodeType | nodeName |	nodeValue |
|----| ----| ----|----|
| 元素节点  |	 1	   | 节点名	  |	  null    |
| 属性节点	|    2   | 属性名	  |	  属性值  |
| 文本节点	|    3   | \#text	  |	  文本值  |

**注：**以上三个属性，nodeType、nodeName是只读的，而nodeValue是可以改变的，nodeValue只有在文本节点中读写文本值时才使用最多。



----------



#### 9. 创建并加入节点

 - **创建一个元素节点：`createElement（）`**

    按照给点的标签名创建一个新的元素节点。 该方法只有一个参数，被创建的元素节点名，是一个字符串，返回值为新建元素节点的引用，所以它的`nodeType`值为1。

    **注意：**新元素节点不会自动添加到文档里，它只是一个存在于JavaScript上下文的对象，此时并不能被document对象的方法访问到。

 - **创建一个属性节点：**

    先需要创建一个元素节点，然后通过 **.** 的方式为其属性赋值就可以了。

    ```javascript
    eg:	var aNode = document.createElement（“a”）;
    		aNode.herf =“www.baidu.com”;
    ```

 - **创建一个文本节点：`createTextNode（）`**

    创建一个包含给定文本的新文本节点。该方法只有一个参数，新建文本节点所包含的文本字符串，返回值为新建文本节点的引用，所以它的nodeType值为3。

    **注意：**新文本节点同样不会自动添加到文档里，它只是一个存在于JavaScript上下文的对象，此时也不能被document对象的方法访问到。

 - **为元素节点添加子节点：`appendChild（）`**

    给定子节点newChild将成为给定元素节点element的最后一个子节点，该方法的返回值为新增子节点的引用。

    ```JavaScript
      var reference = element.appendChild（newChild）;
    ```

     当使用`appendChild（）`、`replaceChild（）`、`insertBefore（）`等方法将创建的节点添加到文档中时，此时创建的节点就能够被document对象的方法访问到。

  

----------


#### 10. 节点的替换

- **`replaceChild（）`**：把一个给定父元素里的子节点替换为另外一个子节点。

    ```javascript
     var reference =element.replaceChild（newChild，oldChild）;
    ```

    该方法返回值为被替换子节点的引用，同时该方法除了替换还有移动功能，替换的节点不会再在原位显示。

    **注：**该方法只能完成单向替换，若需双向替换则要自定义函数。
 - **节点的交换：**借助`cloneNode（true）`这个方法可以快速地完成节点的交换。
    `cloneNode（deep)`：克隆节点，若deep为true，则可以克隆子节点，
     自定义函数如下：

    ```javascript
    function swipeChildNode(aNode, bNode) {
        if (aNode.== bNode) {
            return ;
        }
        var bParent = bNode.parentNode;
        var aParent = aNode.parentNode;
        if (bParent && aParent) {
            var tempChildNode = aNode.cloneNode(true);
            bParent.replaceChild(tempChildNode, bNode);
            aParent.replaceChild(bNode, aNode);
        }
    }
    ```

    

----------



#### 11. 删除节点

 - **`removeChild（）`**：从一个给定元素里删除一个指定子节点。

    ```javascript
    var reference = elemen.removeChild（node）;
    ```

    该方法的返回值是已被删除子节点的引用，由该方法删除的节点，它所包括的所有子节点也会被删除。如果想删除某个节点，却又不知道它的父节点是哪一个，我们可以借助parentNode属性。

    

----------



#### 12. 插入节点

 - **`insertBefore（）`**：把一个给定节点插入到一个给点元素节点的给定子节点的前面。

    ```javascript
    var reference = element.insesrtBefore(newNode，targetNode）；
    ```

    节点`newNode`将被插入到元素节点`element`中并出现在`targetNode`的前面，节点`targetNode`必须是`element`的一个子节点。
    **注：**该方法除了插入以外，还有移动的功能，newNode将不在原位显示。

  - **insertAfter（）**： 把一个给定节点插入到一个给点元素节点的给定子节点的后面。
     借助节点的nextSibling属性，可以知道它的下一个兄弟节点。

     ```javascript
     /**
      * 将 newChild 插入到 refChild 的后边
      * @param {Object} newChild
      * @param {Object} refChild
      */
     function insertAfter(newChild, refChild){
     	var refParentNode = refChild.parentNode;
     	
     	//判断 refChild 是否存在父节点
     	if(refParentNode){
     		//判断 refChild 节点是否为其父节点的最后一个子节点
     		if(refChild == refParentNode.lastChild){
     			refParentNode.appendChild(newChild);
     		}else{
     			refParentNode.insertBefore(newChild, refChild.nextSibling);
     		}	
     	}
     }
     ```



----------



#### 13.其他属性

 - **`innerHTML`**：所有的浏览器都支持此属性，但不是DOM标准的组成部分。

    **`innerHTML`属性可以用来读写某给定元素里的HTML内容**，因此我们可以借助此属性快速地完成两个节点内容的交换。（即两个节点下所有子节点的交换）

 - **`previousSibling`**：上一个兄弟节点。

 - **`nextSibling`**：下一个兄弟节点

