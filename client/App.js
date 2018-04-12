import React from 'react';
import ReactDom from 'react-dom';
import { AppContainer } from 'react-hot-loader'; // eslint-disable-line
import App from './App.jsx';

const root = document.getElementById('root');
const render = (Component) => {
  ReactDom.hydrate(<AppContainer><Component /></AppContainer>, root);
}

render(App);

if (module.hot) {
  module.hot.accept('./App.jsx', () => {
    const NextApp = require('./App.jsx').default; // eslint-disable-line
    render(NextApp);
  });
}
