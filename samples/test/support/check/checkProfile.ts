import checkEqualsText from './checkEqualsText';
import waitForDisplayed from '../wait/waitForDisplayed';
import clickElement from '../action/clickElement';

import UserProfile from '../selectors/UserProfile';
import UserHome from '../selectors/UserHome';

export default async () => {

  // click profile button
  await waitForDisplayed(UserHome.profileButton, false);
  await clickElement('click', 'selector', UserHome.profileButton);
  
  // verify profile info
  await waitForDisplayed(UserProfile.email, false);
  await checkEqualsText('element', UserProfile.email, false, process.env.USERNAME as string);
};
