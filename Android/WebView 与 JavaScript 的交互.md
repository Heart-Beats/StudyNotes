## WebView 与 JavaScript 的交互

[TOC]



> 随着移动端领域的快速发展，业务场景愈发复杂，为减少开发量和投入成本，混合应用（Hybrid App）占据了不少市场。混合应用承载 H5 页面的容器就是 webview，前端人员在开发过程中或多或少都需要与原生（Native App）之间交互，这个交互的桥梁就叫做 JSBridge，在其中有一套通用的调试方法来确保 JSB 通信顺利。





### 1.  WebView 与 JSBridge



#### 1.1 什么是 WebView 

WebView 是原生应用用来展示网页的 view 组件，本质上就是一款内置了 webkit 内核的无头浏览器（headless browser），提供了例如页面前进后退、放大缩小、音频控制等一般浏览器具备的功能。



#### 1.2 什么是 JSBridge

==JSBridge 是支持原生应用与 H5 应用双向通信的“桥梁”。==



- 原生 -->h5：向 h5 应用通知原生应用的相关状态，触发 h5 页面的内容更新、消息发送、音频播放等
- h5 -->原生：向原生应用通知 h5 应用需要使用的功能，比如使用摄像头、使用 gps、唤起 app 等



------

### 2. Android WebView

