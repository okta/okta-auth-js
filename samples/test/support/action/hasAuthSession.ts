import navigateTo from './navigateTo';
import loginDirect from './loginDirect';
import checkTokenExists from '../check/checkTokenExists';


export default async (
) => {
  await navigateTo('', 'Login with Username and Password');
  await loginDirect();
  await checkTokenExists('idToken', false);
};
