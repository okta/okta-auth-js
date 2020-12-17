import { DEFAULT_CODE_CHALLENGE_METHOD, OktaAuth } from '@okta/okta-auth-js';
import pkce from '../../lib/pkce';

describe('pkce API', function() {
  let oktaAuth;
  beforeEach(() => {
    oktaAuth = new OktaAuth({
      issuer: 'http://fakey'
    });
  });

  describe('DEFAULT_CODE_CHALLENGE_METHOD', () => {
    it('has DEFAULT_CODE_CHALLENGE_METHOD defined', () => {
      expect(oktaAuth.pkce.DEFAULT_CODE_CHALLENGE_METHOD).toBe(DEFAULT_CODE_CHALLENGE_METHOD);
    });
  });
  describe('generateVerifier', () => {
    it('method exists and calls pkce.generateVerifier', () => {
      expect(typeof oktaAuth.pkce.generateVerifier).toBe('function');
      expect(oktaAuth.pkce.generateVerifier).toBe(pkce.generateVerifier);
    });
  });

  describe('computeChallenge', function() {
    it('method exists and calls pkce.computeChallenge', async () => {
      expect(typeof oktaAuth.pkce.computeChallenge).toBe('function');
      expect(oktaAuth.pkce.computeChallenge).toBe(pkce.computeChallenge);
    });
  });
});