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
  //const userLogin = `${firstName}.mc${firstName}face+${Math.random()}@email.ghostinspector.com`;
  const a18NProfile = (await a18nClient.createProfile());
  const userLogin = a18NProfile.emailAddress;
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
  const applicationId = '0oammbvb30MDqZZq75d6';
  let testGroup;
  await oktaClient.listGroups().each(group => {
    if(group.profile.name === 'Test Group') {
      testGroup = group;
    }
  });
  if (testGroup === undefined) {
    throw new Error('Group "Test Group" is not found');
  }

  await oktaClient.assignUserToApplication(applicationId, {
    id: user.id
  });
  // TODO: create and attach password recovery policy during test run
  await oktaClient.addUserToGroup('00gtonn7cJvcwaZbp5d6', user.id);
  // await oktaClient.addUserToGroup((testGroup as Group).id, user.id);
  return [user, a18NProfile];
};
