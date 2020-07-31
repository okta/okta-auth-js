/* entry point for SPA application */
/* global window, document */

import '@okta/okta-auth-js/polyfill';

import Cookies from 'js-cookie';

import TestApp from './testApp';
import { getDefaultConfig, getConfigFromUrl, getConfigFromStorage, clearStorage } from './config';

let app;
let config;
const rootElem = document.getElementById('root');

function mount() {
  // Create the app as a function of config
  app = new TestApp(config);

  // Expose for console fiddling
  window._testApp = app;
  window._cookies = Cookies;

  app.mount(window, rootElem);
  return app;
}

// Login page, read config from URL
window.getWidgetConfig = function() {
  const siwConfig = window.location.search ? getConfigFromUrl() : getDefaultConfig();
  Object.assign(siwConfig, {
    baseUrl: config.issuer.split('/oauth2')[0],
    el: '#widget',
    authParams: {
      display: 'page'
    }
  });
  return siwConfig;
};

// Regular landing, read config from URL
window.bootstrapLanding = function() {
  config = window.location.search ? getConfigFromUrl() : getDefaultConfig();
  mount();
  app.bootstrapHome();
};

// Callback, read config from storage
window.bootstrapCallback = function() {
  config = getConfigFromStorage() || getDefaultConfig();
  clearStorage();
  mount();
  app.bootstrapCallback();
};

window.addEventListener('load', () => {
  rootElem.classList.add('loaded');
});
