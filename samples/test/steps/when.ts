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
import enterIncorrectCode from '../support/action/enterIncorrectCode';
import inputInvalidEmail from '../support/action/inputInvalidEmail';
import enterRegistrationField from '../support/action/live-user/enterRegistrationField';
import selectPasswordAuthenticator from '../support/action/selectPasswordAuthenticator';

When(
  /^User enters (username|password) into the form$/,
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
  /^she fills out her (First Name|Last Name|Email)$/,
  enterRegistrationField
);

When(
  /^she submits the registration form$/,
  submitAnyForm
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
  /^she submits the form$/,
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
  /^she chooses password factor option$/,
  selectPasswordAuthenticator
);

When(
  /^She selects Phone from the list$/,
  selectEmailAuthenticator
);

When(
  /^She inputs the incorrect code from the email$/,
  enterIncorrectCode
);

When (
  /^she inputs an Email that doesn't exist$/,
  inputInvalidEmail
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
