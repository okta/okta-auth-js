import { randomStr } from '../util/random';
import getOktaClient, { OktaClientConfig } from './util/getOktaClient';

type Options = {
  appType: string;
}

export const createApp = async (config: OktaClientConfig, options: Options) => {
  const oktaClient = getOktaClient(config);

  const { appType } = options;
  const testApp = {
    'name': 'oidc_client',
    'label': `Generated E2E Test Client - ${randomStr(6)}`,
    'signOnMode': 'OPENID_CONNECT',
    'credentials': {
      'oauthClient': {
        'token_endpoint_auth_method': appType === 'browser' ? 'none' : 'client_secret_basic'
      }
    },
    'settings': {
      'oauthClient': {
        'client_uri': 'http://localhost:8080',
        'logo_uri': 'http://developer.okta.com/assets/images/logo-new.png',
        'redirect_uris': [
          'http://localhost:8080/login/callback'
        ],
        'post_logout_redirect_uris': [
          'http://localhost:8080'
        ],
        'response_types': [
          'token',
          'id_token',
          'code'
        ],
        'grant_types': [
          'implicit',
          'authorization_code',
          'interaction_code',
          'refresh_token'
        ],
        'application_type': appType,
        'consent_method': 'REQUIRED'
      }
    }
  };

  const app = await oktaClient.createApplication(testApp);
  return app;
}
