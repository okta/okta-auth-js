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

export function buildIdpsConfig(config: Config): any {
  return config.idps.split(/\s+/).map(idpToken => {
      const [type, id] = idpToken.split(/:/);
      if (!type || !id) {
        return null;
      }
      return { type, id };
    }).filter(idpToken => idpToken);
}

export function buildWidgetConfig(config: Config): any {
  return Object.assign({}, config, {
    baseUrl: config.issuer.split('/oauth2')[0],
    el: '#widget',
    authParams: Object.assign(config, {
      display: 'page'
    }),
    idps: buildIdpsConfig(config)
  });
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
}

export async function renderWidget(config: Config, authClient?: OktaAuth): Promise<Tokens> {
  const siwVersion = config.siwVersion;
  if (siwVersion) {
    await injectWidgetFromCDN(siwVersion);
  } else {
    await injectWidgetCSS();
    window.OktaSignIn = BundledOktaSignIn;
  }

  showModal();
  const widgetConfig = buildWidgetConfig(config);
  const { issuer, clientId, clientSecret, redirectUri, forceRedirect, scopes } = config;
  const state = widgetConfig.state || JSON.stringify({ issuer, clientId, clientSecret, redirectUri });

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
    renderOptions.mode = 'remediation'; // since version 5.0
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
