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

import confirmValidPassword from '../support/action/confirmValidPassword';
import enterCredential from '../support/action/context-enabled/enterCredential';
import enterValidPassword from '../support/action/enterValidPassword';
import enterCode from '../support/action/enterCode';
import enterLiveUserEmail from '../support/action/context-enabled/live-user/enterEmail';
import enterRecoveryEmail from '../support/action/context-enabled/live-user/enterRecoveyEmail';
import submitForm from '../support/action/submitForm';
import selectAuthenticator from '../support/action/selectAuthenticator';
import selectAuthenticatorMethod from '../support/action/selectAuthenticatorMethod';
import selectEnrollmentChannel from '../support/action/selectEnrollmentChannel';
import inputInvalidEmail from '../support/action/inputInvalidEmail';
import enterRegistrationField from '../support/action/context-enabled/live-user/enterRegistrationField';
import selectSmsAuthenticator from '../support/action/selectSmsAuthenticator';
import selectSecurityQuestionAuthenticator from '../support/action/selectSecurityQuestionAuthenticator';
import enterCorrectPhoneNumber from '../support/action/context-enabled/live-user/enterCorrectPhoneNumber';
import enterCorrectPhoneNumberForOktaVerify from 
  '../support/action/context-enabled/live-user/enterCorrectPhoneNumberForOktaVerify';
import enterCorrectEmailForOktaVerify from '../support/action/context-enabled/live-user/enterCorrectEmailForOktaVerify';
import selectVerifyBySms from '../support/action/selectVerifyBySms';
import skipForm from '../support/action/skipForm';
import inputInvalidEmailFormat from '../support/action/inputInvalidEmailFormat';
import enterIncorrectPhoneNumberFormat from '../support/action/enterIncorrectPhoneNumberFormat';
import clickFacebookButton from '../support/action/clickFacebookButton';
import clickLoginWithFacebookInWidget from '../support/action/clickLoginWithFacebookInWidget';
import clickLoginWithOktaOIDCIdPInWidget from '../support/action/clickLoginWithOktaOIDCIdPInWidget';
import clickOIDCIdPButton from '../support/action/clickOIDCIdPButton';
import loginWidget from '../support/action/loginWidget';
import enterCorrectQuestionAnswer from '../support/action/enterCorrectQuestionAnswer';
import getSecretFromQrCode from '../support/action/getSecretFromQrCode';
import getSecretFromSharedSecret from '../support/action/getSecretFromSharedSecret';
import enterCorrectGoogleAuthenticatorCode from '../support/action/context-enabled/enterCorrectGoogleAuthenticatorCode';
import openEmailMagicLink from '../support/action/context-enabled/live-user/openEmailMagicLink';
import openEmailMagicLinkForUnlock from '../support/action/context-enabled/live-user/openEmailMagicLinkForUnlock';
import openEmailMagicLinkForEmailVerification 
  from '../support/action/context-enabled/live-user/openEmailMagicLinkForEmailVerification';
import ActionContext from '../support/context';
import noop from '../support/action/noop';
import clickButton from '../support/action/clickButton';
import clickLink from '../support/action/clickLink';
import setInputField from '../support/action/setInputField';
import { camelize } from '../util';
import getCodeFromSMS from '../support/action/getCodeFromSMS';
import selectEnrollMethod from '../support/action/selectEnrollMethod';
import selectOption from '../support/action/selectOption';
import selectApproach from '../support/action/selectApproach';
import authenticators from '../support/selectors/maps/authenticators';
import selectAuthenticatorAuthenticate from '../support/action/selectAuthenticatorAuthenticate';
import { getTotp } from '../util';

When(
  'she clicks the {string} button', 
  async (buttonName: string) => await clickButton(buttonName)
);

When('she clicks the {string} link', clickLink);

When('she clicks the Login with Okta OIDC IDP button', clickOIDCIdPButton);

When('she submits the form', submitForm);

When('she selects "Enroll with another method"', submitForm);

When('she selects "Continue"', submitForm);

When(
  'she changes the {string} field to {string}', 
  async (fieldName: string, value: string) => {
    fieldName = camelize(fieldName);
    await setInputField(fieldName, value);
  }
);

When(
  'she changes her email to a different valid email address',
  async function(this: ActionContext) {
    await setInputField('primaryEmail', this.secondCredentials.emailAddress);
  }
);

When(
  'she inputs the correct code from her {string}',
  {
    timeout: 30000,
  },
  async function(this: ActionContext, type: string) {
    let code = '';
    if (type === 'SMS') {
      code = await getCodeFromSMS(this.a18nClient, this.credentials.profileId);
    } else if (type === 'Email') {
      code = await this.a18nClient.getEmailCode(this.credentials.profileId);
    } else if (type === 'Updated Email') {
      code = await this.a18nClient.getEmailCode(this.secondCredentials.profileId);
    } else if (type === 'Google Authenticator App') {
      code = getTotp(this.sharedSecret);
    }
    await enterCode(code);
  }
);

When(
  'she fills in her {string}',
  async function(this: ActionContext, fieldName: string) {
    fieldName = camelize(fieldName);
    const value = (this.credentials as any)[fieldName];
    await setInputField(fieldName, value);
  }
);

When(
  'she fills in an incorrect {string}',
  async function(this: ActionContext, fieldName: string) {
    await setInputField(fieldName, '!incorrect!');
  }
);

When(
  'she fills in an incorrect {string} with value {string}',
  async function(this: ActionContext, fieldName: string, value: string) {
    await setInputField(fieldName, value);
  }
);

When(
  'she selects the radio option to {string}',
  (option: string) => selectEnrollMethod(option)
);

When(
  'she inputs the correct code from her Google Authenticator App for {string}',
  enterCorrectGoogleAuthenticatorCode
);

When(
  'she inputs an incorrect code',
  async () => await enterCode('000000')
);

When(
  'she clicks the {string} button in {string} section',
  async (buttonName: string, sectionName: string) => {
    await clickButton(buttonName, `#${sectionName}-section`);
  }
);

When(
  'she selects the {string} factor',
  async (authenticator: string) => {
    let authenticatorKey = authenticators[authenticator];
    if (!authenticatorKey) {
      throw new Error(`Unknown authenticator ${authenticator}`);
    }
    await selectAuthenticator(authenticatorKey);
  }
);

When(
  'she selects the {string} method',
  async (methodType: string) => {
    await selectAuthenticatorMethod(methodType);
  }
);

When(
  'she selects the {string} enrollment method',
  async (enrollmentMethod: string) => {
    let enrollmentMethodKey;
    if (enrollmentMethod === 'QRCode') {
      enrollmentMethodKey = 'qrcode';
    } else if (enrollmentMethod === 'Email') {
      enrollmentMethodKey = 'email';
    } else if (enrollmentMethod === 'SMS') {
      enrollmentMethodKey = 'sms';
    } else {
      throw new Error(`Unknown authenticator ${enrollmentMethod}`);
    }
    await selectEnrollmentChannel(enrollmentMethodKey);
  }
);

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
  /^she fills out (?:her\s)?(First Name|Last Name|Email|another property|Age)$/,
  enterRegistrationField
);

When(
  /^she fills out her Email with an invalid email format$/,
  inputInvalidEmailFormat
);

When(
  /^her (password) is correct$/,
  enterCredential
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
  /^she clicks the "Login with Okta OIDC IDP" button in the embedded Sign In Widget$/,
  clickLoginWithOktaOIDCIdPInWidget
);

When(
  /^logs in to Okta OIDC IDP$/,
  async function() {
    // Login to Okta OIDC org with standard username, password (same user exists in OIDC IdP org)
    await loginWidget();
  }
);

When(
  /^She inputs a valid phone number$/,
  enterCorrectPhoneNumber
);

When(
  /^she inputs a valid phone number for Okta Verify$/,
  enterCorrectPhoneNumberForOktaVerify
);

When(
  /^she inputs a valid email for Okta Verify$/,
  enterCorrectEmailForOktaVerify
);

When(
  /^She inputs the correct answer for the Question$/,
  enterCorrectQuestionAnswer
);

When(
  /^she fills a password that fits within the password policy$/,
  enterValidPassword
);

When(
  /^she confirms that password$/,
  confirmValidPassword
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
  /^She selects SMS from the list of methods$/,
  selectVerifyBySms
);

When(
  'she selects {string} from the list of methods',
  async (methodType: string) => {
    await selectOption('value', methodType, '#authenticator-method-options');
  }
);

When(
  /^She inputs a invalid phone number$/,
  enterIncorrectPhoneNumberFormat
);

When(
  /^she selects "Skip".*$/,
  skipForm
);

When(
  /^she inputs an invalid phone number$/,
  enterIncorrectPhoneNumberFormat
);

When(
  /^she clicks the Email magic link$/,
  openEmailMagicLink
);

When(
  /^she clicks the Email magic link for unlock$/,
  openEmailMagicLinkForUnlock
);

When(
  /^she clicks the Email magic link for email verification$/,
  openEmailMagicLinkForEmailVerification
);

When(
  'She scans a QR Code',
  async function(this: ActionContext) {
    this.sharedSecret = await getSecretFromQrCode();
  }
);

When(
  'She enters the shared Secret Key into the Google Authenticator App',
  async function(this: ActionContext) {
    this.sharedSecret = await getSecretFromSharedSecret();
  }
);

When(
  /^She selects "Next"/,
  noop
);

When(
  /^She selects Security Question from the list$/,
  selectSecurityQuestionAuthenticator
);

When(
  /^she inputs her recovery email$/,
  enterRecoveryEmail
);

When(
  'she selects approach {string}',
  selectApproach
);

When(
  'she selects authenticator {string}',
  async (authenticator: string) => {
    let authenticatorKey = authenticators[authenticator];
    if (!authenticatorKey) {
      throw new Error(`Unknown authenticator ${authenticator}`);
    }
    await selectAuthenticatorAuthenticate(authenticatorKey);
  }
);

When(
  /^she enrolls into webauthn$/,
  async function(this: ActionContext) {
    await browser.addVirtualAuthenticator('ctap2', 'internal', true, true, true, true);
  }
);
