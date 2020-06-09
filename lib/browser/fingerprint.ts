import { OktaAuth } from '../types';
import { AuthSdkError } from '../errors';
import { isFingerprintSupported } from './features';
import {
  addListener,
  removeListener
} from '../oauthUtil';
import { FingerprintOptions } from '../types';

export default function fingerprint(sdk: OktaAuth, options: FingerprintOptions) {
  options = options || {};

  if (!isFingerprintSupported()) {
    return Promise.reject(new AuthSdkError('Fingerprinting is not supported on this device'));
  }

  var timeout;
  var iframe;
  var listener;
  var promise = new Promise(function (resolve, reject) {
    iframe = document.createElement('iframe');
    iframe.style.display = 'none';

    // eslint-disable-next-line complexity
    listener = function listener(e) {
      if (!e || !e.data || e.origin !== sdk.getIssuerOrigin()) {
        return;
      }

      try {
        var msg = JSON.parse(e.data);
      } catch (err) {
        // iframe messages should all be parsable
        // skip not parsable messages come from other sources in same origin (browser extensions)
        // TODO: add namespace flag in okta-core to distinguish messages that come from other sources
        return;
      }

      if (!msg) { return; }
      if (msg.type === 'FingerprintAvailable') {
        return resolve(msg.fingerprint);
      }
      if (msg.type === 'FingerprintServiceReady') {
        e.source.postMessage(JSON.stringify({
          type: 'GetFingerprint'
        }), e.origin);
      }
    };
    addListener(window, 'message', listener);

    iframe.src = sdk.getIssuerOrigin() + '/auth/services/devicefingerprint';
    document.body.appendChild(iframe);

    timeout = setTimeout(function() {
      reject(new AuthSdkError('Fingerprinting timed out'));
    }, options.timeout || 15000);
  });

  return promise.finally(function() {
    clearTimeout(timeout);
    removeListener(window, 'message', listener);
    if (document.body.contains(iframe)) {
      iframe.parentElement.removeChild(iframe);
    }
  });
}
