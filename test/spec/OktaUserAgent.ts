import { OktaUserAgent } from '../../lib/http/OktaUserAgent';

jest.mock('../../lib/features', () => {
  return {
    isBrowser: () => {}
  };
});

const mocked = {
  features: require('../../lib/features')
};

describe('OktaUserAgent', () => {
  let oktaUserAgent;
  let sdkVersion;
  beforeEach(async () => {
    sdkVersion = (await import('../../package.json')).version;
    oktaUserAgent = new OktaUserAgent();
  });

  describe('browser env', () => {
    beforeEach(() => {
      jest.spyOn(mocked.features, 'isBrowser').mockReturnValue(true);
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
      jest.spyOn(mocked.features, 'isBrowser').mockReturnValue(false);
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
