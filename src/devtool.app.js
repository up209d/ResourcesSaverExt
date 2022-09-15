import React from 'react';
import { createRoot } from 'react-dom/client';
import 'reset-css/reset.css';
import './global.scss';
import App from './devtoolApp';

window.onload = () => {
  console.log('[DEVTOOL]: Windows is loaded!');
};

chrome.tabs.get(chrome.devtools.inspectedWindow.tabId, function (initialTab) {
  const root = createRoot(document.getElementById('root'));
  root.render(<App initialTab={initialTab} theme={window.theme} />);
});
