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


/* eslint-disable max-statements */
import { Config } from './config';
import { 
  OktaAuth,
  TokenResponse,
  Tokens
} from '@okta/okta-auth-js';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const BundledOktaSignIn = require('@okta/okta-signin-widget');
declare global {
  interface Window {
    OktaSignIn: any;
    getWidgetConfig: () => any;
  }
}

declare class OktaSignIn {
  constructor(options: any);
  renderEl(options: any, successFn: Function, errorFn: Function): void;
  showSignInToGetTokens(options: any): void;
  remove(): void;
  on(event: string, fn: Function): void;
}

let widgetInstance: OktaSignIn; // static variable. Only one widget instance is allowed to exist at a time

export function buildIdpsConfig(config: Config): any {
  const idps = config.idps || '';
  return idps.split(/\s+/).map(idpToken => {
      const [type, id] = idpToken.split(/:/);
      if (!type || !id) {
        return null;
      }
      return { type, id };
    }).filter(idpToken => idpToken);
}

export function buildWidgetConfig(config: Config, options?: unknown): any {
  return Object.assign({}, config, {
    baseUrl: config.issuer.split('/oauth2')[0],
    el: '#widget',
    authParams: Object.assign(config, {
      display: 'page'
    }),
    idps: buildIdpsConfig(config)
  }, options);
}

export async function injectWidgetCSS(widgetVersion = ''): Promise<void> {
  const useBundled = widgetVersion === '';
  const baseUrl = useBundled ? `${window.location.origin}/siw` : 'https://global.oktacdn.com/okta-signin-widget';
  return new Promise((resolve, reject) => {
      // inject CSS
      const link = document.createElement('link');
      link.type='text/css';
      link.rel='stylesheet';
      document.getElementsByTagName('head')[0].appendChild(link);
      link.onload = (): void => { resolve(); };
      link.onerror = (e): void => { reject(e); };
      link.href = `${baseUrl}/${widgetVersion}/css/okta-sign-in.min.css`;
  });
}

export async function injectWidgetScript(widgetVersion: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // inject script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    document.getElementsByTagName('head')[0].appendChild(script);
    script.onload = (): void => { resolve(); };
    script.onerror = (e): void => { reject(e); };
    script.src = `https://global.oktacdn.com/okta-signin-widget/${widgetVersion}/js/okta-sign-in.min.js`;
  }); 
}

export async function injectWidgetFromCDN(widgetVersion: string): Promise<void> {
  await injectWidgetCSS(widgetVersion);
  await injectWidgetScript(widgetVersion);
}

function getTokensFromResponse (res: TokenResponse): Tokens {
  let tokens: Tokens;
  // Older widget versions returned tokens as an array
  if (Array.isArray(res)) {
    tokens = {};
    for (let i = 0; i < res.length; i++) {
      const token = res[i];
      if (token.idToken) {
        tokens.idToken = token;
      } else if (token.accessToken) {
        tokens.accessToken = token;
      }
    }
    return tokens;
  }

  // Current versions return an object map
  tokens = res.tokens;
  return tokens;
}

function hideModal(): void {
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
  widgetInstance.remove();
}

function showModal(): void {
  let modal = document.getElementById('modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal';
    modal.innerHTML = `
      <div>
        <div id="widget-container">
          <div id="widget"></div>
        </div>
      </div>
    `;
    document.body.insertBefore(modal, document.body.firstChild);
  }
  modal.style.display = 'block';
  modal.onclick = function(): void {
    hideModal(); // hide modal when clicking on the modal background
  };
  const widgetEl = document.getElementById('widget');
  widgetEl.onclick = function(event): void {
    event.stopPropagation(); // do not hide modal when clicking on the widget
  };
}

export async function renderWidget(config: Config, authClient?: OktaAuth, options?: unknown): Promise<Tokens> {
  if (!window.OktaSignIn) {
    const siwVersion = config.siwVersion;
    if (siwVersion) {
      await injectWidgetFromCDN(siwVersion);
    } else {
      await injectWidgetCSS();
      window.OktaSignIn = BundledOktaSignIn;
    }
  }

  showModal();
  const widgetConfig = buildWidgetConfig(config, options);
  const { issuer, clientId, clientSecret, redirectUri, forceRedirect, scopes } = config;
  const state = widgetConfig.state || 
    // Server-side test app reads config from state. This is bad security but is convenient for quick testing.
    JSON.stringify({ issuer, clientId, clientSecret, redirectUri, rand: Math.round(Math.random() * 1000) });

  // This test app allows selecting arbitrary widget versions.
  // We must use `renderEl` for compatibility with older versions.
  const renderOptions: any = {
    clientId,
    redirectUri,

    scopes,
    state, // Not working: OKTA-361428
    
    // Return an access token from the authorization server
    getAccessToken: true,

    // Return an ID token from the authorization server
    getIdToken: true,

    // Return a Refresh token from the authorization server
    getRefreshToken: true
  };

  widgetConfig.authParams.state = state; // Must set authParams in constructor: OKTA-361428

  if (forceRedirect) {
    renderOptions.redirect = 'always'; // since version 5.0
    widgetConfig.authParams.display = 'page'; // version < 5.0
  } else {
    widgetConfig.authParams.display = 'none'; // version < 5.0
  }

  // if authClient option is on, all authParams are ignored
  if (config.siwAuthClient) {
    widgetConfig.authParams = undefined;
    widgetConfig.authClient = authClient;
  }

  const signIn = new OktaSignIn(widgetConfig);
  widgetInstance = signIn; // save this widget instance so it can be removed
  signIn.on('afterError', function (context: any, error: any) {
      console.log('Sign-in Widget afterError: ', context.controller, error);
  });
  return new Promise((resolve, reject) => {
    signIn.renderEl(renderOptions,
      (res: any) => {
        console.log(`signin.renderEl: success callback fired: `, res);
        if (res.status === 'SUCCESS') {
          // remove widget
          signIn.remove();
          document.getElementById('modal').style.display = 'none';

          // extract tokens
          const tokens: Tokens = getTokensFromResponse(res);
          resolve(tokens);
        } else {
          // Authn V1 MFA - unhandled
          console.error(`signin.renderEl: result status was ${res.status}`, res);
        }
      },
      (err: any) => {
        console.error(`signin.renderEl: error callback fired`, err);
        reject(err);
      }
    );
  });
}
