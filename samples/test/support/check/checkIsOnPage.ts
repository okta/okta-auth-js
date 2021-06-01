import PasswordRecover from '../selectors/PasswordRecover';
import waitForDisplayed from '../wait/waitForDisplayed';

/**
 * Check if browser has navigated to expected page
 * @param  {String}   pageName       Expected page title
 */
export default async (pageName: string) => {

  let selector;
  let pageTitle;
  switch (pageName) {
    case 'Self Service Password Reset View': {
      selector = PasswordRecover.pageTitle;
      pageTitle = 'Recover password';
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
