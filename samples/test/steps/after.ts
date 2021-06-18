import { After } from '@cucumber/cucumber';
import ActionContext from '../support/context';
import deleteUserAndCredentials from '../support/action/live-user/deleteUserAndCredentials';

After(deleteUserAndCredentials);

After(() => browser.deleteCookies());

After(async function (this: ActionContext) {
  switch (this.featureName) {
    case 'Direct Auth Social Login with 1 Social IDP': 
    case 'Direct Auth with Self Hosted Sign In Widget Social Login with 1 Social IDP': {
      const url = 'https://facebook.com';
      await browser.url(url);
      await browser.deleteCookies();
      break;
    }
    default: {
      break;
    }
  }
});

