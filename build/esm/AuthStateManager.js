import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import _defineProperty from "@babel/runtime/helpers/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
import { AuthSdkError } from './errors';
import { getConsole } from './util';
import { EVENT_ADDED, EVENT_REMOVED } from './TokenManager';

var PCancelable = require('p-cancelable');

export var INITIAL_AUTH_STATE = null;
var DEFAULT_PENDING = {
  updateAuthStatePromise: null,
  canceledTimes: 0
};
var EVENT_AUTH_STATE_CHANGE = 'authStateChange';
var MAX_PROMISE_CANCEL_TIMES = 10; // only compare first level of authState

var isSameAuthState = (prevState, state) => {
  // initial state is null
  if (!prevState) {
    return false;
  }

  return prevState.isAuthenticated === state.isAuthenticated && JSON.stringify(prevState.idToken) === JSON.stringify(state.idToken) && JSON.stringify(prevState.accessToken) === JSON.stringify(state.accessToken) && prevState.error === state.error;
};

export class AuthStateManager {
  constructor(sdk) {
    if (!sdk.emitter) {
      throw new AuthSdkError('Emitter should be initialized before AuthStateManager');
    }

    this._sdk = sdk;
    this._pending = _objectSpread({}, DEFAULT_PENDING);
    this._authState = INITIAL_AUTH_STATE;
    this._logOptions = {}; // Listen on tokenManager events to start updateState process
    // "added" event is emitted in both add and renew process
    // Only listen on "added" event to update auth state

    sdk.tokenManager.on(EVENT_ADDED, (key, token) => {
      this._setLogOptions({
        event: EVENT_ADDED,
        key,
        token
      });

      this.updateAuthState();
    });
    sdk.tokenManager.on(EVENT_REMOVED, (key, token) => {
      this._setLogOptions({
        event: EVENT_REMOVED,
        key,
        token
      });

      this.updateAuthState();
    });
  }

  _setLogOptions(options) {
    this._logOptions = options;
  }

  getAuthState() {
    return this._authState;
  }

  updateAuthState() {
    var _this = this;

    return _asyncToGenerator(function* () {
      var {
        transformAuthState,
        devMode
      } = _this._sdk.options;

      var log = status => {
        var {
          event,
          key,
          token
        } = _this._logOptions;
        getConsole().group("OKTA-AUTH-JS:updateAuthState: Event:".concat(event, " Status:").concat(status));
        getConsole().log(key, token);
        getConsole().log('Current authState', _this._authState);
        getConsole().groupEnd(); // clear log options after logging

        _this._logOptions = {};
      };

      var emitAuthStateChange = authState => {
        if (isSameAuthState(_this._authState, authState)) {
          devMode && log('unchanged');
          return;
        }

        _this._authState = authState; // emit new authState object

        _this._sdk.emitter.emit(EVENT_AUTH_STATE_CHANGE, _objectSpread({}, authState));

        devMode && log('emitted');
      };

      var finalPromise = origPromise => {
        return _this._pending.updateAuthStatePromise.then(() => {
          var curPromise = _this._pending.updateAuthStatePromise;

          if (curPromise && curPromise !== origPromise) {
            return finalPromise(curPromise);
          }

          return _this.getAuthState();
        });
      };

      if (_this._pending.updateAuthStatePromise) {
        if (_this._pending.canceledTimes >= MAX_PROMISE_CANCEL_TIMES) {
          // stop canceling then starting a new promise
          // let existing promise finish to prevent running into loops
          devMode && log('terminated');
          return finalPromise(_this._pending.updateAuthStatePromise);
        } else {
          _this._pending.updateAuthStatePromise.cancel();
        }
      }
      /* eslint-disable complexity */


      var cancelablePromise = new PCancelable((resolve, _, onCancel) => {
        onCancel.shouldReject = false;
        onCancel(() => {
          _this._pending.updateAuthStatePromise = null;
          _this._pending.canceledTimes = _this._pending.canceledTimes + 1;
          devMode && log('canceled');
        });

        var emitAndResolve = authState => {
          if (cancelablePromise.isCanceled) {
            resolve();
            return;
          } // emit event and resolve promise 


          emitAuthStateChange(authState);
          resolve(); // clear pending states after resolve

          _this._pending = _objectSpread({}, DEFAULT_PENDING);
        };

        _this._sdk.isAuthenticated().then(() => {
          if (cancelablePromise.isCanceled) {
            resolve();
            return;
          }

          var {
            accessToken,
            idToken,
            refreshToken
          } = _this._sdk.tokenManager.getTokensSync();

          var authState = {
            accessToken,
            idToken,
            refreshToken,
            isAuthenticated: !!(accessToken && idToken)
          };
          var promise = transformAuthState ? transformAuthState(_this._sdk, authState) : Promise.resolve(authState);
          promise.then(authState => emitAndResolve(authState)).catch(error => emitAndResolve({
            accessToken,
            idToken,
            refreshToken,
            isAuthenticated: false,
            error
          }));
        });
      });
      /* eslint-enable complexity */

      _this._pending.updateAuthStatePromise = cancelablePromise;
      return finalPromise(cancelablePromise);
    })();
  }

  subscribe(handler) {
    this._sdk.emitter.on(EVENT_AUTH_STATE_CHANGE, handler);
  }

  unsubscribe(handler) {
    this._sdk.emitter.off(EVENT_AUTH_STATE_CHANGE, handler);
  }

}
//# sourceMappingURL=AuthStateManager.js.map