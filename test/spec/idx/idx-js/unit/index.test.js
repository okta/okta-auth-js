/*!
 * Copyright (c) 2021-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */


import idx from '../../../../../lib/idx/idx-js/index';

jest.mock('cross-fetch', () => jest.fn());
jest.mock('../../../../../lib/idx/idx-js/interact', () => jest.fn());
jest.mock('../../../../../lib/idx/idx-js/introspect', () => jest.fn());
jest.mock('../../../../../lib/idx/idx-js/parsers', function() {
  const makeIdxState = jest.fn();
  return jest.fn().mockReturnValue({
    makeIdxState
  });
});
const mocked = {
  fetch: require('cross-fetch'),
  interact: require('../../../../../lib/idx/idx-js/interact'),
  introspect: require('../../../../../lib/idx/idx-js/introspect'),
  parsersForVersion: require('../../../../../lib/idx/idx-js/parsers')
};

const mockRequestIdentity = require('../mocks/request-identifier');
const mockErrorResponse = require('../mocks/error-response');
const mockAuthenticatorErrorResponse = require('../mocks/error-authenticator-enroll');
const { Response } = jest.requireActual('cross-fetch');

describe('idx-js', () => {
  let testContext;

  beforeEach(() => {
    const makeIdxState = mocked.makeIdxState = jest.fn();
    mocked.parsersForVersion.mockReturnValue({ makeIdxState });
    mocked.makeIdxState.mockImplementation((idxResponse, toPersist) => {
      return { rawIdxState: idxResponse, toPersist };
    });
    mocked.fetch.mockResolvedValue(new Response(JSON.stringify( mockRequestIdentity )));
    mocked.introspect.mockResolvedValue();
    mocked.interact.mockResolvedValue();

    testContext = {
      activationToken: 'FAke_actiovation_token',
      recoveryToken: 'FAKE_RECOVERY_TOKEN',
      interactionHandle: 'FAKE_INTERACTION_HANDLE',
      stateHandle: 'FAKE_STATE_HANDLE',
      domain: 'http://okta.example.com',
      orgIssuer: 'http://okta.example.com',
      customIssuer: 'http://okta.example.com/oauth2/default',
      version: '1.0.0',
      clientId: 'CLIENT_ID',
      redirectUri: 'https://example.com/fake',
      codeChallenge: 'BASE64URLENCODED',
      codeChallengeMethod: 'S256',
    };
  });

  describe('start', () => {

    it('requires a clientId when there is no stateHandle', async () => {
      const { domain, version, redirectUri } = testContext;
      return idx.start({ domain, version, redirectUri })
        .then( () => {
          fail('expected idx.start to reject without one of: clientId, stateHandle');
        })
        .catch( err => {
          expect(err).toStrictEqual({ error: 'clientId is required' });
        });
    });

    it('requires a redirectUri when there is no stateHandle', async () => {
      const { domain, version, clientId } = testContext;
      return idx.start({ domain, clientId, version })
        .then( () => {
          fail('expected idx.start to reject without one of: redirectUri, stateHandle');
        })
        .catch( err => {
          expect(err).toStrictEqual({ error: 'redirectUri is required' });
        });
    });

    it('requires PKCE attributes when there is no stateHandle', async () => {
      const { domain, version, redirectUri, clientId } = testContext;
      return idx.start({ domain, clientId, version, redirectUri })
        .then( () => {
          fail('expected idx.start to reject without PKCE params if no stateHandle');
        })
        .catch( err => {
          expect(err).toStrictEqual({ error: 'PKCE params (codeChallenge, codeChallengeMethod) are required' });
        });
    });

    it('handles updating the baseUrl for an org authorization server issuer', async () => {
      const { clientId, orgIssuer, codeChallenge, codeChallengeMethod, version, redirectUri } = testContext;
      return idx.start({ issuer: `${orgIssuer}`, clientId, version, redirectUri, codeChallenge, codeChallengeMethod })
        .then( idxState => {
          expect(idxState.toPersist.baseUrl).toEqual('http://okta.example.com/oauth2');
        });
    });

    it('accepts the baseUrl from a custom authorization server issuer', async () => {
      const { clientId, customIssuer, codeChallenge, codeChallengeMethod, version, redirectUri } = testContext;
      return idx.start({ issuer: `${customIssuer}`, clientId, version, redirectUri, codeChallenge, codeChallengeMethod })
        .then( idxState => {
          expect(idxState.toPersist.baseUrl).toEqual('http://okta.example.com/oauth2/default');
        });
    });

    it('handles an org AS issuer with a trailing slash', async () => {
      const { clientId, orgIssuer, codeChallenge, codeChallengeMethod, version, redirectUri } = testContext;
      return idx.start({ issuer: `${orgIssuer}/`, clientId, version, redirectUri, codeChallenge, codeChallengeMethod })
        .then( idxState => {
          expect(idxState.toPersist.baseUrl).toEqual('http://okta.example.com/oauth2');
        });
    });

    it('handles a custom AS issuer with a trailing slash', async () => {
      const { clientId, customIssuer, codeChallenge, codeChallengeMethod, version, redirectUri } = testContext;
      return idx.start({ issuer: `${customIssuer}/`, clientId, version, redirectUri, codeChallenge, codeChallengeMethod })
        .then( idxState => {
          expect(idxState.toPersist.baseUrl).toEqual('http://okta.example.com/oauth2/default');
        });
    });

    it('rejects if there is no domain or issuer', async () => {
      const { stateHandle, version } = testContext;
      return idx.start({ stateHandle, version })
        .then( () => {
          fail('expected idx.start to reject when not given a domain');
        })
        .catch( err => {
          expect(err).toStrictEqual({ error: 'issuer is required'});
        });
    });

    it('rejects without a version', async () => {
      const { stateHandle, domain } = testContext;
      return idx.start({ stateHandle, domain })
        .then( () => {
          fail('expected idx.start to reject when not given a version');
        })
        .catch( err => {
          expect(mocked.introspect).not.toHaveBeenCalled();
          expect(err).toEqual(new Error('version is required'));
        });
    });

    it('does not call introspect if parser cannot be loaded', async () => {
      const { stateHandle, domain } = testContext;
      const error = new Error('Error from parser');
      mocked.parsersForVersion.mockImplementation(() => {
        throw error;
      });
      return idx.start({ stateHandle, domain, version: '999999.9999.9999' })
        .then( () => {
          fail('expected idx.start to reject when not given a wrong version');
        })
        .catch( err => {
          expect( err ).toEqual(new Error('Error from parser'));
          expect( mocked.introspect ).not.toHaveBeenCalled();
        });
    });

    it('returns an idxState when a generic error occurs during introspect', async () => {
      const { stateHandle, domain, version } = testContext;
      mocked.introspect.mockRejectedValue(mockErrorResponse);

      return idx.start({ domain, stateHandle, version })
        .then( () => {
          fail('expected idx.start to reject when not given a wrong version');
        })
        .catch( ( { error } ) => {
          expect(error.details).toBeDefined();
          expect(error.details.rawIdxState).toStrictEqual(mockErrorResponse);
          expect(error.error).toEqual('introspect call failed');
        });
    });

    it('returns an idxState when an authenticator error occurs during introspect', async () => {
      const { stateHandle, domain, version } = testContext;
      mocked.introspect.mockRejectedValue(mockAuthenticatorErrorResponse);

      return idx.start({ domain, stateHandle, version })
        .then( () => {
          fail('expected idx.start to reject when not given a wrong version');
        })
        .catch( ( { error } ) => {
          expect(error.details).toBeDefined();
          expect(error.details.rawIdxState).toBeDefined();
          expect(error.error).toEqual('introspect call failed');
        });
    });

    it('returns an idxState', async () => {
      const { stateHandle, domain, version } = testContext;
      const idxState = await idx.start({ domain, stateHandle, version });
      expect(idxState).toBeDefined();
      expect(idxState.toPersist.withCredentials).toBe(undefined);
    });

    it('withCredentials=false option can disable sending credentials on the request', async () => {
      const { stateHandle, domain, version } = testContext;
      const idxState = await idx.start({ domain, stateHandle, version, withCredentials: false });
      expect(idxState).toBeDefined();
      expect(idxState.toPersist.withCredentials).toBe(false);
    });

    it('does not call interact if loaded with a stateHandlle', async () => {
      const { stateHandle, domain, version } = testContext;
      await idx.start({ domain, stateHandle, version });
      expect(mocked.interact).not.toHaveBeenCalled();
    });

    it('does not call interact if loaded with an interactionHandle', async () => {
      const { interactionHandle, domain, version, clientId, redirectUri, codeChallenge, codeChallengeMethod } = testContext;
      await idx.start({ domain, interactionHandle, version, clientId, redirectUri, codeChallenge, codeChallengeMethod });
      expect(mocked.interact).not.toHaveBeenCalled();
    });

    describe('interact', () => {
      it('will pass activation token to interact', async () => {
        const { activationToken, domain, version, clientId, redirectUri, codeChallenge, codeChallengeMethod } = testContext;
        await idx.start({ domain, activationToken, version, clientId, redirectUri, codeChallenge, codeChallengeMethod });
        expect(mocked.interact).toHaveBeenCalledWith({
          activationToken,
          baseUrl: 'undefined/oauth2',
          clientId,
          codeChallenge,
          codeChallengeMethod,
          redirectUri
        });
      });

      it('will pass recovery token to interact', async () => {
        const { recoveryToken, domain, version, clientId, redirectUri, codeChallenge, codeChallengeMethod } = testContext;
        await idx.start({ domain, recoveryToken, version, clientId, redirectUri, codeChallenge, codeChallengeMethod });
        expect(mocked.interact).toHaveBeenCalledWith({
          recoveryToken,
          baseUrl: 'undefined/oauth2',
          clientId,
          codeChallenge,
          codeChallengeMethod,
          redirectUri
        });
      });

      it('will pass withCredentials option to interact', async () => {
        const { domain, version, clientId, redirectUri, codeChallenge, codeChallengeMethod } = testContext;
        const withCredentials = false;
        await idx.start({ domain, withCredentials, version, clientId, redirectUri, codeChallenge, codeChallengeMethod });
        expect(mocked.interact).toHaveBeenCalledWith({
          withCredentials,
          baseUrl: 'undefined/oauth2',
          clientId,
          codeChallenge,
          codeChallengeMethod,
          redirectUri
        });
      });
    });
  });
});
