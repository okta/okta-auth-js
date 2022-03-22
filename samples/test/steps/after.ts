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


import { After } from '@cucumber/cucumber';
import ActionContext from '../support/context';
import a18nClient from '../support/management-api/a18nClient';
import deleteSelfEnrolledUser from '../support/management-api/deleteSelfEnrolledUser';
import deleteTestPolicies from '../support/action/context-enabled/org-config/deleteTestPolicies';


After(deleteTestPolicies);

After(async function(this: ActionContext) {
  if (this.app && !this.app.predefined) {
    await this.app.deactivate();
    await this.app.delete();
  }
  if (this.policies) {
    for (const policy of this.policies) {
      await policy.delete();
    }
  }
  if (this.group) {
    await this.group.delete();
  }
  if(this.user) {
    await this.user.deactivate();
    await this.user.delete();
  }
  if (this.credentials) {
    await deleteSelfEnrolledUser(this.credentials.emailAddress);
    await a18nClient.deleteProfile(this.credentials.profileId);
  }
});

After(() => browser.deleteCookies());

After(async function (this: ActionContext) {
  switch (this.featureName) {
    case 'Direct Auth Social Login with 1 Social IDP': 
    case 'Direct Auth with Self Hosted Sign In Widget Social Login with 1 Social IDP': {
      const url = 'https://facebook.com';
      await browser.url(url);
      await browser.deleteCookies();
      break;
    }
    default: {
      break;
    }
  }
});

