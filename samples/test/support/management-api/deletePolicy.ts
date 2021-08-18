import { Client } from '@okta/okta-sdk-nodejs';
import { getConfig } from '../../util/configUtils';

export default async function (policyNamePrefix: string, policyType: string) {
  const config = getConfig();
  const oktaClient = new Client({
    orgUrl: config.orgUrl,
    token: config.oktaAPIKey
  });

  try {
    for await (let policy of oktaClient.listPolicies({type: policyType})) {
      if (policy?.name.startsWith(policyNamePrefix)) {
        await oktaClient.deletePolicy(policy.id);
      }
    }
  } catch (e) {
    console.warn('Unable to delete test case policy:', policyNamePrefix, policyType);
    throw e;
  }
}