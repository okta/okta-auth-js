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


/* eslint-disable max-len */
import { Then } from '@cucumber/cucumber';

import checkProfile from '../support/check/checkProfile';
import checkNoProfile from '../support/check/checkNoProfile';
import checkFormMessage from '../support/check/checkFormMessage';
import checkGuest from '../support/check/checkGuest';
import checkButton from '../support/check/checkButton';
import waitForURLPath from '../support/wait/waitForURLPath';
import checkIsOnPage from '../support/check/checkIsOnPage';
import enterValidPassword from '../support/action/context-enabled/live-user/enterValidPassword';
import confirmValidPassword from '../support/action/context-enabled/live-user/confirmValidPassword';
import submitAnyForm from '../support/action/submitAnyForm';
import checkFormContainsMessage from '../support/check/checkFormContainsMessage';
import checkProfileEmail from '../support/check/checkProfileEmail';
import { UserHome } from '../support/selectors';
import checkProfileName from '../support/check/context-enabled/checkProfileName';
import ActionContext from '../support/context';
import checkIsInAuthenticatorOptions from '../support/check/checkIsInAuthenticatorOptions';
import waitForDisplayed from '../support/wait/waitForDisplayed';

Then(
  /^User can verify their profile data$/,
  checkProfile
);

Then(
  /^a page loads with all of Mary's Profile information$/,
  checkProfile
);

Then(
  /^an application session is created$/,
  checkProfile
);

Then(
  /^she should see (?:a message on the Login form|the message|a message|an error message) "(?<message>.+?)"$/,
  checkFormMessage
);

Then(
  /^the Root Page shows links to the Entry Points$/,
  checkGuest
);

Then(
  /table with the claims from the \/userinfo response$/,
  checkProfile
);

Then(
  /sees a (.*) button$/,
  checkButton
);

Then(
  /^she is redirected back to the (?:Root View|Sample App)$/,
  () => waitForURLPath(false, '/', true)
);

Then(
  /^she is redirected to the ([\s\w]+)$/,
  async function(this: ActionContext, pageName: string) {
    await checkIsOnPage(pageName, this.disableEmailVerification);
  }
);

Then(
  /^Mary sees login, registration buttons$/,
  checkGuest
);

Then(
  /^she sees that claims from \/userinfo are disappeared$/,
  checkNoProfile
);
  
Then(
  /^She sees a list of factors$/,
  () => checkIsOnPage('Select authenticator')
);

Then(
  /^she sees a list of available factors to setup$/,
  () => checkIsOnPage('Select authenticator')
);

Then(
  /^she sees a list of factors to register$/,
  () => checkIsOnPage('Select authenticator')
);

Then(
  /^she sees the list of required factors \(Google Authenticator\) to enroll$/,
  () => checkIsOnPage('Select authenticator')
);

Then(
  /^she sees the Select Authenticator page with password as the only option$/,
  () => checkIsOnPage('Select authenticator')
);

Then(
  /^she sees a page to select authenticator/,
  () => checkIsOnPage('Select authenticator')
);

Then(
  /^the sample shows an error message "(?<message>.+?)" on the Sample App$/,
  checkFormMessage
);

Then(
  /^password authenticator is not in options/,
  checkIsInAuthenticatorOptions.bind(null, 'okta_password', false)
);

Then(
  /^she sees a page to challenge her email authenticator$/,
  () => checkIsOnPage('Challenge email authenticator')
);

Then(
  /^she sees a page to input a code for email authenticator enrollment$/,
  () => checkIsOnPage('Enroll email authenticator')
);

Then(
  /^she sees a page to set her password$/,
  () => checkIsOnPage('Reset Password')
);

Then(
  /^she sees the set new password form$/,
  () => checkIsOnPage('Set up Password')
);

Then(
  /^she is presented with a list of factors$/,
  () => checkIsOnPage('Select authenticator')
);

Then(
  /^the screen changes to receive an input for a code$/,
  async function(this: ActionContext) {
    let pageName;
    if (this.featureName.includes('Google Authenticator')) {
      if (this.scenarioName.includes('Signs in')) {
        pageName = 'Challenge Google Authenticator';
      } else {
        pageName = 'Enroll Google Authenticator';
      }
    } else {
      pageName = 'Enroll Factor: Enter SMS Code';
    }
    checkIsOnPage(pageName);
  }
);

Then(
  /^she fills out her Password$/,
  enterValidPassword
);

Then(
  /^she confirms her Password$/,
  confirmValidPassword
);

Then(
  /^she submits the set new password form$/,
  submitAnyForm
);

Then(
  /^she is presented with an option to select SMS to verify$/,
  () => checkIsOnPage('Verify using phone authenticator')
);

Then(
  /^she is presented with an option to select Email to verify$/,
  () => checkIsOnPage('Select authenticator')
);

Then(
  /^she is presented with an option to select Security Question to verify$/,
  () => checkIsOnPage('Select authenticator')
);

Then(
  /^the screen changes to receive an input for a code to verify$/,
  () => checkIsOnPage('Challenge phone authenticator')
);

Then(
  /^the sample show as error message "(?<message>.+?)" on the SMS Challenge page$/,
  checkFormMessage
);

Then(
  /^she sees a field to re-enter another code$/,
  () => checkIsOnPage('Challenge phone authenticator')
);

Then(
  'she sees a table with her profile info',
  async function() {
    await waitForDisplayed(UserHome.profileTable);
  }
);

Then(
  /^the cell for the value of "email" is shown and contains her email$/,
  checkProfileEmail
);

Then(
  /^the cell for the value of "name" is shown and contains her first name and last name$/,
  checkProfileName
);

Then(
  /^she sees an error message "(?<message>.+?)"$/,
  checkFormContainsMessage
);

Then(
  /^she is presented with an option to select SMS to enroll$/,
  () => checkIsOnPage('Select authenticator')
);

Then(
  /^the screen changes to receive an input for a Email code$/,
  () => checkIsOnPage('Enter Code')
);

Then(
  /^the screen changes to challenge the Security Question$/,
  () => checkIsOnPage('Challenge Security Question')
);

Then(
  'the cell for the value of "primary email" is shown and contains her primary email',
  async function(this: ActionContext) {
    await checkProfileEmail(this, UserHome.primaryEmail);
  }
);

Then(
  'she sees an "Edit" button incidating she can update her profile',
  async function() {
    await waitForDisplayed(UserHome.editButton);
  }
);
