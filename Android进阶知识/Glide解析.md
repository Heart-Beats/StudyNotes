## Glide解析（基于3.7.0版本）

[toc]



### 1. Glide的基本用法



#### 1.1 基本方式

- 添加依赖

    ```groovy
    dependencies {
        compile 'com.github.bumptech.glide:glide:3.7.0'
    }
    ```

- 加载图片

    ```kotlin
    Glide.with(this).load(url).into(imageView);
    ```

    - `with()`：方法可以接收Context、Activity 或者 Fragment 类型的参数
    - `load()`：指定待加载的图片资源，包括网络图片、本地图片、应用资源、二进制流、Uri对象等等。
    - `into()`：一般传入希望让图片显示在哪个 ImageView 上的实例，也能接收其他类型参数，支持更丰富的用法，属于高级技巧，后面会介绍。

以上就是最基本的使用方式了，主要就是三步：==`with()`  -> `load()` -> `into()`==



#### 1.2 扩展方式



##### 1.2.1 占位符

占位图就是指在图片的加载过程中，先显示一张临时的图片，等图片加载出来了再替换成要加载的图片。

```kotlin
Glide.with(this)
     .load(url)
     .placeholder(R.drawable.loading)
     .into(imageView);
```

以上代码就已实现占位符的功能，只需在 `load()` 和 `into()` 方法之间插入 `placeholder()` 方法，传入占位图片的资源 id 即可，实际上这也是 Glide 当中绝大多数 API 的用法，我们可以在其间任意添加想要的功能。



除了上面的加载占位图之外，还有一种==异常占位图==。异常占位图就是指，如果因为某些异常情况导致图片加载失败，比如说手机网络信号不好，这个时候就显示这张异常占位图。

修改 Glide 的加载部分代码如下：

```kotlin
Glide.with(this)
     .load(url)
     .placeholder(R.drawable.loading)
     .error(R.drawable.error)
     .diskCacheStrategy(DiskCacheStrategy.NONE) //禁用缓存
     .into(imageView);
```

只需串接一个 `error()` 方法就可以指定异常占位图了。



##### 1.2.2 指定图片格式

==使用 Glide 时内部会自动判断图片格式并加载==，也就是说，不管我们传入的是一张普通图片，还是一张GIF图片，Glide都会自动进行判断，并且可以正确地把它解析并展示出来。



但是如果我想指定图片的格式该怎么办呢？就比如说，我希望加载的这张图必须是一张静态图片，我不需要 Glide 自动帮我判断它到底是静图还是GIF图。对此，Glide 也是支持的，只需更改加载代码如下：

```KOTLIN
Glide.with(this)
     .load(url)
     .asBitmap()
     .placeholder(R.drawable.loading)
     .error(R.drawable.error)
     .diskCacheStrategy(DiskCacheStrategy.NONE)
     .into(imageView);
```

可以看到，只需串联一个 `asBitmap()` 方法即可实现只允许加载静态图片，若图片资源是 GIF 格式的，就会在界面上显示第一帧。



类似的，同样也可指定只加载动态图片：

```kotlin
Glide.with(this)
     .load(url)
     .asGif()
     .placeholder(R.drawable.loading)
     .error(R.drawable.error)
     .diskCacheStrategy(DiskCacheStrategy.NONE)
     .into(imageView);
```

`asGif()` 即可指定只允许加载动态图片，如果此时传入的是静态图片资源，则会加载出错。



##### 1.2.3 指定图片大小

实际上，使用 Glide 在绝大多数情况下我们都是不需要指定图片大小的。因为 ==Glide 会自动判断 ImageView 的大小，然后只将这么大的图片像素加载到内存当中，帮助我们节省内存开支==。

当然，这也没使用什么黑魔法，内部实现原理就是 Bitmap 的压缩，具体可见 [6.Android Bitmap解析.xmind](学习笔记\Android进阶知识\Android核心技术\6.Android Bitmap解析.xmind) 



不过，如果真的有这样的需求，必须给图片指定一个固定的大小，Glide 仍然是支持这个功能的。修改 Glide 加载部分的代码，如下所示：

```kotlin
Glide.with(this)
     .load(url)
     .placeholder(R.drawable.loading)
     .error(R.drawable.error)
     .diskCacheStrategy(DiskCacheStrategy.NONE)
     .override(100, 100)
     .into(imageView);
```

仍然非常简单，这里使用 `override()` 方法指定了一个图片的尺寸，也就是说，Glide 现在只会将图片加载成100*100像素的尺寸，而不会管你的 ImageView 的大小是多少了。



### 2. 源码角度理解 Glide 的执行流程

Glide 最基本的用法就是三步走：先 `with()`，再  `load()` ，最后 `into()`。那么我们开始一步步阅读这三步走的源码，先从 `with()` 看起。



#### 2.1 with()

with()方法是Glide类中的一组静态方法，它有好几个方法重载，我们来看一下Glide类中所有with()方法的方法重载：

```java
public class Glide {

    ...

    public static RequestManager with(Context context) {
        RequestManagerRetriever retriever = RequestManagerRetriever.get();
        return retriever.get(context);
    }

    public static RequestManager with(Activity activity) {
        RequestManagerRetriever retriever = RequestManagerRetriever.get();
        return retriever.get(activity);
    }

    public static RequestManager with(FragmentActivity activity) {
        RequestManagerRetriever retriever = RequestManagerRetriever.get();
        return retriever.get(activity);
    }

    @TargetApi(Build.VERSION_CODES.HONEYCOMB)
    public static RequestManager with(android.app.Fragment fragment) {
        RequestManagerRetriever retriever = RequestManagerRetriever.get();
        return retriever.get(fragment);
    }

    public static RequestManager with(Fragment fragment) {
        RequestManagerRetriever retriever = RequestManagerRetriever.get();
        return retriever.get(fragment);
    }
}
```

可以看到，每一个 `with()` 方法重载的代码都非常简单，都是先得到一个 RequestManagerRetriever 对象，然后再调用 RequestManagerRetriever 的实例 `get()` 方法，去获取 RequestManager 对象。



而 RequestManagerRetriever 的实例 `get()` 方法中的逻辑是什么样的呢？我们一起来看一看：

```java
public class RequestManagerRetriever implements Handler.Callback {

    private static final RequestManagerRetriever INSTANCE = new RequestManagerRetriever();

    private volatile RequestManager applicationManager;

    ...

    /**
     * Retrieves and returns the RequestManagerRetriever singleton.
     */
    public static RequestManagerRetriever get() {
        return INSTANCE;
    }

    private RequestManager getApplicationManager(Context context) {
        // Either an application context or we're on a background thread.
        if (applicationManager == null) {
            synchronized (this) {
                if (applicationManager == null) {
                    // Normally pause/resume is taken care of by the fragment we add to the fragment or activity.
                    // However, in this case since the manager attached to the application will not receive lifecycle
                    // events, we must force the manager to start resumed using ApplicationLifecycle.
                    applicationManager = new RequestManager(context.getApplicationContext(),
                            new ApplicationLifecycle(), new EmptyRequestManagerTreeNode());
                }
            }
        }
        return applicationManager;
    }

    public RequestManager get(Context context) {
        if (context == null) {
            throw new IllegalArgumentException("You cannot start a load on a null Context");
        } else if (Util.isOnMainThread() && !(context instanceof Application)) {
            if (context instanceof FragmentActivity) {
                return get((FragmentActivity) context);
            } else if (context instanceof Activity) {
                return get((Activity) context);
            } else if (context instanceof ContextWrapper) {
                return get(((ContextWrapper) context).getBaseContext());
            }
        }
        return getApplicationManager(context);
    }

    public RequestManager get(FragmentActivity activity) {
        if (Util.isOnBackgroundThread()) {
            return get(activity.getApplicationContext());
        } else {
            assertNotDestroyed(activity);
            FragmentManager fm = activity.getSupportFragmentManager();
            return supportFragmentGet(activity, fm);
        }
    }

    public RequestManager get(Fragment fragment) {
        if (fragment.getActivity() == null) {
            throw new IllegalArgumentException("You cannot start a load on a fragment before it is attached");
        }
        if (Util.isOnBackgroundThread()) {
            return get(fragment.getActivity().getApplicationContext());
        } else {
            FragmentManager fm = fragment.getChildFragmentManager();
            return supportFragmentGet(fragment.getActivity(), fm);
        }
    }

    @TargetApi(Build.VERSION_CODES.HONEYCOMB)
    public RequestManager get(Activity activity) {
        if (Util.isOnBackgroundThread() || Build.VERSION.SDK_INT < Build.VERSION_CODES.HONEYCOMB) {
            return get(activity.getApplicationContext());
        } else {
            assertNotDestroyed(activity);
            android.app.FragmentManager fm = activity.getFragmentManager();
            return fragmentGet(activity, fm);
        }
    }

    @TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    private static void assertNotDestroyed(Activity activity) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1 && activity.isDestroyed()) {
            throw new IllegalArgumentException("You cannot start a load for a destroyed activity");
        }
    }

    @TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    public RequestManager get(android.app.Fragment fragment) {
        if (fragment.getActivity() == null) {
            throw new IllegalArgumentException("You cannot start a load on a fragment before it is attached");
        }
        if (Util.isOnBackgroundThread() || Build.VERSION.SDK_INT < Build.VERSION_CODES.JELLY_BEAN_MR1) {
            return get(fragment.getActivity().getApplicationContext());
        } else {
            android.app.FragmentManager fm = fragment.getChildFragmentManager();
            return fragmentGet(fragment.getActivity(), fm);
        }
    }

    @TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    RequestManagerFragment getRequestManagerFragment(final android.app.FragmentManager fm) {
        RequestManagerFragment current = (RequestManagerFragment) fm.findFragmentByTag(FRAGMENT_TAG);
        if (current == null) {
            current = pendingRequestManagerFragments.get(fm);
            if (current == null) {
                current = new RequestManagerFragment();
                pendingRequestManagerFragments.put(fm, current);
                fm.beginTransaction().add(current, FRAGMENT_TAG).commitAllowingStateLoss();
                handler.obtainMessage(ID_REMOVE_FRAGMENT_MANAGER, fm).sendToTarget();
            }
        }
        return current;
    }

    @TargetApi(Build.VERSION_CODES.HONEYCOMB)
    RequestManager fragmentGet(Context context, android.app.FragmentManager fm) {
        RequestManagerFragment current = getRequestManagerFragment(fm);
        RequestManager requestManager = current.getRequestManager();
        if (requestManager == null) {
            requestManager = new RequestManager(context, current.getLifecycle(), current.getRequestManagerTreeNode());
            current.setRequestManager(requestManager);
        }
        return requestManager;
    }

    SupportRequestManagerFragment getSupportRequestManagerFragment(final FragmentManager fm) {
        SupportRequestManagerFragment current = (SupportRequestManagerFragment) fm.findFragmentByTag(FRAGMENT_TAG);
        if (current == null) {
            current = pendingSupportRequestManagerFragments.get(fm);
            if (current == null) {
                current = new SupportRequestManagerFragment();
                pendingSupportRequestManagerFragments.put(fm, current);
                fm.beginTransaction().add(current, FRAGMENT_TAG).commitAllowingStateLoss();
                handler.obtainMessage(ID_REMOVE_SUPPORT_FRAGMENT_MANAGER, fm).sendToTarget();
            }
        }
        return current;
    }

    RequestManager supportFragmentGet(Context context, FragmentManager fm) {
        SupportRequestManagerFragment current = getSupportRequestManagerFragment(fm);
        RequestManager requestManager = current.getRequestManager();
        if (requestManager == null) {
            requestManager = new RequestManager(context, current.getLifecycle(), current.getRequestManagerTreeNode());
            current.setRequestManager(requestManager);
        }
        return requestManager;
    }

    ...
}
```

RequestManagerRetriever 类中看似有很多个 `get()` 方法的重载，实际上只有两种情况而已，即传入 Application 类型的参数，和传入非 Application 类型的参数。

- Application 参数

    如果在 `Glide.with()` 方法中传入的是一个 Application 对象，就会在第44行调用 `getApplicationManager()` 方法来获取一个 RequestManager 对象。

    

    其实这是最简单的一种情况，因为 Application 对象的生命周期即应用程序的生命周期，因此 Glide 并不需要做什么特殊的处理，它自动就是和应用程序的生命周期是同步的，如果应用程序关闭的话，Glide 的加载也会同时终止。

    

- 非 Application 参数

    不管你在 `Glide.with()` 方法中传入的是 Activity、FragmentActivity、v4包下的 Fragment、还是app包下的 Fragment，最终的流程都是一样的，那就是会向当前的 Activity 当中添加一个隐藏的 Fragment。具体添加的逻辑是在上述代码的第117行和第141行，分别对应的 app 包和v4包下的两种 Fragment 的情况。

    

    那么这里为什么要添加一个隐藏的 Fragment 呢？因为 Glide 需要知道加载的生命周期。很简单的一个道理，如果你在某个 Activity上 正在加载着一张图片，结果图片还没加载出来，Activity 就被用户关掉了，那么图片还应该继续加载吗？当然不应该。可是 Glide 并没有办法知道 Activity 的生命周期，于是Glide 就使用了添加隐藏 Fragment 的这种小技巧，因为 Fragment 的生命周期和 Activity 是同步的，如果 Activity 被销毁了，Fragment 是可以监听到的，这样 Glide 就可以捕获这个事件并停止图片加载了。

    

    这里插入一个题外话：==androidX 下，可以通过 lifecycle 来给 Activity 和 Fragment 添加生命周期监听==。
    
    
    
    这里额外再提一句，从第48行代码可以看出，如果我们是在非主线程当中使用的 Glide，那么不管你是传入的 Activity 还是 Fragment，都会被强制当成Application 来处理。不过其实这就属于是在分析代码的细节了，本篇文章我们将会把目光主要放在Glide的主线工作流程上面，后面不会过多去分析这些细节方面的内容。



总体来说，第一个with()方法的源码还是比较好理解的。其实就是为了得到一个 RequestManager 对象而已，然后 Glide 会根据我们传入 `with()` 方法的参数来确定图片加载的生命周期，并没有什么特别复杂的逻辑。



#### 2.2 load()

由于 `with()` 方法返回的是一个 RequestManager 对象，那么很容易就能想到，`load()` 方法是在 RequestManager 类当中的，前面介绍过 Glide 是支持图片URL字符串、图片本地路径等等加载形式的，因此 RequestManager 中也有很多个 `load()` 方法的重载。



这里就只选其中一个加载图片URL字符串的 `load()` 方法来进行研究，RequestManager 类的简化代码如下所示：

```java
public class RequestManager implements LifecycleListener {

    ...

    /**
     * Returns a request builder to load the given {@link String}.
     * signature.
     *
     * @see #fromString()
     * @see #load(Object)
     *
     * @param string A file path, or a uri or url handled by {@link com.bumptech.glide.load.model.UriLoader}.
     */
    public DrawableTypeRequest<String> load(String string) {
        return (DrawableTypeRequest<String>) fromString().load(string);
    }

    /**
     * Returns a request builder that loads data from {@link String}s using an empty signature.
     *
     * <p>
     *     Note - this method caches data using only the given String as the cache key. If the data is a Uri outside of
     *     your control, or you otherwise expect the data represented by the given String to change without the String
     *     identifier changing, Consider using
     *     {@link GenericRequestBuilder#signature(Key)} to mixin a signature
     *     you create that identifies the data currently at the given String that will invalidate the cache if that data
     *     changes. Alternatively, using {@link DiskCacheStrategy#NONE} and/or
     *     {@link DrawableRequestBuilder#skipMemoryCache(boolean)} may be appropriate.
     * </p>
     *
     * @see #from(Class)
     * @see #load(String)
     */
    public DrawableTypeRequest<String> fromString() {
        return loadGeneric(String.class);
    }

    private <T> DrawableTypeRequest<T> loadGeneric(Class<T> modelClass) {
        ModelLoader<T, InputStream> streamModelLoader = Glide.buildStreamModelLoader(modelClass, context);
        ModelLoader<T, ParcelFileDescriptor> fileDescriptorModelLoader =
                Glide.buildFileDescriptorModelLoader(modelClass, context);
        if (modelClass != null && streamModelLoader == null && fileDescriptorModelLoader == null) {
            throw new IllegalArgumentException("Unknown type " + modelClass + ". You must provide a Model of a type for"
                    + " which there is a registered ModelLoader, if you are using a custom model, you must first call"
                    + " Glide#register with a ModelLoaderFactory for your custom model class");
        }
        return optionsApplier.apply(
                new DrawableTypeRequest<T>(modelClass, streamModelLoader, fileDescriptorModelLoader, context,
                        glide, requestTracker, lifecycle, optionsApplier));
    }

    ...

}
```

RequestManager 类的代码是非常多的，经过这样简化之后，看上去就比较清爽了。这里我们只探究加载图片URL字符串这一个 `load()` 方法的情况下，那么比较重要的方法就只剩下上述代码中的这三个方法。



可以看出，主要的工作都是在 `loadGeneric()` 方法中进行的，它分别调用了 `Glide.buildStreamModelLoader()` 方法和 `Glide.buildFileDescriptorModelLoader()` 方法来获得 `ModelLoader` 对象。

ModelLoader 对象是用于加载图片的，而我们给 `load()` 方法传入不同类型的参数，这里也会得到不同的 ModelLoader 对象。不过 `buildStreamModelLoader()` 方法内部的逻辑还是蛮复杂的，这里不作展开介绍，感兴趣自行研究。



最后我们可以看到，`loadGeneric()` 返回了一个 DrawableTypeRequest 对象，那么这个 DrawableTypeRequest 的作用是什么呢？我们来看下它的源码，如下所示：

```java
public class DrawableTypeRequest<ModelType> extends DrawableRequestBuilder<ModelType> implements DownloadOptions {
    private final ModelLoader<ModelType, InputStream> streamModelLoader;
    private final ModelLoader<ModelType, ParcelFileDescriptor> fileDescriptorModelLoader;
    private final RequestManager.OptionsApplier optionsApplier;

    private static <A, Z, R> FixedLoadProvider<A, ImageVideoWrapper, Z, R> buildProvider(Glide glide,
            ModelLoader<A, InputStream> streamModelLoader,
            ModelLoader<A, ParcelFileDescriptor> fileDescriptorModelLoader, Class<Z> resourceClass,
            Class<R> transcodedClass,
            ResourceTranscoder<Z, R> transcoder) {
        if (streamModelLoader == null && fileDescriptorModelLoader == null) {
            return null;
        }

        if (transcoder == null) {
            transcoder = glide.buildTranscoder(resourceClass, transcodedClass);
        }
        DataLoadProvider<ImageVideoWrapper, Z> dataLoadProvider = glide.buildDataProvider(ImageVideoWrapper.class,
                resourceClass);
        ImageVideoModelLoader<A> modelLoader = new ImageVideoModelLoader<A>(streamModelLoader,
                fileDescriptorModelLoader);
        return new FixedLoadProvider<A, ImageVideoWrapper, Z, R>(modelLoader, transcoder, dataLoadProvider);
    }

    DrawableTypeRequest(Class<ModelType> modelClass, ModelLoader<ModelType, InputStream> streamModelLoader,
            ModelLoader<ModelType, ParcelFileDescriptor> fileDescriptorModelLoader, Context context, Glide glide,
            RequestTracker requestTracker, Lifecycle lifecycle, RequestManager.OptionsApplier optionsApplier) {
        super(context, modelClass,
                buildProvider(glide, streamModelLoader, fileDescriptorModelLoader, GifBitmapWrapper.class,
                        GlideDrawable.class, null),
                glide, requestTracker, lifecycle);
        this.streamModelLoader = streamModelLoader;
        this.fileDescriptorModelLoader = fileDescriptorModelLoader;
        this.optionsApplier = optionsApplier;
    }

    /**
     * Attempts to always load the resource as a {@link android.graphics.Bitmap}, even if it could actually be animated.
     *
     * @return A new request builder for loading a {@link android.graphics.Bitmap}
     */
    public BitmapTypeRequest<ModelType> asBitmap() {
        return optionsApplier.apply(new BitmapTypeRequest<ModelType>(this, streamModelLoader,
                fileDescriptorModelLoader, optionsApplier));
    }

    /**
     * Attempts to always load the resource as a {@link com.bumptech.glide.load.resource.gif.GifDrawable}.
     * <p>
     *     If the underlying data is not a GIF, this will fail. As a result, this should only be used if the model
     *     represents an animated GIF and the caller wants to interact with the GIfDrawable directly. Normally using
     *     just an {@link DrawableTypeRequest} is sufficient because it will determine whether or
     *     not the given data represents an animated GIF and return the appropriate animated or not animated
     *     {@link android.graphics.drawable.Drawable} automatically.
     * </p>
     *
     * @return A new request builder for loading a {@link com.bumptech.glide.load.resource.gif.GifDrawable}.
     */
    public GifTypeRequest<ModelType> asGif() {
        return optionsApplier.apply(new GifTypeRequest<ModelType>(this, streamModelLoader, optionsApplier));
    }

    ...
}
```

这个类中的代码本身就不多，只是稍微做了一点简化。可以看到，最主要的就是它提供了 `asBitmap()` 和 `asGif()` 这两个方法，分别是用于强制指定加载静态图片和动态图片。从源码中可以看出，它们分别又创建了一个 BitmapTypeRequest 和 GifTypeRequest，如果没有进行强制指定的话，那默认就是使用 DrawableTypeRequest 。



刚才已经分析过了，`fromString()` 方法会返回一个 DrawableTypeRequest 对象，接下来会调用这个对象的 `load()` 方法，把图片的URL地址传进去。但是我们刚才看到了，DrawableTypeRequest 中并没有 `load()` 方法，那么很容易就能猜想到，`load()` 方法是在父类当中的。



DrawableTypeRequest 的父类是 DrawableRequestBuilder，我们来看下这个类的源码：

```java
public class DrawableRequestBuilder<ModelType>
        extends GenericRequestBuilder<ModelType, ImageVideoWrapper, GifBitmapWrapper, GlideDrawable>
        implements BitmapOptions, DrawableOptions {

    DrawableRequestBuilder(Context context, Class<ModelType> modelClass,
            LoadProvider<ModelType, ImageVideoWrapper, GifBitmapWrapper, GlideDrawable> loadProvider, Glide glide,
            RequestTracker requestTracker, Lifecycle lifecycle) {
        super(context, modelClass, loadProvider, GlideDrawable.class, glide, requestTracker, lifecycle);
        // Default to animating.
        crossFade();
    }

    public DrawableRequestBuilder<ModelType> thumbnail(
            DrawableRequestBuilder<?> thumbnailRequest) {
        super.thumbnail(thumbnailRequest);
        return this;
    }

    @Override
    public DrawableRequestBuilder<ModelType> thumbnail(
            GenericRequestBuilder<?, ?, ?, GlideDrawable> thumbnailRequest) {
        super.thumbnail(thumbnailRequest);
        return this;
    }

    @Override
    public DrawableRequestBuilder<ModelType> thumbnail(float sizeMultiplier) {
        super.thumbnail(sizeMultiplier);
        return this;
    }

    @Override
    public DrawableRequestBuilder<ModelType> sizeMultiplier(float sizeMultiplier) {
        super.sizeMultiplier(sizeMultiplier);
        return this;
    }

    @Override
    public DrawableRequestBuilder<ModelType> decoder(ResourceDecoder<ImageVideoWrapper, GifBitmapWrapper> decoder) {
        super.decoder(decoder);
        return this;
    }

    @Override
    public DrawableRequestBuilder<ModelType> cacheDecoder(ResourceDecoder<File, GifBitmapWrapper> cacheDecoder) {
        super.cacheDecoder(cacheDecoder);
        return this;
    }

    @Override
    public DrawableRequestBuilder<ModelType> encoder(ResourceEncoder<GifBitmapWrapper> encoder) {
        super.encoder(encoder);
        return this;
    }

    @Override
    public DrawableRequestBuilder<ModelType> priority(Priority priority) {
        super.priority(priority);
        return this;
    }

    public DrawableRequestBuilder<ModelType> transform(BitmapTransformation... transformations) {
        return bitmapTransform(transformations);
    }

    public DrawableRequestBuilder<ModelType> centerCrop() {
        return transform(glide.getDrawableCenterCrop());
    }

    public DrawableRequestBuilder<ModelType> fitCenter() {
        return transform(glide.getDrawableFitCenter());
    }

    public DrawableRequestBuilder<ModelType> bitmapTransform(Transformation<Bitmap>... bitmapTransformations) {
        GifBitmapWrapperTransformation[] transformations =
                new GifBitmapWrapperTransformation[bitmapTransformations.length];
        for (int i = 0; i < bitmapTransformations.length; i++) {
            transformations[i] = new GifBitmapWrapperTransformation(glide.getBitmapPool(), bitmapTransformations[i]);
        }
        return transform(transformations);
    }

    @Override
    public DrawableRequestBuilder<ModelType> transform(Transformation<GifBitmapWrapper>... transformation) {
        super.transform(transformation);
        return this;
    }

    @Override
    public DrawableRequestBuilder<ModelType> transcoder(
            ResourceTranscoder<GifBitmapWrapper, GlideDrawable> transcoder) {
        super.transcoder(transcoder);
        return this;
    }

    public final DrawableRequestBuilder<ModelType> crossFade() {
        super.animate(new DrawableCrossFadeFactory<GlideDrawable>());
        return this;
    }

    public DrawableRequestBuilder<ModelType> crossFade(int duration) {
        super.animate(new DrawableCrossFadeFactory<GlideDrawable>(duration));
        return this;
    }

    public DrawableRequestBuilder<ModelType> crossFade(int animationId, int duration) {
        super.animate(new DrawableCrossFadeFactory<GlideDrawable>(context, animationId,
                duration));
        return this;
    }

    @Override
    public DrawableRequestBuilder<ModelType> dontAnimate() {
        super.dontAnimate();
        return this;
    }

    @Override
    public DrawableRequestBuilder<ModelType> animate(ViewPropertyAnimation.Animator animator) {
        super.animate(animator);
        return this;
    }

    @Override
    public DrawableRequestBuilder<ModelType> animate(int animationId) {
        super.animate(animationId);
        return this;
    }

    @Override
    public DrawableRequestBuilder<ModelType> placeholder(int resourceId) {
        super.placeholder(resourceId);
        return this;
    }

    @Override
    public DrawableRequestBuilder<ModelType> placeholder(Drawable drawable) {
        super.placeholder(drawable);
        return this;
    }

    @Override
    public DrawableRequestBuilder<ModelType> fallback(Drawable drawable) {
        super.fallback(drawable);
        return this;
    }

    @Override
    public DrawableRequestBuilder<ModelType> fallback(int resourceId) {
        super.fallback(resourceId);
        return this;
    }

    @Override
    public DrawableRequestBuilder<ModelType> error(int resourceId) {
        super.error(resourceId);
        return this;
    }

    @Override
    public DrawableRequestBuilder<ModelType> error(Drawable drawable) {
        super.error(drawable);
        return this;
    }

    @Override
    public DrawableRequestBuilder<ModelType> listener(
            RequestListener<? super ModelType, GlideDrawable> requestListener) {
        super.listener(requestListener);
        return this;
    }
    @Override
    public DrawableRequestBuilder<ModelType> diskCacheStrategy(DiskCacheStrategy strategy) {
        super.diskCacheStrategy(strategy);
        return this;
    }

    @Override
    public DrawableRequestBuilder<ModelType> skipMemoryCache(boolean skip) {
        super.skipMemoryCache(skip);
        return this;
    }

    @Override
    public DrawableRequestBuilder<ModelType> override(int width, int height) {
        super.override(width, height);
        return this;
    }

    @Override
    public DrawableRequestBuilder<ModelType> sourceEncoder(Encoder<ImageVideoWrapper> sourceEncoder) {
        super.sourceEncoder(sourceEncoder);
        return this;
    }

    @Override
    public DrawableRequestBuilder<ModelType> dontTransform() {
        super.dontTransform();
        return this;
    }

    @Override
    public DrawableRequestBuilder<ModelType> signature(Key signature) {
        super.signature(signature);
        return this;
    }

    @Override
    public DrawableRequestBuilder<ModelType> load(ModelType model) {
        super.load(model);
        return this;
    }

    @Override
    public DrawableRequestBuilder<ModelType> clone() {
        return (DrawableRequestBuilder<ModelType>) super.clone();
    }

    @Override
    public Target<GlideDrawable> into(ImageView view) {
        return super.into(view);
    }

    @Override
    void applyFitCenter() {
        fitCenter();
    }

    @Override
    void applyCenterCrop() {
        centerCrop();
    }
```

DrawableRequestBuilder 中有很多个方法，这些方法其实就是 Glide 绝大多数的 API 了。里面有不少我们在上篇文章中已经用过了，比如说 `placeholder()` 方法、`error()` 方法、`diskCacheStrategy()` 方法、`override()` 方法等。当然还有很多暂时还没用到的API，我们会在后面的当中学习。



到这里，第二步load()方法也就分析结束了。为什么呢？因为你会发现 DrawableRequestBuilder 类中有一个 `into()` 方法（上述代码第220行），也就是说，最终 `load()` 方法返回的其实就是一个DrawableTypeRequest 对象。那么接下来我们就要进行第三步了，分析 `into()` 方法中的逻辑。



#### 2.3 into()

如果说前面两步都是在准备开胃小菜的话，那么现在终于要进入主菜了，因为 `into()` 方法也是整个 Glide 图片加载流程中逻辑最复杂的地方。

从刚才的代码来看，很显然 `into()` 方法的具体逻辑都是在 DrawableRequestBuilder 的父类当中了。



DrawableRequestBuilder 的父类是 GenericRequestBuilder，我们来看一下 GenericRequestBuilder 类中的 `into()` 方法，如下所示：

```java
public Target<TranscodeType> into(ImageView view) {
    Util.assertMainThread();
    if (view == null) {
        throw new IllegalArgumentException("You must pass in a non null View");
    }
    if (!isTransformationSet && view.getScaleType() != null) {
        switch (view.getScaleType()) {
            case CENTER_CROP:
                applyCenterCrop();
                break;
            case FIT_CENTER:
            case FIT_START:
            case FIT_END:
                applyFitCenter();
                break;
            //$CASES-OMITTED$
            default:
                // Do nothing.
        }
    }
    return into(glide.buildImageViewTarget(view, transcodeClass));
}
```

