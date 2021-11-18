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


import { OktaAuth } from '../../types';
import { Remediator, RemediationValues, SkipValues } from '../remediators';
import { getTransactionMeta, saveTransactionMeta } from '../transactionMeta';
import { IdxRemediation } from '../types/idx-js';

export class FlowMonitor {
  previousRemediator: Remediator;
  authClient: OktaAuth;

  constructor(authClient) {
    this.authClient = authClient;
  }

  // detect in-memory loop
  loopDetected(remediator: Remediator): boolean {
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

  isRemediatorCandidate(
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    remediator: Remediator, remediations?: IdxRemediation[], values?: RemediationValues & SkipValues
  ): boolean {
    const remediatorName = remediator.getName();
    if (!values.skip && remediatorName === 'skip') {
      return false;
    }
    if (values.skip && remediatorName !== 'skip') {
      return false;
    }
    return true;
  }

  async trackRemediations(name: string) {
    let meta = await getTransactionMeta(this.authClient);
    const remediations = meta.remediations || [];
    meta = { 
      ...meta, 
      remediations: [...remediations, name]
    };
    saveTransactionMeta(this.authClient, meta);
  }

  isFinished(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
