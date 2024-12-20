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
 *
 */

import { post } from '../../http';
import { isNumber, isObject, getLink, toQueryString, delay as delayFn } from '../../util';
import { DEFAULT_POLLING_DELAY } from '../../constants';
import AuthSdkError from '../../errors/AuthSdkError';
import AuthPollStopError from '../../errors/AuthPollStopError';
import { isAuthApiError } from '../../errors';
import { AuthnTransactionState } from '../types';
import { getStateToken } from './stateToken';
import { isIOS } from '../../features';

interface PollOptions {
  delay?: number;
  rememberDevice?: boolean;
  autoPush?: boolean;
  transactionCallBack?: (AuthnTransactionState) => void;
}

export function getPollFn(sdk, res: AuthnTransactionState, ref) {
  return function (options: PollOptions | number) {
    var delay;
    var rememberDevice;
    var autoPush;
    var transactionCallBack;

    if (isNumber(options)) {
      delay = options;
    } else if (isObject(options)) {
      options = options as PollOptions;
      delay = options.delay;
      rememberDevice = options.rememberDevice;
      autoPush = options.autoPush;
      transactionCallBack = options.transactionCallBack;
    }

    if (!delay && delay !== 0) {
      delay = DEFAULT_POLLING_DELAY;
    }

    // Get the poll function
    var pollLink = getLink(res, 'next', 'poll');
    // eslint-disable-next-line complexity
    function pollFn() {
      var opts = {} as PollOptions;
      if (typeof autoPush === 'function') {
        try {
          opts.autoPush = !!autoPush();
        }
        catch (e) {
          return Promise.reject(new AuthSdkError('AutoPush resulted in an error.'));
        }
      }
      else if (autoPush !== undefined && autoPush !== null) {
        opts.autoPush = !!autoPush;
      }
      if (typeof rememberDevice === 'function') {
        try {
          opts.rememberDevice = !!rememberDevice();
        }
        catch (e) {
          return Promise.reject(new AuthSdkError('RememberDevice resulted in an error.'));
        }
      }
      else if (rememberDevice !== undefined && rememberDevice !== null) {
        opts.rememberDevice = !!rememberDevice;
      }

      var href = pollLink.href + toQueryString(opts);
      return post(sdk, href, getStateToken(res), {
        saveAuthnState: false,
        withCredentials: true
      });
    }

    const delayNextPoll = (ms) => {
      // no need for extra logic in non-iOS environments, just continue polling
      if (!isIOS()) {
        return delayFn(ms);
      }

      let timeoutId: ReturnType<typeof setTimeout>;
      const cancelableDelay = () => {
        return new Promise((resolve) => {
          timeoutId = setTimeout(resolve, ms);
        });
      };

      const delayForFocus = () => {
        let pageVisibilityHandler;
        return new Promise<void>((resolve) => {
          let pageDidHide = false;
          pageVisibilityHandler = () => {
            if (document.hidden) {
              clearTimeout(timeoutId);
              pageDidHide = true;
            }
            else if (pageDidHide) {
              resolve();
            }
          };

          document.addEventListener('visibilitychange', pageVisibilityHandler);
        })
        .then(() => {
          document.removeEventListener('visibilitychange', pageVisibilityHandler);
        });
      };

      return Promise.race([
        // this function will never resolve if the page changes to hidden because the timeout gets cleared
        cancelableDelay(),
        // this function won't resolve until the page becomes visible after being hidden
        delayForFocus(),
      ]);
    };

    ref.isPolling = true;

    var retryCount = 0;
    var recursivePoll = function () {
      // If the poll was manually stopped during the delay
      if (!ref.isPolling) {
        return Promise.reject(new AuthPollStopError());
      }

      // don't trigger polling request if page is hidden wait until window is visible again
      if (isIOS() && document.hidden) {
        let handler;
        return new Promise<void>((resolve) => {
          handler = () => {
            if (!document.hidden) {
              resolve();
            }
          };
          document.addEventListener('visibilitychange', handler);
        })
        .then(() => {
          document.removeEventListener('visibilitychange', handler);
          return recursivePoll();
        });
      }

      return pollFn()
        .then(function (pollRes) {
          // Reset our retry counter on success
          retryCount = 0;

          // If we're still waiting
          if (pollRes.factorResult && pollRes.factorResult === 'WAITING') {

            // If the poll was manually stopped while the pollFn was called
            if (!ref.isPolling) {
              throw new AuthPollStopError();
            }

            if (typeof transactionCallBack === 'function') {
              transactionCallBack(pollRes);
            }

            // Continue poll
            return delayNextPoll(delay).then(recursivePoll);

          } else {
            // Any non-waiting result, even if polling was stopped
            // during a request, will return
            ref.isPolling = false;
            return sdk.tx.createTransaction(pollRes);
          }
        })
        .catch(function(err) {
          const isTooManyRequests = err.xhr &&
            (err.xhr.status === 0 || err.xhr.status === 429);
          const isNetworkError = isAuthApiError(err) && err.message === 'Load failed';
          const canRetry = isTooManyRequests || isNetworkError;
          // Exponential backoff, up to 16 seconds
          if (canRetry && retryCount <= 4) {
            var delayLength = isNetworkError ? 200 : Math.pow(2, retryCount) * 1000;
            retryCount++;
            return delayNextPoll(delayLength)
              .then(recursivePoll);
          }
          throw err;
        });
    };
    return recursivePoll()
      .catch(function(err) {
        ref.isPolling = false;
        throw err;
      });
  };
}
