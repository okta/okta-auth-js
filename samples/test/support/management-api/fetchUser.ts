import { Client } from '@okta/okta-sdk-nodejs';
import { getConfig } from '../../util/configUtils';

export default async function(username: string) {
  const { 
    orgUrl, 
    oktaAPIKey,
  } = getConfig();
  const oktaClient = new Client({
    orgUrl,
    token: oktaAPIKey,
  });

  const { value: user } = await oktaClient.listUsers({
    q: username
  }).next();
  if (!user) {
    throw new Error(`Group cannot be found with ${username}`);
  }

  return user;
}
