/* global window */
jest.mock('cross-fetch');

import { OktaAuth } from '@okta/okta-auth-js';
import {
  isInteractionRequired,
  isLoginRedirect,
  hasTokensInHash,
  hasAuthorizationCode,
  hasInteractionCode
} from '../../../../lib/oidc/util';

declare interface TestOptions {
  useFragment?: boolean;
}

describe('util/loginRedirect', function() {
  const redirectUri = 'http://fake/login/callback';
  const issuer = 'https://auth-js-test.okta.com';
  const clientId = 'foo';

  let sdk;
  let originalLocation;
  beforeEach(() => {
    originalLocation = window.location;
  });
  afterEach(() => {
    window.location = originalLocation;
  });

  function mockHash(hash) {
    delete window.location;
    window.location = {
      hash: `#${hash}`,
      href: `${redirectUri}#${hash}`
    } as unknown as Location;
  }

  function mockSearch(search) {
    delete window.location;
    window.location = {
      search: `?${search}`,
      href: `${redirectUri}?${search}`
    } as unknown as Location;
  }

  // tokens can only be returned in a hash
  function assertTokens(value = true) {
    expect(hasTokensInHash(window.location.hash)).toBe(value);
    expect(hasTokensInHash(window.location.search)).toBe(false);
  }

  function addBaselineTests(options = { useFragment: false }) {
    function mockHashOrSearch(value) {
      if (options.useFragment) {
        return mockHash(value);
      }
      return mockSearch(value);
    }
    describe('baseline', () => {
      it('`isLoginRedirect` should return false if no special parameters are detected', () => {
        mockHashOrSearch('other=nonyabizniss');
        expect(isLoginRedirect(sdk)).toBe(false);
        expect(isInteractionRequired(sdk)).toBe(false);
        assertTokens(false);
      });

      describe('errors', () => {
        it('`isLoginRedirect` should return false if current URI is not redirect URI', () => {
          mockHashOrSearch('error=fakeerror&error_description=fakedescription');
          window.location.href = 'http://fake/product/search?error=fakeerror&error_description=fakedescription';
          expect(isLoginRedirect(sdk)).toBe(false);
          expect(isInteractionRequired(sdk)).toBe(false);
          assertTokens(false);
        });
  
        it('`isLoginRedirect` should recognize "error" param', () => {
          mockHashOrSearch('error=fakeerror');
          expect(isLoginRedirect(sdk)).toBe(true);
          expect(isInteractionRequired(sdk)).toBe(false);
          assertTokens(false);
        });
  
        it('`isLoginRedirect` should recognize "error_description" param', () => {
          mockHashOrSearch('error_description=fakeerror');
          expect(isLoginRedirect(sdk)).toBe(true);
          expect(isInteractionRequired(sdk)).toBe(false);
          assertTokens(false);
        });
      });
    });
  }

  describe('Implicit OIDC flow', () => {
    beforeEach(() => {
      sdk = new OktaAuth({
        pkce: false,
        issuer,
        clientId,
        redirectUri
      });
    });

    addBaselineTests({ useFragment: true });
  
    it('should recognize id_token in hash', () => {
      mockHash('id_token=fakeidtoken');
      expect(isLoginRedirect(sdk)).toBe(true);
      assertTokens(true);
    });

    it('should return true if there is access_token in hash', () => {
      mockHash('access_token=fakeaccesstoken');
      expect(isLoginRedirect(sdk)).toBe(true);
      assertTokens(true);
    });

    it('`isLoginRedirect` should return false if current URI is not redirect URI', () => {
      mockHash('id_token=fakeidtoken');
      window.location.href = 'http://fake/product/search' + window.location.hash;
      expect(isLoginRedirect(sdk)).toBe(false);
      assertTokens(true);
    });
  });

  describe('Authorization code flow', () => {
    beforeEach(() => {
      sdk = new OktaAuth({
        pkce: false,
        responseType: 'code',
        issuer,
        clientId,
        redirectUri
      });
    });

    addBaselineTests();

    it('recognizes code in the URL', () => {
      mockSearch('code=fakecode');
      expect(isLoginRedirect(sdk)).toBe(true);
      expect(isInteractionRequired(sdk)).toBe(false);
      expect(hasAuthorizationCode(window.location.search)).toBe(true);
    });

    it('`isLoginRedirect` should return false if current URI is not redirect URI', () => {
      mockSearch('code=fakeidtoken');
      window.location.href = 'http://fake/product/search' + window.location.search;
      expect(isLoginRedirect(sdk)).toBe(false);
      expect(isInteractionRequired(sdk)).toBe(false);
      expect(hasAuthorizationCode(window.location.search)).toBe(true);
    });
  });

  describe('Interaction code flow', () => {
    beforeEach(() => {
      sdk = new OktaAuth({
        pkce: true,
        issuer,
        clientId,
        redirectUri
      });
    });

    addBaselineTests();

    it('recognizes interaction code in the URL', () => {
      mockSearch('interaction_code=fakecode');
      expect(isLoginRedirect(sdk)).toBe(true);
      expect(isInteractionRequired(sdk)).toBe(false);
      expect(hasInteractionCode(window.location.search)).toBe(true);
    });    

    it('recognizes interaction_code in fragment when responseMode is fragment', () => {
      sdk = new OktaAuth({
        pkce: true,
        responseMode: 'fragment',
        issuer,
        clientId,
        redirectUri
      });
      mockHash('interaction_code=fakecode');
      expect(isLoginRedirect(sdk)).toBe(true);
      expect(isInteractionRequired(sdk)).toBe(false);
      expect(hasInteractionCode(window.location.hash)).toBe(true);
    });

    it('`isLoginRedirect` should return false if current URI is not redirect URI', () => {
      mockSearch('interaction_code=fakeidtoken');
      window.location.href = 'http://fake/product/search' + window.location.search;
      expect(isLoginRedirect(sdk)).toBe(false);
      expect(isInteractionRequired(sdk)).toBe(false);
      expect(hasInteractionCode(window.location.search)).toBe(true);
    });
    
    it('recognizes `interaction_required` error in the URL', () => {
      mockSearch('error=interaction_required');
      expect(isLoginRedirect(sdk)).toBe(true);
      expect(isInteractionRequired(sdk)).toBe(true);
      expect(hasInteractionCode(window.location.search)).toBe(false);
    });
  });

  describe('PKCE', () => {
    beforeEach(() => {
      sdk = new OktaAuth({
        pkce: true,
        issuer,
        clientId,
        redirectUri
      });
    });

    addBaselineTests();
  
    it('recognizes code in the query', () => {
      mockSearch('code=fakecode');
      expect(isLoginRedirect(sdk)).toBe(true);
      expect(isInteractionRequired(sdk)).toBe(false);
      expect(hasAuthorizationCode(window.location.search)).toBe(true);
    });

    it('recognizes code in query when responseMode is query', () => {
      sdk = new OktaAuth({
        pkce: true,
        responseMode: 'query',
        issuer,
        clientId,
        redirectUri
      });
      mockSearch('code=fakecode');
      expect(isLoginRedirect(sdk)).toBe(true);
      expect(isInteractionRequired(sdk)).toBe(false);
      expect(hasAuthorizationCode(window.location.search)).toBe(true);
    });


    it('recognizes code in hash when responseMode is fragment', () => {
      sdk = new OktaAuth({
        pkce: true,
        responseMode: 'fragment',
        issuer,
        clientId,
        redirectUri
      });
      mockHash('code=fakecode');
      expect(isLoginRedirect(sdk)).toBe(true);
      expect(isInteractionRequired(sdk)).toBe(false);
      expect(hasAuthorizationCode(window.location.hash)).toBe(true);
    });

    it('`isLoginRedirect` should return false if current URI is not redirect URI', () => {
      mockSearch('code=fakecode');
      window.location.href = 'https://exmple.com/products/search?code=somecode';
      expect(isLoginRedirect(sdk)).toBe(false);
      expect(isInteractionRequired(sdk)).toBe(false);
      expect(hasAuthorizationCode(window.location.search)).toBe(true);
    });
  });
});
