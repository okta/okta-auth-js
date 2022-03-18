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


import createCredentials from '../../../management-api/createCredentials';
import createUser from '../../../management-api/createUser';
import ActionContext, { getReusedContext } from '../../../context';
import { Scenario } from '../../../scenario';

const FEATURE_GROUPS_MAP = {
  'TOTP Support (Google Authenticator) Sign In': ['MFA Required', 'Google Authenticator Enrollment Required'],
  'TOTP Support (Google Authenticator) Sign Up': ['MFA Required', 'Google Authenticator Enrollment Required']
};

export default async function (this: ActionContext, {
  firstName, 
  assignToGroups, 
  activate = true
} : { 
  firstName: string; 
  assignToGroups?: string[]; 
  activate?: boolean; 
}): Promise<void> {
  // Scenario 10.1.3
  if (this.isCurrentScenario(Scenario.TOTP_SIGN_IN_REUSE_SHARED_SECRET)) {
    // reuse context
    this.sharedSecret = getReusedContext().sharedSecret;
    this.user = getReusedContext().user;
    this.userName = getReusedContext().userName;
  } else {
    // don't create a18n profile and don't save credentials in context
    assignToGroups = assignToGroups || (FEATURE_GROUPS_MAP as any)[this.featureName];
    const credentials = this.credentials || await createCredentials(firstName, this.featureName, false);
    const user = await createUser({ 
      credentials, 
      assignToGroups, 
      activate,
      customAttribute: this.customAttribute
    });
    this.user = user;
  }
} 
