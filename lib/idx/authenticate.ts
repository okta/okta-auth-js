import idx from '@okta/okta-idx-js';
import { getTransactionMeta, proceedWithIdx } from './util';
import { IDX_VERSION } from './constants';
import { AuthApiError } from '../errors';

const allowedActionPaths = ['identify', 'challenge-authenticator'];
const valueMap = {
  identifier: 'username',
  'credentials.passcode': 'password',
};

export async function authenticate(sdk, credentialsOptions) {
  const meta = await getTransactionMeta(sdk);
  const { issuer } = sdk.options;
  const { codeVerifier } = meta;

  return idx
    .start({
      version: IDX_VERSION,
      issuer,
      ...meta
    })
    .then(idxResp => {
      sdk.transactionManager.save(meta);
      return proceedWithIdx(idxResp, allowedActionPaths, valueMap, credentialsOptions);
    })
    .then(interactionCode => {
      return sdk.token
          .exchangeCodeForTokens({ 
            codeVerifier, 
            interactionCode 
          })
          .then(({ tokens }) => {
            return tokens;
          });
    })
    .catch(err => {
      console.log('error', err);
      throw new AuthApiError(err);
    });
}
