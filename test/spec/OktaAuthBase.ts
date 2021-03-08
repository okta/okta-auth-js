import OktaAuthBase from '../../lib/OktaAuthBase';

describe('OktaAuthBase', () => {
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
    'storageUtil',
  ];

  const objOptions = [
    'storageManager',
  ];

  const savedOptions = apiUrlOptions
  .concat(fnOptions)
  .concat(objOptions)
  .concat([
    'clientId',
    'redirectUri',
    'state',
    'scopes',
    'postLogoutRedirectUri',
    'responseMode',
    'responseType',
    'pkce',
    'headers',
    'devMode',

    'cookies',
    'ignoreSignature'
  ]);

  describe('constructor', function() {
    
    it('saves expected options', () => {
      const config = {};
      savedOptions.forEach((option) => {
        let val: string | object | boolean = 'fake_' + option;
        switch (option) {
          case 'issuer':
            val = 'http://' + val;
            break;
          case 'storageManager':
            val = {
              token: {},
              transaction: {}
            };
            break;
          case 'ignoreSignature':
            val = true;
            break;
        }
        config[option] = val;
      });
      const oa = new OktaAuthBase(config);
      savedOptions.forEach((option) => {
        expect(oa.options[option]).toEqual(config[option]);
      });
    });

    it('removes trailing slash from api urls', () => {
      const config = {};
      apiUrlOptions.forEach((option) => {
        config[option] = 'http://fake_' + option + '/';
      });
      const oa = new OktaAuthBase(config);
      apiUrlOptions.forEach((option) => {
        expect(oa.options[option] + '/').toBe(config[option]);
      });
    });

    it('accepts some options as functions', () => {
      const config = { issuer: 'http://fake' };
      fnOptions.forEach((option) => {
        config[option] = function () {};
      });
      const oa = new OktaAuthBase(config);
      fnOptions.forEach((option) => {
        expect(oa.options[option]).toBe(config[option]);
      });
    });
  });
});