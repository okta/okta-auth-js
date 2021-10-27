import _defineProperty from "@babel/runtime/helpers/defineProperty";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";

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
import { getTransactionMeta, saveTransactionMeta } from '../transactionMeta';
export class FlowMonitor {
  constructor(authClient) {
    this.authClient = authClient;
  } // detect in-memory loop


  loopDetected(remediator) {
    if (!this.previousRemediator) {
      this.previousRemediator = remediator;
      return false;
    }

    if (this.previousRemediator.getName() === remediator.getName()) {
      return true;
    }

    this.previousRemediator = remediator;
    return false;
  }

  isRemediatorCandidate( // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  remediator, remediations, values) {
    var remediatorName = remediator.getName();

    if (!values.skip && remediatorName === 'skip') {
      return false;
    }

    if (values.skip && remediatorName !== 'skip') {
      return false;
    }

    return true;
  }

  trackRemediations(name) {
    var _this = this;

    return _asyncToGenerator(function* () {
      var meta = yield getTransactionMeta(_this.authClient);
      var remediations = meta.remediations || [];
      meta = _objectSpread(_objectSpread({}, meta), {}, {
        remediations: [...remediations, name]
      });
      saveTransactionMeta(_this.authClient, meta);
    })();
  }

  isFinished() {
    return Promise.resolve(true);
  }

}
//# sourceMappingURL=FlowMonitor.js.map