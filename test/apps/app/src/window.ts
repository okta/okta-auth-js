/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


// Add methods to the global "window" object

import * as Cookies from 'js-cookie';

import TestApp from './testApp';
import {
  Config,
  getConfigFromUrl,
  getConfigFromStorage,
  flattenConfig,
  saveConfigToStorage
} from './config';
import { onSubmitForm, onFormData, showConfigForm } from './form';
import { toQueryString } from './util';
import { FormDataEvent } from './types';
import { renderWidget, buildWidgetConfig } from './widget';

declare global {
  interface Window {
    _testApp: TestApp;
    _cookies: object;
    onSubmitForm: (event: Event) => void;
    onFormData: (event: FormDataEvent) => void;
    bootstrapLanding: () => void;
    bootstrapLoginCallback: () => void;
    bootstrapRenew: () => void;
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
  saveConfigToStorage(config);

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
    return window.location.search ? getConfigFromUrl() : getConfigFromStorage();
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
    const siwConfig = window.getConfig();
    return buildWidgetConfig(siwConfig);
  },
  renderWidget: function(event?: Event, extraConfig?: Config): any {
    if (event) {
      event.preventDefault();
    }
    const config = Object.assign({}, window.getConfig(), extraConfig);
    return renderWidget(config);
  },
  // Regular landing, read config from URL
  bootstrapLanding: function(): void {
    config = window.getConfig();
    mount();
    app.bootstrapHome();
  },

  // Callback, read config from storage
  bootstrapLoginCallback: function(): void {
    config = getConfigFromStorage();
    mount();
    app.bootstrapLoginCallback();
  },

  bootstrapRenew: function(): void {
    rootElem.innerHTML = 'Loading...';
    window.postMessage({
      name:'crossTabTest_ready'
    }, window.parent.location.origin);
    window.addEventListener('message', (e) => {
      if (e.data?.name === 'crossTabTest_bootstrap') {
        const { expireEarlySeconds } = e.data;
        config = getConfigFromStorage();
        config.tokenManager = {
          ...(config.tokenManager || {}),
          expireEarlySeconds,
          autoRenew: true,
          autoRemove: false,
          syncStorage: config?.tokenManager?.syncStorage,
        };
        config.services = {
          electionChannelName: config.clientId + '_crossTabTest'
        };
        config.isTokenRenewPage = true;
    
        mount();
        app.bootstrapRenew();
      }
    });
  },

  bootstrapProtected: function(): void {
    config = window.getConfig();
    mount();
    app.bootstrapProtected();
  }
});
