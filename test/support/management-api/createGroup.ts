import { randomStr } from '../util/random';
import getOktaClient, { OktaClientConfig } from './util/getOktaClient';

export const createGroup = async (config: OktaClientConfig) => {
  const oktaClient = getOktaClient(config);
  const group = await oktaClient.createGroup({
    profile: {
      name: `TestGroup-${randomStr(6)}`
    }
  });
  return group;
};
