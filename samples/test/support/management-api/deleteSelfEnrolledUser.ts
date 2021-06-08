import { Client} from '@okta/okta-sdk-nodejs';
import { getConfig } from '../../util';
import deleteUser from './deleteUser';

export default async (username: string): Promise<void> => {
  const config = getConfig();
  const oktaClient = new Client({
    orgUrl: config.orgUrl,
    token: config.oktaAPIKey,
  });

  try {
    const {value: user} = await oktaClient.listUsers({
      q: username
    }).next();

    if (user) {
      await deleteUser(user);
    }

  } catch (err) {
    console.log(`An error occured during self-enrolled user cleanup: ${err}`);
  }
};
