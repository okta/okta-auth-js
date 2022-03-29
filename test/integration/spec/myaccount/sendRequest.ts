import { sendRequest } from '../../../../lib/myaccount/request';
import { EmailTransaction } from '../../../../lib/myaccount/transactions';
import { AuthApiError } from '../../../../lib/errors';
import { createClient, signinAndGetTokens } from '../../util';

// The purpose of this test is to check the "sendRequest" function instead of the backend apis
// Only test against "/idp/myaccount/emails" endpoint to make sure the function can deliver/throw correct response and error

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
        accessToken: { accessToken } = {}
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
        _http: {
          headers: expect.any(Object),
        },
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
    const client = createClient({});
    try {
      await sendRequest(client, { 
        url: '/idp/myaccount/emails',
        method: 'GET',
        accessToken: 'invalidToken'
      });
    } catch (err) {
      expect((err as AuthApiError).xhr?.status).toBe(401);
    }
  });

  it('throws 403 when okta.myAccount.email.read no in token scopes', async () => {
    const client = createClient({});
    const scopes = ['openid', 'profile'];
    const { 
      tokens: { 
        accessToken: { accessToken } = {}
      } 
    } = await signinAndGetTokens(client, { scopes });
    try {
      await sendRequest(client, { 
        url: '/idp/myaccount/emails',
        method: 'GET',
        accessToken 
      });
    } catch (err) {
      expect((err as AuthApiError).xhr?.status).toBe(403);
    }
  });
});
