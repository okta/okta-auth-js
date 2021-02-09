import { OktaAuth } from '@okta/okta-auth-js';
import { getOAuthUrls } from '../../../../lib/oidc/util';

describe('getOAuthUrls', function() {
  function setupOAuthUrls(options) {
    var sdk = new OktaAuth(options.oktaAuthArgs || {
      pkce: false,
      issuer: 'https://auth-js-test.okta.com'
    });

    var result, error;
    try {
      result = getOAuthUrls(sdk, options.options);
    } catch(e) {
      error = e;
    }

    if (options.expectedResult) {
      expect(result).toEqual(options.expectedResult);
    }

    if (options.expectedError) {
      expect(error.name).toEqual(options.expectedError.name);
      expect(error.message).toEqual(options.expectedError.message);
      expect(error.errorCode).toEqual('INTERNAL');
      expect(error.errorSummary).toEqual(options.expectedError.message);
      expect(error.errorLink).toEqual('INTERNAL');
      expect(error.errorId).toEqual('INTERNAL');
      expect(error.errorCauses).toEqual([]);
    }
  }

  it('throws if an extra options object is passed', () => {
    const sdk = new OktaAuth({
      pkce: false,
      issuer: 'https://auth-js-test.okta.com'
    });

    const f = function () {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore     
      // @ts-ignore
      getOAuthUrls(sdk, {}, {});
    };
    expect(f).toThrowError('As of version 3.0, "getOAuthUrls" takes only a single set of options');
  });
  
  it('defaults all urls using global defaults', function() {
    setupOAuthUrls({
      expectedResult: {
        issuer: 'https://auth-js-test.okta.com',
        logoutUrl: 'https://auth-js-test.okta.com/oauth2/v1/logout',
        revokeUrl: 'https://auth-js-test.okta.com/oauth2/v1/revoke',
        tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
        userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
      }
    });
  });
  it('sanitizes forward slashes', function() {
    setupOAuthUrls({
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com/',
        logoutUrl: 'https://auth-js-test.okta.com/oauth2/v1/logout/',
        tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token/',
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize/',
        userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo/'
      },
      expectedResult: {
        issuer: 'https://auth-js-test.okta.com',
        logoutUrl: 'https://auth-js-test.okta.com/oauth2/v1/logout',
        revokeUrl: 'https://auth-js-test.okta.com/oauth2/v1/revoke',
        tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
        userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
      }
    });
  });
  it('overrides defaults with options', function() {
    setupOAuthUrls({
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://bad.okta.com',
        logoutUrl: 'https://bad.okta.com/oauth2/v1/logout',
        revokeUrl: 'https://bad.okta.com/oauth2/v1/revoke',
        tokenUrl: 'https://bad.okta.com/oauth2/v1/token',
        authorizeUrl: 'https://bad.okta.com/oauth2/v1/authorize',
        userinfoUrl: 'https://bad.okta.com/oauth2/v1/userinfo'
      },
      options: {
        issuer: 'https://auth-js-test.okta.com',
        logoutUrl: 'https://overrid-js-test.okta.com/oauth2/v1/logout',
        revokeUrl: 'https://override-js-test.okta.com/oauth2/v1/revoke',
        tokenUrl: 'https://override-js-test.okta.com/oauth2/v1/token',
        authorizeUrl: 'https://override-js-test.okta.com/oauth2/v1/authorize',
        userinfoUrl: 'https://override-js-test.okta.com/oauth2/v1/userinfo'
      },
      expectedResult: {
        issuer: 'https://auth-js-test.okta.com',
        logoutUrl: 'https://overrid-js-test.okta.com/oauth2/v1/logout',
        revokeUrl: 'https://override-js-test.okta.com/oauth2/v1/revoke',
        tokenUrl: 'https://override-js-test.okta.com/oauth2/v1/token',
        authorizeUrl: 'https://override-js-test.okta.com/oauth2/v1/authorize',
        userinfoUrl: 'https://override-js-test.okta.com/oauth2/v1/userinfo'
      }
    });
  });
  it('sanitizes options with forward slashes', function() {
    setupOAuthUrls({
      options: {
        issuer: 'https://auth-js-test.okta.com/',
        logoutUrl: 'https://auth-js-test.okta.com/oauth2/v1/logout/',
        revokeUrl: 'https://auth-js-test.okta.com/oauth2/v1/revoke/',
        tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token/',
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize/',
        userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo/'
      },
      expectedResult: {
        issuer: 'https://auth-js-test.okta.com',
        logoutUrl: 'https://auth-js-test.okta.com/oauth2/v1/logout',
        revokeUrl: 'https://auth-js-test.okta.com/oauth2/v1/revoke',
        tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
        userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
      }
    });
  });
  it('uses issuer to generate authorizeUrl and userinfoUrl', function() {
    setupOAuthUrls({
      options: {
        issuer: 'https://auth-js-test.okta.com'
      },
      expectedResult: {
        issuer: 'https://auth-js-test.okta.com',
        logoutUrl: 'https://auth-js-test.okta.com/oauth2/v1/logout',
        revokeUrl: 'https://auth-js-test.okta.com/oauth2/v1/revoke',
        tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
        userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
      }
    });
  });
  it('uses authServer issuer to generate authorizeUrl and userinfoUrl', function() {
    setupOAuthUrls({
      options: {
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7'
      },
      expectedResult: {
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
        logoutUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/logout',
        revokeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/revoke',
        tokenUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/token',
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
        userinfoUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo'
      }
    });
  });
  it('allows token requested with only authorizeUrl and userinfoUrl', function() {
    setupOAuthUrls({
      oauthParams: {
        responseType: 'token'
      },
      options: {
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
        userinfoUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo'
      },
      expectedResult: {
        issuer: 'https://auth-js-test.okta.com', // We don't validate the issuer of access tokens, so this is ignored
        logoutUrl: 'https://auth-js-test.okta.com/oauth2/v1/logout',
        revokeUrl: 'https://auth-js-test.okta.com/oauth2/v1/revoke',
        tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token', // we are not using this url for responseType 'token'
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
        userinfoUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo'
      }
    });
  });
});
