import getOktaClient, { OktaClientConfig } from './util/getOktaClient';

type Options = {
  username: string;
}

export const fetchUser = async (config: OktaClientConfig, options: Options) => {
  const oktaClient = getOktaClient(config);

  const { username } = options;
  const { value: user } = await oktaClient.listUsers({
    q: username
  }).next();
  if (!user) {
    throw new Error(`Group cannot be found with ${username}`);
  }

  return user;
}
