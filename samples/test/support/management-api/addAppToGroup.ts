import { Client } from '@okta/okta-sdk-nodejs';
import { getConfig } from '../../util/configUtils';

type Options = {
  appId: string;
  groupId?: string;
  groupName?: string ;
};

export default async function({ 
  appId, 
  groupId = '', 
  groupName 
}: Options) {
  const config = getConfig();
  const oktaClient = new Client({
    orgUrl: config.orgUrl,
    token: config.oktaAPIKey,
  });

  if (groupName) {
    const { value: group } = await oktaClient.listGroups({
      q: groupName
    }).next();
    if (!group) {
      throw new Error(`Group cannot be found with name ${groupName}`);
    }
    groupId = group.id;
  }

  await oktaClient.createApplicationGroupAssignment(appId, groupId);
}
