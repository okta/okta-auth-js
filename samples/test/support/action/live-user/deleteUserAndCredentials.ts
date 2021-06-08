
import a18nClient from '../../management-api/a18nClient';
import deleteSelfEnrolledUser from '../../management-api/deleteSelfEnrolledUser';
import deleteUser from '../../management-api/deleteUser';
import ActionContext from '../../context';

export default async function(this: ActionContext): Promise<void> {
  if (this.credentials) {
    if (!this.user) {
      await deleteSelfEnrolledUser(this.credentials.emailAddress);
    }
    await a18nClient.deleteProfile(this.credentials.profileId);
  }
  if (this.user) {
    await deleteUser(this.user);
  }
}
