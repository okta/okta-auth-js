import { randomStr } from '@okta/test.support/util/random';
import getOktaClient, { OktaClientConfig } from './util/getOktaClient';

export default async (config: OktaClientConfig) => {
  const oktaClient = getOktaClient(config);
  const group = await oktaClient.createGroup({
    profile: {
      name: `TestGroup-${randomStr(6)}`
    }
  });
  return group;
};
