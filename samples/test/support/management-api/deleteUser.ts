
import { User } from '@okta/okta-sdk-nodejs';
import a18nClient, { A18nProfile } from './a18nClient';

export default async function(user: User | undefined, a18nProfile: A18nProfile | undefined): Promise<void> {
  if (user) {
    await user.deactivate();
    await user.delete();
  }
  if (a18nProfile) {
    await a18nClient.deleteProfile(a18nProfile.profileId);
  }
}
