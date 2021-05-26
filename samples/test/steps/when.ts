import { When } from '@cucumber/cucumber';

import checkIsEmpty from '../support/check/checkIsEmpty';
// import clearInputField from '../support/action/clearInputField';
// import clickElement from '../support/action/clickElement';
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
import submitForm from '../support/action/submitForm';
import waitForDisplayed from '../support/wait/waitForDisplayed';
import checkContainsText from '../support/check/checkContainsText';

When(
  /^([^\s]+) sees the message "User is not assigned to this application"$/,
  async (_) => {
    await waitForDisplayed('#messages-container');
    await checkContainsText(
      'element', '#messages-container', ' not', 'You do not have permission to perform the requested action.');
  }
);

When(
  /^should see the login form again with blank fields$/,
  async () => {
    await waitForDisplayed('#username');
    await checkIsEmpty('element', '#username', ' not');
    await checkIsEmpty('element', '#password', ' not');
  }
);


When(
  /^User enters (username|password) into the form$/,
  enterCredential
);

When(
  /^she fills in her (username|correct password)$/,
  enterCredential
);

When(
  /^User submits the form$/,
  submitForm
);

When(
  /^she submits the Login form$/,
  submitForm
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
