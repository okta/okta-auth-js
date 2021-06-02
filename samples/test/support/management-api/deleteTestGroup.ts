import { Client} from '@okta/okta-sdk-nodejs';
import { getConfig } from '../../util/configUtils';
import a18nClient from './a18nClient';

const config = getConfig();
const oktaClient = new Client({
  orgUrl: config.issuer,
  token: config.oktaAPIKey,
});

export default async function(): Promise<void> {
  await oktaClient.listGroups().each(async group => {
    if(group.profile.name === 'Test Group') {
      await group.listUsers().each(async user => {
        await user.deactivate();
        await user.delete();
      });
      await oktaClient.deleteGroup(group.id);
    }
  });
  await a18nClient.deleteProfile(this.a18nProfile.profileId);
}
