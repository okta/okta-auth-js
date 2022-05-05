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

import { Page } from './Page';


class UserHome implements Page {
  get isDisplayedElementSelector() { return this.profileTable; }

  get logoutRedirect() { return '#logout-redirect'; }
  get profileTable() { return '#profile-table'; }
  get name() { return '#claim-name'; }
  get email() { return ['#claim-email', '#primary-email']; }
  get primaryEmail() { return '#primary-email'; }
  get firstName() { return 'input[name="firstName"]'; }
  get lastName() { return 'input[name="lastName"]'; }
  get logoutButton() { return '#logout-button'; }
  get profileButton() { return '#profile-button'; }
  get editButton() { return '#edit-button'; }
}

export default new UserHome();
