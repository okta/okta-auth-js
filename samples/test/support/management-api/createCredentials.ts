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


import crypto = require('crypto');
import a18nClient, { A18nProfile } from './a18nClient';

export declare interface UserCredentials extends A18nProfile {
  firstName: string;
  lastName: string;
  password: string;
}

export default async function (
  firstName: string, lastName = '', createA18nProfile = true
): Promise<UserCredentials> {
  lastName = lastName.substring(0, 32);
  const a18nProfile = createA18nProfile ? await a18nClient.createProfile() : {
    emailAddress: 'fake_'+crypto.randomBytes(4).toString('hex')+'@acme.com',
  } as A18nProfile;
  
  return Object.assign({}, a18nProfile, {
    firstName,
    lastName: lastName || `Mc${firstName}face`,
    password: crypto.randomBytes(16).toString('base64')
  });
}
