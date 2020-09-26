//console.log('Hello from -> Devtool');
chrome.devtools.panels.create(
  'ResourcesSaver',
  'icon.gif',
  'index.html',
  function(panel) {
    console.log('Content is loaded to panel', panel);
  }
);
