// Add methods to the global "window" object

import * as Cookies from 'js-cookie';

import TestApp from './testApp';
import { Config, getDefaultConfig, getConfigFromUrl, getConfigFromStorage, clearStorage } from './config';
import { onSubmitForm, onFormData } from './form';
import { toQueryString } from './util';
import { FormDataEvent } from './types';
import { buildWidgetConfig } from './widget';

declare global {
  interface Window {
    _testApp: TestApp;
    _cookies: object;
    onSubmitForm: (event: Event) => void;
    onFormData: (event: FormDataEvent) => void;
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
window.onSubmitForm = onSubmitForm;
window.onFormData = onFormData;

// Login page, read config from URL
window.getWidgetConfig = function(): any {
  const siwConfig = window.location.search ? getConfigFromUrl() : getDefaultConfig();
  return buildWidgetConfig(siwConfig);
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
