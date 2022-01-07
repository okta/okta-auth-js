/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jasmine/no-expect-in-setup-teardown */
import {
  createTransactionMeta,
  getTransactionMeta,
  saveTransactionMeta,
  clearTransactionMeta,
  isTransactionMetaValid
} from '../../../lib/idx/transactionMeta';

jest.mock('../../../lib/util', () => {
  const orig = jest.requireActual('../../../lib/util');
  return {
    removeNils: orig.removeNils,
    removeTrailingSlash: orig.removeTrailingSlash,
    warn: () => {}
  };
});

const mocked = {
  util: require('../../../lib/util')
};

describe('idx/transactionMeta', () => {
  let testContext;
  beforeEach(() => {
    const state = 'a-test-state';
    const issuer = 'http://faake';
    const redirectUri = 'http://also-fake';
    const clientId = 'superfake';
    const transactionMeta = {
      state,
      issuer,
      redirectUri,
      clientId
    };
    const authParams = {
      issuer,
      redirectUri,
      clientId
    };
    const authClient = {
      options: authParams,
      transactionManager: {
        exists: () => !!testContext.transactionMeta,
        load: () => testContext.transactionMeta,
        clear: () => {},
        save: () => {}
      },
      token: {
        prepareTokenParams: () => Promise.resolve({})
      }
    };
    testContext = {
      transactionMeta,
      authParams,
      authClient
    };
  });
  
  function assertIsPromise(res) {
    expect(typeof res.then).toBe('function');
    expect(typeof res.catch).toBe('function');
    expect(typeof res.finally).toBe('function');
  }

  describe('createTransactionMeta', () => {
    it('calls `authClient.token.prepareTokenParams`', async () => {
      jest.spyOn(testContext.authClient.token, 'prepareTokenParams');
      await createTransactionMeta(testContext.authClient);
      expect(testContext.authClient.token.prepareTokenParams).toHaveBeenCalled();
    });
    it('returns a promise', () => {
      const res = createTransactionMeta(testContext.authClient);
      assertIsPromise(res);
      return res;
    });
    it('saves the configured flow', async () => {
      const { authClient } = testContext;
      const flow = 'fake';
      authClient.options.flow = flow;
      const res = await createTransactionMeta(authClient);
      expect(res.flow).toBe(flow);
    });
    it('saves the configured issuer', async () => {
      const { authClient } = testContext;
      const res = await createTransactionMeta(authClient);
      expect(res.issuer).toBe(authClient.options.issuer);
    });
  });

  describe('getTransactionMeta', () => {
    it('returns a promise', () => {
      const res = getTransactionMeta(testContext.authClient);
      assertIsPromise(res);
      return res;
    });
    describe('no existing meta', () => {
      beforeEach(() => {
        testContext.transactionMeta = null;
        expect(testContext.authClient.transactionManager.exists()).toBe(false);
        testContext.newMeta = { codeChallenge: 'fake' };
        jest.spyOn(testContext.authClient.token, 'prepareTokenParams').mockReturnValue(Promise.resolve(testContext.newMeta));
      });
      it('returns new meta', async () => {
        const res = await getTransactionMeta(testContext.authClient);
        const issuer = testContext.authParams.issuer;
        expect(res).toEqual(Object.assign({}, testContext.newMeta, {
          flow: 'default',
          issuer,
          urls: {
            authorizeUrl: `${issuer}/oauth2/v1/authorize`,
            issuer: `${issuer}`,
            logoutUrl: `${issuer}/oauth2/v1/logout`,
            revokeUrl: `${issuer}/oauth2/v1/revoke`,
            tokenUrl: `${issuer}/oauth2/v1/token`,
            userinfoUrl: `${issuer}/oauth2/v1/userinfo`,
          },
          withCredentials: true
        }));
      });
    });

    describe('with existing meta', () => {
      describe('existing is valid', () => {
        beforeEach(() => {
          jest.spyOn(testContext.authClient.token, 'prepareTokenParams');
        });
        afterEach(() => {
          expect(testContext.authClient.token.prepareTokenParams).not.toHaveBeenCalled();
        });
        it('returns existing meta', async () => {
          const res = await getTransactionMeta(testContext.authClient);
          expect(res).toEqual(testContext.transactionMeta);
        });
      });

      describe('existing is invalid', () => {
        beforeEach(() => {
          testContext.newMeta = { codeChallenge: 'new-and-fake' };
          jest.spyOn(testContext.authClient.token, 'prepareTokenParams').mockReturnValue(Promise.resolve(testContext.newMeta));
          testContext.authParams.clientId = 'fake'; // will cause transaction meta to be invalid
        });
        afterEach(() => {
          expect(testContext.authClient.token.prepareTokenParams).toHaveBeenCalled();
        });

        it('returns new meta', async () => {
          const res = await getTransactionMeta(testContext.authClient);
          const issuer = testContext.authParams.issuer;
          expect(res).toEqual(Object.assign({}, testContext.newMeta, {
            flow: 'default',
            issuer,
            urls: {
              authorizeUrl: `${issuer}/oauth2/v1/authorize`,
              issuer: `${issuer}`,
              logoutUrl: `${issuer}/oauth2/v1/logout`,
              revokeUrl: `${issuer}/oauth2/v1/revoke`,
              tokenUrl: `${issuer}/oauth2/v1/token`,
              userinfoUrl: `${issuer}/oauth2/v1/userinfo`,
            },
            withCredentials: true
          }));
        });


        it('prints a warning message', async () => {
          jest.spyOn(mocked.util, 'warn');
          await getTransactionMeta(testContext.authClient);

          expect(mocked.util.warn).toHaveBeenCalledWith(
            'Saved transaction meta does not match the current configuration. ' + 
            'This may indicate that two apps are sharing a storage key.'
          );
        });
      });
    });
  });

  describe('saveTransactionMeta', () => {
    it('calls `authClient.transactionManager.save`', () => {
      jest.spyOn(testContext.authClient.transactionManager, 'save');
      saveTransactionMeta(testContext.authClient, testContext.transactionMeta);
      expect(testContext.authClient.transactionManager.save).toHaveBeenCalledWith(testContext.transactionMeta, { muteWarning: true });
    });
  });

  describe('clearTransactionMeta', () => {
    it('calls `authClient.transactionManager.clear`', () => {
      jest.spyOn(testContext.authClient.transactionManager, 'clear');
      clearTransactionMeta(testContext.authClient);
      expect(testContext.authClient.transactionManager.clear).toHaveBeenCalledWith();
    });
  });


  describe('isTransactionMetaValid', () => {
    it('returns false if `clientId` does not match', () => {
      testContext.transactionMeta.clientId = 'abc';
      testContext.authParams.clientId = 'def';
      expect(isTransactionMetaValid(testContext.authClient, testContext.transactionMeta)).toBe(false);
    });

    it('returns false if `redirectUri` does not match', () => {
      testContext.transactionMeta.redirectUri = 'abc';
      testContext.authParams.redirectUri = 'def';
      expect(isTransactionMetaValid(testContext.authClient, testContext.transactionMeta)).toBe(false);
    });

    it('returns false if `issuer` does not match', () => {
      testContext.transactionMeta.issuer = 'abc';
      testContext.authParams.issuer = 'def';
      expect(isTransactionMetaValid(testContext.authClient, testContext.transactionMeta)).toBe(false);
    });

    describe('matching clientId, redirectId, issuer', () => {
      beforeEach(() => {
        const { transactionMeta, authParams } = testContext;
        const clientId = 'abc';
        const redirectUri = '123';
        const issuer = 'lol';
        Object.assign(transactionMeta, { clientId, redirectUri, issuer });
        Object.assign(authParams, { clientId, redirectUri, issuer });
      });
      it('by default, returns true', () => {
        const { transactionMeta, authParams } = testContext;
        expect(isTransactionMetaValid(transactionMeta, authParams)).toBe(true);
      });
      it('returns false if configured flow does not match', () => {
        const { transactionMeta, authParams } = testContext;
        transactionMeta.flow = 'x';
        authParams.flow = 'y';
        expect(isTransactionMetaValid(transactionMeta, authParams)).toBe(false);
      });
      it('does not validate flow when flow = "default"', () => {
        const { transactionMeta, authParams } = testContext;
        transactionMeta.flow = 'x';
        authParams.flow = 'default';
        expect(isTransactionMetaValid(transactionMeta, authParams)).toBe(true);
      });
      it('does not validate flow when flow = "proceed"', () => {
        const { transactionMeta, authParams } = testContext;
        transactionMeta.flow = 'x';
        authParams.flow = 'proceed';
        expect(isTransactionMetaValid(transactionMeta, authParams)).toBe(true);
      });
      it('does not validate flow when flow is not set', () => {
        const { transactionMeta, authParams } = testContext;
        transactionMeta.flow = 'x';
        authParams.flow = undefined;
        expect(isTransactionMetaValid(transactionMeta, authParams)).toBe(true);
      });
      it('returns false if configured state does not match', () => {
        const { transactionMeta, authParams } = testContext;
        transactionMeta.state = 'x';
        authParams.state = 'y';
        expect(isTransactionMetaValid(transactionMeta, authParams)).toBe(false);
      });

      it('returns true if meta has a `state`, but options does not', () => {
        const { transactionMeta, authParams } = testContext;
        transactionMeta.state = 'abc';
        expect(isTransactionMetaValid(transactionMeta, authParams)).toBe(true);
      });
  
      it('returns false if `state` does not match value in options', () => {
        const { transactionMeta, authParams } = testContext;
        transactionMeta.state = 'abc';
        authParams.state = 'def';
        expect(isTransactionMetaValid(transactionMeta, authParams)).toBe(false);
      });

      it('returns false if `codeChallenge` does not match', () => {
        const { transactionMeta, authParams } = testContext;
        transactionMeta.codeChallenge = 'abc';
        authParams.codeChallenge = 'def';
        expect(isTransactionMetaValid(transactionMeta, authParams)).toBe(false);
      });
  
      it('returns false if `codeChallengeMethod` does not match', () => {
        const { transactionMeta, authParams } = testContext;
        transactionMeta.codeChallengeMethod = 'abc';
        authParams.codeChallengeMethod = 'def';
        expect(isTransactionMetaValid(transactionMeta, authParams)).toBe(false);
      });

    });

  });
});