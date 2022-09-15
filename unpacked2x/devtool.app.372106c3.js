const devToolTheme=chrome&&chrome.devtools&&chrome.devtools.panels&&chrome.devtools.panels.themeName,preload=document.getElementById("preload");window.theme=devToolTheme&&devToolTheme.toLowerCase().includes("dark")?"dark":"light",preload&&preload.setAttribute(`data-${window.theme}`,""),console.log(`[DEVTOOL]: Theme Detection: "${window.theme}"`);
//# sourceMappingURL=devtool.app.372106c3.js.map
