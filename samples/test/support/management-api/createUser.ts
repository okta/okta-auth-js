/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */

/* eslint-disable complexity, max-statements */

import { User } from '@okta/okta-sdk-nodejs';
import deleteUser from './deleteUser';
import { UserCredentials } from './createCredentials';
import getOktaClient, { OktaClientConfig } from './util/getOktaClient';

type CreateUserOptions = {
  appId: string;
  credentials: UserCredentials;
  assignToGroups?: string[];
  activate?: boolean;
  customAttributes?: Record<string, string|number>;
}

export default async (config: OktaClientConfig, {
  appId,
  credentials,
  assignToGroups = [], 
  activate = true,
  customAttributes
}: CreateUserOptions): 
  Promise<User> => {
  const oktaClient = getOktaClient({ ...config, scopes: ['okta.users.manage'] });

  let user: User | null = null;

  try {
    const profile = {
      firstName: credentials.firstName,
      lastName: credentials.lastName,
      email: credentials.emailAddress,
      login: credentials.emailAddress,
    };

    user = await oktaClient.createUser({
      profile,
      ...(activate && {
        credentials: {
          password : { value: credentials.password }
        }
      })
    }, { activate });

    await oktaClient.assignUserToApplication(appId, {
      id: user.id
    });

    // update user with custom attributes after assigning to app
    Object.entries(customAttributes || {}).forEach(([key, value]) => {
      if (key === 'age') {
        value = +value;
      }
      (user?.profile as any)[key] = value;
    });
    user = await user.update();
    
    for (const groupId of assignToGroups) {
      await oktaClient.addUserToGroup(groupId, user.id);
    }

    return user;
  } catch (err) {
    if (user) {
      await deleteUser(user);
    }
    throw err;
  }
};
