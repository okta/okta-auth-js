import { Client } from '@okta/okta-sdk-nodejs';
import { getConfig } from '../../util/configUtils';

export default async function(groupName: string) {
  const config = getConfig();
  const oktaClient = new Client({
    orgUrl: config.orgUrl,
    token: config.oktaAPIKey,
  });

  const { value: group } = await oktaClient.listGroups({
    q: groupName
  }).next();
  if (!group) {
    throw new Error(`Group cannot be found with ${groupName}`);
  }

  return group;
}
