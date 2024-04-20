## App 启动背景优化

[TOC]





### 1. 问题

当 App 的启动页背景与 Window 的背景色不一致时，启动时会有闪屏问题产生。若 app 的启动页改成暗黑样式，会有如下问题：

- 把启动页的图片换成暗黑主体的图片后，冷/热启动都会有从白色到黑色的闪动
- 当修改主题中 `windowDisablePreview = true` 去除启动 window 时，这导致 app 热启动时，会有很长的一段延迟



### 2. starting window 是如何出现的

网上搜索下，发现是 starting widow 引起的，看看这个 starting window 是怎么打开和关闭的，以及如何设置它的背景色来匹配启动页的黑色背景

跟寻[上一篇文章](https://www.dalvik.work/2020/11/03/launch-activity-sequence/)的脚步，找到 start point：`ActivityStarter.startActivityUnchecked`

[![starting_window.jpg](https://www.dalvik.work/image/2020-11-11-starting-window/starting_window.jpg)](https://www.dalvik.work/image/2020-11-11-starting-window/starting_window.jpg)

<center>starting_window.jpg</center>



从上图可以看到，starting window 其实是系统通过 `ViewManager.addView` 往屏幕上添加的一个 `window`；而且它的显示时间比较早，比创建 app 进程（`ActivityStackSupervisor.startProcessAsync`）和 `ActivityThread` 执行 `Activity` 生命周期函数（`ActivityThread.performLaunchActivity`）都要早，所以它才能起到快速响应用户点击操作的效果；其次它的 view 是很简单的纯色背景，这样渲染也比较快出来，下面是构建 starting window 的代码，我们来看看它的样式是如何设置的

```java
public StartingSurface addSplashScreen(...) {
    // ...
    try {
        // ... theme 是 launch activity theme，在这个 theme 里我们可以设置 starting window 样式
        if (theme != context.getThemeResId() || labelRes != 0) {
            try {
                context = context.createPackageContext(packageName, CONTEXT_RESTRICTED);
                context.setTheme(theme);
            } catch (PackageManager.NameNotFoundException e) {
                // Ignore
            }
        }

        if (overrideConfig != null && !overrideConfig.equals(EMPTY)) {
            if (DEBUG_SPLASH_SCREEN) Slog.d(TAG, "addSplashScreen: creating context based"
                    + " on overrideConfig" + overrideConfig + " for splash screen");
            final Context overrideContext = context.createConfigurationContext(overrideConfig);
            overrideContext.setTheme(theme);
            final TypedArray typedArray = overrideContext.obtainStyledAttributes(com.android.internal.R.styleable.Window);

            // 我们可以通过 windowBackground 设置窗口背景
            final int resId = typedArray.getResourceId(R.styleable.Window_windowBackground, 0);
            if (resId != 0 && overrideContext.getDrawable(resId) != null) {
                // We want to use the windowBackground for the override context if it is
                // available, otherwise we use the default one to make sure a themed starting
                // window is displayed for the app.
                if (DEBUG_SPLASH_SCREEN) Slog.d(TAG, "addSplashScreen: apply overrideConfig"
                        + overrideConfig + " to starting window resId=" + resId);
                context = overrideContext;
            }
            typedArray.recycle();
        }

        final PhoneWindow win = new PhoneWindow(context);
        // ...
        addSplashscreenContent(win, context);
        wm = (WindowManager) context.getSystemService(WINDOW_SERVICE);
        view = win.getDecorView();
        wm.addView(view, params);
        // ....
    }
    // ...
}

private void addSplashscreenContent(PhoneWindow win, Context ctx) {
    final TypedArray a = ctx.obtainStyledAttributes(R.styleable.Window);

    // 看这里，我们可以通过 windowSplashscreenContent 设置 starting window content view 背景
    final int resId = a.getResourceId(R.styleable.Window_windowSplashscreenContent, 0);
    a.recycle();
    if (resId == 0) {
        return;
    }
    final Drawable drawable = ctx.getDrawable(resId);
    if (drawable == null) {
        return;
    }

    // We wrap this into a view so the system insets get applied to the drawable.
    final View v = new View(ctx);
    v.setBackground(drawable);
    win.setContentView(v);
}
```



### 3. 优化方案

从上面的代码可以看出，starting window 有两个样式是比较重要的，而它们都来自于 <font color="red">**launch activity 的 theme**</font>

1. `windowBackground` : 设置启动 window 的窗口背景
2. `windowSplashscreenContent` : 设置启动 window 的 content view 背景（requires API level 26）

这两个属性的差别在于 `windowBackground` 是作为  launch activity 进入前和进入后的整个背景，`windowSplashscreenContent` 则是作为 launch activity 进入前的内容区域，会在进入 launch activity 后被其内容替换。



把 launch activity 的窗口背景设置为黑色，即可避免启动时由白到黑的闪屏问题

更进一步，把窗口背景替换为 launch activity 的 logo 素材，这样 starting window 和 launch activity 的背景一致，两个窗口无缝切换，视觉上就感受不到 starting window 的存在了，感觉上 app 的启动非常快。