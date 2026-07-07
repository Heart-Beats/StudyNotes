// ════════════════════════════════════════════════
//  THEME SYSTEM  (auto → light → dark cycle)

// ════════════════════════════════════════════════
(function initTheme(){
  const saved = localStorage.getItem('sn-theme') || 'auto';
  applyTheme(saved);

  // Listen for system preference changes (only when "auto")
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(){
    if(localStorage.getItem('sn-theme')==='auto') applyTheme('auto');
  });
})();

function applyTheme(mode){
  const html = document.documentElement;
  if(mode==='auto'){
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', sysDark ? 'dark' : 'light');
  } else {
    html.setAttribute('data-theme', mode);
  }
  localStorage.setItem('sn-theme', mode);
  updateThemeIcon(mode);
  // Re-init mermaid for current theme and re-render if mermaid diagrams exist
  if(typeof mermaid!=='undefined'){
    initMermaid();
    const existingMermaid=document.querySelectorAll('.mermaid-wrap .mermaid');
    if(existingMermaid.length){
      // Reset already-rendered SVGs so mermaid.run re-renders them
      existingMermaid.forEach(el=>{el.removeAttribute('data-processed');});
      mermaid.run({querySelector:'.mermaid-wrap .mermaid'}).catch(()=>{});
    }
  }
}

function cycleTheme(){
  const map = {auto:'light', light:'dark', dark:'auto'};
  const cur = localStorage.getItem('sn-theme')||'auto';
  applyTheme(map[cur]||'auto');
}

function updateThemeIcon(mode){
  const sun = document.getElementById('themeIconSun');
  const moon = document.getElementById('themeIconMoon');
  const btn = document.getElementById('themeBtn');
  if(!sun||!moon||!btn) return;
  if(mode==='dark'){
    sun.style.display='none'; moon.style.display='block';
    btn.title='浅色模式';
  } else if(mode==='light'){
    sun.style.display='block'; moon.style.display='none';
    btn.title='夜间模式';
  } else {
    // auto
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    sun.style.display=sysDark?'none':'block';
    moon.style.display=sysDark?'block':'none';
    btn.title='自动 · 点击切换';
  }
}

function getThemeMode(){ return localStorage.getItem('sn-theme')||'auto'; }

// ════════════════════════════════════════════════
//  MERMAID DIAGRAM RENDERER
// ════════════════════════════════════════════════
function initMermaid(){
  if(typeof mermaid==='undefined') return;
  const html=document.documentElement;
  const isDark=html.getAttribute('data-theme')==='dark';
  mermaid.initialize({
    startOnLoad:false,
    theme:'base',
    themeVariables:{
      primaryColor: isDark?'#334155':'#e2e8f0',
      primaryTextColor: isDark?'#e2e8f0':'#1e293b',
      primaryBorderColor: isDark?'#475569':'#94a3b8',
      lineColor: isDark?'#64748b':'#64748b',
      secondaryColor: isDark?'#1e293b':'#f1f5f9',
      tertiaryColor: isDark?'#0f172a':'#f8fafc',
      fontSize:'14px'
    }
  });
}
initMermaid();

async function renderMermaid(){
  if(typeof mermaid==='undefined') return;
  const root=document.getElementById('pageRoot');
  if(!root) return;
  // Find mermaid code blocks that marked.js rendered as <code class="language-mermaid">
  const mermaidBlocks=root.querySelectorAll('code.language-mermaid');
  if(!mermaidBlocks.length) return;
  for(const block of mermaidBlocks){
    const pre=block.parentElement;
    const src=block.textContent;
    // Create a mermaid container
    const container=document.createElement('div');
    container.className='mermaid-wrap';
    container.innerHTML=`<div class="mermaid">${hEsc(src)}</div>`;
    pre.replaceWith(container);
  }
  try {
    // Re-init to pick up current theme
    initMermaid();
    await mermaid.run({querySelector:'.mermaid'});
  } catch(e){
    console.warn('mermaid render error:', e);
    // Fallback: show raw code in a pre block
    document.querySelectorAll('.mermaid-wrap .mermaid').forEach(el=>{
      if(el.querySelector('svg')) return; // already rendered
      const src=el.textContent;
      el.outerHTML=`<pre class="mermaid-fallback"><code>${hEsc(src)}</code></pre>`;
    });
  }
}

// ════════════════════════════════════════════════
//  CATEGORY DEFINITIONS
// ════════════════════════════════════════════════
const CAT_DEF = {
  android:      {n:'Android 开发',     emoji:'🤖', color:'#10b981', desc:'JNI、WebView、Gradle、动画、混淆、VPN、键值对存储等基础开发'},
  'android-adv':{n:'Android 进阶',     emoji:'⚡', color:'#059669', desc:'架构模式、组件化总结、Service/AIDL、插件化、App启动优化'},
  flutter:      {n:'Flutter',          emoji:'🦋', color:'#3b82f6', desc:'Flutter 全栈开发，从基础到路由设计，共 14 篇系列教程'},
  'third-lib':  {n:'三方库解析',       emoji:'📦', color:'#8b5cf6', desc:'Glide、Hilt、Shadow、Xposed 源码解析'},
  kotlin:       {n:'Kotlin',           emoji:'🟣', color:'#f59e0b', desc:'Kotlin 基础、Flow、类型推断、协程、Compose作用域'},
  groovy:       {n:'Groovy',           emoji:'🔧', color:'#16a34a', desc:'Groovy 语言相关'},
  python:       {n:'Python',           emoji:'🐍', color:'#3b82f6', desc:'Python 语言相关'},
  rust:         {n:'Rust',             emoji:'🦀', color:'#ef4444', desc:'Rust 基础入门与开发环境搭建'},
  algorithm:    {n:'算法与数据结构',   emoji:'🧮', color:'#6366f1', desc:'数据结构、排序、动态规划、LeetCode 高频题'},
  ai:           {n:'AI 工具',          emoji:'✨', color:'#06b6d4', desc:'AI 使用说明书、Claude配置、VibeCoding、MCP、调试心法等'},
  web:          {n:'Web 开发',         emoji:'🌐', color:'#ec4899', desc:'Ajax、DOM、jQuery、JavaScript 核心知识'},
  network:      {n:'计算机网络',       emoji:'🔌', color:'#6366f1', desc:'Netty 学习与 Socket 编程'},
  crypto:       {n:'密码学',           emoji:'🔐', color:'#f97316', desc:'国密算法介绍与应用'},
  ubuntu:       {n:'运维 / Ubuntu',    emoji:'🐧', color:'#f97316', desc:'GitLab、Docker、Maven 私服运维实践'},
  foundation:   {n:'编程基础',         emoji:'💡', color:'#64748b', desc:'异或运算、浮点数等底层编程知识'},
  root:         {n:'其他',             emoji:'📋', color:'#64748b', desc:'Java 8、Git、MarkDown、信息论、历史朝代歌等杂项'},
};
const CAT_ORDER = ['android','android-adv','flutter','third-lib','kotlin','groovy','python','rust','algorithm','ai','web','network','crypto','ubuntu','foundation','root'];

const FALLBACK_ART = [
  {t:'Java 8 新特性',c:'root',p:'Java%208%20%E6%96%B0%E7%89%B9%E6%80%A7.md'},
  {t:'MarkDown绘制时序图',c:'root',p:'MarkDown%E7%BB%98%E5%88%B6%E6%97%B6%E5%BA%8F%E5%9B%BE.md'},
  {t:'git相关',c:'root',p:'git%E7%9B%B8%E5%85%B3.md'},
  {t:'git规范',c:'root',p:'git%E8%A7%84%E8%8C%83.md'},
  {t:'使用 Gradle 插件上传组件至 MavenCentral',c:'root',p:'%E4%BD%BF%E7%94%A8%20Gradle%20%E6%8F%92%E4%BB%B6%E4%B8%8A%E4%BC%A0%E7%BB%84%E4%BB%B6%E8%87%B3%20MavenCentral.md'},
  {t:'信息论称球',c:'root',p:'%E4%BF%A1%E6%81%AF%E8%AE%BA%E7%A7%B0%E7%90%83.md'},
  {t:'历史朝代歌',c:'root',p:'%E5%8E%86%E5%8F%B2%E6%9C%9D%E4%BB%A3%E6%AD%8C.md'},
  {t:'Terminal 终端入门',c:'ai',p:'AI%2FTerminal%20%E7%BB%88%E7%AB%AF%E5%85%A5%E9%97%A8.md'},
  {t:'1. AI 使用说明书',c:'ai',p:'AI%2FAI%20%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E%E4%B9%A6%2F1.%20AI%20%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E%E4%B9%A6.md'},
  {t:'2. Claude 安装与推荐配置',c:'ai',p:'AI%2FAI%20%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E%E4%B9%A6%2F2.%20Claude%20%E5%AE%89%E8%A3%85%E4%B8%8E%E6%8E%A8%E8%8D%90%E9%85%8D%E7%BD%AE.md'},
  {t:'3. AI 编程的经济学',c:'ai',p:'AI%2FAI%20%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E%E4%B9%A6%2F3.%20AI%20%E7%BC%96%E7%A8%8B%E7%9A%84%E7%BB%8F%E6%B5%8E%E5%AD%A6.md'},
  {t:'4.  VibeCoding 工作流',c:'ai',p:'AI%2FAI%20%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E%E4%B9%A6%2F4.%20%20VibeCoding%20%E5%B7%A5%E4%BD%9C%E6%B5%81.md'},
  {t:'5. MCP、插件与 Skills',c:'ai',p:'AI%2FAI%20%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E%E4%B9%A6%2F5.%20MCP%E3%80%81%E6%8F%92%E4%BB%B6%E4%B8%8E%20Skills.md'},
  {t:'6. 项目规则配置',c:'ai',p:'AI%2FAI%20%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E%E4%B9%A6%2F6.%20%E9%A1%B9%E7%9B%AE%E8%A7%84%E5%88%99%E9%85%8D%E7%BD%AE.md'},
  {t:'7. 高效调试心法',c:'ai',p:'AI%2FAI%20%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E%E4%B9%A6%2F7.%20%E9%AB%98%E6%95%88%E8%B0%83%E8%AF%95%E5%BF%83%E6%B3%95.md'},
  {t:'Android 的键值对存储有没有最优解',c:'android',p:'Android%2FAndroid%20%E7%9A%84%E9%94%AE%E5%80%BC%E5%AF%B9%E5%AD%98%E5%82%A8%E6%9C%89%E6%B2%A1%E6%9C%89%E6%9C%80%E4%BC%98%E8%A7%A3.md'},
  {t:'Gradle 在 Android 中的使用',c:'android',p:'Android%2FGradle%20%E5%9C%A8%20Android%20%E4%B8%AD%E7%9A%84%E4%BD%BF%E7%94%A8.md'},
  {t:'JNI 的使用',c:'android',p:'Android%2FJNI%20%E7%9A%84%E4%BD%BF%E7%94%A8.md'},
  {t:'JSON介绍及Android解析方法',c:'android',p:'Android%2FJSON%E4%BB%8B%E7%BB%8D%E5%8F%8AAndroid%E8%A7%A3%E6%9E%90%E6%96%B9%E6%B3%95.md'},
  {t:'SSL VPN 开发',c:'android',p:'Android%2FSSL%20VPN%20%E5%BC%80%E5%8F%91.md'},
  {t:'WebView 与 JavaScript 的交互',c:'android',p:'Android%2FWebView%20%E4%B8%8E%20JavaScript%20%E7%9A%84%E4%BA%A4%E4%BA%92.md'},
  {t:'代码混淆(ProGuard)',c:'android',p:'Android%2F%E4%BB%A3%E7%A0%81%E6%B7%B7%E6%B7%86%28ProGuard%29.md'},
  {t:'动画基础',c:'android',p:'Android%2F%E5%8A%A8%E7%94%BB%E5%9F%BA%E7%A1%80.md'},
  {t:'Android架构模式',c:'android-adv',p:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FAndroid%E6%9E%B6%E6%9E%84%E6%A8%A1%E5%BC%8F.md'},
  {t:'Android组件使用总结',c:'android-adv',p:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FAndroid%E7%BB%84%E4%BB%B6%E4%BD%BF%E7%94%A8%E6%80%BB%E7%BB%93.md'},
  {t:'App 启动背景优化',c:'android-adv',p:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FApp%20%E5%90%AF%E5%8A%A8%E8%83%8C%E6%99%AF%E4%BC%98%E5%8C%96.md'},
  {t:'Service 与 AIDL 的使用',c:'android-adv',p:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FService%20%E4%B8%8E%20AIDL%20%E7%9A%84%E4%BD%BF%E7%94%A8.md'},
  {t:'插件化实现原理',c:'android-adv',p:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2F%E6%8F%92%E4%BB%B6%E5%8C%96%E5%AE%9E%E7%8E%B0%E5%8E%9F%E7%90%86.md'},
  {t:'1.Flutter中代码是如何执行和运行',c:'flutter',p:'Android%2FFlutter%E7%9B%B8%E5%85%B3%2F1.Flutter%E4%B8%AD%E4%BB%A3%E7%A0%81%E6%98%AF%E5%A6%82%E4%BD%95%E6%89%A7%E8%A1%8C%E5%92%8C%E8%BF%90%E8%A1%8C.md'},
  {t:'10.Flutter导航栏的设计',c:'flutter',p:'Android%2FFlutter%E7%9B%B8%E5%85%B3%2F10.Flutter%E5%AF%BC%E8%88%AA%E6%A0%8F%E7%9A%84%E8%AE%BE%E8%AE%A1.md'},
  {t:'11.Flutter中列表样式',c:'flutter',p:'Android%2FFlutter%E7%9B%B8%E5%85%B3%2F11.Flutter%E4%B8%AD%E5%88%97%E8%A1%A8%E6%A0%B7%E5%BC%8F.md'},
  {t:'12.Flutter中的刷新加载',c:'flutter',p:'Android%2FFlutter%E7%9B%B8%E5%85%B3%2F12.Flutter%E4%B8%AD%E7%9A%84%E5%88%B7%E6%96%B0%E5%8A%A0%E8%BD%BD.md'},
  {t:'13.Flutter中的红点设计',c:'flutter',p:'Android%2FFlutter%E7%9B%B8%E5%85%B3%2F13.Flutter%E4%B8%AD%E7%9A%84%E7%BA%A2%E7%82%B9%E8%AE%BE%E8%AE%A1.md'},
  {t:'14.Flutter中常见的网络协议',c:'flutter',p:'Android%2FFlutter%E7%9B%B8%E5%85%B3%2F14.Flutter%E4%B8%AD%E5%B8%B8%E8%A7%81%E7%9A%84%E7%BD%91%E7%BB%9C%E5%8D%8F%E8%AE%AE.md'},
  {t:'2.Flutter环境搭建及运行',c:'flutter',p:'Android%2FFlutter%E7%9B%B8%E5%85%B3%2F2.Flutter%E7%8E%AF%E5%A2%83%E6%90%AD%E5%BB%BA%E5%8F%8A%E8%BF%90%E8%A1%8C.md'},
  {t:'3.Flutter中的代码规范',c:'flutter',p:'Android%2FFlutter%E7%9B%B8%E5%85%B3%2F3.Flutter%E4%B8%AD%E7%9A%84%E4%BB%A3%E7%A0%81%E8%A7%84%E8%8C%83.md'},
  {t:'4.Flutter的生命周期以及应用场景',c:'flutter',p:'Android%2FFlutter%E7%9B%B8%E5%85%B3%2F4.Flutter%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E4%BB%A5%E5%8F%8A%E5%BA%94%E7%94%A8%E5%9C%BA%E6%99%AF.md'},
  {t:'5.Flutter的有无状态组件',c:'flutter',p:'Android%2FFlutter%E7%9B%B8%E5%85%B3%2F5.Flutter%E7%9A%84%E6%9C%89%E6%97%A0%E7%8A%B6%E6%80%81%E7%BB%84%E4%BB%B6.md'},
  {t:'6.Flutter状态管理及对比选型',c:'flutter',p:'Android%2FFlutter%E7%9B%B8%E5%85%B3%2F6.Flutter%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86%E5%8F%8A%E5%AF%B9%E6%AF%94%E9%80%89%E5%9E%8B.md'},
  {t:'7.Flutter应用单元测试',c:'flutter',p:'Android%2FFlutter%E7%9B%B8%E5%85%B3%2F7.Flutter%E5%BA%94%E7%94%A8%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95.md'},
  {t:'8.Flutter项目脚手架',c:'flutter',p:'Android%2FFlutter%E7%9B%B8%E5%85%B3%2F8.Flutter%E9%A1%B9%E7%9B%AE%E8%84%9A%E6%89%8B%E6%9E%B6.md'},
  {t:'9.Flutter路由设计',c:'flutter',p:'Android%2FFlutter%E7%9B%B8%E5%85%B3%2F9.Flutter%E8%B7%AF%E7%94%B1%E8%AE%BE%E8%AE%A1.md'},
  {t:'Glide解析',c:'third-lib',p:'Android%2F%E4%B8%89%E6%96%B9%E5%BA%93%2FGlide%E8%A7%A3%E6%9E%90.md'},
  {t:'Hilt学习',c:'third-lib',p:'Android%2F%E4%B8%89%E6%96%B9%E5%BA%93%2FHilt%E5%AD%A6%E4%B9%A0.md'},
  {t:'Shadow 框架的使用',c:'third-lib',p:'Android%2F%E4%B8%89%E6%96%B9%E5%BA%93%2FShadow%20%E6%A1%86%E6%9E%B6%E7%9A%84%E4%BD%BF%E7%94%A8.md'},
  {t:'Xposed开发教程',c:'third-lib',p:'Android%2F%E4%B8%89%E6%96%B9%E5%BA%93%2FXposed%E5%BC%80%E5%8F%91%E6%95%99%E7%A8%8B.md'},
  {t:'Docker 搭建 maven 私服',c:'ubuntu',p:'Ubuntu%2FDocker%20%E6%90%AD%E5%BB%BA%20maven%20%E7%A7%81%E6%9C%8D.md'},
  {t:'Docker搭建Gitlab服务器',c:'ubuntu',p:'Ubuntu%2FDocker%E6%90%AD%E5%BB%BAGitlab%E6%9C%8D%E5%8A%A1%E5%99%A8.md'},
  {t:'Gitlab 的使用',c:'ubuntu',p:'Ubuntu%2FGitlab%20%E7%9A%84%E4%BD%BF%E7%94%A8.md'},
  {t:'Ajax基础知识点',c:'web',p:'Web%E7%9B%B8%E5%85%B3%2FAjax%E5%9F%BA%E7%A1%80%E7%9F%A5%E8%AF%86%E7%82%B9.md'},
  {t:'JS中的小知识点',c:'web',p:'Web%E7%9B%B8%E5%85%B3%2FJS%E4%B8%AD%E7%9A%84%E5%B0%8F%E7%9F%A5%E8%AF%86%E7%82%B9.md'},
  {t:'JavaScript DOM编程',c:'web',p:'Web%E7%9B%B8%E5%85%B3%2FJavaScript%20DOM%E7%BC%96%E7%A8%8B.md'},
  {t:'jQuery基础知识点',c:'web',p:'Web%E7%9B%B8%E5%85%B3%2FjQuery%E5%9F%BA%E7%A1%80%E7%9F%A5%E8%AF%86%E7%82%B9.md'},
  {t:'国密算法介绍',c:'crypto',p:'%E5%AF%86%E7%A0%81%E5%AD%A6%2F%E5%9B%BD%E5%AF%86%E7%AE%97%E6%B3%95%E4%BB%8B%E7%BB%8D.md'},
  {t:'彩蛋：算法面试冲刺',c:'algorithm',p:'%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%B8%8E%E7%AE%97%E6%B3%95%2F%E5%BD%A9%E8%9B%8B%EF%BC%9A%E7%AE%97%E6%B3%95%E9%9D%A2%E8%AF%95%E5%86%B2%E5%88%BA.md'},
  {t:'1.常用数据结构',c:'algorithm',p:'%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%B8%8E%E7%AE%97%E6%B3%95%2F1.%20%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%2F1.%E5%B8%B8%E7%94%A8%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84.md'},
  {t:'2.高级数据结构',c:'algorithm',p:'%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%B8%8E%E7%AE%97%E6%B3%95%2F1.%20%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%2F2.%E9%AB%98%E7%BA%A7%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84.md'},
  {t:'1.排序',c:'algorithm',p:'%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%B8%8E%E7%AE%97%E6%B3%95%2F2.%20%E5%B8%B8%E7%94%A8%E7%AE%97%E6%B3%95%2F1.%E6%8E%92%E5%BA%8F.md'},
  {t:'2.递归与回溯',c:'algorithm',p:'%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%B8%8E%E7%AE%97%E6%B3%95%2F2.%20%E5%B8%B8%E7%94%A8%E7%AE%97%E6%B3%95%2F2.%E9%80%92%E5%BD%92%E4%B8%8E%E5%9B%9E%E6%BA%AF.md'},
  {t:'3.深度与广度优先搜索',c:'algorithm',p:'%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%B8%8E%E7%AE%97%E6%B3%95%2F2.%20%E5%B8%B8%E7%94%A8%E7%AE%97%E6%B3%95%2F3.%E6%B7%B1%E5%BA%A6%E4%B8%8E%E5%B9%BF%E5%BA%A6%E4%BC%98%E5%85%88%E6%90%9C%E7%B4%A2.md'},
  {t:'4.动态规划',c:'algorithm',p:'%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%B8%8E%E7%AE%97%E6%B3%95%2F2.%20%E5%B8%B8%E7%94%A8%E7%AE%97%E6%B3%95%2F4.%E5%8A%A8%E6%80%81%E8%A7%84%E5%88%92.md'},
  {t:'5.二分搜索与贪婪',c:'algorithm',p:'%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%B8%8E%E7%AE%97%E6%B3%95%2F2.%20%E5%B8%B8%E7%94%A8%E7%AE%97%E6%B3%95%2F5.%E4%BA%8C%E5%88%86%E6%90%9C%E7%B4%A2%E4%B8%8E%E8%B4%AA%E5%A9%AA.md'},
  {t:'1.高频真题解析Ⅰ',c:'algorithm',p:'%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%B8%8E%E7%AE%97%E6%B3%95%2F3.%20LeetCode%E9%AB%98%E9%A2%91%E7%9C%9F%E9%A2%98%E8%A7%A3%E6%9E%90%2F1.%E9%AB%98%E9%A2%91%E7%9C%9F%E9%A2%98%E8%A7%A3%E6%9E%90%E2%85%A0.md'},
  {t:'2.高频真题解析Ⅱ',c:'algorithm',p:'%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%B8%8E%E7%AE%97%E6%B3%95%2F3.%20LeetCode%E9%AB%98%E9%A2%91%E7%9C%9F%E9%A2%98%E8%A7%A3%E6%9E%90%2F2.%E9%AB%98%E9%A2%91%E7%9C%9F%E9%A2%98%E8%A7%A3%E6%9E%90%E2%85%A1.md'},
  {t:'3.高频真题解析Ⅲ（上）',c:'algorithm',p:'%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%B8%8E%E7%AE%97%E6%B3%95%2F3.%20LeetCode%E9%AB%98%E9%A2%91%E7%9C%9F%E9%A2%98%E8%A7%A3%E6%9E%90%2F3.%E9%AB%98%E9%A2%91%E7%9C%9F%E9%A2%98%E8%A7%A3%E6%9E%90%E2%85%A2%EF%BC%88%E4%B8%8A%EF%BC%89.md'},
  {t:'4.高频真题解析Ⅲ（下）',c:'algorithm',p:'%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%B8%8E%E7%AE%97%E6%B3%95%2F3.%20LeetCode%E9%AB%98%E9%A2%91%E7%9C%9F%E9%A2%98%E8%A7%A3%E6%9E%90%2F4.%E9%AB%98%E9%A2%91%E7%9C%9F%E9%A2%98%E8%A7%A3%E6%9E%90%E2%85%A2%EF%BC%88%E4%B8%8B%EF%BC%89.md'},
  {t:'5.高频真题解析Ⅳ',c:'algorithm',p:'%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%B8%8E%E7%AE%97%E6%B3%95%2F3.%20LeetCode%E9%AB%98%E9%A2%91%E7%9C%9F%E9%A2%98%E8%A7%A3%E6%9E%90%2F5.%E9%AB%98%E9%A2%91%E7%9C%9F%E9%A2%98%E8%A7%A3%E6%9E%90%E2%85%A3.md'},
  {t:'异或运算',c:'foundation',p:'%E7%BC%96%E7%A8%8B%E5%9F%BA%E7%A1%80%2F%E5%BC%82%E6%88%96%E8%BF%90%E7%AE%97.md'},
  {t:'浮点数的坑',c:'foundation',p:'%E7%BC%96%E7%A8%8B%E5%9F%BA%E7%A1%80%2F%E6%B5%AE%E7%82%B9%E6%95%B0%E7%9A%84%E5%9D%91.md'},
  {t:'Groovy 相关',c:'groovy',p:'%E7%BC%96%E7%A8%8B%E8%AF%AD%E8%A8%80%2FGroovy%20%E7%9B%B8%E5%85%B3.md'},
  {t:'python相关',c:'python',p:'%E7%BC%96%E7%A8%8B%E8%AF%AD%E8%A8%80%2Fpython%E7%9B%B8%E5%85%B3.md'},
  {t:'Kotlin Flow 响应式编程',c:'kotlin',p:'%E7%BC%96%E7%A8%8B%E8%AF%AD%E8%A8%80%2FKotlin%2FKotlin%20Flow%20%E5%93%8D%E5%BA%94%E5%BC%8F%E7%BC%96%E7%A8%8B.md'},
  {t:'Kotlin 的加强版类型推断：@BuilderInference',c:'kotlin',p:'%E7%BC%96%E7%A8%8B%E8%AF%AD%E8%A8%80%2FKotlin%2FKotlin%20%E7%9A%84%E5%8A%A0%E5%BC%BA%E7%89%88%E7%B1%BB%E5%9E%8B%E6%8E%A8%E6%96%AD%EF%BC%9A%40BuilderInference.md'},
  {t:'implicit receiver(隐式接收器)',c:'kotlin',p:'%E7%BC%96%E7%A8%8B%E8%AF%AD%E8%A8%80%2FKotlin%2Fimplicit%20receiver%28%E9%9A%90%E5%BC%8F%E6%8E%A5%E6%94%B6%E5%99%A8%29.md'},
  {t:'kotlin 中的协程',c:'kotlin',p:'%E7%BC%96%E7%A8%8B%E8%AF%AD%E8%A8%80%2FKotlin%2Fkotlin%20%E4%B8%AD%E7%9A%84%E5%8D%8F%E7%A8%8B.md'},
  {t:'kotlin基础学习',c:'kotlin',p:'%E7%BC%96%E7%A8%8B%E8%AF%AD%E8%A8%80%2FKotlin%2Fkotlin%E5%9F%BA%E7%A1%80%E5%AD%A6%E4%B9%A0.md'},
  {t:'noinline 和 crossinline',c:'kotlin',p:'%E7%BC%96%E7%A8%8B%E8%AF%AD%E8%A8%80%2FKotlin%2Fnoinline%20%E5%92%8C%20crossinline.md'},
  {t:'把函数当类用，Compose 风骚的作用域机制',c:'kotlin',p:'%E7%BC%96%E7%A8%8B%E8%AF%AD%E8%A8%80%2FKotlin%2F%E6%8A%8A%E5%87%BD%E6%95%B0%E5%BD%93%E7%B1%BB%E7%94%A8%EF%BC%8CCompose%20%E9%A3%8E%E9%AA%9A%E7%9A%84%E4%BD%9C%E7%94%A8%E5%9F%9F%E6%9C%BA%E5%88%B6.md'},
  {t:'Rust 基础入门',c:'rust',p:'%E7%BC%96%E7%A8%8B%E8%AF%AD%E8%A8%80%2FRust%2FRust%20%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8.md'},
  {t:'Rust 开发环境搭建',c:'rust',p:'%E7%BC%96%E7%A8%8B%E8%AF%AD%E8%A8%80%2FRust%2FRust%20%E5%BC%80%E5%8F%91%E7%8E%AF%E5%A2%83%E6%90%AD%E5%BB%BA.md'},
  {t:'Netty 学习',c:'network',p:'%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C%2FNetty%20%E5%AD%A6%E4%B9%A0.md'},
  {t:'Socket 编程',c:'network',p:'%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C%2FSocket%20%E7%BC%96%E7%A8%8B.md'},
  // ─── 非 Markdown 文件（图片/脑图/PPT/Drawio）───
{t:'1.Activity交互时的问题',c:'android-adv',p:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FAndroid%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%2F1.Activity%E4%BA%A4%E4%BA%92%E6%97%B6%E7%9A%84%E9%97%AE%E9%A2%98.png',type:'img',dl:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FAndroid%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%2F1.Activity%E4%BA%A4%E4%BA%92%E6%97%B6%E7%9A%84%E9%97%AE%E9%A2%98.xmind',dlName:'1.Activity交互时的问题.xmind',dlLabel:'下载 XMind 源文件'},
  {t:'2.touch事件分发时序',c:'android-adv',p:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FAndroid%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%2F2.touch%E4%BA%8B%E4%BB%B6%E5%88%86%E5%8F%91%E6%97%B6%E5%BA%8F.png',type:'img',dl:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FAndroid%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%2F2.touch%E4%BA%8B%E4%BB%B6%E5%88%86%E5%8F%91%E6%97%B6%E5%BA%8F.xmind',dlName:'2.touch事件分发时序.xmind',dlLabel:'下载 XMind 源文件'},
  {t:'3.自定义View',c:'android-adv',p:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FAndroid%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%2F3.%E8%87%AA%E5%AE%9A%E4%B9%89View.png',type:'img',dl:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FAndroid%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%2F3.%E8%87%AA%E5%AE%9A%E4%B9%89View.xmind',dlName:'3.自定义View.xmind',dlLabel:'下载 XMind 源文件'},
  {t:'4.RecyclerView解析',c:'android-adv',p:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FAndroid%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%2F4.RecyclerView%E8%A7%A3%E6%9E%90.png',type:'img',dl:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FAndroid%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%2F4.RecyclerView%E8%A7%A3%E6%9E%90.xmind',dlName:'4.RecyclerView解析.xmind',dlLabel:'下载 XMind 源文件'},
  {t:'5.Android OkHttp解析',c:'android-adv',p:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FAndroid%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%2F5.Android%20OkHttp%E8%A7%A3%E6%9E%90.png',type:'img',dl:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FAndroid%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%2F5.Android%20OkHttp%E8%A7%A3%E6%9E%90.xmind',dlName:'5.Android OkHttp解析.xmind',dlLabel:'下载 XMind 源文件'},
  {t:'6.Android Bitmap解析',c:'android-adv',p:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FAndroid%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%2F6.Android%20Bitmap%E8%A7%A3%E6%9E%90.png',type:'img',dl:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FAndroid%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%2F6.Android%20Bitmap%E8%A7%A3%E6%9E%90.xmind',dlName:'6.Android Bitmap解析.xmind',dlLabel:'下载 XMind 源文件'},
  {t:'1.startActivity启动分析',c:'android-adv',p:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FAndroid%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90%2F1.startActivity%E5%90%AF%E5%8A%A8%E5%88%86%E6%9E%90.png',type:'img',dl:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FAndroid%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90%2F1.startActivity%E5%90%AF%E5%8A%A8%E5%88%86%E6%9E%90.xmind',dlName:'1.startActivity启动分析.xmind',dlLabel:'下载 XMind 源文件'},
  {t:'2.Window 、Activity、 View 三者关系',c:'android-adv',p:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FAndroid%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90%2F2.Window%20%E3%80%81Activity%E3%80%81%20View%20%E4%B8%89%E8%80%85%E5%85%B3%E7%B3%BB.png',type:'img',dl:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FAndroid%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90%2F2.Window%20%E3%80%81Activity%E3%80%81%20View%20%E4%B8%89%E8%80%85%E5%85%B3%E7%B3%BB.xmind',dlName:'2.Window 、Activity、 View 三者关系.xmind',dlLabel:'下载 XMind 源文件'},
  {t:'3.View的渲染',c:'android-adv',p:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FAndroid%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90%2F3.View%E7%9A%84%E6%B8%B2%E6%9F%93.png',type:'img',dl:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FAndroid%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90%2F3.View%E7%9A%84%E6%B8%B2%E6%9F%93.xmind',dlName:'3.View的渲染.xmind',dlLabel:'下载 XMind 源文件'},
  {t:'4.App的安装过程',c:'android-adv',p:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FAndroid%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90%2F4.App%E7%9A%84%E5%AE%89%E8%A3%85%E8%BF%87%E7%A8%8B.png',type:'img',dl:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FAndroid%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90%2F4.App%E7%9A%84%E5%AE%89%E8%A3%85%E8%BF%87%E7%A8%8B.xmind',dlName:'4.App的安装过程.xmind',dlLabel:'下载 XMind 源文件'},
  {t:'5.Handler 分析',c:'android-adv',p:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FAndroid%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90%2F5.Handler%20%E5%88%86%E6%9E%90.png',type:'img',dl:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FAndroid%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90%2F5.Handler%20%E5%88%86%E6%9E%90.xmind',dlName:'5.Handler 分析.xmind',dlLabel:'下载 XMind 源文件'},
  {t:'10.AQS 和 CAS 原理',c:'android-adv',p:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FJVM%E4%B8%8EDVM%2F10.AQS%20%E5%92%8C%20CAS%20%E5%8E%9F%E7%90%86.png',type:'img',dl:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FJVM%E4%B8%8EDVM%2F10.AQS%20%E5%92%8C%20CAS%20%E5%8E%9F%E7%90%86.xmind',dlName:'10.AQS 和 CAS 原理.xmind',dlLabel:'下载 XMind 源文件'},
  {t:'11.线程池',c:'android-adv',p:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FJVM%E4%B8%8EDVM%2F11.%E7%BA%BF%E7%A8%8B%E6%B1%A0.png',type:'img',dl:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FJVM%E4%B8%8EDVM%2F11.%E7%BA%BF%E7%A8%8B%E6%B1%A0.xmind',dlName:'11.线程池.xmind',dlLabel:'下载 XMind 源文件'},
  {t:'12.Dalvik',c:'android-adv',p:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FJVM%E4%B8%8EDVM%2F12.Dalvik.png',type:'img',dl:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FJVM%E4%B8%8EDVM%2F12.Dalvik.xmind',dlName:'12.Dalvik.xmind',dlLabel:'下载 XMind 源文件'},
  {t:'4.编译插桩',c:'android-adv',p:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FJVM%E4%B8%8EDVM%2F4.%E7%BC%96%E8%AF%91%E6%8F%92%E6%A1%A9.png',type:'img',dl:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FJVM%E4%B8%8EDVM%2F4.%E7%BC%96%E8%AF%91%E6%8F%92%E6%A1%A9.xmind',dlName:'4.编译插桩.xmind',dlLabel:'下载 XMind 源文件'},
  {t:'5.ClassLoader的加载机制',c:'android-adv',p:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FJVM%E4%B8%8EDVM%2F5.ClassLoader%E7%9A%84%E5%8A%A0%E8%BD%BD%E6%9C%BA%E5%88%B6.png',type:'img',dl:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FJVM%E4%B8%8EDVM%2F5.ClassLoader%E7%9A%84%E5%8A%A0%E8%BD%BD%E6%9C%BA%E5%88%B6.xmind',dlName:'5.ClassLoader的加载机制.xmind',dlLabel:'下载 XMind 源文件'},
  {t:'6.Class对象的初始化',c:'android-adv',p:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FJVM%E4%B8%8EDVM%2F6.Class%E5%AF%B9%E8%B1%A1%E7%9A%84%E5%88%9D%E5%A7%8B%E5%8C%96.png',type:'img',dl:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FJVM%E4%B8%8EDVM%2F6.Class%E5%AF%B9%E8%B1%A1%E7%9A%84%E5%88%9D%E5%A7%8B%E5%8C%96.xmind',dlName:'6.Class对象的初始化.xmind',dlLabel:'下载 XMind 源文件'},
  {t:'7.Java内存模型与线程',c:'android-adv',p:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FJVM%E4%B8%8EDVM%2F7.Java%E5%86%85%E5%AD%98%E6%A8%A1%E5%9E%8B%E4%B8%8E%E7%BA%BF%E7%A8%8B.png',type:'img',dl:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FJVM%E4%B8%8EDVM%2F7.Java%E5%86%85%E5%AD%98%E6%A8%A1%E5%9E%8B%E4%B8%8E%E7%BA%BF%E7%A8%8B.xmind',dlName:'7.Java内存模型与线程.xmind',dlLabel:'下载 XMind 源文件'},
  {t:'8.Synchronized与ReentrantLock',c:'android-adv',p:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FJVM%E4%B8%8EDVM%2F8.Synchronized%E4%B8%8EReentrantLock.png',type:'img',dl:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FJVM%E4%B8%8EDVM%2F8.Synchronized%E4%B8%8EReentrantLock.xmind',dlName:'8.Synchronized与ReentrantLock.xmind',dlLabel:'下载 XMind 源文件'},
  {t:'9.Java的线程优化',c:'android-adv',p:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FJVM%E4%B8%8EDVM%2F9.Java%E7%9A%84%E7%BA%BF%E7%A8%8B%E4%BC%98%E5%8C%96.png',type:'img',dl:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FJVM%E4%B8%8EDVM%2F9.Java%E7%9A%84%E7%BA%BF%E7%A8%8B%E4%BC%98%E5%8C%96.xmind',dlName:'9.Java的线程优化.xmind',dlLabel:'下载 XMind 源文件'},
  {t:'自定义View',c:'android-adv',p:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2F%E8%87%AA%E5%AE%9A%E4%B9%89View.png',type:'img',dl:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2F%E8%87%AA%E5%AE%9A%E4%B9%89View.xmind',dlName:'自定义View.xmind',dlLabel:'下载 XMind 源文件'},
  {t:'Hilt 实现依赖注入',c:'third-lib',p:'Android%2F%E4%B8%89%E6%96%B9%E5%BA%93%2FHilt%20%E5%AE%9E%E7%8E%B0%E4%BE%9D%E8%B5%96%E6%B3%A8%E5%85%A5.xmind',type:'dl',dlName:'Hilt 实现依赖注入.xmind',dlLabel:'下载 XMind 源文件'},
  {t:'Retrofit的介绍',c:'third-lib',p:'Android%2F%E4%B8%89%E6%96%B9%E5%BA%93%2FRetrofit%E7%9A%84%E4%BB%8B%E7%BB%8D.png',type:'img',dl:'Android%2F%E4%B8%89%E6%96%B9%E5%BA%93%2FRetrofit%E7%9A%84%E4%BB%8B%E7%BB%8D.xmind',dlName:'Retrofit的介绍.xmind',dlLabel:'下载 XMind 源文件'},
  {t:'RxJava详解',c:'third-lib',p:'Android%2F%E4%B8%89%E6%96%B9%E5%BA%93%2FRxJava%E8%AF%A6%E8%A7%A3.png',type:'img',dl:'Android%2F%E4%B8%89%E6%96%B9%E5%BA%93%2FRxJava%E8%AF%A6%E8%A7%A3.xmind',dlName:'RxJava详解.xmind',dlLabel:'下载 XMind 源文件'},
  {t:'HTTP',c:'network',p:'%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C%2FHTTP.png',type:'img',dl:'%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C%2FHTTP.xmind',dlName:'HTTP.xmind',dlLabel:'下载 XMind 源文件'},
  {t:'Android 专家技术栈',c:'android',p:'Android%2FAndroid%20%E4%B8%93%E5%AE%B6%E6%8A%80%E6%9C%AF%E6%A0%88.png',type:'img',dlName:'Android 专家技术栈.png',dlLabel:'查看原图'},
  {t:'Activity 启动流程图',c:'android-adv',p:'Android%2FAndroid%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86%2FActivity%20%E5%90%AF%E5%8A%A8%E6%B5%81%E7%A8%8B%E5%9B%BE.png',type:'img',dlName:'Activity 启动流程图.png',dlLabel:'查看原图'},
  {t:'compose_动画',c:'android',p:'Android%2Fcompose%2Fcompose_%E5%8A%A8%E7%94%BB.png',type:'img',dlName:'compose_动画.png',dlLabel:'查看原图'},
  {t:'Navigation流程图',c:'third-lib',p:'Android%2F%E4%B8%89%E6%96%B9%E5%BA%93%2FNavigation%E6%B5%81%E7%A8%8B%E5%9B%BE.png',type:'img',dlName:'Navigation流程图.png',dlLabel:'查看原图'},
  {t:'Java注解结构图',c:'root',p:'Java%E6%B3%A8%E8%A7%A3%E7%BB%93%E6%9E%84%E5%9B%BE.png',type:'img',dlName:'Java注解结构图.png',dlLabel:'查看原图'},
  {t:'Android 应用原生插件化实现',c:'android',p:'Android%2FAndroid%20%E5%BA%94%E7%94%A8%E5%8E%9F%E7%94%9F%E6%8F%92%E4%BB%B6%E5%8C%96%E5%AE%9E%E7%8E%B0.pptx',type:'dl',dlName:'Android 应用原生插件化实现.pptx',dlLabel:'下载 PPTX 文件'},
  {t:'Shadow插件化流程解析',c:'third-lib',p:'Android%2F%E4%B8%89%E6%96%B9%E5%BA%93%2FShadow%E6%8F%92%E4%BB%B6%E5%8C%96%E6%B5%81%E7%A8%8B%E8%A7%A3%E6%9E%90.drawio',type:'dl',dlName:'Shadow插件化流程解析.drawio',dlLabel:'下载 Drawio 文件'}
];
const ART = [...FALLBACK_ART];

// ════════════════════════════════════════════════
//  BASE URL — local dev vs GitHub Pages (raw)
// ════════════════════════════════════════════════
function getArticleBase(){
  if(location.hostname==='localhost'||location.hostname==='127.0.0.1'){
    return location.href.split('#')[0].replace(/\/[^/]*\.html.*$/,'/').replace(/\/?$/,'/');
  }
  return 'https://raw.githubusercontent.com/Heart-Beats/StudyNotes/master/';
}

// ════════════════════════════════════════════════
//  MARKDOWN PARSER — powered by marked.js
// ════════════════════════════════════════════════
function parseMD(src){
  if(!src||!src.trim()) return '<p class="empty">（本文档暂无内容）</p>';
  try {
    // Pre-process 1: ==highlight== → <mark>
    src = src.replace(/==(.+?)==/g, '<mark>$1</mark>');
    // Pre-process 2: Fix bold/italic boundary before CJK punctuation
    // marked.js v15 doesn't treat CJK punctuation as word-boundary, so
    // "**text**。" is not parsed as bold. Insert zero-width space as workaround.
    // Matches: **...** or *...* immediately followed by CJK full-width punct
    const cjkPunct = '\u3000-\u303f\uff00-\uffef\u2018-\u201f\u2e80-\u2eff\u3400-\u4dbf\u4e00-\u9fff\u{20000}-\u{2a6df}';
    src = src.replace(/(\*{1,2}[^*\n]+?\*{1,2})([\u3000-\u303f\uff00-\uffef\u2018-\u201f，。、；：！？「」【】《》（）…—～·])/g, '$1\u200b$2');
    // Pre-process 3: Also fix opening bold/italic after CJK punct
    src = src.replace(/([\u3000-\u303f\uff00-\uffef\u2018-\u201f，。、；：！？「」【】《》（）…—～·])(\*{1,2}[^*\s])/g, '$1\u200b$2');
    const html = marked.parse(src, { gfm: true, breaks: false, async: false });
    // Post-process: Add onerror handler to all <img> tags for broken external images
    return html.replace(/<img(\s[^>]*?)>/g, (match, attrs) => {
      if (attrs.includes('onerror')) return match;
      // Extract src for alt display
      const srcMatch = attrs.match(/src="([^"]+)"/);
      const altMatch = attrs.match(/alt="([^"]*)"/);
      const alt = altMatch ? altMatch[1] : '图片';
      return `<img${attrs} onerror="this.onerror=null;this.parentNode.replaceChild((function(){const d=document.createElement('div');d.className='img-broken';d.innerHTML='<span>🖼️</span><span>${alt || '图片加载失败'}</span>';return d})(),this)">`;
    });
  } catch(e) {
    console.error('[parseMD] marked error:', e);
    return '<p class="error">Markdown 解析错误: '+e.message+'</p>';
  }
}

// ════════════════════════════════════════════════
//  UTILS
// ════════════════════════════════════════════════
function hEsc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function slugify(s){return s.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g,'-').replace(/^-|-$/g,'')||'h'}
function hlMatch(t,q){
  if(!q)return t;
  const re=new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi');
  return t.replace(re,'<mark style="background:rgba(251,191,36,.3);padding:0 2px;border-radius:2px">$1</mark>');
}

// ════════════════════════════════════════════════
//  ROUTER
// ════════════════════════════════════════════════
let curIdx=-1;

function goHome(){history.pushState(null,'',location.pathname);renderHome();}
function nav(hash){history.pushState(null,'',location.pathname+'#'+hash);route();}

function route(){
  const h=location.hash.slice(1)||'/';
  if(!h||h==='/')renderHome();
  else if(h.startsWith('article/')){
    const parts=h.split('/');
    const n=parseInt(parts[1]);
    const anchor=parts[2]?decodeURIComponent(parts[2]):null; // decode %E8%A7%A3 → 解
    if(n>=0&&n<ART.length) loadArticle(n,anchor);
    else renderHome();
  }
  else if(h.startsWith('cat/'))renderCat(h.slice(4));
  else renderHome();
}

// ════════════════════════════════════════════════
//  SIDEBAR
// ════════════════════════════════════════════════
function renderSidebar(activeCat,activeIdx){
  const sb=document.getElementById('sidebar');if(!sb)return;
  const isHome=activeCat===null&&activeIdx===undefined;

  let H=`<div class="sb-home-row">
    <a class="sb-home ${isHome?'active':''}" onclick="goHome()">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0"><path d="M1 6.5L7 1.5L13 6.5V13H9V9H5V13H1V6.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" fill="none"/></svg>
      首页
    </a>
    <button class="sb-collapse-btn" onclick="toggleSidebar()" title="折叠侧边栏">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11 1L3 7L11 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
  </div>
  <div class="sb-sep"></div>`;

  for(const k of CAT_ORDER){
    const cat=CAT_DEF[k];
    const list=ART.map((a,i)=>({...a,_i:i})).filter(a=>a.c===k);
    if(!list.length)continue;
    const isGroupActive=activeIdx!==undefined&&ART[activeIdx]?.c===k;
    const isExpanded=isGroupActive||activeCat===k;
    H+=`<div class="sb-group">
      <div class="sb-group-header" onclick="toggleGroup('${k}')">
        <span class="arrow${isExpanded?' open':''}" id="arr-${k}">▶</span>
        <span class="gb-name">${cat.emoji} ${cat.n}</span>
        <span class="gb-count">${list.length}</span>
      </div>
      <div class="sb-items${isExpanded?'':' collapsed'}" id="grp-${k}">`;
    for(const a of list){
      H+=`<a class="sb-item${activeIdx===a._i?' active':''}" onclick="nav('article/${a._i}')" title="${hEsc(a.t)}">
        <span class="si-dot" style="background:${cat.color}"></span>
        <span class="si-name">${hEsc(a.t)}${a.type==='img'?' 🖼️':a.type==='dl'?' 📦':''}</span>
      </a>`;
    }
    H+='</div></div>';
  }
  sb.innerHTML=H;
  const activeEl=sb.querySelector('.sb-item.active');
  if(activeEl)setTimeout(()=>activeEl.scrollIntoView({block:'nearest'}),50);
}

function toggleGroup(k){
  const grp=document.getElementById('grp-'+k);
  const arr=document.getElementById('arr-'+k);
  if(!grp)return;
  grp.classList.toggle('collapsed');
  arr.classList.toggle('open');
}

// ════════════════════════════════════════════════
//  RENDER: HOME
// ════════════════════════════════════════════════
function renderHome(){
  curIdx=-1;document.title='StudyNotes — Android · Kotlin · Rust · 算法';
  document.getElementById('navBreadcrumb').innerHTML='<span class="seg">📚 首页</span>';
  const tocRail=document.getElementById('tocRail');tocRail.classList.remove('show');tocRail.innerHTML='';

  const catCount=CAT_ORDER.filter(k=>ART.some(a=>a.c===k)).length;

  const root=document.getElementById('pageRoot');
  let H=`<section class="hero">
    <div class="hero-glow3"></div>
    <div class="hero-glow2"></div>
    <div class="hero-inner">
      <div class="hero-eyebrow"><span class="hero-eyebrow-dot"></span>Android 工程师技术知识库</div>
      <h1>Study<em>Notes</em><span class="dim"> .</span></h1>
      <p class="hero-desc">涵盖 Android 进阶 · Kotlin · Rust · Flutter · 数据结构与算法 · AI 工具 · 计算机网络等核心领域的系统化编程学习笔记</p>
      <div class="hero-search" onclick="openSearch()">
        <svg class="hs-icon" width="17" height="17" viewBox="0 0 17 17" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" stroke-width="1.5"/><line x1="12" y1="12" x2="16" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        <span class="hs-text">搜索文章、关键词、技术点…</span><kbd>Ctrl+K</kbd>
      </div>
      <div class="hero-stats">
        <div class="hero-stat"><div class="hs-num"><span>${ART.length}</span></div><div class="hs-label">篇技术文章</div></div>
        <div class="hero-stat"><div class="hs-num"><span>${catCount}</span></div><div class="hs-label">个知识分类</div></div>
        <div class="hero-stat"><div class="hs-num"><span>Heart-Beats/StudyNotes</span></div><div class="hs-label">GitHub 仓库</div></div>
      </div>
    </div>
  </section>`;

  H+='<div class="home-body"><p class="section-title">全部分类</p><div class="cat-grid">';
  for(const k of CAT_ORDER){
    const cat=CAT_DEF[k];
    const cnt=ART.filter(a=>a.c===k).length;
    if(!cnt)continue;
    H+=`<div class="cat-card" onclick="(function(e){var el=e.currentTarget;var r=document.createElement('span');r.className='cc-ripple';var rect=el.getBoundingClientRect();var size=Math.max(rect.width,rect.height);r.style.width=r.style.height=size+'px';r.style.left=(e.clientX-rect.left-size/2)+'px';r.style.top=(e.clientY-rect.top-size/2)+'px';el.appendChild(r);setTimeout(function(){r.remove()},700)})(event);nav('cat/${k}')">
      <div class="cc-top">
        <div class="cc-icon" style="background:${cat.color}18">${cat.emoji}</div>
        <div class="cc-body"><div class="cc-name">${cat.n}</div><span class="cc-count">${cnt} 篇</span></div>
      </div>
      <div class="cc-desc">${cat.desc}</div>
      <div class="cc-footer">
        <span class="cc-tag" style="background:${cat.color}15;color:${cat.color}">${cat.emoji} ${cat.n}</span>
        <svg style="margin-left:auto;color:var(--c-tm2)" width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5h8M7 3l3.5 3.5L7 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
    </div>`;
  }
  H+='</div></div>';
  root.innerHTML=H;
  renderSidebar(null);
}

// ════════════════════════════════════════════════
//  RENDER: CATEGORY PAGE
// ════════════════════════════════════════════════
function renderCat(key){
  const cat=CAT_DEF[key];if(!cat){renderHome();return;}
  const list=ART.map((a,i)=>({...a,_i:i})).filter(a=>a.c===key);
  document.title=cat.n+' — StudyNotes';
  document.getElementById('navBreadcrumb').innerHTML=`<a onclick="goHome()">首页</a><span class="sep">/</span><span class="seg">${cat.emoji} ${cat.n}</span>`;

  const tocRail=document.getElementById('tocRail');tocRail.classList.remove('show');tocRail.innerHTML='';

  const root=document.getElementById('pageRoot');
  let H=`<div class="cat-page">
    <div class="breadcrumb"><a onclick="goHome()">首页</a><span class="sep">/</span><span style="color:var(--c-t1)">${cat.emoji} ${cat.n}</span></div>
    <div class="page-hero"><h1>${cat.emoji} ${cat.n}</h1><p>${cat.desc} · 共 ${list.length} 篇文章</p></div>
    <div class="article-list-label">文章列表</div>`;
  for(const a of list){
    H+=`<div class="article-row" onclick="nav('article/${a._i}')">
      <span class="ar-num">${String(a._i+1).padStart(2,'0')}</span>
      <span class="ar-title">${hEsc(a.t)}${a.type==='img'?'<span class="art-type-badge img">图</span>':a.type==='dl'?'<span class="art-type-badge dl">下载</span>':''}</span>
      <div class="ar-meta">
        <svg class="ar-arrow" width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5h8M7 3l3.5 3.5L7 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
    </div>`;
  }
  H+='</div>';
  root.innerHTML=H;renderSidebar(key);
}

// ════════════════════════════════════════════════
//  RENDER: ARTICLE
// ════════════════════════════════════════════════
async function loadArticle(idx,anchor){
  const a=ART[idx];if(!a)return;curIdx=idx;
  const cat=CAT_DEF[a.c]||{n:'其他',emoji:'📋',color:'#64748b'};
  document.title=a.t+' — StudyNotes';
  document.getElementById('navBreadcrumb').innerHTML=`<a onclick="goHome()">首页</a><span class="sep">/</span><a onclick="nav('cat/${a.c}')" class="seg">${cat.emoji} ${cat.n}</a>`;

  const root=document.getElementById('pageRoot');

  // ─── 非文本文件处理：图片 / 下载 ───
  if(a.type==='img'){
    renderSidebar(a.c,idx);
    const base=getArticleBase();
    const imgUrl=base+a.p;
    let dlHtml='';
    if(a.dl){
      dlHtml=`<a class="img-dl-btn" href="${base+a.dl}" download="${hEsc(a.dlName||'')}">📎 ${hEsc(a.dlLabel||'下载源文件')}</a>`;
    }else{
      dlHtml=`<a class="img-dl-btn" href="${imgUrl}" target="_blank">🔍 ${hEsc(a.dlLabel||'查看原图')}</a>`;
    }
    root.innerHTML=`<div class="article-wrap">
      <div class="breadcrumb"><a onclick="goHome()">首页</a><span class="sep">/</span><a onclick="nav('cat/${a.c}')">${cat.emoji} ${cat.n}</a></div>
      <div class="article-header">
        <div class="ah-cat-badge" style="color:${cat.color}">${cat.emoji} ${cat.n}</div>
        <h1>${hEsc(a.t)}</h1>
        <div class="ah-meta">
          <span class="ah-tag" style="background:${cat.color}18;color:${cat.color}">${cat.emoji} ${cat.n}</span>
          <span>🖼️ 图片文件</span>
        </div>
      </div>
      <div class="article-body">
        <div class="img-viewer-wrap">
          <img src="${imgUrl}" alt="${hEsc(a.t)}" class="img-viewer" onload="this.parentElement.classList.add('loaded')" onerror="this.parentElement.classList.add('error');this.nextElementSibling.style.display='flex'" />
          <div class="img-viewer-error" style="display:none">
            <h3>⚠️ 图片加载失败</h3>
            <p>文件路径：<code>${hEsc(a.p)}</code></p>
          </div>
        </div>
        <div class="img-dl-bar">${dlHtml}</div>
      </div>
    </div>`;
    document.getElementById('tocRail').classList.remove('show');
    window.scrollTo(0,0);
    return;
  }

  if(a.type==='dl'){
    renderSidebar(a.c,idx);
    const base=getArticleBase();
    const fileUrl=base+a.p;
    const decodedUrl=decodeURIComponent(fileUrl);
    const encodedUrl=encodeURIComponent(decodedUrl);
    const ext=(a.dlName||'').split('.').pop().toLowerCase();
    let icon='📎',desc='此文件无法在浏览器中直接预览，请下载后使用对应软件打开。';
    let embedHtml='';

    if(ext==='drawio'){
      icon='🔀';desc='Draw.io 流程图 — 在线渲染中';
      embedHtml=`<div class="embed-viewer-wrap"><iframe class="embed-viewer" src="https://viewer.diagrams.net/?url=${encodedUrl}&embed=1&chrome=0&nav=1&layers=1" allowfullscreen frameborder="0"></iframe></div>`;
    }else if(ext==='pptx'){
      icon='📊';desc='PowerPoint 演示文稿 — 在线渲染中';
      embedHtml=`<div class="embed-viewer-wrap"><iframe class="embed-viewer" src="https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}" allowfullscreen frameborder="0"></iframe></div>`;
    }else if(ext==='xmind'){
      icon='🧠';desc='XMind 思维导图 — 正在解析渲染…';
      embedHtml=`<div id="xmindRender" class="xmind-render-wrap"><div class="xmind-loading"><div class="spin"></div>正在解析 XMind 文件…</div></div>`;
    }

    root.innerHTML=`<div class="article-wrap">
      <div class="breadcrumb"><a onclick="goHome()">首页</a><span class="sep">/</span><a onclick="nav('cat/${a.c}')">${cat.emoji} ${cat.n}</a></div>
      <div class="article-header">
        <div class="ah-cat-badge" style="color:${cat.color}">${cat.emoji} ${cat.n}</div>
        <h1>${hEsc(a.t)}</h1>
        <div class="ah-meta">
          <span class="ah-tag" style="background:${cat.color}18;color:${cat.color}">${cat.emoji} ${cat.n}</span>
          <span>${icon} ${ext==='drawio'?'流程图':ext==='pptx'?'演示文稿':'思维导图'}</span>
        </div>
      </div>
      <div class="article-body">
        ${embedHtml}
        <div class="dl-bar"><a class="dl-link" href="${fileUrl}" download="${hEsc(a.dlName||'')}">⬇️ 下载源文件 (${hEsc(a.dlName||'')})</a></div>
      </div>
    </div>`;
    document.getElementById('tocRail').classList.remove('show');
    window.scrollTo(0,0);

    // XMind 异步解析渲染
    if(ext==='xmind'&&typeof JSZip!=='undefined'){
      renderXMind(fileUrl);
    }
    return;
  }

  // ─── 常规 Markdown 文章加载 ───
  root.innerHTML=`<div class="article-wrap">
    <div class="breadcrumb"><a onclick="goHome()">首页</a><span class="sep">/</span><a onclick="nav('cat/${a.c}')">${cat.emoji} ${cat.n}</a></div>
    <div class="article-header"><div class="ah-cat-badge" style="color:${cat.color}">${cat.emoji} ${cat.n}</div><h1>${hEsc(a.t)}</h1></div>
    <div class="loading-state"><div class="spin"></div>正在加载文章内容…</div>
  </div>`;
  renderSidebar(a.c,idx);

  try{
    const base=getArticleBase();
    const resp=await fetch(base+a.p);
    if(!resp.ok)throw new Error('HTTP '+resp.status);
    const md=await resp.text();
    const bodyHtml=parseMD(md);

    // ✅ Extract headings FROM rendered HTML so TOC IDs are 100% guaranteed to match
    const tmp=document.createElement('div');
    tmp.innerHTML=bodyHtml;
    const allHeads=tmp.querySelectorAll('h1, h2, h3, h4');
    const tocItems=[];
    allHeads.forEach(h=>{
      const lv=parseInt(h.tagName[1]);
      const txt=h.textContent.trim();
      let id=h.id||slugify(txt);
      // Deduplicate
      const sameId=tocItems.filter(t=>t.id===id).length;
      if(sameId)id+='-'+(sameId+1);
      h.setAttribute('id',id);
      tocItems.push({lv,txt,id});
    });
    const finalBodyHtml=tmp.innerHTML;

    // Build TOC using actual heading IDs
    const tocRail=document.getElementById('tocRail');
    if(tocItems.length>2){
      tocRail.innerHTML=`<div class="toc-heading">本页目录</div>`+
        tocItems.map(h=>`<a class="toc-link${h.lv>=3?' lv3':''}" data-target="${h.id}">${hEsc(h.txt)}</a>`).join('');
      tocRail.classList.add('show');
    }else{tocRail.classList.remove('show');}

    root.innerHTML=`<div class="article-wrap">
      <div class="breadcrumb"><a onclick="goHome()">首页</a><span class="sep">/</span><a onclick="nav('cat/${a.c}')">${cat.emoji} ${cat.n}</a></div>
      <div class="article-header">
        <div class="ah-cat-badge" style="color:${cat.color}">${cat.emoji} ${cat.n}</div>
        <h1>${hEsc(a.t)}</h1>
        <div class="ah-meta">
          <span class="ah-tag" style="background:${cat.color}18;color:${cat.color}">${cat.emoji} ${cat.n}</span>
          <span>${md.length} 字符</span>
          <span>${md.split('\\n').length} 行原文</span>
        </div>
      </div>
      <div class="article-body">${finalBodyHtml}</div>
    </div>`;

    // Scroll to top immediately (before hljs/mermaid inflate the DOM)
    window.scrollTo(0,0);

    // Apply syntax highlighting
    try{if(typeof hljs!=='undefined'){hljs.highlightAll();}}catch(e){console.warn('hljs:',e);}

    // Render Mermaid diagrams
    try{renderMermaid();}catch(e){console.warn('mermaid:',e);}

    // Scroll to anchor AFTER hljs + mermaid have finished inflating the DOM,
    // otherwise getBoundingClientRect() returns pre-render offsets and the
    // scroll lands at the wrong position (or not at all on GitHub Pages).
    if(anchor){
      // Use setTimeout so the browser has completed layout after hljs/mermaid
      setTimeout(()=>{
        const target=document.getElementById(anchor);
        if(target){
          const navH=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'))||56;
          const top=target.getBoundingClientRect().top+window.pageYOffset-navH-16;
          window.scrollTo({top,behavior:'smooth'});
        }
      }, 120);
    }

    if(tocItems.length>2){
      const tocRailEl=document.getElementById('tocRail');
      const scrollSpy=()=>{
        let cur=null;
        const hs=root.querySelectorAll('.article-body h1[id],.article-body h2[id],.article-body h3[id],.article-body h4[id]');
        hs.forEach(h=>{if(h.getBoundingClientRect().top<=130)cur=h.id;});
        tocRailEl.querySelectorAll('.toc-link').forEach(el=>{
          el.classList.toggle('active',el.getAttribute('data-target')===cur);
        });
        // Keep URL in sync with scroll position for sharable anchor links
        if(curIdx>=0){
          const newHash='#article/'+curIdx+(cur?'/'+encodeURIComponent(cur):'');
          if(location.hash!==newHash) history.replaceState(null,'',location.pathname+newHash);
        }
      };
      window.removeEventListener('scroll',window.__tocScroll);
      window.__tocScroll=scrollSpy;
      window.addEventListener('scroll',scrollSpy,{passive:true});
      // TOC click — scroll to heading & update URL anchor
      tocRailEl.onclick=e=>{
        const link=e.target.closest('.toc-link');
        if(!link)return;
        e.preventDefault();
        const targetId=link.getAttribute('data-target');
        const el=document.getElementById(targetId);
        if(el){
          const navH=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'))||56;
          const top=el.getBoundingClientRect().top+window.pageYOffset-navH-16;
          window.scrollTo({top,behavior:'smooth'});
          // Update URL: #article/idx/heading-id (encoded for Chinese chars)
          if(curIdx>=0){
            history.replaceState(null,'',location.pathname+'#article/'+curIdx+'/'+encodeURIComponent(targetId));
          }
        }
        tocRailEl.querySelectorAll('.toc-link').forEach(l=>l.classList.remove('active'));
        link.classList.add('active');
      };
    }
  }catch(err){
    document.getElementById('tocRail').classList.remove('show');
    root.innerHTML=`<div class="article-wrap">
      <div class="breadcrumb"><a onclick="goHome()">首页</a><span class="sep">/</span><a onclick="nav('cat/${a.c}')">${cat.emoji} ${cat.n}</a></div>
      <div class="article-header"><div class="ah-cat-badge" style="color:${cat.color}">${cat.emoji} ${cat.n}</div><h1>${hEsc(a.t)}</h1></div>
      <div class="error-card">
        <h3>⚠️ 无法加载文章</h3><p>${hEsc(err.message)}</p><p>文件路径：<code>${hEsc(a.p)}</code></p>
        <p style="font-size:13px;margin-top:8px">请确认 .md 文件已推送到 GitHub 仓库，且路径编码一致。</p>
        <a class="back-link" onclick="goHome()"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M10 6.5H2M5 3 1.5 6.5 5 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>返回首页</a>
      </div>
    </div>`;
  }
}

// ════════════════════════════════════════════════
//  XMIND RENDERER — parse .xmind (ZIP) and render tree
// ════════════════════════════════════════════════
async function renderXMind(fileUrl){
  const container=document.getElementById('xmindRender');
  if(!container)return;
  try{
    const resp=await fetch(fileUrl);
    if(!resp.ok)throw new Error('HTTP '+resp.status);
    const buf=await resp.arrayBuffer();
    const zip=await JSZip.loadAsync(buf);

    // Try content.json (XMind 8+/Zen) first, then content.xml (legacy)
    let jsonStr=null;
    if(zip.file('content.json')){
      jsonStr=await zip.file('content.json').async('string');
    }else if(zip.file('content.xml')){
      // Legacy XML format — not parsing, fallback
      throw new Error('legacy XML format');
    }else{
      throw new Error('no content found');
    }

    const data=JSON.parse(jsonStr);
    // content.json is an array of sheets; each sheet has rootTopic
    const sheets=Array.isArray(data)?data:[data];
    let html='<div class="xmind-sheets">';
    sheets.forEach((sheet,si)=>{
      const root=sheet.rootTopic;
      if(!root)return;
      const sheetTitle=sheet.title||('Sheet '+(si+1));
      html+=`<div class="xmind-sheet" style="--sheet-idx:${si}">`;
      html+=`<div class="xmind-sheet-title">${hEsc(sheetTitle)}</div>`;
      html+=renderXMindNode(root,0);
      html+='</div>';
    });
    html+='</div>';
    container.innerHTML=html;

    // Add toggle listeners
    container.querySelectorAll('.xmind-node-toggle').forEach(btn=>{
      btn.onclick=()=>{
        const node=btn.closest('.xmind-node');
        node.classList.toggle('collapsed');
      };
    });
  }catch(err){
    console.warn('[XMind] parse failed:',err);
    container.innerHTML=`<div class="xmind-error">
      <h3>⚠️ XMind 在线渲染失败</h3>
      <p>原因：${hEsc(err.message)}</p>
      <p>请使用上方下载按钮获取源文件，在 XMind 软件中打开。</p>
    </div>`;
  }
}

function renderXMindNode(topic,depth){
  if(!topic)return '';
  const title=topic.title||'(无标题)';
  const children=[];
  // XMind stores children in children.attached array
  const attached=topic.children?.attached||[];
  // Also check for detached (floating topics)
  const detached=topic.children?.detached||[];
  const allKids=[...attached,...detached];

  const hasChildren=allKids.length>0;
  const isRoot=depth===0;

  let html=`<div class="xmind-node${isRoot?' xmind-root':''}">`;
  html+=`<div class="xmind-node-content">`;
  if(hasChildren){
    html+=`<span class="xmind-node-toggle">▼</span>`;
  }else{
    html+=`<span class="xmind-node-leaf">•</span>`;
  }
  html+=`<span class="xmind-node-title">${hEsc(title)}</span>`;
  html+=`</div>`;

  if(hasChildren){
    html+='<div class="xmind-children">';
    allKids.forEach(child=>{
      html+=renderXMindNode(child,depth+1);
    });
    html+='</div>';
  }

  html+='</div>';
  return html;
}

// ════════════════════════════════════════════════
//  SEARCH
// ════════════════════════════════════════════════
function openSearch(){document.getElementById('overlay').classList.add('show');setTimeout(()=>document.getElementById('searchInput')?.focus(),60);}
function closeSearch(){document.getElementById('overlay').classList.remove('show');const inp=document.getElementById('searchInput');if(inp)inp.value='';document.getElementById('searchResults').innerHTML='<div class="sp-empty">输入关键词开始搜索…</div>';}
function handleOverlayClick(e){if(e.target===document.getElementById('overlay'))closeSearch();}

function doSearch(q){
  const box=document.getElementById('searchResults');
  if(!q||!q.trim()){box.innerHTML='<div class="sp-empty">输入关键词开始搜索…</div>';return;}
  const kw=q.trim().toLowerCase();
  const hits=ART.map((a,i)=>({...a,_i:i})).filter(a=>a.t.toLowerCase().includes(kw)||(CAT_DEF[a.c]?.n||'').toLowerCase().includes(kw)||(CAT_DEF[a.c]?.desc||'').toLowerCase().includes(kw)).slice(0,12);
  if(!hits.length){box.innerHTML='<div class="sp-empty">未找到匹配文章</div>';return;}
  box.innerHTML=hits.map(a=>{
    const c=CAT_DEF[a.c]||{n:'其他',emoji:'📋',color:'#64748b'};
    return`<div class="sp-item" onclick="nav('article/${a._i}');closeSearch()">
      <div class="sp-item-body"><div class="sp-item-cat" style="color:${c.color}">${c.emoji} ${c.n}</div><div class="sp-item-title">${hlMatch(hEsc(a.t),kw)}${a.type==='img'?' 🖼️':a.type==='dl'?' 📦':''}</div><div class="sp-item-meta">${c.n}</div></div>
      <svg class="sp-item-arrow" width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5h8M7 3l3.5 3.5L7 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>`;
  }).join('');
}

// ════════════════════════════════════════════════
//  MOBILE SIDEBAR
// ════════════════════════════════════════════════
function toggleSidebar(){const layout=document.querySelector('.layout');layout.classList.toggle('sidebar-closed');if(window.innerWidth<=900)document.getElementById('sidebar')?.classList.toggle('open');}
document.addEventListener('click',e=>{if(window.innerWidth<=900&&(e.target.closest('.sb-item')||e.target.closest('.sb-home')))document.getElementById('sidebar')?.classList.remove('open');});

// ════════════════════════════════════════════════
//  KEYBOARD
// ════════════════════════════════════════════════
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();openSearch();}if(e.key==='Escape')closeSearch();});

// ════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════
(function init(){
  window.addEventListener('hashchange', route);
  route();
})();
// ════════════════════════════════════════════════
//  MUSIC PLAYER
// ════════════════════════════════════════════════
var mpState={playlist:[],currentIdx:-1,playing:false,expanded:true,volume:70,mode:"list"};
var mpAudio,mpPlayer,mpMini;


var DEFAULT_PLAYLIST=((function(){
  var p=new URLSearchParams(window.location.search);
  return p.get("playlist")||"149638780";
})());
// ════════════════════════════════════════════════════
//  通过 Vercel 部署的 NeteaseCloudMusicApiEnhanced 调用网易云 API
//  vercel.app 域名被墙，已绑定 dpdns.org 免费域名 heartbeats.dpdns.org
//  将下方 PRIVATE_API 替换为你的自定义域名
var PRIVATE_API="https://heartbeats.dpdns.org";
var PRIVATE_COOKIE="MUSIC_U=0033ED28C60FED9119A910FEE36216C9151796941DC831E87E86692DA582EFC2F3CCF800C83F869AFD8535A8173F0705642D9DAC6E87EC1C3932EC8D01D5B33D476E1704C0BCDF8F30CBDF4D0E3A8AD8570B766A6F33FDD9285FCA4C95B1648CB4B7FCE1942822CBBDF01CA82A73B17B80C1666E36F2C78980AB7AEB683346672C5583563D6E2B18A02686B38D78B80412B6B25CF8DE441373E2606AF681F2D1FE053E1D04A24A43E236502A0E744BE908C21BE25A92EA724B6BD31F7642827DACEBCD08B2A4D86007B429B358A0680CFC0D2ADDC07457192306A6D1010C8BF481C1972C73D9B2E6BE4E73C7C615DB0A864280919D85C49A22E5B20684B5147F6255361E9C24E2E9F9B0F17B4BAB59B8BDC5B48D061DE80E584F7D440ACC3AE21D922DDDFD3D351F045863858A2668916B7B2A863DB0CC55327AB3EFD60891EC8AEBADA18B0C2C2DB578C9F3939ED557E551ABFF4024F14109ED05F9CD4BA64D1E9836E947498DB145D8F7B049F7FB96666D1A9C534E27AC2C0B06E8AD1F37F0ABCDF12DDDD82770104647ACA7B1C6249B; __csrf=4553bb154eb63e6cb02e0a2ffe281c98";

function initMusicPlayer(){
  mpAudio=document.getElementById("mpAudio");
  mpPlayer=document.getElementById("musicPlayer");
  mpMini=mpPlayer; // unified: no separate mini element
  mpAudio.volume=0.7;
  fetchPlaylist(DEFAULT_PLAYLIST);
  mpAudio.addEventListener("timeupdate",updateProgress);
  mpAudio.addEventListener("loadedmetadata",updateTimeDisplay);
  mpAudio.addEventListener("play",function(){updatePlayState(true)});
  mpAudio.addEventListener("pause",function(){updatePlayState(false)});
  mpAudio.addEventListener("ended",onTrackEnd);
  mpAudio.addEventListener("error",function(){console.warn("[music] track error");nextTrack()});
  var bar=document.getElementById("mpProgressBar");
  bar.addEventListener("click",seekTo);
  var dragging=false;
  bar.addEventListener("mousedown",function(e){dragging=true;seekTo(e)});
  document.addEventListener("mousemove",function(e){if(dragging)seekTo(e)});
  document.addEventListener("mouseup",function(){dragging=false});
  document.addEventListener("keydown",function(e){
    if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA")return;
    if(e.code==="Space"&&!e.ctrlKey&&!e.metaKey){e.preventDefault();togglePlay()}
  });
  document.body.classList.add("has-player");
}

async function fetchPlaylist(id){
  // Primary: private API with cookie
  try{
    var resp=await fetch(PRIVATE_API+"/playlist/detail?id="+id+"&cookie="+encodeURIComponent(PRIVATE_COOKIE));
    if(!resp.ok)throw new Error("API");
    var data=await resp.json();
    if(data.code===200&&data.playlist){
      var tracks=data.playlist.tracks||[];
      mpState.playlist=tracks.map(function(t,i){return{id:t.id,title:t.name,artist:(t.ar||[]).map(function(a){return a.name}).join(" / "),album:t.al?t.al.name:"",cover:(t.al?(t.al.picUrl||""):"").replace(/^http:/,"https:")+"?param=200y200",url:null,idx:i}});
      updatePlaylistUI();
      fetchTrackUrls(0,5);
      if(mpState.playlist.length>0&&mpState.currentIdx===-1){mpState.currentIdx=0;playTrack(0)}
      return
    }
  }catch(e){console.log("[music] private API unreachable, trying public",e.message||"")}
  // Fallback: public API
  try{
    var pubResp=await fetch("https://api.music.imsyy.top/playlist/detail?id="+id);
    if(pubResp.ok){var pubData=await pubResp.json();if(pubData.code===200&&pubData.playlist){var t2=pubData.playlist.tracks||[];mpState.playlist=t2.map(function(t,i){return{id:t.id,title:t.name,artist:(t.ar||[]).map(function(a){return a.name}).join(" / "),album:t.al?t.al.name:"",cover:(t.al?(t.al.picUrl||""):"").replace(/^http:/,"https:")+"?param=200y200",url:null,idx:i}});updatePlaylistUI();fetchTrackUrls(0,5);if(mpState.playlist.length>0&&mpState.currentIdx===-1){mpState.currentIdx=0;playTrack(0)}return}}
  }catch(e2){console.log("[music] public API also failed",e2.message||"")}
  // Try backup API first
  try{
    var fbResp=await fetch("https://api.injahow.cn/meting/?server=netease&type=playlist&id="+id);
    if(fbResp.ok){var fbData=await fbResp.json();if(fbData&&fbData.length>0){mpState.playlist=fbData.map(function(t,i){var sid=t.id;if(!sid){var m=(t.lrc||t.url||"").match(/id=(\d+)/);sid=m?parseInt(m[1]):i}return{id:sid,title:t.name||t.title||"",artist:t.artist||t.author||"",album:"",cover:t.pic||t.cover||"",url:t.url||t.mp3||"",idx:i}});updatePlaylistUI();if(mpState.playlist.length>0&&mpState.currentIdx===-1){mpState.currentIdx=0;playTrack(0)}return}}
  }catch(fbE){console.log("[music] backup API also unreachable, using local fallback")}
  mpState.playlist=[
    {id:1,title:"\u6674\u5929",artist:"\u5468\u6770\u4f26",cover:"",idx:0,url:null},
    {id:2,title:"\u591c\u66f2",artist:"\u5468\u6770\u4f26",cover:"",idx:1,url:null},
    {id:3,title:"\u7a3b\u9999",artist:"\u5468\u6770\u4f26",cover:"",idx:2,url:null},
    {id:4,title:"\u4e03\u91cc\u9999",artist:"\u5468\u6770\u4f26",cover:"",idx:3,url:null},
    {id:5,title:"\u9752\u82b1\u74f7",artist:"\u5468\u6770\u4f26",cover:"",idx:4,url:null}
  ];
  updatePlaylistUI();
  if(mpState.currentIdx===-1)selectTrack(0);
}

async function fetchTrackUrls(start,count){
  var ids=mpState.playlist.slice(start,start+count).map(function(t){return t.id}).filter(function(id){return typeof id==="number"});
  if(!ids.length)return;
  // Primary: imsyy API
  try{
    var resp=await fetch(PRIVATE_API+"/song/url/v1?id="+ids.join(",")+"&level=exhigh&cookie="+encodeURIComponent(PRIVATE_COOKIE));
    if(!resp.ok)throw new Error("URL error");
    var data=await resp.json();
    if(data.code===200&&data.data)for(var i=0;i<data.data.length;i++){var item=data.data[i];var track=mpState.playlist.find(function(t){return t.id==item.id});if(track&&item.url)track.url=item.url.replace(/^http:/,"https:")}
  }catch(e){console.log("[music] primary URL fetch failed, trying backup",e.message||"")}
  // Backup: injahow meting API (for tracks that still lack URL)
  var stillNeed=mpState.playlist.slice(start,start+count).filter(function(t){return !t.url}).map(function(t){return t.id});
  if(stillNeed.length){
    try{
      var bResp=await fetch("https://api.injahow.cn/meting/?server=netease&type=url&id="+stillNeed.join(","));
      if(bResp.ok){var bData=await bResp.json();if(Array.isArray(bData)){for(var j=0;j<bData.length;j++){var item=bData[j];if(item.url){var track=mpState.playlist.find(function(t){return t.id==item.id||t.id==stillNeed[j]});if(track)track.url=item.url.replace(/^http:/,"https:")}}}}
    }catch(be){console.log("[music] backup URL fetch also failed")}
  }
}

function selectTrack(idx){if(idx>=0&&idx<mpState.playlist.length){mpState.currentIdx=idx;playTrack(idx)}}
function playTrack(idx){
  var track=mpState.playlist[idx];if(!track)return;
  mpState.playing=true;
  var srcChanged=false;
  if(mpAudio.src!==track.url){mpAudio.src=track.url;srcChanged=true}
  var playPromise=null;
  if(!track.url){fetchTrackUrls(idx,1).then(function(){if(track.url){mpAudio.src=track.url;mpAudio.play().then(function(){mpState.playing=true;updateNowPlaying(idx);updatePlaylistUI()}).catch(function(){mpState.playing=false;updateNowPlaying(idx);updatePlaylistUI()})}else{mpState.playing=false;updateNowPlaying(idx);updatePlaylistUI();console.log("[music] no URL available for track "+idx+", stopped")}document.getElementById("mpLyricCurrent").textContent=track.url?"":"该歌曲无可用链接"});return}
  else playPromise=mpAudio.play();
  if(playPromise){playPromise.then(function(){mpState.playing=true;updateNowPlaying(idx);updatePlaylistUI()}).catch(function(){mpState.playing=false;updateNowPlaying(idx);updatePlaylistUI()})}
}
function updateNowPlaying(idx){
  var track=mpState.playlist[idx];if(!track)return;
  document.title=(mpState.playing?"\u266b ":"")+track.title+" \u2014 "+track.artist+" \u2014 StudyNotes";
  document.getElementById("mpTitle").textContent=track.title;
  document.getElementById("mpArtist").textContent=track.artist;
  var coverSvg="data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#7c5ce7"/><stop offset="100%" stop-color="#d9467a"/></linearGradient></defs><rect width="160" height="160" rx="28" fill="url(#g)"/><circle cx="80" cy="58" r="28" fill="none" stroke="white" stroke-width="3.5" opacity=".85"/><circle cx="80" cy="58" r="8" fill="white" opacity=".85"/><rect x="77" y="86" width="6" height="34" rx="3" fill="white" opacity=".85"/><rect x="56" y="96" width="6" height="16" rx="3" fill="white" opacity=".6"/><rect x="98" y="96" width="6" height="16" rx="3" fill="white" opacity=".6"/></svg>');
  document.getElementById("mpCoverImg").src=track.cover||coverSvg;
  // Update mini row elements
  var mpMiniCoverImg=document.getElementById("mpMiniCoverImg");
  if(mpMiniCoverImg)mpMiniCoverImg.src=track.cover||coverSvg;
  var miniTitle=document.getElementById("mpMiniTitle");
  var miniTitleWrap=document.getElementById("mpMiniTitleWrap");
  if(miniTitle){
    miniTitle.textContent=track.title||"";
    miniTitle.classList.remove("scrolling");
    setTimeout(function(){
      if(miniTitleWrap&&miniTitle.scrollWidth>miniTitleWrap.clientWidth+2){
        var dist=-(miniTitle.scrollWidth-miniTitleWrap.clientWidth+16);
        miniTitle.style.setProperty("--scroll-dist",dist+"px");
        miniTitle.classList.add("scrolling");
      }
    },200);
  }
  var miniArtist=document.getElementById("mpMiniArtist");if(miniArtist)miniArtist.textContent=track.artist||"";
  var coverBg=track.cover||coverSvg;if(coverBg)document.getElementById("musicBg").style.backgroundImage="url("+coverBg+")";
  lyricActiveIdx=-1;
  fetchLyric();
}
function updatePlayState(playing){
  mpState.playing=playing;
  if(mpState.currentIdx>=0){updateNowPlaying(mpState.currentIdx);updatePlaylistUI()}
  document.getElementById("mpPlayIcon").style.display=playing?"none":"";
  document.getElementById("mpPauseIcon").style.display=playing?"":"none";
  document.getElementById("mmPlaySvg").style.display=playing?"none":"";
  document.getElementById("mmPauseSvg").style.display=playing?"":"none";
}
function togglePlay(){
  if(mpState.currentIdx===-1&&mpState.playlist.length>0){selectTrack(0);return}
  if(mpAudio.paused){mpState.playing=true;mpAudio.play().catch(function(){})}
  else{mpState.playing=false;mpAudio.pause()}
  if(mpState.currentIdx>=0){updateNowPlaying(mpState.currentIdx);updatePlaylistUI()}
}
function prevTrack(){if(mpState.currentIdx===-1)return;if(mpState.mode==="single"){mpAudio.currentTime=0;mpAudio.play().catch(function(){});return}if(mpState.mode==="random"){var idx;do{idx=Math.floor(Math.random()*mpState.playlist.length)}while(idx===mpState.currentIdx&&mpState.playlist.length>1);selectTrack(idx)}else{var idx=mpState.currentIdx-1;if(idx<0)idx=mpState.playlist.length-1;selectTrack(idx)}}
function nextTrack(){if(mpState.currentIdx===-1)return;if(mpState.mode==="single"){mpAudio.currentTime=0;mpAudio.play().catch(function(){});return}if(mpState.mode==="random"){var idx;do{idx=Math.floor(Math.random()*mpState.playlist.length)}while(idx===mpState.currentIdx&&mpState.playlist.length>1);selectTrack(idx)}else{var idx=mpState.currentIdx+1;if(idx>=mpState.playlist.length)idx=0;selectTrack(idx)}}
function onTrackEnd(){if(mpState.mode==="single"){mpAudio.currentTime=0;mpAudio.play().catch(function(){})}else if(mpState.mode==="random"){var idx;do{idx=Math.floor(Math.random()*mpState.playlist.length)}while(idx===mpState.currentIdx&&mpState.playlist.length>1);selectTrack(idx)}else nextTrack()}
function toggleMode(){var modes=["list","single","random"];var idx=modes.indexOf(mpState.mode);mpState.mode=modes[(idx+1)%modes.length];updateModeIcon()}
function updateModeIcon(){
  document.getElementById("mpModeLoop").style.display=mpState.mode==="list"?"":"none";
  document.getElementById("mpModeSingle").style.display=mpState.mode==="single"?"":"none";
  document.getElementById("mpModeShuffle").style.display=mpState.mode==="random"?"":"none";
}
function seekTo(e){if(!mpAudio.duration)return;var rect=document.getElementById("mpProgressBar").getBoundingClientRect();var ratio=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));mpAudio.currentTime=ratio*mpAudio.duration}
function updateProgress(){if(!mpAudio.duration)return;var pct=(mpAudio.currentTime/mpAudio.duration)*100;document.getElementById("mpProgressFill").style.width=pct+"%";document.getElementById("mpProgressThumb").style.left=pct+"%";updateTimeDisplay();updateLyricHighlight()}
function updateTimeDisplay(){var cur=mpAudio.currentTime||0,dur=mpAudio.duration||0;document.getElementById("mpTime").textContent=fmtTime(cur)+" / "+(dur?fmtTime(dur):"--:--")}
function fmtTime(s){var m=Math.floor(s/60),sec=Math.floor(s%60);return m+":"+String(sec).padStart(2,"0")}
function setVolume(v){mpState.volume=v;mpAudio.volume=v/100}
function toggleMute(){if(mpAudio.volume>0){mpAudio.volume=0;document.getElementById("mpVolSlider").value=0}else{mpAudio.volume=mpState.volume/100;document.getElementById("mpVolSlider").value=mpState.volume}}
function minimizePlayer(){mpState.expanded=false;mpPlayer.classList.add("minimized");document.body.classList.remove("has-player");
// Close lyrics when minimizing
var lc=document.getElementById("mpInlineLyric");
var lb=document.getElementById("mpLyricBtn");
if(lc&&!lc.classList.contains("hidden")){lc.classList.add("hidden");lb.style.color="";lb.style.background=""}
// Snap to nearest edge after CSS transition completes
setTimeout(function(){
  var el=mpPlayer;
  var pw=el.offsetWidth,ph=el.offsetHeight;
  var w=window.innerWidth,h=window.innerHeight;
  var GAP=20,TOPGAP=70;
  var curRight=parseFloat(el.style.right)||GAP;
  var curBottom=parseFloat(el.style.bottom)||GAP;
  var posX=w-curRight-pw;
  var posY=h-curBottom-ph;
  var snapRight=posX<w/2?(w-pw-GAP):GAP;
  var snapBottom=posY<h/2?(h-ph-TOPGAP):GAP;
  el.style.transition="right .42s cubic-bezier(.22,.61,.36,1),bottom .42s cubic-bezier(.22,.61,.36,1),max-height .5s cubic-bezier(.16,1,.3,1)";
  el.style.right=snapRight+"px";
  el.style.bottom=snapBottom+"px";
  setTimeout(function(){el.style.transition=""},500);
  // sync playlist if open
  var pp=document.getElementById("mpPlaylistPopup");
  if(pp&&pp.classList.contains("show"))positionPlaylistPopup(pp,el);
  // Reposition after minify animation ends
  setTimeout(function(){
    var pp2=document.getElementById("mpPlaylistPopup");
    if(pp2&&pp2.classList.contains("show"))positionPlaylistPopup(pp2,mpPlayer);
  },550);
},150)}
function expandPlayer(){mpState.expanded=true;mpPlayer.classList.remove("minimized");document.body.classList.add("has-player");
setTimeout(function(){
  var el=mpPlayer;
  var pw=el.offsetWidth,ph=el.offsetHeight;
  var w=window.innerWidth,h=window.innerHeight;
  var GAP=20,TOPGAP=70;
  var curRight=parseFloat(el.style.right)||GAP;
  var curBottom=parseFloat(el.style.bottom)||GAP;
  el.style.right=Math.max(GAP,Math.min(w-pw-GAP,curRight))+"px";
  el.style.bottom=Math.max(GAP,Math.min(h-ph-TOPGAP,curBottom))+"px";
  var pp=document.getElementById("mpPlaylistPopup");
  if(pp&&pp.classList.contains("show"))positionPlaylistPopup(pp,el);
  // Reposition playlist after full expansion animation ends (max-height .5s + body fade .3s + .15s)
  setTimeout(function(){
    var pp2=document.getElementById("mpPlaylistPopup");
    if(pp2&&pp2.classList.contains("show"))positionPlaylistPopup(pp2,mpPlayer);
  },550);
  // Auto-open lyrics when expanding
  var lc=document.getElementById("mpInlineLyric");
  var lb=document.getElementById("mpLyricBtn");
  if(lc&&lc.classList.contains("hidden")&&mpState.currentIdx>=0){
    lc.classList.remove("hidden");
    fetchLyric();
    lb.style.color="var(--c-ac)";
    lb.style.background="var(--c-acbg)";
  }
},150)}
function expandPlayerFromMini(){expandPlayer();if(mpState.currentIdx>=0&&mpAudio.paused)mpAudio.play().catch(function(){})}
// handlePlayerClick removed: click-to-expand handled in drag IIFE
function positionPlaylistPopup(pp,playerEl){
  var GAP=20,TOPGAP=70;
  var pw=playerEl.offsetWidth,ph=playerEl.offsetHeight;
  var w=window.innerWidth,h=window.innerHeight;
  var pr=parseFloat(playerEl.style.right)||GAP;
  var pb=parseFloat(playerEl.style.bottom)||GAP;
  var playerLeft=w-pr-pw,playerTop=h-pb-ph;
  var playerRight=playerLeft+pw,playerBottom=playerTop+ph;
  var ppW=pp.offsetWidth||360,ppH=pp.offsetHeight||260;
  pp.style.bottom="auto";pp.style.top="auto";pp.style.left="auto";pp.style.right="auto";
  // Horizontal: align with player, but keep within bounds
  if(playerLeft+playerRight<w){ // player on left half -> align playlist right edge to player's right edge
    pp.style.right=Math.max(GAP,Math.min(w-ppW-GAP,pr))+"px";
    pp.style.left="auto";
  }else{ // player on right half -> align playlist left edge to player's left edge
    pp.style.left=Math.max(GAP,Math.min(w-ppW-GAP,playerLeft))+"px";
    pp.style.right="auto";
  }
  // Vertical: below if player in upper half, above if player in lower half
  if(playerTop+ph/2<h/2){
    pp.style.top=Math.max(TOPGAP,playerBottom+8)+"px";
    pp.style.bottom="auto";
  }else{
    var above=playerTop-ppH-8;
    if(above>=TOPGAP){pp.style.top=above+"px";pp.style.bottom="auto"}
    else{pp.style.bottom=Math.max(GAP,h-playerTop+8)+"px";pp.style.top="auto"}
  }
}
function togglePlaylist(e){
  if(e)e.stopPropagation();
  var p=document.getElementById("mpPlaylistPopup");
  var bd=document.getElementById("mpPlBackdrop");
  var showing=!p.classList.contains("show");
  p.classList.toggle("show");
  if(showing){
    bd.classList.add("show");
    updatePlaylistUI();
    // Position: sync with player's actual position (not hardcoded 20px)
    positionPlaylistPopup(p,mpPlayer);
    // Scroll active item into view
    setTimeout(function(){
      var active=document.querySelector(".mp-pl-item.active");
      if(active)active.scrollIntoView({block:"center",behavior:"smooth"});
    },350);
  }else{
    bd.classList.remove("show");
  }
}
function toggleLyric(){var lb=document.getElementById("mpLyricBtn");var lc=document.getElementById("mpInlineLyric");if(lc.classList.contains("hidden")){lc.classList.remove("hidden");fetchLyric();lb.style.color="var(--c-ac)";lb.style.background="var(--c-acbg)"}else{lc.classList.add("hidden");lb.style.color="";lb.style.background=""}}
var lyricCache={},lyricLines=[],lyricActiveIdx=-1;
async function fetchLyric(){
  var track=mpState.playlist[mpState.currentIdx];if(!track)return;
  if(!track.id){document.getElementById("mpLyricCurrent").textContent="暂无歌词信息";return}
  if(lyricCache[track.id]){renderLyric(lyricCache[track.id]);return}
  document.getElementById("mpLyricCurrent").textContent="加载歌词中…";
  document.getElementById("mpLyricNext").textContent="";
  var lrc=null;
  function tFetch(url){return new Promise(function(r,j){var c=new AbortController();var t=setTimeout(function(){c.abort()},8000);fetch(url,{signal:c.signal}).then(function(v){clearTimeout(t);v.ok?r(v):j(new Error("status "+v.status))}).catch(function(e){clearTimeout(t);j(e)})})}
  try{var r1=await tFetch(PRIVATE_API+"/lyric?id="+track.id+"&cookie="+encodeURIComponent(PRIVATE_COOKIE));var d1=await r1.json();if(d1&&d1.lrc&&d1.lrc.lyric)lrc=d1.lrc.lyric}catch(e){console.log("[lyric] primary failed")}
  if(!lrc){try{var r2=await tFetch("https://api.injahow.cn/meting/?server=netease&type=lrc&id="+track.id);var txt=await r2.text();if(txt&&txt.indexOf("[")===0)lrc=txt}catch(e2){console.log("[lyric] backup failed")}}
  if(lrc){lyricCache[track.id]=lrc;renderLyric(lrc)}else{document.getElementById("mpLyricCurrent").textContent="获取歌词失败";document.getElementById("mpLyricNext").textContent=""}
}
function renderLyric(lrc){
  lyricLines=[];lyricActiveIdx=-1;
  var lines=lrc.split("\n");
  for(var i=0;i<lines.length;i++){
    var m=lines[i].match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
    if(m){var time=parseInt(m[1])*60+parseInt(m[2])+parseInt(m[3])/1000;var text=m[4].trim();if(text)lyricLines.push({time:time,text:text})}
  }
  document.getElementById("mpLyricCurrent").textContent=lyricLines.length?"点击播放查看歌词":"暂无歌词";
  document.getElementById("mpLyricNext").textContent="";
  if(lyricLines.length)updateLyricHighlight();
}
function seekToLyric(idx){if(lyricLines[idx]){mpAudio.currentTime=lyricLines[idx].time;if(mpAudio.paused)mpAudio.play().catch(function(){})}}
function updateLyricHighlight(){
  if(!lyricLines.length)return;
  var t=mpAudio.currentTime;var cur=-1;
  for(var i=0;i<lyricLines.length;i++){if(lyricLines[i].time<=t)cur=i;else break}
  if(cur!==lyricActiveIdx){
    lyricActiveIdx=cur;
    document.getElementById("mpLyricCurrent").textContent=cur>=0?lyricLines[cur].text:"";
    document.getElementById("mpLyricNext").textContent=(cur>=0&&cur+1<lyricLines.length)?lyricLines[cur+1].text:"";
  }
}

function scrollActiveInPlaylist(){
  var pp=document.getElementById("mpPlaylistPopup");
  if(!pp||!pp.classList.contains("show"))return;
  setTimeout(function(){
    var active=document.querySelector(".mp-pl-item.active");
    if(active)active.scrollIntoView({block:"center",behavior:"smooth"});
  },200);
}
function updatePlaylistUI(){
  document.getElementById("mpPlCount").textContent=mpState.playlist.length+" \u9996";
  // Update header: show \u266b only when tracks are loaded
  var hdr=document.getElementById("mpPlHeaderText");
  if(hdr)hdr.textContent=(mpState.playlist.length>0?"\u266b ":"")+"\u64ad\u653e\u5217\u8868";
  var H="",isPlaying=mpState.playing;
  for(var i=0;i<mpState.playlist.length;i++){
    var t=mpState.playlist[i];
    var isActive=mpState.currentIdx===t.idx;
    H+="<div class=\"mp-pl-item"+(isActive?" active":"")+"\" onclick=\"selectTrack("+t.idx+");togglePlaylist()\"><span class=\"pli-idx\">"+String(t.idx+1).padStart(2,"0")+"</span>";
    if(isActive&&isPlaying){H+="<span class=\"pli-playing\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 14 14\"><rect x=\"2\" y=\"0\" width=\"2\" height=\"6\" rx=\"0.5\" fill=\"var(--c-ac)\"><animate attributeName=\"height\" values=\"6;12;6\" dur=\"0.8s\" repeatCount=\"indefinite\"/><animate attributeName=\"y\" values=\"4;2;4\" dur=\"0.8s\" repeatCount=\"indefinite\"/></rect><rect x=\"6\" y=\"0\" width=\"2\" height=\"10\" rx=\"0.5\" fill=\"var(--c-ac)\"><animate attributeName=\"height\" values=\"10;6;10\" dur=\"0.8s\" begin=\"0.2s\" repeatCount=\"indefinite\"/><animate attributeName=\"y\" values=\"2;4;2\" dur=\"0.8s\" begin=\"0.2s\" repeatCount=\"indefinite\"/></rect><rect x=\"10\" y=\"0\" width=\"2\" height=\"8\" rx=\"0.5\" fill=\"var(--c-ac)\"><animate attributeName=\"height\" values=\"8;14;8\" dur=\"0.8s\" begin=\"0.4s\" repeatCount=\"indefinite\"/><animate attributeName=\"y\" values=\"3;0;3\" dur=\"0.8s\" begin=\"0.4s\" repeatCount=\"indefinite\"/></rect></svg></span>"}else if(isActive){H+="<span class=\"pli-paused\" style=\"width:18px;display:inline-flex;align-items:center;justify-content:center\"><svg width=\"10\" height=\"12\" viewBox=\"0 0 10 12\"><path d=\"M0.5,0 L10,6 L0.5,12 Z\" fill=\"var(--c-ac)\"/></svg></span>"}else{H+="<span class=\"pli-idle-dot\" style=\"width:18px\"></span>"}
    H+="<span class=\"pli-title\">"+t.title+"</span><span class=\"pli-artist\">"+t.artist+"</span></div>";
  }
  document.getElementById("mpPlList").innerHTML=H;
  scrollActiveInPlaylist();
}
function addHeroParticles(){
  var hero=document.querySelector(".hero");if(!hero)return;
  var container=document.createElement("div");container.className="hero-particles";
  for(var i=0;i<12;i++){var p=document.createElement("div");p.className="hero-particle";var size=2+Math.random()*4;p.style.cssText="width:"+size+"px;height:"+size+"px;left:"+(5+Math.random()*90)+"%;animation-duration:"+(6+Math.random()*8)+"s;animation-delay:"+(Math.random()*8)+"s";container.appendChild(p)}
  hero.appendChild(container);
}
document.addEventListener("DOMContentLoaded",function(){
  setTimeout(initMusicPlayer,600);
// Player already positioned via CSS (bottom:20px;right:20px) — no manual init needed
  var root=document.getElementById("pageRoot");
  if(root){var observer=new MutationObserver(function(){if(document.querySelector(".hero")&&!document.querySelector(".hero-particles"))addHeroParticles()});observer.observe(root,{childList:true,subtree:false})}
});
