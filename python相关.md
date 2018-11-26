

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

**只写`[:]`可以原样复制一个list：**

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



##### 4.4.1  创建generator方法：

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

- **注意：**

    **用`for`循环调用generator时，无法拿到generator的`return`语句的返回值。如果想要拿到返回值，必须捕获`StopIteration`错误，返回值包含在`StopIteration`的`value`中：**

    ```
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



#### 7.1  