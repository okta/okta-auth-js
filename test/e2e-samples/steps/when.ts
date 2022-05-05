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

import confirmValidPassword from '@okta/test.support/wdio/action/confirmValidPassword';
import enterValidPassword from '@okta/test.support/wdio/action/enterValidPassword';
import enterCode from '@okta/test.support/wdio/action/enterCode';
import submitForm from '@okta/test.support/wdio/action/submitForm';
import selectAuthenticator from '@okta/test.support/wdio/action/selectAuthenticator';
import inputInvalidEmail from '@okta/test.support/wdio/action/inputInvalidEmail';
import selectSmsAuthenticator from '@okta/test.support/wdio/action/selectSmsAuthenticator';
import selectVerifyBySms from '@okta/test.support/wdio/action/selectVerifyBySms';
import skipForm from '@okta/test.support/wdio/action/skipForm';
import inputInvalidEmailFormat from '@okta/test.support/wdio/action/inputInvalidEmailFormat';
import enterIncorrectPhoneNumberFormat from '@okta/test.support/wdio/action/enterIncorrectPhoneNumberFormat';
import clickFacebookButton from '@okta/test.support/wdio/action/clickFacebookButton';
import clickLoginWithFacebookInWidget from '@okta/test.support/wdio/action/clickLoginWithFacebookInWidget';
import clickLoginWithOktaOIDCIdPInWidget from '@okta/test.support/wdio/action/clickLoginWithOktaOIDCIdPInWidget';
import clickOIDCIdPButton from '@okta/test.support/wdio/action/clickOIDCIdPButton';
import loginWidget from '@okta/test.support/wdio/action/loginWidget';
import enterCorrectQuestionAnswer from '@okta/test.support/wdio/action/enterCorrectQuestionAnswer';
import getSecretFromQrCode from '@okta/test.support/wdio/action/getSecretFromQrCode';
import getSecretFromSharedSecret from '@okta/test.support/wdio/action/getSecretFromSharedSecret';
import noop from '@okta/test.support/wdio/action/noop';
import clickButton from '@okta/test.support/wdio/action/clickButton';
import clickLink from '@okta/test.support/wdio/action/clickLink';
import setInputField from '@okta/test.support/wdio/action/setInputField';
import getCodeFromSMS from '@okta/test.support/wdio/action/getCodeFromSMS';
import selectEnrollMethod from '@okta/test.support/wdio/action/selectEnrollMethod';

import EnrollPhoneAuthenticator from '@okta/test.support/wdio/selectors/EnrollPhoneAuthenticator';
import PasswordRecover from '@okta/test.support/wdio/selectors/PasswordRecover';
import Registration from '@okta/test.support/wdio/selectors/Registration';

import enterCredential from './actions/enterCredential';
import enterCorrectGoogleAuthenticatorCode from './actions/enterCorrectGoogleAuthenticatorCode';

import { ActionContext } from '../types';
import { camelize, getConfig } from '../util';

When(
  'she clicks the {string} button', 
  async (buttonName: string) => await clickButton(buttonName)
);

When('she clicks the {string} link', clickLink);

When('she clicks the Login with Okta OIDC IDP button', clickOIDCIdPButton);

When('she submits the form', submitForm);

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
    await setInputField('editPrimaryEmail', this.secondCredentials.emailAddress);
  }
);

When(
  'she fills in her phone number',
  async function(this: ActionContext) {
    await setInputField('addPhoneNumber', this.credentials.phoneNumber);
  }
);

When(
  'she inputs the correct code from her {string}',
  async function(this: ActionContext, type: string) {
    let code = '';
    if (type === 'SMS') {
      code = await getCodeFromSMS(this.a18nClient, this.credentials.profileId);
    } else if (type === 'Email') {
      code = await this.a18nClient.getEmailCode(this.credentials.profileId);
    } else if (type === 'Updated Email') {
      code = await this.a18nClient.getEmailCode(this.secondCredentials.profileId);
    }
    await enterCode(code);
  }
);

When(
  'she fills in her {string}',
  async function(this: ActionContext, fieldName: string) {
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
    let authenticatorKey;
    if (authenticator === 'Email') {
      authenticatorKey = 'okta_email';
    } else if (authenticator === 'Password') {
      authenticatorKey = 'okta_password';
    } else if (authenticator === 'Phone') {
      authenticatorKey = 'phone_number';
    } else if (authenticator === 'Google Authenticator') {
      authenticatorKey = 'google_otp';
    } else if (authenticator === 'Security Question') {
      authenticatorKey = 'security_question';
    } else {
      throw new Error(`Unknown authenticator ${authenticator}`);
    }
    await selectAuthenticator(authenticatorKey);
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
  async function(this: ActionContext) {
    await (await $(PasswordRecover.username)).setValue(this.user.profile.email);
  }
);

When(
  /^she fills out (?:her\s)?(First Name|Last Name|Email|another property|Age)$/,
  async function (this: ActionContext, fieldName: string) {
    let value, selector;
    switch (fieldName) {
      case 'First Name':
        value = this.credentials.firstName;
        selector = Registration.firstName;
        break;
      case 'Last Name':
        value = this.credentials.lastName;
        selector = Registration.lastName;
        break;
      case 'Email':
        value = this.credentials.emailAddress;
        selector = Registration.email;
        break;
      case 'Age':
        value = '99';
        selector = Registration.getCustomAttribute('age');
        break;
      case 'another property':
        value = 'random value';
        selector = Registration.getCustomAttribute('customAttribute');
        break;
      default: 
        throw new Error(`Unknown credential "${fieldName}"`);
    }
    await (await $(selector)).setValue(value);

  }

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
    const config = getConfig();
    await loginWidget({
      username: config.username,
      password: config.password
    });
  }
);

When(
  /^She inputs a valid phone number$/,
  async function (this: ActionContext) {
    await (await $(EnrollPhoneAuthenticator.phoneNumber)).setValue(this.credentials.phoneNumber);
  }
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
  async function (this: ActionContext) {
    const emailMagicLink = await this.a18nClient.getEmailMagicLink(this.credentials.profileId);
    await browser.url(emailMagicLink);
  }
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
