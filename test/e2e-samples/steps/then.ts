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

import { ActionContext } from '../types';
import checkFormMessage from '@okta/test.support/wdio/check/checkFormMessage';
import checkButton from '@okta/test.support/wdio/check/checkButton';
import checkIsOnPage from '@okta/test.support/wdio/check/checkIsOnPage';
import checkFormContainsMessage from '@okta/test.support/wdio/check/checkFormContainsMessage';
import checkProfileAttribute from '@okta/test.support/wdio/check/checkProfileAttribute';
import checkIsInAuthenticatorOptions from '@okta/test.support/wdio/check/checkIsInAuthenticatorOptions';
import checkMessage from '@okta/test.support/wdio/check/checkMessage';
import checkEqualsText from '@okta/test.support/wdio/check/checkEqualsText';
import checkEnrollMethods from '@okta/test.support/wdio/check/checkEnrollMethods';
import checkSelectedEnrollMethod from '@okta/test.support/wdio/check/checkSelectedEnrollMethod';
import checkCustomSecurityQuestion from '@okta/test.support/wdio/check/checkCustomSecurityQuestion';
import { UserHome } from '@okta/test.support/wdio/selectors';

import waitForDisplayed from '@okta/test.support/wdio/wait/waitForDisplayed';
import getSecretFromQrCode from '@okta/test.support/wdio/action/getSecretFromQrCode';
import getSecretFromSharedSecret from '@okta/test.support/wdio/action/getSecretFromSharedSecret';
import enterCustomQuestion from '@okta/test.support/wdio/action/enterCustomQuestion';
import enterQuestionAnswer from '@okta/test.support/wdio/action/enterQuestionAnswer';

import { camelize } from '../util';

Then('she is redirected to the {string} page', checkIsOnPage);

Then(
  'the {string} field is available for input', 
  async (fieldName: string) => {
    fieldName = camelize(fieldName);
    const el = await $(`input[name=${fieldName}]`);
    const isEnabled = await el.isEnabled();
    expect(isEnabled).toEqual(true);
  }
);

Then(
  'she sees a banner message for {string} that {string}', 
  async (messageContainerName: string, expectedMessage: string) => {
    const selector = `#${camelize(messageContainerName)}-messages-container`;
    await checkMessage(selector, expectedMessage);
  }
);

Then(
  'she sees a tip message for {string} that {string}', 
  async (messageContainerName: string, expectedMessage: string) => {
    const selector = `#${camelize(messageContainerName)}-tip p`;
    await checkMessage(selector, expectedMessage);
  }
);

Then(
  'the {string} field shows {string} in disabled state', 
  async (fieldName: string, value: string) => {
    fieldName = camelize(fieldName);
    const el = await $(`input[name=${fieldName}]`);
    const isEnabled = await el.isEnabled();
    expect(isEnabled).toEqual(false);
    await checkEqualsText('element', `input[name=${fieldName}]`, false, value);
  }
);

Then(
  'she sees the {string} button', 
  async (buttonName: string) => await checkButton(buttonName)
);

Then(
  'she sees the {string} button in {string} section', 
  async (buttonName: string, sectionName: string) => {
    await checkButton(buttonName, `#${sectionName}-section`);
  }
);

Then(
  'the {string} field shows the previous profile value',
  async function(this: ActionContext, fieldName: string) {
    fieldName = camelize(fieldName);
    const expectedValue = (this.user.profile as any)[fieldName];
    await browser.waitUntil(async () => {
      const el = await $(`input[name=${fieldName}]`);
      const value = await el?.getValue();
      return value === expectedValue || +value === expectedValue;
    });
  }
);

Then(
  'she sees a modal popup to {string}',
  async (modalName: string) => {
    const modalId = `${camelize(modalName)}-modal`;
    await waitForDisplayed(`#${modalId}`);
  }
);

Then(
  'she sees a confirmation dialog to {string} with {string}',
  async (modalName: string ,expectedMessage: string) => {
    const selector = `#${camelize(modalName)}-modal`;
    await waitForDisplayed(selector);
    const text = await (await $(`${selector} h1`)).getText();
    expect(text).toEqual(expectedMessage);
  }
);

Then(
  'her {string} is updated to the new email address',
  async function(this: ActionContext, fieldName: string) {
    const selector = `#${fieldName.split(' ').join('-')}`;
    const expectedValue = this.secondCredentials.emailAddress;
    await browser.waitUntil(async () => {
      const el = await $(selector);
      const text = await el?.getText();
      return expectedValue === text;
    }, {
      timeout: 5000,
      interval: 500,
      timeoutMsg: `wait for ${fieldName} update`
    });
  }
);

Then(
  'the page confirms her phone has been added',
  async function(this: ActionContext) {
    await browser.waitUntil(async () => {
      const el = await $(`.phone-number=${this.credentials.phoneNumber}`);
      return await el.isDisplayed();
    }, { timeoutMsg: 'wait for phone number' });
  }
);

Then(
  'she sees her phone number',
  async function(this: ActionContext) {
    await browser.waitUntil(async () => {
      const el = await $(`.phone-number=${this.credentials.phoneNumber}`);
      return await el.isDisplayed();
    }, { timeoutMsg: 'wait for phone number' });
  }
);

Then(
  'the page should render without the desired phone number',
  async function(this: ActionContext) {
    await browser.waitUntil(async () => {
      const el = await $(`.phone-number=${this.credentials.phoneNumber}`);
      return !(await el.isDisplayed());
    }, { timeoutMsg: 'wait for phone number to be deleted' });
  }
);

Then(
  'the form changes to receive an input for the verification code',
  async () => {
    await browser.waitUntil(async () => {
      const el = await $('#form-title');
      const text = await el?.getText();
      return text === 'Enter Code';
    }, {
      timeoutMsg: 'wait for form title to change'
    });
  }
);

Then(
  /^she should see (?:a message on the Login form|the message|a message|an error message) "(?<message>.+?)"$/,
  checkFormMessage
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
  /^she sees the set new password form$/,
  () => checkIsOnPage('Set up Password')
);

Then(
  'she sees a radio option to {string} or {string}',
  (option1: string, option2: string) => checkEnrollMethods([option1, option2])
);

Then(
  'the option {string} is selected',
  (option: string) => checkSelectedEnrollMethod(option)
);

Then(
  'she sees the dropdown list change to an input box to "Create my own security question"',
  () => checkCustomSecurityQuestion()
);

Then(
  'she enters {string} in the question',
  (text: string) => enterCustomQuestion(text)
);

Then(
  'she enters {string} in the answer',
  (text: string) => enterQuestionAnswer(text)
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
  async function (this: ActionContext) {
    await (await $('#password')).setValue(this.credentials.password);
  }
);

Then(
  /^she confirms her Password$/,
  async function (this: ActionContext) {
    await (await $('#confirm-password')).setValue(this.credentials.password);
  }
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
  'the cell for the value of {string} is shown and contains her {string}',
  checkProfileAttribute
);

Then(
  /^she sees an error message "(?<message>.+?)"$/,
  checkFormContainsMessage
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
  'she sees a QR Code and a Secret Key on the screen',
  async () => {
    await waitForDisplayed('#authenticator-shared-secret');
    await waitForDisplayed('#authenticator-qr-code');
  }
);

Then(
  'the QR code represents the same key as the Secret Key',
  async () => {
    const secretFromQRCode = await getSecretFromQrCode();
    const secretFromSharedSecret = await getSecretFromSharedSecret();
    expect(secretFromQRCode).toEqual(secretFromSharedSecret);
  }
);
