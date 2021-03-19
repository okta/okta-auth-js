// Add methods to the global "window" object

import * as Cookies from 'js-cookie';

import TestApp from './testApp';
import {
  Config,
  getDefaultConfig,
  getConfigFromUrl,
  getConfigFromStorage,
  clearStorage,
  flattenConfig
} from './config';
import { onSubmitForm, onFormData, showConfigForm } from './form';
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
    getConfig: () => any;
    toQueryString: (obj: any) => string;
    constructAppUrl: (basePath: string) => string;
    navigateToApp: (appPath: string, event: Event) => void;
    showConfigForm: (event?: Event) => void;
  }
}

let app: TestApp;
let config: Config;
const rootElem = document.getElementById('root');

window.addEventListener('load', () => {
  rootElem && rootElem.classList.add('loaded');
});

function mount(): TestApp {
  // Create the app as a function of config
  app = new TestApp(config);

  // Expose for console fiddling
  window._testApp = app;
  window._cookies = Cookies;

  app.mount(window, rootElem);
  return app;
}

Object.assign(window, {
  toQueryString: toQueryString,
  onSubmitForm: onSubmitForm,
  onFormData: onFormData,

  getConfig: function(): Config {
    return window.location.search ? getConfigFromUrl() : getDefaultConfig();
  },
  constructAppUrl: function(basePath = ''): string {
    const config = window.getConfig();
    const queryParams = toQueryString(flattenConfig(config));
    return basePath + queryParams;
  },
  navigateToApp: function(appPath = '', event: Event): void {
    event.preventDefault();
    const url = window.constructAppUrl(appPath);
    window.location.assign(url);
  },
  showConfigForm: function(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    const config = window.getConfig();
    showConfigForm(config);
  },
  // Login page, read config from URL
  getWidgetConfig: function(): any {
    const siwConfig = window.location.search ? getConfigFromUrl() : getDefaultConfig();
    return buildWidgetConfig(siwConfig);
  },

  // Regular landing, read config from URL
  bootstrapLanding: function(): void {
    config = window.location.search ? getConfigFromUrl() : getDefaultConfig();
    mount();
    app.bootstrapHome();
  },

  // Callback, read config from storage
  bootstrapCallback: function(): void {
    config = getConfigFromStorage() || getDefaultConfig();
    clearStorage();
    mount();
    app.bootstrapCallback();
  }
});
