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



import a18nClient from '../../management-api/a18nClient';
import deleteSelfEnrolledUser from '../../management-api/deleteSelfEnrolledUser';
import deleteUser from '../../management-api/deleteUser';
import ActionContext, {reuseContext} from '../../context';

export default async function(this: ActionContext): Promise<void> {
  if (this.featureName.includes('Google Authenticator') && this.scenarioName.includes('by entering a Secret Key')) {
    // save for reuse
    reuseContext(this);
  } else {
    if (this.credentials) {
      if (!this.user) {
        await deleteSelfEnrolledUser(this.credentials.emailAddress);
      }
      await a18nClient.deleteProfile(this.credentials.profileId);
    }
    if (this.user) {
      await deleteUser(this.user);
    }
  }
}
