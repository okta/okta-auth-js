import { Client } from '@okta/okta-sdk-nodejs';
import { getConfig } from '../../util/configUtils';


export default async function(policyId: string, appId: string) {
  const config = getConfig();
  const oktaClient = new Client({
    orgUrl: config.orgUrl,
    token: config.oktaAPIKey,
  });

  try {
    let policy = await oktaClient.getPolicy(policyId);
    let mappingsUrl = `${config.issuer}/api/v1/policies/${policyId}/mappings?forceCreate=true`;
    oktaClient.http.postJson(mappingsUrl, { body: {
      resourceId: appId,
      resourceType: 'APP',
    } as any});
    return policy;
  } catch (err) {
    console.warn('Unable to create policy-to-app mapping');
    throw err;
  }
}
