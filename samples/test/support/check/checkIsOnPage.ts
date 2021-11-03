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


import PasswordRecover from '../selectors/PasswordRecover';
import SelectAuthenticator from '../selectors/SelectAuthenticator';
import ChallengeAuthenticator from '../selectors/ChallengeAuthenticator';
import waitForDisplayed from '../wait/waitForDisplayed';
import PasswordReset from '../selectors/PasswordReset';
import VerifyPhone from '../selectors/VerifyPhone';
import EnrollGoogleAuthenticator from '../selectors/EnrollGoogleAuthenticator';

/**
 * Check if browser has navigated to expected page
 * @param  {String}   pageName       Expected page title
 */

/* eslint-disable complexity */
/* eslint-disable max-statements */
export default async (pageName?: string) => {
  let selector;
  let pageTitle;
  switch (pageName) {
    case 'Self Service Password Reset View': {
      selector = PasswordRecover.pageTitle;
      pageTitle = 'Recover password';
      break;
    }
    case 'Select authenticator': {
      selector = SelectAuthenticator.pageTitle;
      pageTitle = 'Select authenticator';
      break;
    }
    case 'Enter Code': {
      selector = ChallengeAuthenticator.pageTitle;
      pageTitle = 'Challenge email authenticator';
      break;
    }
    case 'Enroll Factor: Enter SMS Code': {
      selector = ChallengeAuthenticator.pageTitle;
      pageTitle = 'Enroll phone authenticator';
      break;
    }
    case 'Reset Password': {
      selector = PasswordReset.pageTitle;
      pageTitle = 'Reset password';
      break;
    }
    case 'Root Page':
    case 'Root View': {
      selector = '#claim-email_verified';
      pageTitle = 'true';
      break;
    }
    case 'Set up Password': {
      selector = PasswordReset.pageTitle;
      pageTitle = 'Set up password';
      break;
    }
    case 'Enroll email authenticator': {
      selector = ChallengeAuthenticator.pageTitle;
      pageTitle = 'Enroll email authenticator';
      break;
    }
    case 'Verify using phone authenticator': {
      selector = VerifyPhone.pageTitle;
      pageTitle = 'Verify using phone authenticator';
      break;
    }
    case 'Challenge phone authenticator': {
      selector = ChallengeAuthenticator.pageTitle;
      pageTitle = 'Challenge phone authenticator';
      break;
    }
    case 'Challenge Security Question': {
      selector = ChallengeAuthenticator.pageTitle;
      pageTitle = 'Challenge Security Question';
      break;
    }
    case 'Enroll Google Authenticator': {
      selector = EnrollGoogleAuthenticator.pageTitle;
      pageTitle = 'Enroll Google Authenticator';
      break;
    }
    case 'Challenge Google Authenticator': {
      selector = ChallengeAuthenticator.pageTitle;
      pageTitle = 'Challenge Google Authenticator';
      break;
    }
    default: {
        throw new Error(`Unknown form "${pageTitle}"`);
    }
  }

  await waitForDisplayed(selector);
  const currentPageTitle = await (await $(selector)).getText();
  expect(currentPageTitle).toEqual(pageTitle);
};
