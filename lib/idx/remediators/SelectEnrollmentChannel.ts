/*!
 * Copyright (c) 2021-present, Okta, Inc. and/or its affiliates. All rights reserved.
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
import { IdxRemediationValueForm, IdxContext } from '../types/idx-js';
import { Authenticator, OktaAuthIdxInterface } from '../types/api';


export type SelectEnrollmentChannelValues = RemediationValues & {
  channel?: string;
};

export class SelectEnrollmentChannel extends Remediator<SelectEnrollmentChannelValues> {
  static remediationName = 'select-enrollment-channel';

  canRemediate() {
    if (this.values.channel) {
      return true;
    }

    if (this.values.authenticator) {
      const { id, channel } = this.values.authenticator as Authenticator;
      if (!!id && !!channel) {
        return true;
      }
    }

    return false;
  }

  getNextStep(authClient: OktaAuthIdxInterface, context: IdxContext) {
    const common = super.getNextStep(authClient, context);
    const authenticator = context.currentAuthenticator.value;
    return {
      ...common,
      authenticator,
    };
  }

  getData() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const remediationValue = this.remediation!.value![0].value as IdxRemediationValueForm;
    return {
      authenticator: {
        id: remediationValue.form.value[0].value,
        channel: (this.values.authenticator as Authenticator)?.channel || this.values.channel,
      },
      stateHandle: this.values.stateHandle,

    };
  }

  getValuesAfterProceed(): SelectEnrollmentChannelValues {
    this.values = super.getValuesAfterProceed();
    delete this.values.authenticators;    // required to prevent infinite loops from auto-remediating via values
    const filterKey = this.values.channel ? 'channel' : 'authenticator';
    let trimmedValues = Object.keys(this.values).filter(valueKey => valueKey !== filterKey);
    return trimmedValues.reduce((values, valueKey) => ({...values, [valueKey]: this.values[valueKey]}), {});
  }
}
