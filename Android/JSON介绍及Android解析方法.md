# JSON介绍及Android解析方法

[TOC]



### 1. 定义

JavaScript Object Notation，JavaScript的对象表示法，是一种轻量级的文本数据交换格式。

### 2. 作用

用于数据的标记、存储和传输。

### 3. 特点

>* 轻量级的文本数据交换格式
>* 独立于语言和平台
>* 具有自我描述性
>* 读写速度快，解析简单

### 4. 语法

#### 4.1 JSON值 

- 名称/值 
- 数组 
- 对象

#### 4.2 JSON实例

```json
｛"skill":{
          "web":[
                 {
                  "name":"html",
                  "year":"5"
                 },
                 {
                  "name":"ht",
                  "year":"4"
                 }],
           "database":[
                  {
                  "name":"h",
                  "year":"2"
                 }]
			}
}
```

- “名称/值”对 

    无序、一个对象用“｛｝”包括，名称和值间用“：”相隔，对象间用“，”隔开； 

    > 对象：
    > 一个JSON对象包括多个名称/值对，在花括号里书写

    如：{ “name”:”html”,”year”:”5”}就是一个对象

- 数组
    数组以“［］”包括，数据的对象用逗号隔开

    ```json
    "web":[
        {
            "name":"html",
            "year":"5"
         },
        {
            "name":"ht",
            "year":"4"
        }
    ]
    ```

    **web和database都是一个数组**

#### 4.3 语法总结

​	数组 [ 对象 ({ "key":"value" }), 对象, ... ]

> 数组包含多个对象，对象包含名称/值对

### 5. JSON解析

在了解了JSON后，是时候来看下如何在Android解析JSON数据

#### 5.1 基于事件驱动

主流方式：Gson解析和Jackson解析

- Gson介绍 
    简介：使用谷歌的开源库进行解析 
    解析方式：基于事件驱动，根据所需要取的数据通过建立一个对应于JSON数据的JavaBean类就可以通过简单的操作解析出所需JSON数据

#### 5.2 Gson解析

- **重点：** 创建一个与JSON数据对应的JavaBean类（用作存储需要解析的数据）

- **规则与步骤：** 

    1. JSON的**大括号对应一个对象**，对象里面有key和value(值)。JavaBean类的Filed命名要和key同名。 
    2. JSON的**方括号对应一个数组**，JavaBeanBean类中也对应一个数组。 数组名也为对应的键名。
    3. 如果数组只有值没有key，可以直接使用基本类型数组接收；如果数组中为json对象，这时则另需创建一个内部类解析该对象。 
    4. **对象里面嵌套对象时候，也要建立一个内部类，和对象数组一样**，这个内部类名字可以直接命名为它的对象所对应的key值。

    **注：**JavaBean类里的属性不一定要全部和JSON数据里的所有key相同，**可以按需取数据**，也就是你想要哪种数据，就把对应的key属性写出来，注意名字一定要对应

#### 5.3 实际操作

##### 5.3.1简单的JSON数据（对象）

String json = "{"id":1,"name":"小明","sex":"男","age":18,"height":175}";

- 创建简单的JSON数据对应的JavaBean类

    ```java
    package scut.learngson;
    
    public class EntityStudent {
        private int id;
        private String name;
        private String sex;
        private int age;
        private int height;
    
        public void setId(int id){
            this.id = id;
        }
        public void setName(String name){
            this.name = name;
        }
        public void setSex(String sex){
            this.sex = sex;
        }
        public void setAge(int age){
            this.age = age;
        }
        public void setHeight(int height){
            this.height = height;
        }
        public int getId(){
            return id;
        }
        public String getName(){
            return name;
        }
        public String getSex(){
            return sex;
        }
        public int getAge(){
            return age;
        }
        public int getHeight(){
            return  height;
        }
        public void show(){
                    System.out.print("id=" + id + ",");
                    System.out.print("name=" + name+",");
                    System.out.print("sex=" + sex+",");
                    System.out.print("age=" + age+",");
                    System.out.println("height=" + height + ",");
    
        }
    }
    ```

##### 5.3.2 复杂的JSON数据（具备嵌套）

```json
{"translation":["车"],
  "basic":
    {
      "phonetic":"kɑː",
      "explains":["n. 汽车；车厢","n. (Car)人名；(土)贾尔；(法、西)卡尔；(塞)察尔"]},
  "query":"car",
  "errorCode":0,
  "web":[{"value":["汽车","车子","小汽车"],"key":"Car"},
         {"value":["概念车","概念车","概念汽车"],"key":"concept car"},
         {"value":["碰碰车","碰撞用汽车","碰碰汽车"],"key":"bumper car"}]
}
```

1. 创建复杂的JSON数据对应的JavaBean类
    ```java
    package scut.httpgson;
    import java.util.List;
    
    public class JsonTest {
        public String[] translation;    //["车"]数组
        public basic basic;             //basic对象里面嵌套着对象，创建一个basic内部类对象
        public  static class basic{     //建立内部类
            public String phonetic;
            public String[] explains;
        }
        public String query;
        public int errorCode;
        public List<wb> web;            //web是一个对象数组，创建一个web内部类对象
        public static class wb{         
                public String[] value;
                public String key;
            }
    
        public void show(){
            //输出数组
            for (int i = 0;i<translation.length;i++)
            {
            System.out.println(translation[i]);
            }
            //输出内部类对象
            System.out.println(basic.phonetic);
            //输出内部类数组
            for (int i = 0;i<basic.explains.length;i++){
                System.out.println(basic.explains[i]);
            }
            System.out.println(query);
            System.out.println(errorCode);
            for (int i = 0;i<web.size();i++){
                for(int j = 0; j<web.get(i).value.length;j++)
                {
                    System.out.println(web.get(i).value[j]);
                }
                System.out.println(web.get(i).key);
            }
        }
    }
    ```

    

2. 导入GSON需要的库
    dependencies {
        compile 'com.google.code.gson:gson:2.8.2'
    }

3. 用Gson进行转换

    ```java
    package scut.learngson;
    
    import android.os.Bundle;
    import android.support.v7.app.AppCompatActivity;
    import com.google.gson.Gson;
    
    import org.json.JSONArray;
    import org.json.JSONException;
    import org.json.JSONObject;
    
    import java.io.BufferedReader;
    import java.io.IOException;
    import java.io.InputStream;
    import java.io.InputStreamReader;
    
    public class MainActivity extends AppCompatActivity {
    
        @Override
        protected void onCreate(Bundle savedInstanceState) {
            super.onCreate(savedInstanceState);
            setContentView(R.layout.activity_main);
            Gson gson = new Gson();
            //创建JavaBean类的对象
          	EntityStudent student = new EntityStudent();
            String json = "{"id":1,"name":"小明","sex":"男","age":18,"height":175}";
          	 //用GSON方法将JSON数据转为单个类实体
            student = gson.fromJson(json,EntityStudent.class);
           	//调用student方法展示解析的数据
            student.show();
            
          	//将Java集合转换为json
            String json2 = gson.toJson(List);       
            System.out.println(json2);
        }
    }
    ```

    

##### 5.3.3总结

可以看到，利用GSON方法进行解析，关键在于根据json数据里面的结构写出一个对应的javaBean，而解析过程非常简单：

> JavaBean对象 = gson.fromJson(Json , javaBean类.class);
