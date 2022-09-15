//console.log('Hello from -> Devtool');
chrome.devtools.panels.create('ResourcesSaver', 'icon.gif', 'devtool.app.html', function(panel) {
  console.log('Content is loaded to panel', panel);
});
