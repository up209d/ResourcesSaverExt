const devToolTheme = chrome && chrome.devtools && chrome.devtools.panels && chrome.devtools.panels['themeName'];

window.theme = devToolTheme && devToolTheme.toLowerCase().includes('dark') ? 'dark' : 'light';

const preload = document.getElementById('preload');
if (preload) preload.setAttribute(`data-${window.theme}`, ``);
