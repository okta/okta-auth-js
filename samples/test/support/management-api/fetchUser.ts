import { Client, User } from '@okta/okta-sdk-nodejs';
import { getConfig } from '../../util';

export default async (username: string): Promise<User|never> => {
  const config = getConfig();
  const oktaClient = new Client({
    orgUrl: config.orgUrl,
    token: config.oktaAPIKey,
  });

  try {
    const {value: user} = await oktaClient.listUsers({
      q: username || config.username
    }).next();

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (err) {
    console.log(`Unable to fetch user ${username || config.username}: ${err}`);
    throw err;
  }
};
