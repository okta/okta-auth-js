import getOktaClient, { OktaClientConfig } from './util/getOktaClient';

type Options = {
  groupName: string;
}

export default async function(config: OktaClientConfig, options: Options) {
  const oktaClient = getOktaClient(config);

  const { groupName } = options;
  const { value: group } = await oktaClient.listGroups({
    q: groupName
  }).next();
  if (!group) {
    throw new Error(`Group cannot be found with ${groupName}`);
  }

  return group;
}
