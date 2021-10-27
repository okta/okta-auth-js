"use strict";

exports.AuthenticationFlowMonitor = void 0;

var _FlowMonitor = require("./FlowMonitor");

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
class AuthenticationFlowMonitor extends _FlowMonitor.FlowMonitor {
  isRemediatorCandidate(remediator, remediations, values) {
    var _this$previousRemedia;

    const prevRemediatorName = (_this$previousRemedia = this.previousRemediator) === null || _this$previousRemedia === void 0 ? void 0 : _this$previousRemedia.getName();
    const remediatorName = remediator.getName();

    if (remediatorName === 'select-authenticator-authenticate' && ['select-authenticator-authenticate'].includes(prevRemediatorName)) {
      return false;
    }

    if (remediatorName === 'select-authenticator-authenticate' && remediations.some(({
      name
    }) => name === 'challenge-authenticator')) {
      return false;
    }

    if (remediatorName === 'select-authenticator-enroll' && ['select-authenticator-enroll', 'authenticator-enrollment-data'].includes(prevRemediatorName)) {
      return false;
    }

    return super.isRemediatorCandidate(remediator, remediations, values);
  }

}

exports.AuthenticationFlowMonitor = AuthenticationFlowMonitor;
//# sourceMappingURL=AuthenticationFlowMonitor.js.map