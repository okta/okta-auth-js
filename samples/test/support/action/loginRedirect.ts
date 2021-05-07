import { Unauth } from  '../selectors';
import waitForDisplayed from '../wait/waitForDisplayed';
import loginWidget from './loginWidget';

export default async (
  options: Record<string, string> = {}
) => {
  const el = await waitForDisplayed(Unauth.loginRedirect, false);
  await el.click();
  await loginWidget(options);
};
