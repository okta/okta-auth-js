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

import { 
  EnrollPollRemediationFactory,
} from '@okta/test.support/idx';
import { RemediationValues, Remediator } from '../../../../lib/idx/remediators';
import { EnrollPoll } from '../../../../lib/idx/remediators/EnrollPoll';

describe('EnrollPoll remediator', () => {
  let testContext;
  beforeEach(() => {
    const authClient = {};
    const enrollPollRemediation = EnrollPollRemediationFactory.build();
    const values: RemediationValues = {
      authenticators: [],
      authenticatorsData: []
    };
    testContext = {
      authClient,
      enrollPollRemediation,
      values
    };
  });
  
  it('sets static property `remediationName`', () => {
    expect(EnrollPoll.remediationName).toBe('enroll-poll');
  });

  it('extends Remediator', () => {
    const { enrollPollRemediation, values } = testContext;
    const remediator: Remediator = new EnrollPoll(enrollPollRemediation, values);
    Object.keys(Remediator.prototype).forEach(val => {
      expect(remediator[val]).toBeTruthy();
    });
  });

  describe('getValuesAfterProceed', () => {
    it('removes `startPolling` from the values', () => {
      const { authClient, enrollPollRemediation, values } = testContext;
      values.foo = 'bar';
      values.startPolling = 'omgyes';
      const remediator: EnrollPoll = new EnrollPoll(authClient, enrollPollRemediation, values);
      const newValues: RemediationValues = remediator.getValuesAfterProceed();
      expect(newValues).toEqual({
        authenticators: [],
        authenticatorsData: [],
        foo: 'bar'
      });
    });
  });



});