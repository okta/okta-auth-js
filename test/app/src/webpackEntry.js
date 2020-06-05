/* entry point for SPA application */

// polyfill TextEncoder for IE Edge
import { TextEncoder } from 'text-encoding';
if (typeof window.TextEncoder === 'undefined') {
  window.TextEncoder = TextEncoder;
}

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
