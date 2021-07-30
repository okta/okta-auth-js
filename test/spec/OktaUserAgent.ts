import { OktaUserAgent } from '../../lib/OktaUserAgent';

let mockIsBrowserReturnValue;
jest.mock('../../lib/features', () => ({
  isBrowser: jest.fn().mockImplementation(() => mockIsBrowserReturnValue)
}));

describe('OktaUserAgent', () => {
  let oktaUserAgent;
  let sdkVersion;
  beforeEach(async () => {
    sdkVersion = (await import('../../package.json')).version;
    oktaUserAgent = new OktaUserAgent();
  });

  describe('browser env', () => {
    beforeEach(() => {
      mockIsBrowserReturnValue = true;
    });
    it('gets okta-auth-js and node info in the Okta UA by default', () => {
      const httpHeader = oktaUserAgent.getHttpHeader();
      expect(httpHeader).toEqual({ 
        'X-Okta-User-Agent-Extended': `okta-auth-js/${sdkVersion}`
      });
    });
    it('can add extra environment', () => {
      oktaUserAgent.addEnvironment('fake/x.y');
      const httpHeader = oktaUserAgent.getHttpHeader();
      expect(httpHeader).toEqual({ 
        'X-Okta-User-Agent-Extended': `okta-auth-js/${sdkVersion} fake/x.y` 
      });
    });
  });

  describe('node env', () => {
    let nodeVersion = process.versions.node;
    beforeEach(() => {
      mockIsBrowserReturnValue = false;
    });
    it('gets okta-auth-js and node info in the Okta UA by default', () => {
      const httpHeader = oktaUserAgent.getHttpHeader();
      expect(httpHeader).toEqual({ 
        'X-Okta-User-Agent-Extended': `okta-auth-js/${sdkVersion} nodejs/${nodeVersion}` 
      });
    });
    it('can add extra environment', () => {
      oktaUserAgent.addEnvironment('fake/x.y');
      const httpHeader = oktaUserAgent.getHttpHeader();
      expect(httpHeader).toEqual({ 
        'X-Okta-User-Agent-Extended': `okta-auth-js/${sdkVersion} fake/x.y nodejs/${nodeVersion}` 
      });
    });
  });

  it('can get sdk version', () => {
    expect(oktaUserAgent.getVersion()).toBe(sdkVersion);
  });
});
