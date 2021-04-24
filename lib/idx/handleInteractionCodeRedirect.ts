import { AuthSdkError, OAuthError } from '../errors';
import { OktaAuth } from '..';
import {IdxTransactionMeta} from '../types';

export async function handleInteractionCodeRedirect(
  authClient: OktaAuth, 
  url: string
): Promise<void> {
  const meta = authClient.transactionManager.load() as IdxTransactionMeta;
  if (!meta) {
    throw new Error('No transaction data was found in storage');
  }

  const { 
    codeVerifier,
    state: savedState 
  } = meta;
  const { 
    searchParams
  // URL API has been added to the polyfill
  // eslint-disable-next-line compat/compat
  } = new URL(url); 
  const state = searchParams.get('state');
  const interactionCode = searchParams.get('interaction_code');

  // Error handling
  const error = searchParams.get('error');
  if (error) {
    throw new OAuthError(error, searchParams.get('error_description'));
  }
  if (state !== savedState) {
    throw new AuthSdkError('State in redirect uri does not match with transaction state');
  }
  if (!interactionCode) {
    throw new AuthSdkError('Unable to parse interaction_code from the url');
  }
  
  // Save tokens to storage
  const { tokens } = await authClient.token.exchangeCodeForTokens({ interactionCode, codeVerifier });
  authClient.tokenManager.setTokens(tokens);
}