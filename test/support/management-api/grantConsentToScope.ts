import getOktaClient, { OktaClientConfig } from './util/getOktaClient';

type Options = {
  appId: string; 
  scopeId: string;
}

export default async function(config: OktaClientConfig, options: Options) {
  const { issuer } = config;
  const oktaClient = getOktaClient(config);

  const { appId, scopeId } = options;
  await oktaClient.grantConsentToScope(appId, {
    issuer, scopeId
  });
}
