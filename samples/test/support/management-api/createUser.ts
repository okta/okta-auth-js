import crypto = require('crypto');

import { Client, Group, User } from '@okta/okta-sdk-nodejs';
import { getConfig } from '../../util';
import {A18nProfile} from './a18nClient';
import deleteUser from './deleteUser';

export default async (firstName: string, credentials: A18nProfile, assignToGroup = 'Basic Auth Web'): Promise<User> => {
  const config = getConfig();
  const oktaClient = new Client({
    orgUrl: config.orgUrl,
    token: config.oktaAPIKey,
  });

  let user;
  try {
    const password = crypto.randomBytes(16).toString('hex');

    user = await oktaClient.createUser({
      profile: {
        firstName: firstName,
        lastName: `Mc${firstName}face`,
        email: credentials.emailAddress,
        login: credentials.emailAddress
      },
      credentials: {
        password : { value: password }
      }
    }, {
      activate: true
    });
    user.credentials.password.value = password;

    // TODO: create test group and attach password recovery policy during test run when API supports it
    const {value: testGroup} = await oktaClient.listGroups({
      q: assignToGroup
    }).next();

    if (!testGroup) {
      throw new Error(`Group "${assignToGroup}" is not found`);
    }

    await oktaClient.assignUserToApplication(config.clientId as string, {
      id: user.id
    });

    await oktaClient.addUserToGroup((testGroup as Group).id, user.id);

    return user;
  } catch (err) {
    if (user) {
      await deleteUser(user);
    }
    throw err;
  }
};
