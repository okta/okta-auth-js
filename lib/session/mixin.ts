import { OktaAuthHttpInterface, OktaAuthHttpOptions } from '../http/types';
import { OktaAuthConstructor } from '../base/types';
import { createSessionApi } from './factory';
import {
  OktaAuthSessionInterface, SessionAPI,
} from './types';
import { StorageManagerInterface } from '../storage/types';

export function mixinSession
<
  S extends StorageManagerInterface = StorageManagerInterface,
  O extends OktaAuthHttpOptions = OktaAuthHttpOptions,
  TBase extends OktaAuthConstructor<OktaAuthHttpInterface<S, O>>
    = OktaAuthConstructor<OktaAuthHttpInterface<S, O>>
>
(Base: TBase): TBase & OktaAuthConstructor<OktaAuthSessionInterface<S, O>>
{
  return class OktaAuthSession extends Base implements OktaAuthSessionInterface<S, O>
  {
    session: SessionAPI;

    constructor(...args: any[]) {
      super(...args);

      this.session = createSessionApi(this);
    }

    // Ends the current Okta SSO session without redirecting to Okta.
    closeSession(): Promise<boolean> {
      return this.session.close() // DELETE /api/v1/sessions/me
      .then(async () => {
        // Clear all local tokens
        this.clearStorage();
        return true;
      })
      .catch(function(e) {
        if (e.name === 'AuthApiError' && e.errorCode === 'E0000007') {
          // Session does not exist or has already been closed
          return false;
        }
        throw e;
      });
    }
  };
}
