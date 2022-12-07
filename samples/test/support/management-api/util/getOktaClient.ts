import { Client } from '@okta/okta-sdk-nodejs';

export type OktaClientConfig = {
  issuer?: string;
  oktaAPIKey?: string;
  scopes?: string[];
  clientId?: string;
}

export default function getOktaClient(config: OktaClientConfig) {
  const { issuer, oktaAPIKey, ...rest } = config;
  if (!issuer || !oktaAPIKey) {
    throw new Error('Missing required env vars to initial OktaClient');
  }

  const orgUrl = issuer.indexOf('/oauth2') > 0 
    ? issuer.substring(0, issuer.indexOf('/oauth2')) 
    : issuer;
  const oktaClient = new Client({
    orgUrl,
    token: oktaAPIKey,
    ...rest
  });
  
  return oktaClient;
}
