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
import { IdxRemediationValueForm, IdxOption, IdxRemediationValue, IdxContext } from '../types/idx-js';
import { Authenticator } from '../types';
import { getAuthenticatorFromRemediation } from './util';
import { OktaAuthIdxInterface } from '../../types';


export type SelectEnrollmentChannelValues = RemediationValues & {
  channel?: string;
};

export class SelectEnrollmentChannel extends Remediator<SelectEnrollmentChannelValues> {
  static remediationName = 'select-enrollment-channel';

  canRemediate() {
    return Boolean(this.values.channel);

    // if (this.values.channel) {
    //   return true;
    // }

    // if (this.values.authenticator) {
    //   const { id, channel } = this.values.authenticator as Authenticator;
    //   if (!!id && !!channel) {
    //     return true;
    //   }
    // }

    // return false;
  }

  getNextStep(authClient: OktaAuthIdxInterface, context: IdxContext) {
    const common = super.getNextStep(authClient, context);
    const options = this.getChannels();
    const authenticator = context.currentAuthenticator.value;
    return {
      ...common,
      // TODO: remove options field in the next major version - OKTA-491236
      ...(options && { options }),
      authenticator,
    };
  }

  private getChannels(): IdxOption[] | undefined {
    const authenticator: IdxRemediationValue = getAuthenticatorFromRemediation(this.remediation);
    const remediationValue = authenticator.value as IdxRemediationValueForm;
    return remediationValue.form.value.find(({ name }) => name === 'channel')?.options;
  }

  getData() {
    // if (this.values.authenticator) {
    //   const { stateHandle, authenticator } = this.values;
    //   return { stateHandle, authenticator };
    // }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const remediationValue = this.remediation!.value![0].value as IdxRemediationValueForm;
    return {
      authenticator: {
        id: remediationValue.form.value[0].value,
        channel: this.values.channel,
      },
      stateHandle: this.values.stateHandle,

    };
  }

  getValuesAfterProceed(): SelectEnrollmentChannelValues {
    let trimmedValues = Object.keys(this.values).filter(valueKey => valueKey !== 'channel');
    return trimmedValues.reduce((values, valueKey) => ({...values, [valueKey]: this.values[valueKey]}), {});
  }
}
