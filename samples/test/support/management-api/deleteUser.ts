
import a18nClient from './a18nClient';

export default async function(): Promise<void> {
  if (this.user) {
    await this.user.deactivate();
    await this.user.delete();
  }
  if (this.a18nProfile) {
    await a18nClient.deleteProfile(this.a18nProfile.profileId);
  }
}
