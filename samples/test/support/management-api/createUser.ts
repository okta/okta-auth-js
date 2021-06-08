import { Client, Group, User } from '@okta/okta-sdk-nodejs';
import { getConfig } from '../../util';
import deleteUser from './deleteUser';
import { UserCredentials } from './createCredentials';

export default async (credentials: UserCredentials, assignToGroups = ['Basic Auth Web']): Promise<User> => {
  const config = getConfig();
  const oktaClient = new Client({
    orgUrl: config.orgUrl,
    token: config.oktaAPIKey,
  });

  let user;
  try {
    user = await oktaClient.createUser({
      profile: {
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        email: credentials.emailAddress,
        login: credentials.emailAddress
      },
      credentials: {
        password : { value: credentials.password }
      }
    }, {
      activate: true
    });

    await oktaClient.assignUserToApplication(config.clientId as string, {
      id: user.id
    });

    for (const groupName of assignToGroups) {
      // TODO: create test group and attach password recovery policy during test run when API supports it
      const {value: testGroup} = await oktaClient.listGroups({
        q: groupName
      }).next();

      if (!testGroup) {
        throw new Error(`Group "${groupName}" is not found`);
      }

      await oktaClient.addUserToGroup((testGroup as Group).id, user.id);
    }

    return user;
  } catch (err) {
    if (user) {
      await deleteUser(user);
    }
    throw err;
  }
};
