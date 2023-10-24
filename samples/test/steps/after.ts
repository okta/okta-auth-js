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

/* eslint-disable complexity */

import { After, AfterStep, Status } from '@cucumber/cucumber';
import ActionContext from '../support/context';
import deleteSelfEnrolledUser from '../support/management-api/deleteSelfEnrolledUser';

// TODO: REMOVE THIS
// AfterStep(async ({ result }) => {
//   if (result.status === Status.FAILED) {
//     await browser.debug();
//   }
// });

// Comment out this after hook to persist test context
// Extend the hook timeout to fight against org rate limit
After({ timeout: 3 * 60 * 10000 }, async function(this: ActionContext) {
  if (this.app) {
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
  if(this.user && this.user.profile.email !== process.env.USERNAME) {
    await this.user.deactivate();
    await this.user.delete();
  }
  if (this.credentials) {
    if (this.credentials.emailAddress !== process.env.USERNAME) {
      await deleteSelfEnrolledUser(this.config, { 
        username: this.credentials.emailAddress 
      });
    }
    await this.a18nClient.deleteProfile(this.credentials.profileId);
  }
  if (this.secondCredentials) {
    await this.a18nClient.deleteProfile(this.secondCredentials.profileId);
  }
});

After(async () => {
  await browser.deleteCookies();
  await browser.reloadSession();
});
