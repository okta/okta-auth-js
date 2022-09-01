import { OktaAuthStorageInterface, StorageManagerInterface } from '../storage/types';
import { OktaAuthConstructor } from '../base/types';
import {
  HttpAPI,
  OktaAuthHttpInterface,
  OktaAuthHttpOptions,
} from './types';
import { OktaUserAgent } from './OktaUserAgent';
import { setRequestHeader } from './headers';
import { toQueryString } from '../util';
import { get } from './request';

export function mixinHttp
<
  S extends StorageManagerInterface = StorageManagerInterface,
  O extends OktaAuthHttpOptions = OktaAuthHttpOptions,
  TBase extends OktaAuthConstructor<OktaAuthStorageInterface<S, O>>
    = OktaAuthConstructor<OktaAuthStorageInterface<S, O>>
>
(Base: TBase): TBase & OktaAuthConstructor<OktaAuthHttpInterface<S, O>>
{
  return class OktaAuthHttp extends Base implements OktaAuthHttpInterface<S, O>
  {
    _oktaUserAgent: OktaUserAgent;
    http: HttpAPI;
    
    constructor(...args: any[]) {
      super(...args);

      this._oktaUserAgent = new OktaUserAgent();

      // HTTP
      this.http = {
        setRequestHeader: setRequestHeader.bind(null, this)
      };
    }

    setHeaders(headers) {
      this.options.headers = Object.assign({}, this.options.headers, headers);
    }
  
    getIssuerOrigin(): string {
      // Infer the URL from the issuer URL, omitting the /oauth2/{authServerId}
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.options.issuer!.split('/oauth2/')[0];
    }
  
    webfinger(opts): Promise<object> {
      var url = '/.well-known/webfinger' + toQueryString(opts);
      var options = {
        headers: {
          'Accept': 'application/jrd+json'
        }
      };
      return get(this, url, options);
    }
  };
}
