/* eslint-disable complexity */
import { 
  OktaAuth, 
  AuthStateManager
} from '@okta/okta-auth-js';

describe('OktaAuth (constructor)', () => {
  const apiUrlOptions = [
    'issuer',
    'tokenUrl',
    'authorizeUrl',
    'userinfoUrl',
    'revokeUrl',
    'logoutUrl',
  ];

  const fnOptions = [
    'httpRequestClient',
    'transformErrorXHR',
    'transformAuthState',
    'restoreOriginalUri',
  ];

  const objOptions = [
    'storageManager',
    'cookies'
  ];

  const savedOptions = apiUrlOptions
  .concat(fnOptions)
  .concat(objOptions)
  .concat([
    'clientId',
    'redirectUri',
    'useInteractionCodeFlow',
    'state',
    'scopes',
    'postLogoutRedirectUri',
    'responseMode',
    'responseType',
    'pkce',
    'headers',
    'devMode',
    'ignoreSignature',
    'storageUtil',
  ]);

  it('saves expected options', () => {
    const config = {};
    savedOptions.forEach((option) => {
      let val: string | object | boolean = 'fake_' + option; // default "fake" value
      switch (option) { // some types are strictly enforced. These should differ from the default
        case 'issuer':
        case 'redirectUri':
          val = 'http://' + val;
          break;
        case 'storageManager':
          val = {
            cache: {
              storageTypes: ['a']
            },
            token: {
              storageTypes: ['a', 'b']
            },
            transaction: {
              storageTypes: ['a', 'b']
            }
          };
          break;
        case 'cookies':
          val = { secure: false };
          break;
        case 'storageUtil':
          val = {
            findStorageType: () => {},
            getStorageByType: () => {
              return {};
            }
          };
          break;
        case 'ignoreSignature':
        case 'devMode':
          val = true;
          break;
        case 'pkce':
          val = false;
          break;
      }
      config[option] = val;
    });
    const oa = new OktaAuth(config);
    savedOptions.forEach((option) => {
      expect(oa.options[option]).toEqual(config[option]);
    });
  });

  it('removes trailing slash from api urls', () => {
    const config = {};
    apiUrlOptions.forEach((option) => {
      config[option] = 'http://fake_' + option + '/';
    });
    const oa = new OktaAuth(config);
    apiUrlOptions.forEach((option) => {
      expect(oa.options[option] + '/').toBe(config[option]);
    });
  });

  it('accepts some options as functions', () => {
    const config = { issuer: 'http://fake' };
    fnOptions.forEach((option) => {
      config[option] = function () {};
    });
    const oa = new OktaAuth(config);
    fnOptions.forEach((option) => {
      expect(oa.options[option]).toBe(config[option]);
    });
  });

  describe('AuthStateManager', () => {
    it('initials authStateManager', () => {
      const config = { issuer: 'http://fake' };
      const oa = new OktaAuth(config);
      expect(oa.authStateManager).toBeDefined();
    });

    it('calls updateAuthState', () => {
      jest.spyOn(AuthStateManager.prototype, 'updateAuthState');
      const config = { issuer: 'http://fake' };
      // eslint-disable-next-line no-new
      new OktaAuth(config);
      expect(AuthStateManager.prototype.updateAuthState).toHaveBeenCalledTimes(1);
    });
  });

});
