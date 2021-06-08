import navigateTo from './navigateTo';
import loginDirect from './loginDirect';
import ActionContext from '../context';

export default async function (
    this: ActionContext,
    userName: string
) {
    await navigateTo(userName, 'Login with Username and Password');
    await loginDirect({
        username: this.credentials?.emailAddress,
        password: this.credentials?.password
    });
}