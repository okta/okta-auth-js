import { Client } from '@okta/okta-sdk-nodejs';
import { getConfig, randomStr } from '../../util';

export default async () => {
  const config = getConfig();
  const oktaClient = new Client({
    orgUrl: config.orgUrl,
    token: config.oktaAPIKey,
  });

  const group = await oktaClient.createGroup({
    profile: {
      name: `TestGroup-${randomStr(6)}`
    }
  });
  return group;
};
