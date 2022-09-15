const devToolTheme = chrome && chrome.devtools && chrome.devtools.panels && chrome.devtools.panels["themeName"];
const preload = document.getElementById("preload");
window.theme = devToolTheme && devToolTheme.toLowerCase().includes("dark") ? "dark" : "light";
if (preload) preload.setAttribute(`data-${window.theme}`, ``);
console.log(`[DEVTOOL]: Theme Detection: "${window.theme}"`);

//# sourceMappingURL=devtool.app.c46477f1.js.map
