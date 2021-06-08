import activateUserSms from '../../management-api/activateUserSms';
import ActionContext from '../../context';

export default async function (this: ActionContext): Promise<void> {
  await activateUserSms(this.user, this.credentials.phoneNumber);
}
