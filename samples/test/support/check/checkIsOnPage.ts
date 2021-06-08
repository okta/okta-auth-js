import PasswordRecover from '../selectors/PasswordRecover';
import SelectAuthenticator from '../selectors/SelectAuthenticator';
import ChallengeAuthenticator from '../selectors/ChallengeAuthenticator';
import waitForDisplayed from '../wait/waitForDisplayed';
import PasswordReset from '../selectors/PasswordReset';

/**
 * Check if browser has navigated to expected page
 * @param  {String}   pageName       Expected page title
 */
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
    case 'Reset Password': {
      selector = PasswordReset.pageTitle;
      pageTitle = 'Reset password';
      break;
    }
    case 'Root Page': {
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
    default: {
        throw new Error(`Unknown form "${pageTitle}"`);
    }
  }

  await waitForDisplayed(selector);
  const currentPageTitle = await (await $(selector)).getText();
  expect(currentPageTitle).toEqual(pageTitle);
};
