const SDK_VERSION = (global as any).SDK_VERSION;
const NODE_VERSION = (global as any).NODE_VERSION;

import { OktaUserAgent } from '../../lib/http/OktaUserAgent';

const mocked = {
  isBrowser: jest.fn()
};
jest.mock('lib/features', () => {
  return {
    __esModule: true,
    isBrowser: () => mocked.isBrowser()
  };
});

describe('OktaUserAgent', () => {
  const context: any = {};

  beforeEach(() => {
    context.oktaUserAgent = new OktaUserAgent();
  });

  describe('browser env', () => {
    beforeEach(() => {
      mocked.isBrowser.mockReturnValue(true);
      context.expected = `okta-auth-js/${SDK_VERSION}`;
      context.oktaUserAgent = new OktaUserAgent();
    });

    it('gets okta-auth-js and node info in the Okta UA by default', () => {
      const { oktaUserAgent, expected } = context;
      const httpHeader = oktaUserAgent.getHttpHeader();
      expect(httpHeader).toEqual({ 
        'X-Okta-User-Agent-Extended': expected
      });
    });

    it('can add extra environment', () => {
      const { oktaUserAgent, expected } = context;
      oktaUserAgent.addEnvironment('fake/x.y');
      const httpHeader = oktaUserAgent.getHttpHeader();
      expect(httpHeader).toEqual({ 
        'X-Okta-User-Agent-Extended': `${expected} fake/x.y`
      });
    });

    // Reason: OKTA-641280
    it('should return same header after multiple calls', () => {
      const { oktaUserAgent, expected } = context;
      expect(oktaUserAgent.getHttpHeader()).toEqual({
        'X-Okta-User-Agent-Extended': expected
      });
      expect(oktaUserAgent.getHttpHeader()).toEqual({
        'X-Okta-User-Agent-Extended': expected
      });
      expect(oktaUserAgent.getHttpHeader()).toEqual({
        'X-Okta-User-Agent-Extended': expected
      });
      expect(oktaUserAgent.getHttpHeader()).toEqual({
        'X-Okta-User-Agent-Extended': expected
      });
      expect(oktaUserAgent.getHttpHeader()).toEqual({
        'X-Okta-User-Agent-Extended': expected
      });
    });
  });

  describe('node env', () => {
    beforeEach(() => {
      mocked.isBrowser.mockReturnValue(false);
      context.expected = `okta-auth-js/${SDK_VERSION} nodejs/${NODE_VERSION}`;
      context.oktaUserAgent = new OktaUserAgent();
    });

    it('gets okta-auth-js and node info in the Okta UA by default', () => {
      const { oktaUserAgent, expected } = context;
      const httpHeader = oktaUserAgent.getHttpHeader();
      expect(httpHeader).toEqual({ 
        'X-Okta-User-Agent-Extended': expected
      });
    });

    it('can add extra environment', () => {
      const { oktaUserAgent, expected } = context;
      oktaUserAgent.addEnvironment('fake/x.y');
      const httpHeader = oktaUserAgent.getHttpHeader();
      expect(httpHeader).toEqual({ 
        'X-Okta-User-Agent-Extended': `${expected} fake/x.y`
      });
    });

    // Reason: OKTA-641280
    it('should return same header after multiple calls', () => {
      const { oktaUserAgent, expected } = context;
      expect(oktaUserAgent.getHttpHeader()).toEqual({
        'X-Okta-User-Agent-Extended': expected
      });
      expect(oktaUserAgent.getHttpHeader()).toEqual({
        'X-Okta-User-Agent-Extended': expected
      });
      expect(oktaUserAgent.getHttpHeader()).toEqual({
        'X-Okta-User-Agent-Extended': expected
      });
      expect(oktaUserAgent.getHttpHeader()).toEqual({
        'X-Okta-User-Agent-Extended': expected
      });
      expect(oktaUserAgent.getHttpHeader()).toEqual({
        'X-Okta-User-Agent-Extended': expected
      });
    });
  });

  it('can get sdk version', () => {
    const { oktaUserAgent } = context;
    expect(oktaUserAgent.getVersion()).toBe(SDK_VERSION);
  });
});
