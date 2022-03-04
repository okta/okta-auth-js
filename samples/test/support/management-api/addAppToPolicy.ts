import { Client } from '@okta/okta-sdk-nodejs';
import { getConfig } from '../../util/configUtils';


export default async function(policyId: string, appId: string) {
  const config = getConfig();
  const oktaClient = new Client({
    orgUrl: config.orgUrl,
    token: config.oktaAPIKey,
  });

  try {
    const orgUrl = config.issuer?.replace('/oauth2/default', '');
    let policy = await oktaClient.getPolicy(policyId);
    let assignAppToPolicyUrl = `${orgUrl}/api/v1/apps/${appId}/policies/${policyId}`;
    await oktaClient.http.put(assignAppToPolicyUrl);
    return policy;
  } catch (err) {
    console.warn('Unable to create policy-to-app mapping.', policyId, appId);
    throw err;
  }
}
