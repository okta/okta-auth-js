const builderUtil  = require('../../lib/builderUtil');

describe('builderUtil', () => {

  describe('getUserAgent', () => {
    it('should return userAgent if "userAgent.value" is provided in args', () => {
      const args = { 
        userAgent: {
          value: 'fake userAgent'
        }
      };
      const userAgent = builderUtil.getUserAgent(args, 'does not matter');
      expect(userAgent).toEqual('fake userAgent');
    });
    it('should replace "$OKTA_AUTH_JS" with current authJs user agent value if only with userAgentTemplate in args', () => {
      const args = { 
        userAgent: {
          template: 'fake userAgent $OKTA_AUTH_JS' 
        } 
      };
      const sdkUserAgentValue = 'okta-auth-js/0.0.0';
      const userAgent = builderUtil.getUserAgent(args, sdkUserAgentValue);
      expect(userAgent).toEqual(`fake userAgent okta-auth-js/0.0.0`);
    });
    it('should return default value if no userAgent object is in args', () => {
      const args = {};
      const userAgent = builderUtil.getUserAgent(args, 'default');
      expect(userAgent).toEqual('default');
    });
    it('should return default vaule if neither with userAgent.value nor userAgent.template in args', () => {
      const args = {
        userAgent: {}
      };
      const userAgent = builderUtil.getUserAgent(args, 'default');
      expect(userAgent).toEqual('default');
    });
    it('should return sdk defined user agent if no userAgent object is in args', () => {
      const args = {};
      const sdkUserAgentValue = 'okta-auth-js-fake/0.0.0';
      const userAgent = builderUtil.getUserAgent(args, sdkUserAgentValue);
      expect(userAgent).toEqual('okta-auth-js-fake/0.0.0');
    });
    it('should return sdk defined user agent if neither with userAgent.value nor userAgent.template in args', () => {
      const args = {
        userAgent: {}
      };
      const sdkUserAgentValue = 'okta-auth-js-fake/0.0.0';
      const userAgent = builderUtil.getUserAgent(args, sdkUserAgentValue);
      expect(userAgent).toEqual('okta-auth-js-fake/0.0.0');
    });
  });

});