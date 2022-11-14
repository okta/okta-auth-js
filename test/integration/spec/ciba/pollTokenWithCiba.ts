import { createClient } from '../../util';
import { authenticateWithCiba, pollTokenWithCiba } from '../../../../lib/oidc';
import { OAuthError } from '../../../../lib/errors';
import { PEM as INVALID_PEM, JWK as INVALID_JWK } from '@okta/test.support/jwt';

// Note: only pending status can be reached/tested due to unable to automate user consent step

describe('pollTokenWithCiba', () => {
  it('polls token with valid auth_req_id + client secret', async () => {
    const client = createClient({
      clientId: process.env.WEB_CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      scopes: ['openid']
    });
    const authResp = await authenticateWithCiba(client, {
      loginHint: process.env.USERNAME
    });
    // able to get pending for user auth oauth error
    await expect(async () => {
      await pollTokenWithCiba(client, {
        authReqId: authResp.auth_req_id,
      });
    }).rejects.toThrowError(new OAuthError('', `The authorization request is still pending as the user hasn't yet been authenticated.`));
  });

  it('polls token with valid auth_req_id + privatekey (pem)', async () => {
    const client = createClient({
      clientId: process.env.WEB_PRIVATE_KEY_CLIENT_ID,
      privateKey: process.env.PEM,
      scopes: ['openid']
    });
    const authResp = await authenticateWithCiba(client, {
      loginHint: process.env.USERNAME,
    });
    // able to get pending for user auth oauth error
    await expect(async () => {
      await pollTokenWithCiba(client, {
        authReqId: authResp.auth_req_id,
      });
    }).rejects.toThrowError(new OAuthError('', `The authorization request is still pending as the user hasn't yet been authenticated.`));
  });

  it('polls token with valid auth_req_id + privatekey (jwk)', async () => {
    const client = createClient({
      clientId: process.env.WEB_PRIVATE_KEY_CLIENT_ID,
      privateKey: process.env.JWK,
      scopes: ['openid']
    });
    const authResp = await authenticateWithCiba(client, {
      loginHint: process.env.USERNAME,
    });
    // able to get pending for user auth oauth error
    await expect(async () => {
      await pollTokenWithCiba(client, {
        authReqId: authResp.auth_req_id,
      });
    }).rejects.toThrowError(new OAuthError('', `The authorization request is still pending as the user hasn't yet been authenticated.`));
  });

  describe('throws when fails client authentication', () => {
    it('invalid secret', async () => {
      const client = createClient({
        clientId: process.env.WEB_CLIENT_ID,
        clientSecret: 'invalid-secret',
        scopes: ['openid']
      });
      await expect(async () => {
        await pollTokenWithCiba(client, {
          authReqId: 'fake-id',
        });
      }).rejects.toThrowError(new OAuthError('', `The client secret supplied for a confidential client is invalid.`));
    });

    it('invalid pem', async () => {
      const client = createClient({
        clientId: process.env.WEB_CLIENT_ID,
        privateKey: INVALID_PEM,
        scopes: ['openid']
      });
      await expect(async () => {
        await pollTokenWithCiba(client, {
          authReqId: 'fake-id',
        });
      }).rejects.toThrowError(new OAuthError('', `The client does not have a JWKSet configured, but the client_assertion requires one.`));
    });

    it('invalid jwk', async () => {
      const client = createClient({
        clientId: process.env.WEB_CLIENT_ID,
        privateKey: INVALID_JWK,
        scopes: ['openid']
      });
      await expect(async () => {
        await pollTokenWithCiba(client, {
          authReqId: 'fake-id',
        });
      }).rejects.toThrowError(new OAuthError('', `The client does not have a JWKSet configured, but the client_assertion requires one.`));
    });
  
  });

  it('throws if invalid auth_req_id is passed', async () => {
    const client = createClient({
      clientId: process.env.WEB_CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      scopes: ['openid']
    });
    // able to get pending for user auth oauth error
    await expect(async () => {
      await pollTokenWithCiba(client, {
        authReqId: 'fake-auth-req-id',
      });
    }).rejects.toThrowError(new OAuthError('', `The 'auth_req_id' is invalid or has expired. Make a new authentication request.`));
  });
});
