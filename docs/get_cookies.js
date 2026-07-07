// 在 music.163.com 的任意页面打开控制台（F12 → Console），粘贴运行
// 会自动整理成一行完整 cookie 并复制到剪贴板
(function() {
  var c = document.cookie.split(';').map(function(s) { return s.trim() }).filter(Boolean).join('; ');
  navigator.clipboard.writeText(c).then(function() {
    console.log('✅ 已复制到剪贴板！共 ' + c.split(';').length + ' 个 cookie');
  }).catch(function() {
    console.log('📋 请手动复制以下内容：\n' + c);
  });
})();
