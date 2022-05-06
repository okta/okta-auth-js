import getOktaClient, { OktaClientConfig } from './util/getOktaClient';

type Options = {
  appId: string;
  groupId?: string;
  groupName?: string ;
};

export const addAppToGroup = async (
  config: OktaClientConfig, 
  { 
    appId, 
    groupId = '', 
    groupName 
  }: Options
) => {
  const oktaClient = getOktaClient(config);
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
