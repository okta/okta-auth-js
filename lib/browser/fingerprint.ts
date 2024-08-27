/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


import { AuthSdkError } from '../errors';
import { isFingerprintSupported } from '../features';
import {
  addListener,
  removeListener
} from '../oidc';
import { FingerprintOptions } from '../base/types';
import { OktaAuthHttpInterface } from '../http/types';

const isMessageFromCorrectSource = (iframe: HTMLIFrameElement, event: MessageEvent)
: boolean => event.source === iframe.contentWindow;

export default function fingerprint(sdk: OktaAuthHttpInterface, options?: FingerprintOptions): Promise<string> {
  if (!isFingerprintSupported()) {
    return Promise.reject(new AuthSdkError('Fingerprinting is not supported on this device'));
  }

  const container = options?.container ?? document.body;
  let timeout: NodeJS.Timeout;
  let iframe: HTMLIFrameElement;
  let listener: (this: Window, ev: MessageEvent) => void;
  const promise = new Promise(function (resolve, reject) {
    iframe = document.createElement('iframe');
    iframe.style.display = 'none';

    // eslint-disable-next-line complexity
    listener = function listener(e: MessageEvent) {
      if (!isMessageFromCorrectSource(iframe, e)) {
        return;
      }

      if (!e || !e.data || e.origin !== sdk.getIssuerOrigin()) {
        return;
      }

      let msg;
      try {
        msg = JSON.parse(e.data);
      } catch (err) {
        // iframe messages should all be parsable
        // skip not parsable messages come from other sources in same origin (browser extensions)
        // TODO: add namespace flag in okta-core to distinguish messages that come from other sources
        return;
      }

      if (!msg) { return; }
      if (msg.type === 'FingerprintAvailable') {
        return resolve(msg.fingerprint as string);
      } else if (msg.type === 'FingerprintServiceReady') {
        iframe?.contentWindow?.postMessage(JSON.stringify({
          type: 'GetFingerprint'
        }), e.origin);
      } else {
        return reject(new AuthSdkError('No data'));
      }
    };
    addListener(window, 'message', listener);

    iframe.src = sdk.getIssuerOrigin() + '/auth/services/devicefingerprint';
    container.appendChild(iframe);

    timeout = setTimeout(function() {
      reject(new AuthSdkError('Fingerprinting timed out'));
    }, options?.timeout || 15000);
  });

  return promise.finally(function() {
    clearTimeout(timeout);
    removeListener(window, 'message', listener);
    if (container.contains(iframe)) {
      iframe.parentElement?.removeChild(iframe);
    }
  }) as Promise<string>;
}
