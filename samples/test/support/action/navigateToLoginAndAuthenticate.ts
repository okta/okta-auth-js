import navigateTo from './navigateTo';
import loginDirect from './loginDirect';

export default async (
    userName: string
) => {
    await navigateTo(userName, 'Login with Username and Password');
    await loginDirect();
};