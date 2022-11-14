/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { OAuthTransactionMeta, OktaAuthOAuthInterface, EnrollAuthenticatorOptions } from '../types';
import { getOAuthUrls } from './oauth';

export function createEnrollAuthenticatorMeta(
  sdk: OktaAuthOAuthInterface, 
  params: EnrollAuthenticatorOptions
): OAuthTransactionMeta {
  const issuer = sdk.options.issuer!;
  const urls = getOAuthUrls(sdk, params);
  const oauthMeta: OAuthTransactionMeta = {
    issuer,
    urls,
    clientId: params.clientId!,
    redirectUri: params.redirectUri!,
    responseType: params.responseType!,
    responseMode: params.responseMode!,
    state: params.state!,
    acrValues: params.acrValues,
    enrollAmrValues: params.enrollAmrValues,
  };

  return oauthMeta;
}
