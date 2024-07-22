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
import { AuthnTransaction, OktaAuth, IdxStatus } from '@okta/okta-auth-js';
import { expect } from 'tstyche';

const authClient = new OktaAuth({issuer: 'https://{yourOktaDomain}/oauth2/default'});

(async () => {
  const tx = await authClient.tx.introspect();
  expect(tx).type.toEqual<AuthnTransaction>();

  expect(await authClient.tx.exists()).type.toEqual<boolean>();
  expect(await authClient.tx.status()).type.toEqual<object>();
  expect(tx.status).type.toEqual<string | IdxStatus>();

  // Manage transaction
  expect(await authClient.tx.resume()).type.toEqual<AuthnTransaction>();
  expect(await tx.verify!({
    passCode: '123456',
    autoPush: true
  })).type.toEqual<AuthnTransaction>();
  expect(await tx.activate!({
    passCode: '123456'
  })).type.toEqual<AuthnTransaction>();
  expect(await tx.cancel!()).type.toEqual<AuthnTransaction>();
  expect(await tx.poll!({
    autoPush: true
  })).type.toEqual<AuthnTransaction>();
  expect(await tx.prev!()).type.toEqual<AuthnTransaction>();
  expect(await tx.skip!()).type.toEqual<AuthnTransaction>();
  expect(await tx.changePassword!({
    oldPassword: '0ldP4ssw0rd',
    newPassword: 'N3wP4ssw0rd'
  })).type.toEqual<AuthnTransaction>();
  expect(await tx.resetPassword!({
    newPassword: 'N3wP4ssw0rd'
  })).type.toEqual<AuthnTransaction>();
  expect(await tx.unlock!({
    username: 'dade.murphy@example.com',
    factorType: 'EMAIL',
    relayState: 'd3de23'
  })).type.toEqual<AuthnTransaction>();
  expect(await tx.answer!({
    answer: 'My favorite recovery question answer'
  })).type.toEqual<AuthnTransaction>();
  expect(await tx.recovery!({
    recoveryToken: '00xdqXOE5qDZX8-PBR1bYv8AESqIFinDy3yul01tyh'
  })).type.toEqual<AuthnTransaction>();
  expect(await tx.resend!()).type.toEqual<AuthnTransaction>();

  // Questions
  const questionFactor = tx.factors!.find(function(factor) {
    return factor.provider === 'OKTA' && factor.factorType === 'question';
  })!;
  const questions = await questionFactor.questions() as Array<object>;
  expect(questions).type.toEqual<Array<object>>();
  questionFactor.enroll({
    passCode: 'cccccceukngdfgkukfctkcvfidnetljjiknckkcjulji',
    nextPassCode: '678195',
    profile: {
      credentialId: 'dade.murphy@example.com',
      question: 'disliked_food',
      answer: 'mayonnaise',
      phoneNumber: '+1-555-415-1337',
      updatePhone: true
    }
  });
  questionFactor.verify({
    passCode: '615243',
    answer: 'mayonnaise',
    autoPush: true
  });
})();
