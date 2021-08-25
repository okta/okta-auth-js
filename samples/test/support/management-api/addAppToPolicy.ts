import { Client } from '@okta/okta-sdk-nodejs';
import { getConfig } from '../../util/configUtils';


export default async function(policyId: string, appId: string) {
  const config = getConfig();
  const oktaClient = new Client({
    orgUrl: config.orgUrl,
    token: config.oktaAPIKey,
  });

  try {
    const issuer = config.issuer?.replace('/oauth2/default', '');
    let policy = await oktaClient.getPolicy(policyId);
    let mappingsUrl = `${issuer}/api/v1/policies/${policyId}/mappings?forceCreate=true`;
    await oktaClient.http.post(mappingsUrl, { body: JSON.stringify({
      resourceId: appId,
      resourceType: 'APP',
    })});
    return policy;
  } catch (err) {
    console.warn('Unable to create policy-to-app mapping.', policyId, appId);
    throw err;
  }
}
