### Rust 基础入门

[TOC]





#### 1. 变量绑定与解构



##### 1.1 变量命名

在命名方面，和其它语言没有区别，不过当给变量命名时，需要遵循 [Rust 命名规范](https://course.rs/practice/naming.html)。



通常，对于 **type-level** 的构造 Rust 倾向于使用**驼峰命名法**，而对于 **value-level** 的构造使用**蛇形命名法**。详情如下：

| 条目                               | 惯例                                                         |
| ---------------------------------- | ------------------------------------------------------------ |
| 包 Crates                          | [unclear](https://github.com/rust-lang/api-guidelines/issues/29) |
| 模块 Modules                       | `snake_case`                                                 |
| 类型 Types                         | `UpperCamelCase`                                             |
| 特征 Traits                        | `UpperCamelCase`                                             |
| 枚举 Enumerations                  | `UpperCamelCase`                                             |
| 结构体 Structs                     | `UpperCamelCase`                                             |
| 函数 Functions                     | `snake_case`                                                 |
| 方法 Methods                       | `snake_case`                                                 |
| 通用构造器 General constructors    | `new` or `with_more_details`                                 |
| 转换构造器 Conversion constructors | `from_some_other_type`                                       |
| 宏 Macros                          | `snake_case!`                                                |
| 局部变量 Local variables           | `snake_case`                                                 |
| 静态类型 Statics                   | `SCREAMING_SNAKE_CASE`                                       |
| 常量 Constants                     | `SCREAMING_SNAKE_CASE`                                       |
| 类型参数 Type parameters           | `UpperCamelCase`，通常使用一个大写字母: `T`                  |
| 生命周期 Lifetimes                 | 通常使用小写字母: `'a`，`'de`，`'src`                        |
| Features                           | [unclear](https://github.com/rust-lang/api-guidelines/issues/101) but see [C-FEATURE](https://course.rs/practice/naming.html#c-feature) |

对于**驼峰命名法**，复合词的缩略形式我们认为是一个单独的词语，所以**只对首字母进行大写**：使用 `Uuid` 而不是 ~~`UUID`~~，`Usize` 而不是 ~~`USize`~~，`Stdin` 而不是 ~~`StdIn`~~。

对于**蛇形命名法**，缩略词用全小写：`is_xid_start`。

对于**蛇形命名法**（包括全大写的 `SCREAMING_SNAKE_CASE`），除了最后一部分，其它部分的词语都不能由单个字母组成： `btree_map` 而不是 ~~`b_tree_map`~~，`PI_2` 而不是 ~~`PI2`~~.

包名**不应该**使用 `-rs` 或者 `-rust` 作为后缀，因为每一个包都是 Rust 写的，因此这种多余的注释其实没有任何意义。



###### 1.1.1 特征命名

特征的名称应该使用动词，而不是形容词或者名词，例如 `Print` 和 `Draw` 明显好于 `Printable` 和 `Drawable`。



###### 1.1.2 类型转换要遵守 as_，to_，into_ 命名惯例(C-CONV)

类型转换应该通过方法调用的方式实现，其中的前缀规则如下：

| 方法前缀 | 性能开销  | 所有权改变                                                   |
| -------- | --------- | ------------------------------------------------------------ |
| `as_`    | Free      | borrowed -> borrowed                                         |
| `to_`    | Expensive | borrowed -> borrowed borrowed -> owned (non-Copy types) owned -> owned (Copy types) |
| `into_`  | Variable  | owned -> owned (non-Copy types)                              |

例如：

- [`str::as_bytes()`](https://doc.rust-lang.org/std/primitive.str.html#method.as_bytes) 把 `str` 变成 UTF-8 字节数组，性能开销是 0。输入是一个借用的 `&str`，输出也是一个借用的 `&str`

- [`Path::to_str`](https://doc.rust-lang.org/std/path/struct.Path.html#method.to_str) 会执行一次昂贵的 UTF-8 字节数组检查，输入和输出都是借用的。对于这种情况，如果把方法命名为 `as_str` 是不正确的，因为这个方法的开销还挺大

- [`str::to_lowercase()`](https://doc.rust-lang.org/std/primitive.str.html#method.to_lowercase) 在调用过程中会遍历字符串的字符，且可能会分配新的内存对象。输入是一个借用的 `str`，输出是一个有独立所有权的 `String`

- [`String::into_bytes()`](https://doc.rust-lang.org/std/string/struct.String.html#method.into_bytes) 返回 `String` 底层的 `Vec<u8>` 数组，转换本身是零消耗的。该方法获取 `String` 的所有权，然后返回一个新的有独立所有权的 `Vec<u8>`

  

当一个单独的值被某个类型所包装时，访问该类型的内部值应通过 `into_inner()` 方法来访问。例如将一个缓冲区值包装为 [`BufReader`](https://doc.rust-lang.org/std/io/struct.BufReader.html#method.into_inner) 类型，还有 [`GzDecoder`](https://docs.rs/flate2/0.2.19/flate2/read/struct.GzDecoder.html#method.into_inner)、[`AtomicBool`](https://doc.rust-lang.org/std/sync/atomic/struct.AtomicBool.html#method.into_inner) 等，都是这种类型。


如果 `mut` 限定符在返回类型中出现，那么在命名上也**应该**体现出来。例如，[`Vec::as_mut_slice`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.as_mut_slice) 就说明它返回了一个 `mut` 切片，在这种情况下 `as_mut_slice` 比 `as_slice_mut` 更适合。

```rust
// 返回类型是一个 `mut` 切片
fn as_mut_slice(&mut self) -> &mut [T];
```



**标准库中的一些例子**

- [`Result::as_ref`](https://doc.rust-lang.org/std/result/enum.Result.html#method.as_ref)
- [`RefCell::as_ptr`](https://doc.rust-lang.org/std/cell/struct.RefCell.html#method.as_ptr)
- [`slice::to_vec`](https://doc.rust-lang.org/std/primitive.slice.html#method.to_vec)
- [`Option::into_iter`](https://doc.rust-lang.org/std/option/enum.Option.html#method.into_iter)



###### 1.1.3 读访问器(Getter)的名称遵循 Rust 的命名规范(C-GETTER)

除了少数例外，在 Rust代码中 `get` 前缀不用于 Getter。

```rust
pub struct S {
    first: First,
    second: Second,
}

impl S {
    // 而不是 get_first
    pub fn first(&self) -> &First {
        &self.first
    }

    // 而不是 get_first_mut，get_mut_first，or mut_first
    pub fn first_mut(&mut self) -> &mut First {
        &mut self.first
    }
}
```

至于上文提到的少数例外，如下：**当有且仅有一个值**能被 Getter 所获取时，才使用 `get` 前缀。例如，[`Cell::get`](https://doc.rust-lang.org/std/cell/struct.Cell.html#method.get) 能直接访问到 `Cell` 中的内容。

有些 Getter 会在过程中执行运行时检查，那么我们就可以考虑添加 `_unchecked` Getter 函数，这个函数虽然不安全，但是往往具有更高的性能。 典型的例子如下：

```rust
fn get(&self, index: K) -> Option<&V>;
fn get_mut(&mut self, index: K) -> Option<&mut V>;
unsafe fn get_unchecked(&self, index: K) -> &V;
unsafe fn get_unchecked_mut(&mut self, index: K) -> &mut V;
```



**标准库示例**

- [`std::io::Cursor::get_mut`](https://doc.rust-lang.org/std/io/struct.Cursor.html#method.get_mut)
- [`std::ptr::Unique::get_mut`](https://doc.rust-lang.org/std/ptr/struct.Unique.html#method.get_mut)
- [`std::sync::PoisonError::get_mut`](https://doc.rust-lang.org/std/sync/struct.PoisonError.html#method.get_mut)
- [`std::sync::atomic::AtomicBool::get_mut`](https://doc.rust-lang.org/std/sync/atomic/struct.AtomicBool.html#method.get_mut)
- [`std::collections::hash_map::OccupiedEntry::get_mut`](https://doc.rust-lang.org/std/collections/hash_map/struct.OccupiedEntry.html#method.get_mut)
- [`<[T\]>::get_unchecked`](https://doc.rust-lang.org/std/primitive.slice.html#method.get_unchecked)



###### 1.1.4 一个集合上的方法，如果返回迭代器，需遵循命名规则：iter，iter_mut，into_iter (C-ITER)

```rust
fn iter(&self) -> Iter             // Iter implements Iterator<Item = &U>
fn iter_mut(&mut self) -> IterMut  // IterMut implements Iterator<Item = &mut U>
fn into_iter(self) -> IntoIter     // IntoIter implements Iterator<Item = U>
```

上面的规则适用于同构性的数据集合。与之相反，`str` 类型是一个 UTF-8 字节数组切片，与同构性集合有一点微妙的差别，它可以认为是字节集合，也可以认为是字符集合，因此它提供了 [`str::bytes`](https://doc.rust-lang.org/std/primitive.str.html#method.bytes) 去遍历字节，还有 [`str::chars`](https://doc.rust-lang.org/std/primitive.str.html#method.chars) 去遍历字符，而并没有直接定义 `iter` 等方法。



上述规则只适用于方法，并不适用于函数。例如 `url` 包的 [`percent_encode`](https://docs.rs/url/1.4.0/url/percent_encoding/fn.percent_encode.html) 函数返回一个迭代器用于遍历百分比编码（[Percent encoding](https://en.wikipedia.org/wiki/Percent-encoding)）的字符串片段. 在这种情况下，使用 `iter`/`iter_mut`/`into_iter` 诸如此类的函数命名无法表达任何具体的含义。



**标准库示例**

- [`Vec::iter`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.iter)
- [`Vec::iter_mut`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.iter_mut)
- [`Vec::into_iter`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.into_iter)
- [`BTreeMap::iter`](https://doc.rust-lang.org/std/collections/struct.BTreeMap.html#method.iter)
- [`BTreeMap::iter_mut`](https://doc.rust-lang.org/std/collections/struct.BTreeMap.html#method.iter_mut)



###### 1.1.5 迭代器的类型应该与产生它的方法名相匹配(C-ITER-TY)

例如形如 `into_iter()` 的方法应该返回一个 `IntoIter` 类型，与之相似，其它任何返回迭代器的方法也应该遵循这种命名惯例。

上述规则主要应用于方法，但是经常对于函数也适用。例如上文提到的 `url` 包中的 [`percent_encode`](https://docs.rs/url/1.4.0/url/percent_encoding/fn.percent_encode.html) 函数，返回了一个 [`PercentEncode`](https://docs.rs/url/1.4.0/url/percent_encoding/struct.PercentEncode.html) 类型。

特别是，当这些类型跟包名前缀一起使用时，将具备非常清晰的含义，例如 [`vec::IntoIter`](https://doc.rust-lang.org/std/vec/struct.IntoIter.html)。



**标准库示例**

- [`Vec::iter`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.iter) returns [`Iter`](https://doc.rust-lang.org/std/slice/struct.Iter.html)
- [`Vec::iter_mut`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.iter_mut) returns [`IterMut`](https://doc.rust-lang.org/std/slice/struct.IterMut.html)
- [`Vec::into_iter`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.into_iter) returns [`IntoIter`](https://doc.rust-lang.org/std/vec/struct.IntoIter.html)
- [`BTreeMap::keys`](https://doc.rust-lang.org/std/collections/struct.BTreeMap.html#method.keys) returns [`Keys`](https://doc.rust-lang.org/std/collections/btree_map/struct.Keys.html)
- [`BTreeMap::values`](https://doc.rust-lang.org/std/collections/struct.BTreeMap.html#method.values) returns [`Values`](https://doc.rust-lang.org/std/collections/btree_map/struct.Values.html)



###### 1.1.6  Cargo Feature 的名称不应该包含占位词(C-FEATURE)

不要在 [Cargo feature](http://doc.crates.io/manifest.html#the-features-section) 中包含无法传达任何意义的词，例如 `use-abc` 或 `with-abc`，直接命名为 `abc` 即可。

一个典型的例子就是：一个包对标准库有可选性的依赖。标准的写法如下：

```toml
# 在 Cargo.toml 中

[features]
default = ["std"]
std = []
// 在我们自定义的 lib.rs 中

#![cfg_attr(not(feature = "std"), no_std)]
```

除了 `std` 之外，不要使用任何 `ust-std` 或者 `with-std` 等自以为很有创造性的名称。



###### 1.1.7  命名要使用一致性的词序(C-WORD-ORDER)

这是一些标准库中的错误类型:

- [`JoinPathsError`](https://doc.rust-lang.org/std/env/struct.JoinPathsError.html)
- [`ParseBoolError`](https://doc.rust-lang.org/std/str/struct.ParseBoolError.html)
- [`ParseCharError`](https://doc.rust-lang.org/std/char/struct.ParseCharError.html)
- [`ParseFloatError`](https://doc.rust-lang.org/std/num/struct.ParseFloatError.html)
- [`ParseIntError`](https://doc.rust-lang.org/std/num/struct.ParseIntError.html)
- [`RecvTimeoutError`](https://doc.rust-lang.org/std/sync/mpsc/enum.RecvTimeoutError.html)
- [`StripPrefixError`](https://doc.rust-lang.org/std/path/struct.StripPrefixError.html)

它们都使用了 `谓语-宾语-错误` 的词序，如果我们想要表达一个网络地址无法分析的错误，由于词序一致性的原则，命名应该如下 `ParseAddrError`，而不是 `AddrParseError`。

词序和个人习惯有很大关系，想要注意的是，你可以选择合适的词序，但是要在包的范畴内保持一致性，就如标准库中的包一样。



------



##### 1.2 关键字

Rust 语言有一些**关键字**（*keywords*），和其他语言一样，这些关键字都是被保留给 Rust 语言使用的，因此，它们不能被用作变量或函数的名称。



下面的列表包含 Rust 中正在使用或者以后会用到的关键字。因此，这些关键字不能被用作标识符（除了[原生标识符](https://course.rs/appendix/keywords.html#原生标识符)），包括函数、变量、参数、结构体字段、模块、包、常量、宏、静态值、属性、类型、特征或生命周期。



###### 1.2.1 目前正在使用的关键字

如下关键字目前有对应其描述的功能。

- `as` - 强制类型转换，或`use` 和 `extern crate`包和模块引入语句中的重命名
- `break` - 立刻退出循环
- `const` - 定义常量或原生常量指针（constant raw pointer）
- `continue` - 继续进入下一次循环迭代
- `crate` - 链接外部包
- `dyn` - 动态分发特征对象
- `else` - 作为 `if` 和 `if let` 控制流结构的 fallback
- `enum` - 定义一个枚举类型
- `extern` - 链接一个外部包,或者一个宏变量(该变量定义在另外一个包中)
- `false` - 布尔值 `false`
- `fn` - 定义一个函数或 **函数指针类型** (*function pointer type*)
- `for` - 遍历一个迭代器或实现一个 trait 或者指定一个更高级的生命周期
- `if` - 基于条件表达式的结果来执行相应的分支
- `impl` - 为结构体或者特征实现具体功能
- `in` - `for` 循环语法的一部分
- `let` - 绑定一个变量
- `loop` - 无条件循环
- `match` - 模式匹配
- `mod` - 定义一个模块
- `move` - 使闭包获取其所捕获项的所有权
- `mut` - 在引用、裸指针或模式绑定中使用，表明变量是可变的
- `pub` - 表示结构体字段、`impl` 块或模块的公共可见性
- `ref` - 通过引用绑定
- `return` - 从函数中返回
- `Self` - 实现特征类型的类型别名
- `self` - 表示方法本身或当前模块
- `static` - 表示全局变量或在整个程序执行期间保持其生命周期
- `struct` - 定义一个结构体
- `super` - 表示当前模块的父模块
- `trait` - 定义一个特征
- `true` - 布尔值 `true`
- `type` - 定义一个类型别名或关联类型
- `unsafe` - 表示不安全的代码、函数、特征或实现
- `use` - 在当前代码范围内(模块或者花括号对)引入外部的包、模块等
- `where` - 表示一个约束类型的从句
- `while` - 基于一个表达式的结果判断是否继续循环





###### 1.2.2 保留做将来使用的关键字

如下关键字没有任何功能，不过由 Rust 保留以备将来的应用。

- `abstract`
- `async`
- `await`
- `become`
- `box`
- `do`
- `final`
- `macro`
- `override`
- `priv`
- `try`
- `typeof`
- `unsized`
- `virtual`
- `yield`



###### 1.2.3 原生标识符

原生标识符（Raw identifiers）允许你使用通常不能使用的关键字，其带有 `r#` 前缀。

例如，`match` 是关键字。如果尝试编译如下使用 `match` 作为名字的函数：

```rust
fn match(needle: &str, haystack: &str) -> bool {
    haystack.contains(needle)
}
```

会得到这个错误：

```text
error: expected identifier, found keyword `match`
 --> src/main.rs:4:4
  |
4 | fn match(needle: &str, haystack: &str) -> bool {
  |    ^^^^^ expected identifier, found keyword
```

该错误表示你不能将关键字 `match` 用作函数标识符。你可以使用原生标识符将 `match` 作为函数名称使用：

文件名: src/main.rs

```rust
fn r#match(needle: &str, haystack: &str) -> bool {
    haystack.contains(needle)
}

fn main() {
    assert!(r#match("foo", "foobar"));
}
```

此代码编译没有任何错误。注意 `r#` 前缀需同时用于函数名定义和 `main` 函数中的调用。

原生标识符允许使用你选择的任何单词作为标识符，即使该单词恰好是保留关键字。 此外，原生标识符允许你使用其它 Rust 版本编写的库。比如，`try` 在 Rust 2015 edition 中不是关键字，却在 Rust 2018 edition 是关键字。所以如果用 2015 edition 编写的库中带有 `try` 函数，在 2018 edition 中调用时就需要使用原始标识符语法，在这里是 `r#try`。



------



##### 1.3 变量绑定

在其它语言中，我们用 `var a = "hello world"` 的方式给 `a` 赋值，也就是把等式右边的 `"hello world"` 字符串赋值给变量 `a` ，而在 Rust 中，我们这样写： `let a = "hello world"` ，同时给这个过程起了另一个名字：**变量绑定**。

为何不用赋值而用绑定呢（其实你也可以称之为赋值，但是绑定的含义更清晰准确）？这里就涉及 Rust 最核心的原则——**所有权**，简单来讲，任何内存对象都是有主人的，而且一般情况下完全属于它的主人，绑定就是把这个对象绑定给一个变量，让这个变量成为它的主人（聪明的读者应该能猜到，在这种情况下，该对象之前的主人就会丧失对该对象的所有权），像极了我们的现实世界，不是吗？



------



##### 1.4 变量可变性

Rust 的变量在默认情况下是**不可变的**。前文提到，这是 Rust 团队为我们精心设计的语言特性之一，让我们编写的代码更安全，性能也更好。当然你可以通过 `mut` 关键字让变量变为**可变的**，让设计更灵活。如果变量 `a` 不可变，那么一旦为它绑定值，就不能再修改 `a`。



举个例子，在我们的工程目录下使用 `cargo new variables` 新建一个项目，叫做 *variables* 。

然后在新建的 *variables* 目录下，编辑 *src/main.rs* ，改为下面代码：

```rust
fn main() {
    let x = 5;
    println!("The value of x is: {}", x);
    x = 6;
    println!("The value of x is: {}", x);
}
```

保存文件，再使用 `cargo run` 运行它，迎面而来的是一条错误提示：

```console
$ cargo run
   Compiling variables v0.1.0 (file:///projects/variables)
error[E0384]: cannot assign twice to immutable variable `x`
 --> src/main.rs:4:5
  |
2 |     let x = 5;
  |         -
  |         |
  |         first assignment to `x`
  |         help: consider making this binding mutable: `mut x`
3 |     println!("The value of x is: {}", x);
4 |     x = 6;
  |     ^^^^^ cannot assign twice to immutable variable

error: aborting due to previous error
```

具体的错误原因是 `cannot assign twice to immutable variable x`（无法对不可变的变量进行重复赋值），因为我们想为不可变的 `x` 变量再次赋值。



这种错误是为了避免无法预期的错误发生在我们的变量上：一个变量往往被多处代码所使用，其中一部分代码假定该变量的值永远不会改变，而另外一部分代码却无情的改变了这个值，在实际开发过程中，这个错误是很难被发现的，特别是在多线程编程中。



这种规则让我们的代码变得非常清晰，只有你想让你的变量改变时，它才能改变，这样就不会造成心智上的负担，也给别人阅读代码带来便利。


但是可变性也非常重要，否则我们就要像 ClojureScript 那样，每次要改变，就要重新生成一个对象，在拥有大量对象的场景，性能会变得非常低下，内存拷贝的成本异常的高。



在 Rust 中，可变性很简单，只要在变量名前加一个 `mut` 即可, 而且这种显式的声明方式还会给后来人传达这样的信息：嗯，这个变量在后面代码部分会发生改变。

为了让变量声明为可变,将 *src/main.rs* 改为以下内容：

```rust
fn main() {
    let mut x = 5;
    println!("The value of x is: {}", x);
    x = 6;
    println!("The value of x is: {}", x);
}
```

运行程序将得到下面结果：

```console
$ cargo run
   Compiling variables v0.1.0 (file:///projects/variables)
    Finished dev [unoptimized + debuginfo] target(s) in 0.30s
     Running `target/debug/variables`
The value of x is: 5
The value of x is: 6
```

选择可变还是不可变，更多的还是取决于你的使用场景，例如不可变可以带来安全性，但是丧失了灵活性和性能（如果你要改变，就要重新创建一个新的变量，这里涉及到内存对象的再分配）。而可变变量最大的好处就是使用上的灵活性和性能上的提升。



例如，在使用大型数据结构或者热点代码路径（被大量频繁调用）的情形下，在同一内存位置更新实例可能比复制并返回新分配的实例要更快。使用较小的数据结构时，通常创建新的实例并以更具函数式的风格来编写程序，可能会更容易理解，所以值得以较低的性能开销来确保代码清晰。



------



##### 1.5 使用下划线开头忽略未使用的变量

如果你创建了一个变量却不在任何地方使用它，Rust 通常会给你一个警告，因为这可能会是个 BUG。但是有时创建一个不会被使用的变量是有用的，比如你正在设计原型或刚刚开始一个项目。这时**你希望告诉 Rust 不要警告未使用的变量，为此可以用下划线作为变量名的开头**：

```rust
fn main() {
    let _x = 5;
    let y = 10;
}
```

使用 `cargo run` 运行下试试:

```shell
warning: unused variable: `y`
 --> src/main.rs:3:9
  |
3 |     let y = 10;
  |         ^ help: 如果 y 故意不被使用，请添加一个下划线前缀: `_y`
  |
  = note: `#[warn(unused_variables)]` on by default
```

可以看到，两个变量都是只有声明，没有使用，但是编译器却独独给出了 `y` 未被使用的警告，充分说明了 `_` 变量名前缀在这里发挥的作用。

值得注意的是，这里编译器还很善意的给出了提示( Rust 的编译器非常强大，这里的提示只是小意思 ): 将 `y` 修改 `_y` 即可。这里就不再给出代码，留给大家手动尝试并观察下运行结果。

更多关于 `_x` 的使用信息，请阅读后面的[模式匹配章节](https://course.rs/basic/match-pattern/all-patterns.html?highlight=_#使用下划线开头忽略未使用的变量)。



------



##### 1.6 变量解构

`let` 表达式不仅仅用于变量的绑定，还能进行复杂变量的解构：从一个相对复杂的变量中，匹配出该变量的一部分内容：

```rust
fn main() {
    let (a, mut b): (bool,bool) = (true, false);
    // a = true,不可变; b = false，可变
    println!("a = {:?}, b = {:?}", a, b);

    b = true;
    assert_eq!(a, b);
}
```

- **解构式赋值**

  在 [Rust 1.59](https://course.rs/appendix/rust-versions/1.59.html) 版本后，我们可以在赋值语句的左式中使用元组、切片和结构体模式了。

  ```rust
  struct Struct {
      e: i32
  }
  
  fn main() {
      let (a, b, c, d, e);
  
      // 这里的编译器赋值错误提示信息不影响实际运行 
      (a, b) = (1, 2);
      // _ 代表匹配一个值，但是我们不关心具体的值是什么，因此没有使用一个变量名而是使用了 _
      [c, .., d, _] = [1, 2, 3, 4, 5];
      Struct { e, .. } = Struct { e: 5 };
  
      assert_eq!([1, 2, 1, 4, 5], [a, b, c, d, e]);
  }
  ```

  这种使用方式跟之前的 `let` 保持了一致性，但是 `let` 会重新绑定，而这里仅仅是对之前绑定的变量进行再赋值。

  需要注意的是，使用 `+=` 的赋值语句还不支持解构式赋值。

  > 这里用到了模式匹配的一些语法，如果大家看不懂没关系，可以在学完模式匹配章节后，再回头来看。



------



##### 1.7 变量和常量之间的差异

变量的值不能更改可能让你想起其他另一个很多语言都有的编程概念：**常量**(*constant*)。与不可变变量一样，常量也是绑定到一个常量名且不允许更改的值，但是常量和变量之间存在一些差异：

- 常量不允许使用 `mut`。**常量不仅仅默认不可变，而且自始至终不可变**，因为常量在编译完成后，已经确定它的值。
- 常量使用 `const` 关键字而不是 `let` 关键字来声明，并且值的类型**必须**标注。

我们将在下一节[数据类型](https://course.rs/basic/base-type/index.html)中介绍，因此现在暂时无需关心细节。

下面是一个常量声明的例子，其常量名为 `MAX_POINTS`，值设置为 `100,000`。（Rust 常量的命名约定是全部字母都使用大写，并使用下划线分隔单词，另外对数字字面量可插入下划线以提高可读性）：

```rust
const MAX_POINTS: u32 = 100_000;
```

常量可以在任意作用域内声明，包括全局作用域，在声明的作用域内，常量在程序运行的整个过程中都有效。对于需要在多处代码共享一个不可变的值时非常有用，例如游戏中允许玩家赚取的最大点数或光速。

> 在实际使用中，最好将程序中用到的硬编码值都声明为常量，对于代码后续的维护有莫大的帮助。如果将来需要更改硬编码的值，你也只需要在代码中更改一处即可。



------



##### 1.8 变量遮蔽(shadowing)

Rust 允许声明相同的变量名，在后面声明的变量会遮蔽掉前面声明的，如下所示：

```rust
fn main() {
    let x = 5;
    // 在main函数的作用域内对之前的x进行遮蔽
    let x = x + 1;

    {
        // 在当前的花括号作用域内，对之前的x进行遮蔽
        let x = x * 2;
        println!("The value of x in the inner scope is: {}", x);
    }

    println!("The value of x is: {}", x);
}
```

这个程序首先将数值 `5` 绑定到 `x`，然后通过重复使用 `let x =` 来遮蔽之前的 `x`，并取原来的值加上 `1`，所以 `x` 的值变成了 `6`。第三个 `let` 语句同样遮蔽前面的 `x`，取之前的值并乘上 `2`，得到的 `x` 最终值为 `12`。当运行此程序，将输出以下内容：

```console
$ cargo run
   Compiling variables v0.1.0 (file:///projects/variables)
   ...
The value of x in the inner scope is: 12
The value of x is: 6
```

==这和 `mut` 变量的使用是不同的，第二个 `let` 生成了完全不同的新变量，两个变量只是恰好拥有同样的名称，涉及一次内存对象的再分配 ，而 `mut` 声明的变量，可以修改同一个内存地址上的值，并不会发生内存对象的再分配，性能要更好。==



==变量遮蔽的用处在于，如果你在某个作用域内无需再使用之前的变量（在被遮蔽后，无法再访问到之前的同名变量），就可以重复的使用变量名字，而不用绞尽脑汁去想更多的名字。==

例如，假设有一个程序要统计一个空格字符串的空格数量：

```rust
// 字符串类型
let spaces = "   ";
// usize数值类型
let spaces = spaces.len();
```

这种结构是允许的，因为第一个 `spaces` 变量是一个字符串类型，第二个 `spaces` 变量是一个全新的变量且和第一个具有相同的变量名，且是一个数值类型。所以变量遮蔽可以帮我们节省些脑细胞，不用去想如 `spaces_str` 和 `spaces_num` 此类的变量名；相反我们可以重复使用更简单的 `spaces` 变量名。如果你不用 `let` :

```rust
let mut spaces = "   ";
spaces = spaces.len();
```

运行一下，你就会发现编译器报错：

```console
$ cargo run
   Compiling variables v0.1.0 (file:///projects/variables)
error[E0308]: mismatched types
 --> src/main.rs:3:14
  |
3 |     spaces = spaces.len();
  |              ^^^^^^^^^^^^ expected `&str`, found `usize`

error: aborting due to previous error
```

显然，Rust 对类型的要求很严格，不允许将整数类型 `usize` 赋值给字符串类型。`usize` 是一种 CPU 相关的整数类型，在[数值类型](https://course.rs/basic/base-type/numbers.html#整数类型)中有详细介绍。



------




#### 2. 基本类型

Rust 每个值都有其确切的数据类型，总的来说可以分为两类：基本类型和复合类型。 基本类型意味着它们往往是一个最小化原子类型，无法解构为其它类型(一般意义上来说)，由以下组成：

- 数值类型: 有符号整数 (`i8`, `i16`, `i32`, `i64`, `isize`)、 无符号整数 (`u8`, `u16`, `u32`, `u64`, `usize`) 、浮点数 (`f32`, `f64`)、以及有理数、复数
- 字符串：字符串字面量和字符串切片 `&str`
- 布尔类型： `true` 和 `false`
- 字符类型: 表示单个 Unicode 字符，存储为 4 个字节
- 单元类型: 即 `()` ，其唯一的值也是 `()`



**类型推导与标注**

与 Python、JavaScript 等动态语言不同，Rust 是一门==静态类型语言==，也就是编译器必须在编译期知道我们所有变量的类型，但这不意味着你需要为每个变量指定类型，因为 Rust 编译器很聪明，它==可以根据变量的值和上下文中的使用方式来自动推导出变量的类型==，同时编译器也不够聪明，在某些情况下，它无法推导出变量类型，需要手动去给予一个类型标注，关于这一点在 [Rust 语言初印象](https://course.rs/first-try/hello-world.html#rust-语言初印象)中有过展示。

来看段代码：

```rust
let guess = "42".parse().expect("Not a number!");
```

先忽略 `.parse().expect..` 部分，这段代码的目的是将字符串 `"42"` 进行解析，而编译器在这里无法推导出我们想要的类型：整数？浮点数？字符串？因此编译器会报错：

```console
$ cargo build
   Compiling no_type_annotations v0.1.0 (file:///projects/no_type_annotations)
error[E0282]: type annotations needed
 --> src/main.rs:2:9
  |
2 |     let guess = "42".parse().expect("Not a number!");
  |         ^^^^^ consider giving `guess` a type
```

因此我们需要提供给编译器更多的信息，例如给 `guess` 变量一个**显式的类型标注**：`let guess: i32 = ...` 或者 `"42".parse::<i32>()`。



##### 2.1 数值类型



###### 2.1.1 整数类型

**整数**是没有小数部分的数字。之前使用过的 `i32` 类型，表示有符号的 32 位整数（ `i` 是英文单词 *integer* 的首字母，与之相反的是 `u`，代表无符号 `unsigned` 类型）。下表显示了 Rust 中的内置的整数类型：

| 长度       | 有符号类型 | 无符号类型 |
| ---------- | ---------- | ---------- |
| 8 位       | `i8`       | `u8`       |
| 16 位      | `i16`      | `u16`      |
| 32 位      | `i32`      | `u32`      |
| 64 位      | `i64`      | `u64`      |
| 128 位     | `i128`     | `u128`     |
| 视架构而定 | `isize`    | `usize`    |

类型定义的形式统一为：`有无符号 + 类型大小(位数)`。==**无符号数**表示数字只能取正数和0，而**有符号**则表示数字可以取正数、负数还有0==。就像在纸上写数字一样：当要强调符号时，数字前面可以带上正号或负号；然而，当很明显确定数字为正数时，就不需要加上正号了。有符号数字以[补码](https://en.wikipedia.org/wiki/Two's_complement)形式存储。

- 每个有符号类型规定的数字范围是 **-(2^n-1^ ) ~ 2^n-1^ - 1**，其中 `n` 是该定义形式的位长度。因此 `i8` 可存储数字范围是 -(2^7^) ~ 2^7^ - 1，即 -128 ~ 127。

- 无符号类型可以存储的数字范围是 **0 ~ 2^n^ - 1**，所以 `u8` 能够存储的数字为 0 ~ 2^8^ - 1，即 0 ~ 255。



此外，`isize` 和 `usize` 类型取决于程序运行的计算机 CPU 类型： 若 CPU 是 32 位的，则这两个类型是 32 位的，同理，若 CPU 是 64 位，那么它们则是 64 位。


整型字面量可以用下表的形式书写：

| 数字字面量         | 示例          |
| ------------------ | ------------- |
| 十进制             | `98_222`      |
| 十六进制           | `0xff`        |
| 八进制             | `0o77`        |
| 二进制             | `0b1111_0000` |
| 字节 (仅限于 `u8`) | `b'A'`        |

这么多类型，有没有一个简单的使用准则？答案是肯定的， Rust 整型默认使用 `i32`，例如 `let i = 1`，那 `i` 就是 `i32` 类型，因此你可以首选它，同时该类型也往往是性能最好的。`isize` 和 `usize` 的主要应用场景是用作集合的索引。





==**整型溢出**==

假设有一个 `u8` ，它可以存放从 0 到 255 的值。那么当你将其修改为范围之外的值，比如 256，则会发生**整型溢出**。


关于这一行为 Rust 有一些有趣的规则：

- 当在 debug 模式编译时，Rust 会检查整型溢出，若存在这些问题，则使程序在编译时 *panic*(崩溃,Rust 使用这个术语来表明程序因错误而退出)。

- 当使用 `--release` 参数进行 release 模式构建时，Rust **不**检测溢出。相反，当检测到整型溢出时，Rust 会按照补码循环溢出（*two’s complement wrapping*）的规则处理。简而言之，大于该类型最大值的数值会被补码转换成该类型能够支持的对应数字的最小值。比如在 `u8` 的情况下，256 变成 0，257 变成 1，依此类推。程序不会 *panic*，但是该变量的值可能不是你期望的值。依赖这种默认行为的代码都应该被认为是错误的代码。
  

要显式处理可能的溢出，可以使用标准库针对原始数字类型提供的这些方法：

- 使用 `wrapping_*` 方法在所有模式下都按照补码循环溢出规则处理，例如 `wrapping_add`

- 如果使用 `checked_*` 方法时发生溢出，则返回 `None` 值

- 使用 `overflowing_*` 方法返回该值和一个指示是否存在溢出的布尔值

- 使用 `saturating_*` 方法，可以限定计算后的结果不超过目标类型的最大值或低于最小值，例如:

  ```rust
  assert_eq!(100u8.saturating_add(1), 101);
  assert_eq!(u8::MAX.saturating_add(127), u8::MAX);
  ```



下面是一个演示`wrapping_*`方法的示例：

```rust
fn main() {
    let a : u8 = 255;
    let b = a.wrapping_add(20);
    println!("{}", b);  // 19
}
```





###### 2.1.2 浮点类型

**浮点类型数字** 是带有小数点的数字，在 Rust 中浮点类型数字也有两种基本类型： `f32` 和 `f64`，分别为 32 位和 64 位大小。默认浮点类型是 `f64`，在现代的 CPU 中它的速度与 `f32` 几乎相同，但精度更高。



下面是一个演示浮点数的示例：

```rust
fn main() {
    let x = 2.0; // f64

    let y: f32 = 3.0; // f32
}
```

浮点数根据 `IEEE-754` 标准实现。`f32` 类型是单精度浮点型，`f64` 为双精度。




==**浮点数陷阱**==

浮点数由于底层格式的特殊性，导致了如果在使用浮点数时不够谨慎，就可能造成危险，有两个原因：

1. **浮点数往往是你想要数字的近似表达** 

   浮点数类型是基于二进制实现的，但是我们想要计算的数字往往是基于十进制，例如 `0.1` 在二进制上并不存在精确的表达形式，但是在十进制上就存在。这种不匹配性导致一定的歧义性，更多的，虽然浮点数能代表真实的数值，但是由于底层格式问题，它往往受限于定长的浮点数精度，如果你想要表达完全精准的真实数字，只有使用无限精度的浮点数才行
   
2. **浮点数在某些特性上是反直觉的**

    例如大家都会觉得浮点数可以进行比较，对吧？是的，它们确实可以使用 `>`，`>=` 等进行比较，但是在某些场景下，这种直觉上的比较特性反而会害了你。因为 `f32` ， `f64` 上的比较运算实现的是 `std::cmp::PartialEq` 特征(类似其他语言的接口)，但是并没有实现 `std::cmp::Eq` 特征，但是后者在其它数值类型上都有定义。

   

   说了这么多，可能大家还是云里雾里，用一个例子来举例：

   Rust 的 `HashMap` 数据结构，是一个 KV 类型的 Hash Map 实现，它对于 `K` 没有特定类型的限制，但是要求能用作 `K` 的类型必须实现了 `std::cmp::Eq` 特征，因此这意味着你无法使用浮点数作为 `HashMap` 的 `Key`，来存储键值对，但是作为对比，Rust 的整数类型、字符串类型、布尔类型都实现了该特征，因此可以作为 `HashMap` 的 `Key`。



为了避免上面说的两个陷阱，你需要遵守以下准则：

- 避免在浮点数上测试相等性
- 当结果在数学上可能存在未定义时，需要格外的小心



来看个小例子:

```rust
fn main() {
  // 断言0.1 + 0.2与0.3相等
  assert!(0.1 + 0.2 == 0.3);
}
```

你可能以为，这段代码没啥问题吧，实际上它会 *panic*(程序崩溃，抛出异常)，因为二进制精度问题，导致了 0.1 + 0.2 并不严格等于 0.3，它们可能在小数点 N 位后存在误差。

相关说明可见：[浮点数精度丢失问题：为什么 (0.1+0.2)!=0.3](https://blog.csdn.net/tangshangkui/article/details/135888059)


那如果非要进行比较呢？可以考虑用这种方式 `(0.1_f64 + 0.2 - 0.3).abs() < 0.00001` ，具体小于多少，取决于你对精度的需求。




讲到这里，相信大家基本已经明白了，为什么操作浮点数时要格外的小心，但是还不够，下面再来一段代码，直接震撼你的灵魂：

```rust
fn main() {
    let abc: (f32, f32, f32) = (0.1, 0.2, 0.3);
    let xyz: (f64, f64, f64) = (0.1, 0.2, 0.3);

    println!("abc (f32)");
    println!("   0.1 + 0.2: {:x}", (abc.0 + abc.1).to_bits());
    println!("         0.3: {:x}", (abc.2).to_bits());
    println!();

    println!("xyz (f64)");
    println!("   0.1 + 0.2: {:x}", (xyz.0 + xyz.1).to_bits());
    println!("         0.3: {:x}", (xyz.2).to_bits());
    println!();

    assert!(abc.0 + abc.1 == abc.2);
    assert!(xyz.0 + xyz.1 == xyz.2);
}
```

运行该程序，输出如下:

```console
abc (f32)
   0.1 + 0.2: 3e99999a
         0.3: 3e99999a

xyz (f64)
   0.1 + 0.2: 3fd3333333333334
         0.3: 3fd3333333333333

thread 'main' panicked at 'assertion failed: xyz.0 + xyz.1 == xyz.2',
➥ch2-add-floats.rs.rs:14:5
note: run with `RUST_BACKTRACE=1` environment variable to display
➥a backtrace
```

仔细看，对 `f32` 类型做加法时，`0.1 + 0.2` 的结果是 `3e99999a`，`0.3` 也是 `3e99999a`，因此 `f32` 下的 `0.1 + 0.2 == 0.3` 通过测试，但是到了 `f64` 类型时，结果就不一样了，因为 `f64` 精度高很多，因此在小数点非常后面发生了一点微小的变化，`0.1 + 0.2` 以 `4` 结尾，但是 `0.3` 以`3`结尾，这个细微区别导致 `f64` 下的测试失败了，并且抛出了异常。





==**NaN**==

对于数学上未定义的结果，例如对负数取平方根 `-42.1.sqrt()` ，会产生一个特殊的结果：Rust 的浮点数类型使用 `NaN` (not a number)来处理这些情况。



**所有跟 `NaN` 交互的操作，都会返回一个 `NaN`**，而且 `NaN` 不能用来比较，下面的代码会崩溃：

```rust
fn main() {
  let x = (-42.0_f32).sqrt();
  assert_eq!(x, x);
}
```

出于防御性编程的考虑，可以使用 `is_nan()` 等方法，可以用来判断一个数值是否是 `NaN` ：

```rust
fn main() {
    let x = (-42.0_f32).sqrt();
    if x.is_nan() {
        println!("未定义的数学行为")
    }
}
```







###### 2.1.3 数字运算

Rust 支持所有数字类型的基本数学运算：加法、减法、乘法、除法和取模运算。下面代码各使用一条 `let` 语句来说明相应运算的用法：

```rust
fn main() {
    // 加法
    let sum = 5 + 10;

    // 减法
    let difference = 95.5 - 4.3;

    // 乘法
    let product = 4 * 30;

    // 除法
    let quotient = 56.7 / 32.2;

    // 求余
    let remainder = 43 % 5;
}
```

这些语句中的每个表达式都使用了数学运算符，并且计算结果为一个值，然后绑定到一个变量上。[附录 B](https://course.rs/appendix/operators.html#运算符) 中给出了 Rust 提供的所有运算符的列表。



再来看一个综合性的示例：

```rust
fn main() {
  // 编译器会进行自动推导，给予twenty i32的类型
  let twenty = 20;
  // 类型标注
  let twenty_one: i32 = 21;
  // 通过类型后缀的方式进行类型标注：22是i32类型
  let twenty_two = 22i32;

  // 只有同样类型，才能运算
  let addition = twenty + twenty_one + twenty_two;
  println!("{} + {} + {} = {}", twenty, twenty_one, twenty_two, addition);

  // 对于较长的数字，可以用_进行分割，提升可读性
  let one_million: i64 = 1_000_000;
  println!("{}", one_million.pow(2));

  // 定义一个f32数组，其中42.0会自动被推导为f32类型
  let forty_twos = [
    42.0,
    42f32,
    42.0_f32,
  ];

  // 打印数组中第一个值，并控制小数位为2位
  println!("{:.2}", forty_twos[0]);
}
```





###### 2.1.4 位运算

Rust 的位运算基本上和其他语言一样

| 运算符  | 说明                                                   |
| ------- | ------------------------------------------------------ |
| & 位与  | 相同位置均为1时则为1，否则为0                          |
| \| 位或 | 相同位置只要有1时则为1，否则为0                        |
| ^ 异或  | 相同位置不相同则为1，相同则为0                         |
| ! 位非  | 把位中的0和1相互取反，即0置为1，1置为0                 |
| << 左移 | 所有位向左移动指定位数，右位补0                        |
| >> 右移 | 所有位向右移动指定位数，带符号移动（正数补0，负数补1） |

```rust
fn main() {
    // 二进制为00000010
    let a:i32 = 2;
    // 二进制为00000011
    let b:i32 = 3;

    println!("(a & b) value is {}", a & b);

    println!("(a | b) value is {}", a | b);

    println!("(a ^ b) value is {}", a ^ b);

    println!("(!b) value is {} ", !b);

    println!("(a << b) value is {}", a << b);

    println!("(a >> b) value is {}", a >> b);

    let mut a = a;
    // 注意这些计算符除了!之外都可以加上=进行赋值 (因为!=要用来判断不等于)
    a <<= b;
    println!("(a << b) value is {}", a);
}
```





###### 2.1.5 序列(Range)

Rust 提供了一个非常简洁的方式，用来生成连续的数值，例如 `1..5`，生成从 1 到 4 的连续数字，不包含 5 ；`1..=5`，生成从 1 到 5 的连续数字，包含 5，它的用途很简单，常常用于循环中：

```rust
for i in 1..=5 {
    println!("{}",i);
}
```

最终程序输出:

```console
1
2
3
4
5
```

序列只允许用于数字或字符类型，原因是：它们可以连续，同时编译器在编译期可以检查该序列是否为空，字符和数字值是 Rust 中仅有的可以用于判断是否为空的类型。如下是一个使用字符类型序列的例子：

```rust
for i in 'a'..='z' {
    println!("{}",i);
}
```





###### 2.1.6 使用 As 完成类型转换

Rust 中可以使用 As 来完成一个类型到另一个类型的转换，其最常用于将原始类型转换为其他原始类型，但是它也可以完成诸如将指针转换为地址、地址转换为指针以及将指针转换为其他指针等功能。你可以在[这里](https://course.rs/advance/into-types/converse.html)了解更多相关的知识。





###### 2.1.7 有理数和复数

Rust 的标准库相比其它语言，准入门槛较高，因此有理数和复数并未包含在标准库中：

- 有理数和复数
- 任意大小的整数和任意精度的浮点数
- 固定精度的十进制小数，常用于货币相关的场景

好在社区已经开发出高质量的 Rust 数值库：[num](https://crates.io/crates/num)。

按照以下步骤来引入 `num` 库：

1. 创建新工程 `cargo new complex-num && cd complex-num`
2. 在 `Cargo.toml` 中的 `[dependencies]` 下添加一行 `num = "0.4.0"`
3. 将 `src/main.rs` 文件中的 `main` 函数替换为下面的代码
4. 运行 `cargo run`

```rust
use num::complex::Complex;

 fn main() {
   let a = Complex { re: 2.1, im: -1.2 };
   let b = Complex::new(11.1, 22.2);
   let result = a + b;

   println!("{} + {}i", result.re, result.im)
 }
```



###### 2.1.8 **总结**

之前提到了过 Rust 的数值类型和运算跟其他语言较为相似，但是实际上，除了语法上的不同之外，还是存在一些差异点：

- **Rust 拥有相当多的数值类型**

  因此你需要熟悉这些类型所占用的字节数，这样就知道该类型允许的大小范围以及你选择的类型是否能表达负数
  
- **类型转换必须是显式的**.

  Rust 永远也不会偷偷把你的 16bit 整数转换成 32bit 整数
  
- **Rust 的数值上可以使用方法**

  例如你可以用以下方法来将 `13.14` 取整：`13.14_f32.round()`，在这里我们使用了类型后缀，因为编译器需要知道 `13.14` 的具体类型



------



##### 2.2 字符、布尔、单元类型



###### 2.2.1 字符类型(char)

字符，对于没有其它编程经验的新手来说可能不太好理解，但是你可以把它理解为英文中的字母，中文中的汉字。

下面的代码展示了几个颇具异域风情的字符：

```rust
fn main() {
    let c = 'z';
    let z = 'ℤ';
    let g = '国';
    let heart_eyed_cat = '😻';
}
```

Rust 的字符不仅仅是 `ASCII`，所有的 `Unicode` 值都可以作为 Rust 字符，包括单个的中文、日文、韩文、emoji 表情符号等等，都是合法的字符类型。`Unicode` 值的范围从 `U+0000 ~ U+D7FF` 和 `U+E000 ~ U+10FFFF`。不过“字符”并不是 `Unicode` 中的一个概念，所以人在直觉上对“字符”的理解和 Rust 的字符概念并不一致。



由于 `Unicode` 都是 4 个字节编码，因此==字符类型也是占用 4 个字节==：

```rust
fn main() {
    let x = '中';
    println!("字符'中'占用了{}字节的内存大小",std::mem::size_of_val(&x));
}
```

输出如下:

```console
$ cargo run
   Compiling ...

字符'中'占用了4字节的内存大小
```

> 注意，我们还没开始讲字符串，但是这里提前说一下，和一些语言不同，Rust 的字符只能用 `''` 来表示， `""` 是留给字符串的。



###### 2.2.2 布尔(bool)

Rust 中的布尔类型有两个可能的值：`true` 和 `false`，==布尔值占用内存的大小为 `1` 个字节==：

```rust
fn main() {
    let t = true;

    let f: bool = false; // 使用类型标注,显式指定f的类型

    if f {
        println!("这是段毫无意义的代码");
    }
}
```

使用布尔类型的场景主要在于流程控制，例如上述代码的中的 `if` 就是其中之一。



###### 2.2.3 单元类型

单元类型就是 `()` ，对，你没看错，就是 `()` ，唯一的值也是 `()` ，一些读者读到这里可能就不愿意了，你也太敷衍了吧，管这叫类型？



只能说，再不起眼的东西，都有其用途，在目前为止的学习过程中，大家已经看到过很多次 `fn main()` 函数的使用吧？那么这个函数返回什么呢？

没错， `main` 函数就返回这个单元类型 `()`，你不能说 `main` 函数无返回值，因为没有返回值的函数在 Rust 中是有单独的定义的：`发散函数( diverge function )`，顾名思义，无法收敛的函数。



例如常见的 `println!()` 的返回值也是单元类型 `()`。

再比如，你可以用 `()` 作为 `map` 的值，表示我们不关注具体的值，只关注 `key`。 这种用法和 Go 语言的 ***struct{}*** 类似，==可以作为一个值用来占位，但是完全**不占用**任何内存==。





------



##### 2.3 语句和表达式

