## python相关



[TOC]

**语言定位：动态解释性的强类型定义语言**



### 1. 输出与输入

- **print()**

    - `print()`在括号中加上字符串，就可以向屏幕上输出指定的文字；

    - `print()`函数也可以接受多个字符串，用逗号“,”隔开，这样它则会依次打印每个字符串，中间以空格隔开；

    - `print()`也可以打印其他类型的数据，或者表达式结果。

    - `print()`函数不换行：

        只需传入`end = ‘’`这个参数即可，end表示打印以什么结束，可以给他指定不同的值，如：`end = ‘\t’`是以制表符结束，`end = ‘a’`则是以a结尾等等。

        **注意：**`end`只接受`str`类型的值，若给它赋值为其它类型则会报错。

- **input()**

    可以让用户输入字符串，并存放到一个变量里，所以它的返回值类型为`str`：

    ```python
    name = input()
    print('hello,', name)
    ```

    `input()`也可以让你显示一个字符串来提示用户输入信息：

    ```python
    name = input('please input your name: ')
    print('hello,', name)
    ```



------



### 2. python基础

- python中单引号与双引号等效，但推荐优先使用单引号，因为打出来更快。
- 以`#`开头的语句是注释，注释是给人看的，可以是任意内容，解释器会忽略掉注释。
- 当语句以冒号`:`结尾时，缩进的语句视为代码块。按照约定俗成的管理，应该始终坚持使用4个空格的缩进。
- Python程序是大小写敏感的，如果写错了大小写，程序会报错。



#### 2.1 数据类型

在Python中，能够直接处理的数据类型有以下几种：

- 整数

    Python可以处理任意大小的整数，也包括负整数，没有java中的表数范围

- 浮点数

    浮点数也就是小数，对于很大或很小的浮点数，就必须用科学计数法表示，把10用e替代，如：1.23x10^9^等于`1.23e9`

    **注意：**整数运算永远是精确的，而浮点数运算则可能会有四舍五入的误差。

    **在python中有两种除法：**

    - 1. 浮点除**`/`**：计算结果精确但始终是浮点数，即使是两个整数恰好整除，结果也是浮点数：

            ```python
            >>> 9 / 3
            3.0
            ```

    - 2. 整除**`//`**：称为地板除，两个整数的除法仍然是整数，相当于取整运算：

            ```python
            >>> 10 // 3
            3
            ```

    由于`//`除法只取结果的整数部分，因此Python也提供一个余数运算

    - 3. 取余**`%`**：得到两个整数相除的余数：

            ```python
            >>> 10 % 3
            1
            ```

- 字符串

    字符串是以单引号`'`或双引号`"`括起来的任意文本，可以用转义字符`\`来标识字符串内部的`'`或者`"`：

    ```python
    'I\'m \"OK\"!'
    
    #表示的字符串内容是：
    I'm "OK"!
    ```

    - 转义字符

        |  转义字符   |         实际意义          |
        | :---------: | :-----------------------: |
        |  \‘ 或 \"   |         ‘ 或者 “          |
        |     \n      |          换行符           |
        |     \t      |          制表符           |
        |     \\\     |          转义符\          |
        | r' 字符串 ' | ' '内部的字符串默认不转义 |

        如果字符串内部有很多换行，用`\n`写在一行里不好阅读，为了简化，Python允许用**`'''多行字符串'''`**的格式表示多行内容：

        ```python
        >>> print('''line1
        ... line2
        ... line3''')
        line1
        line2
        line3
        ```

        **注意：**`...`是提示符，表示可以多行输入，在交互式命令行下按下**`Ctrl` + `Enter`**，提示符就会由`>>>`变为`...`

- 布尔值

    一个布尔值只有`True`、`False`两种值，在Python中，可以直接用`True`、`False`表示布尔值（**注意大小写**），也可以通过布尔运算计算出来：

    ```python
    >>> True
    True
    >>> False
    False
    >>> 3 > 2
    True
    >>> 3 > 5
    False
    ```

    布尔值可以用**`and`**、**`or`**和**`not`**运算，分别对应逻辑运算中的与、或、非。

- 空值

    空值是Python里一个特殊的值，用**`None`**表示。



- **变量**

    变量在程序中是用来便于访问数据的，它可以是任意数据类型。python中，变量名必须是字母、数字和`_`的组合，且不能用数字开头，同一个变量可以反复赋值，而且可以是不同类型的变量：

    ```python
    a = 123 # a是整数
    print(a)
    a = 'ABC' # a变为字符串
    print(a)
    ```

    这种变量本身类型不固定的语言称之为**动态语言**，与之对应的是**静态语言**。静态语言在定义变量时必须指定变量类型，如果赋值的时候类型不匹配，就会报错。例如：Java就是静态语言

- **常量**

    所谓常量就是不能变的变量，比如常用的数学常数π就是一个常量。在Python中，通常用全部大写的变量名表示常量：

    ```python
    PI = 3.14159265359
    ```

    但事实上`PI`仍然是一个变量，Python根本没有任何机制保证`PI`不会被改变，所以，用全部大写的变量名表示常量只是一个习惯上的用法，**python中没有绝对的常量**。



#### 2.2  字符串和编码

> 由于Python源代码也是一个文本文件，所以，**当源代码中包含中文的时候，保存源代码就需要指定保存为`UTF-8`编码。当Python解释器读取源代码时，为了让它按`UTF-8`编码读取，我们通常需要在文件开头加上这两行：**
>
> ```python
> #!/usr/bin/env python3
> # -*- coding: utf-8 -*-
> ```
>
> 1. 第一行注释是为了告诉Linux/OS X系统，这是一个Python可执行程序，Windows系统会忽略这个注释；
> 2. 第二行注释是为了告诉Python解释器，按照UTF-8编码读取源代码，否则，你在源代码中写的中文输出可能会有乱码，python2中必须加上，因为它的解释器默认以`ASCII`编码读取。



##### 2.2.1 字符集

- `ASCII`编码：主要对大小写英文字母、数字和一些符号进行编码，大小为1B；

- `Unicode`编码：Unicode把所有语言都统一到一套编码里，因此也叫万国码，Unicode标准也在不断发展，但最常用的是用2B表示一个字符（如果要用到非常偏僻的字符，就需要4B）。

- `UTF-8`编码：可变长编码，UTF-8编码把一个Unicode字符根据不同的数字大小编码成1-6B，常用的英文字母被编码成1B，汉字通常是3B，只有很生僻的字符才会被编码成4-6B。如果你要传输的文本包含大量英文字符，用UTF-8编码就能节省很多空间。

    **注意：ASCII编码实际上可以被看成是UTF-8编码的一部分。**

**现在计算机系统通用的字符编码工作方式：**

​	在计算机内存中，统一使用Unicode编码，当需要保存到硬盘或者需要传输的时候，就转换为UTF-8编码。



##### 2.2.2 Python的字符串

**在最新的Python 3版本中，字符串是以Unicode编码的。**

- **字符的编码与解码：**Python提供了**`ord()`**函数来获取字符的对应Unicode码，**`chr()`**函数则把Unicode码转换为对应的字符：

    ```python
    >>> ord('A')
    65
    >>> ord('中')
    20013
    >>> chr(66)
    'B'
    >>> chr(25991)
    '文'
    ```

    如果知道字符的整数编码，还可以用十六进制这么写`str`：

    ```python
    #\u表示Unicode码
    >>> '\u4e2d\u6587'
    '中文'
    ```

- **数据二进制化：**由于Python的`str`在内存中以Unicode表示，一个字符对应若干个字节。为了方便传输和保存，通常将`str`变为以字节为单位的`bytes`类型。Python对`bytes`类型的数据用**带`b`前缀的单引号或双引号**表示，相当于强制类型转换成`bytes`：

    ```python
    x = b'ABC'
    ```

- **编码：**以Unicode表示的`str`通过**`encode()`**方法编码为指定的`bytes`类型： str --> byte

    ```python
    >>> 'ABC'.encode('ascii')
    b'ABC'
    >>> '中文'.encode('utf-8')
    b'\xe4\xb8\xad\xe6\x96\x87'
    ```

- **解码：**如果我们从网络或磁盘上读取了字节流，那么读到的数据就是`bytes`。要把`bytes`变为`str`，就需要用**`decode()`**方法：byte --> str

    ```python
    >>> b'\xe4\xb8\xad\xe6\x96\x87'.decode('utf-8')
    '中文'
    ```

    - 如果`bytes`中包含无法解码的字节，`decode()`方法会报错：

        ```python
        >>> b'\xe4\xb8\xad\xff'.decode('utf-8')
        Traceback (most recent call last):
          ...
        UnicodeDecodeError: 'utf-8' codec can't decode byte 0xff in position 3: invalid start byte
        ```

    - 如果`bytes`中只有一小部分无效的字节，可以传入`errors='ignore'`忽略错误的字节：

        ```python
        >>> b'\xe4\xb8\xad\xff'.decode('utf-8', errors='ignore')
        '中'
        ```

- **字符长度：**可以用**`len()`**函数计算`str`包含多少个字符：

    ```python
    >>> len('ABC')
    3
    >>> len('中文')
    2
    ```

- **字节个数：**可以用**`len()`**函数计算`bytes`的字节数：

    ```python
    >>> len(b'ABC')
    3
    >>> len(b'\xe4\xb8\xad\xe6\x96\x87')
    6
    >>> len('中文'.encode('utf-8'))
    6
    ```

    **注意：**
    ​    在操作字符串时，我们经常遇到`str`和`bytes`的互相转换。**为了避免乱码问题，应当始终坚持使用UTF-8编码对`str`和`bytes`进行转换**。



##### 2.2.3  字符串格式化

- 占位符：在Python中，采用的格式化方式和C语言是一致的，用`%`实现，举例如下：

    ```python
    >>> 'Hello, %s' % 'world'
    'Hello, world'
    >>> 'Hi, %s, you have $%d.' % ('Michael', 1000000)
    'Hi, Michael, you have $1000000.'
    ```

    在字符串内部，`%s`表示用字符串替换，`%d`表示用整数替换，有几个占位符，后面就跟几个变量或者值，顺序要对应好。如果只有一个占位符，括号可以省略。

    常见的占位符有：

    | 占位符 | 替换内容     |
    | ------ | ------------ |
    | %d     | 整数         |
    | %f     | 浮点数       |
    | %s     | 字符串       |
    | %x     | 十六进制整数 |

    其中，格式化整数和浮点数还可以指定是否补0和整数与小数的位数：

    ```python
    >>> print('%2d-%02d' % (3, 1))
     3-01
    >>> print('%.2f' % 3.1415926)
    3.14
    ```

    **注意：**

    - `%2d`中间的数字表示数的位数，默认不显示高位0，若想显示则只需在它的前面加0即可，如：

        ```python
        >>> print('%05d' %(100))
        00100
        >>> print('%5d' %(100))
          100
        >>> 
        ```

    - `%.2f`中间的小数点加数字表示指定小数的位数，如果仅有小数点则表示只显示整数，与`%.0f`意义相同。

    如果你不太确定应该用什么，`%s`永远起作用，它会把任何数据类型转换为字符串：

    ```python
    >>> 'Age: %s. Gender: %s' % (25, True)
    'Age: 25. Gender: True'
    ```

    有些时候，字符串里面的`%`是一个普通字符怎么办？这个时候就需要转义，用**`%%`**来表示一个`%`：

    ```python
    >>> 'growth rate: %d %%' % 7
    'growth rate: 7 %'
    ```

- format()

    另一种格式化字符串的方法是使用字符串的`format()`方法，它会用传入的参数依次替换字符串内的占位符`{0}`、`{1}`……，不过这种方式写起来比%要麻烦得多：

    ```python
    >>> 'Hello, {0}, 成绩提升了 {1:.1f}%'.format('小明', 17.125)
    'Hello, 小明, 成绩提升了 17.1%'
    ```

    也可以写成这种形式：

    ```python
    >>> 'Hello, {name}, 成绩提升了 {percent:.1f}%'.format(name='小明', percent=17.125)
    'Hello, 小明, 成绩提升了 17.1%'
    ```



#### 2.3 list和tuple



##### 2.3.1  list

> Python内置的一种数据类型，**list是一种有序的可变大小的集合**，可以随时添加和删除其中的元素，类似于java中的**List容器**。

- **初始化：**如下，classmates就是一个list：

    ```python
    >>> classmates = ['Michael', 'Bob', 'Tracy']
    >>> classmates
    ['Michael', 'Bob', 'Tracy']
    ```

- **获取元素个数：**`len()`函数可以获得list元素的个数：

    ```python
    >>> len(classmates)
    3
    ```

- **获取指定位置的值：**通过索引访问元素，索引是从`0`开始的：

    ```python
    >>> classmates[1]
    'Bob'
    >>> classmates[2]
    'Tracy'
    ```

    当索引超出了范围时，Python同样也会报一个`IndexError`错误，表示越界。

    如果要取最后一个元素，除了计算索引位置外，还可以用`-1`做索引，直接获取最后一个元素：

    ```python
    >>> classmates[-1]
    'Tracy'
    ```

    以此类推，也可以获取倒数第2个、倒数第3个.

- **尾部追加元素：** **`append()`**函数可以往list中追加元素：

    ```python
    >>> classmates.append('Adam')
    >>> classmates
    ['Michael', 'Bob', 'Tracy', 'Adam']
    ```

- **插入元素到指定位置：** **`insert(i)`**函数可以向list指定位置插入元素：

    ```python
    >>> classmates.insert(1, 'Jack')
    >>> classmates
    ['Michael', 'Jack', 'Bob', 'Tracy', 'Adam']
    ```

- **尾部删除元素：** **`pop()`**函数可以删除list末尾的元素：

    ```python
    >>> classmates.pop()
    'Adam'
    >>> classmates
    ['Michael', 'Jack', 'Bob', 'Tracy']
    ```

- **删除指定位置元素：  ** **`pop(i)`**方法可以删除list指定位置的元素：

    ```python
    >>> classmates.pop(1)
    'Jack'
    >>> classmates
    ['Michael', 'Bob', 'Tracy']
    ```

- **修改指定位置元素：**要把某个元素修改成别的值，可以直接给对应的索引位置赋值：

    ```python
    >>> classmates[1] = 'Sarah'
    >>> classmates
    ['Michael', 'Sarah', 'Tracy']
    ```

**注意：**

1. **list里面的元素的数据类型可以不同**，比如：

    ```python
    >>> L = ['Apple', 123, True]
    ```

2. **list元素也可以是另一个list**，比如：

    ```python
    >>> s = ['python', 'java', ['asp', 'php'], 'scheme']
    >>> len(s)
    4
    ```

3. **当一个list中含有list元素时，则它可以看成是一个二维数组**，比如：

    ```python
    >>> p = ['asp', 'php']
    >>> s = ['python', 'java', p, 'scheme']
    ```

    要拿到`'php'`可以写`p[1]`或者`s[2][1]`，与此类推，还有三维等多维数组。

4. **list的`copy()`方法为浅拷贝**，只复制list对象，不复制内部元素。若要完全复制，需要使用**`copy.deepcopy()`进行深拷贝**。



##### 2.3.2  tuple

> python中的另一种有序列表，与list非常类似，但是tuple的大小元素不可变，一旦初始化就不能修改。

- **初始化：**如下，classmates就是一个tuple：

    ```python
    >>> classmates = ('Michael', 'Bob', 'Tracy')
    ```

    现在，classmates这个tuple就**只可访问不可修改**，获取元素的方法与list是一致的。同时因为tuple不可变，所以代码更安全。如果可能，能用tuple代替list就尽量用tuple。

**注意：**

1. **定义tuple的时候，元素就必须被确定**，比如：

    ```python
    >>> t = (1, 2)
    >>> t
    (1, 2)
    ```

2. **定义一个空的tuple，可以写成`()**`，比如：

    ```python
    >>> t = ()
    >>> t
    ()
    ```

3. **定义只有1个元素的tuple时必须加一个逗号`,`，来消除歧义**，比如：

    ```Python
    >>> t = (1,)
    >>> t
    (1,)
    ```

    因为括号`()`既可以表示tuple，又可以表示数学公式中的小括号，因此，Python规定：只有1个元素的tuple定义时必须加一个逗号`,`

4. **“可变的”tuple**：tuple所谓的“不变”是说，tuple的每个元素，指向永远不变，但若元素是list，list本身是可变的。比如：

    ```python
    >>> t = ('a', 'b', ['A', 'B'])
    >>> t[2][0] = 'X'
    >>> t[2][1] = 'Y'
    >>> t
    ('a', 'b', ['X', 'Y'])
    ```



#### 2.4  条件语句

if语句的完整形式：

```python
if <条件判断1>:
    <执行1>
elif <条件判断2>:
    <执行2>
elif <条件判断3>:
    <执行3>
else:
    <执行4>
```

**注意：**

1. 冒号`:`和缩进都必须要有，冒号`:`代表下面缩进的语句为其子语句，缩进则代表代码块`{}`。

2. `if`语句是从上往下判断的，如果某个条件是`True`，则后面的条件都不会执行。

3. `if`语句还可以简写，比如写：

    ```python
    if x:
        print('True')
    ```

    只要`x`是非零数值、非空字符串、非空list等，就判断为`True`，否则为`False`。



#### 2.5  循环语句



##### 2.5.1  for...in循环

for...in循环，依次把list、tuple或者一个序列中的每个元素迭代出来，类似java中的forEach，比如：

```python
>>> # 打印正三角形
... rowsAndCols = int(input('请输入行列数：'))
... for i in range(rowsAndCols):
...     for j in range(rowsAndCols):
...         if i + j <= rowsAndCols - 2:
...             print(' ', end='')
...         else:
...             print('* ', end='')
...     print()
...     
请输入行列数：>? 3
  * 
 * * 
* * * 
```

Python还提供一个`range()`函数，可以生成一个整数序列，再通过`list()`函数可以转换为list。比如`range(5)`生成的序列是从0开始小于5的整数：

```python
>>> list(range(5))
[0, 1, 2, 3, 4]
```

**注意：** **rang(1,10)**表示1-9的整数数列，**range(0,10,2)**则表示0-9之间间隔为2的整数数列。比如：

```python
>>>for i in range(1,4,2):
...    print(i)
...    
1
3
```



##### 2.5.2  while循环

while循环，只要条件满足，就不断循环，条件不满足时才会退出循环。比如计算100以内所有奇数之和，使用while循环：

```python
>>> n = 1
... sum = 0
... while n < 100:
...     sum += n
...     n += 2
... print(sum)
2500
```



##### 2.5.3  break和continue

- **break**

    在循环中，`break`语句可以退出当前循环。

- **continue**

    在循环中，`continue`语句可以跳过当前的这次循环，直接开始下一次循环。

**注意：**在多层循环中，`break`和`continue`的作用域都是它所在的那一层，若它们在内层并不能改变外层的循环状态。



#### 2.6  dict和set



##### 2.6.1  dict

> Python内置了字典：dict的支持，dict全称dictionary，在其他语言中也称为map，使用键-值（key-value）存储，具有极快的查找速度。

- **初始化：**如下，d就是一个字典：

    ```python
    >>> d = {'Michael': 95, 'Bob': 75, 'Tracy': 85}
    >>> d
    {'Michael': 95, 'Bob': 75, 'Tracy': 85}
    ```

- **获取数据：**

    - 通过key直接获取数据：

        ```python
        >>> d['Bob']
        75
        ```

    - 通过**`get(key)`**方法也可以获取指定key对应的数据：

        ```python
        >>> d.get('Bob')
        75
        ```

    **注意：**如果key不存在，访问数据时dict就会报错，可以通过以下两种方法判断key是否存在：

    1. 通过`in`判断key是否存在：

        ```python
        >>> 'Thomas' in d
        False
        ```

    2. 通过`get(key)`方法的返回值判断，如果key不存在，该方法会返回`None`：

        ```python
        >>> d.get('Thomas')
        ```

        **注意：**返回`None`的时候Python的交互环境不显示任何结果。

        因此，Python支持`get(key)`指定返回值，若key存在，返回对应的value；若不存在，则返回指定值：

        ```python
        >>> d.get('Thomas', -1)
        -1
        ```

- **存放数据：**除了初始化时指定外，还可以通过key放入数据：

    ```python
    >>> d['Adam'] = 67
    >>> d['Adam']
    67
    ```

- **删除数据：** **`pop(key)`**方法会将指定key对应的数据从dict中删除：

    ```python
    >>> d.pop('Bob')
    75
    >>> d
    {'Michael': 95, 'Tracy': 85}
    ```

- **修改数据：**由于一个key只能对应一个value，所以，多次对一个key放入value，后面的值会将前面的值覆盖：

    ```python
    >>> d['Jack'] = 90
    >>> d['Jack']
    90
    >>> d['Jack'] = 88
    >>> d['Jack']
    88
    ```

- **dict的特点：**

    - 和list比较，dict有以下几个特点：

        1. **查找和插入的速度极快，不会随着key的增加而变慢；**
        2. **需要占用大量的内存**

        而list相反：

        1. 查找和插入的时间随着元素的增加而增加；
        2. 占用空间小，浪费内存很少。

        所以，**dict是用空间来换取时间**的一种方法。

    - dict的**key必须是常量**：

        因为dict根据key来计算value的存储位置，因此必须保证key的唯一性，这个通过key计算位置的算法称为哈希算法（Hash）。

        在Python中，字符串、整数等都是不可变的，因此，可以放心地作为key。而list是可变的，就不能作为key。



##### 2.6.2  set

> set和dict类似，也是一组key的集合，但不存储value。由于key不能重复，所以，set中没有重复的元素。



- **初始化：**

    - 1. 指定集合：

            ```python
            >>> s = {1, 2, 3, 4}
            >>> s
            {1, 2, 3, 4}
            ```

    - 2. 提供一个list作为输入集合：

            ```python
            >>> s = set([1, 2, 3, 4])
            >>> s
            {1, 2, 3, 4}
            ```

            **注意：**传入的参数`[1, 2, 3]`是一个list，而显示的`{1, 2, 3}`只是说明这个set内部有1，2，3这3个元素，不代表set是有序的。

- **添加元素：**`add(key)`方法可以添加元素到set中，可以重复添加，但同样会被覆盖：

    ```python
    >>> s.add(4)
    >>> s
    {1, 2, 3, 4}
    ```

- **删除元素：**`remove(key)`方法可以删除元素：

    ```python
    >>> s.remove(4)
    >>> s
    {1, 2, 3}
    ```

- **集合操作：**set可以看成数学意义上的无序和无重复元素的集合，因此，两个set可以做数学意义上的交集、并集等操作：

    ```python
    >>> s1 = set([1, 2, 3])
    >>> s2 = set([2, 3, 4])
    >>> s1 & s2
    {2, 3}
    >>> s1 | s2
    {1, 2, 3, 4}
    ```

**注意：**

- set和dict的唯一区别仅在于没有存储对应的value，所以，同样**只可存放常量**，因为无法判断两个可变对象是否相等，也就无法保证set内部“不会有重复元素”。
- 不变对象调用自身的任意方法，并不会改变本身。相反，这些方法会创建新的对象并返回，这样，就保证了不可变对象本身永远是不可变的。



------



### 3.  函数

函数名其实就是指向一个函数对象的引用，完全可以把函数名赋给一个变量，相当于给这个函数起了一个“别名”：

```python
>>> a = abs # 变量a指向abs函数
>>> a(-1) # 所以也可以通过a调用abs函数
1
```



#### 3.1  定义函数

在Python中，定义一个函数要使用`def`语句，依次写出函数名、括号、括号中的参数和冒号`:`，然后，在缩进块中编写函数体，函数的返回值用`return`语句返回。

以自定义一个求绝对值的`my_abs`函数为例：

```python
def my_abs(x):
    if x >= 0:
        return x
    else:
        return -x
```

**注意：** 

1.  函数体内执行到`return`时，函数就会执行完毕，并将结果返回；如果没有`return`语句，函数执行完毕后会返回`None`。`return None`可以简写为`return`。
2. 如果你已经把`my_abs()`的函数定义保存在`abstest.py`文件里，那么，可以在该文件的当前目录下启动Python解释器，用`from abstest import my_abs`来导入`my_abs()`函数，注意`abstest`是文件名（不含`.py`扩展名）。



##### 3.1.1  空函数

如果想定义一个什么事也不做的空函数，可以用`pass`语句：

```python
def nop():
    pass
```

`pass`可以用来作为占位符，比如现在还没想好怎么写函数的代码，就可以先放一个`pass`，让代码能运行起来。

`pass`还可以用在其他语句里，比如：

```python
if age >= 18:
    pass
```

缺少了`pass`，代码运行就会有语法错误。



##### 3.1.2  参数检查

**调用函数时，Python只会自动检查参数个数，并不会自动检查参数类型**。因此，通常需要定义函数时使用内置函数`isinstance()`进行数据类型检查：

```python
def my_abs(x):
    if not isinstance(x, (int, float)):
        raise TypeError('bad operand type')  #抛出异常
    if x >= 0:
        return x
    else:
        return -x
```



##### 3.1.3  多个返回值

**Python中，可以通过返回一个`tuple`实现类似多个返回值**。语法上，返回一个tuple可以省略括号，而多个变量可以同时接收一个tuple，按位置赋给对应的值：

```python
import math

def move(x, y, step, angle=0):
    nx = x + step * math.cos(angle)
    ny = y - step * math.sin(angle)
    return nx, ny
    
 x, y = move(100, 100, 60, math.pi / 6)
```



#### 3.2  函数的参数



##### 3.2.1  位置参数

先定义一个计算x^n^的函数：

```python
def power(x, n):
    return x ** n
```

对于`power(x, n)`函数，参数`x`和`n`都是位置参数，调用函数时，传入的两个值会按照位置顺序依次赋给参数`x`和`n`。



##### 3.2.2  默认参数

由于我们经常计算x^2^，所以，完全可以把第二个参数n的默认值设定为2：

```python
def power(x, n=2):
    return x ** n
```

这样，当我们调用`power(5)`时，相当于调用`power(5, 2)`。

**注意：**

1. 必选参数在前，默认参数在后，否则Python的解释器会报错；

2. 当函数有多个参数时，把经常改变的参数放前面，很少改变的参数放后面。很少改变的参数就可以作为默认参数。

3. 有多个默认参数时，调用的时候，既可以按顺序提供部分默认参数，也可以不按顺序提供部分默认参数。**当不按顺序提供部分默认参数时，需要把参数名写上并赋值，其他默认参数仍继续使用默认值。**

4.  定义默认参数要牢记一点：**默认参数必须指向不变对象！**，否则，使用默认参数多次调用时并不会返回预期的结果，如：

    ```python
    def add_end(L=[]):
        L.append('END')
        return L
    ```

    一开始调用`add_end()`是对的：

    ```python
    >>> add_end()
    ['END']
    ```

    但是，再次调用`add_end()`时，结果就不对了：

    ```python
    >>> add_end()
    ['END', 'END']
    >>> add_end()
    ['END', 'END', 'END']
    ```

    这是因为Python函数在定义的时候，默认参数`L`就已经指向了对象`[]`，每次调用`add_end()`后`L`指向的`[]`内容就会改变，所以返回的内容也会变化。

**优点：**默认参数降低了函数调用的难度，而一旦需要更复杂的调用时，又可以传递更多的参数来实现。无论是简单调用还是复杂调用，函数只需要定义一个。



##### 3.2.3  可变参数

顾名思义，**可变参数就是传入的参数个数是可变的，可以是任意个**。



以数学题为例子，给定一组数字a，b，c……，请计算a^2^ + b^2^ + c^2^ + ……。

- **参数为list或tuple**

    由于参数个数不确定，我们首先想到可以把a，b，c……作为一个list或tuple传进来，这样，函数可以定义如下：

    ```python
    def calc(numbers):
        sum = 0
        for n in numbers:
            sum = sum + n ** 2
        return sum
    ```

    调用的时候，必须传入一个list或tuple：`calc([1, 2, 3])`

- **定义可变参数**

    与定义一个list或tuple参数相比，仅仅在参数前面加了一个**`*`**号。在函数内部，可变参数接收到的是一个tuple：

    ```python
    def calc(*numbers):
        sum = 0
        for n in numbers:
            sum = sum + n * n
        return sum
    ```

    调用该函数时，可以传入任意个参数，包括0个参数。

**注意：**如果已经有一个`list`或者`tuple`，Python允许你在`list`或`tuple`前面加一个**`*`**号，把`list`或`tuple`的元素变成可变参数传进去：

```python
>>> nums = [1, 2, 3]
>>> calc(*nums)
14
```



##### 3.2.4  关键字参数

​    可变参数允许你传入0个或任意个参数，这些可变参数在函数调用时自动组装为一个`tuple`。**而关键字参数允许你传入0个或任意个含参数名的参数，这些关键字参数在函数内部自动组装为一个`dict`**。比如：

```python
def person(name, age, **kw):
    print('name:', name, 'age:', age, 'other:', kw
```

函数`person`除了必选参数`name`和`age`外，还接受关键字参数`kw`。在调用该函数时，可以只传入必选参数，也可以传入任意个数的关键字参数：

```Python
>>> person('Bob', 35, city='Beijing')
name: Bob age: 35 other: {'city': 'Beijing'}
>>> person('Adam', 45, gender='M', job='Engineer')
name: Adam age: 45 other: {'gender': 'M', 'job': 'Engineer'}
```

**关键字函数可以扩展函数的功能**。比如，在`person`函数里，我们保证能接收到`name`和`age`这两个参数，但是，如果调用者愿意提供更多的参数，我们也能收到。

**注意：**如果已经有一个`dict`，Python允许你在`dict`前面加两个**`*`**号，把`dict`所有的key-value变成关键字参数传进去：

```python
>>> extra = {'city': 'Beijing', 'job': 'Engineer'}
>>> person('Jack', 24, **extra)
name: Jack age: 24 other: {'city': 'Beijing', 'job': 'Engineer'}
```

其中`kw`获得的`dict`是`extra`的一份**拷贝**，对`kw`的改动不会影响到函数外的`extra`。



##### 3.2.5  命名关键字参数

**命名关键字参数是用来限制调用者可以传入的参数名。**



对于关键字参数，函数的调用者可以传入任意不受限制的关键字参数。至于到底传入了哪些，就需要在函数内部通过`kw`检查。

仍以`person()`函数为例，我们希望检查是否有`city`和`job`参数：

```python
def person(name, age, **kw):
    if 'city' in kw:
        # 有city参数
        pass
    if 'job' in kw:
        # 有job参数
        pass
    print('name:', name, 'age:', age, 'other:', kw)
```

但是调用者仍可以传入不受限制的关键字参数：

```python
>>> person('Jack', 24, city='Beijing', addr='Chaoyang', zipcode=123456)
```

如果要限制关键字参数的名字，就可以用命名关键字参数。



- **命名关键字参数需要一个特殊分隔符`*`，`*`后面的参数被视为命名关键字参数。**

    例如，只接收`city`和`job`作为关键字参数。这种方式定义的函数如下：

    ```python
    def person(name, age, *, city, job):
        print(name, age, city, job)
    ```

    调用方式如下：

    ```python
    >>> person('Jack', 24, city='Beijing', job='Engineer')
    Jack 24 Beijing Engineer
    ```

-  **如果函数定义中已经有了一个可变参数，后面跟着的命名关键字参数就不再需要一个特殊分隔符`*`了：**

    ```python
      def person(name, age, *args, city, job):
          print(name, age, args, city, job)
    ```

- **命名关键字参数调用时必须传入正确的参数名，如果没有传入参数名Python解释器会把它视为位置参数。**

- **命名关键字参数可以有缺省值，从而简化调用：**

    ```python
    def person(name, age, *, city='Beijing', job):
        print(name, age, city, job)
    ```

    由于命名关键字参数`city`具有默认值，调用时，可不传入`city`参数：

    ```python
    >>> person('Jack', 24, job='Engineer')
    Jack 24 Beijing Engineer
    ```



##### 3.2.6  参数组合

在Python中定义函数，可以用必选参数、默认参数、可变参数、关键字参数和命名关键字参数，这5种参数都可以组合使用。但是请注意，**参数定义的顺序必须是：必选参数、默认参数、可变参数、命名关键字参数和关键字参数。**

比如定义一个函数，包含上述若干种参数：

```python
def f1(a, b, c=0, *args, **kw):
    print('a =', a, 'b =', b, 'c =', c, 'args =', args, 'kw =', kw)

def f2(a, b, c=0, *, d, **kw):
    print('a =', a, 'b =', b, 'c =', c, 'd =', d, 'kw =', kw)
```

在函数调用的时候，Python解释器自动按照参数位置和参数名把对应的参数传进去：

```python
>>> f1(1, 2, 3, 'a', 'b', x=99)
a = 1 b = 2 c = 3 args = ('a', 'b') kw = {'x': 99}

>>> f2(1, 2, d=99, ext=None)
a = 1 b = 2 c = 0 d = 99 kw = {'ext': None}
```

最神奇的是通过一个`tuple`和`dict`，你也可以调用上述函数：

```python
>>> args = (1, 2, 3, 4)
>>> kw = {'d': 99, 'x': '#'}
>>> f1(*args, **kw)
a = 1 b = 2 c = 3 args = (4,) kw = {'d': 99, 'x': '#'}

>>> args = (1, 2, 3)
>>> kw = {'d': 88, 'x': '#'}
>>> f2(*args, **kw)
a = 1 b = 2 c = 3 d = 88 kw = {'x': '#'}
```

所以，**对于任意函数，都可以通过类似func(*args,** ** **kw)的形式调用它，无论它的参数是如何定义的。**

**注意：**虽然可以组合多达5种参数，但不要同时使用太多的组合，否则函数接口的可理解性很差。



##### 小结：

- Python的函数具有非常灵活的参数形态，既可以实现简单的调用，又可以传入非常复杂的参数。

- 默认参数一定要用不可变对象，如果是可变对象，程序运行时会有逻辑错误！

- 定义可变参数和关键字参数的语法：

    - `*args`是可变参数，`args`接收的是一个`tuple`；

    - `**kw`是关键字参数，`kw`接收的是一个`dict`。

- 调用函数时传入可变参数和关键字参数的语法：

    - 可变参数既可以直接传入：`func(1, 2, 3)`，又可以先组装`list`或`tuple`，再通过`*args`传入：`func(*(1, 2, 3))`；

    - 关键字参数既可以直接传入：`func(a=1, b=2)`，又可以先组装`dict`，再通过`**kw`传入：`func(**{'a': 1, 'b': 2})`。

       使用`*args`和`**kw`是Python的习惯写法，当然也可以用其他参数名，但最好使用习惯用法。

- 命名关键字参数是为了限制调用者可以传入的参数名，同时可以提供默认值。

- 定义命名关键字参数在没有可变参数的情况下不要忘了写分隔符**`*`**，否则定义的将是位置参数。

- 参数可以任意组合，但参数定义的顺序必须是：必选参数、默认参数、可变参数、命名关键字参数和关键字参数。



#### 3.3  递归函数

在函数内部，可以调用其他函数。如果一个函数在内部调用自身本身，这个函数就是递归函数。



如阶乘`n! = 1 x 2 x 3 x ... x n`就可以使用递归实现，用函数`fact(n)`表示：

```python
def fact(n):
    if n==1:
        return 1
    return n * fact(n - 1)
```

递归函数的优点是定义简单，逻辑清晰。理论上，所有的递归函数都可以写成循环的方式，但循环的逻辑不如递归清晰。

**使用递归函数需要注意防止栈溢出**。在计算机中，函数调用是通过栈（stack）这种数据结构实现的，每当一个函数调用，栈就会加一层栈帧（入栈），每当函数返回，栈就会减一层栈帧（出栈）。由于栈的大小不是无限的，所以，递归调用的次数过多，会导致栈溢出。比如`fact(1000)`：

```python
>>> fact(1000)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "<stdin>", line 4, in fact
  ...
  File "<stdin>", line 4, in fact
RuntimeError: maximum recursion depth exceeded in comparison
```

解决递归调用栈溢出的方法是通过**尾递归**优化，事实上尾递归和循环的效果是一样的，所以，把循环看成是一种特殊的尾递归函数也是可以的。

> **尾递归：在函数返回的时候，调用自身本身，并且return语句不能包含表达式。**这样，编译器或者解释器就可以把尾递归做优化，使递归本身无论调用多少次，都只占用一个栈帧，不会出现栈溢出的情况。

如将`fact(n)`函数改为尾递归：

```python
def fact(n):
    return fact_iter(n, 1)
												#循环实现
def fact_iter(num, product):					#while (num > 1):
    if num == 1:								#    product *= num
        return product							#    num -= 1
    return fact_iter(num - 1, num * product)	#return product
```

尾递归调用时，如果做了优化，栈不会增长，因此，无论多少次调用也不会导致栈溢出。

遗憾的是，大多数编程语言没有针对尾递归做优化，Python解释器也没有做优化，所以，即使把上面的`fact(n)`函数改成尾递归方式，也会导致栈溢出。



##### 小结：

- 使用递归函数的优点是逻辑简单清晰，缺点是过深的调用会导致栈溢出。
- 针对尾递归优化的语言可以通过尾递归防止栈溢出。尾递归事实上和循环是等价的，没有循环语句的编程语言只能通过尾递归实现循环。
- **Python标准的解释器没有针对尾递归做优化，任何递归函数都存在栈溢出的问题。**



------



### 4.  高级特性



#### 4.1  切片

**对于经常取指定索引范围的操作，用循环十分繁琐，因此，Python提供了切片（Slice）操作符，能大大简化这种操作。**



比如，一个list如下：

```python
>>> L = ['Michael', 'Sarah', 'Tracy', 'Bob', 'Jack']
```

取它的前3个元素，使用切片操作如下：

```python
>>> L[0:3]
['Michael', 'Sarah', 'Tracy']
```

**`[0:3]`表示，从索引`0`开始取，直到索引`3`为止，但不包括索引`3`**。即索引`0`，`1`，`2`，正好是3个元素。

如果第一个索引是`0`，还可以省略：

```python
>>> L[:3]
['Michael', 'Sarah', 'Tracy']
```

类似的，既然Python支持`L[-1]`取倒数第一个元素，那么它同样**支持倒数切片**，试试：

```python
>>> L[-2:]
['Bob', 'Jack']
>>> L[-2:-1]
['Bob']
```

切片操作十分有用。我们先创建一个0-10的数列：

```python
>>> L = list(range(10))
>>> L
[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
```

可以前5个数，每两个取一个：

```python
>>> L[:5:2]
[0, 2, 4]
```

所有数，每3个取一个：

```python
>>> L[::3]
[0, 3, 6, 9]
```

甚至可以倒着取数：

```Python
>>> L[::-1]
[9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
```

使用`[::-1]`就能实现倒着取数，后面的筛选条件不表示范围，只表示间隔，正数表示从前往后，负数表示从后往前，如：**`[::2]`表示从前往后每隔2个取数，`[::-2]`表示从后往前每隔2个取数**

**只写`[:]`可以原样复制一个list（浅拷贝）：**

```python
>>> L[:]
[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
```

tuple也是一种list，唯一区别是tuple不可变。因此，**tuple也可以用切片操作**，只是操作的结果仍是tuple：

```python
>>> (0, 1, 2, 3, 4, 5)[:3]
(0, 1, 2)
```

字符串`'xxx'`也可以看成是一种list，每个元素就是一个字符。因此，**字符串也可以用切片操作**，只是操作结果仍是字符串：

```python
>>> 'ABCDEFG'[:3]
'ABC'
>>> 'ABCDEFG'[::2]
'ACEG'
```



#### 4.2  迭代

**如果给定一个list或tuple，我们可以通过`for`循环来遍历这个list或tuple，这种遍历我们称为迭代（Iteration）。**



在Python中，只要是可迭代对象，无论有无下标，都可以迭代，比如`dict`就可以迭代：

```python
>>> d = {'a': 1, 'b': 2, 'c': 3}
>>> for key in d:
...     print(key)
...
a
c
b
```

**默认情况下，`dict`迭代的是key。如果要迭代value，可以用`for value in d.values()`，如果要同时迭代key和value，可以用`for k, v in d.items()`**。

由于字符串也是可迭代对象，因此，也可以作用于`for`循环：

```python
>>> for ch in 'ABC':
...     print(ch)
...
A
B
C
```

**通过collections模块的`Iterable`类型就可以判断一个对象是否为可迭代对象：**

```python
>>> from collections import Iterable
>>> isinstance('abc', Iterable) # str是否可迭代
True
>>> isinstance([1,2,3], Iterable) # list是否可迭代
True
>>> isinstance(123, Iterable) # 整数是否可迭代
False
```

如果要对list实现类似Java那样的下标循环，Python内置的**`enumerate`函数就可以把一个list变成索引-元素对**，这样在`for`循环中就会同时迭代索引和元素本身：

```python
>>> for i, value in enumerate(['A', 'B', 'C']):
...     print(i, value)
...
0 A
1 B
2 C
```

上面的`for`循环里，同时引用了两个变量，在Python里是很常见的，比如下面的代码：

```python
>>> for x, y in [(1, 1), (2, 4), (3, 9)]:
...     print(x, y)
...
1 1
2 4
3 9
```



#### 4.3  列表生成式

列表生成式即List Comprehensions，是Python内置的非常简单却强大的可以用来创建list的生成式。



比如，要生成list `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`可以用`list(range(1, 11))`：

```python
>>> list(range(1, 11))
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

但如果要生成`[1x1, 2x2, 3x3, ..., 10x10]`时，就可以使用列表生成式：

```python
>>> [x * x for x in range(1, 11)]
[1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
```

**写列表生成式时，把要生成的元素的操作放到前面，后面跟`for`循环**，就可以把list创建出来，十分有用。

**for循环后面还可以加上if判断**，这样我们就可以筛选出仅偶数的平方：

```python
>>> [x * x for x in range(1, 11) if x % 2 == 0]
[4, 16, 36, 64, 100]
```

**还可以使用两层循环，可以生成全排列：**

```python
>>> [m + n for m in 'ABC' for n in 'XYZ']
['AX', 'AY', 'AZ', 'BX', 'BY', 'BZ', 'CX', 'CY', 'CZ']
```

三层和三层以上的循环就很少用到了。

**列表生成式也可以使用两个变量来生成list：**比如`dict`的key和value：

```python
>>> d = {'x': 'A', 'y': 'B', 'z': 'C' }
>>> [k + '=' + v for k, v in d.items()]
['y=B', 'x=A', 'z=C']
```



#### 4.4  生成器

如果列表的元素可以按照某种算法在循环的过程中推算出来，就可以不用创建完整的list，从而节省大量的空间。这种**一边循环一边计算的机制，在Python中称为生成器：generator**。

**generator的工作原理：**它是在`for`循环的过程中不断计算出下一个元素，并在适当的条件结束`for`循环。对于函数改成的generator来说，遇到`return`语句或者执行到函数体最后一行语句，就是结束generator的指令，`for`循环随之结束。



##### 4.4.1  创建generator的方法：

- **把一个列表生成式的`[]`改成`()`，就创建了一个generator：**

    ```python
    >>> L = [x * x for x in range(10)]
    >>> L
    [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
    >>> g = (x * x for x in range(10))
    >>> g
    <generator object <genexpr> at 0x1022ef630>
    ```

    创建`L`和`g`的区别仅在于最外层的`[]`和`()`，`L`是一个list，而`g`是一个generator。

- 如果推算的算法比较复杂，用类似列表生成式的`for`循环无法实现的时候，还可以用函数来实现。

    比如，著名的斐波拉契数列（Fibonacci），除第一个和第二个数外，任意一个数都可由前两个数相加得到：

    ```python
    def fib(max):
        n, a, b = 0, 0, 1
        while n < max:
            print(b)
            a, b = b, a + b
            n = n + 1
        return 'done'
    ```

    *注意*，赋值语句：

    ```python
    a, b = b, a + b
    ```

    相当于：

    ```python
    t = (b, a + b) # t是一个tuple
    a = t[0]
    b = t[1]
    ```

    但不必显式写出临时变量t就可以赋值。

    上面的函数可以输出斐波那契数列的前N个数：

    ```python
    >>> fib(6)
    1
    1
    2
    3
    5
    8
    'done'
    ```

    `fib`函数实际上是定义了斐波拉契数列的推算规则，可以从第一个元素开始，推算出后续任意的元素，这种逻辑其实非常类似generator。

    也就是说，上面的函数和generator仅一步之遥。要把`fib`函数变成generator，只需要把`print(b)`改为`yield b`就可以了：

    ```python
    def fib(max):
        n, a, b = 0, 0, 1
        while n < max:
            yield b         #b就是generator的计算值，会被返回
            a, b = b, a + b
            n = n + 1
        return 'done'
    ```

    这就是定义generator的另一种方法。**如果一个函数定义中包含`yield`关键字，那么这个函数就不再是一个普通函数，而是一个generator：**

    ```python
    >>> f = fib(6)
    >>> f
    <generator object fib at 0x104feaaa0>
    ```

    这里，最难理解的就是generator和函数的执行流程不一样。函数是顺序执行，遇到`return`语句或者最后一行函数语句就返回。而**变成generator的函数，在每次调用`next()`的时候执行，遇到`yield`语句返回，再次执行时从上次返回的`yield`语句处继续执行。**



##### 4.4.2  获取generator的元素：

- **可以使用迭代获取generator的元素：**

    ```python
    >>> g = (x * x for x in range(4))
    >>> for n in g:
    ...     print(n)
    ... 
    0
    1
    4
    9
    16
    ```

- 还可以不断地调用**`next(g)`**，计算`g`的下一个元素的值，直到没有更多的元素时，抛出`StopIteration`的错误。

**注意：**

- **用`for`循环调用generator时，无法拿到generator的`return`语句的返回值。如果想要拿到返回值，必须捕获`StopIteration`错误，返回值包含在`StopIteration`的`value`中：**

    ```python
    >>> g = fib(6)
    >>> while True:
    ...     try:
    ...         x = next(g)
    ...         print('g:', x)
    ...     except StopIteration as e:
    ...         print('Generator return value:', e.value)
    ...         break
    ...
    g: 1
    g: 1
    g: 2
    g: 3
    g: 5
    g: 8
    Generator return value: done
    ```


#### 4.5  迭代器

可以直接作用于`for`循环的对象统称为**可迭代对象：`Iterable`**。主要有下面两类：

1. 集合数据类型：如`list`、`tuple`、`dict`、`set`、`str`等；
2. `generator`：包括生成器和带`yield`的generator function。

可以使用**`isinstance()`**判断一个对象是否是`Iterable`对象：

```python
>>> from collections import Iterable
>>> isinstance([], Iterable)
True
>>> isinstance({}, Iterable)
True
>>> isinstance('abc', Iterable)
True
>>> isinstance((x for x in range(10)), Iterable)
True
>>> isinstance(100, Iterable)
False
```

而可以被`next()`函数调用并不断返回下一个值的对象称为**迭代器：`Iterator`**。

同样也可以使用**`isinstance()`**判断一个对象是否是`Iterator`对象：

```python
>>> from collections import Iterator
>>> isinstance((x for x in range(10)), Iterator)
True
>>> isinstance([], Iterator)
False
>>> isinstance({}, Iterator)
False
>>> isinstance('abc', Iterator)
False
```

把`list`、`dict`、`str`等**`Iterable`变成`Iterator`可以使用`iter()`函数：**

```python
>>> isinstance(iter([]), Iterator)
True
>>> isinstance(iter('abc'), Iterator)
True
```

**注意：**

​	**Python的`Iterator`对象表示的是一个不限大小数据流**，Iterator对象可以被`next()`函数调用并不断返回下一个数据，直到没有数据时抛出`StopIteration`错误。甚至可以表示一个无限大的数据流，例如全体自然数。



##### 小结：

- 凡是可作用于`for`循环的对象都是`Iterable`类型；

- 凡是可作用于`next()`函数的对象都是`Iterator`类型，它们表示一个惰性计算的序列；

- 集合数据类型如`list`、`dict`、`str`等是`Iterable`但不是`Iterator`，不过可以通过`iter()`函数获得一个`Iterator`对象。

- Python的**`for`循环本质上就是使用迭代器`Iterator`实现的**，例如：

    ```python
    for x in [1, 2, 3, 4, 5]:
        pass
    ```

    实际上完全等价于：

    ```python
    # 首先获得Iterator对象:
    it = iter([1, 2, 3, 4, 5])
    # 循环:
    while True:
        try:
            # 获得下一个值:
            x = next(it)
        except StopIteration:
            # 遇到StopIteration就退出循环
            break
    ```



------



### 5.  函数式编程

> 在编程语言中，就是越低级的语言，越贴近计算机，抽象程度低，执行效率高，比如C语言；越高级的语言，越贴近计算，抽象程度高，执行效率低，比如Lisp语言。
>
> **函数式编程就是一种抽象程度很高的编程范式，纯粹的函数式编程语言编写的函数没有变量，因此，任意一个函数，只要输入是确定的，输出就是确定的，这种纯函数我们称之为没有副作用。**而允许使用变量的程序设计语言，由于函数内部的变量状态不确定，同样的输入，可能得到不同的输出，因此，这种函数是有副作用的。
>
> **函数式编程的一个特点就是，允许把函数本身作为参数传入另一个函数，还允许返回一个函数！**
>
> Python对函数式编程提供部分支持。由于Python允许使用变量，因此，**Python不是纯函数式编程语言。**



#### 5.1  高阶函数

**把函数作为参数传入，这样的函数称为高阶函数，函数式编程就是指这种高度抽象的编程范式。**



- **变量可以指向函数：**

    如果一个变量指向了一个函数本身，那么，可否通过该变量来调用这个函数？用代码验证一下：

    ```python
    >>> f = abs
    >>> f(-10)
    10
    ```

    成功！说明变量`f`现在已经指向了`abs`函数本身。直接调用`abs()`函数和调用变量`f()`完全相同。

- **函数名也是变量：**

    函数名其实就是指向函数的变量！对于`abs()`这个函数，完全可以把函数名`abs`看成变量，它指向一个可以计算绝对值的函数！

    如果把`abs`指向其他对象，会有什么情况发生？

    ```python
    >>> abs = 10
    >>> abs(-10)
    Traceback (most recent call last):
      File "<stdin>", line 1, in <module>
    TypeError: 'int' object is not callable
    ```

    把`abs`指向`10`后，就无法通过`abs(-10)`调用该函数了！因为`abs`这个变量已经不指向求绝对值函数而是指向一个整数`10`！

- **传入函数：**

    既然变量可以指向函数，函数的参数能接收变量，那么一个函数就可以接收另一个函数作为参数，这种函数就称之为高阶函数。

    一个最简单的高阶函数：

    ```python
    def add(x, y, f):
        return f(x) + f(y)
    ```

    当我们调用`add(-5, 6, abs)`时，参数`x`，`y`和`f`分别接收`-5`，`6`和`abs`，根据函数定义，我们可以推导计算过程为：

    ```python
    x = -5
    y = 6
    f = abs
    f(x) + f(y) ==> abs(-5) + abs(6) ==> 11
    return 11
    ```



##### 5.1.1  map——映射

`map()`函数接收两个参数，一个是函数，一个是`Iterable`，**`map`将传入的函数依次作用到序列的每个元素，并把结果作为新的`Iterator`返回。**

比如我们有一个函数f(x)=x^2^，要把这个函数作用在一个list `[1, 2, 3, 4, 5, 6, 7, 8, 9]`上，就可以用`map()`实现如下：

```python
>>> def f(x):
...     return x ** 2
...
>>> r = map(f, [1, 2, 3, 4, 5, 6, 7, 8, 9])
>>> list(r)
[1, 4, 9, 16, 25, 36, 49, 64, 81]
```

`map()`传入的第一个参数是`f`，即函数对象本身。由于结果`r`是一个`Iterator`，**`Iterator`是惰性序列，因此通过`list()`函数让它把整个序列都计算出来并返回一个list**。

`map()`作为高阶函数，还可以计算任意复杂的函数，比如，把这个list所有数字转为字符串：

```python
>>> list(map(str, [1, 2, 3, 4, 5, 6, 7, 8, 9]))
['1', '2', '3', '4', '5', '6', '7', '8', '9']
```



##### 5.1.2  reduce——累加器

**`reduce`把一个函数作用在一个序列`[x1, x2, x3, ...]`上，这个函数必须接收两个参数，`reduce`把这个函数的返回结果再继续和序列的下一个元素做累积（非累乘）计算，**其效果就是：

```python
reduce(f, [x1, x2, x3, x4]) = f(f(f(x1, x2), x3), x4)
```

比方说对一个序列求和，就可以用`reduce`实现：

```python
>>> from functools import reduce
>>> def add(x, y):
...     return x + y
...
>>> reduce(add, [1, 3, 5, 7, 9])
25
```

配合`map()`，还可以写出把`str`转换为`int`的函数：

```python
from functools import reduce

DIGITS = {'0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9}

def str2int(s):
    def fn(x, y):
        return x * 10 + y
    def char2num(s):
        return DIGITS[s]
    return reduce(fn, map(char2num, s))
```

还可以用lambda函数进一步简化成：

```python
from functools import reduce

DIGITS = {'0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9}

def char2num(s):
    return DIGITS[s]

def str2int(s):
    return reduce(lambda x, y: x * 10 + y, map(char2num, s))
```



##### 5.1.3  filter——过滤器

Python内建的**`filter()`函数用于过滤序列**。`filter()`也接收一个函数和一个序列。它把传入的函数依次作用于每个元素，然后根据返回值是`True`还是`False`决定保留还是丢弃该元素。



例如，在一个list中，删掉偶数，只保留奇数，可以这么写：

```python
def is_odd(n):
    return n % 2 == 1

list(filter(is_odd, [1, 2, 4, 5, 6, 9, 10, 15]))
# 结果: [1, 5, 9, 15]
```

把一个序列中的空字符串删掉，可以这么写：

```python
def not_empty(s):
    return s and s.strip()

list(filter(not_empty, ['A', '', 'B', None, 'C', '  ']))
# 结果: ['A', 'B', 'C']
```

可见**用`filter()`这个高阶函数，关键在于正确实现一个“筛选”函数。**

注意到**`filter()`函数返回的是一个`Iterator`，也就是一个惰性序列**，所以要强迫`filter()`完成计算结果，需要用`list()`函数获得所有结果并返回list。



##### 5.1.4  sorted——排序

Python内置的`sorted()`函数就可以对list进行排序：

```python
>>> sorted([36, 5, -12, 9, -21])
[-21, -12, 5, 9, 36]
```

此外，`sorted()`函数也是一个高阶函数，它还可以接收一个`key`函数来实现自定义的排序，例如按绝对值大小排序：

```python
>>> sorted([36, 5, -12, 9, -21], key=abs)
[5, 9, -12, -21, 36]
```

**`sorted`会将key指定的函数映射在list的每一个元素上，并根据key函数返回的结果进行排序，再根据排序结果将对应的list元素进行排序。**

再看一个字符串排序的例子：

```python
>>> sorted(['bob', 'about', 'Zoo', 'Credit'])
['Credit', 'Zoo', 'about', 'bob']
```

**默认情况下，`sorted()`对字符串排序，是按照ASCII的大小比较的，**由于`'Z' < 'a'`，结果，大写字母`Z`会排在小写字母`a`的前面。

如果我们能用一个key函数把字符串映射为大写或者小写，再给`sorted`传入这个key函数，这样即可实现忽略大小写的排序：

```python
>>> sorted(['bob', 'about', 'Zoo', 'Credit'], key=str.lower)
['about', 'bob', 'Credit', 'Zoo']
```

还可以传入第三个参数**`reverse=True`进行反向排序**：

```python
>>> sorted(['bob', 'about', 'Zoo', 'Credit'], key=str.lower, reverse=True)
['Zoo', 'Credit', 'bob', 'about']
```



#### 5.2  返回函数



##### 5.2.1  函数作为返回值

高阶函数除了可以接受函数作为参数外，还可以把函数作为结果值返回。



通常情况下，实现一个可变参数的求和，是这样定义的：

```python
def calc_sum(*args):
    ax = 0
    for n in args:
        ax = ax + n
    return ax
```

但是，如果不需要立刻求和，而是在后面的代码中，根据需要再计算怎么办？可以不返回求和的结果，而是返回求和的函数：

```python
def lazy_sum(*args):
    def sum():
        ax = 0
        for n in args:
            ax = ax + n
        return ax
    return sum
```

当我们调用`lazy_sum()`时，返回的并不是求和结果，而是求和函数：

```python
>>> f = lazy_sum(1, 3, 5, 7, 9)
>>> f
<function lazy_sum.<locals>.sum at 0x101c6ed90>
```

调用函数`f`时，才真正计算求和的结果：

```python
>>> f()
25
```

**注意：**

​	当我们调用`lazy_sum()`时，每次调用都会返回一个新的函数，即使传入相同的参数，也互不影响。



##### 5.2.2  闭包

**当一个函数返回一个函数后，其参数或局部变量还被返回的函数所引用**，这种结构就称为闭包。



而且返回的函数并没有立刻执行，而是直到调用了`f()`才执行。我们来看一个例子：

```python
def count():
    fs = []
    for i in range(1, 4):
        def f():
             return i*i
        fs.append(f)
    return fs

f1, f2, f3 = count()  #count()返回值是list，并且有三个元素
```

你可能认为调用`f1()`，`f2()`和`f3()`结果应该是`1`，`4`，`9`，但实际结果是：

```python
>>> f1()
9
>>> f2()
9
>>> f3()
9
```

全部都是`9`！因为`f()`调用时才执行的，而此时变量`i`的值已经变为3。

 因此，**返回闭包时牢记一点：返回函数不要引用任何循环变量，或者本身会发生变化的局部变量。**

**闭包中如果一定要引用循环变量，就需要再创建一个函数，用该函数的参数绑定循环变量当前的值，无论该循环变量后续如何更改，已绑定到函数参数的值不变：**

```python
def count():
    def f(j):
        def g():
            return j*j
        return g
    fs = []
    for i in range(1, 4):
        fs.append(f(i)) # f(i)立刻被执行，因此i的当前值被传入f()
    return fs
```

因此，从以上可以看出：

​	**返回一个函数`f`它并不是马上执行，而仅仅只是返回一个函数对象，此时并不能确定它的返回值，只有使用`f()`调用它时才能确定`f`内的变量的值以及它的返回值。**



#### 5.3  匿名函数

在Python中，对匿名函数提供了有限支持。**关键字`lambda`表示匿名函数，格式为：`lambda  参数 : 返回值`**

- **匿名函数有个限制，就是返回值必须一个表达式可以表示**，不用写`return`，返回值就是该表达式的结果。

- **匿名函数也是一个函数对象**，也可以把匿名函数赋值给一个变量，再利用变量来调用该函数：

    ```python
    >>> f = lambda x: x * x
    >>> f
    <function <lambda> at 0x101c6ef28>
    >>> f(5)
    25
    ```

- **匿名函数也可以作为返回值返回**，比如：

    ```python
    def build(x, y):
        return lambda: x * x + y * y
    ```



#### 5.4  装饰器

函数对象有一个`__name__`属性，可以拿到函数的名字：

```python
>>> def now():
...     print('2015-3-25')
...
>>> f = now
>>> now.__name__
'now'
>>> f.__name__
'now'
```

假设我们要增强`now()`函数的功能，比如，在函数调用前后自动打印日志，但又不希望修改`now()`函数的定义，这种**在代码运行期间动态增加功能的方式，称之为“装饰器”（Decorator）。**



- **无参装饰器**

    本质上，decorator就是一个返回函数的高阶函数。所以，我们要定义一个能打印日志的decorator，可以定义如下：

    ```python
    def log(func):
        def wrapper(*args, **kw):
            print('call %s():' % func.__name__)
            return func(*args, **kw)
        return wrapper
    ```

    观察上面的`log`，因为它是一个decorator，所以接受一个函数作为参数，并返回一个函数，这里的wrapper就是装饰者。我们要**借助Python的@语法，把decorator置于函数的定义处**：

    ```python
    @log
    def now():
        print('2015-3-25')
    ```

    调用`now()`函数，不仅会运行`now()`函数本身，还会在运行`now()`函数前打印一行日志：

    ```python
    >>> now()
    call now():
    2015-3-25
    ```

    **注意：**

    1. **把`@log`放到`now()`函数的定义处，相当于执行了`now = log(now)`。**
    2. **原来的`now()`函数仍然存在，只是现在同名的`now`变量指向了新的函数，于是调用`now()`将执行新函数（即wrapper）**。
    3. **若`wrapper()`函数的参数定义是**`(*args, **kw)`，**`func()`函数调用时传入的参数就必须为**`(*args, **kw)`，只有这样才能把`wrapper()`传入的参数转化为`func()`可用的参数。
        - `*args`和`**kw`代表着可变参数与关键字参数，若直接使用得到的将是`tuple`与`dict`，在`tuple`前加上`*`就又变为可变参数，`dict`也是如此。



- **带参装饰器**

    如果decorator本身需要传入参数，那就需要编写一个返回decorator的高阶函数，写出来会更复杂。比如，要自定义log的文本：

    ```python
    def log(text):
        def decorator(func):
            def wrapper(*args, **kw):
                print('%s %s():' % (text, func.__name__))
                return func(*args, **kw)
            return wrapper
        return decorator
    ```

    这个3层嵌套的decorator用法如下：

    ```python
    @log('execute')
    def now():
        print('2015-3-25')
    ```

    执行结果如下：

    ```python
    >>> now()
    execute now():
    2015-3-25
    ```

    和两层嵌套的decorator相比，3层嵌套的效果是这样的：

    ```python
    >>> now = log('execute')(now)
    ```



- **重置**`__name__`**属性**

    经过decorator装饰之后的`now()`函数，它们的`__name__`都从原来的`'now'`变成了`'wrapper'`：

    ```python
    >>> now.__name__
    'wrapper'
    ```

    **因为此时的`now`就是返回的`wrapper()`函数**，所以，需要把原始函数的`__name__`等属性复制到`wrapper()`函数中，否则，有些依赖函数签名的代码执行就会出错。

    Python内置的`functools.wraps`就是解决此问题的，所以，一个完整的decorator的写法如下：

    ```python
    import functools
    
    def log(text):
        def decorator(func):
            @functools.wraps(func)     #相当于wrapper.__name__ = func.__name__
            def wrapper(*args, **kw):
                print('%s %s():' % (text, func.__name__))
                return func(*args, **kw)
            return wrapper
        return decorator
    ```

    因此只需记住**在定义`wrapper()`的前面加上`@functools.wraps(func)**`即可。



#### 5.5  偏函数

Python的`functools`模块提供了很多有用的功能，其中一个就是偏函数（Partial function）。



**`functools.partial`就是创建一个偏函数的，它可以把一个函数的某些参数给固定住（也就是设置默认值），返回一个新的函数，调用这个新函数会更简单。**

比如`int()`函数提供的`base`参数，默认值为`10`。如果传入`base`参数，就可以做N进制的转换：

```python
>>> int('12345', base=8)  # 将8进制的12345转化成10进制
5349
>>> int('12345', 16)      # 将16进制的12345转化成10进制
74565
```

假设要转换大量的二进制字符串，每次都传入`int(x, base=2)`非常麻烦，这是就可以使用下面的代码创建一个新的函数`int2`：

```python
>>> import functools
>>> int2 = functools.partial(int, base=2)
>>> int2('1000000')
64
>>> int2('1010101')
85
```

上面的新的`int2`函数，仅仅是把`base`参数重新设定默认值为`2`，但也可以在函数调用时传入其他值：

```python
>>> int2('1000000', base=10)
1000000
```



------



### 6.  模块



#### 6.1  使用模块

Python本身就内置了很多非常有用的模块，只要安装完毕，这些模块就可以立刻使用。

我们以内建的`sys`模块为例，编写一个`hello`的模块：

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

' a test module '

__author__ = 'Michael Liao'

import sys

def test():
    args = sys.argv
    if len(args)==1:
        print('Hello, world!')
    elif len(args)==2:
        print('Hello, %s!' % args[1])
    else:
        print('Too many arguments!')

if __name__=='__main__':
    test()
```

第1行和第2行是标准注释，第1行注释可以让这个`hello.py`文件直接在Unix/Linux/Mac上运行，第2行注释表示.py文件本身使用标准UTF-8编码；

第4行是一个字符串，表示模块的文档注释，任何模块代码的第一个字符串都被视为模块的文档注释；

第6行使用`__author__`变量把作者写进去，这样当你公开源代码后别人就可以瞻仰你的大名；

以上就是Python模块的标准文件模板，当然也可以全部删掉不写，但是，按标准办事肯定没错。



- **使用模块**

    使用`sys`模块的第一步，就是导入该模块：

    ```python
    import sys
    ```

    `sys`模块有一个`argv`变量，用list存储了命令行的所有参数。`argv`至少有一个元素，因为第一个参数永远是该.py文件的名称，例如：

    运行`python3 hello.py`获得的`sys.argv`就是`['hello.py']`；

    最后，注意到这两行代码：

    ```python
    if __name__=='__main__':
        test()
    ```

    **当我们在命令行运行`hello`模块文件时，Python解释器把一个特殊变量`__name__`置为`__main__`，而如果在其他地方导入该`hello`模块时，`if`判断将失败**，因此，这种`if`测试可以让一个模块通过命令行运行时执行一些额外的代码，最常见的就是运行测试。

    我们可以用命令行运行`hello.py`看看效果：

    ```python
    $ python3 hello.py
    Hello, world!
    $ python hello.py Michael
    Hello, Michael!
    ```

    如果导入`hello`模块：

    ```python
    >>> import hello
    >>>
    ```

    导入时，没有打印`Hello, word!`，因为没有执行`test()`函数。

    调用`hello.test()`时，才能打印出`Hello, word!`：

    ```python
    >>> hello.test()
    Hello, world!
    ```

- **作用域**

    **在Python中，是通过`_`前缀来实现访问权限控制的：**

    - 正常的函数和变量名是公开的（public），可以被直接引用，比如：`abc`，`x123`，`PI`等；

    - 类似**`__xxx__`**这样的变量是特殊变量，可以被直接引用，但是有特殊用途，比如上面的`__author__`，`__name__`就是特殊变量，`hello`模块定义的文档注释也可以用特殊变量`__doc__`访问，我们自己的变量一般不要用这种变量名；

    - 类似**`_xxx`**和**`__xxx`**这样的函数或变量就是非公开的（private），不应该被直接引用，比如`_abc`，`__abc`等；

    之所以我们说，private函数和变量“不应该”被直接引用，而不是“不能”被直接引用，是因为Python并没有一种方法可以完全限制访问private函数或变量，但是，从编程习惯上不应该引用private函数或变量。



#### 6.2  安装第三方模块

- **安装常用模块**

    在使用Python时，我们经常需要用到很多第三方库，例如：Pillow，以及MySQL驱动程序，Web框架Flask，科学计算Numpy等。用pip一个一个安装费时费力，还需要考虑兼容性。推荐直接使用[Anaconda](https://www.anaconda.com/)，这是一个基于Python的数据处理和科学计算平台，它已经内置了许多非常有用的第三方库，我们装上Anaconda，就相当于把数十个第三方模块自动安装好了，非常简单易用。

    下载后直接安装，Anaconda会把系统Path中的python指向自己自带的Python，并且，Anaconda安装的第三方模块会安装在Anaconda自己的路径下，不影响系统已安装的Python目录。

    安装好Anaconda后，重新打开命令行窗口，输入python，可以看到Anaconda的信息：

    ```shell
    ┌────────────────────────────────────────────────────────┐
    │Command Prompt - python                           - □ x │
    ├────────────────────────────────────────────────────────┤
    │Microsoft Windows [Version 10.0.0]                      │
    │(c) 2015 Microsoft Corporation. All rights reserved.    │
    │                                                        │
    │C:\> python                                             │
    │Python 3.6.3 |Anaconda, Inc.| ... on win32              │
    │Type "help", ... for more information.                  │
    │>>> import numpy                                        │
    │>>> _                                                   │
    │                                                        │
    │                                                        │
    │                                                        │
    └────────────────────────────────────────────────────────┘
    ```

- **模块搜索路径**

    默认情况下，Python解释器会搜索当前目录、所有已安装的内置模块和第三方模块，**搜索路径存放在`sys`模块的`path`变量中**：

    ```python
    >>> import sys
    >>> sys.path
    ['', '/Library/Frameworks/Python.framework/Versions/3.6/lib/python36.zip', '/Library/Frameworks/Python.framework/Versions/3.6/lib/python3.6', ..., '/Library/Frameworks/Python.framework/Versions/3.6/lib/python3.6/site-packages']
    ```

    如果我们要添加自己的搜索目录，有两种方法：

    - **第一种是直接修改`sys.path`，添加要搜索的目录：**

        ```python
        >>> import sys
        >>> sys.path.append('/Users/michael/my_py_scripts')
        ```

        这种方法是**在运行时修改，运行结束后失效。**

    - **第二种方法是设置环境变量`PYTHONPATH`**，该环境变量的内容会被自动添加到模块搜索路径中。设置方式与设置Path环境变量类似。注意只需要添加你自己的搜索路径，Python自己本身的搜索路径不受影响。



------



### 7.  面向对象编程



#### 7.1  类和实例

- **类的实例**

    仍以Student类为例，在Python中，定义类是通过`class`关键字：

    ```python
    class Student(object):
        pass
    ```

    类名通常是大写开头的单词，紧接着是`(object)`，表示该类是从哪个类继承下来的，通常，如果没有合适的继承类，就使用`object`类，这是所有类最终都会继承的类。

    定义好了`Student`类，就可以根据`Student`类创建出`Student`的实例，创建实例是通过类名+()实现的：

    ```python
    >>> bart = Student()
    ```

    可以自由地给一个实例变量绑定属性，比如，给实例`bart`绑定一个`name`属性：

    ```python
    >>> bart.name = 'Bart Simpson'
    >>> bart.name
    'Bart Simpson'
    ```

    由于类可以起到模板的作用，因此，可以在创建实例的时候，把一些我们认为必须绑定的属性强制填写进去。通过定义一个特殊的`__init__`方法，在创建实例的时候，就把`name`，`score`等属性绑上去：

    ```python
    class Student(object):
    
        def __init__(self, name, score):
            self.name = name
            self.score = score
    ```

     注意：**特殊方法“init”前后分别有两个下划线！！！**

    `__init__`方法的第一个参数永远是**`self`，表示创建的实例本身**。有了`__init__`方法，在创建实例的时候，就必须传入与`__init__`方法匹配的参数，但`self`不需要传，Python解释器自己会把实例变量传进去：

    ```python
    >>> bart = Student('Bart Simpson', 59)
    >>> bart.name
    'Bart Simpson'
    >>> bart.score
    59
    ```

    类的方法和普通函数基本没有什么区别，只是第一个参数永远是**`self`**，所以仍然可以使用默认参数、可变参数、关键字参数和命名关键字参数。

- **数据封装**

    面向对象编程的一个重要特点就是数据封装。在上面的`Student`类中，实例本身就拥有各自的`name`和`score`这些数据，要访问这些数据，就没有必要从外面的函数去访问，可以直接在`Student`类的内部定义访问数据的函数，这样，就把“数据”给封装起来了。这些封装数据的函数是和`Student`类本身是关联起来的，我们称之为类的方法：

    ```python
    class Student(object):
    
        def __init__(self, name, score):
            self.name = name
            self.score = score
    
        def print_score(self):
            print('%s: %s' % (self.name, self.score))
    ```

    要定义一个类的方法，除了第一个参数是`self`外，其他和普通函数一样。要调用一个方法，只需要在实例变量上直接调用，除了`self`不用传递，其他参数正常传入：

    ```python
    >>> bart.print_score()
    Bart Simpson: 59
    ```

    这样一来，我们从外部看`Student`类，就只需要知道，创建实例需要给出`name`和`score`，而如何打印，都是在`Student`类的内部定义的，这些数据和逻辑被“封装”起来了，调用很容易，但却不用知道内部实现的细节。



#### 7.2  访问限制

在Python中，实例的**变量名如果以`__（双下划线）`开头，就变成了一个私有变量（private）**，只有内部可以访问，外部不能访问，所以，我们把Student类改一改：

```python
class Student(object):

    def __init__(self, name, score):
        self.__name = name
        self.__score = score

    def print_score(self):
        print('%s: %s' % (self.__name, self.__score))
```

改完后，对于外部代码来说，没什么变动，但是已经无法从外部访问`实例变量.__name`和`实例变量.__score`了：

```python
>>> bart = Student('Bart Simpson', 59)
>>> bart.__name
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
AttributeError: 'Student' object has no attribute '__name'
```

这样就确保了外部代码不能随意修改对象内部的状态，通过访问限制的保护，代码更加健壮。同时可以提供get和set方法，来对私有变量进行访问和修改。

**注意：**

1. 在Python中，变量名类似`__xxx__`的，也就是以双下划线开头，并且以双下划线结尾的，是特殊变量，特殊变量是可以直接访问的，不是private变量，所以，不能用`__name__`、`__score__`这样的变量名。

2. 以一个下划线开头的实例变量名，比如`_name`，这样的实例变量外部是可以访问的，但是，按照约定俗成的规定，当你看到这样的变量时，意思就是，“虽然我可以被访问，但是，请把我视为私有变量，不要随意访问”。

3. 不能直接访问`__name`是因为**Python解释器对外把`__name`变量改成了`_类名__name`，所以，仍然可以通过`_Student__name`来访问`__name`变量**：

    ```python
    >>> bart._Student__name
    'Bart Simpson'
    ```

    但是强烈建议你不要这么干，因为不同版本的Python解释器可能会把`__name`改成不同的变量名。


4. 最后注意下面的这种*错误写法*：

    ```python
    >>> bart.__name = 'New Name' # 设置__name变量！
    >>> bart.__name
    'New Name'
    ```

    表面上看，外部代码“成功”地设置了`__name`变量，但实际上内部的`__name`变量已经被Python解释器自动改成了`_Student__name`，而外部代码给`bart`新增了一个`__name`变量。不信试试：

    ```python
    >>> bart.get_name() # get_name()内部返回self.__name
    'Bart Simpson'
    ```



#### 7.3  继承和多态

Python的继承和多态与Java里并没有不同之处，Java里的继承和多态的概念同样适用于Python。



- **静态语言 vs 动态语言**

    对于静态语言（例如Java）来说，如果方法参数需要传入`Animal`类型，则传入的对象必须是`Animal`类型或者它的子类，否则，将无法调用`run()`方法。

    对于Python这样的动态语言来说，则不一定需要传入`Animal`类型。我们只需要保证传入的对象有一个`run()`方法就可以了：

    ```Python
    class Timer(object):
        def run(self):
            print('Start...')
    ```

    这就是**动态语言的“鸭子类型”，它并不要求严格的继承体系，一个对象只要“看起来像鸭子，走起路来像鸭子”，那它就可以被看做是鸭子。**

    Python的“file-like object“就是一种鸭子类型。对真正的文件对象，它有一个`read()`方法，返回其内容。但是，许多对象，只要有`read()`方法，都被视为“file-like object“。许多函数接收的参数就是“file-like object“，你不一定要传入真正的文件对象，完全可以传入任何实现了`read()`方法的对象。



#### 7.4  获取对象信息

- **type()**

    任意一个对象都可以使用type()获取它的类型，包括函数：

    ```python
    >>> type(123)
    <class 'int'>
    >>> type('str')
    <class 'str'>
    >>> type(None)
    <type(None) 'NoneType'>
    >>> type(abs)
    <class 'builtin_function_or_method'>
    ```

    **`type()`函数返回对象对应的Class类型。如果要判断一个对象是否是函数，可以使用`types`模块中定义的常量**：

    ```python
    >>> import types
    >>> def fn():
    ...     pass
    ...
    >>> type(fn)==types.FunctionType
    True
    >>> type(abs)==types.BuiltinFunctionType
    True
    >>> type(lambda x: x)==types.LambdaType
    True
    >>> type((x for x in range(10)))==types.GeneratorType
    True
    ```

- **isinstance()**

    对于class的继承关系来说，使用`type()`就很不方便。**判断一个对象是否为某种类型的实例，可以使用`isinstance()`函数，并且还可以判断一个对象是否是某些类型中的一种实例：**

    ```python
    >>> isinstance([1, 2, 3], (list, tuple))
    True
    >>> isinstance((1, 2, 3), (list, tuple))
    True
    ```

- **dir()**

    **如果要获得一个对象的所有属性和方法，可以使用`dir()`函数，它返回一个包含字符串的list**，比如，获得一个str对象的所有属性和方法：

    ```python
    >>> dir('ABC')
    ['__add__', '__class__',..., '__subclasshook__', 'capitalize', 'casefold',..., 'zfill']
    ```

    类似`__xxx__`的属性和方法在Python中都是有特殊用途的，比如`__len__`方法返回长度。在Python中，如果你调用`len()`函数试图获取一个对象的长度，实际上，在**`len()`函数内部，它会去调用该对象的`__len__()`方法**。

    我们自己写的类，如果也想用`len(myObj)`的话，就自己写一个`__len__()`方法：

    ```python
    >>> class MyDog(object):
    ...     def __len__(self):
    ...         return 100
    ...
    >>> dog = MyDog()
    >>> len(dog)
    100
    ```

    仅仅把属性和方法列出来是不够的，配合`getattr()`、`setattr()`以及`hasattr()`，我们可以直接操作一个对象的状态：

    ```python
    >>> hasattr(obj, 'y') # 有属性'y'吗？
    False
    >>> setattr(obj, 'y', 19) # 设置一个属性'y'
    >>> hasattr(obj, 'y') # 有属性'y'吗？
    True
    >>> getattr(obj, 'y') # 获取属性'y'
    19
    ```

    如果试图获取不存在的属性，会抛出AttributeError的错误：

    ```python
    >>> getattr(obj, 'z') # 获取属性'z'
    Traceback (most recent call last):
      File "<stdin>", line 1, in <module>
    AttributeError: 'MyObject' object has no attribute 'z'
    ```

    可以传入一个default参数，如果属性不存在，就返回默认值：

    ```python
    >>> getattr(obj, 'z', 404) # 获取属性'z'，如果不存在，返回默认值404
    404
    ```

    还可以获得对象的方法：

    ```python
    >>> hasattr(obj, 'power') # 有属性'power'吗？
    True
    >>> getattr(obj, 'power') # 获取属性'power'
    <bound method MyObject.power of <__main__.MyObject object at 0x10077a6a0>>
    >>> fn = getattr(obj, 'power') # 获取属性'power'并赋值到变量fn
    >>> fn() # 调用fn()与调用obj.power()是一样的
    81
    ```



#### 7.5  实例属性和类属性

由于Python是动态语言，根据类创建的实例可以任意绑定属性。

给实例绑定属性的方法是通过实例变量，或者通过`self`变量：

```python
class Student(object):
    def __init__(self, name):
        self.name = name

s = Student('Bob')
s.score = 90
```

但是，如果`Student`类本身需要绑定一个属性呢？可以直接在class中定义属性，这种属性是类属性，归`Student`类所有，使用`Student.name`来访问它：

```python
class Student(object):
    name = 'Student'  # 相当于java中的静态属性
```



##### 小结：

1. 实例属性属于各个实例所有，互不干扰；
2. 类属性属于类所有，所有实例共享一个属性，使用`类名.属性`来访问它；
3. 不要对实例属性和类属性使用相同的名字，否则类属性会被实例属性屏蔽。



------



### 8.  面向对象高级编程



#### 8.1  \__slots__

正常情况下，当我们定义了一个class，创建了一个class的实例后，我们可以给该实例绑定任何属性和方法，因此我们可以在程序运行的过程中动态给class加上功能，这就是动态语言的灵活性。



如果我们想要限制实例的属性，比如，只允许对Student实例添加`name`和`age`属性。这时就**可以在定义class的时候，定义一个特殊的`__slots__`变量，来限制该class实例能添加的属性**：

```python
class Student(object):
    __slots__ = ('name', 'age') # 用tuple定义允许绑定的属性名称
```

然后，我们试试：

```python
>>> s = Student() # 创建新的实例
>>> s.score = 99 # 绑定属性'score'
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
AttributeError: 'Student' object has no attribute 'score'
```

使用`__slots__`要注意，`__slots__`定义的属性仅对当前类实例起作用，对继承的子类是不起作用的：

```python
>>> class GraduateStudent(Student):
...     pass
...
>>> g = GraduateStudent()
>>> g.score = 9999
```

**注意：**

1. ` __slots__`只能限制实例的属性及方法，对于类绑定属性及方法则没有影响。
2. 当在子类中定义`__slots__`时，子类实例允许定义的属性就是自身的`__slots__`加上父类的`__slots__`；否则，子类实例可以绑定任何属性，不受父类的`__slots__`影响。



#### 8.2  @property

在绑定属性时，如果我们直接把属性暴露出去，虽然写起来很简单，但是，没办法检查参数，导致可以随便更改属性。



**Python内置的`@property`装饰器就是负责把一个方法变成属性调用的**，这样就既能检查参数，又可以用类似属性的方式来访问类的变量：

```python
class Student(object):

    @property
    def score(self):
        return self._score

    @score.setter
    def score(self, value):
        if not isinstance(value, int):
            raise ValueError('score must be an integer!')
        if value < 0 or value > 100:
            raise ValueError('score must between 0 ~ 100!')
        self._score = value
```

**把一个getter方法变成属性，只需要加上`@property`就可以了，此时，`@property`本身又创建了另一个装饰器`@属性.setter`，负责把一个setter方法变成属性赋值**，于是，我们就拥有一个可控的属性操作：

```python
>>> s = Student()
>>> s.score = 60 # OK，实际转化为s.set_score(60)
>>> s.score # OK，实际转化为s.get_score()
60
>>> s.score = 9999
Traceback (most recent call last):
  ...
ValueError: score must between 0 ~ 100!
```

还可以定义只读属性，**只定义getter方法，不定义setter方法就是一个只读属性**：

```python
class Student(object):

    @property
    def birth(self):
        return self._birth

    @birth.setter
    def birth(self, value):
        self._birth = value

    @property
    def age(self):
        return 2015 - self._birth
```

上面的`birth`是可读写属性，而`age`就是一个*只读*属性，因为`age`可以根据`birth`和当前时间计算出来。



#### 8.3  多重继承

通过多重继承，一个子类就可以同时获得多个父类的所有功能。格式如下：

```python
class Dog(Mammal, Runnable):
	pass
```



- **MixIn**

    **MixIn的目的就是给一个类增加多个功能**，这样，在设计类的时候，我们**优先考虑通过多重继承**来组合多个MixIn的功能，而不是设计多层次的复杂的继承关系。



    Python自带的很多库也使用了MixIn。举个例子，Python自带了`TCPServer`和`UDPServer`这两类网络服务，而要同时服务多个用户就必须使用多进程或多线程模型，这两种模型由`ForkingMixIn`和`ThreadingMixIn`提供。通过组合，我们就可以创造出合适的服务来。
    
    比如，编写一个多进程模式的TCP服务，定义如下：
    
    ```python
    class MyTCPServer(TCPServer, ForkingMixIn):
        pass
    ```
    
    编写一个多线程模式的UDP服务，定义如下：
    
    ```python
    class MyUDPServer(UDPServer, ThreadingMixIn):
        pass
    ```
    
    如果你打算搞一个更先进的协程模型，可以编写一个`CoroutineMixIn`：
    
    ```python
    class MyTCPServer(TCPServer, CoroutineMixIn):
        pass
    ```
    
    这样一来，我们不需要复杂而庞大的继承链，只要选择组合不同的类的功能，就可以快速构造出所需的子类。



#### 8.4  定制类

看到形如`__xxx__`的变量或者函数名就要注意，这些在Python中是有特殊用途的。除了`__slots__`和`__len__()`外，Python的class中还有许多这样有特殊用途的函数，可以帮助我们定制类。



- **\_str_**

    **`__str__()`返回用户看到的字符串，而`__repr__()`返回程序开发者看到的字符串**，也就是说，`__repr__()`是为调试服务的。

    通常`__str__()`和`__repr__()`代码都是一样的，所以，有个偷懒的写法：

    ```python
    class Student(object):
        def __init__(self, name):
            self.name = name
        def __str__(self):
            return 'Student object (name=%s)' % self.name
        __repr__ = __str__
    ```

    这样无论是使用`print()`打印实例还是直接使用交互模式直接查看实例，都比较好看：

    ```python
    >>>s = Student('Michael')
    >>> print(s)
    Student object (name: Michael)
    >>> s
    Student object (name: Michael)
    ```

- **\__iter__**

    **如果一个类想被用于`for ... in`循环，类似list或tuple那样，就必须实现`__iter__()`方法，该方法返回一个迭代对象，同时还需要实现`__next__`方法**，然后，Python的for循环就会不断调用该迭代对象的`__next__()`方法拿到循环的下一个值，直到遇到`StopIteration`错误时退出循环。

    以斐波那契数列为例，写一个Fib类，可以作用于for循环：

    ```python
    class Fib(object):
        def __init__(self):
            self.a, self.b = 0, 1 # 初始化两个计数器a，b
    
        def __iter__(self):
            return self # 实例本身就是迭代对象，故返回自己
    
        def __next__(self):
            self.a, self.b = self.b, self.a + self.b # 计算下一个值
            if self.a > 100000: # 退出循环的条件
                raise StopIteration()
            return self.a # 返回下一个值
    ```

- **\__getitem__**

    Fib实例虽然能作用于for循环，看起来和list有点像，但是，把它当成list来使用还是不行，比如，取第5个元素：

    ```python
    >>> Fib()[5]
    Traceback (most recent call last):
      File "<stdin>", line 1, in <module>
    TypeError: 'Fib' object does not support indexing
    ```

    要表现得**像list那样按照下标取出元素，需要实现`__getitem__()`方法**：

    ```python
    class Fib(object):
        def __getitem__(self, n):
            a, b = 1, 1
            for x in range(n):
                a, b = b, a + b
            return a
    ```

    现在，就可以按下标访问数列的任意一项了：

    ```Python
    >>> f = Fib()
    >>> f[0]
    1
    >>> f[1]
    1
    >>> f[2]
    2
    >>> f[3]
    3
    ```

    但是此时Fib使用不了切片，原因是`__getitem__()`传入的参数可能是一个int，也可能是一个**切片对象`slice`**，所以要做判断：

    ```Python
    class Fib(object):
        def __getitem__(self, n):
            if isinstance(n, int): # n是索引
                a, b = 1, 1
                for x in range(n):
                    a, b = b, a + b
                return a
            if isinstance(n, slice): # n是切片
                start = n.start
                stop = n.stop
                if start is None:
                    start = 0
                a, b = 1, 1
                L = []
                for x in range(stop):
                    if x >= start:
                        L.append(a)
                    a, b = b, a + b
                return L
    ```

    现在试试Fib的切片：

    ```python
    >>> f = Fib()
    >>> f[0:5]
    [1, 1, 2, 3, 5]
    >>> f[:10]
    [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
    ```

    但是**没有对step参数作处理**：

    ```python
    >>> f[:10:2]
    [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
    ```

    也**没有对负数作处理**，所以，要正确实现一个`__getitem__()`还是有很多工作要做的。

    此外，**如果把对象看成`dict`，`__getitem__()`的参数也可能是一个可以作key的object，例如`str`。**

    **与之对应的是`__setitem__()`方法，把对象视作list或dict来对集合赋值。最后，还有一个`__delitem__()`方法，用于删除某个元素。**

    总之，通过上面的方法，我们自己定义的类表现得和Python自带的list、tuple、dict没什么区别，这完全归功于动态语言的“鸭子类型”，不需要强制继承某个接口。

- **\__getattr__**

    **当实例调用不存在的属性或方法时，Python会调用`__getattr__(self, attr)`来尝试获取属性和方法**。如下：

    ```python
    class Student(object):
    
        def __init__(self):
            self.name = 'Michael'
    
        def __getattr__(self, attr):
            if attr=='score':
                return 99
    ```

    当调用不存在的属性时，比如`score`，Python解释器会试图调用`__getattr__(self, 'score')`来尝试获得属性，这样，我们就有机会返回`score`的值：

    ```python
    >>> s = Student()
    >>> s.score
    99
    ```

    返回函数也是完全可以的：

    ```python
    class Student(object):
    
        def __getattr__(self, attr):
            if attr=='age':
                return lambda: 25
    ```

    只是调用方式要变为：

    ```python
    >>> s.age()
    25
    ```

    **注意：**

    - 只有在没有找到属性的情况下，才调用`__getattr__`，已有的属性，比如`name`，不会在`__getattr__`中查找。同时，若要让class只响应特定的几个属性，我们就要按照约定，抛出`AttributeError`的错误：

        ```python
        class Student(object):
        
            def __getattr__(self, attr):
                if attr=='age':
                    return lambda: 25
                raise AttributeError('\'Student\' object has no attribute \'%s\'' % attr)
        ```

- **\__call__**

    **在Python中，任何类只需要定义一个`__call__()`方法，就可以直接对实例进行调用**。请看示例：

    ```python
    class Student(object):
        def __init__(self, name):
            self.name = name
    
        def __call__(self):
            print('My name is %s.' % self.name)
    ```

    调用方式如下：

    ```python
    >>> s = Student('Michael')
    >>> s() # self参数不要传入
    My name is Michael.
    ```

    `__call__()`还可以定义参数。对实例进行直接调用就好比对一个函数进行调用一样，所以你完全可以把对象看成函数，把函数看成对象，因为这两者之间本来就没啥根本的区别。

    那么，怎么判断一个变量是对象还是函数呢？其实，更多的时候，我们需要判断一个对象是否能被调用，能被调用的对象就是一个`Callable`对象，比如函数和我们上面定义的带有`__call__()`的类实例：

    ```python
    >>> callable(Student())
    True
    >>> callable(max)
    True
    >>> callable([1, 2, 3])
    False
    >>> callable(None)
    False
    >>> callable('str')
    False
    ```

    **通过`callable()`函数，我们就可以判断一个对象是否是“可调用”对象。**



#### 8.5  枚举类

当我们需要定义常量时，一个办法是用大写变量通过整数来定义，但实际上它仍然是变量，更好的方法是为这样的枚举类型定义一个class类型，然后，每个常量都是class的一个唯一实例。Python提供了`Enum`类来实现这个功能：

```python
from enum import Enum

Month = Enum('Month', ('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'))
```

这样我们就获得了`Month`类型的枚举类，可以直接使用`Month.Jan`来引用一个常量，或者枚举它的所有成员：

```python
for name, member in Month.__members__.items():
    print(name, '=>', member, ',', member.value)
```

`value`属性则是自动赋给成员的`int`常量，默认从`1`开始计数。

**如果需要更精确地控制枚举类型，可以从`Enum`派生出自定义类**：

```python
from enum import Enum, unique

@unique
class Weekday(Enum):
    Sun = 0 # Sun的value被设定为0
    Mon = 1
    Tue = 2
    Wed = 3
    Thu = 4
    Fri = 5
    Sat = 6
```

**`@unique`装饰器可以帮助我们检查保证没有重复值。**

访问这些枚举类型可以有若干种方法：

```python
>>> day1 = Weekday.Mon
>>> print(day1)
Weekday.Mon
>>> print(Weekday['Tue'])
Weekday.Tue
>>> print(Weekday.Tue.value)
2
>>> print(Weekday(1))
Weekday.Mon

>>> for name, member in Weekday.__members__.items():
...     print(name, '=>', member)
...
Sun => Weekday.Sun
Mon => Weekday.Mon
Tue => Weekday.Tue
Wed => Weekday.Wed
Thu => Weekday.Thu
Fri => Weekday.Fri
Sat => Weekday.Sat
```

可见，**既可以用成员名称引用枚举常量，又可以直接根据value的值获得枚举常量**。



#### 8.6 使用元类

- **type()：动态创建类**

    动态语言和静态语言最大的不同，就是函数和类的定义，不是编译时定义的，而是运行时动态创建的。

    比方说我们要定义一个`Hello`的class，就写一个`hello.py`模块：

    ```python
    class Hello(object):
        def hello(self, name='world'):
            print('Hello, %s.' % name)
    ```

    当Python解释器载入`hello`模块时，就会依次执行该模块的所有语句，执行结果就是动态创建出一个`Hello`的class对象，测试如下：

    ```python
    >>> from hello import Hello
    >>> h = Hello()
    >>> h.hello()
    Hello, world.
    >>> print(type(Hello))
    <class 'type'>
    >>> print(type(h))
    <class 'hello.Hello'>
    ```

    `type()`函数可以查看一个类型或变量的类型，`Hello`是一个class，它的类型就是`type`，而`h`是一个实例，它的类型就是class `Hello`。

    我们说**class的定义是运行时动态创建的，而创建class的方法就是使用`type()`函数。**

    `type()`函数既可以返回一个对象的类型，又可以创建出新的类型，比如，我们可以通过`type()`函数创建出`Hello`类，而无需通过`class Hello(object)...`的定义：

    ```Python
    >>> def fn(self, name='world'): # 先定义函数
    ...     print('Hello, %s.' % name)
    ...
    >>> Hello = type('Hello', (object,), dict(hello=fn)) # 创建Hello class
    >>> h = Hello()
    >>> h.hello()
    Hello, world.
    >>> print(type(Hello))
    <class 'type'>
    >>> print(type(h))
    <class '__main__.Hello'>
    ```

    要创建一个class对象，`type()`函数依次传入3个参数：

    1. class的名称；
    2. 继承的父类集合，注意Python支持多重继承，如果只有一个父类，别忘了tuple的单元素写法；
    3. class的方法名称与函数绑定，这里我们把函数`fn`绑定到方法名`hello`上。

    **通过`type()`函数创建的类和直接写class是完全一样的，因为Python解释器遇到class定义时，仅仅是扫描一下class定义的语法，然后调用`type()`函数创建出class。**

    动态语言本身支持运行期动态创建类，这和静态语言有非常大的不同，要在静态语言运行期创建类，必须构造源代码字符串再调用编译器，或者借助一些工具生成字节码实现，本质上都是动态编译，会非常复杂。

- **metaclass**

    metaclass，直译为元类，简单的解释就是：先定义metaclass，就可以创建类，最后创建实例。

    所以，**metaclass允许你创建类或者修改类。换句话说，你可以把类看成是metaclass创建出来的“实例”**。

    我们先看一个简单的例子，这个metaclass可以给我们自定义的MyList增加一个`add`方法：

    ```python
    # metaclass是类的模板，所以必须从type类型派生：
    class ListMetaclass(type):
        def __new__(cls, name, bases, attrs):
            attrs['add'] = lambda self, value: self.append(value)
            return type.__new__(cls, name, bases, attrs)
    ```

    `__new__()`方法接收到的参数依次是：

    1. 当前准备创建的类的对象；
    2. 类的名字；
    3. 类继承的父类集合；
    4. 类的方法集合。

    有了ListMetaclass，我们在定义类的时候还要指示使用ListMetaclass来定制类，传入**关键字参数`metaclass`**：

    ```Python
    class MyList(list, metaclass=ListMetaclass):
        pass
    ```

    **当我们传入关键字参数`metaclass`时，魔术就生效了，它指示Python解释器在创建`MyList`时，要通过`ListMetaclass.__new__()`来创建，在此，我们可以修改类的定义**，比如，加上新的方法，然后，返回修改后的定义。

    测试一下`MyList`是否可以调用`add()`方法：

    ```python
    >>> L = MyList()
    >>> L.add(1)
    >> L
    [1]
    ```

    而普通的`list`没有`add()`方法。

    **注意：**

    - 正常情况下，你不会碰到需要使用metaclass的情况，除非要编写一个ORM框架。ORM全称“Object Relational Mapping”，即对象-关系映射，就是把关系数据库的一行映射为一个对象，也就是一个类对应一个表，这样，写代码更简单，不用直接操作SQL语句。



------



### 9.  错误、调试和测试



#### 9.1  错误处理

高级语言通常都内置了一套`try...except...finally...`的错误处理机制，Python也不例外。



- **try**

    让我们用一个例子来看看`try`的机制：

    ```python
    try:
        print('try...')
        r = 10 / 0
        print('result:', r)
    except ZeroDivisionError as e:
        print('except:', e)
    finally:
        print('finally...')
    print('END')
    ```

    当我们认为某些代码可能会出错时，就可以用`try`来运行这段代码，如果执行出错，则后续代码不会继续执

    行，而是直接跳转至错误处理代码，即`except`语句块，执行完`except`后，如果有`finally`语句块，则执行`finally`语句块，至此，执行完毕。它和Java中的异常处理机制相同。

- **调用栈**

    如果错误没有被捕获，它就会一直往上抛，最后被Python解释器捕获，打印一个错误信息，然后程序退出。来看看`err.py`：

    ```python
    # err.py:
    def foo(s):
        return 10 / int(s)
    
    def bar(s):
        return foo(s) * 2
    
    def main():
        bar('0')
    
    main()
    ```

    执行，结果如下：

    ```python
    $ python3 err.py
    Traceback (most recent call last):
      File "err.py", line 11, in <module>
        main()
      File "err.py", line 9, in main
        bar('0')
      File "err.py", line 6, in bar
        return foo(s) * 2
      File "err.py", line 3, in foo
        return 10 / int(s)
    ZeroDivisionError: division by zero
    ```

    解读错误信息是定位错误的关键，我们从上往下可以看到整个错误的调用函数链，一般最后一行给出错误原因。

- **记录错误**

    如果不捕获错误，自然可以让Python解释器来打印出错误堆栈，但程序也被结束了。既然我们能捕获错误，就可以把错误堆栈打印出来，然后分析错误原因，同时，让程序继续执行下去。

    Python内置的`logging`模块可以非常容易地记录错误信息：

    ```python
    # err_logging.py
    
    import logging
    
    def foo(s):
        return 10 / int(s)
    
    def bar(s):
        return foo(s) * 2
    
    def main():
        try:
            bar('0')
        except Exception as e:
            logging.exception(e)
    
    main()
    print('END')
    ```

    同样是出错，但程序打印完错误信息后会继续执行，并正常退出：

    ```python
    $ python3 err_logging.py
    ERROR:root:division by zero
    Traceback (most recent call last):
      File "err_logging.py", line 13, in main
        bar('0')
      File "err_logging.py", line 9, in bar
        return foo(s) * 2
      File "err_logging.py", line 6, in foo
        return 10 / int(s)
    ZeroDivisionError: division by zero
    END
    ```

    通过配置，`logging`还可以把错误记录到日志文件里，方便事后排查。

- **抛出错误**

    因为错误是class，捕获一个错误就是捕获到该class的一个实例。因此，错误并不是凭空产生的，而是有意创建并抛出的。Python的内置函数会抛出很多类型的错误，我们自己编写的函数也可以抛出错误。

    如果要抛出错误，首先根据需要，可以定义一个错误的class，选择好继承关系，然后，用`raise`语句抛出一个错误的实例：

    ```python
    # err_raise.py
    class FooError(ValueError):
        pass
    
    def foo(s):
        n = int(s)
        if n==0:
            raise FooError('invalid value: %s' % s)
        return 10 / n
    
    foo('0')
    ```

    执行，可以最后跟踪到我们自己定义的错误：

    ```python
    $ python3 err_raise.py 
    Traceback (most recent call last):
      File "err_throw.py", line 11, in <module>
        foo('0')
      File "err_throw.py", line 8, in foo
        raise FooError('invalid value: %s' % s)
    __main__.FooError: invalid value: 0
    ```

    只有在必要的时候才定义我们自己的错误类型。如果可以选择Python已有的内置的错误类型（比如`ValueError`，`TypeError`），尽量使用Python内置的错误类型。



#### 9.2  调试

不建议在程序中使用print() 或者assert来调试程序，可以通过以下方式调试程序：

- **logging**

    `logging`不会抛出错误，而且可以输出到文件：

    ```python
    import logging
    logging.basicConfig(level=logging.INFO)
    
    s = '0'
    n = int(s)
    logging.info('n = %d' % n)
    print(10 / n)
    ```

    `logging.info()`就可以输出一段文本。运行可以看到输出：

    ```python
    $ python err.py
    INFO:root:n = 0
    Traceback (most recent call last):
      File "err.py", line 8, in <module>
        print(10 / n)
    ZeroDivisionError: division by zero
    ```

    这就是`logging`的好处，它允许你指定记录信息的级别，有`debug`，`info`，`warning`，`error`等几个级别，当我们指定`level=INFO`时，`logging.debug`就不起作用了。同理，指定`level=WARNING`后，`debug`和`info`就不起作用了。这样一来，你可以放心地输出不同级别的信息，也不用删除，最后统一控制输出哪个级别的信息。

    `logging`的另一个好处是通过简单的配置，一条语句可以同时输出到不同的地方，比如console和文件。



    除了以上方式还可以使用Python的调试器pdb调试，不过一般IDE都支持debug，因此**最好的调试方法就是使用debug**。



#### 9.3  单元测试

如果你听说过“测试驱动开发”（TDD：Test-Driven Development），单元测试就不陌生。

单元测试是用来对一个模块、一个函数或者一个类来进行正确性检验的测试工作。



单元测试通过后有什么意义呢？如果我们对`abs()`函数代码做了修改，只需要再跑一遍单元测试，如果通过，说明我们的修改不会对`abs()`函数原有的行为造成影响，如果测试不通过，说明我们的修改与原有行为不一致，要么修改代码，要么修改测试。

这种以测试为驱动的开发模式最大的好处就是确保一个程序模块的行为符合我们设计的测试用例。在将来修改的时候，可以极大程度地保证该模块行为仍然是正确的。



Python中单元测试写法：

1. 编写一个测试类，从`unittest.TestCase`继承；

2. 以`test`开头的方法就是测试方法，不以`test`开头的方法不被认为是测试方法，测试的时候不会被执行；

3. 断言输出是否是我们所期望的：

    ```python
    self.assertEqual(abs(-1), 1) # 断言函数返回的结果与1相等
    ```

    另一种重要的断言就是期待抛出指定类型的Error，比如通过`d['empty']`访问不存在的key时，断言会抛出`KeyError`：

    ```python
    with self.assertRaises(KeyError):
        value = d['empty']
    ```

4. 编写好单元测试，我们就可以运行单元测试：

    - 最简单的运行方式是在`test.py`的最后加上两行代码：

        ```python
        if __name__ == '__main__':
            unittest.main()
        ```

    - 另一种方法是在命令行通过参数`-m unittest`直接运行单元测试：

        ```python
        $ python -m unittest test
        .....
        ----------------------------------------------------------------------
        Ran 5 tests in 0.000s
        
        OK
        ```

        这是推荐的做法，因为这样可以一次批量运行很多单元测试，并且，有很多工具可以自动来运行这些单元测试。

5. 可以在单元测试中编写两个特殊的`setUp()`和`tearDown()`方法。这两个方法会分别在每调用一个测试方法的前后分别被执行。



#### 9.4  文档测试

Python的内置的“文档测试”（文档测试）模块可以直接提取注释中的代码并执行测试。

文档测试严格按照Python的交互式命令行的输入和输出来判断测试结果是否正确。只有测试异常的时候，可以用`...`表示中间一大段烦人的输出。如：

```python
# mydict2.py
class Dict(dict):
    '''
    Simple dict but also support access as x.y style.

    >>> d1 = Dict()
    >>> d1['x'] = 100
    >>> d1.x
    100
    >>> d1.y = 200
    >>> d1['y']
    200
    >>> d2 = Dict(a=1, b=2, c='3')
    >>> d2.c
    '3'
    >>> d2['empty']
    Traceback (most recent call last):
        ...
    KeyError: 'empty'
    >>> d2.empty
    Traceback (most recent call last):
        ...
    AttributeError: 'Dict' object has no attribute 'empty'
    '''
    def __init__(self, **kw):
        super(Dict, self).__init__(**kw)

    def __getattr__(self, key):
        try:
            return self[key]
        except KeyError:
            raise AttributeError(r"'Dict' object has no attribute '%s'" % key)

    def __setattr__(self, key, value):
        self[key] = value

if __name__=='__main__':
    import doctest      #导入文档测试
    doctest.testmod()	#开始文档测试
```

运行`python mydict2.py`：

```python
$ python mydict2.py
```

**什么输出也没有，这说明我们编写的文档测试运行就是正确的；如果程序有问题，运行就会报错**。当模块正常导入时，文档测试不会被执行。只有在命令行直接运行时，才执行文档测试。所以，不必担心文档测试会在非测试环境下执行。



------



### 10.  IO编程

IO在计算机中指Input/Output，也就是输入和输出。由于程序和运行时数据是在内存中驻留，由CPU这个超快的计算核心来执行，涉及到数据交换的地方，通常是磁盘、网络等，就需要IO接口。

IO编程中，Stream（流）是一个很重要的概念，可以把流想象成一个水管，数据就是水管里的水，但是只能单向流动。Input Stream就是数据从外面（磁盘、网络）流进内存，Output Stream就是数据从内存流到外面去。对于浏览网页来说，浏览器和新浪服务器之间至少需要建立两根水管，才可以既能发数据，又能收数据。

由于CPU和内存的速度远远高于外设的速度，所以，在IO编程中，就存在速度严重不匹配的问题。比如：把100M的数据写入磁盘，CPU输出100M的数据只需要0.01秒，可是磁盘要接收这100M数据可能需要10秒，怎么办呢？有两种办法：

1. CPU等待，也就是程序暂停执行后续代码，等100M的数据在10秒后写入磁盘，再接着往下执行，这种模式称为同步IO；
2. CPU不等待，只是告诉磁盘，“您老慢慢写，不着急，我接着干别的事去了”，于是，后续代码可以立刻接着执行，这种模式称为异步IO。

**同步和异步的区别就在于是否等待IO执行的结果。**



#### 10.1  文件读写

> 读写文件是最常见的IO操作。**现代操作系统不允许普通的程序直接操作磁盘，所以，读写文件就是请求操作系统打开一个文件对象（通常称为文件描述符），然后，通过操作系统提供的接口从这个文件对象中读取数据（读文件），或者把数据写入这个文件对象（写文件）。**



- **读文件**

    要以读文件的模式打开一个文件对象，使用Python内置的**`open()`**函数，传入文件名和标示符：

    ```python
    >>> f = open('/Users/michael/test.txt', 'r')
    ```

    **标示符`'r'`表示读**，这样，我们就成功地打开了一个文件。

    如果文件不存在，`open()`函数就会抛出一个`IOError`的错误，并且给出错误码和详细的信息告诉你文件不存在：

    ```python
    >>> f=open('/Users/michael/notfound.txt', 'r')
    Traceback (most recent call last):
      File "<stdin>", line 1, in <module>
    FileNotFoundError: [Errno 2] No such file or directory: '/Users/michael/notfound.txt'
    ```

    如果文件打开成功，接下来，调用**`read()`**方法可以一次读取文件的全部内容，Python把内容读到内存，用一个`str`对象表示：

    ```python
    >>> f.read()
    'Hello, world!'
    ```

    最后一步是调用**`close()`**方法关闭文件。**文件使用完毕后必须关闭，因为文件对象会占用操作系统的资源，并且操作系统同一时间能打开的文件数量也是有限的**：

    ```python
    >>> f.close()
    ```

    由于文件读写时都有可能产生`IOError`，一旦出错，后面的`f.close()`就不会调用。所以，为了保证无论是否出错都能正确地关闭文件，我们可以使用`try ... finally`来实现：

    ```python
    try:
        f = open('/path/to/file', 'r')
        print(f.read())
    finally:
        if f:
            f.close()
    ```

    但是每次都这么写实在太繁琐，所以，Python引入了`with`语句来自动帮我们调用`close()`方法：

    ```python
    with open('/path/to/file', 'r') as f:
        print(f.read())
    ```

    **`with`语句和`try ... finally`是一样的，但是代码更佳简洁，并且不必调用`f.close()`方法。**

    调用`read()`会一次性读取文件的全部内容，如果文件有10G，内存就爆了，所以，要保险起见，可以反复调用**`read(size)`**方法，每次最多读取size个字节的内容。另外，调用**`readline()`**可以每次读取一行内容，调用**`readlines()`**一次读取所有内容并按行返回`list`。因此，要根据需要决定怎么调用。

    **如果文件很小，`read()`一次性读取最方便；如果不能确定文件大小，反复调用`read(size)`比较保险；如果是配置文件，调用`readlines()`最方便：**

    ```python
    for line in f.readlines():
        print(line.strip()) # 把末尾的'\n'删掉
    ```

- **file-like Object**

    **像`open()`函数返回的这种有个`read()`方法的对象，在Python中统称为file-like Object**。除了file外，还可以是内存的字节流，网络流，自定义流等等。file-like Object不要求从特定类继承，只要写个`read()`方法就行。

    `StringIO`就是在内存中创建的file-like Object，常用作临时缓冲。

- **二进制文件**

    前面讲的默认都是读取文本文件，并且是UTF-8编码的文本文件。**要读取二进制文件，比如图片、视频等等，用`'rb'`模式打开文件即可**：

    ```python
    >>> f = open('/Users/michael/test.jpg', 'rb')
    >>> f.read()
    b'\xff\xd8\xff\xe1\x00\x18Exif\x00\x00...' # 十六进制表示的字节
    ```

- **字符编码**

    **要读取非UTF-8编码的文本文件，需要给`open()`函数传入`encoding`参数**，例如，读取GBK编码的文件：

    ```python
    >>> f = open('/Users/michael/gbk.txt', 'r', encoding='gbk')
    >>> f.read()
    '测试'
    ```

    遇到有些编码不规范的文件，你可能会遇到`UnicodeDecodeError`，因为在文本文件中可能夹杂了一些非法编码的字符。遇到这种情况，**`open()`函数还接收一个`errors`参数，表示如果遇到编码错误后如何处理。最简单的方式是直接忽略**：

    ```python
    >>> f = open('/Users/michael/gbk.txt', 'r', encoding='gbk', errors='ignore')
    ```

- **写文件**

    写文件和读文件是一样的，唯一区别是**调用`open()`函数时，传入标识符`'w'`或者`'wb'`表示写文本文件或写二进制文件**：

    ```python
    >>> f = open('/Users/michael/test.txt', 'w')
    >>> f.write('Hello, world!')
    >>> f.close()
    ```

    当我们写文件时，操作系统往往不会立刻把数据写入磁盘，而是放到内存缓存起来，空闲的时候再慢慢写入。**只有调用`close()`方法时，操作系统才保证把没有写入的数据全部写入磁盘**。忘记调用`close()`的后果是数据可能只写了一部分到磁盘，剩下的丢失了。所以，还是用**`with`语句无论读文件还是写文件都更保险**：

    ```python
    with open('/Users/michael/test.txt', 'w') as f:
        f.write('Hello, world!')
    ```

    **注意：**

    1. 要写入特定编码的文本文件，请给`open()`函数传入`encoding`参数，将字符串自动转换成指定编码。
    2. 以`'w'`模式写入文件时，如果文件已存在，会直接覆盖（相当于删掉后新写入一个文件），可以传入`'a'`以追加（append）模式写入。



#### 10.2  StringIO和BytesIO

- **StringIO**

    很多时候，数据读写不一定是文件，也可以在内存中读写。

    **StringIO顾名思义就是在内存中读写str**。

    要把str写入StringIO，我们需要先创建一个StringIO，然后，**像文件一样写入**即可：

    ```python
    >>> from io import StringIO
    >>> f = StringIO()
    >>> f.write('hello')
    5
    >>> f.write(' ')
    1
    >>> f.write('world!')
    6
    >>> print(f.getvalue())
    hello world!
    ```

    **`getvalue()`方法用于获得写入后的str。**

    要读取StringIO，可以用一个str初始化StringIO，然后，**像读文件一样读取**：

    ```python
    >>> from io import StringIO
    >>> f = StringIO('Hello!\nHi!\nGoodbye!')
    >>> while True:
    ...     s = f.readline()
    ...     if s == '':
    ...         break
    ...     print(s.strip())
    ...
    Hello!
    Hi!
    Goodbye!
    ```

- **BytesIO**

    StringIO操作的只能是str，如果要操作二进制数据，就需要使用BytesIO。

    **BytesIO实现了在内存中读写bytes**，我们创建一个BytesIO，然后写入一些bytes：

    ```python
    >>> from io import BytesIO
    >>> f = BytesIO()
    >>> f.write('中文'.encode('utf-8'))
    6
    >>> print(f.getvalue())
    b'\xe4\xb8\xad\xe6\x96\x87'
    ```

    请注意，写入的不是str，而是经过UTF-8编码的bytes。

    **和StringIO类似，可以用一个bytes初始化BytesIO**，然后，像读文件一样读取：

    ```python
    >>> from io import BytesIO
    >>> f = BytesIO(b'\xe4\xb8\xad\xe6\x96\x87')
    >>> f.read()
    b'\xe4\xb8\xad\xe6\x96\x87'
    ```



#### 10.3  操作文件和目录

Python内置的`os`模块可以直接调用操作系统提供的接口函数。

打开Python交互式命令行，我们来看看如何使用`os`模块的基本功能：

```python
>>> import os
>>> os.name # 操作系统类型
'posix'
```

如果是`posix`，说明系统是`Linux`、`Unix`或`Mac OS X`，如果是`nt`，就是`Windows`系统。

要获取详细的系统信息，可以调用**`uname()`**函数：

```python
>>> os.uname()
posix.uname_result(sysname='Darwin', nodename='MichaelMacPro.local', release='14.3.0', version='Darwin Kernel Version 14.3.0: Mon Mar 23 11:59:05 PDT 2015; root:xnu-2782.20.48~5/RELEASE_X86_64', machine='x86_64')
```

注意`uname()`函数在Windows上不提供，也就是说，`os`模块的某些函数是跟操作系统相关的。



- **环境变量**

    **在操作系统中定义的环境变量，全部保存在`os.environ`这个变量中**，可以直接查看：

    ```python
    >>> os.environ
    environ({'VERSIONER_PYTHON_PREFER_32_BIT': 'no', 'TERM_PROGRAM_VERSION': '326', 'LOGNAME': 'michael', 'USER': 'michael', 'PATH': '/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:/opt/X11/bin:/usr/local/mysql/bin', ...})
    ```

    **要获取某个环境变量的值，可以调用`os.environ.get('key')`**：

    ```python
    >>> os.environ.get('PATH')
    '/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:/opt/X11/bin:/usr/local/mysql/bin'
    >>> os.environ.get('x', 'default')
    'default'
    ```

- **操作文件和目录**

    操作文件和目录的函数一部分放在`os`模块中，一部分放在`os.path`模块中，这一点要注意一下。查看、创建和删除目录可以这么调用：

    ```python
    # 查看当前目录的绝对路径:
    >>> os.path.abspath('.')
    '/Users/michael'
    # 在某个目录下创建一个新目录，首先把新目录的完整路径表示出来:
    >>> os.path.join('/Users/michael', 'testdir')
    '/Users/michael/testdir'
    # 然后创建一个目录:
    >>> os.mkdir('/Users/michael/testdir')
    # 删掉一个目录:
    >>> os.rmdir('/Users/michael/testdir')
    ```

    **把两个路径合成一个时，不要直接拼字符串，而要通过`os.path.join()`函数，这样可以正确处理不同操作系统的路径分隔符**。在Linux/Unix/Mac下，`os.path.join()`返回这样的字符串：

    ```python
    part-1/part-2
    ```

    而Windows下会返回这样的字符串：

    ```python
    part-1\part-2
    ```

    同样的道理，**要拆分路径时，也不要直接去拆字符串，而要通过`os.path.split()`函数，这样可以把一个**

    **路径拆分为两部分，后一部分总是最后级别的目录或文件名**：

    ```python
    >>> os.path.split('/Users/michael/testdir/file.txt')
    ('/Users/michael/testdir', 'file.txt')
    ```

    **`os.path.splitext()`可以直接让你得到文件扩展名**，很多时候非常方便：

    ```python
    >>> os.path.splitext('/path/to/file.txt')
    ('/path/to/file', '.txt')
    ```

    **注意：** 这些合并、拆分路径的函数并不要求目录和文件要真实存在，它们只对字符串进行操作。

    文件操作使用下面的函数。假定当前目录下有一个`test.txt`文件：

    ```python
    # 对文件重命名:
    >>> os.rename('test.txt', 'test.py')
    # 删掉文件:
    >>> os.remove('test.py')
    ```

    **注意：** `os`模块中未提供复制文件函数，可以通过`IO`操作和`shutil`模块的`copyfile()`实现文件复制。

    最后看看如何**利用Python的特性来过滤文件**。比如我们要列出当前目录下的所有目录，只需要一行代码：

    ```python
    >>> [x for x in os.listdir('.') if os.path.isdir(x)]
    ['.lein', '.local', '.m2', '.npm', '.ssh', '.Trash', '.vim', 'Applications', 'Desktop', ...]
    ```

    要列出所有的`.py`文件，也只需一行代码：

    ```python
    >>> [x for x in os.listdir('.') if os.path.isfile(x) and os.path.splitext(x)[1]=='.py']
    ['apis.py', 'config.py', 'models.py', 'pymonitor.py', 'test_db.py', 'urls.py', 'wsgiapp.py']
    ```

    **注意：** **`listdir()`**获取的是目录下的所有文件名和文件夹名，只是相对路径，若要遍历使用最好使用绝对路径。



#### 10.4  序列化

我们把**对象从内存中变成可存储或传输的过程称之为序列化**，序列化之后，就可以把序列化后的内容写入磁盘，或者通过网络传输到别的机器上。反过来，把**序列化的对象重新读到内存里称之为反序列化**，在Python中序列化叫pickling，反序列化叫unpickling。



Python提供了`pickle`模块来实现序列化。

- **序列化**

    首先，我们尝试把一个对象序列化并写入文件：

    ```python
    >>> import pickle
    >>> d = dict(name='Bob', age=20, score=88)
    >>> pickle.dumps(d)
    b'\x80\x03}q\x00(X\x03\x00\x00\x00ageq\x01K\x14X\x05\x00\x00\x00scoreq\x02KXX\x04\x00\x00\x00nameq\x03X\x03\x00\x00\x00Bobq\x04u.'
    ```

    **`pickle.dumps()`方法把任意对象序列化成一个`bytes`**，然后，就可以把这个`bytes`写入文件。或者用另一个方法**`pickle.dump()`直接把对象序列化后写入一个file-like Object**：

    ```python
    >>> f = open('dump.txt', 'wb')
    >>> pickle.dump(d, f)
    >>> f.close()
    ```

    看看写入的`dump.txt`文件，一堆乱七八糟的内容，这些都是Python保存的对象内部信息。

- **反序列化**

    当我们要把对象从磁盘读到内存时，可以先把内容读到一个`bytes`，然后用**`pickle.loads()`**方法反序列化出对象，也可以直接用**`pickle.load()`**方法从一个`file-like Object`中直接反序列化出对象。

    ```python
    >>> f = open('dump.txt', 'rb')
    >>> d = pickle.load(f)
    >>> f.close()
    >>> d
    {'age': 20, 'score': 88, 'name': 'Bob'}
    ```

    变量的内容又回来了！当然，这个变量和原来的变量是完全不相干的对象，它们只是内容相同而已。

- **JSON**

    如果我们**要在不同的编程语言之间传递对象，就必须把对象序列化为标准格式**，比如XML，但更好的方法是序列化为JSON。

    JSON表示的对象就是标准的JavaScript语言的对象，JSON和Python内置的数据类型对应如下：

    |  JSON类型  | Python类型 |
    | :--------: | :--------: |
    |     {}     |    dict    |
    |     []     |    list    |
    |  "string"  |    str     |
    |  1234.56   | int或float |
    | true/false | True/False |
    |    null    |    None    |

    Python内置的`json`模块提供了非常完善的Python对象到JSON格式的转换。我们先看看如何把Python对象变成一个JSON：

    ```python
    >>> import json
    >>> d = dict(name='Bob', age=20, score=88)
    >>> json.dumps(d)
    '{"age": 20, "score": 88, "name": "Bob"}'
    ```

    **`dumps()`**方法返回一个`str`，内容就是标准的JSON。类似的，**`dump()`**方法可以直接把JSON写入一个`file-like Object`。

    要把JSON反序列化为Python对象，用**`loads()`**或者对应的**`load()`**方法，前者把JSON的字符串反序列化，后者从`file-like Object`中读取字符串并反序列化：

    ```python
    >>> json_str = '{"age": 20, "score": 88, "name": "Bob"}'
    >>> json.loads(json_str)
    {'age': 20, 'score': 88, 'name': 'Bob'}
    ```

    由于JSON标准规定JSON编码是UTF-8，所以我们总是能正确地在Python的`str`与JSON的字符串之间转换。

- **JSON进阶**

    Python的`dict`对象可以直接序列化为JSON的`{}`，不过，很多时候，我们更喜欢用`class`表示对象，然后序列化。

    `dumps()`提供了可选参数`default`来定制JSON序列化，比如，把任意`class`的实例变为`dict`再序列化为JSON：

    ```python
    print(json.dumps(s, default=lambda obj: obj.__dict__))
    ```

    因为通常`class`的实例都有一个`__dict__`属性，它就是一个`dict`，用来存储实例变量。也有少数例外，比如定义了`__slots__`的class。

    **注意：**`default`也能指向自定义返回`dict`的函数。

    同样的道理，如果我们要把JSON反序列化为一个`Student`对象实例，`loads()`方法首先转换出一个`dict`对象，然后，我们传入的`object_hook`函数负责把`dict`转换为`Student`实例：

    ```python
    def dict2student(d):
        return Student(d['name'], d['age'], d['score'])
    ```

    运行结果如下：

    ```python
    >>> json_str = '{"age": 20, "score": 88, "name": "Bob"}'
    >>> print(json.loads(json_str, object_hook=dict2student))
    <__main__.Student object at 0x10cd3c190>
    ```

    打印出的是反序列化的`Student`实例对象。



------



### 11.  进程和线程

线程是最小的执行单元，而进程由至少一个线程组成。如何调度进程和线程，完全由操作系统决定，程序自己不能决定什么时候执行，执行多长时间。



#### 11.1  多进程

- **fork()**

    Unix/Linux操作系统提供了一个**`fork()`**系统调用，它非常特殊。普通的函数调用，调用一次，返回一次，但是**`fork()`调用一次，返回两次**，因为操作系统自动把当前进程（称为父进程）复制了一份（称为子进程），然后，分别在父进程和子进程内返回。

    **子进程永远返回`0`，而父进程返回子进程的ID**。这样做的理由是，一个父进程可以fork出很多子进程，所以，父进程要记下每个子进程的ID，而**子进程只需要调用`getppid()`就可以拿到父进程的ID**。

    可以使用`os`模块在Python程序中轻松地创建子进程：

    ```python
    import os
    
    print('Process (%s) start...' % os.getpid())
    # Only works on Unix/Linux/Mac:
    pid = os.fork()
    if pid == 0:
        print('I am child process (%s) and my parent is %s.' % (os.getpid(), os.getppid()))
    else:
        print('I (%s) just created a child process (%s).' % (os.getpid(), pid))
    ```

    运行结果如下：

    ```python
    Process (876) start...
    I (876) just created a child process (877).
    I am child process (877) and my parent is 876.
    ```

    由于Windows没有`fork`调用，上面的代码在Windows上无法运行。有了`fork`调用，一个进程在接到新任务时就可以复制出一个子进程来处理新任务。

- **multiprocessing模块**

    由于Python是跨平台的，因此也提供了一个跨平台的多进程支持的模块`multiprocessing`。**`multiprocessing`模块提供了一个`Process`类来代表一个进程对象**，下面的例子演示了启动一个子进程并等待其结束：

    ```python
    from multiprocessing import Process
    import os
    
    # 子进程要执行的代码
    def run_proc(name):
        print('Run child process %s (%s)...' % (name, os.getpid()))
    
    if __name__=='__main__':
        print('Parent process %s.' % os.getpid())
        p = Process(target=run_proc, args=('test',))
        print('Child process will start.')
        p.start()
        p.join()
        print('Child process end.')
    ```

    执行结果如下：

    ```python
    Parent process 928.
    Process will start.
    Run child process test (929)...
    Process end.
    ```

    **创建子进程时，只需要传入一个执行函数和函数的参数，创建一个`Process`实例，用`start()`方法启动**，这样创建进程比`fork()`还要简单。

    **`join()`方法可以等待子进程结束后再继续往下运行，通常用于进程间的同步**。

- **Pool**

    如果要启动大量的子进程，可以用进程池的方式批量创建子进程：

    ```python
    from multiprocessing import Pool
    import os, time, random
    
    def long_time_task(name):
        print('Run task %s (%s)...' % (name, os.getpid()))
        start = time.time()
        time.sleep(random.random() * 3)
        end = time.time()
        print('Task %s runs %0.2f seconds.' % (name, (end - start)))
    
    if __name__=='__main__':
        print('Parent process %s.' % os.getpid())
        p = Pool(4)
        for i in range(5):
            p.apply_async(long_time_task, args=(i,))
        print('Waiting for all subprocesses done...')
        p.close()
        p.join()
        print('All subprocesses done.')
    ```

    执行结果如下：

    ```python
    Parent process 669.
    Waiting for all subprocesses done...
    Run task 0 (671)...
    Run task 1 (672)...
    Run task 2 (673)...
    Run task 3 (674)...
    Task 2 runs 0.14 seconds.
    Run task 4 (673)...
    Task 1 runs 0.27 seconds.
    Task 3 runs 0.86 seconds.
    Task 0 runs 1.41 seconds.
    Task 4 runs 1.91 seconds.
    All subprocesses done.
    ```

    **对`Pool`对象调用`join()`方法会等待所有子进程执行完毕，调用`join()`之前必须先调用`close()`，调用`close()`之后就不能继续添加新的`Process`了**。

    请注意输出的结果，task `0`，`1`，`2`，`3`是立刻执行的，而task `4`要等待前面某个task完成后才执行，这是因为`Pool`的默认大小在我的电脑上是4，因此，最多同时执行4个进程。这是`Pool`有意设计的限制，并不是操作系统的限制。如果改成：

    ```python
    p = Pool(5)
    ```

    就可以同时跑5个进程。

    **`Pool()`的默认大小是CPU的核数，可以指定它的大小，表示最多可以同时执行的进程数。**

- **子进程**

    很多时候，子进程并不是自身，而是一个外部进程。我们创建了子进程后，还需要控制子进程的输入和输出。

    `subprocess`模块可以让我们非常方便地启动一个子进程，然后控制其输入和输出。

    下面的例子演示了如何在Python代码中运行命令`nslookup www.python.org`，这和命令行直接运行的效果是一样的：

    ```python
    import subprocess
    
    print('$ nslookup www.python.org')
    r = subprocess.call(['nslookup', 'www.python.org'])
    print('Exit code:', r)
    ```

    运行结果：

    ```python
    $ nslookup www.python.org
    Server:        192.168.19.4
    Address:    192.168.19.4#53
    
    Non-authoritative answer:
    www.python.org    canonical name = python.map.fastly.net.
    Name:    python.map.fastly.net
    Address: 199.27.79.223
    
    Exit code: 0
    ```

    如果子进程还需要输入，则可以通过`communicate()`方法输入：

    ```python
    import subprocess
    
    print('$ nslookup')
    p = subprocess.Popen(['nslookup'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    output, err = p.communicate(b'set q=mx\npython.org\nexit\n')
    print(output.decode('utf-8'))
    print('Exit code:', p.returncode)
    ```

    上面的代码相当于在命令行执行命令`nslookup`，然后手动输入：

    ```python
    set q=mx
    python.org
    exit
    ```

- **进程间通信**

    Python的`multiprocessing`模块包装了底层的机制，提供了`Queue`、`Pipes`等多种方式来交换数据。

    我们以`Queue`为例，在父进程中创建两个子进程，一个往`Queue`里写数据，一个从`Queue`里读数据：

    ```python
    from multiprocessing import Process, Queue
    import os, time, random
    
    # 写数据进程执行的代码:
    def write(q):
        print('Process to write: %s' % os.getpid())
        for value in ['A', 'B', 'C']:
            print('Put %s to queue...' % value)
            q.put(value)
            time.sleep(random.random())
    
    # 读数据进程执行的代码:
    def read(q):
        print('Process to read: %s' % os.getpid())
        while True:
            value = q.get(True)
            print('Get %s from queue.' % value)
    
    if __name__=='__main__':
        # 父进程创建Queue，并传给各个子进程：
        q = Queue()
        pw = Process(target=write, args=(q,))
        pr = Process(target=read, args=(q,))
        # 启动子进程pw，写入:
        pw.start()
        # 启动子进程pr，读取:
        pr.start()
        # 等待pw结束:
        pw.join()
        # pr进程里是死循环，无法等待其结束，只能强行终止:
        pr.terminate()
    ```

    运行结果如下：

    ```python
    Process to write: 50563
    Put A to queue...
    Process to read: 50564
    Get A from queue.
    Put B to queue...
    Get B from queue.
    Put C to queue...
    Get C from queue.
    ```

    在Unix/Linux下，`multiprocessing`模块封装了`fork()`调用，使我们不需要关注`fork()`的细节。由于Windows没有`fork`调用，因此，`multiprocessing`需要“模拟”出`fork`的效果，父进程所有Python对象都必须通过pickle序列化再传到子进程去，所有，如果`multiprocessing`在Windows下调用失败了，要先考虑是不是pickle失败了。

##### 小结：

1. 在Unix/Linux下，可以使用`fork()`调用实现多进程。
2. 要实现跨平台的多进程，可以使用`multiprocessing`模块。
3. 进程间通信是通过`Queue`、`Pipes`等实现的。



#### 11.2  多线程

多任务可以由多进程完成，也可以由一个进程内的多线程完成。

Python的标准库提供了两个模块：`_thread`和`threading`，`_thread`是低级模块，`threading`是高级模块，对`_thread`进行了封装。绝大多数情况下，我们只需要使用`threading`这个高级模块。

**启动一个线程就是把一个函数传入并创建`Thread`实例，然后调用`start()`开始执行**：

```python
import time, threading

# 新线程执行的代码:
def loop():
    print('thread %s is running...' % threading.current_thread().name)
    n = 0
    while n < 3:
        n = n + 1
        print('thread %s >>> %s' % (threading.current_thread().name, n))
        time.sleep(1)
    print('thread %s ended.' % threading.current_thread().name)

print('thread %s is running...' % threading.current_thread().name)
t = threading.Thread(target=loop, name='LoopThread')
t.start()
t.join()
print('thread %s ended.' % threading.current_thread().name)
```

执行结果如下：

```python
thread MainThread is running...
thread LoopThread is running...
thread LoopThread >>> 1
thread LoopThread >>> 2
thread LoopThread >>> 3
thread LoopThread ended.
thread MainThread ended.
```

由于**任何进程默认就会启动一个线程，我们把该线程称为主线程**，主线程又可以启动新的线程，Python的`threading`模块有个**`current_thread()`**函数，它永远返回当前线程的实例。主线程实例的名字叫`MainThread`，子线程的名字在创建时指定，仅用来区别线程无其他意义。



- **lock**

    多线程和多进程最大的不同：

    - **多进程中，同一个变量，各自有一份拷贝存在于每个进程中，互不影响；**

    - **多线程中，所有变量都由所有线程共享，所以，任何一个变量都可以被任何一个线程修改**。

    因此，在多线程中同时访问修改同一块数据就有可能造成数据错误，可以通过使用`lock`来避免这种问题。**被`lock`锁住的部分，无论多少线程，同一时刻最多都只有一个线程持有该锁可以执行，其他线程必须等待锁被释放获取到锁后才可以执行**。因此，不会造成修改的冲突，创建一个锁就是通过`threading.Lock()`来实现：

    ```python
    balance = 0
    lock = threading.Lock()
    
    def run_thread(n):
        for i in range(100000):
            # 先要获取锁:
            lock.acquire()
            try:
                # 放心地改吧:
                change_it(n)
            finally:
                # 改完了一定要释放锁:
                lock.release()
    ```

    **获得锁的线程用完后一定要释放锁**，否则那些苦苦等待锁的线程将永远等待下去，成为死线程。所以我们**用`try...finally`来确保锁一定会被释放**。

    **锁的坏处：**

    1. 阻止了多线程并发执行，包含锁的某段代码实际上只能以单线程模式执行，效率就大大地下降了；
    2. 由于可以存在多个锁，不同的线程持有不同的锁，并试图获取对方持有的锁时，可能会造成死锁，导致多个线程全部挂起，既不能执行，也无法结束，只能靠操作系统强制终止。

- **多核cpu**

    要想把N核CPU的核心全部跑满，就必须启动N个死循环线程。

    试试用Python写个死循环：

    ```python
    import threading, multiprocessing
    
    def loop():
        x = 0
        while True:
            x = x ^ 1
    
    for i in range(multiprocessing.cpu_count()):
        t = threading.Thread(target=loop)
        t.start()
    ```

    启动与CPU核心数量相同的N个线程，在4核CPU上可以监控到CPU占用率仅有102%，也就是仅使用了一核。

    但是用C、C++或Java来改写相同的死循环，直接可以把全部核心跑满，4核就跑到400%，8核就跑到800%，为什么Python不行呢？

    因为Python的线程虽然是真正的线程，但解释器执行代码时，有一个**GIL锁**：Global Interpreter Lock，**任何Python线程执行前，必须先获得GIL锁，然后，每执行100条字节码，解释器就自动释放GIL锁，让别的线程有机会执行。**这个GIL全局锁实际上把所有线程的执行代码都给上了锁，所以，多线程在Python中只能交替执行，即使100个线程跑在100核CPU上，也只能用到1个核。

    GIL是Python解释器设计的历史遗留问题，通常我们用的解释器是官方实现的CPython，要真正利用多核，除非重写一个不带GIL的解释器。



##### 小结：

1. 多线程编程，模型复杂，容易发生冲突，必须用锁加以隔离，同时，又要小心死锁的发生。
2. Python解释器由于设计时有GIL全局锁，导致了多线程无法利用多核。多线程的并发在Python中就是一个美丽的梦。



#### 11.3  **ThreadLocal**

在多线程环境下，每个线程都有自己的数据。一个线程使用自己的局部变量比使用全局变量好，因为局部变量只有线程自己能看见，不会影响其他线程，而全局变量的修改必须加锁。

但是局部变量也有问题，就是在函数调用的时候，传递起来很麻烦：

```python
def process_student(name):
    std = Student(name)
    # std是局部变量，但是每个函数都要用它，因此必须传进去：
    do_task_1(std)
    do_task_2(std)

def do_task_1(std):
    do_subtask_1(std)
    do_subtask_2(std)

def do_task_2(std):
    do_subtask_1(std)
    do_subtask_2(std)
```

每个函数一层一层调用都这么传参数那还得了？用全局变量？也不行，因为每个线程处理不同的`Student`对象，不能共享。

如果用一个全局`dict`存放所有的`Student`对象，然后以`thread`自身作为`key`获得线程对应的`Student`对象如何？

```python
global_dict = {}

def std_thread(name):
    std = Student(name)
    # 把std放到全局变量global_dict中：
    global_dict[threading.current_thread()] = std
    do_task_1()
    do_task_2()

def do_task_1():
    # 不传入std，而是根据当前线程查找：
    std = global_dict[threading.current_thread()]
    ...

def do_task_2():
    # 任何函数都可以查找出当前线程的std变量：
    std = global_dict[threading.current_thread()]
    ...
```

这种方式理论上是可行的，它最大的优点是消除了`std`对象在每层函数中的传递问题，但是，每个函数获取`std`的代码有点丑。

`ThreadLocal`应运而生，不用查找`dict`，`ThreadLocal`帮你自动做这件事：

```python
import threading

# 创建全局ThreadLocal对象:
local_school = threading.local()

def process_student():
    # 获取当前线程关联的student:
    std = local_school.student
    print('Hello, %s (in %s)' % (std, threading.current_thread().name))

def process_thread(name):
    # 绑定ThreadLocal的student:
    local_school.student = name
    process_student()

t1 = threading.Thread(target= process_thread, args=('Alice',), name='Thread-A')
t2 = threading.Thread(target= process_thread, args=('Bob',), name='Thread-B')
t1.start()
t2.start()
t1.join()
t2.join()
```

执行结果：

```python
Hello, Alice (in Thread-A)
Hello, Bob (in Thread-B)
```

可以把`local_school`看成是一个全局`dict`，但每个属性如`local_school.student`都是线程的局部变量，可以任意读写而互不干扰，也不用管理锁的问题，`ThreadLocal`内部会处理。

**`ThreadLocal`最常用的地方就是为每个线程绑定一个数据库连接，HTTP请求，用户身份信息等，这样一个线程的所有调用到的处理函数都可以非常方便地访问这些资源。**



##### 小结：

一个`ThreadLocal`变量虽然是全局变量，但每个线程都只能读写自己线程的独立副本，互不干扰。`ThreadLocal`解决了参数在一个线程中各个函数之间互相传递的问题。



#### 11.4  进程 vs. 线程

要实现多任务，通常我们会设计Master-Worker模式，Master负责分配任务，Worker负责执行任务，因此，多任务环境下，通常是一个Master，多个Worker：

1. 如果用多进程实现Master-Worker，主进程就是Master，其他进程就是Worker。
    - 优点：稳定性高，因为一个子进程崩溃了，不会影响主进程和其他子进程；
    - 缺点：创建进程的代价大，在Unix/Linux系统下，用`fork`调用还行，在Windows下创建进程开销巨大。
2. 如果用多线程实现Master-Worker，主线程就是Master，其他线程就是Worker。
    - 优点：通常比多进程快一点，但是也快不了多少；
    - 缺点：任何一个线程挂掉都可能直接造成整个进程崩溃，因为所有线程共享进程的内存。



- **线程切换**

    操作系统在切换进程或者线程时，它需要先保存当前执行的现场环境（CPU寄存器状态、内存页等），然后，把新任务的执行环境准备好（恢复上次的寄存器状态，切换内存页等），才能开始执行。这个切换过程虽然很快，但是也需要耗费时间。如果有几千个任务同时进行，操作系统可能就主要忙着切换任务，根本没有多少时间去执行任务了，这种情况最常见的就是硬盘狂响，点窗口无反应，系统处于假死状态。

    所以，**多任务一旦多到一个限度，就会消耗掉系统所有的资源，结果效率急剧下降，所有任务都做不好**。

- **计算密集型 vs. IO密集型**

    是否采用多任务的第二个考虑是任务的类型，我们可以把任务分为计算密集型和IO密集型。

    - 计算密集型任务：进行大量的计算，消耗CPU资源，比如计算圆周率、对视频进行高清解码等等。这种计算密集型任务虽然也可以用多任务完成，但是任务越多，花在任务切换的时间就越多，CPU执行任务的效率就越低，所以，要最高效地利用CPU，**计算密集型任务同时进行的数量应当等于CPU的核心数**。
        - 计算密集型任务由于主要消耗CPU资源，因此，代码运行效率至关重要。Python这样的脚本语言运行效率很低，完全不适合计算密集型任务。**对于计算密集型任务，最好用C语言编写**。

    - IO密集型任务：涉及到网络、磁盘IO的任务都是IO密集型任务，这类任务的特点是CPU消耗很少，任务的大部分时间都在等待IO操作完成（因为IO的速度远远低于CPU和内存的速度）。**对于IO密集型任务，任务越多，CPU效率越高，但也有一个限度**。常见的大部分任务都是IO密集型任务，比如Web应用。
        - IO密集型任务执行期间，99%的时间都花在IO上，花在CPU上的时间很少，因此，用运行速度极快的C语言替换用Python这样运行速度极低的脚本语言，完全无法提升运行效率。**对于IO密集型任务，脚本语言是首选，C语言最差。**

- **异步IO**

    现代操作系统对IO操作已经做了巨大的改进，最大的特点就是支持异步IO。如果充分利用操作系统提供的异步IO支持，就可以用单进程单线程模型来执行多任务，这种全新的模型称为事件驱动模型，Nginx就是支持异步IO的Web服务器，它在单核CPU上采用单进程模型就可以高效地支持多任务。在多核CPU上，可以运行多个进程（数量与CPU核心数相同），充分利用多核CPU。由于系统总的进程数量十分有限，因此操作系统调度非常高效。用异步IO编程模型来实现多任务是一个主要的趋势。

    **对应到Python语言，单线程的异步编程模型称为协程，有了协程的支持，就可以基于事件驱动编写高效的多任务程序**。



#### 11.5  分布式进程

**在Thread和Process中，应当优选Process**，不仅因为Process更稳定，而且，Process可以分布到多台机器上，而Thread最多只能分布到同一台机器的多个CPU上。

Python的`multiprocessing`模块不但支持多进程，其中`managers`子模块还支持把多进程分布到多台机器上。一个服务进程可以作为调度者，将任务分布到其他多个进程中，依靠网络通信。由于`managers`模块封装很好，不必了解网络通信的细节，就可以很容易地编写分布式多进程程序。

举个例子：如果我们已经有一个通过`Queue`通信的多进程程序在同一台机器上运行，现在，由于处理任务的进程任务繁重，希望把发送任务的进程和处理任务的进程分布到两台机器上。怎么用分布式进程实现？

原有的`Queue`可以继续使用，但是，通过`managers`模块把`Queue`通过网络暴露出去，就可以让其他机器的进程访问`Queue`了。

我们先看服务进程，服务进程负责启动`Queue`，把`Queue`注册到网络上，然后往`Queue`里面写入任务：

```python
# task_master.py

import random, time, queue
from multiprocessing.managers import BaseManager

# 发送任务的队列:
task_queue = queue.Queue()
# 接收结果的队列:
result_queue = queue.Queue()

# 从BaseManager继承的QueueManager:
class QueueManager(BaseManager):
    pass

# 把两个Queue都注册到网络上, callable参数关联了Queue对象:
QueueManager.register('get_task_queue', callable=lambda: task_queue)
QueueManager.register('get_result_queue', callable=lambda: result_queue)
# 绑定端口5000, 设置验证码'abc':
manager = QueueManager(address=('', 5000), authkey=b'abc')
# 启动Queue:
manager.start()
# 获得通过网络访问的Queue对象:
task = manager.get_task_queue()
result = manager.get_result_queue()
# 放几个任务进去:
for i in range(5):
    n = random.randint(0, 10000)
    print('Put task %d...' % n)
    task.put(n)
# 从result队列读取结果:
print('Try get results...')
for i in range(5):
    r = result.get(timeout=10)
    print('Result: %s' % r)
# 关闭:
manager.shutdown()
print('master exit.')
```

请注意，当我们在一台机器上写多进程程序时，创建的`Queue`可以直接拿来用，但是，**在分布式多进程环境下，添加任务到`Queue`不可以直接对原始的`task_queue`进行操作，那样就绕过了`QueueManager`的封装，必须通过`manager.get_task_queue()`获得的`Queue`接口添加**。

然后，在另一台机器上启动任务进程（本机上启动也可以）：

```python
# task_worker.py

import time, sys, queue
from multiprocessing.managers import BaseManager

# 创建类似的QueueManager:
class QueueManager(BaseManager):
    pass

# 由于这个QueueManager只从网络上获取Queue，所以注册时只提供名字:
QueueManager.register('get_task_queue')
QueueManager.register('get_result_queue')

# 连接到服务器，也就是运行task_master.py的机器:
server_addr = '127.0.0.1'
print('Connect to server %s...' % server_addr)
# 端口和验证码注意保持与task_master.py设置的完全一致:
m = QueueManager(address=(server_addr, 5000), authkey=b'abc')
# 从网络连接:
m.connect()
# 获取Queue的对象:
task = m.get_task_queue()
result = m.get_result_queue()
# 从task队列取任务,并把结果写入result队列:
for i in range(5):
    try:
        n = task.get(timeout=1)
        print('run task %d * %d...' % (n, n))
        r = '%d * %d = %d' % (n, n, n*n)
        time.sleep(1)
        result.put(r)
    except Queue.Empty:
        print('task queue is empty.')
# 处理结束:
print('worker exit.')
```

**任务进程要通过网络连接到服务进程，所以要指定服务进程的IP，`authkey`是用来验证通信的，必须保持一致。**

现在，可以试试分布式进程的工作效果了。先启动`task_master.py`服务进程：

```python
$ python3 task_master.py 
Put task 3411...
Put task 1605...
Put task 1398...
Put task 4729...
Put task 5300...
Try get results...
```

`task_master.py`进程发送完任务后，开始等待`result`队列的结果。现在启动`task_worker.py`进程：

```python
$ python3 task_worker.py
Connect to server 127.0.0.1...
run task 3411 * 3411...
run task 1605 * 1605...
run task 1398 * 1398...
run task 4729 * 4729...
run task 5300 * 5300...
worker exit.
```

`task_worker.py`进程结束，在`task_master.py`进程中会继续打印出结果：

```python
Result: 3411 * 3411 = 11634921
Result: 1605 * 1605 = 2576025
Result: 1398 * 1398 = 1954404
Result: 4729 * 4729 = 22363441
Result: 5300 * 5300 = 28090000
```

这个简单的Master/Worker模型有什么用？其实这就是一个简单但真正的分布式计算，把代码稍加改造，启动多个worker，就可以把任务分布到几台甚至几十台机器上，比如把计算`n*n`的代码换成发送邮件，就实现了邮件队列的异步发送。

Queue对象存储在哪？注意到`task_worker.py`中根本没有创建Queue的代码，所以，Queue对象存储在`task_master.py`进程中：

![PrtScr capture.png](https://i.loli.net/2018/12/10/5c0e368a474a4.png)

**而`Queue`之所以能通过网络访问，就是通过`QueueManager`实现的。由于`QueueManager`管理的不止一个`Queue`，所以，要给每个`Queue`的网络调用接口起个名字，比如`get_task_queue`。**



------



### 12.  正则表达式

| 正则表达式 | 意义                                                         |
| :--------: | :----------------------------------------------------------- |
|    `\d`    | 匹配一个数字                                                 |
|    `\w`    | 匹配一个字母或数字                                           |
|    `\s`    | 匹配一个空格（也包括Tab等空白符）                            |
|    `.`     | 匹配任意字符                                                 |
|    `*`     | 表示任意个字符（包括0个）                                    |
|    `+`     | 表示至少一个字符                                             |
|    `?`     | 表示0个或1个字符                                             |
|   `{n}`    | 表示n个字符                                                  |
|  `{n,m}`   | 表示n-m个字符                                                |
|    `[]`    | 表示范围，如：`[0-9]`表示任意数字，`[\s\d]`则表示空格或数字等 |
|    `()`    | 表示一组表达式，如：`([0-9]|[a-z]|[A-Z])`相当于`\w`          |
|    `^`     | 表示行的开头                                                 |
|    `$`     | 表示行的结束                                                 |



- **re模块**

    Python提供`re`模块，包含所有正则表达式的功能。由于Python的字符串本身也用`\`转义，所以要特别注意：

    ```python
    s = 'ABC\\-001' # Python的字符串
    # 对应的正则表达式字符串变成：
    # 'ABC\-001'
    ```

    因此我们强烈建议使用Python的`r`前缀，就不用考虑转义的问题了：

    ```python
    s = r'ABC\-001' # Python的字符串
    # 对应的正则表达式字符串不变：
    # 'ABC\-001'
    ```

    **`match()`方法判断是否匹配，如果匹配成功，返回一个`Match`对象，否则返回`None`。**常见的判断方法就是：

    ```python
    test = '用户输入的字符串'
    if re.match(r'正则表达式', test):
        print('ok')
    else:
        print('failed')
    ```

- **切分字符串**

    用正则表达式切分字符串比用固定的字符更灵活，请看正常的切分代码：

    ```python
    >>> 'a b   c'.split(' ')
    ['a', 'b', '', '', 'c']
    ```

    嗯，无法识别连续的空格，用正则表达式试试：

    ```python
    >>> re.split(r'\s+', 'a b   c')
    ['a', 'b', 'c']
    ```

    无论多少个空格都可以正常分割。加入`,`试试：

    ```python
    >>> re.split(r'[\s\,]+', 'a,b, c  d')
    ['a', 'b', 'c', 'd']
    ```

    再加入`;`试试：

    ```python
    >>> re.split(r'[\s\,\;]+', 'a,b;; c  d')
    ['a', 'b', 'c', 'd']
    ```

    如果用户输入了一组标签，下次记得用正则表达式来把不规范的输入转化成正确的数组。

- **分组**

    除了简单地判断是否匹配之外，正则表达式还有提取子串的强大功能。**用`()`表示的就是要提取的分组（Group）**。比如：

    ```python
    >>> m = re.match(r'^(\d{3})-(\d{3,8})$', '010-12345')
    >>> m
    <_sre.SRE_Match object; span=(0, 9), match='010-12345'>
    >>> m.group(0)
    '010-12345'
    >>> m.group(1)
    '010'
    >>> m.group(2)
    '12345'
    ```

    如果正则表达式中定义了组，就可以在`Match`对象上用`group()`方法提取出子串来。

    注意到**`group(0)`永远是原始字符串，`group(1)`、`group(2)`……表示第1、2、……个子串**。

- **贪婪匹配**

    **正则匹配默认是贪婪匹配，也就是匹配尽可能多的字符，不管后面的表达式是否与它匹配到相同的**字符。举例如下，匹配出数字后面的`0`：

    ```python
    >>> re.match(r'^(\d+)(0*)$', '102300').groups()
    ('102300', '')
    ```

    由于`\d+`采用贪婪匹配，直接把后面的`0`全部匹配了，结果`0*`只能匹配空字符串了。

    必须让`\d+`采用非贪婪匹配（也就是尽可能少匹配），才能把后面的`0`匹配出来，**加个`?`就可以让`\d+`采用非贪婪匹配**：

    ```python
    >>> re.match(r'^(\d+?)(0*)$', '102300').groups()
    ('1023', '00')
    ```

- **编译**

    当我们在Python中使用正则表达式时，re模块内部会干两件事情：

    1. **编译正则表达式**，如果正则表达式的字符串本身不合法，会报错；
    2. **用编译后的正则表达式去匹配字符串**。

    如果一个正则表达式要重复使用几千次，出于效率的考虑，我们可以预编译该正则表达式，接下来重复使用时就不需要编译这个步骤了，直接匹配：

    ```python
    >>> import re
    # 编译:
    >>> re_telephone = re.compile(r'^(\d{3})-(\d{3,8})$')
    # 使用：
    >>> re_telephone.match('010-12345').groups()
    ('010', '12345')
    >>> re_telephone.match('010-8086').groups()
    ('010', '8086')
    ```

    编译后生成Regular Expression对象，由于该对象自己包含了正则表达式，所以调用对应的方法时不用给出正则字符串。



------



### 13.  常用内建模块



#### 13.1  datetime

- **获取当前日期和时间：**

    **`datetime.now()`返回当前日期和时间，其类型是`datetime`**。

    ```python
    >>> from datetime import datetime
    >>> now = datetime.now() # 获取当前datetime
    >>> print(now)
    2018-12-18 16:28:07.198690
    >>> print(type(now))
    <class 'datetime.datetime'>
    ```

    注意到`datetime`是模块，**`datetime`模块还包含一个`datetime`类**，通过`from datetime import datetime`导入的才是`datetime`这个类。如果仅导入`import datetime`，则必须引用全名`datetime.datetime`。

- **获取指定日期和时间：**

    要指定某个日期和时间，我们直接用参数构造一个`datetime`：

    ```python
    >>> from datetime import datetime
    >>> dt = datetime(2015, 4, 19, 12, 20) # 用指定日期时间创建datetime
    >>> print(dt)
    2015-04-19 12:20:00
    ```

- **datetime转换为timestamp：**

    在计算机中，时间实际上是用数字表示的。我们把1970年1月1日 00:00:00 UTC+00:00时区的时刻称为epoch time，记为`0`（1970年以前的时间timestamp为负数），**当前时间就是相对于epoch time的秒数，称为timestamp**。

    你可以认为：

    ```python
    timestamp = 0 = 1970-1-1 00:00:00 UTC+0:00
    ```

    对应的北京时间是：

    ```python
    timestamp = 0 = 1970-1-1 08:00:00 UTC+8:00
    ```

    只需**调用`timestamp()`就可以得到`datetime`类型对应的timestamp**：

    ```python
    >>> from datetime import datetime
    >>> dt = datetime(2015, 4, 19, 12, 20) # 用指定日期时间创建datetime
    >>> dt.timestamp() # 把datetime转换为timestamp
    1429417200.0
    ```

    **注意：**

    1. Python的timestamp是一个浮点数。如果有小数位，小数位表示毫秒数。
    2. 某些编程语言（如Java和JavaScript）的timestamp使用整数表示毫秒数，这种情况下只需要把timestamp除以1000就得到Python的浮点表示方法。

- **timestamp转换为datetime：**

    **使用`datetime.fromtimestamp()`方法可以将timestamp转换为本地时间**：

    ```python
    >>> from datetime import datetime
    >>> t = 1429417200.0
    >>> print(datetime.fromtimestamp(t))
    2015-04-19 12:20:00
    ```

    **使用`datetime.utcfromtimestamp()`可以将timestamp转换到UTC标准时区的时间**：

    ```python
    >>> from datetime import datetime
    >>> t = 1429417200.0
    >>> print(datetime.fromtimestamp(t)) # 本地时间
    2015-04-19 12:20:00
    >>> print(datetime.utcfromtimestamp(t)) # UTC时间
    2015-04-19 04:20:00
    ```

- **str转换为datetime：**

    很多时候，用户输入的日期和时间是字符串，要处理日期和时间，首先必须把str转换为datetime。**通过`datetime.strptime()`就可以将字符串转化为时间，需要一个日期和时间的格式化字符串**：

    ```
    >>> from datetime import datetime
    >>> cday = datetime.strptime('2015-6-1 18:19:59', '%Y-%m-%d %H:%M:%S')
    >>> print(cday)
    2015-06-01 18:19:59
    ```

    **注意：**

    1. 字符串`'%Y-%m-%d %H:%M:%S'`规定了日期和时间部分的格式。
    2. 转换后的datetime是没有时区信息的。

- **datetime转换为str：**

    **通过`strftime()`就可以将datetime对象转化为字符串，同样需要一个日期和时间的格式化字符串**：

    ```python
    >>> from datetime import datetime
    >>> now = datetime.now()
    >>> print(now.strftime('%a, %b %d %H:%M'))
    Mon, May 05 16:28
    ```

- **datetime加减：**

    **通过`timedelta`这个类以及`+`和`-`运算符就可以直接对日期和时间进行加减，得到新的datetime**：

    ```python
    >>> from datetime import datetime, timedelta
    >>> now = datetime.now()
    >>> print(now)
    2018-12-17 16:48:02.149302
    >>> now += timedelta(hours=10)
    >>> print(now)
    2018-12-18 02:48:02.149302
    >>> now -= timedelta(days=1)
    >>> print(now)
    2018-12-17 02:48:02.149302
    >>> now += timedelta(days=2, hours=12)
    >>> print(now)
    2018-12-19 14:48:02.149302
    ```

- **本地时间转换为UTC时间：**

    本地时间是指系统设定时区的时间，例如：北京时间是UTC+8:00时区的时间，而UTC时间指UTC+0:00时区的时间。

    **`datetime`类型有一个时区属性`tzinfo`，默认为`None`，但是可以通过`replace()`给`datetime`对象强制设置一个时区**：

    ```python
    >>> from datetime import datetime, timedelta, timezone
    >>> tz_utc_8 = timezone(timedelta(hours=8)) # 创建时区UTC+8:00
    >>> now = datetime.now()
    >>> now
    datetime.datetime(2015, 5, 18, 17, 2, 10, 871012)
    >>> dt = now.replace(tzinfo=tz_utc_8) # 强制设置为UTC+8:00
    >>> dt
    datetime.datetime(2015, 5, 18, 17, 2, 10, 871012, tzinfo=datetime.timezone(datetime.timedelta(0, 28800)))
    ```

    如果系统时区恰好是UTC+8:00，那么上述代码就是正确的，否则，不能强制设置为UTC+8:00时区。

- **时区转换：**

    **可以通过`utcnow()`拿到当前的UTC时间，通过`astimezone()`转换为任意时区的时间**：

    ```python
    # 拿到UTC时间，并强制设置时区为UTC+0:00:
    >>> utc_dt = datetime.utcnow().replace(tzinfo=timezone.utc)
    >>> print(utc_dt)
    2015-05-18 09:05:12.377316+00:00
    # astimezone()将转换时区为北京时间:
    >>> bj_dt = utc_dt.astimezone(timezone(timedelta(hours=8)))
    >>> print(bj_dt)
    2015-05-18 17:05:12.377316+08:00
    # astimezone()将转换时区为东京时间:
    >>> tokyo_dt = utc_dt.astimezone(timezone(timedelta(hours=9)))
    >>> print(tokyo_dt)
    2015-05-18 18:05:12.377316+09:00
    # astimezone()将bj_dt转换时区为东京时间:
    >>> tokyo_dt2 = bj_dt.astimezone(timezone(timedelta(hours=9)))
    >>> print(tokyo_dt2)
    2015-05-18 18:05:12.377316+09:00
    ```

    时区转换的关键在于，拿到一个`datetime`时，要获知其正确的时区，然后强制设置时区，作为基准时间。

    利用带时区的`datetime`，通过`astimezone()`方法，可以转换到任意时区。



##### 小结:

1. `datetime`表示的时间需要时区信息才能确定一个特定的时间，否则只能视为本地时间。
2. 如果要存储`datetime`，最佳方法是将其转换为timestamp再存储，因为timestamp的值与时区完全无关。



#### 13.2  collections

