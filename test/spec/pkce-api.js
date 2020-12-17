jest.mock('cross-fetch');

import fetch from 'cross-fetch';
import util from '@okta/test.support/util';
import factory from '@okta/test.support/factory';
import packageJson from '../../package.json';
import { OktaAuth } from '@okta/okta-auth-js';
import pkce from '../../lib/pkce';
import tokens from '@okta/test.support/tokens';

describe('pkce API', function() {
  let oktaAuth;
  beforeEach(() => {
    oktaAuth = new OktaAuth({
      issuer: 'http://fakey'
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

  describe('exchangeCodeForToken', function() {
    var ISSUER = 'http://example.okta.com';
    var REDIRECT_URI = 'http://fake.local';
    var CLIENT_ID = 'fake';
    var endpoint = '/oauth2/v1/token';
    var codeVerifier = 'superfake';
    var authorizationCode = 'notreal';
    var interactionCode = 'definitelynotreal';

    afterEach(() => {
      fetch.mockReset();
    });

    util.itMakesCorrectRequestResponse({
      title: 'requests a token using authorizationCode',
      setup: {
        issuer: ISSUER,
        clientId: CLIENT_ID,
        redirectUri: REDIRECT_URI,
        pkce: true,
        bypassCrypto: true,
        calls: [
          {
            request: {
              method: 'post',
              uri: endpoint,
              withCredentials: false,
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Okta-User-Agent-Extended': 'okta-auth-js/' + packageJson.version
              }
            },
            response: 'pkce-token-success',
            responseVars: {
              scope: 'ignored in this test',
              accessToken: tokens.standardAccessToken,
              idToken: factory.buildIDToken({
                issuer: ISSUER,
                clientId: CLIENT_ID
              })
            }
          }
        ]
      },
      execute: function (test) {
        return test.oa.token.exchangeCodeForToken({
          authorizationCode,
          codeVerifier,
        });
      },
      expectations: function () {
        expect(fetch).toHaveBeenCalledTimes(1);
        const args = fetch.mock.calls[0][1];
        const params = util.parseQueryParams(args.body); // decode form body
        expect(params).toEqual(    {
          'client_id': 'fake',
          'redirect_uri': 'http://fake.local',
          'grant_type': 'authorization_code',
          'code_verifier': 'superfake',
          'code': 'notreal'
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'requests a token using interactionCode',
      setup: {
        issuer: ISSUER,
        clientId: CLIENT_ID,
        redirectUri: REDIRECT_URI,
        pkce: true,
        bypassCrypto: true,
        calls: [
          {
            request: {
              method: 'post',
              uri: endpoint,
              withCredentials: false,
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Okta-User-Agent-Extended': 'okta-auth-js/' + packageJson.version
              }
            },
            response: 'pkce-token-success',
            responseVars: {
              scope: 'ignored in this test',
              accessToken: tokens.standardAccessToken,
              idToken: factory.buildIDToken({
                issuer: ISSUER,
                clientId: CLIENT_ID
              })
            }
          }
        ]
      },
      execute: function (test) {
        return test.oa.token.exchangeCodeForToken({
          interactionCode,
          codeVerifier,
        });
      },
      expectations: function () {
        expect(fetch).toHaveBeenCalledTimes(1);
        const args = fetch.mock.calls[0][1];
        const params = util.parseQueryParams(args.body); // decode form body
        expect(params).toEqual(    {
          'client_id': 'fake',
          'redirect_uri': 'http://fake.local',
          'grant_type': 'interaction_code',
          'code_verifier': 'superfake',
          'interaction_code': 'definitelynotreal'
        });
      }
    });
  });
});