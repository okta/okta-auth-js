var builderUtil  = require('../../lib/builderUtil');
var SDK_VERSION = require('../../package.json').version;

describe('builderUtil', () => {

  describe('getUserAgent', () => {
    it('should return userAgent if "userAgent" is provided in args', () => {
      const args = { 
        userAgent: {
          value: 'fake userAgent'
        }
      };
      const userAgent = builderUtil.getUserAgent(args);
      expect(userAgent).toEqual('fake userAgent');
    });
    it('should replace "$OKTA_AUTH_JS" with current authJs version if only with userAgentTemplate in args', () => {
      const args = { 
        userAgent: {
          template: 'fake userAgent $OKTA_AUTH_JS' 
        } 
      };
      const userAgent = builderUtil.getUserAgent(args);
      expect(userAgent).toEqual(`fake userAgent okta-auth-js/${SDK_VERSION}`);
    });
    it('should return undefined if neither with userAgent nor userAgentTemplate in args', () => {
      const args = {};
      const userAgent = builderUtil.getUserAgent(args);
      expect(userAgent).toEqual('');
    });
  });

});