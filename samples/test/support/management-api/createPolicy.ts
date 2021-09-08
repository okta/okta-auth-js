import { Client } from '@okta/okta-sdk-nodejs';
import { getConfig } from '../../util/configUtils';

export default async function(policyName: string, policyType: string) {
  const config = getConfig();
  const oktaClient = new Client({
    orgUrl: config.orgUrl,
    token: config.oktaAPIKey,
  });

  let policy;
  try {
    policy = await oktaClient.createPolicy({
      type: policyType,
      status: 'ACTIVE',
      name: policyName
    });
    return policy;
  } catch (err) {
    if (policy) {
      oktaClient.deletePolicy(policy.id);
    }
    throw err;
  }
}
