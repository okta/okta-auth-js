import { OktaAuthHttpInterface } from '../../http/types';
import { find, omit, toQueryString } from '../../util';
import AuthSdkError from '../../errors/AuthSdkError';
import { get } from '../../http';
import { AuthnTransactionAPI, AuthnTransactionState } from '../types';
import { postToTransaction } from '../api';
import { addStateToken } from './stateToken';


// query parameters to post url
interface PostToTransactionParams {
  autoPush?: boolean;
  rememberDevice?: boolean;
  updatePhone?: boolean;
}

// eslint-disable-next-line max-params
export function link2fn(sdk: OktaAuthHttpInterface, tx: AuthnTransactionAPI, res, obj, link, ref) {
  if (Array.isArray(link)) {
    return function(name, opts?) {
      if (!name) {
        throw new AuthSdkError('Must provide a link name');
      }

      var lk = find(link, {name: name});
      if (!lk) {
        throw new AuthSdkError('No link found for that name');
      }

      return link2fn(sdk, tx, res, obj, lk, ref)(opts);
    };

  } else if (link.hints &&
      link.hints.allow &&
      link.hints.allow.length === 1) {
    var method = link.hints.allow[0];
    switch (method) {

      case 'GET':
        return function() {
          return get(sdk, link.href, { withCredentials: true });
        };

      case 'POST':
        // eslint-disable-next-line max-statements,complexity
        return function(opts: AuthnTransactionState) {
          if (ref && ref.isPolling) {
            ref.isPolling = false;
          }

          var data = addStateToken(res, opts);

          if (res.status === 'MFA_ENROLL' || res.status === 'FACTOR_ENROLL') {
            // Add factorType and provider
            Object.assign(data, {
              factorType: obj.factorType,
              provider: obj.provider
            });
          }

          var params = {} as PostToTransactionParams;
          var autoPush = data.autoPush;
          if (autoPush !== undefined) {
            if (typeof autoPush === 'function') {
              try {
                params.autoPush = !!autoPush();
              }
              catch (e) {
                return Promise.reject(new AuthSdkError('AutoPush resulted in an error.'));
              }
            }
            else if (autoPush !== null) {
              params.autoPush = !!autoPush;
            }
            data = omit(data, 'autoPush');
          }

          var rememberDevice = data.rememberDevice;
          if (rememberDevice !== undefined) {
            if (typeof rememberDevice === 'function') {
              try {
                params.rememberDevice = !!rememberDevice();
              }
              catch (e) {
                return Promise.reject(new AuthSdkError('RememberDevice resulted in an error.'));
              }
            }
            else if (rememberDevice !== null) {
              params.rememberDevice = !!rememberDevice;
            }
            data = omit(data, 'rememberDevice');

          } else if (data.profile &&
                    data.profile.updatePhone !== undefined) {
            if (data.profile.updatePhone) {
              params.updatePhone = true;
            }
            data.profile = omit(data.profile, 'updatePhone');
          }
          var href = link.href + toQueryString(params);
          return postToTransaction(sdk, tx, href, data);
        };
    }
  }
}


