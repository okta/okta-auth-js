import { Client} from '@okta/okta-sdk-nodejs';
import { getConfig } from '../../../util/configUtils';

const config = getConfig();
const oktaClient = new Client({
  orgUrl: config.issuer,
  token: config.oktaAPIKey,
});

export default async (): Promise<void> => {
  await oktaClient.createGroup({
    profile: {
      name: 'Test Group',
      description: 'for users created during test run'
    }
  });
};
