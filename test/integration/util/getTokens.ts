import fetch from 'cross-fetch';
import waitFor from '@okta/test.support/waitFor';
import { AuthnTransaction } from '../../../lib/authn';
import { getWithRedirect, handleOAuthResponse, CustomUrls } from '../../../lib/oidc';
import { parseOAuthResponseFromUrl } from '../../../lib/oidc/parseFromUrl';
import A18nClient from '@okta/test.support/a18nClient';

function mockGetWithRedirect(client, testContext) {
  jest.spyOn(client, 'getOriginalUri').mockImplementation(() => {});
  jest.spyOn(client, 'setOriginalUri').mockImplementation(() => {});
  jest.spyOn(client.token.getWithRedirect, '_setLocation').mockImplementation(authorizeUrl => {
    testContext.authorizeUrl = authorizeUrl;
  });
  jest.spyOn(client.token.parseFromUrl, '_getLocation').mockImplementation(() => {});
}

function unmockGetWithRedirect(client) {
  client.getOriginalUri.mockRestore();
  client.setOriginalUri.mockRestore();
  client.token.getWithRedirect._setLocation.mockRestore();
  client.token.parseFromUrl._getLocation.mockRestore();
}

async function getTokens(client, tokenParams) {
  const localContext = {
    authorizeUrl: null
  };
  mockGetWithRedirect(client, localContext);
  tokenParams = Object.assign({
    responseMode: 'fragment'
  }, tokenParams);
  getWithRedirect(client, tokenParams);
  await waitFor(() => localContext.authorizeUrl);
  const { authorizeUrl } = localContext;
  const res = await fetch(authorizeUrl as unknown as string, {
    redirect: 'manual'
  });
  const redirectUrl = res.headers.get('location');
  const oauthResponse = parseOAuthResponseFromUrl(client, {
    url: redirectUrl!,
    responseMode: 'fragment'
  });
  const transactionMeta = client.transactionManager.load();
  const tokenResponse = await handleOAuthResponse(client, transactionMeta, oauthResponse, undefined as unknown as CustomUrls);
  unmockGetWithRedirect(client);
  return tokenResponse;
}

// Performs basic login and implicit token flow
export async function signinAndGetTokens(client, tokenParams?, credentials?) {
  const username = credentials?.username || process.env.USERNAME;
  const password = credentials?.password || process.env.PASSWORD;
  const tx: AuthnTransaction = await client.signInWithCredentials({
    username,
    password
  });
  expect(tx.status).toBe('SUCCESS');
  const { sessionToken } = tx;
  const tokenResponse = await getTokens(client, Object.assign({ sessionToken }, tokenParams));
  return tokenResponse;
}

export async function signinAndGetTokensViaEmail(client) {
  const username = process.env.PASSWORDLESS_USERNAME;
  let transaction = await client.idx.authenticate({
    username,
    authenticator: 'okta_email'
  });

  const a18nClient = new A18nClient({ a18nAPIKey: process.env.A18N_API_KEY })
  const a18nProfile = await a18nClient.createProfile('myaccount-password')
  const verificationCode = await a18nClient.getEmailCode(a18nProfile.profileId)

  transaction = await client.idx.proceed({ verificationCode });
  const { status, tokens } = transaction;
  console.log(status, tokens);
  return transaction;
}
