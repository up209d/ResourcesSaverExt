import React from 'react';
import ReactDOM from 'react-dom';
import 'reset-css/reset.css';
import './index.scss';
import App from './app';

// window.onload = () => {};

chrome.tabs.get(chrome.devtools.inspectedWindow.tabId, function(initialTab) {
  ReactDOM.render(<App initialTab={initialTab} theme={window.theme} />, document.getElementById('root'));
  setTimeout(() => {
    document.getElementById('preload').setAttribute('data-hidden', '');
  }, 150);
});
