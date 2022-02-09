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


import { Remediator, RemediationValues } from './Base/Remediator';
import { NextStep } from '../../types';
import { IdxContext } from '../types/idx-js';

export interface EnrollPollValues extends RemediationValues {
  startPolling?: boolean;
}

export class EnrollPoll extends Remediator {
  static remediationName = 'enroll-poll';

  values!: EnrollPollValues;

  canRemediate() {
    return !!this.values.startPolling || this.options.step === 'enroll-poll';
  }

  getNextStep(context?: IdxContext): NextStep {
    const common = super.getNextStep(context);
    let authenticator = this.getAuthenticator();
    if (!authenticator && context?.currentAuthenticator) {
      authenticator = context.currentAuthenticator.value;
    }
    return {
      ...common,
      authenticator,
      poll: {
        required: true,
        refresh: this.remediation.refresh
      },
    };
  }

  getValuesAfterProceed(): EnrollPollValues {
    let trimmedValues = Object.keys(this.values).filter(valueKey => valueKey !== 'startPolling');
    return trimmedValues.reduce((values, valueKey) => ({...values, [valueKey]: this.values[valueKey]}), {});
  }
}
