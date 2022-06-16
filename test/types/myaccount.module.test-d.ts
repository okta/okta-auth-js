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
import { OktaAuth } from '@okta/okta-auth-js';
import { 
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
} from '@okta/okta-auth-js/myaccount';
import { expectType } from 'tsd';

const authClient = new OktaAuth({});

(async () => {
  // Email API
  expectType<Promise<EmailTransaction[]>>(getEmails(authClient, {}));
  expectType<Promise<EmailTransaction>>(getEmail(authClient, {}));
  expectType<Promise<EmailTransaction>>(addEmail(authClient, {}));
  expectType<Promise<BaseTransaction>>(deleteEmail(authClient, {}));
  expectType<Promise<EmailChallengeTransaction>>(sendEmailChallenge(authClient, {}));
  expectType<Promise<EmailChallengeTransaction>>(getEmailChallenge(authClient, {}));
  expectType<Promise<BaseTransaction>>(verifyEmailChallenge(authClient, {}));

  // Phone API
  expectType<Promise<PhoneTransaction[]>>(getPhones(authClient, {}));
  expectType<Promise<PhoneTransaction>>(getPhone(authClient, {}));
  expectType<Promise<PhoneTransaction>>(addPhone(authClient, {}));
  expectType<Promise<BaseTransaction>>(deletePhone(authClient, {}));
  expectType<Promise<BaseTransaction>>(sendPhoneChallenge(authClient, {}));
  expectType<Promise<BaseTransaction>>(verifyPhoneChallenge(authClient, {}));

  // Profile API
  expectType<Promise<ProfileTransaction>>(getProfile(authClient, {}));
  expectType<Promise<ProfileTransaction>>(updateProfile(authClient, {}));
  expectType<Promise<ProfileSchemaTransaction>>(getProfileSchema(authClient, {}));
})();
