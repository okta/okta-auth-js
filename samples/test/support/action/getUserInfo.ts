import { UserHome } from  '../selectors';
import waitForDisplayed from '../wait/waitForDisplayed';
import clickElement from '../action/clickElement';

export default async () => {
  await waitForDisplayed(UserHome.profileButton, false);
  await clickElement('click', 'selector', UserHome.profileButton);
};
