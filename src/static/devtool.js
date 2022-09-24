//console.log('Hello from -> Devtool');

const init = () => {
  const version = localStorage.getItem('resources-saver-version');
  if (version === '0.1.8') {
    return chrome.devtools.panels.create('ResourcesSaver', 'icon.gif', 'legacy/0.1.8/devtool.app.html', function (panel) {
      console.log('Content is loaded to panel', panel);
    });
  }

  if (version === '0.1.9') {
    return chrome.devtools.panels.create('ResourcesSaver', 'icon.gif', 'legacy/0.1.9/devtool.app.html', function (panel) {
      console.log('Content is loaded to panel', panel);
    });
  }

  return chrome.devtools.panels.create('ResourcesSaver', 'icon.gif', 'devtool.app.html', function (panel) {
    console.log('Content is loaded to panel', panel);
  });
};

init();
