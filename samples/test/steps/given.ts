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


import { Given } from '@cucumber/cucumber';

// import checkContainsAnyText from '../support/check/checkContainsAnyText';
// import checkIsEmpty from '../support/check/checkIsEmpty';
// import checkContainsText from '../support/check/checkContainsText';
// import checkCookieContent from '../support/check/checkCookieContent';
// import checkCookieExists from '../support/check/checkCookieExists';
// import checkElementExists from '../support/check/checkElementExists';
// import checkEqualsText from '../support/check/checkEqualsText';
// import checkModal from '../support/check/checkModal';
// import checkOffset from '../support/check/checkOffset';
// import checkProperty from '../support/check/checkProperty';
// import checkSelected from '../support/check/checkSelected';
// import checkTitle from '../support/check/checkTitle';
// import checkUrl from '../support/check/checkURL';
// import closeAllButFirstTab from '../support/action/closeAllButFirstTab';
// import compareText from '../support/check/compareText';
// import isEnabled from '../support/check/isEnabled';
// import isDisplayed from '../support/check/isDisplayed';
// import openWebsite from '../support/action/openWebsite';
// import setWindowSize from '../support/action/setWindowSize';


import setEnvironment from '../support/action/setEnvironment';
import navigateTo from '../support/action/navigateTo';
import navigateToLoginAndAuthenticate from '../support/action/navigateToLoginAndAuthenticate';
import createContextUserAndCredentials from '../support/action/live-user/createContextUserAndCredentials';
import createContextCredentials from '../support/action/live-user/createContextCredentials';
import activateContextUserSms from '../support/action/live-user/activateContextUserSms';
import ActionContext from '../support/context';
import attachSSRPolicy from '../support/action/org-config/attachProfileEnrollmentPolicyWithCustomProfileAttribute';


Given(
  /^^a Profile Enrollment policy defined .* (?=by .* and a random property *.).*/,
  attachSSRPolicy
);

Given(
  // eslint-disable-next-line max-len
  /^^a Profile Enrollment policy defined assigning new users to the Everyone Group and (?!by .* and a random property *.).*/,
  () => ({}) // no-op - self-enrollment is preconfigured for the org
);

Given(
  /^an APP$/,
  async function() {
    return await setEnvironment('default');
  }
);

Given(
  /^an APP Sign On Policy (.*)$/,
  setEnvironment
);

Given(
  /^an org with (.*)$/,
  setEnvironment
);

Given(
  /^a SPA, WEB APP or MOBILE Policy (.*)$/,
  setEnvironment
);

Given(
  /^configured Authenticators are (.*)$/,
  setEnvironment
);

Given(
  /^the Application Sign on Policy is set to "(.*)"$/,
  setEnvironment
);

Given(
  /([^/s]+) has an account in the org/,
  async function(this: ActionContext, firstName: string) {
    // eslint-disable-next-line max-len
    await createContextUserAndCredentials.call(this, firstName, ['MFA Required', 'Google Authenticator Enrollment Required']);
  }
);

Given(
  /^a User named "([^/w]+)" exists, and this user has already setup email and password factors$/,
  async function(this: ActionContext, firstName: string) {
    await createContextUserAndCredentials.call(this, firstName);
  }
);

Given(
  /^a user named "([^/w]+)"$/,
  createContextCredentials
);

Given(
  /^([^/s]+) is a user with a verified email and a set password$/,
  async function(this: ActionContext, firstName: string) {
    await createContextUserAndCredentials.call(this, firstName);
  }
);

Given(
  /^([^/s]+) navigates to (.*)$/,
  navigateTo
);

Given(
  /^([^/s]+) has an authenticated session$/,
  navigateToLoginAndAuthenticate
);

Given(
  /^a User named "([^/s]+)" created in the admin interface with a Password only$/,
  async function(this: ActionContext, firstName: string) {
    await createContextUserAndCredentials.call(this, firstName, ['MFA Required']);
  }
);

Given(
  /^an Authenticator Enrollment Policy that has PHONE as optional and EMAIL as required for the Everyone Group$/,
  () => ({}) // no-op
);

Given(
  /^a User named "([^/s]+)" created that HAS NOT yet enrolled in the SMS factor$/,
  async function(this: ActionContext, firstName: string) {
    await createContextUserAndCredentials.call(this, firstName, ['Phone Enrollment Required', 'MFA Required']);
  }
);

Given(
  /^Mary has enrolled in the SMS factor$/,
  activateContextUserSms
);

Given(
  /^she is not enrolled in any authenticators$/,
  () => ({}) // no-op
);


// Given(
//     /^I open the (url|site) "([^"]*)?"$/,
//     openWebsite
// );

// Given(
//     /^the element "([^"]*)?" is( not)* displayed$/,
//     isDisplayed
// );

// Given(
//     /^the element "([^"]*)?" is( not)* enabled$/,
//     isEnabled
// );

// Given(
//     /^the element "([^"]*)?" is( not)* selected$/,
//     checkSelected
// );

// Given(
//     /^the checkbox "([^"]*)?" is( not)* checked$/,
//     checkSelected
// );

// Given(
//     /^there is (an|no) element "([^"]*)?" on the page$/,
//     checkElementExists
// );

// Given(
//     /^the title is( not)* "([^"]*)?"$/,
//     checkTitle
// );

// Given(
//     /^the element "([^"]*)?" contains( not)* the same text as element "([^"]*)?"$/,
//     compareText
// );

// Given(
//     /^the (button|element) "([^"]*)?"( not)* matches the text "([^"]*)?"$/,
//     checkEqualsText
// );

// Given(
//     /^the (button|element|container) "([^"]*)?"( not)* contains the text "([^"]*)?"$/,
//     checkContainsText
// );

// Given(
//     /^the (button|element) "([^"]*)?"( not)* contains any text$/,
//     checkContainsAnyText
// );

// Given(
//     /^the (button|element) "([^"]*)?" is( not)* empty$/,
//     checkIsEmpty
// );

// Given(
//     /^the page url is( not)* "([^"]*)?"$/,
//     checkUrl
// );

// Given(
//     /^the( css)* attribute "([^"]*)?" from element "([^"]*)?" is( not)* "([^"]*)?"$/,
//     checkProperty
// );

// Given(
//     /^the cookie "([^"]*)?" contains( not)* the value "([^"]*)?"$/,
//     checkCookieContent
// );

// Given(
//     /^the cookie "([^"]*)?" does( not)* exist$/,
//     checkCookieExists
// );

// Given(
//     /^the element "([^"]*)?" is( not)* positioned at ([\d]+)px on the (x|y) axis$/,
//     checkOffset
// );

// Given(
//     /^I have a screen that is ([\d]+) by ([\d]+) pixels$/,
//     setWindowSize
// );

// Given(
//     /^I have closed all but the first (window|tab)$/,
//     closeAllButFirstTab
// );

// Given(
//     /^a (alertbox|confirmbox|prompt) is( not)* opened$/,
//     checkModal
// );
