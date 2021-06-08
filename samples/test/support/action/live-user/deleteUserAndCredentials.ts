
import a18nClient from '../../management-api/a18nClient';
import deleteSelfEnrolledUser from '../../management-api/deleteSelfEnrolledUser';
import deleteUser from '../../management-api/deleteUser';

export default async function(): Promise<void> {
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
