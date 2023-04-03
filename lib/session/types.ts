import { OktaAuthHttpInterface, OktaAuthHttpOptions } from '../http/types';
import { StorageManagerInterface } from '../storage/types';

// Session API
export interface SessionObject {
  status: string;
  refresh?: () => Promise<object>;
  user?: () => Promise<object>;
}

export interface SessionAPI {
  close: () => Promise<object>;
  exists: () => Promise<boolean>;
  get: () => Promise<SessionObject>;
  refresh: () => Promise<object>;
  setCookieAndRedirect: (sessionToken?: string, redirectUri?: string) => void;
}

export interface OktaAuthSessionInterface
<
  S extends StorageManagerInterface = StorageManagerInterface,
  O extends OktaAuthHttpOptions = OktaAuthHttpOptions
> 
  extends OktaAuthHttpInterface<S, O>
{
  session: SessionAPI;
  closeSession(): Promise<boolean>;
}
