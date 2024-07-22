/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
 *
 */

import { 
  OktaAuth,
  getEmails, 
  getEmail,
  addEmail,
  deleteEmail,
  sendEmailChallenge,
  getEmailChallenge,
  verifyEmailChallenge,
  BaseTransaction,
  EmailTransaction, 
  EmailChallengeTransaction,
  getPhones,
  getPhone,
  addPhone,
  deletePhone,
  sendPhoneChallenge,
  verifyPhoneChallenge,
  PhoneTransaction,
  getProfile,
  updateProfile,
  getProfileSchema,
  ProfileTransaction,
  ProfileSchemaTransaction,
} from '@okta/okta-auth-js';
import { expect } from 'tstyche';

const authClient = new OktaAuth({issuer: 'https://{yourOktaDomain}/oauth2/default'});

(async () => {
  // Email API
  expect(getEmails(authClient, {})).type.toEqual<Promise<EmailTransaction[]>>();
  expect(getEmail(authClient, {})).type.toEqual<Promise<EmailTransaction>>();
  expect(addEmail(authClient, {})).type.toEqual<Promise<EmailTransaction>>();
  expect(deleteEmail(authClient, {})).type.toEqual<Promise<BaseTransaction>>();
  expect(sendEmailChallenge(authClient, {})).type.toEqual<Promise<EmailChallengeTransaction>>();
  expect(getEmailChallenge(authClient, {})).type.toEqual<Promise<EmailChallengeTransaction>>();
  expect(verifyEmailChallenge(authClient, {})).type.toEqual<Promise<BaseTransaction>>();

  // Phone API
  expect(getPhones(authClient, {})).type.toEqual<Promise<PhoneTransaction[]>>();
  expect(getPhone(authClient, {})).type.toEqual<Promise<PhoneTransaction>>();
  expect(addPhone(authClient, {})).type.toEqual<Promise<PhoneTransaction>>();
  expect(deletePhone(authClient, {})).type.toEqual<Promise<BaseTransaction>>();
  expect(sendPhoneChallenge(authClient, {})).type.toEqual<Promise<BaseTransaction>>();
  expect(verifyPhoneChallenge(authClient, {})).type.toEqual<Promise<BaseTransaction>>();

  // Profile API
  expect(getProfile(authClient, {})).type.toEqual<Promise<ProfileTransaction>>();
  expect(updateProfile(authClient, {})).type.toEqual<Promise<ProfileTransaction>>();
  expect(getProfileSchema(authClient, {})).type.toEqual<Promise<ProfileSchemaTransaction>>();
})();
