
import a18nClient from '../../management-api/a18nClient';
import deleteSelfEnrolledUser from '../../management-api/deleteSelfEnrolledUser';
import deleteUser from '../../management-api/deleteUser';

export default async function(): Promise<void> {
  if (this.a18nProfile) {
    if (!this.user) {
      await deleteSelfEnrolledUser(this.a18nProfile.emailAddress);
    }
    await a18nClient.deleteProfile(this.a18nProfile.profileId);
  }
  if (this.user) {
    await deleteUser(this.user);
  }
}
