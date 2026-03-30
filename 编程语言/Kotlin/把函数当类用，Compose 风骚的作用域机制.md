## 把函数当类用，Compose 风骚的作用域机制

[TOC]





### 1. 前戏

Compose 的某些 API 只能在指定的组件内部才能使用，在它的外部、甚至它的子组件里，都是被禁止的：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/iPic/2024-03-22-004209.png" alt="img" style="zoom:50%;" />

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/iPic/2024-03-22-004210.png" alt="img" style="zoom:50%;" />

这种规则很合理，对吧？

但是，有一个事实是，Compose 是用函数来写界面的，它的每个组件都是一个函数，而不是类：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/iPic/2024-03-22-004212.png" alt="img" style="zoom:50%;" />

类和接口要做这种访问性的隔离，是很容易的。而函数并不具备这样的功能——限制某些公开的属性或者函数只能在特定的**函数**内部才能被使用，Kotlin 是没有提供这种功能的，Java 也没有。



那……Compose 是怎么做到的呢？

这就得提一下 Compose 的作用域机制。「作用域」这个词在 Compose 底层原理的角度有它单独的含义，它是用来讨论在界面结构的组合过程中，每个层级之间的关系的一个关键概念。不过今天，咱不聊这个，我们来借着 Compose 的躯壳，聊一聊 Kotlin 语言这个层面的作用域机制。



------



### 2. Compose 和 DSL

Compose 的写法是声明式的，但是跟同为声明式的 Flutter 有一个很大的不同是，它的界面组件是用函数来写的，而不是用类。

用函数来写，有一个很大的好处就是，它的写法可以做到极致的简洁，简洁到它可以被看作是一种 DSL。——哎，啥是 DSL？



做 Android 开发的人，很多应该都见过 DSL 这个词，因为我们用的 Gradle 就是一种 DSL。但是可能很多人对于「到底 DSL 是啥意思」的概念还是比较模糊。

所谓 DSL，它的全称是 Domain-Specific Language，中文翻译叫「领域特定语言」，其实就是「专属于某个领域的语言」。

相对于 C++、Java、Kotlin 这些通用的编程语言，DSL 是被设计来专门针对某种特定场景的专用化的语言。比如 HTML，就是一种专门用来写网页界面的 DSL：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple HTML Page</title>
  </head>
  <body>
    <h1>Welcome to My Simple HTML Page</h1>
    <p>This is a paragraph of text in the body of the HTML page.</p>
    <p>Here is a link to an interesting <a href="https://www.wikipedia.org/">website</a>.</p>
  </body>
</html>
```



还有 SQL，它是专门用来访问关系型数据库的 DSL：

```sql
SELECT * FROM Customers WHERE Country = 'CN';

SELECT CustomerID, FirstName, LastName, Email FROM Customers;

SELECT COUNT(*) AS NumberOfCustomers FROM Customers;

SELECT * FROM Customers ORDER BY LastName ASC;

SELECT Country, COUNT(*) AS NumberOfCustomers FROM Customers GROUP BY Country;

SELECT Orders.OrderID, Customers.FirstName, Customers.LastName, Orders.OrderDate
FROM Orders
INNER JOIN Customers ON Orders.CustomerID = Customers.CustomerID;

INSERT INTO Customers (FirstName, LastName, Email, Country)
VALUES ('Kai', 'Zhu', 'rengwuxian@gmail.com', 'CN');

UPDATE Customers SET Email = 'rengwuxian@gmail.com' WHERE CustomerID = 1;

DELETE FROM Customers WHERE CustomerID = 1;
```



另外很多程序员写文档喜欢用的 Markdown，它是一种「格式」，但它也是一种专门用来写格式化文档的 DSL：

```markdown
# Header 1
## Header 2
### Header 3

This is a paragraph with some *italic* text and some **bold** text.

Here's an unordered list:
- Item 1
- Item 2
  - Nested Item 2a
  - Nested Item 2b

And here's an ordered list:
1. First item
2. Second item
3. Third item

`Inline code` can be included within backticks.
```



有个边界案例是 XML：它通常被认为像 JSON 一样是一种数据格式，而不是一种 DSL：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="programming">
    <title lang="en">Learn XML</title>
    <author>John Doe</author>
    <year>2021</year>
    <price>39.95</price>
  </book>
  <book category="fiction">
    <title lang="en">XML for Storytellers</title>
    <author>Jane Austen</author>
    <year>2020</year>
    <price>29.99</price>
  </book>
  <book category="reference">
    <title lang="en">The XML Handbook</title>
    <author>Robert Smith</author>
    <year>2019</year>
    <price>49.99</price>
  </book>
</bookstore>
```



为啥？因为它不是领域特定的，它可以用在很多地方，但并不针对任何领域。而你如果针对某种场景，使用 XML 去设计一种专用的格式，那它就是 DSL——比如 SVG，一种矢量图的表达格式，它就是 DSL，因为它是专用于矢量图这个领域的，虽然它本质上也是一种 XML：

```xml
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" stroke="black" stroke-width="2" fill="blue" />
</svg>
```



所以，<font color="red">DSL 是一个宽松的概念，它关键在于是否是用于特定领域的。</font>你可以从零去创造一门 DSL，也可以拿现成的东西去改成 DSL。

不止 XML，咱还可以用通用编程语言来改成 DSL。比如 Gradle，就是一种基于 Groovy 语言的 DSL 它针对场景的是 Java 项目的架构配置——当然也包括 Android 项目。另外现在 Gradle 也支持 Kotlin 了，这就是它又添加了使用 Kotlin 来写 Gradle 脚本的支持。你大眼一看，这就是个配置文件，但它实际上是用 Kotlin 写的，只不过被精心做成了长得很像配置文件的样子。



而 Compose，也是一样的道理：==它是一个定制化的、专门用来写界面的 DSL；但本质上，它依然是 Kotlin==。



------



### 3. implicit receiver

那么既然是 Kotlin，它就可以完全享受 Kotlin 的所有功能，但也完全承受了 Kotlin 的限制。比如，我们在写传统的 XML 布局的时候——哎对了，Android 的布局文件格式，也是一种 DSL，跟 SVG 的逻辑一样——我们在写 Android 的 XML 布局的时候，如果把属性写在不合适的位置，是会看到警告的对吧：

```xml
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <TextView
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:layout_weight="1"
        android:text="" />

</RelativeLayout>
```

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/iPic/2024-03-22-004213.png" alt="img"  />

这是因为 Android Studio 会利用专门的 Lint 规则来自动检查文件结构，这就能在格式不对的时候给我们报警。——这套规则我们不用写，但 Android 的研发团队是花了精力去写它的。



而 Compose 是用 Kotlin 来写的，那么理论上就不需要专门再写 Lint 了，把代码设计好，直接利用 Kotlin 的特性就能检查和报错了。是吧？实际上，Compose 也是这么做的。



但是具体到作用域这个问题，就有一个障碍：就像我刚才说的，它的组件不是用类写的，而是函数。函数并没有像类和接口那样的层级结构，成员属性和成员函数这些东西，函数是没有的——你可以写局部变量和局部函数，但这些东西是完全私有的，没法从外部调度，所以不是一回事。

这样的话，虽然用的是 Kotlin，但我们还是没法像传统布局文件那样对作用域做规则管理。直白点说就是，你想限制某个属性或者函数只能在指定的函数内部被调用，这是做不到的。

但是！实际情况却不是这样。Compose 的 `Row()` 组件内部可以使用一个叫 `align()` 的 `Modifier` 函数，它可以设置 `Row()` 内部每个组件的纵向对齐规则，比如纵向居中：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/iPic/2024-03-22-004214.png" alt="img" style="zoom:50%;" />

而你如果在 `Row()` 的外面尝试使用它，就会报错：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/iPic/2024-03-22-004215.png" alt="img" style="zoom:50%;" />

这是为啥？



这其实是利用了 Kotlin 的另一个概念，叫 implicit receiver，隐式的 receiver。Compose 把这个 `align()` 写成了 `RowScope` 的成员函数，来限制它只能在 `RowScope` 对象的内部被调用；同时，它还给 `Row()` 组件的函数类型的参数——也就是这个大括号参数——给它设置了一个 `RowScope` 类型的隐式 receiver，这就让 `Row()` 后面的这个大括号里有了一个隐式的、`RowScope` 类型的 `this`。这样，最终的效果就是：我们只能在 `Row()` 的大括号里调用这个 `align()`，而在其他地方用不了。<font color="red">通过 implicit receiver 这种方式，Compose 就实现了用函数——而不是类——也能进行作用域限制的目的</font>。





------



### 4. `@DslMarker`

不过这还没完。

这一套打法，它只限制了「不能在外部使用」，却没有限制「不能在内部的内部使用」。比如我在 `Row()` 的内部又摆了个 `Column()`，也就是纵向的线性布局：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/iPic/2024-03-22-004216.png" alt="img" style="zoom:50%;" />

`Row()` 组件的这种「纵向对齐规则」，它是只对直接子组件才有意义的。比如这个 `Text()` 和 `Column()`：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/iPic/2024-03-22-004217.png" alt="img" style="zoom:50%;" />

但对于 `Column()` 内部的 `Text()`，设置这种「纵向对齐」就没有意义了——子组件的子组件，隔着一层呢，怎么对齐呀，是吧？它可以设置在它的父组件——也就是这个 `Column()`——里的横向对齐规则：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/iPic/2024-03-22-004218.png" alt="img" style="zoom:50%;" />

——注意，这里虽然函数名一样，但其实是另一个函数，它只接受横向对齐类型的参数。

横向对齐没问题，但更外面的 `Row()` 所管理的纵向对齐，对于这个二级子组件的 `Text()` 是没有意义的。所以按理说，在这个 `Text()` 里就也不应该允许调用那个纵向对齐的 `align()` 了，是吧？但是，按照 Kotlin 的逻辑，这么写却是被允许的：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/iPic/2024-03-22-004220.png" alt="img" style="zoom:50%;" />

——哎？也不允许？ 这，怎么做到的？（惊奇转变成笑）



Kotlin 有一个特殊的注解，叫 `DslMarker`，这个限制就是靠它来实现的：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/iPic/2024-03-22-004221.png" alt="img" style="zoom:50%;" />

哎？D-S-L-Marker，DSL，咱刚才刚说过的，是吧？这是个专门用来写 DSL 的注解吗？

还真的是的，这个注解就是专门用来让我们设计 DSL 的时候用的。Compose 就是个 DSL，刚才我说过了，是吧？

不过咱刚才也说过了，DSL 是个泛指的、广义的词，具体的有很多种 DSL，它们的定位和用法是完全不同的。而这个 `DslMarker`，只是实现了其中一种 DSL 的一种功能。

什么功能？就是咱现在说的这种。<font color='red'>Compose 通过高阶函数和隐式的 receiver 实现了作用域向外的限制</font>：只能在某个函数调用的大括号内部去访问某些属性和函数，在外面是不行的。

对吧？而 `DslMarker` 的限制是向内的：就算在作用域内，就算在大括号的里面，如果你再套一层，那么在这个更内层的里面我也不让你用。

也就是咱看到的这个，`Row()` 的大括号里可以用，但里面再套一层 `Column()` 之后，`Column()` 的里面就不让用了。这种<font color='red'>「向内切断作用域传递」</font>的工作，就是靠 `DslMarker` 来实现的。



我们去看一下 `Row()` 和 `Column()` 所提供的隐式 receiver 的类型，也就是这个 `RowScope` 和 `ColumnScope`：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/iPic/2024-03-22-004222.png" alt="img" style="zoom:50%;" />

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/iPic/2024-03-22-004224.png" alt="img" style="zoom:50%;" />

它们有一个共同的注解，叫 `LayoutScopeMarker`，对吧？然后我再去看这个 `LayoutScopeMarker`：

<img src="https://hen-coder.oss-cn-beijing.aliyuncs.com/iPic/2024-03-22-4225.png" alt="img" style="zoom:50%;" />

就能看到它是加了这个叫 `DslMarker` 的注解。


通过这种方式，我就把 `RowScope` 和 `ColumnScope` 标记为「互相隔离作用域」的。当我在 `RowScope` 的里面套一层 `ColumnScope`，本来从 `ColumnScope` 的里面应该是能访问到外面的 `RowScope` 的，但加了这个 `LayoutScopeMarker` 之后，就没法访问了，`RowScope` 的所有属性和函数被强行禁止在它里面的 `ColumnScope` 的内部使用了。——同理，如果 `ColumnScope` 的里面套一个 `RowScope`，也是不能往外访问的。



这种限制，可以防止 API 的污染。就像我们例子里这种，既然某些 API 只在直接的内部有意义，而在「内部的内部」就失去了意义，那就干脆禁用这些 API 在「内部的内部」的访问，让我们不要被没用的 API 淹没，从而减少问题，也能提升开发体验。



==这就是 `DslMarker` 这个注解的作用：向内的隔离访问。Compose 只是一个例子，在其他地方——比如 Gradle 里——也有类似的使用。==



因此，该注解广泛用于自定义 DSL 中。

在 DSL 中，Kotlin 允许通过扩展函数和带接收者的 Lambda 表达式（如 `lambda with receiver`）构建嵌套结构。例如：

```kotlin
html {
    head {
        title("Example")
    }
    body {
        div {
            // 这里可以访问外层的 body 或 html 的接收者吗？
        }
    }
}
```

如果未使用 `@DslMarker`，内层的 `div` 代码块可能会隐式访问到外层作用域的接收者（如 `html`、`body`），导致逻辑混乱或误操作。<font color='red'>`@DslMarker` 的作用就是限制这种隐式访问，确保每个嵌套块只能访问最近的接收者。</font>



注意：==**显式访问仍然允许**：如果需要访问外层接收者，可以通过显式指定 `this@OuterReceiver`：==



该注解使用的注意事项：

1. **注解的作用范围**
   `@DslMarker` 必须应用于自定义的注解类，且该注解类本身不能有其他用途。
2. **仅用于 DSL 接收者类型**
   只有 DSL 的接收者类（如 `Html`、`Body`）需要标记自定义注解，其他普通类无需标记。
3. **兼容性**
   需要 Kotlin 1.1 或更高版本。



完整代码示例：

```kotlin
@DslMarker
annotation class HtmlDsl

@HtmlDsl
class Html {
    fun head(block: Head.() -> Unit) { /* ... */ }
    fun body(block: Body.() -> Unit) { /* ... */ }
}

@HtmlDsl
class Head {
    fun title(text: String) { /* ... */ }
}

@HtmlDsl
class Body {
    fun div(block: Div.() -> Unit) { /* ... */ }
}

@HtmlDsl
class Div {
    fun p(text: String) { /* ... */ }
}

// 构建 DSL
fun html(block: Html.() -> Unit): Html = Html().apply(block)

// 使用
fun main() {
    html {
        head {
            title("Example Page") // 只能访问 Head 的方法
        }
        body {
            div {
                p("Hello, Kotlin DSL!") // 只能访问 Div 的方法
                // this@body.someMethod() // 显式访问外层 Body（如果允许）
            }
        }
    }
}
```

