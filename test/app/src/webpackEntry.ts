/* entry point for SPA application */

import '@okta/okta-auth-js/polyfill';

import * as Cookies from 'js-cookie';

import TestApp from './testApp';
import { Config, getDefaultConfig, getConfigFromUrl, getConfigFromStorage, clearStorage } from './config';
import { toQueryString } from './util';

declare global {
  interface Window {
    _testApp: TestApp;
    _cookies: object;
    bootstrapLanding: () => void;
    bootstrapCallback: () => void;
    getWidgetConfig: () => any;
    getAuthJSConfig: () => any;
    toQueryString: (obj: any) => string;
  }
}

let app: TestApp;
let config: Config;
const rootElem = document.getElementById('root');

function mount(): TestApp {
  // Create the app as a function of config
  app = new TestApp(config);

  // Expose for console fiddling
  window._testApp = app;
  window._cookies = Cookies;

  app.mount(window, rootElem);
  return app;
}

window.getAuthJSConfig = getDefaultConfig;
window.toQueryString = toQueryString;

// Login page, read config from URL
window.getWidgetConfig = function(): any {
  const siwConfig = window.location.search ? getConfigFromUrl() : getDefaultConfig();
  Object.assign(siwConfig, {
    baseUrl: config.issuer.split('/oauth2')[0],
    el: '#widget',
    authParams: {
      display: 'page',
      pkce: config.pkce
    }
  });
  return siwConfig;
};

// Regular landing, read config from URL
window.bootstrapLanding = function(): void {
  config = window.location.search ? getConfigFromUrl() : getDefaultConfig();
  mount();
  app.bootstrapHome();
};

// Callback, read config from storage
window.bootstrapCallback = function(): void {
  config = getConfigFromStorage() || getDefaultConfig();
  clearStorage();
  mount();
  app.bootstrapCallback();
};

window.addEventListener('load', () => {
  rootElem.classList.add('loaded');
});
