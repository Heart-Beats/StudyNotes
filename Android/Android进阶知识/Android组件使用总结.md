# Android 组件使用总结

[TOC]



> dp 解析：
>
> - dpi = px/ inch（英寸）  ：   像素密度 = 斜对角像素 / 斜对角英寸
> - density = dpi / 160   —> 密度，指每平方英寸中的像素数
> - ==px = **density  * dp**==          <==>  dp = px /density =  160px / dpi  = 160px / (px/inch) = 160 inch
>
> 所以在 Android 中 ，我们可推断出： 
>
> ​		dp  =  160 inch
>
> 因此我们可以看出 ， 1 英寸 = 160 dp， 即 最终 dp 决定的控件大小与任何因素无关， 160 dp 在不同 Android 设备上都会是 1 英寸。
>
> 同时对于字体还有如下关系： ==1in  = 160sp = 160dp = 72pt==



问题记录：

1. 自适应宽度的控件右边同时有控件跟随它的宽度改变而移动，当这个自适应宽度达到可达最大值时，会将右边控件挤掉的，这种情况下不设置自适应控件的最大宽度如何解决？

    方案：使用相对布局或约束性布局将右边控件的右边缘与自适应宽度控件的右边缘对齐，同时设置 PaddingEnd = 右边控件的宽度，即可解决此问题。 



### 1. Android 坐标系及获取坐标

#### 1.1 Android 坐标系和视图坐标系

1. Android坐标系

    <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/20160914151037027.png" alt="img" style="zoom: 80%;" />

    Android坐标系以手机屏幕左上角的顶点为坐标原点，从该点向右为x轴正方向，从该点向下为y轴正方向。而触控事件中，使用 getRawX() 和 getRawY() 方法。



2. 视图坐标系

    <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/20160914151055964.png" alt="img" style="zoom:80%;" />

    视图坐标系是以父视图的左上角为坐标原点的。相应的原点向右为x轴正方向，原点向下为y 轴正方向。在触控中，通过

    getX() 和 getY() 来获取的坐标值就是视图坐标系中的坐标值。



#### 1.2 获取坐标值以及相对距离的方法

![View位置](https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/View位置.min.png)

注：图中深蓝小圆点代表点击事件发生时的手指触摸点



上图中标注的方法可以分为两类，一类是 View提供 的方法，一类是 MotionEvent 提供的方法。分别说明如下：

1. View 提供的获取的坐标以及距离的方法（==视图坐标==）：

    - getTop()  ：    获取到的是view自身的顶边到其父布局顶边的距离
    - getLeft()   ：   获取到的是view自身的左边到其父布局左边的距离
    - getRight()  ：   获取到的是view自身的右边到其父布局左边的距离
    - getBottom()  ： 获取到的是view自身底边到其父布局顶边的距离

    注意：上述方法表示的是 ==View 原始状态时相对于父容器的坐标，对 view 进行平移操作并不会被改变==。

    

    除了以上方法外，View 还提供了以下方法：

    - `getX()` 、`getY()`  ：获取 View 左上角相对于父容器左上角的坐标，即==相对坐标==

    - `getTranslationX()`  、`getTranslationY()`  ：获取 View 左上角相对于父容器左上角的发生的偏移量（如：**translationX = getX() - getLeft()** ）

    - `getLocationOnScreen(int[] position)` ：获取 View 相对于整个屏幕的坐标，即==绝对坐标==

    - `getLocationInWindow(int[] position)` ：获取 View 相对于 Window 的坐标（不包括状态栏及 ActionBar）

        

    注意： `getLocationOnScreen()`和`getLocationInWindow()` 的区别：

    - View不在弹窗中时：两者获取的值相同（可见的状态栏的高度 + 可见的标题栏的高度 + View上端到标题栏下端的距离）；
    - View在弹窗中时：`getLocationOnScreen()`还是相对屏幕左上角的坐标，`getLocationInWindow()`为相对状态栏左下角的坐标，此时计算 Y 时已不包括状态栏的高度了。

    

2. MotionEvent 提供的方法（重写 View 的 onTouchEvent 方法时使用 —- 图中蓝色部分）：

    - getX()  ：  获取触摸点距离 View 左边的距离，即==视图坐标==

    - getY()  ： 获取触摸点距离 View 顶边的距离，即视图坐标

    - getRawX()  ： 获取触摸点距离整个屏幕左边的距离，即==绝对坐标==

    - getRawY()  ： 获取触摸点距离整个屏幕顶边的距离，即绝对坐标

        

------



### 2. EditText 相关

1. 自定义游标：通过 `textCursorDrawable`  属性设置，该属性对应的 Drawable 可如下：

    ```xml
    <?xml version="1.0" encoding="utf-8"?>
    <inset xmlns:android="http://schemas.android.com/apk/res/android"
        android:inset="2dp">
        <shape
            android:shape="rectangle"
            android:tint="@color/uikit_color_1">
            <size
                android:width="2dp"
                android:height="2dp" />
            <solid android:color="@color/uikit_color_1" />
        </shape>
    </inset>
    ```

2. 更改长按复制的水滴颜色：通过 `colorControlActivated` 属性直接设置颜色

3. 更改选中的文字颜色：通过 `textColorHighlight` 属性直接设置文字高亮颜色

除了以上对 EditText 直接设置相关属性外，还可以将相关属性定义在应用主题中，一般来说：该控件的相关属性保持统一就可以定义在主题中，如下：

```xml
<style name="AppTheme" parent="UiKit.AppTheme">
    <item name="actionBarSize">44dp</item>
    <!-- 更改游标颜色   -->
    <item name="android:textCursorDrawable">@drawable/uikit_edit_text_cursor_style</item>
    <item name="android:colorControlActivated">@color/main_blue</item>
    <item name="android:textColorHighlight">#4D5E60C7</item>
</style>
```



------

 

### 3. SearchView 的定制化

- 自定义 SearchView 的 Style：

    ```XML
    <?xml version="1.0" encoding="utf-8"?>
    <resources>
        <style name="MySearchViewStyle" parent="Widget.AppCompat.SearchView">
            <!--修改SearchView的整个布局样式-->
            <item name="layout">@layout/custom_search_view_layout</item>
            <!--修改搜索区域的背景，即可输入文字的区域-->
            <item name="queryBackground">@null</item>
            <item name="submitBackground">@drawable/abc_textfield_search_material</item>
    
            <!--修改打开搜索框的搜索按钮的图标-->
            <item name="searchIcon">@drawable/icon_search</item>
            <!--修改搜索框左边的搜索按钮图标-->
            <item name="searchHintIcon">@drawable/icon_search</item>
            <!--修改搜索框提示文字-->
            <item name="defaultQueryHint">搜索银行名称</item>
            <!--修改打开搜索框的关闭按钮的图标-->
            <item name="closeIcon">@null</item>
            <!--修改搜索框默认打开，搜索按钮图标在框外-->
            <item name="iconifiedByDefault">false</item>
    
            <item name="goIcon">@drawable/abc_ic_go_search_api_material</item>
            <item name="voiceIcon">@drawable/abc_ic_voice_search_api_material</item>
            <item name="commitIcon">@drawable/abc_ic_commit_search_api_mtrl_alpha</item>
            <item name="suggestionRowLayout">@layout/abc_search_dropdown_item_icons_2line</item>
        </style>
    
    </resources>
    ```

    通过以上的设置基本就可以实现 SearchView 的样式定制了，使用 SearchView 时声明它的 style 引用此样式即可实现特殊化，若想实现 APP 的 SearchView 默认为此样式，则需要 ：

    ```xml
    <?xml version="1.0" encoding="utf-8"?>
    <resources>
        <!-- Base application theme. -->
        <style name="AppTheme" parent="UiKit.AppTheme">
            <item name="actionBarSize">44dp</item>
            <!--全局声明 APP 的 SearchView 样式 -->
            <item name="searchViewStyle">@style/MySearchViewStyle</item>
        </style>
    </resources>
    ```

    通过以上设置，基本可以实现 SearchView 的各个图标以及默认样式，但若想改变默认的 SearchView 的默认布局，则需要更改它的 layout

- 更改 SearchView 的布局

    ```XML
    <?xml version="1.0" encoding="utf-8"?>
    <LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
        xmlns:app="http://schemas.android.com/apk/res-auto"
        xmlns:tools="http://schemas.android.com/tools"
        android:id="@+id/search_bar"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:orientation="horizontal">
    
        <!-- This is actually used for the badge icon *or* the badge label (or neither) -->
        <TextView
            android:id="@+id/search_badge"
            android:layout_width="wrap_content"
            android:layout_height="match_parent"
            android:layout_marginBottom="2dip"
            android:drawablePadding="0dip"
            android:gravity="center_vertical"
            android:textAppearance="?android:attr/textAppearanceMedium"
            android:textColor="?android:attr/textColorPrimary"
            android:visibility="gone"
            tools:background="@android:color/holo_blue_bright"
            tools:visibility="visible" />
    
        <!-- 搜索框外的搜索图标 -->
        <ImageView
            android:id="@+id/search_button"
            style="?attr/actionButtonStyle"
            android:layout_width="wrap_content"
            android:layout_height="match_parent"
            android:layout_gravity="center_vertical"
            android:contentDescription="@string/abc_searchview_description_search"
            android:focusable="true"
            tools:srcCompat="@drawable/btn_bg_blue_radius0_normal" />
    
        <!-- 整个搜索框可编辑区域 -->
        <LinearLayout
            android:id="@+id/search_edit_frame"
            android:layout_width="wrap_content"
            android:layout_height="match_parent"
            android:layout_weight="1"
            android:layoutDirection="locale"
            android:orientation="horizontal"
            tools:background="@color/bill_state_color_take_fail">
    
            <!-- 搜索框内的搜索图标 -->
            <ImageView
                android:id="@+id/search_mag_icon"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_marginStart="@dimen/margin_10"
                android:layout_marginEnd="8dp"
                android:layout_gravity="center_vertical"
                android:scaleType="centerInside"
                android:visibility="gone"
                tools:visibility="visible"
                tools:background="@color/white"/>
    
            <!-- Inner layout contains the app icon, button(s) and EditText -->
            <LinearLayout
                android:id="@+id/search_plate"
                android:layout_width="wrap_content"
                android:layout_height="match_parent"
                android:layout_gravity="center_vertical"
                android:layout_weight="1"
                android:orientation="horizontal"
                tools:background="@color/white">
    
                <!-- 清空以及收起搜索框的关闭图标 -->
                <ImageView
                    android:id="@+id/search_close_btn"
                    android:layout_width="wrap_content"
                    android:layout_height="match_parent"
                    android:layout_gravity="center_vertical"
                    android:background="?attr/selectableItemBackgroundBorderless"
                    android:contentDescription="@string/abc_searchview_description_clear"
                    android:focusable="true"
                    tools:paddingLeft="8dip"
                    tools:paddingRight="8dip"
                    tools:background="@color/colorAccent" />
    
                <!--输入框--SearchAutoComplete -->
                <view
                    android:id="@+id/search_src_text"
                    class="androidx.appcompat.widget.SearchView$SearchAutoComplete"
                    android:layout_width="0dp"
                    android:layout_height="36dip"
                    android:layout_gravity="center_vertical"
                    android:layout_weight="1"
                    android:textColor="@color/txt_color_gray_normal"
                    android:textSize="13sp"
                    android:background="@null"
                    android:dropDownAnchor="@id/search_edit_frame"
                    android:dropDownHeight="wrap_content"
                    android:dropDownHorizontalOffset="0dip"
                    android:dropDownVerticalOffset="0dip"
                    android:ellipsize="end"
                    android:imeOptions="actionSearch"
                    android:inputType="text|textAutoComplete|textNoSuggestions"
                    android:paddingLeft="0dp"
                    android:paddingRight="@dimen/abc_dropdownitem_text_padding_right"
                    android:singleLine="true"
                    android:textCursorDrawable="@drawable/edit_text_cursor_style"
                    tools:background="@color/txt_color_blue"/>
    
            </LinearLayout>
    
            <LinearLayout
                android:id="@+id/submit_area"
                android:layout_width="wrap_content"
                android:layout_height="match_parent"
                android:orientation="horizontal">
    
    			<!-- 提交图标 -->
                <ImageView
                    android:id="@+id/search_go_btn"
                    android:layout_width="wrap_content"
                    android:layout_height="match_parent"
                    android:layout_gravity="center_vertical"
                    android:background="?attr/selectableItemBackgroundBorderless"
                    android:contentDescription="@string/abc_searchview_description_submit"
                    android:focusable="true"
                    android:paddingLeft="16dip"
                    android:paddingRight="16dip"
                    android:visibility="gone"
                    tools:visibility="visible"
                    tools:background="@color/mch_orange"/>
                
                <!-- 语音图标 -->
                <ImageView
                    android:id="@+id/search_voice_btn"
                    android:layout_width="wrap_content"
                    android:layout_height="match_parent"
                    android:layout_gravity="center_vertical"
                    android:background="?attr/selectableItemBackgroundBorderless"
                    android:contentDescription="@string/abc_searchview_description_voice"
                    android:focusable="true"
                    android:paddingLeft="16dip"
                    android:paddingRight="16dip"
                    android:visibility="gone"
                    tools:visibility="visible"
                    tools:background="@color/upsdk_blue_text_007dff"/>
            </LinearLayout>
        </LinearLayout>
    </LinearLayout>
    ```

    以上即为整个 SearchView 的布局文件，注意每个控件的区域和代表的含义，尤其==**控件的 id 不可更改**==，因为 SearchView  会通过加载布局文件查找这些 id 来找到对应的控件，我们可以在这里更改每个控件的布局位置以及大小，也可以设置每个控件的样式（背景、可见性以及其他属性），如上就通过 `textCursorDrawable` 这个属性更改了输入框光标的样式，具体是通过shape实现的：

    ```XMl
    <?xml version="1.0" encoding="utf-8"?>
    <shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
        <size android:width="1dp" />
        <solid android:color="#5E60C7"  />
    </shape>
    ```



------



### 4. 自定义对话框

- 首先需要自定义对话框的样式

    ```xml
    <!--对话框的样式-->
    <style name="NormalDialogStyle">
        <!--对话框背景 -->
        <item name="android:windowBackground">@android:color/transparent</item>
        <!--边框 -->
        <item name="android:windowFrame">@null</item>
        <!--没有标题 -->
        <item name="android:windowNoTitle">true</item>
        <!-- 是否浮现在Activity之上 -->
        <item name="android:windowIsFloating">true</item>
        <!--背景透明 -->
        <item name="android:windowIsTranslucent">false</item>
        <!-- 是否有覆盖 -->
        <item name="android:windowContentOverlay">@null</item>
        <!--进出的显示动画 -->
        <item name="android:windowAnimationStyle">@style/normalDialogAnim</item>
        <!--背景变暗-->
        <item name="android:backgroundDimEnabled">true</item>
    </style>
    
    <!--对话框动画-->
    <style name="normalDialogAnim" parent="android:Animation">
        <item name="@android:windowEnterAnimation">@anim/normal_dialog_enter</item>
        <item name="@android:windowExitAnimation">@anim/normal_dialog_exit</item>
    </style>
    ```

    然后再为对话框设置我们自定义的 style 以及需要填充的 layout ，就可以达到自定义对话框式样和布局了。

    

- 如果需要更改对话框的位置、大小等其他属性，就需要更改 Dialog 的 Window 的 属性，如下：

    ```kotlin
    requireDialog().apply {
        val window = this.window
        //自定义 style 中也可以控制 window 的背景和遮罩层
        //window.setBackgroundDrawableResource(R.drawable.shape_bg_white_radius_8)
        //去除dialog的背景遮罩
        //window.clearFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND)
    
        val layoutParams = window?.attributes?.apply {
            // 更改遮罩层的透明度，会影响状态栏
            // this.dimAmount = 0.1f
            // 两种属性同时生效必须使用 位与运算
            this.gravity = Gravity.TOP or Gravity.START
    
            //这里的 x,y 是相对 Window 的位置（不包括状态栏和 ActionBar ），y 的计算需要用到
            //  view.getLocationOnScreen(int[] position) - 状态栏高度 - 标题栏高度（若弹出框的样式未禁用actionBar）
            this.x = windowX
            this.y = windowY
    
            val point = Point()
         	window.windowManager.defaultDisplay.getSize(point)
            this.width = (point.x * 0.75f).toInt()
            this.height = WindowManager.LayoutParams.WRAP_CONTENT
        }
        window?.attributes = layoutParams
        
        //设置 windows 弹出和关闭动画样式
        window?.setWindowAnimations(animationStyle)
        
        //点击对话框外不可关闭对话框
        this.setCanceledOnTouchOutside(false)
        
        //拦截按键的默认处理
        this.setOnKeyListener { _, keyCode, _ ->
          	//拦截 back 键，使其不可关闭对话框                  
            keyCode == KeyEvent.KEYCODE_BACK
        }
    }
    ```



------



### 5. 自定义 TabLayout 的指示器

- 首先定义 tablayout 的样式

    ```xml
    <style name="TabLayoutStyle" parent="Widget.MaterialComponents.TabLayout">
        <!--设置tab 的背景-->
        <item name="tabBackground">@android:color/white</item>
        <!--设置按下的水波纹颜色 -->
        <item name="tabRippleColor">@android:color/transparent</item>
        <!--设置水波纹是否有边界 -->
        <item name="tabUnboundedRipple">true</item>
        <!--设置图标与文字是否横向线性排列-->
        <item name="tabInlineLabel">false</item>
        <!--设置默认指示器宽度是否与 item 文字等宽，false为与文字等宽 -->
        <item name="tabIndicatorFullWidth">false</item>
        <!--设置默认字体样式（字体大小，颜色，风格...） -->
        <item name="tabTextAppearance">@style/TabLayoutTextStyle</item>
        <!--设置选中的 item 字体颜色-->
        <item name="tabSelectedTextColor">@color/colorAccent</item>
        <!--设置指示器的颜色 -->
        <item name="tabIndicatorColor">@color/colorAccent</item>
        <!--设置自定义的指示器 -->
        <item name="tabIndicator">@drawable/tab_indicator</item>
        <!--设置是否可横向滚动 -->
        <item name="tabMode">scrollable</item>
        
        <!-- android:theme 这个属性很重要，在 material v1.1.0 之后，未将theme设置为MaterialComponents，使用MD控件可能会出现闪退-->
    	<item name="android:theme">@style/Theme.MaterialComponents.Light.NoActionBar</item>
    </style>
    
    <style name="TabLayoutTextStyle">
        <item name="android:textSize">16sp</item>
        <item name="android:textColor">#333333</item>
    </style>
    ```

    以下为自定义的指示器文件：

    ```xml
    <?xml version="1.0" encoding="utf-8"?>
    <layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    
        <!--决定指示器的位置， tabIndicatorFullWidth 不同值可能有不同效果-->
        <item android:gravity="center">
            <shape>
                <size
                    android:width="18dp"
                    android:height="3dp" />
                <!--这里设置的颜色不会生效，需要通过 tabIndicatorColor 设置-->
                <solid android:color="@color/uikit_color_1" />
                <corners android:radius="5dp" />
            </shape>
        </item>
    </layer-list>
    ```

    通过定义上面的样式后，在使用 TabLayout 时引用此样式就可以了。

    

- 然后，创建选项卡

    1. 在 xml 中通过布局文件创建

        ```xml
        <com.google.android.material.tabs.TabLayout
            android:id="@+id/tabLayout"
            style="@style/TabLayoutStyle"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_marginTop="40dp"
            app:tabContentStart="50dp"
            app:tabMode="fixed">
        
            <com.google.android.material.tabs.TabItem
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="选项1"/>
            <!--可以通过 "android:icon" 来给选项卡加上图标 -->
        
            <com.google.android.material.tabs.TabItem
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="选项2"/>
        </com.google.android.material.tabs.TabLayout>
        ```

    2. 在代码中动态创建

        ```kotlin
        val tab = tabLayout.newTab()  //通过 newTab() 创建新的选项卡，这样才可以被添加
        
        tab.setText("选项卡1")     // 设置选项卡上的文字
        tab.setIcon(R.drawable.icon_tab1)  // 设置选项卡上的图标
        
        tab.setCustomView(Button(requireContext()))  //给选项卡设置自定义的view（可以从布局文件中加载）
        
        tabLayout.addTab(tab)
        ```

    3. 给选项卡添加点击选择监听器

        ```kotlin
        tabLayout.addOnTabSelectedListener(object : TabLayout.OnTabSelectedListener {
            //当一个选项卡进入选择状态调用
            override fun onTabSelected(tabItem: TabLayout.Tab) {
                //可以通过 tabItem.text、tabItem.icon、tabItem.customView 来设置选中选项卡的文字、图标、和自定义view的更改
            }
        
            //当一个选项卡退出选择状态调用，能通过 tabItem 可做的处理与选中状态一致
            override fun onTabUnselected(tabItem: TabLayout.Tab) {
            }
        
            //当用户再次选择已经选择的选项卡时调用 ， tabItem 使用同上
            override fun onTabReselected(tabItem: TabLayout.Tab) {
            }
        })
        ```

        注意：若在 `tabLayout.addTab(tab)` 之后设置选择监听器，那么默认选中时选择监听器是无任何事件回调的，切换选项卡时才有事件回调，若想 tabLayout 一显示就有事件回调，在 `tabLayout.addTab(tab)` 之前设置选择监听器即可，这样默认选中选项卡时就能收到监听回调。

        

    后续代码中就可通过 TabLayout + ViewPager2 + Fragment 实现页面滑动切换效果。

    

    注意：TabLayout + ViewPager2 实现页面滑动切换联动需要使用 ==TabLayoutMediator==，如下所示：

    ```kotlin
    //通过 TabLayoutMediator 的 attach 将 TabLayout 和 ViewPager2 联动在一起
    TabLayoutMediator(tab_layout, view_pager) { tab, position ->
        //TabLayout 和 ViewPager2 联动在一起后布局中设置的 tabItem 将失效，因此需要重新设置 item
        tab.text = fragments[position].arguments?.get("title") as? String ?: ""
    }.attach()
    ```

    只有最终调用 ==`attach()`== 方法后，才会有联动效果以及 `TabLayoutMediator` 中设置的回调才会产生。

    

------



### 6. 通知的使用



关于通知的具体使用细节涉及的问题很多，这里不作完整介绍，如需查看通知的使用详情，可以参见官网介绍：[通知概览](https://developer.android.google.cn/guide/topics/ui/notifiers/notifications)

这里仅列出开发使用时需要注意的一些方面：



#### 6.1 通知概览

##### 6.1.1 通知的外观

通知可以在不同的位置以不同的格式显示，例如，状态栏中的图标、抽屉式通知栏中比较详细的条目、应用图标上的标志，以及在配对的穿戴式设备上自动显示。

1. 状态栏和抽屉式通知栏

    发出通知后，通知先以图标的形式显示在状态栏中：

    <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/notification-area_2x.png" alt="img" style="zoom:50%;" />

    <center>图 1. 通知图标显示在状态栏的左侧</center>																

    用户可以在状态栏向下滑动以打开抽屉式通知栏，并在其中查看更多详情及对通知执行操作：

    <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/notification-drawer_2x.png" alt="img" style="zoom:50%;" />

    <center>图 2. 抽屉式通知栏中的通知</center>										

    用户可以向下拖动抽屉式通知栏中的某条通知以查看展开后视图，其中会显示更多内容以及操作按钮（如果有）。

    在应用或用户关闭通知之前，通知会一直显示在抽屉式通知栏中。
    
    
    
2. 提醒式通知

    从 Android 5.0 开始，通知可以短暂地显示在浮动窗口中，称之为提醒式通知。这种行为通常适用于用户应立即知晓的重要通知，而且仅在设备未锁定时才显示。

    <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/heads-up_2x.png" alt="img" style="zoom:50%;" />

    <center>图 3. 显示在前台应用前面的提醒式通知</center>										

    提醒式通知会在应用发出通知后立即出现，稍后便会消失，但仍照常显示在抽屉式通知栏中。

    可能会触发提醒式通知的条件示例：

    - 用户的 Activity 处于全屏模式（应用使用 `fullScreenIntent`）。

    - 通知的优先级很高，且在搭载 Android 7.1（API 级别 25）及更低版本的设备上使用铃声或振动。

    - 在搭载 Android 8.0（API 级别 26）及更高版本的设备上，通知渠道的重要程度比较高。

        

3. 锁定屏幕上的通知

    从 Android 5.0 开始，通知可以显示在锁定屏幕上。

    可以通过代码设置应用在安全锁定屏幕上所发布通知的详情可见等级，甚至可以设置通知是否显示在锁定屏幕上。

    用户可以通过系统设置来选择锁定屏幕通知的详情可见等级，包括选择停用所有锁定屏幕通知。从 Android 8.0 开始，用户可以选择停用或启用各个[通知渠道](#5.2 创建通知渠道)的锁定屏幕通知。

    <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/lock-screen_2x.png" alt="img" style="zoom:50%;" />

    <center>图 4. 锁定屏幕上已隐藏敏感内容的通知</center>						

    要了解详情，请参考如何[设置锁定屏幕的可见性](https://developer.android.google.cn/training/notify-user/build-notification#lockscreenNotification)。

    

4.  应用图标上的通知标志

    在 Android 8.0（API 级别 26）及更高版本的设备上，应用可以通过在相应的应用启动器图标上显示彩色“标志”（又称“通知圆点”）来表示有新通知。

    用户可以长按应用图标来查看该应用的通知，同时也可以关闭通知或者在长按菜单中对通知执行操作（类似于抽屉式通知栏）。

    <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/badges-open_2x.png" alt="img" style="zoom:50%;" />

    <center>图 5. 通知标志和长按菜单</center>						

    要详细了解标志的工作原理，请参阅[通知标志](https://developer.android.google.cn/training/notify-user/badges)。

    

5. Wear OS 设备

    如果用户有配对的 Wear OS 设备，那么应用的所有通知都会自动显示在已配对设备上，包括展开式详情和操作按钮。

    另外还可以通过自定义通知在穿戴式设备上的外观以及提供不同的操作选项（包括建议的回复和语音输入回复）来提升用户体验。要了解详情，请参阅如何[向通知中添加特定于穿戴式设备的功能](https://developer.android.google.cn/training/wearables/notifications/creating#AddWearableFeatures)。

    <img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/wear_2x.png" alt="img" style="zoom:50%;" />

    <center>图 6. 通知自动显示在已配对的 Wear OS 设备上</center>						



##### 6.1.2 通知各个部分解析

通知的设计由系统模板决定，您的应用只需要定义模板中各个部分的内容即可。通知的部分详情仅在展开后视图中显示。

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/notification-callouts_2x.png" alt="img" style="zoom:50%;" />

<center>图 7. 包含基本详情的通知</center>	

图 7 展示了通知最常见的部分，具体如下所示：

1. 小图标：==必须提供==，通过 `setSmallIcon()` 进行设置。
2. 应用名称：由系统提供。
3. 时间戳：由系统提供，但您可以通过 `setWhen()` 将其替换掉或者通过 `setShowWhen(false)` 将其隐藏。
4. 大图标：可选内容（通常仅用于联系人照片，请勿将其用于应用图标），通过 `setLargeIcon()` 进行设置。
5. 标题：可选内容，通过 `setContentTitle()` 进行设置。
6. 文本：可选内容，通过 `setContentText()` 进行设置。

要详细了解如何创建包含上述功能及其他功能的通知，请参阅[创建通知](https://developer.android.google.cn/training/notify-user/build-notification)。



##### 6.1.3 通知的兼容性

由于通知系统界面以及与通知相关的 API 在不断发展，所以为了支持旧设备的同时又能使用最新的通知 API，需要使用 ==`NotificationCompat`== 和 ==`NotificationManagerCompat`==， 这样一来，就无需编写条件代码来检查 API 级别，因为这些 API 会作处理。

在使用通知时，主要需要关注 ==Android 8.0，API 级别 26== 以上设备与其以下的区分：

- Android 8.0 及以上：必须为创建的通知分配渠道，否则通知则不会显示。至于渠道是什么，可以简单的理解为将通知分类：==可以通过渠道统一控制它下面的所有通知的视觉和听觉选项、重要程度等级、是否关闭通知等等==，也就是说，可以通过不同的渠道管理不同类型的通知。



##### 6.1.4 通知的发布限制

从 ==Android 8.1（API 级别 27）==开始，应用无法每秒发出一次以上的通知提示音。如果应用在一秒内发出了多条通知，这些通知都会按预期显示，但是每秒中只有第一条通知发出提示音。

不过，Android 还对通知更新频率设定了限制。如果过于频繁地发布有关某条通知的更新（不到一秒内发布多个），系统可能会放弃部分更新。

因此，==如果在短时间内快速发布多条通知，可能会引起部分通知丢失==，这点尤其需要注意，如果确实有这种应用场景时（如：更新进度），可以对需要对发布的通知进行过滤或者在通知之间加上时间间隔。



#### 6.2 创建通知渠道

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20201113111917715.png" alt="image-20201113111917715" style="zoom: 25%;" />

<center>图 8. 哔哩哔哩的通知渠道情况</center>	

上图即为哔哔哩的通知渠道情况，可以看出总共有六个通知渠道，点击直播，我们可以查看这个通知渠道详情：

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/image-20201113112324022.png" alt="image-20201113112324022" style="zoom:25%;" />

渠道详情里有重要程度（也就是静默通知以及横幅通知）、提示音、震动等设置，这些都可以在代码中设置的。



##### 6.2.1 主要创建步骤

在创建通知或通知渠道之前，首先应该添加支持库来使用 ==`NotificationCompat`== 和 ==`NotificationManagerCompat`==相关API，在应用模块的 `build.gradle`文件中添加依赖：

```groovy
dependencies {
        implementation "com.android.support:support-compat:28.0.0"
    	// androidX 下的依赖 
    	//implementation "androidx.core:core:1.0.0" 
    }
```



1. 构建一个具有唯一渠道 ID、用户可见名称和重要性级别的 `NotificationChannel` 对象。
2. （可选）使用 `setDescription()` 指定用户在系统设置中看到的说明。
3. 注册通知渠道，方法是将该渠道传递给 `createNotificationChannel()`。

注意：在 Android 8.0（API 级别 26）及更高版本上才必须要创建通知渠道，同时通知的支持库（`Compat` 结尾的相关API）并未对此来作检查，因此创建通知渠道的相关代码应该如下：

```kotlin
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        // Create the NotificationChannel
        val name = getString(R.string.channel_name)
        val descriptionText = getString(R.string.channel_description)
        val importance = NotificationManager.IMPORTANCE_DEFAULT
        val mChannel = NotificationChannel(CHANNEL_ID, name, importance)
        mChannel.description = descriptionText
        
        // Register the channel with the system; you can't change the importanceor other notification behaviors after this
        val notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManagerCompat
        notificationManager.createNotificationChannel(mChannel)
    }
    
```

如果想进一步定义渠道的默认通知行为，还可以在 `NotificationChannel` 上调用 `enableLights()`、`setLightColor()` 和 `setVibrationPattern()` 等方法，但是需要注意：==一旦通知渠道创建以后，就无法再通过代码更改这些行为设置，而且对于是否启用相应的设置，用户拥有最终控制权。==

除了以上方法创建通知渠道，还可以通过调用 [`createNotificationChannels()`](https://developer.android.google.cn/reference/android/app/NotificationManager#createNotificationChannels(java.util.List<android.app.NotificationChannel>)) 在一次操作中创建多个通知渠道。



##### 6.2.2 设置重要性级别

渠道重要性会影响在渠道中发布的所有通知的干扰级别，因此必须在 `NotificationChannel` 构造函数中指定渠道重要性。可以使用从 `IMPORTANCE_NONE(0)` 到 `IMPORTANCE_HIGH(4)` 的五个重要性级别之一。

如需支持搭载 Android 7.1（API 级别 25）或更低版本的设备，还必须使用 `NotificationCompat` 类中的优先级常量针对每条通知调用 `setPriority()`。重要性 (`NotificationManager.IMPORTANCE_*`) 和优先级常量 (`NotificationCompat.PRIORITY_*`) 会映射到用户可见的重要性选项（如表 1 中所示）。

<center>表 1. 渠道重要性级别</center>

| 用户可见的重要性级别                          | 重要性（Android 8.0 及更高版本） | 优先级（Android 7.1 及更低版本）  |
| :-------------------------------------------- | :------------------------------- | :-------------------------------- |
| **紧急** ：发出提示音，并以浮动通知的形式显示 | `IMPORTANCE_HIGH`                | `PRIORITY_HIGH` 或 `PRIORITY_MAX` |
| **高** ：发出提示音                           | `IMPORTANCE_DEFAULT`             | `PRIORITY_DEFAULT`                |
| **中** ：无提示音                             | `IMPORTANCE_LOW`                 | `PRIORITY_LOW`                    |
| **低** ：无提示音，且不会在状态栏中显示。     | `IMPORTANCE_MIN`                 | `PRIORITY_MIN`                    |

无论重要性级别如何，所有通知都会在非干扰系统界面位置显示，例如：显示在抽屉式通知栏中，以及[在启动器图标上作为标志显示](https://developer.android.google.cn/guide/topics/ui/notifiers/notifications#app_icon_badge)，不过，您可以[修改通知标志的外观](https://developer.android.google.cn/training/notify-user/badges)。

将渠道提交至 `NotificationManager` 后，便无法更改重要性级别。不过，用户可以随时更改他们对您的应用渠道的偏好设置。



##### 6.2.3 读取通知渠道设置

用户可以修改通知渠道的设置，其中包括振动和提醒提示音等行为。如果想了解用户对通知渠道所应用的设置，请按以下步骤操作：

1. 通过调用 `getNotificationChannel()` 或 `getNotificationChannels()` 来获取 `NotificationChannel` 对象。
2. 查询特定的渠道设置，例如 `getVibrationPattern()`、`getSound()` 和 `getImportance()`。

接下来，如果检测到某项渠道设置禁止应用的预期行为，可以建议用户更改该设置，并提供一项用于打开渠道设置的操作（请参阅下一部分）。



##### 6.2.4 打开通知渠道设置

创建通知渠道后，便无法以编程方式更改通知渠道的视觉和听觉行为，只有用户可以通过系统设置更改渠道行为。为了让用户轻松访问这些通知设置，应在应用的[设置界面](https://developer.android.google.cn/guide/topics/ui/settings)中添加一个用于打开这些系统设置的项。

可以通过一个使用 `ACTION_CHANNEL_NOTIFICATION_SETTINGS` 操作的 `Intent` 打开通知渠道的系统设置。

例如，以下示例代码展示了如何将用户重定向到通知渠道的设置：

```kotlin
val intent = Intent(Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS).apply {
    putExtra(Settings.EXTRA_APP_PACKAGE, packageName)
    putExtra(Settings.EXTRA_CHANNEL_ID, myNotificationChannel.getId())
}
startActivity(intent)
    
```

请注意，该 intent 需要两个提取项，分别用于指定您应用的软件包名称（也称为应用 ID）和要修改的渠道。



##### 6.2.5 删除通知渠道

可以通过调用 `deleteNotificationChannel()` 删除通知渠道。以下示例代码演示了如何完成此过程：

```kotlin
// The id of the channel.
val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
val id: String = "my_channel_01"
notificationManager.deleteNotificationChannel(id)
    
```

**注意**：作为一种垃圾内容防范机制，通知设置屏幕会显示已删除渠道的数量。您可以通过重新安装应用或清除与应用相关联的数据，清除开发设备上的测试渠道。



##### 6.2.6 创建渠道分组

如果希望进一步整理渠道在设置界面中的外观，则可以创建渠道分组。当应用支持多个用户帐号时，强烈建议这么做，因为这么做可以为每个帐号各创建一个通知渠道分组。这样一来，用户便可以轻松识别和控制具有相同名称的多个通知渠道了。

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/channel-groups_2x.png" alt="img" style="zoom:50%;" />

<center>包含个人帐号和工作帐号分组的通知渠道设置</center>

例如，社交网络应用可能包含对个人帐号和工作帐号的支持。在这种情况下，每个帐号可能都需要具有相同功能和名称的多个通知渠道，如下所示：

- 具有两个渠道的个人帐号：
    - 新评论
    - 帖子推荐
- 具有两个渠道的企业帐号：
    - 新评论
    - 帖子推荐

整理每个帐号的通知渠道并对其分组可以确保用户能够轻松区分它们。

每个通知渠道分组都需要一个在您的软件包内独一无二的 ID，以及一个用户可见名称。以下代码段演示了如何创建通知渠道分组。

```kotlin
    // The id of the group.
    val groupId = "my_group_01"
    // The user-visible name of the group.
    val groupName = getString(R.string.group_name)
    val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    notificationManager.createNotificationChannelGroup(NotificationChannelGroup(groupId, groupName))
    
```

创建新分组后，您可以调用 `setGroup()` 以将新的 `NotificationChannel` 对象与该分组相关联。

将渠道提交至通知管理器后，便也无法更改通知渠道和分组之间的关联。



#### 6.3 创建通知



##### 6.3.1 创建基本通知

最基本、精简形式（也称为折叠形式）的通知会显示一个图标、一个标题和少量内容文本

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/notification-basic_2x.png" alt="img" style="zoom:50%;" />

<center>图 1. 带有标题和文本的通知</center>

如需详细了解通知的各个部分，请参阅[通知剖析](#5.1.2 通知各个部分解析)。

如下代码，就是创建了一个最基本的通知：

```kotlin
val builder = NotificationCompat.Builder(this, CHANNEL_ID)
        .setSmallIcon(R.drawable.notification_icon) //小图标,必须
        .setContentTitle(textTitle)  //标题
        .setContentText(textContent) //正文文本
        .setPriority(NotificationCompat.PRIORITY_DEFAULT) 
```

注意：

- `NotificationCompat.Builder` 构造函数需要提供渠道 ID。这是兼容 Android 8.0（API 级别 26）及更高版本所必需的，但会被低版本忽略。

- `setPriority()`是设置通知优先级，确定通知在 Android 7.1 和更低版本上的干扰程度。（对于 Android 8.0 和更高版本，还必须设置渠道重要性)

    

默认情况下，通知的文本内容会被截断放在一行。如果想要更长的通知，可以使用 `setStyle()` 添加样式模板来启用可展开的通知。如下所示：

```kotlin
val builder = NotificationCompat.Builder(this, CHANNEL_ID)
        .setSmallIcon(R.drawable.notification_icon)
        .setContentTitle("My notification")
        .setContentText("Much longer text that cannot fit one line...")
        .setStyle(NotificationCompat.BigTextStyle()
                .bigText("Much longer text that cannot fit one line..."))
        .setPriority(NotificationCompat.PRIORITY_DEFAULT)
```

如需详细了解其他大型通知样式，包括如何添加图片和媒体播放控件，请参阅[创建包含可展开详情的通知](https://developer.android.google.cn/training/notify-user/expanded)。



若需在 Android 8.0 以上设备上创建发布通知，则必须先创建通知渠道，重复创建通知渠道不会执行任何操作，所以可在应用启动时立即创建。更多详情请参阅[创建渠道通知](#5.2 创建通知渠道)。

以上仅是创建一个通知，若需将通知显示发布，还需使用如下代码：

```kotlin
with(NotificationManagerCompat.from(this)) {
    //每个通知的通知 ID 必须唯一
    notify(notificationId, builder.build())
}
```

请注意保存通知 ID，后续若想[更新](https://developer.android.google.cn/training/notify-user/build-notification#Updating)或[移除通知](https://developer.android.google.cn/training/notify-user/build-notification#Removing)，都需要使用这个 ID。



##### 6.3.2 设置通知的点按操作

每个通知都应该对点击操作做出响应，通常是在应用中打开对应于该通知的 Activity，还可以点击时发送广播或者启动 Service。为此，您必须指定通过 `PendingIntent` 对象定义的内容 Intent，并将其传递给 `setContentIntent()`。



1. 打开Activity

    以下代码段展示了如何创建基本 Intent，以在用户点按通知时打开 Activity：

    ```kotlin
    // Create an explicit intent for an Activity in your app
    val intent = Intent(this, AlertDetails::class.java).apply {
        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
    }
    val pendingIntent: PendingIntent = PendingIntent.getActivity(this, 0, intent, 0)
    
    val builder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.notification_icon)
            .setContentTitle("My notification")
            .setContentText("Hello World!")
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            // Set the intent that will fire when the user taps the notification
            .setContentIntent(pendingIntent)
            .setAutoCancel(true) //点击通知后自动移除通知
    ```

    以上所示的 `setFlags()` 方法可帮助保留用户在通过通知打开应用后的预期导航体验。但您是否要使用这一方法取决于您要启动的 Activity 类型，类型可能包括：

    - ==常规 Activity==

        这类 Activity 是应用的正常用户体验流程的一部分。因此，当用户从通知转到这类 Activity 时，新任务应包括完整的[返回堆栈](https://developer.android.google.cn/guide/components/activities/tasks-and-back-stack)，以便用户可以按“返回”按钮并沿应用层次结构向上导航。

    - ==特殊 Activity==

        只有当 Activity 从通知启动时，用户才可以看到此类 Activity。从某种意义上来说，这类 Activity 通过提供通知本身难以显示的信息来扩展通知界面。因此，这类 Activity 不需要返回堆栈。

        

    通过以上可知，针对两种不同类型的  Activity 需要创建不同的`PendingIntent`：

    - ==常规 Activity 的 PendingIntent==

        - 定义应用的 Activity 层次结构

            通过向应用清单文件中的每个 `<activity>` 元素添加 `android:parentActivityName` 属性来定义 Activity 的层次结构。如下：

            ```xml
            <activity
                android:name=".MainActivity"
                android:label="@string/app_name" >
                <intent-filter>
                    <action android:name="android.intent.action.MAIN" />
                    <category android:name="android.intent.category.LAUNCHER" />
                </intent-filter>
            </activity>
            <!-- 定义 ResultActivity 的父 Activity 为 MainActivity -->
            <activity
                android:name=".ResultActivity"
                android:parentActivityName=".MainActivity" />
                ...
            </activity>
                
            ```

        - 构建包含返回堆栈的 `PendingIntent`

            启动需要包含返回堆栈的 Activity，需要创建 `TaskStackBuilder` 的实例并调用 `addNextIntentWithParentStack()`，向其传递要启动的 Activity 的 `Intent`。

            只要每个 Activity 定义了父 Activity（如上文所述），就可以调用 `getPendingIntent()` 来接收包含整个返回堆栈的 `PendingIntent`：

            ```kotlin
            // 创建需要启动的 Activity 的 Intent
            val resultIntent = Intent(this, ResultActivity::class.java)
            val resultPendingIntent: PendingIntent? = TaskStackBuilder.create(this).run {
                // 通过 TaskStackBuilder 添加一个包含返回堆栈的 Intent
                addNextIntentWithParentStack(resultIntent)
                // 从 TaskStackBuilder 获取包含返回堆栈的 PendingIntent
                getPendingIntent(0, PendingIntent.FLAG_UPDATE_CURRENT)
            }
            ```

            如有必要，可以通过调用 `TaskStackBuilder.editIntentAt()` 取得堆栈中对应的 `Intent` 对象并添加参数，这样就可确保用户向上导航到返回堆栈中的 Activity 时，该 Activity 显示有意义的数据。

            

            然后，就可以像往常一样将 `PendingIntent` 传递到通知中：

            ```kotlin
            val builder = NotificationCompat.Builder(this, CHANNEL_ID).apply {
                setContentIntent(resultPendingIntent)
                ...
            }
            with(NotificationManagerCompat.from(this)) {
                notify(NOTIFICATION_ID, builder.build())
            }    
            ```

            

    - ==特殊 Activity 的 PendingIntent==

        由于从通知启动的“特殊 Activity”不需要返回堆栈，因此可以通过调用 `getActivity()` 创建 `PendingIntent`，但还应确保在清单中定义了相应的任务选项，如下：

        ```xml
        <activity
            android:name=".ResultActivity"
            android:launchMode="singleTask"
            android:taskAffinity="" 
            android:excludeFromRecents="true">
        </activity>
        ```

        -  `android:taskAffinity=""`：

            与将在代码中使用的 `FLAG_ACTIVITY_NEW_TASK` 标记结合使用，将此属性设置为空，可确保这类 Activity 不会进入应用的默认任务。具有应用默认亲和性的任何现有任务都不会受到影响。

        - `android:excludeFromRecents="true"`：

            用于从“最近”中排除新任务，以免用户意外返回它。

            

        这时就可通过调用 `getActivity()` 创建 `PendingIntent`：

        ```kotlin
        val notifyIntent = Intent(this, ResultActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK //设置为在新的空任务栈中启动
        }
        val notifyPendingIntent = PendingIntent.getActivity(
                this, 0, notifyIntent, PendingIntent.FLAG_UPDATE_CURRENT
        )
        ```

        然后，就可以像往常一样将 `PendingIntent` 传递到通知中：

        ```kotlin
        val builder = NotificationCompat.Builder(this, CHANNEL_ID).apply {
            setContentIntent(notifyPendingIntent)
            ...
        }
        with(NotificationManagerCompat.from(this)) {
            notify(NOTIFICATION_ID, builder.build())
        }   
        ```

    

2. 发送广播

    以下代码创建了一个发送广播的`PendingIntent`：

    ```kotlin
    val intent = Intent(Constants.ACTION_CLICK_INSTALL)
    val broadcastPendingIntent = PendingIntent.getBroadcast(context, 0, intent, 0)
    ```

    通过 `setContentIntent()` 传递给通知，即可在点击通知时发送响应的广播 Action 。

    

3. 启动 Service

    以下代码创建了一个启动服务的`PendingIntent`：

    ```kotlin
    val intent = Intent(context, AppUpdateService::class.java)
    intent.action = Constants.ACTION_DOWNLOAD_RESUME
    val servicePendingIntent = PendingIntent.getService(context, 0, intent, 0)
    ```

    通过 `setContentIntent()` 传递给通知，即可在点击通知时启动相应的服务 。



##### 6.3.3 添加操作按钮

一个通知最多可以提供三个操作按钮，让用户能够快速响应操作，例如暂停提醒，甚至回复短信。但这些操作不应该和[点按通知](#5.3.2 设置通知的点按操作)的效果相同。

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/notification-basic-action_2x.png" alt="img" style="zoom:50%;" />

<center>图 2. 带有一个操作按钮的通知</center>

如需添加操作按钮，请将 `addAction()` 传递给 `PendingIntent` 方法。这像在设置通知的默认点按操作一样，不同的是不会启动 Activity，而是可以完成各种其他任务，例如启动在后台执行作业的 `BroadcastReceiver`，这样该操作就不会干扰已经打开的应用。

例如，以下代码演示了如何向特定接收者发送广播：

```kotlin
val snoozeIntent = Intent(this, MyBroadcastReceiver::class.java).apply {
    action = ACTION_SNOOZE
    putExtra(EXTRA_NOTIFICATION_ID, 0)
}
val snoozePendingIntent: PendingIntent =
    PendingIntent.getBroadcast(this, 0, snoozeIntent, 0)
val builder = NotificationCompat.Builder(this, CHANNEL_ID)
        .setSmallIcon(R.drawable.notification_icon)
        .setContentTitle("My notification")
        .setContentText("Hello World!")
        .setPriority(NotificationCompat.PRIORITY_DEFAULT)
        .setContentIntent(pendingIntent)
        .addAction(R.drawable.ic_snooze, getString(R.string.snooze), snoozePendingIntent)
```



##### 6.3.4 添加直接回复操作

Android 7.0（API 级别 24）中引入的直接回复操作允许用户直接在通知中输入文本，然后会直接提交给应用，而不必打开 Activity。例如，可以让用户从通知内直接回复短信或更新任务列表。

<img src="https://raw.githubusercontent.com/Heart-Beats/Note-Pictures/main/images/reply-button_2x.png" alt="img" style="zoom:50%;" />

<center>图 3. 点按“回复”按钮会打开文本输入框</center>

直接回复操作在通知中显示为一个额外按钮，可打开文本输入。当用户完成输入后，系统会将文本回复附加到通知操作指定的 Intent，然后将 Intent 发送到应用中。



- 添加回复按钮

    1. 创建一个可添加到通知操作的`RemoteInput.Builder`实例。此类的构造函数接收一个字符串作为 `Intent ` 的 `action` ，之后，应用使用该键检索输入的文本

        ```kotlin
        private val KEY_TEXT_REPLY = "key_text_reply"  // 该 key 作为 Intent 的 action
        var replyLabel: String = resources.getString(R.string.reply_label)  // 该字符串作为操作按钮的显示文本
        var remoteInput: RemoteInput = RemoteInput.Builder(KEY_TEXT_REPLY).run {
            setLabel(replyLabel)
            build()
        }
        ```
        
    2. 为回复操作创建`PendingIntent`
    
        ```kotlin
        //创建一个 PendingIntent 作为回复操作的触发器
        var replyPendingIntent: PendingIntent =
            PendingIntent.getBroadcast(applicationContext,
                conversation.getConversationId(),
                getMessageReplyIntent(conversation.getConversationId()),
                PendingIntent.FLAG_UPDATE_CURRENT)
        ```
    
    3. 使用 `addRemoteInput()` 将 `RemoteInput` 对象附加到操作上
    
        ```java
        // 创建一个 action 并为其添加相关的回复操作（RemoteInput）
        NotificationCompat.Action action =
                new NotificationCompat.Action.Builder(R.drawable.ic_reply_icon, getString(R.string.label), 								replyPendingIntent)
                        .addRemoteInput(remoteInput)
                        .build();
        ```
    
    4. 给通知添加操作并发出
    
        ```java
        // 创建通知并添加 action
        Notification newMessageNotification = new Notification.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_message)
                .setContentTitle(getString(R.string.title))
                .setContentText(getString(R.string.content))
                .addAction(action)
                .build();
        
        // 发出通知
        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this);
        notificationManager.notify(notificationId, newMessageNotification);
        ```

