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
    for await (let p of oktaClient.listPolicies({type: policyType})) {
      if (p?.name === policyName) {
        policy = p;
        break;
      }
    }
    return policy;
  } catch (err) {
    console.warn('Unable to retrieve policy:', policyName);
    throw err;
  }
}
