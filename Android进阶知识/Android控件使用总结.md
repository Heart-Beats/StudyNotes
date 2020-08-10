# Android 控件使用总结

[TOC]



### 1. SearchView的定制化：

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

### 2. 自定义对话框

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

    

    如果需要更改对话框的位置、大小等其他属性，就需要更改 Dialog 的 Window 的 属性，如下：

    ```java
    Window dialogWindow = dialog.getWindow();
    WindowManager.LayoutParams lp = dialogWindow.getAttributes();
    lp.width = (int) (getWindowManager().getDefaultDisplay().getWidth() * 0.75f);
    lp.height = WindowManager.LayoutParams.WRAP_CONTENT;
    // 通过lp设置的其他属性，比如位置、通过dimAmount更改背景透明度
    ...
    lp.gravity = Gravity.CENTER;
    
    //有时 dialog show()之后，更改才生效，百分百生效就放在 dialog.show() 之后
    dialogWindow.setAttributes(lp);
    ```

    

