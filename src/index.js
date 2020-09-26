import React from 'react';
import ReactDOM from 'react-dom';
import 'reset-css/reset.css';
import './index.scss';
import App from './app';

window.onload = () => {
  setTimeout(() => {
    ReactDOM.render(
      <App theme={window.theme} />,
      document.getElementById('root')
    );
    setTimeout(() => {
      document
        .getElementById('preload')
        .setAttribute('data-hidden', '');
    }, 500);
  });
};
