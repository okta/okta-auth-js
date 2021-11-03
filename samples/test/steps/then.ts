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
import selectEmailAuthenticator from '../support/action/selectEmailAuthenticator';
import checkIsOnPage from '../support/check/checkIsOnPage';
import enterValidPassword from '../support/action/live-user/enterValidPassword';
import confirmValidPassword from '../support/action/live-user/confirmValidPassword';
import submitAnyForm from '../support/action/submitAnyForm';
import checkFormContainsMessage from '../support/check/checkFormContainsMessage';
import checkProfileEmail from '../support/check/checkProfileEmail';
import { UserHome } from '../support/selectors';
import isDisplayed from '../support/check/isDisplayed';
import checkProfileName from '../support/check/checkProfileName';
import ActionContext from '../support/context';

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
  checkIsOnPage
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
  checkIsOnPage.bind(null, 'Select authenticator')
);

Then(
  /^she sees a list of available factors to setup$/,
  checkIsOnPage.bind(null, 'Select authenticator')
);

Then(
  /^she sees a list of factors to register$/,
  checkIsOnPage.bind(null, 'Select authenticator')
);

Then(
  /^she sees the list of required factors \(Google Authenticator\) to enroll$/,
  checkIsOnPage.bind(null, 'Select authenticator')
);

Then(
  /^she sees the Select Authenticator page with password as the only option$/,
  checkIsOnPage.bind(null, 'Select authenticator')
);

Then(
  /^the sample shows an error message "(?<message>.+?)" on the Sample App$/,
  checkFormMessage
);

// TODO: add explicit spec step instead for password reset scenario
Then(
  /^she sees a page to input her code$/,
  selectEmailAuthenticator
);

Then(
  /^she sees a page to input a code for email authenticator enrollment$/,
  checkIsOnPage.bind(null, 'Enroll email authenticator')
);

Then(
  /^she sees a page to set her password$/,
  checkIsOnPage.bind(null, 'Reset Password')
);

Then(
  /^she sees the set new password form$/,
  checkIsOnPage.bind(null, 'Set up Password')
);

Then(
  /^she is presented with a list of factors$/,
  checkIsOnPage.bind(null, 'Select authenticator')
);

Then(
  /^the screen changes to receive an input for a code$/,
  async function(this: ActionContext) {
    let pageName;
    if (this.featureName.includes('Google Authenticator')) {
      if (this.scenarioName.includes('enroll')) {
        pageName = 'Enroll Google Authenticator';
      } else {
        pageName = 'Challenge Google Authenticator';
      }
    } else {
      pageName = 'Enroll Factor: Enter SMS Code';
    }
    checkIsOnPage.bind(null, pageName);
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
  checkIsOnPage.bind(null, 'Verify using phone authenticator')
);

Then(
  /^she is presented with an option to select Email to verify$/,
  checkIsOnPage.bind(null, 'Select authenticator')
);

Then(
  /^she is presented with an option to select Security Question to verify$/,
  checkIsOnPage.bind(null, 'Select authenticator')
);

Then(
  /^the screen changes to receive an input for a code to verify$/,
  checkIsOnPage.bind(null, 'Challenge phone authenticator')
);

Then(
  /^the sample show as error message "(?<message>.+?)" on the SMS Challenge page$/,
  checkFormMessage
);

Then(
  /^she sees a field to re-enter another code$/,
  checkIsOnPage.bind(null, 'Challenge phone authenticator')
);

Then(
  /^she sees a table with her profile info$/,
  async function() {
    await isDisplayed(UserHome.profileTable, false);
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
  checkIsOnPage.bind(null, 'Select authenticator')
);

Then(
  /^the screen changes to receive an input for a Email code$/,
  checkIsOnPage.bind(null, 'Enter Code')
);

Then(
  /^the screen changes to challenge the Security Question$/,
  checkIsOnPage.bind(null, 'Challenge Security Question')
);

// import checkClass from '../support/check/checkClass';
// import checkContainsAnyText from '../support/check/checkContainsAnyText';
// import checkIsEmpty from '../support/check/checkIsEmpty';
// import checkContainsText from '../support/check/checkContainsText';
// import checkCookieContent from '../support/check/checkCookieContent';
// import checkCookieExists from '../support/check/checkCookieExists';
// import checkEqualsText from '../support/check/checkEqualsText';
// import checkFocus from '../support/check/checkFocus';
// import checkInURLPath from '../support/check/checkInURLPath';
// import checkIsOpenedInNewWindow from
//     '../support/check/checkIsOpenedInNewWindow';
// import checkModal from '../support/check/checkModal';
// import checkModalText from '../support/check/checkModalText';
// import checkNewWindow from '../support/check/checkNewWindow';
// import checkOffset from '../support/check/checkOffset';
// import checkProperty from '../support/check/checkProperty';
// import checkFontProperty from '../support/check/checkFontProperty';
// import checkSelected from '../support/check/checkSelected';
// import checkTitle from '../support/check/checkTitle';
// import checkTitleContains from '../support/check/checkTitleContains';
// import checkURL from '../support/check/checkURL';
// import checkURLPath from '../support/check/checkURLPath';
// import checkWithinViewport from '../support/check/checkWithinViewport';
// import compareText from '../support/check/compareText';
// import isEnabled from '../support/check/isEnabled';
// import isExisting from '../support/check/isExisting';
// import isVisible from '../support/check/isDisplayed';
// import waitFor from '../support/action/waitFor';
// import waitForVisible from '../support/action/waitForDisplayed';
// import checkIfElementExists from '../support/lib/checkIfElementExists';

// Then(
//     /^I expect that the title is( not)* "([^"]*)?"$/,
//     checkTitle
// );

// Then(
//     /^I expect that the title( not)* contains "([^"]*)?"$/,
//     checkTitleContains
// );

// Then(
//     /^I expect that element "([^"]*)?" does( not)* appear exactly "([^"]*)?" times$/,
//     checkIfElementExists
// );

// Then(
//     /^I expect that element "([^"]*)?" is( not)* displayed$/,
//     isVisible
// );

// Then(
//     /^I expect that element "([^"]*)?" becomes( not)* displayed$/,
//     waitForVisible
// );

// Then(
//     /^I expect that element "([^"]*)?" is( not)* within the viewport$/,
//     checkWithinViewport
// );

// Then(
//     /^I expect that element "([^"]*)?" does( not)* exist$/,
//     isExisting
// );

// Then(
//     /^I expect that element "([^"]*)?"( not)* contains the same text as element "([^"]*)?"$/,
//     compareText
// );

// Then(
//     /^I expect that (button|element) "([^"]*)?"( not)* matches the text "([^"]*)?"$/,
//     checkEqualsText
// );

// Then(
//     /^I expect that (button|element|container) "([^"]*)?"( not)* contains the text "([^"]*)?"$/,
//     checkContainsText
// );

// Then(
//     /^I expect that (button|element) "([^"]*)?"( not)* contains any text$/,
//     checkContainsAnyText
// );

// Then(
//     /^I expect that (button|element) "([^"]*)?" is( not)* empty$/,
//     checkIsEmpty
// );

// Then(
//     /^I expect that the url is( not)* "([^"]*)?"$/,
//     checkURL
// );

// Then(
//     /^I expect that the path is( not)* "([^"]*)?"$/,
//     checkURLPath
// );

// Then(
//     /^I expect the url to( not)* contain "([^"]*)?"$/,
//     checkInURLPath
// );

// Then(
//     /^I expect that the( css)* attribute "([^"]*)?" from element "([^"]*)?" is( not)* "([^"]*)?"$/,
//     checkProperty
// );

// Then(
//     /^I expect that the font( css)* attribute "([^"]*)?" from element "([^"]*)?" is( not)* "([^"]*)?"$/,
//     checkFontProperty
// );

// Then(
//     /^I expect that checkbox "([^"]*)?" is( not)* checked$/,
//     checkSelected
// );

// Then(
//     /^I expect that element "([^"]*)?" is( not)* selected$/,
//     checkSelected
// );

// Then(
//     /^I expect that element "([^"]*)?" is( not)* enabled$/,
//     isEnabled
// );

// Then(
//     /^I expect that cookie "([^"]*)?"( not)* contains "([^"]*)?"$/,
//     checkCookieContent
// );

// Then(
//     /^I expect that cookie "([^"]*)?"( not)* exists$/,
//     checkCookieExists
// );

// Then(
//     /^I expect that element "([^"]*)?" is( not)* positioned at ([\d+.?\d*]+)px on the (x|y) axis$/,
//     checkOffset
// );

// Then(
//     /^I expect that element "([^"]*)?" (has|does not have) the class "([^"]*)?"$/,
//     checkClass
// );

// Then(
//     /^I expect a new (window|tab) has( not)* been opened$/,
//     checkNewWindow
// );

// Then(
//     /^I expect the url "([^"]*)?" is opened in a new (tab|window)$/,
//     checkIsOpenedInNewWindow
// );

// Then(
//     /^I expect that element "([^"]*)?" is( not)* focused$/,
//     checkFocus
// );

// Then(
//     /^I wait on element "([^"]*)?"(?: for (\d+)ms)*(?: to( not)* (be checked|be enabled|be selected|be displayed|contain a text|contain a value|exist))*$/,
//     {
//         wrapperOptions: {
//             retry: 3,
//         },
//     },
//     waitFor
// );

// Then(
//     /^I expect that a (alertbox|confirmbox|prompt) is( not)* opened$/,
//     checkModal
// );

// Then(
//     /^I expect that a (alertbox|confirmbox|prompt)( not)* contains the text "([^"]*)?"$/,
//     checkModalText
// );
