import getOktaClient, { OktaClientConfig } from './util/getOktaClient';

type Options = {
  policyId: string; 
  appId: string;
}

export default async function(config: OktaClientConfig, options: Options) {
  const oktaClient = getOktaClient(config);
  const { appId, policyId } = options;
  try {
    let policy = await oktaClient.getPolicy(policyId);
    let assignAppToPolicyUrl = `${oktaClient.baseUrl}/api/v1/apps/${appId}/policies/${policyId}`;
    await oktaClient.http.put(assignAppToPolicyUrl);
    return policy;
  } catch (err) {
    console.warn('Unable to create policy-to-app mapping.', policyId, appId);
    // TODO: REMOVE THIS
    console.log(err);
    throw err;
  }
}
