import { Client } from '@okta/okta-sdk-nodejs';
import { getConfig } from '../../util/configUtils';

export default async function(appPrefix: string) {
  const { 
    orgUrl, 
    oktaAPIKey, 
    sampleConfig: { appType } 
  } = getConfig();
  const oktaClient = new Client({
    orgUrl,
    token: oktaAPIKey,
  });

  const appName = `${appPrefix}-${appType}`;
  const { value: group } = await oktaClient.listGroups({
    q: appName
  }).next();
  if (!group) {
    throw new Error(`Group cannot be found with ${appName}`);
  }

  return group;
}
