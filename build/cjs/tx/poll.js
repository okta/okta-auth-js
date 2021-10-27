"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.getPollFn = getPollFn;

var _http = require("../http");

var _util = require("../util");

var _constants = require("../constants");

var _AuthSdkError = _interopRequireDefault(require("../errors/AuthSdkError"));

var _AuthPollStopError = _interopRequireDefault(require("../errors/AuthPollStopError"));

var _TransactionState = require("./TransactionState");

var _AuthTransaction = require("./AuthTransaction");

var _util2 = require("./util");

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
function getPollFn(sdk, res, ref) {
  return function (options) {
    var delay;
    var rememberDevice;
    var autoPush;
    var transactionCallBack;

    if ((0, _util.isNumber)(options)) {
      delay = options;
    } else if ((0, _util.isObject)(options)) {
      options = options;
      delay = options.delay;
      rememberDevice = options.rememberDevice;
      autoPush = options.autoPush;
      transactionCallBack = options.transactionCallBack;
    }

    if (!delay && delay !== 0) {
      delay = _constants.DEFAULT_POLLING_DELAY;
    } // Get the poll function


    var pollLink = (0, _util.getLink)(res, 'next', 'poll'); // eslint-disable-next-line complexity

    function pollFn() {
      var opts = {};

      if (typeof autoPush === 'function') {
        try {
          opts.autoPush = !!autoPush();
        } catch (e) {
          return Promise.reject(new _AuthSdkError.default('AutoPush resulted in an error.'));
        }
      } else if (autoPush !== undefined && autoPush !== null) {
        opts.autoPush = !!autoPush;
      }

      if (typeof rememberDevice === 'function') {
        try {
          opts.rememberDevice = !!rememberDevice();
        } catch (e) {
          return Promise.reject(new _AuthSdkError.default('RememberDevice resulted in an error.'));
        }
      } else if (rememberDevice !== undefined && rememberDevice !== null) {
        opts.rememberDevice = !!rememberDevice;
      }

      var href = pollLink.href + (0, _util.toQueryString)(opts);
      return (0, _http.post)(sdk, href, (0, _util2.getStateToken)(res), {
        saveAuthnState: false,
        withCredentials: true
      });
    }

    ref.isPolling = true;
    var retryCount = 0;

    var recursivePoll = function () {
      // If the poll was manually stopped during the delay
      if (!ref.isPolling) {
        return Promise.reject(new _AuthPollStopError.default());
      }

      return pollFn().then(function (pollRes) {
        // Reset our retry counter on success
        retryCount = 0; // If we're still waiting

        if (pollRes.factorResult && pollRes.factorResult === 'WAITING') {
          // If the poll was manually stopped while the pollFn was called
          if (!ref.isPolling) {
            throw new _AuthPollStopError.default();
          }

          if (typeof transactionCallBack === 'function') {
            transactionCallBack(pollRes);
          } // Continue poll


          return (0, _util.delay)(delay).then(recursivePoll);
        } else {
          // Any non-waiting result, even if polling was stopped
          // during a request, will return
          ref.isPolling = false;
          return new _AuthTransaction.AuthTransaction(sdk, pollRes);
        }
      }).catch(function (err) {
        // Exponential backoff, up to 16 seconds
        if (err.xhr && (err.xhr.status === 0 || err.xhr.status === 429) && retryCount <= 4) {
          var delayLength = Math.pow(2, retryCount) * 1000;
          retryCount++;
          return (0, _util.delay)(delayLength).then(recursivePoll);
        }

        throw err;
      });
    };

    return recursivePoll().catch(function (err) {
      ref.isPolling = false;
      throw err;
    });
  };
}
//# sourceMappingURL=poll.js.map