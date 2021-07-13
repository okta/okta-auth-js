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


import { Client, User } from '@okta/okta-sdk-nodejs';
import { getConfig } from '../../util';

export default async function(user: User, phoneNumber: string): Promise<boolean> {
  const config = getConfig();
  const oktaClient = new Client({
    orgUrl: config.orgUrl,
    token: config.oktaAPIKey,
  });

  const smsFactor = {
    factorType: 'sms',
    provider: 'OKTA',
    profile: {
      phoneNumber: phoneNumber
    }
  };

  const res = await oktaClient.enrollFactor(user.id, smsFactor, {
    activate: true
  });
  
  return (res.status == 'ACTIVE');
}
