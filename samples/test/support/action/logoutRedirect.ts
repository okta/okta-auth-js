import { UserHome, Unauth } from  '../selectors';
import waitForDisplayed from '../wait/waitForDisplayed';

export default async () => {
  const el = await waitForDisplayed(UserHome.logoutRedirect, false);
  await el.click();
  await waitForDisplayed(Unauth.body);
};
