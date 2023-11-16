/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { OAuthTransactionMeta, OktaAuthOAuthInterface, PKCETransactionMeta, TokenParams } from '../types';
import { getOAuthUrls } from './oauth';

export function createOAuthMeta(
  sdk: OktaAuthOAuthInterface, 
  tokenParams: TokenParams
): OAuthTransactionMeta | PKCETransactionMeta {
  const issuer = sdk.options.issuer!;
  const urls = getOAuthUrls(sdk, tokenParams);
  const oauthMeta: OAuthTransactionMeta = {
    issuer,
    urls,
    clientId: tokenParams.clientId!,
    redirectUri: tokenParams.redirectUri!,
    responseType: tokenParams.responseType!,
    responseMode: tokenParams.responseMode!,
    scopes: tokenParams.scopes!,
    state: tokenParams.state!,
    nonce: tokenParams.nonce!,
    ignoreSignature: tokenParams.ignoreSignature!,
    acrValues: tokenParams.acrValues,
  };

  if (tokenParams.pkce === false) {
    // Implicit flow or authorization_code without PKCE
    return oauthMeta;
  }

  const pkceMeta: PKCETransactionMeta = {
    ...oauthMeta,
    codeVerifier: tokenParams.codeVerifier!,
    codeChallengeMethod: tokenParams.codeChallengeMethod!,
    codeChallenge: tokenParams.codeChallenge!,
  };

  return pkceMeta;
}
