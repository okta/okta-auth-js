import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";

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
import { FlowMonitor } from './FlowMonitor';
import { getTransactionMeta } from '../transactionMeta';
export class PasswordRecoveryFlowMonitor extends FlowMonitor {
  isRemediatorCandidate(remediator, remediations, values) {
    var _this$previousRemedia;

    var prevRemediatorName = (_this$previousRemedia = this.previousRemediator) === null || _this$previousRemedia === void 0 ? void 0 : _this$previousRemedia.getName();
    var remediatorName = remediator.getName();

    if (remediatorName === 'select-authenticator-authenticate' && ['select-authenticator-authenticate', 'reenroll-authenticator'].includes(prevRemediatorName)) {
      return false;
    }

    if (remediatorName === 'select-authenticator-authenticate' && remediations.some(_ref => {
      var {
        name
      } = _ref;
      return name === 'challenge-authenticator';
    })) {
      return false;
    }

    return super.isRemediatorCandidate(remediator, remediations, values);
  }

  isFinished() {
    var _superprop_getIsFinished = () => super.isFinished,
        _this = this;

    return _asyncToGenerator(function* () {
      var {
        remediations
      } = yield getTransactionMeta(_this.authClient);

      if (!remediations.includes('reset-authenticator')) {
        return false;
      }

      return yield _superprop_getIsFinished().call(_this);
    })();
  }

}
//# sourceMappingURL=PasswordRecoveryFlowMonitor.js.map