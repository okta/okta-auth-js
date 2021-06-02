import { Client, Group, User } from '@okta/okta-sdk-nodejs';
import { v4 as uuidv4 } from 'uuid';
import { getConfig } from '../../util';
import a18nClient, {A18nProfile} from './a18nClient';

const config = getConfig();
const oktaClient = new Client({
  orgUrl: config.issuer,
  token: config.oktaAPIKey,
});

export default async (firstName: string): Promise<[User, A18nProfile]> => {
  const a18nProfile = await a18nClient.createProfile();
  const userLogin = a18nProfile.emailAddress;
  const user = await oktaClient.createUser({
    profile: {
      firstName: firstName,
      lastName: `Mc${firstName}face`,
      email: userLogin,
      login: userLogin
    },
    credentials: {
      password : { value: uuidv4() }
    }
  }, {
    activate: true
  });

  // TODO: create test group and attach password recovery policy during test run
  const {value: testGroup} = await oktaClient.listGroups({
    q: 'E2E Test Group'
  }).next();

  if (testGroup === undefined) {
    throw new Error('Group "E2E Test Group" is not found');
  }

  await oktaClient.assignUserToApplication(config.clientId as string, {
    id: user.id
  });

  await oktaClient.addUserToGroup((testGroup as Group).id, user.id);
  return [user, a18nProfile];
};
