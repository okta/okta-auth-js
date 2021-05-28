import clickElement from './clickElement';
import UserHome from  '../selectors/UserHome';

export default async () => {
  let selector = UserHome.logoutRedirect;
  await clickElement('click', 'selector', selector);
};
