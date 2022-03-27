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


import { Client } from '@okta/okta-sdk-nodejs';
import { getConfig, getTotp, TOTP_TYPES } from '../../util';

type Options = {
  userId: string;
  factorType: string;
  phoneNumber?: string;
};

const getOktaClient = () => {
  const config = getConfig();
  return new Client({
    orgUrl: config.orgUrl,
    token: config.oktaAPIKey,
  });
};

const enrollSMS = async (options: Options) => {
  const factorObject = {
    factorType: 'sms',
    provider: 'OKTA',
    profile: {
      phoneNumber: options.phoneNumber
    }
  };
  const oktaClient = getOktaClient();
  const res = await oktaClient.enrollFactor(
    options.userId, 
    factorObject,
    { activate: true }
  );
  return res;
};

const enrollGoogleAuthenticator = async (options: Options) => {
  const factorObject = {
    factorType: 'token:software:totp',
    provider: 'GOOGLE'
  };
  const client = getOktaClient();
  const enrollRes = await client.enrollFactor(options.userId, factorObject);
  const passCode = getTotp(
    (enrollRes._embedded.activation as any).sharedSecret,
    TOTP_TYPES.ENROLL
  );
  await enrollRes.activate(options.userId, {
    passCode
  });
  return enrollRes;
};

export default async function(options: Options) {
  let res;
  if (options.factorType === 'SMS') {
    res = await enrollSMS(options);
  } else if (options.factorType === 'Google Authenticator') {
    res = await enrollGoogleAuthenticator(options);
  } else {
    throw new Error(`Unknown factorType: ${options.factorType}`);
  }
  return res;
}
