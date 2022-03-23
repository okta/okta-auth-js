import { Client } from '@okta/okta-sdk-nodejs';
import { getConfig } from '../../util';

export default async function(appId: string, scopeId: string) {
  const { issuer, orgUrl, oktaAPIKey } = getConfig();
  const oktaClient = new Client({
    orgUrl,
    token: oktaAPIKey,
  });

  await oktaClient.grantConsentToScope(appId, {
    issuer, scopeId
  });
}
