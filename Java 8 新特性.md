# Java8新特性详解



[TOC]

### 1.接口的默认方法

Java 8允许我们给接口添加一个非抽象的方法实现，只需要使用 default关键字即可，这个特征又叫做扩展方法，示例如下：

```Java
interface Formula {
    double calculate(int a);

    default double sqrt(int a) {
        return Math.sqrt(a);
    }
}
```

默认方法在接口的实现类中可直接使用。

Java 8带来的另一个有趣的特性是在接口中可以定义静态方法，例子代码如下：

```java
private interface DefaulableFactory {
    static Defaulable create( Supplier< Defaulable > supplier ) {
        return supplier.get();
    }
}
```



------



### 2.Lambda 表达式

可替代只需实现一个抽象方法的匿名内部类，结构：参数列表 **->** 语句块，示例如下：

```Java
Arrays.asList( "a", "b", "d" ).sort( ( e1, e2 ) -> e1.compareTo( e2 ) );
```

- 可访问的外层作用域与匿名内部类类似，但无法调用接口中的默认方法



------



### 3.函数式接口

**“函数式接口”是指仅仅只包含一个抽象方法的接口**，每一个该类型的lambda表达式都会被匹配到这个抽象方法。由于默认方法不算抽象方法，因此函数式接口**可以有默认方法**。示例如下：

```Java
//该注解标注的接口只能有一个抽象方法，多余会报错
@FunctionalInterface
interface Converter<F, T> {
    T convert(F from);
}

Converter<String, Integer> converter = from -> Integer.valueOf(from);
Integer converted = converter.convert("123");
System.out.println(converted);    // 123
```



------



### 4.方法与构造函数引用

Java 8 允许使用 **:: 关键字**来传递方法或者构造函数引用，如前一节中的代码还可以通过静态方法引用来表示：

```java
Converter<String, Integer> converter = Integer::valueOf;
Integer converted = converter.convert("123");
System.out.println(converted);   // 123
```

当然也可以引用对象的方法和构造方法。



------



### 5.函数式接口



#### 5.1 Predicate接口

Predicate 接口只有一个参数，返回**boolean**类型。该接口包含多种默认方法来将Predicate组合成其他复杂的逻辑（比如：与，或，非）：

```java
Predicate<String> predicate = (s) -> s.length() > 0;

predicate.test("foo");              // true
predicate.negate().test("foo");     // false

Predicate<Boolean> nonNull = Objects::nonNull;
Predicate<Boolean> isNull = Objects::isNull;

Predicate<String> isEmpty = String::isEmpty;
Predicate<String> isNotEmpty = isEmpty.negate();
```



#### 5.2 Function 接口

Function 接口有一个参数并且返回一个结果，并附带了一些可以和其他函数组合的默认方法（compose, andThen）：

```java
Function<String, Integer> toInteger = Integer::valueOf;
Function<String, String> backToString = toInteger.andThen(String::valueOf);

backToString.apply("123");     // "123"
```



#### 5.3 Supplier 接口

Supplier 接口返回一个任意范型的值，和Function接口不同的是该接口没有任何参数

```java
Supplier<Person> personSupplier = Person::new;
personSupplier.get();   // new Person
```



#### 5.4 Consumer 接口

Consumer 接口表示执行在单个参数上的操作，无返回值

```java
Consumer<Person> greeter = (p) -> System.out.println("Hello, " + p.firstName);
greeter.accept(new Person("Luke", "Skywalker"));
```



#### 5.5 Comparator 接口

Comparator 是老Java中的经典接口， Java 8在此之上添加了多种默认方法：

```java
Comparator<Person> comparator = (p1, p2) -> p1.firstName.compareTo(p2.firstName);

Person p1 = new Person("John", "Doe");
Person p2 = new Person("Alice", "Wonderland");

comparator.compare(p1, p2);             // > 0
comparator.reversed().compare(p1, p2);  // < 0
```



#### 5.6 Optional 接口

用来防止NullPointerException异常的辅助类型。Optional 被定义为一个简单的容器，其值可能是null或者不是null，在Java 8中，函数返回值不推荐返回null，而是应该返回Optional：

```java
Optional< String > fullName = Optional.ofNullable( null );
System.out.println( fullName.isPresent() );        				//false
System.out.println( fullName.orElseGet( () -> "[none]" ) ); 	//[none]

System.out.println( fullName.map( s -> "Hey " + s + "!" ).orElse( "Hey Stranger!" ) );
//Hey Stranger!
```

- **isPresent()**：如果Optional实例持有一个非空值，则返回true，否则返回false；
- **orElseGet()**：如果Optional实例持有null，则可以接受一个lambda表达式生成的默认值；
- **map()**：将现有的Opetional实例的值转换成新的值；
- **orElse()**：如果Optional实例持有null，将值更新为传入值；



#### 5.7 Stream 接口

java.util.Stream 表示能应用在一组元素上一次执行的操作序列，分为中间操作和最终操作两种。需要指定一个数据源，可为Collection子类，不支持Map：

```java
List<String> stringCollection = new ArrayList<>();
stringCollection.add("aaa2");
stringCollection.add("aaa1");
stringCollection.add("bbb1");

stringCollection.stream();
```

##### 5.7.1 常用的Stream操作

**注：这些操作不会改变原有的数据源**

- **Filter 过滤**

    过滤通过一个Predicate接口来过滤并只保留符合条件的元素，该操作属于中间操作

    ```java
    stringCollection
        .stream()
        .filter((s) -> s.startsWith("a"))
        .forEach(System.out::println);
    
    // "aaa2", "aaa1"
    ```

- **Sort 排序**

    排序通过一个Comparator接口返回的排序好后的Stream，不指定使用默认排序

    ```java
    stringCollection
        .stream()
        .sorted()
        .filter((s) -> s.startsWith("a"))
        .forEach(System.out::println);
    
    // "aaa1", "aaa2"
    ```

- **Map 映射**

    根据指定的Function接口来依次将元素转成另外的对象

    ```java
    stringCollection
        .stream()
        .map(String::toUpperCase)
        .sorted((a, b) -> b.compareTo(a))
        .forEach(System.out::println);
    
    //  "AAA2", "AAA1", "BBB1"
    ```

- **Match 匹配**

    Stream提供了多种匹配操作，允许检测指定的Predicate是否匹配整个Stream。所有的匹配操作都是最终操作，并返回一个boolean类型的值:

    ```java
    boolean anyStartsWithA = 
        stringCollection
            .stream()
            .anyMatch((s) -> s.startsWith("a"));
    
    System.out.println(anyStartsWithA);      // true
    
    boolean allStartsWithA = 
        stringCollection
            .stream()
            .allMatch((s) -> s.startsWith("a"));
    
    System.out.println(allStartsWithA);      // false
    
    boolean noneStartsWithZ = 
        stringCollection
            .stream()
            .noneMatch((s) -> s.startsWith("z"));
    
    System.out.println(noneStartsWithZ);      // true
    ```

- **Count 计数**

    计数是一个最终操作，返回Stream中元素的个数，返回值类型是long。

    ```java
    long startsWithB = 
        stringCollection
            .stream()
            .filter((s) -> s.startsWith("b"))
            .count();
    
    System.out.println(startsWithB);    // 1
    ```

- **Reduce 规约**

    允许通过指定的函数来将stream中的多个元素规约为一个元素，规约后的结果是通过Optional接口表示的：

    ```java
    Optional<String> reduced =
        stringCollection
            .stream()
            .sorted()
            .reduce((s1, s2) -> s1 + "#" + s2);
    
    reduced.ifPresent(System.out::println);
    // "aaa2#aaa1#bbb1"
    ```

- **并行Streams**

    stream()------------>parallelStream()，并行Streams的执行效率更高

- 其他常用操作：

    - limit(n)：获取指定数量的流
    - skip(n)：跳过n元素，配合limit(n)可实现分页
    - distinct：通过流中元素的 hashCode() 和 equals() 去除重复元素
    -  flatMap：接收一个函数作为参数，将流中的每个值都换成另一个流，然后把所有流连接成一个流。
    - peek：消费，如同于map，能得到流中的每一个元素。但map接收的是一个Function表达式，有返回值；而peek接收的是Consumer表达式，没有返回值，用于执行操作。
    -  findFirst()：返回流中第一个元素
    -  findAny()：返回流中的任意元素
    -  max：返回流中元素最大值
    -  min：返回流中元素最小值
    - collect()：接收一个Collector实例，将流中元素收集成另外一个数据结构。




------



### 6.Map接口的新增方法



#### 6.1 `putIfAbsent()` 

absent：缺席， 如果 key 不存在或相关联的值为 null, 则设置新的 key/value 值

```java
String ret;
Map<String, String> map = new HashMap<>();
ret = map.putIfAbsent("a", "aaa"); //ret 为"aaa", map 为 {"a":"aaa"}
ret = map.putIfAbsent("a", "bbb"); //ret 为 "aaa", map 还是 {"a":"aaa"}

map.put("b", null);
ret = map.putIfAbsent("b", "bbb"); //ret 为 "bbb", map 为 {"a":"aaa","b":"bbb"}
```



#### 6.2 `computeIfPresent()`

present：当前， 若指定的key 不存在或相应的值为 null 时什么也不做，否则根据指定的 key 和 value 计算 newValue来替换旧值，若newValue 为 null 则从 map 中删除该 key; 方法的返回值为最终的 map.get(key)：

```java
String ret;
Map<String, String> map = new HashMap<>();
ret = map.computeIfPresent("a", (key, value) -> key + value); //ret null, map 为 {}
map.put("a", null); //map 为 ["a":null]
ret = map.computeIfPresent("a", (key, value) -> key + value); //ret null, map 为 {"a":null}
map.put("a", "+aaa");
ret = map.computeIfPresent("a", (key, value) -> key + value); //ret "a+aaa", map 为 {"a":"a+aaa"}
ret = map.computeIfPresent("a", (key, value) -> null); //ret 为 null, map 为 {}，计算出的 null 把 key 删除了
```



#### 6.3 `computeIfAbsent()`

与`computeIfPresent()`相反，如果指定的 key 不存在或相关的 value 为 null 时，用计算的结果来更新value，若计算的值为 null 的话则什么也不做(不会去删除相应的 key)。同样，方法的返回值也是最终的 map.get(key)：

```Java
String ret;
Map<String, String> map = new HashMap<>();
ret = map.computeIfAbsent("a", key -> key + "123"); //ret "a123", map 为 {"a":"a123"}
ret = map.computeIfAbsent("a", key -> key + "456"); //ret "a123", map 为 {"a":"a123"}
map.put("a", null);
ret = map.computeIfAbsent("a", key -> key + "456"); //ret "a456", map 为 {"a":"a456"}
ret = map.computeIfAbsent("a", key -> null); //ret 为 "a456", map 为 {"a":"a456"}
```



#### 6.4 `replace(K key, V value)`

只要 key 存在，不管对应值是否为 null，都用传入的 value（可为null） 替代原来的值，对于 value 不能为 null 值的 Map 实现将会造成 NullPointerException。key 不存在不会修改 Map 的内容，返回值总是**原始的 map.get(key) 值**：

```java
String ret;
Map<String, String> map = new HashMap<>();
ret = map.replace("a", "abc"); //ret 为 null，map 为 {}
map.put("a", "ddd");
ret = map.replace("a", "abc"); //ret 为 "ddd", map 为 {"a":"abc"}
ret = map.replace("a", null); //ret 为 "abc", map 为 {"a":null}
ret = map.replace("a", "ddd"); //ret 为 null, map 为 {"a":"ddd"}
```



#### 6.5 replace(K key, V oldValue, V newValue)

当且仅当 key 存在，并且对应值与 oldValue 不相等，才用 newValue 作为 key 的新相关联值，返回值为是否进行了替换：

```java
boolean ret;
Map<String, String> map = new HashMap<>() ;
ret = map.replace("a", null, "aaa"); //ret 为 false, map 为 {}
map.put("a", null);
ret = map.replace("a", null, "aaa"); //ret 为 true, map 为 {"a":"aaa"}
ret = map.replace("a", "aaa", null); //ret 为 true, map 为 {"a":null}
ret = map.replace("a", "aaa", "bbb");//ret 为 false, map 为 {"a":null}
```



#### 6.6 `replaceAll() `

像一个传统函数型语言的 map 函数，即对于 Map 中的每一个元素应用函数 function, 输入为 key 和 value
:

```java
Map<String, String> map = new HashMap<>() ;
map.put("a", "aaa");
map.put("b", "bbb"); //map 为 {"a":"aaa","b":"bbb"}
map.replaceAll((key, value) -> key + "-" + value); //map 为 {"a":"a-aaa","b":"b-bbb"}
```



#### 6.7 `remove(key, value)`

key 与 value 都匹配时才从map中删除。



#### 6.8 `compute()`

`computeIfAbsent` 与 `computeIfPresent` 的结合体。也就是既不管 key 存不存在，也不管 key 对应的值是否为 null, compute 死活都要设置与 key 相关联的值，或者计算出的值为 null 时删除相应的 key, 返回值为最终的 map.get(key)：

```java
String ret;
Map<String, String> map = new HashMap<>() ;
ret = map.compute("a", (key, value) -> "a" + value); //ret="anull", map={"a":"anull"}
ret = map.compute("a", (key, value) -> "a" + value); //ret="aanull", map={"a":"aanull"}
ret = map.compute("a", (key, value) -> null); //ret=null, map={}
```



#### 6.9 `merge()`

如果指定的 key 不存在或相应的值为 null 时，则设置给定的 value 为相关联的值。否则根据 key 对应的旧值和 给定的value 计算出新的值 newValue，newValue 为 null 时，删除该key, 否则设置 key 对应的值为 newValue。方法的返回值也是最终的 map.get(key) 值:

```java
String ret;
Map<String, String> map = new HashMap<>() ;
ret = map.merge("a", "aa", (oldValue, value) -> oldValue + "-" + value); //ret="aa", map={"a":"aa"}
ret = map.merge("a", "bb", (oldValue, value) -> oldValue + "-" + value); //ret="aa-bb", map={"a":"aa-bb"}
ret = map.merge("a", "bb", (oldValue, value) -> null); //ret=null, map={}
map.put("a", null);
ret = map.merge("a", "aa", (oldValue, value) -> oldValue + "-" + value); //ret="aa", map={"a":"aa"}
map.put("a", null);
ret = map.merge("a", "bb", (oldValue, value) -> null); //ret="bb", map={"a":"bb"}
ret = map.merge("a", null, (oldValue, value) -> oldValue + "-" + value); //NullPointerException, value 不能为 null
```



#### 6.10 新增排序方法

- `comparingByKey()/comparingByKey(Comparator<? super K> cmp)`：通过key排序

-  `comparingByValue()/comparingByValue(Comparator<? super V> cmp)`：通过value排序

    使用示例：

    ```java
    map.entrySet().stream().sorted(Map.Entry.comparingByKey()).collect(Collectors.toList());
    map.entrySet().stream().sorted(Map.Entry.comparingByKey(String::compareTo)).collect(Collectors.toList());
    map.entrySet().stream().sorted(Map.Entry.comparingByValue()).collect(Collectors.toList());
    map.entrySet().stream().sorted(Map.Entry.comparingByValue(String::compareTo)).collect(Collectors.toList());
    ```



------



### 7. 新的Date API



#### 7.1 Clock 时钟

Clock类提供了访问当前日期和时间的方法，Clock是时区敏感的，可以用来取代 `System.currentTimeMillis()` 来获取当前的微秒数。某一个特定的时间点也可以使用Instant类来表示，Instant类也可以用来创建老的java.util.Date对象。

```java
Clock clock = Clock.systemDefaultZone();
long millis = clock.millis();

Instant instant = clock.instant();
Date legacyDate = Date.from(instant);   // legacy java.util.Date
```



#### 7.2 Timezones 时区

在新API中时区使用ZoneId来表示。时区可以很方便的使用静态方法of来获取到。 时区定义了到UTS时间的时间差，在Instant时间点对象到本地日期对象之间转换的时候是极其重要的。

```java
System.out.println(ZoneId.getAvailableZoneIds());
// prints all available timezone ids

ZoneId zone1 = ZoneId.of("Europe/Berlin");
ZoneId zone2 = ZoneId.of("Brazil/East");
System.out.println(zone1.getRules());
System.out.println(zone2.getRules());

// ZoneRules[currentStandardOffset=+01:00]
// ZoneRules[currentStandardOffset=-03:00]
```



#### 7.3 LocalTime 本地时间

LocalTime 定义了一个没有时区信息的时间，例如 晚上10点，或者 17:30:15。下面的例子使用前面代码创建的时区创建了两个本地时间。之后比较时间并以小时和分钟为单位计算两个时间的时间差：

```java
LocalTime now1 = LocalTime.now(zone1);
LocalTime now2 = LocalTime.now(zone2);

System.out.println(now1.isBefore(now2));  // false

long hoursBetween = ChronoUnit.HOURS.between(now1, now2);
long minutesBetween = ChronoUnit.MINUTES.between(now1, now2);

System.out.println(hoursBetween);       // -4
System.out.println(minutesBetween);     // -239
```

LocalTime 还提供了多种工厂方法来简化对象的创建，包括解析时间字符串。

```java
LocalTime late = LocalTime.of(23, 59, 59);
System.out.println(late);       // 23:59:59

DateTimeFormatter germanFormatter =
    DateTimeFormatter
        .ofLocalizedTime(FormatStyle.SHORT)
        .withLocale(Locale.GERMAN);

LocalTime leetTime = LocalTime.parse("13:37", germanFormatter);
System.out.println(leetTime);   // 13:37
```



#### 7.4 LocalDate 本地日期

LocalDate 表示了一个确切的日期，比如 2014-03-11。该对象值是不可变的，用起来和LocalTime基本一致。下面的例子展示了如何给Date对象加减天/月/年。另外要注意的是这些**对象是不可变的，操作返回的总是一个新实例**：

```java
LocalDate today = LocalDate.now();
LocalDate tomorrow = today.plus(1, ChronoUnit.DAYS);
LocalDate yesterday = tomorrow.minusDays(2);

LocalDate independenceDay = LocalDate.of(2014, Month.JULY, 4);
DayOfWeek dayOfWeek = independenceDay.getDayOfWeek();

System.out.println(dayOfWeek);    // FRIDAY
```

从字符串解析一个LocalDate类型和解析LocalTime一样简单：

```java
DateTimeFormatter germanFormatter =
    DateTimeFormatter
        .ofLocalizedDate(FormatStyle.MEDIUM)
        .withLocale(Locale.GERMAN);

LocalDate xmas = LocalDate.parse("24.12.2014", germanFormatter);
System.out.println(xmas);   // 2014-12-24
```



#### 7.5 LocalDateTime 本地日期时间

LocalDateTime 同时表示了时间和日期，相当于前两节内容合并到一个对象上了。**LocalDateTime和LocalTime还有LocalDate一样，都是不可变的**。LocalDateTime提供了一些能访问具体字段的方法：

```java
LocalDateTime sylvester = LocalDateTime.of(2014, Month.DECEMBER, 31, 23, 59, 59);

DayOfWeek dayOfWeek = sylvester.getDayOfWeek();
System.out.println(dayOfWeek);      // WEDNESDAY

Month month = sylvester.getMonth();
System.out.println(month);          // DECEMBER

long minuteOfDay = sylvester.getLong(ChronoField.MINUTE_OF_DAY);
System.out.println(minuteOfDay);    // 1439
```

只要附加上时区信息，就可以将其转换为一个时间点Instant对象，Instant时间点对象可以很容易的转换为老式的java.util.Date：

```java
Instant instant = sylvester
        .atZone(ZoneId.systemDefault())
        .toInstant();

Date legacyDate = Date.from(instant);
System.out.println(legacyDate);     // Wed Dec 31 23:59:59 CET 2014
```

格式化LocalDateTime和格式化时间和日期一样的，除了使用预定义好的格式外，我们也可以自己定义格式：

```java
DateTimeFormatter formatter =
    DateTimeFormatter
        .ofPattern("MM dd, yyyy - HH:mm");

LocalDateTime parsed = LocalDateTime.parse("Nov 03, 2014 - 07:13", formatter);
String string = formatter.format(parsed);
System.out.println(string);     // Nov 03, 2014 - 07:13
```



#### 7.6 时间比较

##### 7.6.1 Period类

final修饰，线程安全，ISO-8601日历系统中基于日期的时间量，可以比较两个日期之间的差

```java
LocalDate localDate1 = LocalDate.of(2019, 11, 15);
LocalDate localDate2 = LocalDate.of(2020, 1, 1);
Period p = Period.between(localDate1, localDate2);
System.out.println("years:"+p.getYears()+" months:"+p.getMonths()+" days:"+p.getDays()); // years:0 months:1 days:17

//若localData2为 2020-11-15,则结果为 years:1 months:0 days:0
```

##### 7.6.2 Duration类

final修饰，线程安全，基于时间的时间量，可以比较两个时间的差 

```Java
LocalDateTime localDateTime1 = LocalDateTime.of(2019, 11, 15, 0, 0);
LocalDateTime localDateTime2 = LocalDateTime.of(2019, 11, 15, 10, 30);
Duration d = Duration.between(localDateTime1, localDateTime2);
System.out.println("days:"+d.toDays());  		// days:0
System.out.println("hours:"+d.toHours());		// hours:10
System.out.println("minutes:"+d.toMinutes());	// minutes:630
System.out.println("millis:"+d.toMillis());		// millis:37800000
```

##### 7.6.3 Period和Duration区别

1. **包含属性不同**

    Period包含年数，月数，天数； Duration只包含秒，纳秒。

    Period只能返回年数，月数，天数；Duration可以返回天数，小时数，分钟数，毫秒数等。

2. **between()可以使用的类型不同**

    Period：只能使用LocalDate	

    ```java
    public static Period between(LocalDate startDateInclusive, LocalDate endDateExclusive)
    ```

    Duration：可以使用所有实现了Temporal接口的类，比如LocalDateTime，LocalTime和Instant等。

    ```java
    public static Duration between(Temporal startInclusive, Temporal endExclusive)
    ```

3. **between()获取天数差的区别**

    Period获取的是两个日期上的整体差距， getDays() 获取天数时，只会获取days属性值，而不会将年月部分都计算成天数，因此2020.1.1和2019.1.1比较后获取天数为0。

    ```java
    public int getDays() {
        return days;
    }
    ```
    Duration获取的是两个日期相差的秒数， toDays() 获取天数时，会将秒属性转换成天数。

    ```java
    public long toDays() {
        return seconds / SECONDS_PER_DAY;
    }
    ```
    所以，**想要获取2个时间的相差总天数，只能用Duration**。



------



### 8.Annotation 注解

Java 8支持多重注解，只需要给该注解标注一下@Repeatable即可。

```java
@interface Hints {
    Hint[] value();
}

@Repeatable(Hints.class)
@interface Hint {
    String value();
}
```

例 1: 使用包装类当容器来存多个注解（老方法）

```java
@Hints({@Hint("hint1"), @Hint("hint2")})
class Person {}
```

例 2：使用多重注解（新方法）

```java
@Hint("hint1")
@Hint("hint2")
class Person {}
```

第二个例子里java编译器会隐性的帮你定义好@Hints注解，了解这一点有助于你用反射来获取这些信息：

```java
Hint hint = Person.class.getAnnotation(Hint.class);
System.out.println(hint);                   // null

Hints hints1 = Person.class.getAnnotation(Hints.class);
System.out.println(hints1.value().length);  // 2

Hint[] hints2 = Person.class.getAnnotationsByType(Hint.class);
System.out.println(hints2.length);          // 2
```

即便我们没有在Person类上定义@Hints注解，我们还是可以通过 getAnnotation(Hints.class) 来获取 @Hints注解，更加方便的方法是使用 **`getAnnotationsByType`** 可以直接获取到所有的@Hint注解。

 另外Java 8的注解还增加到两种新的target上了：

```java
@Target({ElementType.TYPE_PARAMETER, ElementType.TYPE_USE})
@interface MyAnnotation {}
```

在，注解几乎可以使用在任何元素上：局部变量、接口类型、超类和接口实现类，甚至可以用在函数的异常定义上。下面是一些例子：

```java
package com.javacodegeeks.java8.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.ArrayList;
import java.util.Collection;

public class Annotations {
    @Retention( RetentionPolicy.RUNTIME )
    @Target( { ElementType.TYPE_USE, ElementType.TYPE_PARAMETER } )
    public @interface NonEmpty {        
    }
        
    public static class Holder< @NonEmpty T > extends @NonEmpty Object {
        public void method() throws @NonEmpty Exception {           
        }
    }
        
    @SuppressWarnings( "unused" )
    public static void main(String[] args) {
        final Holder< String > holder = new @NonEmpty Holder< String >();       
        @NonEmpty Collection< @NonEmpty String > strings = new ArrayList<>();       
    }
}
```



------



### 9. Base64

对Base64编码的支持已经被加入到Java 8官方库中，这样不需要使用第三方库就可以进行Base64编码：

```java
package com.javacodegeeks.java8.base64;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

public class Base64s {
    public static void main(String[] args) {
        final String text = "Base64 finally in Java 8!";
        
        final String encoded = Base64
            .getEncoder()
            .encodeToString( text.getBytes( StandardCharsets.UTF_8 ) );
        System.out.println( encoded );  //QmFzZTY0IGZpbmFsbHkgaW4gSmF2YSA4IQ==
        
        final String decoded = new String( 
            Base64.getDecoder().decode( encoded ),
            StandardCharsets.UTF_8 );
        System.out.println( decoded );  //Base64 finally in Java 8!
    }
}
```

新的Base64API也支持URL和MINE的编码解码。(**Base64.getUrlEncoder()** / **Base64.getUrlDecoder()**, **Base64.getMimeEncoder()** / **Base64.getMimeDecoder()**)。 



------



### 10.并行数组

Java8版本新增了很多新的方法，用于支持并行数组处理。最重要的方法是**parallelSort()**，可以显著加快多核机器上的数组排序。下面的例子论证了**parallexXxx**系列的方法：

```java
package com.javacodegeeks.java8.parallel.arrays;

import java.util.Arrays;
import java.util.concurrent.ThreadLocalRandom;

public class ParallelArrays {
    public static void main( String[] args ) {
        long[] arrayOfLong = new long [ 20000 ];        
        
        Arrays.parallelSetAll( arrayOfLong, 
            index -> ThreadLocalRandom.current().nextInt( 1000000 ) );
        Arrays.stream( arrayOfLong ).limit( 10 ).forEach( 
            i -> System.out.print( i + " " ) );
        System.out.println();
        
        Arrays.parallelSort( arrayOfLong );     
        Arrays.stream( arrayOfLong ).limit( 10 ).forEach( 
            i -> System.out.print( i + " " ) );
        System.out.println();
    }
}
```



Java8还有一些其他的特性这里不作介绍了，比如Nashorn JavaScript引擎、Nashorn引擎：jjs、 类依赖分析器：jdeps以及在JVM方面使用**Metaspace**（JEP 122）代替持久代（**PermGen** space）等等。