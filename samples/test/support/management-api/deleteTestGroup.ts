
import a18nClient from './a18nClient';

export default async function(): Promise<void> {
  await this.user.deactivate();
  await this.user.delete();
  await a18nClient.deleteProfile(this.a18nProfile.profileId);
}
