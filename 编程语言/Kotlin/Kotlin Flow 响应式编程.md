## Kotlin Flow响应式编程

[TOC]



### 1. Flow 的三架马车

`FLow` 中有三个重要的概念：

- 生产者（Producer）
- 消费者（Consumer）
- 中介（Intermediaries）

生产者提供数据流中的数据，得益于 Kotlin 协程，`Flow` 可以 **异步地生产数据**。

消费者消费数据流内的数据。

中介可以对数据流中的数据进行更改，甚至可以更改数据流本身，我们可以借助官方视频中的动画来理解：
![tstmp_20251106172606](https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/tstmp_20251106172606.gif)



------



### 2. 创建 Flow - 生产者

`Flow` 是一个生产者，创建 `Flow` 也就是把数据放到传送带上。数据可以是基础数据或者集合，也可以是其他方式生成的数据，如网络或者回调或者硬件。创建 `Flow` 的 API 称作  flow builder 函数。



#### 2.1 用集合创建 Flow

这是创建 Flow 的最简单的方式，有两个，一个是 `flowOf()` 用于从固定数量的元素创建，多用于示例，实际中基本上用不到：

```Kotlin
val simple = flowOf("Hello", "world", "of", "flows!")
simple.collect { println(it) }
```

或者，通过 `asFlow()` 把现有的集合转为 Flow，这个还是比较实用的：

```Kotlin
listOf("Hello", "world", "of", "flows!").asFlow()
	.collect { println(it) }

(1..5).asFlow().collect { println(it) }
```



#### 2.2 通用 flow builder

最为通用的 flow builder 就是 `flow {...}` 了，这是最为通用，也是最为常用的构造器。在代码块中调用 `emit` 就可以了，它必须运行在协程之中：

```kotlin
fun main() = runBlocking {
    val simple = flow {
        for (i in 1..3) {
            delay(100)
            println("Emitting: $i")
            emit(i)
        }
    }
    simple.collect { println(it) }
}

//Emitting: 1
//1
//Emitting: 2
//2
//Emitting: 3
//3
```



------



### 3. 终端操作符 - 消费者

数据从生产者流出，直到消费者把数据收集起来进行消费，而只有数据被消费了才有意义，因此，还需要终端操作。需要注意的是终端操作符是  `Flow` 的终点，并不算是 Flow 传送带内部，因此终端操作都是  suspend  函数，调用者需要负责创建协程以正常调用这些 suspending 函数。



```kotlin
public interface Flow<out T> {

    public suspend fun collect(collector: FlowCollector<T>)
}
```

以上就是 Flow 接口定义的消费者接口，该接口的使用也非常简单：

```kotlin
fun main() = runBlocking {
    val simple = flow {
        for (i in 1..3) {
            delay(100)
            println("Emitting: $i")
            emit(i)
        }
    }
    simple.collect { value -> println("Collected $value") }
}
```



除此之外，==还有根据 `collect` 接口实现的相关扩展方法==，也是属于终端操作：

- 转换为集合：如 `toList()` 和 `toSet()` 等，可以方便把收集到的数据转换为集合
- 取特定的值：如 `first()` 只取第一个，`last()` 只取最后一个, `single()` 只要一个数据（无数据和超过一个数据时都会抛异常）
- 降维/聚合：如折叠 `fold()`  和化约 `reduce()`，折叠和化约可以对数据流进行降维，如求和，求积，求最大值、最小值等等
- 计数：`count()`  其实也是降维的一种，返回数据流中的数据个数，它还可以结合过滤以计算某种过滤条件后的数据数量

注意：

1. 数据流是一个流，一个产品传送带，通常情况下都是指无限或者说不确定数据、数量时才叫数据流，通常情况下 `last()` 都是无意义的。只有当我们知道流的生产者只生产有限数量数据时，或者采用了一些限制性的变幻操作符时，`last()` 才能派上用场。
2. `fold()`  和 `reduce()` 的区别，这里它们的区别跟集合上的操作是一样的，`fold()` 可以提供初始值，流为空时返回初始值；而 `reduce()` 没初始值，流为空时会抛异常。



------



### 4. 操作符 - 中介



#### 4.1 基础操作符



##### 4.1.1 变换操作符

数据在流动的过程中可以对数据进行转化操作，从一种数据类型变到另外一种，这就是变幻(Transformation)，这是数据流最为灵活和强大的一个方面。这跟==集合的变幻==是类似的。



###### 4.1.1.1 **转换**

最常见的变幻就是转换，也就是把从一种数据类型转换为另一种数据类型，用的最多当然是 `map`，还有更为通用的 `transform`，它们都能把数据流中的数据从一种类型转换为另一种类型。



区别在于，map 是死板的转换，一个对象进去，另一个对象作为返回值出来；但 transform 更为灵活，它并不是把新类型作为返回值，它可以像上游生产者那样产生 (emit) 新数据，甚至可以产生 (emit) 多个新数据，它是非常强大的，所有其他的变幻操作符，都是基于 transform 实现的。



- transform 操作符

  transform 操作符任意值任意次，其他转换操作符都是基于 transform 进行扩展的。比如：可以在执行长时间运行的异步请求之前，发射一个字符串并跟踪这个响应。

  ```kotlin
  fun test() {
      lifecycleScope.launch {
          (1..3).asFlow().transform {
              emit(it)
              emit("transform $it")
          }.collect { value ->
              Log.d(TAG, "collect :${value}")
          }
      }
  }
  ```

  ```bash
  D/carman: collect :1
  D/carman: collect :transform 1
  D/carman: collect :2
  D/carman: collect :transform 2
  D/carman: collect :3
  D/carman: collect :transform 3
  ```

  



- map 操作符

  学过 `RxJava` 的同学就比较熟悉，我们通过 `map`  操作符进行数据转换操作，包括转换发射出去的数据的类型：

  ```kotlin
  fun test() {
      lifecycleScope.launch {
          flow {
              emit(1)
          }.map {
              Log.d(TAG, "第一次转换")
              it * 5
          }.map {
              Log.d(TAG, "第一次转换后的值 :$it")
              "map $it"
          }.collect { value ->
              Log.d(TAG, "最终转换后的值 :${value}")
          }
      }
  }
  ```

  ```bash
  D/carman: 第一次转换
  D/carman: 第一次转换后的值 :5
  D/carman: 最终转换后的值 :map 5
  ```

  可以看到我们在第一个 `map` 操作符中进行乘运算，第二 `map` 操作符中进行类型转换。最终接收到我们经过多次转换处理后的数据。

  这样做的好处就是，能够保证我们在每一个流的过程中单一职责，一次转换只执行一种操作，而不是把所有过程集中到一起处理完成以后再下发。

  

  `map`  还有同类型操作符 `mapNotNull`，它会过滤掉空值，只发射不为空的值。

  ```kotlin
  fun test() {
      val flow = flowOf("one", "two", "three", null, "four")
      lifecycleScope.launch {
          flow.mapNotNull {
              it
          }.collect { value ->
              Log.d(TAG, "collect :${value}")
          }
      }
  }
  ```

  ```bash
  D/carman: collect :one
  D/carman: collect :two
  D/carman: collect :three
  D/carman: collect :four
  ```

  

  还有一个操作符 withIndex 它与集合中的 mapIndexed 是类似的，它的作用是把元素变成 `IndexedValue`，这样在后面就可以得到元素和元素的索引 了，在某些场景下还是比较方便的。



###### 4.1.1.2 **限制**

数据流里面的数据不一定都是需要的，所以通常需要对数据元素进行过滤，这就是限制性操作符，最常见的就是 `filter()`，这里与集合的限制操作也是类似的：

- `filter()`：把数据转为布尔型，从而对数据流进行过滤。
- `distinctUntilChanged()`：过滤掉与前一个相同的元素。
- `drop()`：丢弃前面一定数量的元素。
- `take()`：只返回流中前面一定数量的元素，当数量达到时流将被取消，注意 take 与 drop 是相反的。
- ``takeWhile()``：与 `filter` 类似，不过它是当遇到条件判断为 `false` 的时候，将会中断后续的操作。
- `debounce()`：用于过滤掉短时间内的频繁值，只保留一段时间内最后一个值，适用于减少不必要的处理，比如搜索输入的实时查询。即使流结束，因为最新的数据也在这段时间内，也会被收集到。
- `sample()` ：按照固定时间间隔对数据流进行采样，获取每个间隔内的最新值，适用于定期获取最新状态，比如定期更新界面数据。<font color= "red">注意：流完成时，如果下一个时间间隔还未到，则最后一个数据不会被收集。它与 debounce() 的核心区别在于，sample 专注于时刻，debounce 专于与间隔。 </font>



```Kotlin
fun main() = runBlocking {
    val constraint = flow {
        emit(1)
        delay(90)
        emit(2)
        delay(90)
        emit(3)
        delay(1010)
        emit(4)
        delay(1010)
        emit(5)
    }

    constraint.filter { it % 2 == 0 }
        .collect { println("filter: $it") }

    constraint.drop(3)
        .collect { println("drop(3): $it") }

    constraint.take(3)
        .collect { println("take(3): $it") }

	constraint = flowOf(1,1,1,2,3,4,4,5,1,2,2,3,3)
    constraint.takeWhile { it  == 1 }
    	.collect {println("takeWhile(1): $it")}

    constraint.debounce(1000)
        .collect { println("debounce(1000): $it") }

    constraint.sample(1000)
        .collect { println("sample(1000): $it") }

	constraint = flowOf(1, 2, 3, 4, 5, 5, 4, 3, 2, 1)
	constraint.distinctUntilChanged()
    	.collect { println("distinctUntilChanged: $it") }
}
```

仔细看它们的输出，以理解它们的作用：

```Bash
filter: 2
filter: 4

drop(3): 4
drop(3): 5

take(3): 1
take(3): 2
take(3): 3

takeWhile(1): 1
takeWhile(1): 1
takeWhile(1): 1
# 在第四个1之前遇到了false的判断，所以取消了后续流的执行。

debounce(1000): 3
debounce(1000): 4
debounce(1000): 5

sample(1000): 3
sample(1000): 4
# 发射 5 之后流已经完成了，这个时候下一个时间间隔还未到，因此该数据不会被采集

distinctUntilChanged: 1
distinctUntilChanged: 2
distinctUntilChanged: 3
distinctUntilChanged: 4
distinctUntilChanged: 5
distinctUntilChanged: 4
distinctUntilChanged: 3
distinctUntilChanged: 2
distinctUntilChanged: 1
```

中游的变幻操作符仍属于流的一部分，它们都仍运行在Flow的上下文中，因此，这些操作符内，与流的 builder 一样，都可以直接调用其他的 supsend 函数，甚至是其他的耗时的，阻塞的函数都可以调用。并不需要特别的为上游和中游创建上下文。


Flow的操作符特别多，我们需要留意区别中游操作符和下游终端。看这些函数的返回类型就可以了，==**返回类型是具体数据的，一定是下游终端操作符**==；而==**对于上游生产者和中游变幻操作符，其返回值一定是一个 Flow**==。



##### 4.1.2 线程切换操作符

在使用 `Flow` 的时候如果想切换线程，我们就需要使用 `Flow` 的扩展函数 `flowOn`。

```kotlin
public fun <T> Flow<T>.flowOn(context: CoroutineContext): Flow<T> {
    checkFlowContext(context)
    return when {
        context == EmptyCoroutineContext -> this
        this is FusibleFlow -> fuse(context = context)
        else -> ChannelFlowOperatorImpl(this, context = context)
    }
}
```

`flowOn` 将执行此流的上下文更改为指定上下文。该操作符是可组合的。需要注意的是 `flowOn` 只影响前面没有自己上下文的操作符。这个要怎么理解能呢。我们先看默认状态 flow 是都执行在哪些线程上的：

```kotlin
fun test() {
    lifecycleScope.launch {
        flow {
            for (i in 1..3) {
                Log.d(TAG, "flow :${ currentCoroutineContext()}")
                delay(100)
                emit(i)
            }
        }.collect { value ->
                Log.d(TAG, "collect:${ currentCoroutineContext()} value :${value}")
            }
    }
}
```

通过前面的学习我们知道，`lifecycleScope `的 `launch` 默认是主线程执行的，那么按照协程的执行原理，我们可以确定上面例子中所有的执行操作都是在主线程上：

```bash
D/carman: flow :[StandaloneCoroutine{Active}@78b0fe4, Dispatchers.Main.immediate]
D/carman: collect:[StandaloneCoroutine{Active}@78b0fe4, Dispatchers.Main.immediate] value :1
D/carman: flow :[StandaloneCoroutine{Active}@78b0fe4, Dispatchers.Main.immediate]
D/carman: collect:[StandaloneCoroutine{Active}@78b0fe4, Dispatchers.Main.immediate] value :2
D/carman: flow :[StandaloneCoroutine{Active}@78b0fe4, Dispatchers.Main.immediate]
D/carman: collect:[StandaloneCoroutine{Active}@78b0fe4, Dispatchers.Main.immediate] value :3
```

这个时候我们使用 `flowOn` 切换一下线程再看看，会产生有何不一样的变化。

```kotlin
fun test() {
    lifecycleScope.launch {
        flow {
            for (i in 1..3) {
                Log.d(TAG, "flow :${ currentCoroutineContext()}")
                delay(100)
                emit(i)
            }
        }
        .flowOn(Dispatchers.IO)
        .collect { value ->
            Log.d(TAG, "collect:${ currentCoroutineContext()} value :${value}")
        }
    }
}
```

```bash
D/carman: flow :[ProducerCoroutine{Active}@78b0fe4, Dispatchers.IO]
D/carman: flow :[ProducerCoroutine{Active}@78b0fe4, Dispatchers.IO]
D/carman: collect:[ScopeCoroutine{Active}@1e865fe, Dispatchers.Main.immediate] value :1
D/carman: flow :[ProducerCoroutine{Active}@78b0fe4, Dispatchers.IO]
D/carman: collect:[ScopeCoroutine{Active}@1e865fe, Dispatchers.Main.immediate] value :2
D/carman: collect:[ScopeCoroutine{Active}@1e865fe, Dispatchers.Main.immediate] value :3
```

可以看到 `flow` 代码块中的执行已经切换到另外一个线程执行。但是 `collect` 中的代码依然执行在主线程上。那如果我们再增加一个又会是什么结果呢？

```kotlin
fun test() {
    lifecycleScope.launch {
        flow {
            for (i in 1..3) {
                Log.d(TAG, "flow :${ currentCoroutineContext()}")
                delay(100)
                emit(i)
            }
        }
        .flowOn(Dispatchers.IO)
        .map {
            Log.d(TAG, "map :${ currentCoroutineContext()}")
            it
        }
        .flowOn(Dispatchers.Default)
        .collect { value ->
            Log.d(TAG, "collect:${ currentCoroutineContext()} value :${value}")
        }
    }
}
```

```bash
D/carman: flow :[ProducerCoroutine{Active}@78b0fe4, Dispatchers.IO]
D/carman: flow :[ProducerCoroutine{Active}@78b0fe4, Dispatchers.IO]
D/carman: map :[ScopeCoroutine{Active}@cc43a14, Dispatchers.Default]
D/carman: collect:[ScopeCoroutine{Active}@8b702bd, Dispatchers.Main.immediate] value :1
D/carman: flow :[ProducerCoroutine{Active}@78b0fe4, Dispatchers.IO]
D/carman: map :[ScopeCoroutine{Active}@cc43a14, Dispatchers.Default]
D/carman: collect:[ScopeCoroutine{Active}@8b702bd, Dispatchers.Main.immediate] value :2
D/carman: map :[ScopeCoroutine{Active}@cc43a14, Dispatchers.Default]
D/carman: collect:[ScopeCoroutine{Active}@8b702bd, Dispatchers.Main.immediate] value :3
```



这里我们先跳过 `map` 操作符，只看我们本次关注的地方。可以看到在 `flowOn(Dispatchers.IO)` 前的 `flow{...}` 中的代码是执行在 `IO` 线程上的，而再调用 `flowOn(Dispatchers.Default)` 并没有改变 `flow{...}` 的执行线程，只是改变了没有上下文的 `map` 执行线程，使 `map` 中的代码块执行在`Default` 线程中。而 `collect` 中的代码依然执行在主线程上。



如果这里时候我们把 `flowOn(Dispatchers.IO)` 去掉，我们就会发现 `flow{...}` 和 `map` 中的代码块都将执行在 `Default` 线程中。

```bash
D/carman: flow :[ProducerCoroutine{Active}@3656c4d, Dispatchers.Default]
D/carman: map :[ProducerCoroutine{Active}@3656c4d, Dispatchers.Default]
D/carman: flow :[ProducerCoroutine{Active}@3656c4d, Dispatchers.Default]
D/carman: collect:[ScopeCoroutine{Active}@840cc75, Dispatchers.Main.immediate] value :1
D/carman: map :[ProducerCoroutine{Active}@3656c4d, Dispatchers.Default]
D/carman: flow :[ProducerCoroutine{Active}@3656c4d, Dispatchers.Default]
D/carman: collect:[ScopeCoroutine{Active}@840cc75, Dispatchers.Main.immediate] value :2
D/carman: map :[ProducerCoroutine{Active}@3656c4d, Dispatchers.Default]
D/carman: collect:[ScopeCoroutine{Active}@840cc75, Dispatchers.Main.immediate] value :3
```



通过四次日志的对比，我们可以做一些总结：

- <font color='red'>`flowOn` 可以将执行此流的上下文更改为指定的上下文。</font>
- <font color='red'>`flowOn` 可以进行组合使用。</font>
- <font color='red'>`flowOn` 只影响前面没有自己上下文的操作符。已经有上下文的操作符不受后面 `flowOn` 影响。</font>
- <font color='red'>不管 `flowOn` 如何切换线程, `collect` 始终是运行在调用它的协程调度器上。</font>





##### 4.1.3 流程操作符

用来区分流程执行到某一个阶段。比如：`onStart`/`onEach`/`onCompletion`。过渡操作符应用于上游流，并返回下游流。这些操作符也是冷操作符，就像流一样。这类操作符本身不是挂起函数。它运行的速度很快，返回新的转换流的定义。



- onStart：在上游流启动之前被调用。
- onEach：在上游流的每个值被下游发出之前调用。
- onCompletion：在流程完成或取消后调用，并将取消异常或失败作为操作的原因参数传递。



需要注意的是，`onStart` 在 `SharedFlow(热数据流)` 一起使用时，并不能保证发生在 `onStart` 操作内部或立即发生在 `onStart` 操作之后的上游流排放将被收集。这个问题我们在后面文章的`热数据流`时讲解。

```kotlin
fun test() {
    lifecycleScope.launch {
        flow {
            Log.d(TAG, "flow")
            emit(1)
        }.onStart {
            Log.d(TAG, "onStart ")
        }.onEach {
            Log.d(TAG, "onEach :${it}")
        }.onCompletion {
            Log.d(TAG, "onCompletion")
        }.collect { value ->
            Log.d(TAG, "collect :${value}")
        }
    }
}
```

```bash
D/carman: onStart 
D/carman: flow
D/carman: onEach :1
D/carman: collect :1
D/carman: onCompletion
```

可以看到<font color="red">整个执行流程依次是  `onStart` -> `flow{ ...}` ->` onEach`->`collect`->`onCompletion`</font>。





##### 4.1.4 异常操作符

用来捕获处理流的异常。比如：`catch`,`onErrorCollect`(已废弃，建议用 `catch` )。


上面提到了 `Flow` 执行的时候可能会出现异常。我们先修改下代码，在 `onEach` 中抛出一个异常信息。再看看代码出现异常后会输出怎样的日志信息：

```kotlin
fun test() {
    lifecycleScope.launch {
        flow {
            Log.d(TAG, "flow")
            emit(1)
        }.onStart {
            Log.d(TAG, "onStart ")
        }.onEach {
            Log.d(TAG, "onEach :${it}")
            throw NullPointerException("空指针")
        }.onCompletion { cause ->
            Log.d(TAG, "onCompletion catch $cause")
        }.collect { value ->
            Log.d(TAG, "collect :${value}")
        }
    }
}
```

```bash
 D/carman: onStart 
 D/carman: flow
 D/carman: onEach 1
 D/carman: onCompletion catch java.lang.NullPointerException: 空指针
 Process: com.example.myapplication, PID: 31145
    java.lang.NullPointerException: 空指针
    ...
```

可以看到在 `onEach` 中抛出一个异常后，因为异常导致协程退出，所以 `collect` 没有执行，但是执行了 `onCompletion`。这又是怎么回事呢。

`onCompletion` 不应该是在 `collect` 后执行吗？为什么没有执行 `collect`，反而执行了 `onCompletion` 。这个时候我们需要看下源码：

```kotlin
public fun <T> Flow<T>.onCompletion(action: suspend FlowCollector<T>.(cause: Throwable?) -> Unit): Flow<T> = unsafeFlow {
    try {
        collect(this)
    } catch (e: Throwable) {
        ThrowingCollector(e).invokeSafely(action, e)
        throw e
    }
    val sc = SafeCollector(this, currentCoroutineContext())
    try {
        sc.action(null)
    } finally {
        sc.releaseIntercepted()
    }
}
```

可以看到在 `onCompletion` 中，通过 `try/catch` 块来捕获了`collect` 方法，然后在 `catch` 分支里。通过 `invokeSafely` 执行了 `onCompletion` 中的代码，然后重新抛出异常。既然又重新抛出了异常，那我们又该通过什么方式合理的处理这个异常呢？

```kotlin
fun test() {
    lifecycleScope.launch {
        try {
            flow {
                Log.d(TAG, "flow")
                emit(1)
                throw NullPointerException("空指针")
            }.onStart {
                Log.d(TAG, "onStart ")
            }.onEach {
                Log.d(TAG, "onEach ")
            }.onCompletion {
                Log.d(TAG, "onCompletion")
            }.collect { value ->
                Log.d(TAG, "collect :${value}")
            }
        } catch (e: Exception) {
            Log.d(TAG, "Exception : $e ")
        }
    }
}
```



虽然我们同样的可以使用 `try/catch` 来处理异常，但是这种写法是不是看上去没有那么优雅，而且出现异常后，无法再继续往下执行。

即使我们在 `flow {...}`  构建器内部使用  `try/catch`，然后再通过 `emit` 中发射，这也是不合理的，因为它是违反异常透明性的。



这个时候我们需要使用 `catch` 操作符来保留此异常的透明性，并允许封装它的异常处理。`catch` 操作符的代码块可以分析异常并根据捕获到的异常以不同的方式对其做出反应：

- **可以使用 `throw` 重新抛出异常**
- **可以在 `catch` 代码块中通过 `emit` 将异常转换为新的值发射出去**
- **可以将异常忽略，或用日志打印，或使用一些其他代码处理它**



现在我们修改一下代码，去掉 `try/catch` 块。然后通过 `catch` 操作符来捕获异常后，最后通过 `emit` 中发射一个新的值出去：

```kotlin
fun test() {
    lifecycleScope.launch {
        flow {
            Log.d(TAG, "flow")
            emit(1)
            throw NullPointerException("空指针")
        }.onStart {
            Log.d(TAG, "onStart ")
        }.onEach {
            Log.d(TAG, "onEach ")
        }.catch { cause ->
            Log.d(TAG, "catch $cause")
            emit(2)
        }.onCompletion { cause ->
            Log.d(TAG, "onCompletion catch $cause")
        }.collect { value ->
            Log.d(TAG, "collect :${value}")
        }
    }
}
```

```bash
D/carman: onStart 
D/carman: flow
D/carman: onEach 1
D/carman: catch java.lang.NullPointerException: 空指针
D/carman: collect :2
D/carman: onCompletion catch null
```

可以看到我们通过 `catch` 操作符捕获异常后，`collect` 能够只能收集到上游发射的值。通过我们在 `catch` 操作符中通过 `emit` 发射的值 `2` 也正常被收集。而且我们在 `onCompletion` 也不会收集到异常信息。



这个时候我们如果再修改一下代码，在`catch`操作符后面再加一个`map`操作符，通过它再抛出一个新的异常又会是什么情况呢。

```kotlin
fun test() {
    lifecycleScope.launch {
        flow {
            Log.d(TAG, "flow")
            emit(1)
        }.onStart {
            Log.d(TAG, "onStart ")
        }.onEach {
            Log.d(TAG, "onEach $it")
            throw NullPointerException("空指针")
        }.catch { cause ->
            Log.d(TAG, "catch $cause")
            emit(2)
        }.map {
            Log.d(TAG, "map")
            throw NullPointerException("新的异常")
            it
        }.onCompletion { cause ->
            Log.d(TAG, "onCompletion2 catch $cause")
        }.collect { value ->
            Log.d(TAG, "collect :${value}")
        }
    }
}
```

```bash
D/carman: onStart 
D/carman: flow
D/carman: onEach 1
D/carman: catch java.lang.NullPointerException: 空指针
D/carman: map
D/carman: onCompletion2 catch java.lang.NullPointerException: 新的异常
Process: com.example.myapplication, PID: 32168
java.lang.NullPointerException: 新的异常
...
...
```

程序直接崩溃了。这又是什么情况。这是因为<font color='red'>每个操作符只是针对它上游的流，如果下游的流中出现异常，我们需要再次添加一个 `catch` 操作符才能正常捕获</font>。



但是如果我们的异常是在 `collect` 末端操作符中出现，这个时候我们就只能通过 `try/catch` 整个`Flow`数据流或来处理，或者通过协程上下文中的`CoroutineExceptionHandler` 来处理（*这里可以自己动手试试*）。




#### 4.2 高级操作符

前面讲的操作符都是针对 某一个流本身的，但大多数场景一个流明显不够用啊，我们需要操作多个流，这时就需要用到一些高级操作符了。



##### 4.2.1 合并多路流

多路流不可能一个一个的处理，合并成为一路流更加的方便，有以下合并方法：

1. `merge`

   把**数据类型相同的多路流归并为一路**，注意一定是数据类型相同的才可以归并，并且归并后的元素顺序是未知的，也即不会保留原各路流的元素顺序，归并流的数量也没有限制。

   

2. `zip`

   当想要**把两路流的元素对齐后粘合为一个元素**时，就可以使用 zip，当任何一个流结束或者被取消时，zip 也就结束了。只能两个两个的粘合。

   

3. `combine`

   把多路流中的每个流的最新元素粘合成新数据，形成一个新的流，其元素是把**每个元素**都用**每路流的最新元素**来转换生成。最少需要2路流，最多支持5路流。
   
   

用一个例子来感受一下它们的作用：

```Kotlin
fun main() = runBlocking {
    val one = flowOf(1, 2, 3)
                .map(Int::toString)
                .onEach { delay(10) }
    val two = flowOf("a", "b", "c", "d")
                .onEach { delay(25) }

    merge(one, two)
        .collect { println("Merge: $it") }

    one.zip(two) { i, s -> "Zip: $i. $s" }
        .collect { println(it) }

    combine(one, two) { i, s -> "Combine $i with $s" }
        .collect { println(it) }
}
```

这里是输出：

```Bash
Merge: 1
Merge: 2
Merge: a
Merge: 3
Merge: b
Merge: c
Merge: d

Zip: 1. a
Zip: 2. b
Zip: 3. c

Combine 2 with a
Combine 3 with a
Combine 3 with b
Combine 3 with c
Combine 3 with d
```

通过它们的输出可以看到它们的区别：`merge` 就像把两个水管接到一样，简单没有多余加工，适合数据类型一样的流（比如都是水）；`zip` 会对齐两路流，让能对齐的元素两两结合，对不齐时就结束了。



而 `combine` 要等到**集齐每路流的最新元素，才能转换成新数据**，two 是较 one 慢的，看到 two 的元素『a』时，one 最新的元素是『2』，之后 one 的『3』来了，这时 two 最新的元素还是『a』，之后one停在了『3』，后续 two 的元素都与『3』组合。有同学可能会有疑问，为啥 one 的『1』丢弃了，没找到组合呢？因为它来的太早了，one 的『1』来了时，two 还没有元素，它肯定会等，但当 two 的第一个元素『a』来了时，这时 one 的最新元素已是『2』了，one 是10ms 发一个元素，two 是隔 25ms 发一个元素，所以 two 的第 1 个元素到了时，one 的第 2 个元素已经来了，它是最新的，所以组合时会用它，combine 要集齐每路流的最新元素才能合成。



总结：<font color = 'red'>**zip 会按顺序对齐元素**；而 combine 要**集齐每路流的最新元素**，先要**集齐**，齐了时还要**取每个流的最新元素**。</font>



##### 4.2.2 展平(Flatten)

一个 Flow 就是一个异步数据流，它相当于一个传送带或者管道，货物（具体的数据）在其上面或者里面流动。正常情况下 Flow 内部都是常规数据（对象）在流动，但 Flow 本身也是一个对象，因此也可以嵌套，把流当成另一个流的数据，比如 Flow<Flow<Int>>，这就是 Flow of Flows of Int。Flow 是数据流，最终消费者需要的是具体的数据，所以对于嵌套的 Flow of Flows，通常都需要在传给终端操作符之前进行展平(flatten)，得到一个 faltterned Flow（即从 Flow<Flow<Int>> 转成 Flow<Int>），就可以被终端消费了。操作符中以 flat 开头的函数都是用于展平的，主要是两类，一类是**展平 flatten 系**，一类是**先变幻再展平 flatMap 系**。



- 直接展平

  最直观的展平莫过于对于已经是嵌套的 Flow of Flows 做展平处理，以能让终端操作符正常的消费 Flow 里面的数据，有两个 API 可以做展平：

  1. `flattenConcat` 

     把嵌套的 Flow of Flows 展平为一个 Flow，内层的每个流都是按顺序拼接在一起的，串行拼接。比如 Flow of 4 Flows，内层有四个管道，那就就变成了『内层1』->『内层2』->『内层3』->『内层4』。

     

  2. `flattenMerge`

     把 Flow of Flows 展平为一个 Flow，内层的所有 Flow 是以并发的方式将元素混合流入新管道，是并发式混合，相当于四个管道同时往另一个管道倒水，原流中的顺序会错乱掉。
     
     

  ```Kotlin
  fun main() = runBlocking {
      val flow2D = flowOf("Hello", "world", "of", "flow!")
          .map { it.toCharArray().map { c -> " '$c' " }.asFlow() }
          .flowOn(Dispatchers.Default)
  
      flow2D.collect { println("Flow object before flatten: $it") } // Data in flow are Flow objects
  
      println("With flattenConcat:")
      flow2D.flattenConcat()
          .collect { print(it) }
  
      println("\nWith flattenMerge:")
      flow2D.flattenMerge()
          .collect { print(it) }
  }
  
  //Flow object before flatten: kotlinx.coroutines.flow.FlowKt__BuildersKt$asFlow$$inlined$unsafeFlow$3@1b0375b3
  //Flow object before flatten: kotlinx.coroutines.flow.FlowKt__BuildersKt$asFlow$$inlined$unsafeFlow$3@e580929
  //Flow object before flatten: kotlinx.coroutines.flow.FlowKt__BuildersKt$asFlow$$inlined$unsafeFlow$3@1cd072a9
  //Flow object before flatten: kotlinx.coroutines.flow.FlowKt__BuildersKt$asFlow$$inlined$unsafeFlow$3@7c75222b
  //With flattenConcat:
   //'H'  'e'  'l'  'l'  'o'  'w'  'o'  'r'  'l'  'd'  'o'  'f'  'f'  'l'  'o'  'w'  '!' 
  //With flattenMerge:
  // 'H'  'e'  'l'  'l'  'o'  'w'  'o'  'r'  'l'  'd'  'o'  'f'  'f'  'l'  'o'  'w'  '!'
  ```

  从输出中可以看出，如果不展平 Flow 里面是 Flow 对象，没法用。`flattenConcat` 是把内层的流串行的接在一起。但 `flattenMerge`  的输出似乎与文档描述不太一致，并没有并发式的混合。

  

- 先转换再展平

  <img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1ecd858cffd34ee0a1cc6e5e26066707~tplv-k3u1fbpfcp-jj-mark:3024:0:0:0:q75.awebp#?w=1080&h=603&s=133296&e=png&b=ffffff" alt="img" style="zoom:50%;" />

  大多数时候并没有现成的嵌套好的 Flow of Flows 给你展平，更多的时候是我们需要自己把元素转换为一个 Flow，先生成 Flow of Flows，然后再展平，且有定义好的 API 可以直接用：

  1. `flatMapConcat` 

     先把 Flow 中的数据做变幻，这个变幻必须从元素变成另一个 Flow，这时就变成了嵌套式的 Flow of Flows，然后再串行式展平为一个 Flow。

     

  2. `flatMapLatest`

     先把 Flow 中的最新数据做变幻，这个变幻必须从元素变成另一个 Flow，这时会取消掉之前转换生成的内层流，结果虽然也是嵌套，但内层流只有一个，就是原 Flow 中最新元素转换生成的那个流。然后再展平，这个其实也不需要真展平，因为内层流只有一个，它里面的数据就是最终展平后的数据。

     

  3. `flatMapMerge` 

     与 flatMap Concat一样，只不过展平的时候嵌套的内层流是以并发的形式来拼接的。

     

  来看个例子就能明白它们的作用了：

  ```kotlin
  fun main() = runBlocking {
      val source = (1..3).asFlow()
          .onEach { delay(100) }
  
      println("With flatMapConcat:")
      var start = System.currentTimeMillis()
      source.flatMapConcat(::requestFlow)
          .collect { println("$it at ${System.currentTimeMillis() - start}ms from the start") }
  
      println("With flatMapMerge:")
      start = System.currentTimeMillis()
      source.flatMapMerge(4, ::requestFlow)
          .collect { println("$it at ${System.currentTimeMillis() - start}ms from the start") }
  
      println("With flatMapLatest:")
      source.flatMapLatest(::requestFlow)
          .collect { println("$it at ${System.currentTimeMillis() - start}ms from the start") }
  }
  
  fun requestFlow(x: Int): Flow<String> = flow {
      emit(" >>[$x]: First: $x")
      delay(150)
      emit(" >>[$x]: Second: ${x * x}")
      delay(200)
      emit(" >>[$x]: Third: ${x * x * x}")
  }
  ```

  输出比较多：

  ```bash
  With flatMapConcat:
   >>[1]: First: 1 at 140ms from the start
   >>[1]: Second: 1 at 306ms from the start
   >>[1]: Third: 1 at 508ms from the start
   >>[2]: First: 2 at 613ms from the start
   >>[2]: Second: 4 at 765ms from the start
   >>[2]: Third: 8 at 969ms from the start
   >>[3]: First: 3 at 1074ms from the start
   >>[3]: Second: 9 at 1230ms from the start
   >>[3]: Third: 27 at 1432ms from the start
   
  With flatMapMerge:
   >>[1]: First: 1 at 130ms from the start
   >>[2]: First: 2 at 235ms from the start
   >>[1]: Second: 1 at 284ms from the start
   >>[3]: First: 3 at 341ms from the start
   >>[2]: Second: 4 at 386ms from the start
   >>[1]: Third: 1 at 486ms from the start
   >>[3]: Second: 9 at 492ms from the start
   >>[2]: Third: 8 at 591ms from the start
   >>[3]: Third: 27 at 695ms from the start
   
  With flatMapLatest:
   >>[1]: First: 1 at 807ms from the start
   >>[2]: First: 2 at 915ms from the start
   >>[3]: First: 3 at 1021ms from the start
   >>[3]: Second: 9 at 1173ms from the start
   >>[3]: Third: 27 at 1378ms from the start
  ```

  这个示例中原始 Flow 是一个 Int 值，把它转换成为一个字符串流 Flow<String>。从输出中可以看到 `flatMapConcat` 确实是串行拼接，并且`flatMapMerge` 是并发式的混合，不保证内部 Flow 的元素顺序。仔细看 `flatMapLatest` 的输出，每当原始 Flow 中有新的值生成时，之前转换生成的流会被取消，它们并没有运行完（仅第一个元素流出了）。而原始流的最后一个元素『3』则完整的从展平流中流出了。
  

  展平的函数比较多容易学杂，其实有一个非常简单的区分方法：<font color='red'>带有 **Map 字样**的函数就是先把元素**转换成 Flow **之后再展平；带有 **Concat** 就是把嵌套内层流**串行拼接**；而带有 **Merge** 的则是把内层流**并发式的混合**。使用的时候，如果**想保证顺序就用带有 Concat 的函数；想要并发性，想高效一些，并且不在乎元素顺序，那就用带有 Merge 的函数。**</font>



#### 4.3 背压处理

想象你开了一家网红冰淇淋店：

- 🍦 生产部：每秒钟制作 10 支冰淇淋（疯狂的生产力！）
- 🚗 配送部：每秒钟只能运送 1 支冰淇淋（电动车没充电）
- 💥 结果：仓库瞬间爆仓，冰淇淋融化，顾客差评...

这就是典型的背压场景！在编程中，当 `Flow` 生产者发射数据的速度远超消费者处理速度时，就会发生类似的数据洪灾。



Flow 的背压策略主要有如下三种：

```kotlin
public enum class BufferOverflow {
    /**
     * Suspend on buffer overflow.
     */
    SUSPEND,

    /**
     * Drop **the oldest** value in the buffer on overflow, add the new value to the buffer, do not suspend.
     */
    DROP_OLDEST,

    /**
     * Drop **the latest** value that is being added to the buffer right now on buffer overflow
     * (so that buffer contents stay the same), do not suspend.
     */
    DROP_LATEST
}
```

- `SUSPEND` （`buffer()` 方法中默认）：会将当前协程挂起，直到缓冲区中的数据被消费了
- `DROP_OLDEST` ：它会丢弃最老的数据
- `DROP_LATEST` : 它会丢弃最后的数据



##### 4.3.1  `SUSPEND` 策略 - **缓冲区：给数据建个"临时仓库" 🏗️**



默认方式，会挂起当前函数，直到执行完毕，对应 `buffer()` 方法。

```kotlin
fun warehouseSolution() = flow {
    repeat(100) {
        delay(10) // 闪电级生产速度
        emit("包裹$it")
        println("📦 已生产第$it 个包裹")
    }
}.buffer(50) // 建造50容量的仓库
.collect { parcel ->
    delay(100) // 龟速配送
    println("🚚 已送达：$parcel")
}
```

代码彩蛋：

- <font color = 'red'>`buffer(50)`</font> 就像租用临时仓库，允许生产者在消费者处理时继续工作
- 打印结果会看到生产日志飞速滚动，而消费日志缓慢跟进
- 小心仓库容量！设置过大会导致内存吃紧



##### 4.3.2 `DROP_OLDEST` 策略 - **流量控制：快递界的"断舍离" ✂️**



丢弃最老的数据，对应 `conflate()` 方法，也就是：`buffer(capacity = 0, onBufferOverflow = BufferOverflow.DROP_OLDEST)`。

在一些情况下，由于生产消费速率不匹配的问题， `conflate` 将做取舍，丢弃掉旧数据，只有在收集器空闲之前发出的最后一个元素才被收集， 这样做的好处就是执行时间缩短，不受积压影响，但相应的是数据丢失。

```kotlin
// 方案A：只保留最新快递（霸道总裁版）
flow { 
    repeat(100) {
        delay(10) // 闪电级生产速度
        emit("包裹$it")
        println("📦 已生产第$it 个包裹")
    }
}.conflate().collect { parcel ->
    delay(100) // 龟速配送
    println("🚚 已送达：$parcel")
}
```



##### 4.3.3 `DROP_LATEST` 策略 - **流量控制：快递界的"断舍离" ✂️**



丢弃上一个数据处理，对应 `collectLatest()` 方法，当原始流发出一个新的值的时候，前一个值的处理将被取消，也就是不会被接收， 和 `conflate` 的区别在于它不会用新的数据覆盖，而是每一个都会被处理，只不过如果前一个还没被处理完后一个就来了的话，处理前一个数据的逻辑就会被取消。

也就是：`mapLatest(action).buffer(0).collect()`

```kotlin
// 方案B：最新快递优先派送（VIP服务版）
flow { 
    repeat(100) {
        delay(10) // 闪电级生产速度
        emit("包裹$it")
        println("📦 已生产第$it 个包裹")
    }
}.collectLatest { parcel ->
    cancel() // 取消当前配送
    println("⚠️ 急件处理：$parcel")
    delay(100)
    println("🚀 特快专送：$parcel")
}
```

使用场景PK：

- 实时股票报价 → 选 <font color = 'red'>`conflate`</font>（只需最新价格）
- 搜索建议 → 选 <font color = 'red'>`collectLatest`</font>（用户最后输入最重要）





##### 4.3.4 **多线程处理** - 效率革命：双11物流备战方案 🚀

```kotlin
flow {
    repeat(100) {
        withContext(Dispatchers.Default) {
            heavyCalculation() // 复杂计算
            emit("结果$it")
        }
    }
}.flowOn(Dispatchers.IO) // 生产端专用流水线
.collect { result ->
    withContext(Dispatchers.Main) {
        updateUI(result) // UI更新
    }
}
```

多线程妙用：

- <font color = 'red'>`flowOn(Dispatchers.IO)`</font>：让生产端在后台线程狂奔
- <font color = 'red'> `Dispatchers.Main`</font>：消费端在主线程优雅更新UI
-  通过 <font color = 'red'>`Android Profiler`</font> 观察线程切换情况



##### 4.3.5 **背压处理决策树**

遇到背压时，灵魂三问：

1. 数据是否允许丢弃？ →  <font color = 'red'>`conflate()`</font>
2. 是否需要最新数据？ → <font color = 'red'>`collectLatest`</font>
3. 是否愿意加内存？ →  <font color = 'red'>`buffer()`</font>
4. 还能优化处理速度吗？ → 多线程优化



------




### 5. 冷流与热流

对于数据流来说有**冷热**之分，==冷流(Cold stream)是指消费者开始接收数据时，才开始生产数据，多次消费则多次生产，生产和消费总是相对应的；热流(Hot stream)，与之相反，不管有没有人在消费，都在生产数据==。



有一个非常形象的比喻就是，冷流就好比 CD，你啥时候都可以听，而且只要你播放就从头开始播放 CD 上所有的音乐；而热流就好比电台广播，不管你听不听，它总是按它的节奏在广播，今天不听，就错过今天的数据了，今天听跟明天听，听到的内容也是不一样的。



#### 5.1 冷流

Kotlin 的 **Flow 是冷流**，其实从上面的例子也能看出来，每个例子中都是只创建一个 Flow 对象，然后有多次 collect，但**每次 collect 都能拿到 Flow 中完整的数据**，这就是**典型的冷流**。绝大多数场景，我们需要的也都是冷流。



##### 5.1.1 普通 Flow

Flow 是序列生成和处理的强大工具，能够轻松地进行转换和组合。适用于数据的异步获取和处理，在数据到来时发射数据。

例如：

```kotlin
fun fetchUserData(): Flow<UserData> = flow {
    // 假设这是从数据库或网络获取用户数据的操作
    val data = database.getUserData()
    emit(data) // 发射数据
}
```

然后，在页面中就可以这样收集这个 Flow：

```scss
viewModel.fetchUserData().onEach { userData ->
    // 更新UI
}.launchIn(lifecycleScope) // 使用lifecycleScope确保在合适的生命周期内收集
```

**适合的场景:**

- 数据流的异步处理：当你需要从数据库、网络或其他异步源获取数据时，Flow 是一个很好的选择。
- 连续数据的处理：如果你的应用需要处理一系列连续的数据（例如，实时更新的数据），Flow 可以帮助你以声明式的方式处理这些数据流。
- 转换和组合数据：Flow 提供了丰富的操作符，如 map、filter、combine 等，这些操作符可以帮助你轻松地转换和组合数据流。

**特点：**

- 冷流：Flow 是冷流，它只在有收集器时开始发射数据，这意味着数据是按需产生的。
- 轻量级：Flow 设计用于处理数据流，与 LiveData 相比，它更轻量级，没有生命周期感知的特性，这使得它在 ViewModel 中使用更为灵活。
- 支持协程：Flow 完全集成了 Kotlin 协程，这使得它在处理异步操作时非常强大且易于使用。
- 丰富的操作符：Flow 提供了一系列操作符，用于数据的转换、过滤、组合等操作，这些操作符使得 Flow 在处理复杂的数据流时非常灵活。



#### 5.2 热流

虽然冷流大部分场景使用起来都没有问题，但它仍有局限性。虽然`Flow` 可以将任意的对象转换成流的形式进行收集后计算结果，但是如果我们是直接使用`Flow`，它一次流的收集是我们已知需要计算的值，而且它每次收集完以后就会立即销毁。我们也不能在后续的使用中，发射新的值到该流中进行计算。




这里我们举个简单的例子，我们将在后续的讲解中详细说明。比如：

```kotlin
fun test(){
    runBlocking {
        var flow1 =  (1..3).asFlow()
        flow1.collect { value ->
            println("$TAG: collect :${value}")
        }
        flow1 = (4..6).asFlow()
    }
}
```

```shell
carman: collect :1
carman: collect :2
carman: collect :3
```

我们在使用 `collect` 收集流 `flow1` 后，即使我们后续再对 `flow1` 进行重新的赋值 `(4..6)`，我们无法收集到 `(4..6)`，我们必须再次使用 `collect` 进行收集流，如：

```kotlin
fun test(){
    runBlocking {
        var flow1 =  (1..3).asFlow()
        flow1.collect { value ->
            println("$TAG: 第一次collect :${value}")
        }
        flow1 = (4..6).asFlow()
        flow1.collect { value ->
            println("$TAG: 第二次collect :${value}")
        }
    }
}
```

```kotlin
carman: 第一次collect :1
carman: 第一次collect :2
carman: 第一次collect :3
carman: 第二次collect :4
carman: 第二次collect :5
carman: 第二次collect :6
```

只有这样我们才能收集 `flow1` 流中到新的值。但是这样操作非常的麻烦，我们不仅需要重新对 `flow1` 进行赋值后，还需要在每次赋值以后，再次使用 `collect` 收集流。


那么想要实现上面的需求，这时就需要使用热数据流：`StateFlow` 和 `SharedFlow`。



##### 5.2.1 Channel

在讲解他们之前，我们需要了解一个 `kotlin` 中另一个概念 `Channel` (通道)，因为在后续讲解 `StateFlow` 和  `SharedFlow` 会涉及 `Channel` (通道)的相关知识。



`Channel` 是一个非阻塞的原始发送者之间的对话沟通。从概念上讲，`Channel` 通道类似于 Java 的阻塞队列 `BlockingQueue`，但它是已经暂停操作而不是阻塞操作，并且可以通过 `close` 进行关闭。`Channel` 也是一个热数据流。

一个对话的沟通的过程必定是存在双方，我们看看 `Channel` 的定义：

```kotlin
public fun <E> Channel(
    capacity: Int = RENDEZVOUS,
    onBufferOverflow: BufferOverflow = BufferOverflow.SUSPEND,
    onUndeliveredElement: ((E) -> Unit)? = null
): Channel<E>{
     //...
}

public interface Channel<E> : SendChannel<E>, ReceiveChannel<E> {
    //...
}
```

`Channel` 在实现上继承了一个发送方 `SendChannel` 和一个接收方 `ReceiveChannel`，通过它们进行通信。

- `capacity`： 是表示整个通道的容量。
- `onBufferOverflow`： 处理缓冲区溢出的操作，默认创建。
- `onUndeliveredElement`： 在元素被发送但未接收时给使用者时调用。



我们继续看 `SendChannel` 的实现：

```kotlin
public interface SendChannel<in E> {
      @ExperimentalCoroutinesApi
      public val isClosedForSend: Boolean

      public suspend fun send(element: E)

      public val onSend: SelectClause2<E, SendChannel<E>>

      public fun trySend(element: E): ChannelResult<Unit>

      public fun close(cause: Throwable? = null): Boolean

      @ExperimentalCoroutinesApi
      public fun invokeOnClose(handler: (cause: Throwable?) -> Unit)
      
      //...
}
```

做为一个发送方，必定会有发送 `send` 和关闭 `close` 函数，`trySend` 是 `send` 的同步变体，它立即将指定的元素添加到该通道，如果这没有违反其容量限制，并返回成功的结果，否则返回失败或关闭的结果。

```kotlin
public interface ReceiveChannel<out E> {
      @ExperimentalCoroutinesApi
      public val isClosedForReceive: Boolean

      @ExperimentalCoroutinesApi
      public val isEmpty: Boolean

      public suspend fun receive(): E

      public val onReceive: SelectClause1<E>

      public suspend fun receiveCatching(): ChannelResult<E>

      public val onReceiveCatching: SelectClause1<ChannelResult<E>>

      public fun tryReceive(): ChannelResult<E>

      public operator fun iterator(): ChannelIterator<E>

      public fun cancel(cause: CancellationException? = null)
      //...
}
```

同样做为一个接收方，必定会有发送 `receive` 和取消 `cancel` 函数，`tryReceive` 与 `trySend` 类似，如果通道不为空，则从通道中检索并删除元素，返回成功的结果，如果通道为空，返回失败的结果，如果通道关闭，则返回关闭的结果。



接下来我们看个例子：

```kotlin
fun test() {
   runBlocking {
       val channel = Channel<Int>()
       launch {
           for (x in 1..5) channel.send(x)
       }
       launch {
           delay(1000)
           channel.send(6666)
           channel.send(9999)
       }
      while (true) {
           println("receive :${channel.receive()}")
       }
       println("done")
   }
}
```

```kotlin
receive :1
receive :2
receive :3
receive :4
receive :5
receive :6666
receive :9999
```

`Channel` 通道提供了一种在流中传输值的方法。使得我们可以在延期发射值时，可以便捷的使单个值在多个协程之间进行相互传输。可以看到我们在使用 `Channel` 的时候，发送和接收运行不同的协程。同时我们后续再次使 `channel` 发送数据时，同样也会被接收。

但是这里有一个问题，最后的 `done` 并没有输出，说明我们整个父协程并没有执行结束。这是因为我们使用 `while (true)` 会一直循环执行。这里我们先记录一下，后面我们再处理这个问题。继续往下看，这个时候如果我们在第一次 `launch` 的末尾使用 `close` 关闭 `Channel` 时：

```kotlin
fun test() {
   runBlocking {
       val channel = Channel<Int>()
       launch {
           for (x in 1..5) channel.send(x)
           channel.close()
       }
       launch {
           delay(1000)
           channel.send(6666)
           channel.send(9999)
       }
      while (true) {
           println("receive :${channel.receive()}")
       }
       println("done")
   }
}
```

```kotlin
receive :1
receive :2
receive :3
receive :4
receive :5

Channel was closed
kotlinx.coroutines.channels.ClosedReceiveChannelException: Channel was closed
```

这个时候我们可以看到 `Channel` 已经被关闭，同时因为 `Channel` 已经被关闭，但是我们继续调用了 `receive` 函数导致协程异常结束。同样的在`Channel` 已经被关闭后继续调用 `send` 一样也会触发异常结束。这个时候使用 `Channel` 的 `isClosedForSend` 属性来判断。

```kotlin
fun test() {
    runBlocking {
        val channel = Channel<Int>()
        launch {
            if (!channel.isClosedForSend) {
                for (x in 1..5) channel.send(x)
                channel.close()
            }
        }
        launch {
            delay(1000)
            if (!channel.isClosedForSend) {
                channel.send(6666)
                channel.send(9999)
            }
        }
        while (true) {
            if (!channel.isClosedForSend) {
                println("receive :${channel.receive()}")
            }else{
                break
            }
        }
        println("done")
    }
}
```

```kotlin
receive :1
receive :2
receive :3
receive :4
receive :5
done
```

可以看到我们通过使用 `isClosedForSend` 来判断 `channel` 是否已经关闭来控制 `send` 和 `receive`, 同时我们也在判断 `isClosedForSend` 为真时，跳出`while (true)` 的死循环来完成整个协程的执行。



通过上面的简单使用，我们可以看到这其实是 `生产者——消费者` 模式的一部分，并且我们经常能在并发的代码中看到它。我们可以认为 `SendChannel` 就是生产者，而 `ReceiveChannel` 就是消费者。这可以将生产者抽象成一个函数，并且使通道作为它的参数，但这与必须从函数中返回结果的常识相违悖。



- **使用 `produce `创建 `Channel`**

  这个时候我们就需要使用 `produce` 的便捷的`CoroutineScope`协程构建器，它可以很容易在生产者端正确工作， 并且我们使用扩展函数`consumeEach` 在消费者端替代循环。例如：

  ```kotlin
  fun test() {
      runBlocking {
          val squares = produceTest()
          squares.consumeEach { println("receive ：$it") }
          println("Done!")
      }
  }
  
  private fun CoroutineScope.produceTest(): ReceiveChannel<Int> = produce {
      for (x in 1..5) send(x)
  }
  ```

  ```kotlin
  receive ：1
  receive ：2
  receive ：3
  receive ：4
  receive ：5
  Done!
  ```

  可以看到我们通过 `produce` 很容易的就创建了类似的案例，但是它又是如何生产的呢。我们看看 `produce` 的源码实现：

  ```kotlin
  public fun <E> CoroutineScope.produce(
      context: CoroutineContext = EmptyCoroutineContext,
      capacity: Int = 0,
      @BuilderInference block: suspend ProducerScope<E>.() -> Unit
  ): ReceiveChannel<E> =
      produce(context, capacity, BufferOverflow.SUSPEND, CoroutineStart.DEFAULT, onCompletion = null, block = block)
  
  internal fun <E> CoroutineScope.produce(
      context: CoroutineContext = EmptyCoroutineContext,
      capacity: Int = 0,
      onBufferOverflow: BufferOverflow = BufferOverflow.SUSPEND,
      start: CoroutineStart = CoroutineStart.DEFAULT,
      onCompletion: CompletionHandler? = null,
      @BuilderInference block: suspend ProducerScope<E>.() -> Unit
  ): ReceiveChannel<E> {
      val channel = Channel<E>(capacity, onBufferOverflow)
      val newContext = newCoroutineContext(context)
      val coroutine = ProducerCoroutine(newContext, channel)
      if (onCompletion != null) coroutine.invokeOnCompletion(handler = onCompletion)
      coroutine.start(start, coroutine, block)
      return coroutine
  }
  ```

  可以看到 `produce` 是 `CoroutineScope` 的扩展方法。通过类似协程 `launch` 的创建方式。创建了一个  `ReceiveChannel` 对象。不过它额外多了`capacity` 和 `onBufferOverflow`、`onCompletion` 三个属性。

  

  那它又是如何发送数据出去的呢。这里我们需要注意一下第三个参数 `block`，它是  `ProducerScope`  扩展，这一点是与 `launch` 函数中是不一样的。

  ```kotlin
  public interface ProducerScope<in E> : CoroutineScope, SendChannel<E> {
    
      public val channel: SendChannel<E>
  }
  ```

  `ProducerScope` 继承自 `CoroutineScope` 同时，继承了 `SendChannel`。这也进一步解释了为什么在 `produce` 函数中可以通过 `send` 发送数据。



- 为什么要使用`StateFlow`和`ShareFlow`

  `Flow` 是一套方便的 API，但它不提供部分场景所必需的状态管理。上面我们提到 `Flow` 的局限性就是基于此原因。

  

  例如，一个流程可能具有多个中间状态和一个终止状态，尤其是我们常见的文件下载就是这类流程的一个示例。例如：

  `准备`->`开始`->`下载中`->`成功/失败`->`完成`

  

  我们希望状态的变动都能通知到会有所动作的观察者。虽然可以通过  `ChannelConflatedBroadcastChannel` 通道来实现，但是实现来说有点太复杂了。另外，使用通道进行状态管理时会出现一些逻辑上的不一致。例如，可以关闭或取消通道。但由于无法取消状态，因此在状态管理中无法正常使用。

  

  这时候我们需要使用 `StateFlow` 和 `SharedFlow` 来取代 `Channel`。`StateFlow` 和 `ShareFlow` 也是 `Flow API`的一部分，它们允许数据流以最优方式，发出状态更新并向多个使用方发出值。



##### 5.2.2 StateFlow

`StateFlow` 是一种特殊的 Flow，它用于持有状态。它总是有一个初始值，并且只会在状态有变化时发射新的值。它是热流（Hot Flow），意味着当有多个收集器时，它们会共享同一个状态，并且只有最新的状态会被发射。适用于表示 UI 状态，因为 UI 总是需要知道当前的状态是什么。



`StateFlow` 提供了「可读可写」和「仅可读」两个版本，`SateFlow` 实现了 `SharedFlow`，`MutableStateFlow` 实现 `MutableSharedFlow`。`StateFlow` 与 `LiveData` 十分像，或者说它们的定位类似。



1. ==`StateFlow` 与 `LiveData` 的相同点：==

   - 都提供「可读可写」和「仅可读」两个版本（`MutableStateFlow`，`StateFlow`）

   - **它的值是唯一的，且只会把最新的值重现给订阅者**，这与活跃观察者的数量是无关的

   - **允许被多个观察者共用 （因此是共享的数据流）**

   - 支持 `DataBinding`
     

2. ==`StateFlow` 与 `LiveData` 的不同点：==

   - **必须配置初始值，且 value 空安全**

     `MutableStateFlow` 构造方法强制赋值一个非空的数据，而且 value 也是非空的。这意味着 `StateFlow` 永远有值：
     <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/45d61e0b369fd57475c9532f67642b9e.webp" style="zoom:50%;" />
     
     StateFlow 的 `emit()` 和 `tryEmit()` 方法内部实现是一样的，都是调用 `setValue()`
     
   - **防抖**
   
     `StateFlow` 默认是防抖的，在更新数据时，会判断当前值与新值是否相同，如果相同则不更新数据：
   
     <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/9d9ba513d0697f289444c7c24c423f92.webp" style="zoom:50%;" />
     
     注意：<font color="red"> `StateFlow` 本质是 `by value` 对比的，  只有引用或字段结构变化（通过 `copy()` 等）才会触发 `collect {}`。修改对象的属性不会触发更新，需使用 `copy()` 创建新对象再 `emit()`</font>。
   
   
   

##### 5.2.3 SharedFlow

与 `SateFlow` 一样，`SharedFlow` 也有两个版本：`SharedFlow` 与 `MutableSharedFlow`。



那么它们有什么不同？

- `MutableSharedFlow` 没有起始值

  与 `MutableSharedFlow` 不同，`MutableSharedFlow` 构造器中是不能传入默认值的，这意味着 `MutableSharedFlow` 没有默认值。
  
- `SharedFlow` 可以保留历史数据

  `SateFlow` 与 `SharedFlow` 还有一个区别是**`SateFlow`只保留最新值**，即新的订阅者只会获得最新的和之后的数据。

  而 `SharedFlow` 根据配置可以保留历史数据，新的订阅者可以获取之前发射过的一系列数据。
  
- `MutableSharedFlow` 发射值需要调用 `emit()/tryEmit()` 方法，**没有** `setValue()` 方法



根据此区别，它们被用来应对不同的场景：<font color="red">**UI 数据是状态还是事件**</font>。



状态可以是的 UI 组件的可见性，它始终具有一个值（显示/隐藏），而事件只有在满足一个或多个前提条件时才会触发，不需要也不应该有默认值。


为了更好地理解 `SateFlow` 和 `SharedFlow` 的使用场景，来看下面的示例：

1. 用户点击登录按钮
2. 调用服务端验证登录合法性
3. 登录成功后跳转首页
   

我们先将步骤 3 视为 **状态** 来处理：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/dcff8f86490cb939f18c661e242e0fce.webp" style="zoom:50%;" />

使用状态管理还有与 `LiveData` 一样的「**粘性事件**」问题，如果在 ViewNavigationState 中我们的操作是弹出 snackbar，而且已经弹出一次。在旋转屏幕后，snackbar 会再次弹出。

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/a3e700b9216ad3a79b7a9f2a07cfc942.webp"  />

如果我们将步骤 3 作为 **事件** 处理：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/59487c0270296d49987284bece44a4fe.webp" style="zoom:50%;" />

使用 `SharedFlow` 不会有「粘性事件」的问题，`MutableSharedFlow` 构造函数里有一个 `replay` 的参数，它代表着可以对新订阅者重新发送多个之前已发出的值，默认值为 0。

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/640" alt="图片" style="zoom: 67%;" />

`SharedFlow` 在其 `replayCache` 中保留特定数量的最新值。每个新订阅者首先从 `replayCache` 中取值，然后获取新发射的值。`replayCache` 的最大容量是在创建 `SharedFlow` 时通过 `replay` 参数指定的。`replayCache` 可以使用 `MutableSharedFlow.resetReplayCache` 方法重置。

当 `replay` 为 0 时，`replayCache` size 为 0，新的订阅者获取不到之前的数据，因此不存在「<font color="red">**粘性事件**</font>」的问题。

`StateFlow` 的 `replayCache` 始终有当前最新的数据：

![](https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/2cbb54fdc05599a2b7c7384b821e3429.webp)

至此， `StateFlow` 与 `SharedFlow` 的使用场景就很清晰了：<font color = "red">状态（State）用 StateFlow ；事件（Event）用 SharedFlow  </font>
此外， 在 Android 中 StateFlow 建议使用 `viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED)` 作用域下收集数据，这样页面不可见时相关状态改变不会触发逻辑，等页面恢复时才会根据最新状态进行处理；SharedFlow 建议直接采用 `collectLatest{}` 收集数据，这样可以避免页面不可见时事件丢失问题。

