
// The purpose of this test is to check the "sendRequest" function instead of the backend apis
// Only test against "/idp/myaccount/emails" endpoint to make sure the function can deliver/throw correct response and error

jest.mock('../../../../lib/features', () => {
  const actual = jest.requireActual('../../../../lib/features');
  return {
    ...actual,
    isDPoPSupported: () => true
  };
});

jest.mock('../../../../lib/oidc/dpop', () => {
  const actual = jest.requireActual('../../../../lib/oidc/dpop');
  const keyPair = actual.generateKeyPair();

  return {
    ...actual,
    generateKeyPair: async () => await keyPair,
    findKeyPair: async () => await keyPair,
    createDPoPKeyPair: async () => {
      const kp = await keyPair;
      return  { keyPair: kp, keyPairId: 'foo' };
    }
  };
});

import { sendRequest } from '../../../../lib/myaccount/request';
import { EmailTransaction } from '../../../../lib/myaccount/transactions';
import { AuthApiError, AuthSdkError, WWWAuthError } from '../../../../lib/errors';
import { createClient, signinAndGetTokens } from '../../util';


describe('lower level sendRequest function against "/idp/myaccount/emails" endpoint', () => {
  it('can get emails with "okta.myAccount.email.read" token scope', async () => {
    const client = createClient({});
    const scopes = [
      'openid', 
      'profile', 
      'okta.myAccount.email.read'
    ];
    const { 
      tokens: { 
        accessToken
      }
    } = await signinAndGetTokens(client, { scopes });
    const transactions = await sendRequest(client, { 
      url: '/idp/myaccount/emails',
      method: 'GET',
      accessToken 
    }) as EmailTransaction[];
    for (const transaction of transactions) {
      expect(transaction).toMatchSnapshot({
        headers: expect.any(Object),
        id: expect.any(String),
        profile: {
          email: expect.any(String)
        },
        roles: expect.any(Array),
        status: expect.any(String)
      });
    }
  });

  it('throw with 401 when invalid token is provided', async () => {
    expect.assertions(1);
    const client = createClient({});
    try {
      await sendRequest(client, { 
        url: '/idp/myaccount/emails',
        method: 'GET',
        accessToken: 'invalidToken'
      });
    } catch (err) {
      if (process.env.USE_DPOP == '1') {
        expect(err).toBeInstanceOf(AuthSdkError);
      }
      else {
        expect((err as AuthApiError).xhr?.status).toBe(401);
      }
    }
  });

  it('throws 403 when okta.myAccount.email.read no in token scopes', async () => {
    expect.hasAssertions();
    const client = createClient({});
    const scopes = ['openid', 'profile'];
    const { 
      tokens: { 
        accessToken
      } 
    } = await signinAndGetTokens(client, { scopes });
    try {
      await sendRequest(client, { 
        url: '/idp/myaccount/emails',
        method: 'GET',
        accessToken 
      });
    } catch (err) {
      if (process.env.USE_DPOP == '1') {
        expect(err).toBeInstanceOf(WWWAuthError);
        expect((err as WWWAuthError).message).toBe('insufficient_scope');
      }
      else {
        expect((err as AuthApiError).xhr?.status).toBe(403);
      }
    }
  });
});
