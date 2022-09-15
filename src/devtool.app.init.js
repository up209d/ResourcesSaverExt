const devToolTheme = chrome && chrome.devtools && chrome.devtools.panels && chrome.devtools.panels['themeName'];
const preload = document.getElementById('preload');

window.theme = devToolTheme && devToolTheme.toLowerCase().includes('dark') ? 'dark' : 'light';
if (preload) preload.setAttribute(`data-${window.theme}`, ``);
console.log('[DEVTOOL]: Light/Dark Theme Detection initialized!');
