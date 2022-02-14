## WebView 与 JavaScript 的交互

[TOC]



> 随着移动端领域的快速发展，业务场景愈发复杂，为减少开发量和投入成本，混合应用（Hybrid App）占据了不少市场。混合应用承载 H5 页面的容器就是 webview，前端人员在开发过程中或多或少都需要与原生（Native App）之间交互，这个交互的桥梁就叫做 JSBridge，在其中有一套通用的调试方法来确保 JSB 通信顺利。





### 1.  WebView 与 JSBridge



#### 1.1 什么是 WebView 

WebView 是原生应用用来展示网页的 view 组件，本质上就是一款内置了 webkit 内核的无头浏览器（headless browser），提供了例如页面前进后退、放大缩小、音频控制等一般浏览器具备的功能。



#### 1.2 什么是 JSBridge

==JSBridge 是支持原生应用与 H5 应用双向通信的 “桥梁”。==



- 原生 --> h5：向 h5 应用通知原生应用的相关状态，触发 h5 页面的内容更新、消息发送、音频播放等
- h5 -->原生：向原生应用通知 h5 应用需要使用的功能，比如使用摄像头、使用 gps、唤起 app 等



------

### 2. Android WebView              

​                     

Android WebView 以 ==4.4== 为分界点，采用了不同的内核：

- Android 4.4 前：基于 Webkit 内核，H5 的很多新特性不支持，且存在适配成本高、不安全、不稳定、耗流量、速度慢、视频播放差、文件能力差等问题。
- Android 4.4 后：基于 Chromium 内核（google 在 webkit 上的 fork 出来的项目），很多新的规范被支持，例如 WebGL，Canvas2D，CSS3 以及其他很多的 HTML5 特性，同时大大提升了 WebView 组件的性能。





#### 2.1 Webview 相关的常用方法



##### 2.1.1 WebView 的状态

```java
//激活 WebView 为活跃状态，能正常执行网页的响应
webView.onResume() ；

//当页面被失去焦点被切换到后台不可见状态，需要执行 onPause, 通过 onPause 动作通知内核暂停所有的动作，比如 DOM 的解析、plugin 的执行、JavaScript 执行。
webView.onPause()；

//当应用程序(存在 webview )被切换到后台时，这个方法不仅仅针对当前的 webview 而是全局的全应用程序的 webview , 它会暂停所有 webview 的 layout，parsing，javascripttimer。降低 CPU 功耗。
webView.pauseTimers()
    
//恢复pauseTimers状态
webView.resumeTimers()；

//销毁 Webview ，在关闭了 Activity 时，如果 Webview 的音乐或视频，还在播放。就必须销毁 Webview，webview 调用 destory 时, webview 仍绑定在 Activity 上
//这是由于自定义 webview 构建时传入了该 Activity 的 context 对象，因此需要先从父容器中移除 webview, 然后再销毁 webview:
rootLayout.removeView(webView); 
webView.destroy();
```



##### 2.1.2 关于前进 / 后退网页

```java
//是否可以后退
Webview.canGoBack() 
//后退网页
Webview.goBack()

//是否可以前进                     
Webview.canGoForward()
//前进网页
Webview.goForward()

//以当前的 index 为起始点前进或者后退到历史记录中指定的 steps，如果 steps 为负数则为后退，正数则为前进
Webview.goBackOrForward(intsteps) 
    
    
// Back键控制网页后退
public boolean onKeyDown(int keyCode, KeyEvent event) {
    if ((keyCode == KEYCODE_BACK) && mWebView.canGoBack()) { 
        mWebView.goBack();
        return true;
    }
    return super.onKeyDown(keyCode, event);
}
```



##### 2.1.3 清除缓存数据

```java
//清除网页访问留下的缓存，由于内核缓存是全局的，因此这个方法不仅仅针对 webview 而是针对整个应用程序.
Webview.clearCache(true);

//清除当前webview访问的历史记录，清除 webview 访问历史记录里的所有记录除了当前访问记录
Webview.clearHistory()；

//这个api仅仅清除自动完成填充的表单数据，并不会清除WebView存储到本地的数据
Webview.clearFormData()；
```



##### 2.1.4 WebSettings 类

利用 WebSettings 子类进行配置：

```java
//声明WebSettings子类
WebSettings webSettings = webView.getSettings();

//如果访问的页面中要与 Javascript 交互，则 webview 必须设置支持 Javascript
webSettings.setJavaScriptEnabled(true);  
// 若加载的 html 里有 JS 在执行动画等操作，会造成资源浪费（CPU、电量），在 onStop 和 onResume 里分别把 setJavaScriptEnabled() 给设置成 false 和 true 即可

//支持插件
webSettings.setPluginsEnabled(true); 

//设置自适应屏幕，两者合用
webSettings.setUseWideViewPort(true); //将图片调整到适合 webview 的大小 
webSettings.setLoadWithOverviewMode(true); // 缩放至屏幕的大小

//缩放操作
webSettings.setSupportZoom(true); //支持缩放，默认为 true。是下面那个的前提。
webSettings.setBuiltInZoomControls(true); //设置内置的缩放控件。若为false，则该 WebView 可缩放
webSettings.setDisplayZoomControls(false); //隐藏原生的缩放控件

//其他细节操作
webSettings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK); //设置 WebView 缓存策略
webSettings.setAllowFileAccess(true); //设置可以访问文件 
webSettings.setJavaScriptCanOpenWindowsAutomatically(true); //支持通过 JS 打开新窗口 
webSettings.setLoadsImagesAutomatically(true); //支持自动加载图片
webSettings.setDefaultTextEncodingName("utf-8");//设置编码格式
```

1. **设置WebView缓存**

   - 当加载 html 页面时，WebView 会在 `/data/data/` 包名目录下生成 database 与 cache 两个文件夹

   - 请求的 URL 记录保存在 `WebViewCache.db`，而 URL 的内容是保存在  WebViewCache 文件夹下

     

   是否启用缓存：

   ```java
   //优先使用缓存: 
   WebView.getSettings().setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK); 
   
       //缓存模式如下：
       //LOAD_CACHE_ONLY: 不使用网络，只读取本地缓存数据
       //LOAD_DEFAULT: （默认）根据 cache-control 决定是否从网络上取数据
       //LOAD_NO_CACHE: 不使用缓存，只从网络获取数据
       //LOAD_CACHE_ELSE_NETWORK，只要本地有，无论是否过期，或者 no-cache，都使用缓存中的数据
   
   //不使用缓存: 
   WebView.getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
   ```

   结合使用（离线加载）:

   ```java
   if (NetStatusUtil.isConnected(getApplicationContext())) {
       webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);             //根据cache-control决定是否从网络上取数据。
   } else {
       webSettings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);   //没网，则从本地获取，即离线加载
   }
   
   webSettings.setDomStorageEnabled(true); // 开启 DOM storage API 功能
   webSettings.setDatabaseEnabled(true);   //开启 database storage API 功能
   webSettings.setAppCacheEnabled(true);  //开启 Application Caches 功能
   
   String cacheDirPath = getFilesDir().getAbsolutePath() + APP_CACAHE_DIRNAME;
   webSettings.setAppCachePath(cacheDirPath);   //设置  Application Caches 缓存目录
   ```



##### 2.1.5 WebViewClient 类

作用：==处理各种通知 & 请求事件==



常见方法：

1. `shouldOverrideUrlLoading()`： WebView 加载网页之前会调用此方法

   ```java
   webView.setWebViewClient(new WebViewClient(){
     @Override
     public boolean shouldOverrideUrlLoading(WebView view, String url) {
          // 可以根据 url 判断是由 webview 加载还是原生处理
    	  return true;
     }
   });
   ```

   

2. `onPageStarted()`： 开始载入页面时调用

   ```java
   webView.setWebViewClient(new WebViewClient(){
        @Override
        public void  onPageStarted(WebView view, String url, Bitmap favicon) {
           //设定加载开始的操作, 可以在这里添加 loading
        }
    });
   ```

   

3. `onPageFinished()`：页面加载结束时调用

   ```java
   webView.setWebViewClient(new WebViewClient(){
    	 @Override
    	 public void onPageFinished(WebView view, String url) {
        	//设定加载结束的操作，可以关闭 loading，切换程序
     	}
   });
   ```

   

4. `onLoadResource()`：加载页面资源时会调用，每一个资源（比如图片）的加载都会调用一次

   ```java
   webView.setWebViewClient(new WebViewClient(){
     	@Override
     	public boolean onLoadResource(WebView view, String url) {
     	   //设定加载资源的操作
     	}
   });
   ```

   

5. `onReceivedError()`：加载页面的服务器出现错误时（如：404）调用

   ```java
   //步骤1：写一个html文件（error_handle.html），用于出错时展示给用户看的提示页面
   //步骤2：将该html文件放置到代码根目录的 assets 文件夹下
   
   //步骤3：复写 WebViewClient 的 onRecievedError 方法，该方法传回了错误码，根据错误类型可以进行不同的错误分类处理
   webView.setWebViewClient(new WebViewClient(){
     @Override
     public void onReceivedError(WebView view, int errorCode, String description, String failingUrl){
   		switch(errorCode){
               case HttpStatus.SC_NOT_FOUND:
                   view.loadUrl("file:///android_assets/error_handle.html");
                   break;
               }
           }	
   });
   ```

   

6. `onReceivedSslError()`：处理 https 请求

   ```java
   // webView默认是不处理 https 请求的，页面显示空白，需要进行如下设置：
   webView.setWebViewClient(new WebViewClient() {    
       @Override    
       public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {    
           handler.proceed();    //表示等待证书响应
       // handler.cancel();      //表示挂起连接，为默认方式
       // handler.handleMessage(null);    //可做其他处理
       }    
   });  
   
   // 特别注意：5.1以上默认禁止了 https 和 http 混用，以下方式是开启
   if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
   	mWebView.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
   }
   ```

   

##### 2.1.6 WebChromeClient 类

作用：==辅助 WebView 处理 Javascript 的对话框，网站图标，网站标题等等==



常用方法：

```java
webview.setWebChromeClient(new WebChromeClient(){
    
         /**
         * Android7.0 开始，只有来自安全的链接如 https 才会回调此方法，不安全的来源系统将自动拒绝定位请求。
         */
        @Override
        public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissionsCallback callback) {
            callback.invoke(origin, true, false);
            Log.d("onGeolocationPermissionsShowPrompt", origin + "---------------> 请求定位");
            super.onGeolocationPermissionsShowPrompt(origin, callback);
        }

         // 获得网页的加载进度
         @Override
         public void onProgressChanged(WebView view, int newProgress) {
              if (newProgress < 100) {
                  String progress = newProgress + "%";
                  progress.setText(progress);
              } else {
                }
         }
    
        // 获取 Web 页中的标题，如：www.baidu.com 这个页面的标题即 “百度一下，你就知道”
        @Override
        public void onReceivedTitle(WebView view, String title) {
           titleview.setText(title)；
        }
    
        // 确认提示弹出框，可将 H5 的弹出框提示改为 Toast
        @Override
        public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
            Toast.makeText(MainActivity.this, "onJsAlert：" + message, Toast.LENGTH_SHORT).show();
            result.confirm();
            return true;
        }

    	// 确认/取消式弹出框，可将 H5 的弹出框提示改为 Dialog 或 DialogFragment
        @Override
        public boolean onJsConfirm(WebView view, String url, String message, JsResult result) {
            Toast.makeText(MainActivity.this, "onJsConfirm：" + message, Toast.LENGTH_SHORT).show();
            result.cancel();
            return true;
        }

    	// 输入式弹出框， 可将 H5 的弹出框提示改为 Dialog 或 DialogFragment，通过 result.confirm() 返回输入的值，result.cancel() 即会返回 null
        @Override
        public boolean onJsPrompt(WebView view, String url, String message, String defaultValue, JsPromptResult result) {
            Toast.makeText(MainActivity.this, "onJsPrompt：" + message, Toast.LENGTH_SHORT).show();
            result.confirm("Tyhj");
            return true;
        }
    
		// 打印 console 信息
     	@Override
		public boolean onConsoleMessage(ConsoleMessage consoleMessage){
            Log.d(TAG, consoleMessage);
        }
    
});
```





#### 2.2 H5 与原生方法交互



##### 2.2.1 JS 调用 Java

Android Webview 共提供过三种 JS 调用 Java 的接口：

- `JavascriptInterface`
- WebViewClient 的 `shouldOverrideUrlLoading(WebView, WebResourceRequest)`
- WebChromeClient 的 `onXXX()`



1. `JavascriptInterface`

   ==主要用于定义 JS 可调用执行的原生方法==

   ```java
   
   public class WebAppInterface {
   
       // 1. 定义暴露给 JavaScript 调用的方法，得是 JavascriptInterface 注解的公共方法
       @JavascriptInterface
       public void foo(String str) {
           // doing something
       }
   }
   
   
   WebView webView = (WebView) findViewById(R.id.webview); 
   // 2. 向 webView 注册 Js 可调用接口对象，这里的 Android 会被当做一个变量，注入到 H5 页面的 window 中
   webView.addJavascriptInterface(new WebAppInterface(), "Android"); 
   ```

   ```javascript
   <script>
       function test(){
       	// 3. H5 的 JS 代码中调用原生的方法
   		window.Android.foo("JS 正在执行原生方法")
       }
   </script>
   ```

   

2. 拦截 URL ---------->  WebViewClient 的 `shouldOverrideUrlLoading(WebView, WebResourceRequest)`

   ==主要用于拦截 webview 内的 URL 变更，广泛用于 WebView 跳转原生页面处理==，该方法返回 true，则可由代码自定义相应的 URL 需要处理的逻辑。如下：

   ```java
   public class CustomWebViewClient extends WebViewClient {
       
       @Override
       public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
         if (isJsBridgeUrl(request.getUrl().getScheme())) {
           // JSbridge的处理逻辑
           return true;
         }
         return super.shouldOverrideUrlLoading(view, url);
       }
   }
   ```

   这个时候就可以事先约定好特殊格式的 URL Scheme，触发 `shouldOverrideUrlLoading` 拦截后处理相应的逻辑。

   

3. 拦截 JS  对话框 ----------> WebChromeClient 的 `onXXX()`

   正常网页会弹出弹窗让我们点击操作或者输入操作返回一些值，当监听到弹窗之后返回 true 而不是默认的方法，这时候就会拦截这些对话框做相应的处理，并且返回值给 JavaScript。如下：

   ```java
   webView.setWebChromeClient(new WebChromeClient() {
       
       	// 确认提示弹出框
           @Override
           public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
               Toast.makeText(MainActivity.this, "onJsAlert：" + message, Toast.LENGTH_SHORT).show();
               result.confirm();
               return true;
           }
   
       	// 确认/取消式弹出框
           @Override
           public boolean onJsConfirm(WebView view, String url, String message, JsResult result) {
               Toast.makeText(MainActivity.this, "onJsConfirm：" + message, Toast.LENGTH_SHORT).show();
               result.cancel();
               return true;
           }
   
       	// 输入式弹出框
           @Override
           public boolean onJsPrompt(WebView view, String url, String message, String defaultValue, JsPromptResult result) {
               Toast.makeText(MainActivity.this, "onJsPrompt：" + message, Toast.LENGTH_SHORT).show();
               result.confirm("Tyhj");
               return true;
           }
       
   		// 打印 console 信息
        	@Override
   		public boolean onConsoleMessage(ConsoleMessage consoleMessage){
               Log.d(TAG, consoleMessage);
           }
       
       });
   ```

   

##### 2.2.2 Java 调用 JS

根据android版本，有2种方式：

- `loadUrl`：全部支持，但无法获取 JS 执行后的返回值
- `evaluateJavascript`：安卓 4.4 版本之后，可以获取 JS 执行后的返回值



1. loadUrl

   直接调用 JavaScript 的方法就可以，非常简单。如下：

   ```java
   // 直接加载本地HTML文件
   webView.loadUrl("file:///android_asset/test.html");
   
   webView.setWebViewClient(new WebViewClient() {
       
       // 确保页面加载结束，否则无法执行 JS 代码
       @Override
       public void onPageFinished(WebView view, String url) {
           String msg = "呵呵呵";
           int duration = 1000;
           //调用JavaScript的toast()方法
           webView.loadUrl("javascript:toast('" + msg + "','" + duration + "')");
       }
   });
   ```

   

2. evaluateJavascript

   这个方法适用于 Android4.4 版本以上，以下版本其实也有一些应对的办法，可以自己找找。如下：

   ```java
   webView.evaluateJavascript("javascript:getMsg()", new ValueCallback<String>() {
       
                       @Override
                       public void onReceiveValue(String value) {
                           Toast.makeText(MainActivity.this,value,Toast.LENGTH_SHORT).show();
                       }
                   });
   ```

   其实可以看出来，返回值基本上只支持传递字符串，但是支持字符串，就意味着支持基本类型（自己强转一下）和 Json 数据。

   

##### 2.2.3 其他交互

- Android 注入 JS 代码
- WebView 长按事件
- 监听图片选择



1. Android  注入 JS 代码

   有时候网页并不是我们定制的，里面没有我们需要的JavaScript代码，我们可以注入 JavaScript 代码进去；比如网页上的图片，我们可以提供查看和保存图片的功能，就需要注入 JavaScript。如下所示：

   ```java
       /**
        * 这段js函数的功能是，遍历所有的img节点，并添加onclick函数，
        * 函数的功能是在图片点击的时候调用本地java接口imageClick()并传递url过去
        */
       public static final String GET_IMAGE_URL = "javascript:(function(){" +
               "var objs = document.getElementsByTagName(\"img\");" +
               "for(var i=0;i<objs.length;i++)" +
               "{" +
               "objs[i].onclick=function(){window.activity.imageClick(this.getAttribute(\"src\"));}" +
               "}" +
               "})()";
               
       webView.loadUrl("file:///android_asset/test.html");
       //传递对象给JavaScript
       webView.addJavascriptInterface(MainActivity.this, "activity");
       //在这里注入JavaScript
       webView.loadUrl(GET_IMAGE_URL);
               
       /**
        * 点击图片时候调用
        *
        * @param imgUrl
        */
       @JavascriptInterface
       public void imageClick(String imgUrl) {
           //获取到图片的URL，可以在此操作图片
           Toast.makeText(MainActivity.this, imgUrl, Toast.LENGTH_SHORT).show();
       }
   ```

   

2. WebView 长按事件

   网页中相应 Android 的长按事件也是经常用到的，比如刚才的点击一般是查看图片，长按保存图片或者其他操作；其实就是设置 WebView 的长按事件，然后通过 WebView 的 `getHitTestResult()` 的函数可以获取点击页面元素的类型，然后，我们再根据类型进行相应的处理，还是以图片为例，如下：

   ```java
   webView.setOnLongClickListener(new View.OnLongClickListener() {
       
                       @Override
                       public boolean onLongClick(View v) {
                           final WebView.HitTestResult hitTestResult = webView.getHitTestResult();
                           // 如果是图片类型或者是带有图片链接的类型
                           if (hitTestResult.getType() == WebView.HitTestResult.IMAGE_TYPE ||
                                   hitTestResult.getType() == WebView.HitTestResult.SRC_IMAGE_ANCHOR_TYPE) {
                               String picUrl = hitTestResult.getExtra();
                               Toast.makeText(MainActivity.this, "长按获取到图片地址：" + picUrl, Toast.LENGTH_SHORT).show();
                               return true;
                           }
                           return false;
                       }
                   });
   ```

   

3. 监听图片选择

   对于此种情况，其实直接使用 JS 调用 Java 方法即可， 但 webView 有一个 `setWebChromeClient` 方法里面也可以监听到图片选择，可以响应一下；就是监听到图片选择以后，调用系统方法选择图片，返回给JavaScript，也比较简单。如下：

   ```java
   ValueCallback<Uri[]> mUploadMessageArray;
   int RESULT_CODE = 0;
   webView.setWebChromeClient(new WebChromeClient() {
       
           @Override
           public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
               mUploadMessageArray = filePathCallback;
               //选择图片
               Intent chooserIntent = new Intent(Intent.ACTION_GET_CONTENT);
               chooserIntent.setType("image/*");
               startActivityForResult(chooserIntent, RESULT_CODE);
               return true;
           }
       });
   
   @Override
   protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
       if (requestCode == RESULT_CODE) {
           if (mUploadMessageArray != null) {
               Uri result = (data == null || resultCode != RESULT_OK ? null : data.getData());
               //这里返回给JavaScript
               mUploadMessageArray.onReceiveValue(new Uri[]{result});
               mUploadMessageArray = null;
           }
       }
   }
   ```



------



#### 3 . 开源三方库



##### 3.1 [JsBridge](https://github.com/lzyzsd/JsBridge) 的使用



1.  **Java 提供接口给 Js 调用**

   ```java
   webView.registerHandler("submitFromWeb", new BridgeHandler(){
   
     @Override
     public void handler(String data, CallBackFunction function){ // data 为调用 WebViewJavascriptBridge.callHandler() 调用时的第二个参数
         
         // jS 调用 submitFromWeb 对应的方法时得到的响应值
         function.onCallBack("submitFrom web exe, response data from java");
     }
   }
   ```

   Js 如果需要调用 Java 提供的方法时，则需要调用这个 Handler，之前注册时的参数 `submitFromWeb` 将作为 Js 调用时使用的 Key 值。JS 调用方式如下：

   ```javascript
   WebViewJavascriptBridge.callHandler('submitFromWeb', {'param':str1}, function(responseData){
       
           //这里打印的应该是上面 Handler 实现方法中的 callback 的入参：submitFrom web exe, response data from java
           document.getElementById("show").innerHTML = "response data from java, data = "+responseData
       }
   )
   ```

   还==可以设置默认的 Handler，以便在 JS 调用 Java 接口时无需指定相应 Handler 仍可处理==，如下：

   ```java
   webView.setDefaultHandler(new DefaultHandler());
   ```

   这时，Js 调用的方式也可以简化为：

   ```java
   WebViewJavascriptBridge.send(data, function(responseData){
       
           //java 中 DefaultHandler 所实现的方法中 callback 的入参
       }
   )
   ```

   

2. **JS 提供操作给 Java 调用**

    JS 注册操作方法与 Java 雷同，如下：

   ```javascript
   WebViewJavascriptBridge.registerHandler("functionInJs", function(data, responseCallback) {
     document.getElementById("show").innerHTML = ("data from Java: = " + data);
     var responseData = "Javascript Says Right back aka!";
     responseCallback(responseData);
   });
   ```

   Java 调用 Handler 时，也跟 Js 类似，如下：

   ```java
   webView.callHandler("functionInJs", new Gson().toJson(user), // 该实参对应注册 handler 中的形参 data
           new CallBackFunction(){
               
               @Override
               public void onCallBack(String data){ // 该参数的值为 Handler 响应返回的 responseData
               }
           }
       );
   ```

   同样的，在 JS 中也可以注册默认的 Handler，以方便 Java 调用时，通过 send 方法发送数据，如下：

   ```javascript
   bridge.init(function(message, responseCallback) {
       console.log('JS got a message', message);
       var data = {
           'Javascript Responds': 'Wee!'
       };
       console.log('JS responding with', data);
       responseCallback(data);
   });
   ```

   Java 调用 send 方法：

   ```java
   webView.send("hello",  new CallBackFunction(){
               
               @Override
               public void onCallBack(String data){ // 该参数的值为 Handler 响应返回的 data
               }
           }
       );
   ```

   
