import navigateTo from './navigateTo';
import loginDirect from './loginDirect';

export default async (
) => {
  await navigateTo('', 'Login with Username and Password');
  await loginDirect();
};
