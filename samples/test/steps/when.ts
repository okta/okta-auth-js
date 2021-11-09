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


import { When } from '@cucumber/cucumber';

// import clearInputField from '../support/action/clearInputField';
import clickElement from '../support/action/clickElement';
import confirmValidPassword from '../support/action/confirmValidPassword';
// import closeLastOpenedWindow from '../support/action/closeLastOpenedWindow';
// import deleteCookies from '../support/action/deleteCookies';
// import dragElement from '../support/action/dragElement';
// import focusLastOpenedWindow from '../support/action/focusLastOpenedWindow';
// import handleModal from '../support/action/handleModal';
// import moveTo from '../support/action/moveTo';
// import pause from '../support/action/pause';
// import pressButton from '../support/action/pressButton';
// import scroll from '../support/action/scroll';
// import selectOption from '../support/action/selectOption';
// import selectOptionByIndex from '../support/action/selectOptionByIndex';
// import setCookie from '../support/action/setCookie';
// import setInputField from '../support/action/setInputField';
// import setPromptText from '../support/action/setPromptText';

import enterCredential from '../support/action/enterCredential';
import enterValidPassword from '../support/action/enterValidPassword';
import enterCorrectCode from '../support/action/live-user/enterCorrectCode';
import enterLiveUserEmail from '../support/action/live-user/enterEmail';
import submitAnyForm from '../support/action/submitAnyForm';
import submitForm from '../support/action/submitForm';
import clickLogout from '../support/action/clickLogout';
import submitPasswordRecoverForm from '../support/action/submitPasswordRecoverForm';
import selectEmailAuthenticator from '../support/action/selectEmailAuthenticator';
import selectGoogleAuthenticator from '../support/action/selectGoogleAuthenticator';
import selectSecurityQuestionAuthenticator from '../support/action/selectSecurityQuestionAuthenticator';
import enterIncorrectCode from '../support/action/enterIncorrectCode';
import inputInvalidEmail from '../support/action/inputInvalidEmail';
import enterRegistrationField from '../support/action/live-user/enterRegistrationField';
import selectPasswordAuthenticator from '../support/action/selectPasswordAuthenticator';
import selectPhoneAuthenticator from '../support/action/selectPhoneAuthenticator';
import enterCorrectSMSCode from '../support/action/live-user/enterCorrectSMSCode';
import selectSmsAuthenticator from '../support/action/selectSmsAuthenticator';
import enterCorrectPhoneNumber from '../support/action/live-user/enterCorrectPhoneNumber';
import selectVerifyBySms from '../support/action/selectVerifyBySms';
import skipForm from '../support/action/skipForm';
import inputInvalidEmailFormat from '../support/action/inputInvalidEmailFormat';
import enterIncorrectPhoneNumberFormat from '../support/action/enterIncorrectPhoneNumberFormat';
import clickFacebookButton from '../support/action/clickFacebookButton';
import clickLoginWithFacebookInWidget from '../support/action/clickLoginWithFacebookInWidget';
import signInIntoFacebook from '../support/action/signInIntoFacebook';
import clickLoginWithOktaOIDCIdPInWidget from '../support/action/clickLoginWithOktaOIDCIdPInWidget';
import clickOIDCIdPButton from '../support/action/clickOIDCIdPButton';
import loginWidget from '../support/action/loginWidget';
import enterCorrectQuestionAnswer from '../support/action/enterCorrectQuestionAnswer';
import scanQrCode from '../support/action/scanQrCode';
import getSharedSecret from '../support/action/getSharedSecret';
import enterCorrectGoogleAuthenticatorCode from '../support/action/enterCorrectGoogleAuthenticatorCode';
import ActionContext from '../support/context';

When(
  /^User enters (username|password) into the form$/,
  enterCredential
);

When(
  /^she has inserted her (username|password)$/,
  enterCredential
);

When(
  /^she fills in her (incorrect username|correct username|username|incorrect password|password|correct password)$/,
  enterCredential
);

When(
  /^she inputs her correct Email$/,
  enterLiveUserEmail
);

When(
  /^she fills out (?:her\s)?(First Name|Last Name|Email|another property)$/,
  enterRegistrationField
);

When(
  /^she fills out her Email with an invalid email format$/,
  inputInvalidEmailFormat
);

When(
  /^she submits the registration form$/,
  submitAnyForm
);

When(
  /^her (password) is correct$/,
  enterCredential
);

When(
  /^User submits the form$/,
  submitForm
);

When(
  /^Mary clicks the logout button$/,
  clickLogout
);

When(
  /^she submits the Login form(?: with blank fields)?$/,
  submitForm
);

When(
  /^she clicks Login$/,
  submitForm
);

When(
  /^she clicks the "Login with Facebook" button in the embedded Sign In Widget$/,
  clickLoginWithFacebookInWidget
);

When(
  /^she clicks the "Login with Facebook" button$/,
  clickFacebookButton
);

When(
  /^logs in to Facebook$/,
  async function(this: ActionContext) {
    await signInIntoFacebook.call(this);
  }
);

When(
  /^she clicks the "Login with Okta OIDC IDP" button in the embedded Sign In Widget$/,
  clickLoginWithOktaOIDCIdPInWidget
);

When(
  /^she clicks the "Login with Okta OIDC IDP" button$/,
  clickOIDCIdPButton
);

When(
  /^logs in to Okta OIDC IDP$/,
  async function() {
    // Login to Okta OIDC org with standard username, password (same user exists in OIDC IdP org)
    await loginWidget();
  }
);

When(
  /^she clicks on the "Forgot Password Link"$/,
  clickElement.bind(null, 'click', 'link', '/recover-password')
);

When(
  /^she submits the recovery form$/,
  submitPasswordRecoverForm
);

When(
  /^she fills in the correct code$/,
  enterCorrectCode
);

When(
  /^she inputs the correct code from her email$/,
  enterCorrectCode
);

When(
  /^She inputs a valid phone number$/,
  enterCorrectPhoneNumber
);

When(
  /^She inputs the correct answer for the Question$/,
  enterCorrectQuestionAnswer
);

When(
  /^She selects "Receive a Code"$/,
  submitAnyForm
);

When(
  /^She selects "Verify"$/,
  submitAnyForm
);

When(
  /^She inputs the correct code from her SMS$/,
  enterCorrectSMSCode
);

When(
  /^she submits the form$/,
  submitAnyForm
);

When(
  /^submits the enrollment form$/,
  submitAnyForm
);

When(
  /^she fills a password that fits within the password policy$/,
  enterValidPassword
);

When(
  /^she confirms that password$/,
  confirmValidPassword
);
  
When(
  /^She has selected Email from the list of factors$/,
  selectEmailAuthenticator
);

When(
  /^she selects Email$/,
  selectEmailAuthenticator
);

When(
  /^She selects Security Question from the list$/,
  selectSecurityQuestionAuthenticator
);

When(
  /^She selects Phone from the list$/,
  selectPhoneAuthenticator
);

When(
  /^she chooses password factor option$/,
  selectPasswordAuthenticator
);

When(
  /^She inputs the incorrect code from the email$/,
  enterIncorrectCode
);

When (
  /^she inputs an Email that doesn't exist$/,
  inputInvalidEmail
);

When(
  /^She selects SMS from the list$/,
  selectSmsAuthenticator
);

When(
  /^She inputs the correct code from the SMS$/,
  enterCorrectSMSCode
);

When(
  /^She selects SMS from the list of methods$/,
  selectVerifyBySms
);

When(
  /^She inputs the incorrect code from the SMS$/,
  enterIncorrectCode
);

When(
  /^She inputs a invalid phone number$/,
  enterIncorrectPhoneNumberFormat
);

When(
  /^she selects "Skip" .*$/,
  skipForm
);

When(
  /^she inputs an invalid phone number$/,
  enterIncorrectPhoneNumberFormat
);

When(
  /^She selects Email from the list$/,
  selectEmailAuthenticator
);

When(
  /^She selects Google Authenticator from the list$/,
  selectGoogleAuthenticator
);

When(
  /^She inputs the correct code from the Email$/,
  enterCorrectCode
);

When(
  /^She scans a QR Code$/,
  scanQrCode
);

When(
  /^She enters the shared Secret Key into the Google Authenticator App$/,
  getSharedSecret
);

When(
  /^She selects "Next"/,
  () => ({}) // no-op
);

When(
  /^She inputs the correct code from her Google Authenticator App$/,
  enterCorrectGoogleAuthenticatorCode
);

// When(
//     /^I (click|doubleclick) on the (link|button|element) "([^"]*)?"$/,
//     clickElement
// );

// When(
//     /^I (add|set) "([^"]*)?" to the inputfield "([^"]*)?"$/,
//     setInputField
// );

// When(
//     /^I clear the inputfield "([^"]*)?"$/,
//     clearInputField
// );

// When(
//     /^I drag element "([^"]*)?" to element "([^"]*)?"$/,
//     dragElement
// );

// When(
//     /^I pause for (\d+)ms$/,
//     pause
// );

// When(
//     /^I set a cookie "([^"]*)?" with the content "([^"]*)?"$/,
//     setCookie
// );

// When(
//     /^I delete the cookie "([^"]*)?"$/,
//     deleteCookies
// );

// When(
//     /^I press "([^"]*)?"$/,
//     pressButton
// );

// When(
//     /^I (accept|dismiss) the (alertbox|confirmbox|prompt)$/,
//     handleModal
// );

// When(
//     /^I enter "([^"]*)?" into the prompt$/,
//     setPromptText
// );

// When(
//     /^I scroll to element "([^"]*)?"$/,
//     scroll
// );

// When(
//     /^I close the last opened (window|tab)$/,
//     closeLastOpenedWindow
// );

// When(
//     /^I focus the last opened (window|tab)$/,
//     focusLastOpenedWindow
// );

// When(
//     /^I select the (\d+)(st|nd|rd|th) option for element "([^"]*)?"$/,
//     selectOptionByIndex
// );

// When(
//     /^I select the option with the (name|value|text) "([^"]*)?" for element "([^"]*)?"$/,
//     selectOption
// );

// When(
//     /^I move to element "([^"]*)?"(?: with an offset of (\d+),(\d+))*$/,
//     moveTo
// );
