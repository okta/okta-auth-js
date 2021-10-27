"use strict";

exports.FlowMonitor = void 0;

var _transactionMeta = require("../transactionMeta");

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
class FlowMonitor {
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
    const remediatorName = remediator.getName();

    if (!values.skip && remediatorName === 'skip') {
      return false;
    }

    if (values.skip && remediatorName !== 'skip') {
      return false;
    }

    return true;
  }

  async trackRemediations(name) {
    let meta = await (0, _transactionMeta.getTransactionMeta)(this.authClient);
    const remediations = meta.remediations || [];
    meta = { ...meta,
      remediations: [...remediations, name]
    };
    (0, _transactionMeta.saveTransactionMeta)(this.authClient, meta);
  }

  isFinished() {
    return Promise.resolve(true);
  }

}

exports.FlowMonitor = FlowMonitor;
//# sourceMappingURL=FlowMonitor.js.map