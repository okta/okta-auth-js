import { createClient, signinAndGetTokens } from '../../util';
import { authenticateWithCiba } from '../../../../lib/oidc';
import { OAuthError } from '../../../../lib/errors';
import { PEM as INVALID_PEM, JWK as INVALID_JWK } from '@okta/test.support/jwt';

describe('authenticateWithCiba', () => {
  it('authenticates ciba client with client secret', async () => {
    const client = createClient({
      clientId: process.env.WEB_CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      scopes: ['openid']
    });
    const resp = await authenticateWithCiba(client, {
      loginHint: 'george@acme.com'
    });
    expect(resp.auth_req_id).toBeDefined();
    expect(resp.expires_in).toBeDefined();
  });

  it('throws when invalid clientId is passed', async () => {
    const client = createClient({
      clientId: 'invalid-client-id',
      clientSecret: process.env.CLIENT_SECRET,
      scopes: ['openid']
    });
    await expect(async () => {
      await authenticateWithCiba(client, {
        loginHint: 'george@acme.com'
      });
    }).rejects.toThrowError(new OAuthError('invalid_client', 'Invalid value for \'client_id\' parameter.'));
  });

  it('throws when incorrect client secret is passed', async () => {
    const client = createClient({
      clientId: process.env.WEB_CLIENT_ID,
      clientSecret: 'invalid-secret',
      scopes: ['openid']
    });
    await expect(async () => {
      await authenticateWithCiba(client, {
        loginHint: 'george@acme.com'
      });
    }).rejects.toThrowError(new OAuthError('invalid_client', 'The client secret supplied for a confidential client is invalid.'));
  });

  it('authenticates ciba client with private key - PEM', async () => {
    const client = createClient({
      clientId: process.env.WEB_PRIVATE_KEY_CLIENT_ID,
      privateKey: process.env.PEM,
      scopes: ['openid']
    });
    const resp = await authenticateWithCiba(client, {
      loginHint: 'george@acme.com'
    });
    expect(resp.auth_req_id).toBeDefined();
    expect(resp.expires_in).toBeDefined();
  });

  it('authenticates ciba client with invalid PEM', async () => {
    const client = createClient({
      clientId: process.env.WEB_PRIVATE_KEY_CLIENT_ID,
      privateKey: INVALID_PEM,
      scopes: ['openid']
    });
    await expect(async () => {
      await authenticateWithCiba(client, {
        loginHint: 'george@acme.com'
      });
    }).rejects.toThrowError(new OAuthError('invalid_client', 'The client_assertion signature is invalid.'));
  });

  it('authenticates ciba client with private key - JWK', async () => {
    const client = createClient({
      clientId: process.env.WEB_PRIVATE_KEY_CLIENT_ID,
      privateKey: process.env.JWK,
      scopes: ['openid']
    });
    const resp = await authenticateWithCiba(client, {
      loginHint: 'george@acme.com'
    });
    expect(resp.auth_req_id).toBeDefined();
    expect(resp.expires_in).toBeDefined();
  });

  it('authenticates ciba client with invalid JWK', async () => {
    const client = createClient({
      clientId: process.env.WEB_PRIVATE_KEY_CLIENT_ID,
      privateKey: INVALID_JWK,
      scopes: ['openid']
    });
    await expect(async () => {
      await authenticateWithCiba(client, {
        loginHint: 'george@acme.com'
      });
    }).rejects.toThrowError(new OAuthError('invalid_client', 'The client_assertion signature is invalid.'));
  });

  it('can use idTokenHint to identify end user', async () => {
    const client = createClient({
      clientId: process.env.WEB_CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      scopes: ['openid']
    });
    const {
      tokens: {
        idToken: { idToken } = {},
      }
    } = await signinAndGetTokens(client);
    const resp = await authenticateWithCiba(client, {
      idTokenHint: idToken
    });
    expect(resp.auth_req_id).toBeDefined();
    expect(resp.expires_in).toBeDefined();
  });

});
