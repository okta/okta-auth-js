import getOktaClient, { OktaClientConfig } from './util/getOktaClient';

type Options = {
  policyName: string; 
  policyType: string;
}

export const fetchPolicy = async (config: OktaClientConfig, options: Options) => {
  const oktaClient = getOktaClient(config);

  const { policyType, policyName } = options;
  let policy;
  for await (let p of oktaClient.listPolicies({type: policyType})) {
    if (p?.name === policyName) {
      policy = p;
      break;
    }
  }
  return policy;
}
