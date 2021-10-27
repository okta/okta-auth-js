"use strict";

exports.addListener = addListener;
exports.removeListener = removeListener;
exports.loadFrame = loadFrame;
exports.loadPopup = loadPopup;
exports.addPostMessageListener = addPostMessageListener;

var _errors = require("../../errors");

var _features = require("../../features");

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

/* global window, document */

/* eslint-disable complexity, max-statements */
function addListener(eventTarget, name, fn) {
  if (eventTarget.addEventListener) {
    eventTarget.addEventListener(name, fn);
  } else {
    eventTarget.attachEvent('on' + name, fn);
  }
}

function removeListener(eventTarget, name, fn) {
  if (eventTarget.removeEventListener) {
    eventTarget.removeEventListener(name, fn);
  } else {
    eventTarget.detachEvent('on' + name, fn);
  }
}

function loadFrame(src) {
  var iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = src;
  return document.body.appendChild(iframe);
}

function loadPopup(src, options) {
  var title = options.popupTitle || 'External Identity Provider User Authentication';
  var appearance = 'toolbar=no, scrollbars=yes, resizable=yes, ' + 'top=100, left=500, width=600, height=600';

  if ((0, _features.isIE11OrLess)()) {
    // IE<=11 doesn't fully support postMessage at time of writting.
    // the following simple solution happened to solve the issue
    // without adding another proxy layer which makes flow more complecated.
    var winEl = window.open('/', title, appearance);
    winEl.location.href = src;
    return winEl;
  } else {
    return window.open(src, title, appearance);
  }
}

function addPostMessageListener(sdk, timeout, state) {
  var responseHandler;
  var timeoutId;
  var msgReceivedOrTimeout = new Promise(function (resolve, reject) {
    responseHandler = function responseHandler(e) {
      if (!e.data || e.data.state !== state) {
        // A message not meant for us
        return;
      } // Configuration mismatch between saved token and current app instance
      // This may happen if apps with different issuers are running on the same host url
      // If they share the same storage key, they may read and write tokens in the same location.
      // Common when developing against http://localhost


      if (e.origin !== sdk.getIssuerOrigin()) {
        return reject(new _errors.AuthSdkError('The request does not match client configuration'));
      }

      resolve(e.data);
    };

    addListener(window, 'message', responseHandler);
    timeoutId = setTimeout(function () {
      reject(new _errors.AuthSdkError('OAuth flow timed out'));
    }, timeout || 120000);
  });
  return msgReceivedOrTimeout.finally(function () {
    clearTimeout(timeoutId);
    removeListener(window, 'message', responseHandler);
  });
}
//# sourceMappingURL=browser.js.map