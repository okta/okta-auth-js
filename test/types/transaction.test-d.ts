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
import { AuthnTransaction, OktaAuth, IdxStatus } from '../../build/lib/index.d';
import { expectType } from 'tsd';

const authClient = new OktaAuth({});

(async () => {
  const tx = await authClient.tx.introspect();
  expectType<AuthnTransaction>(tx);

  expectType<boolean>(await authClient.tx.exists());
  expectType<object>(await authClient.tx.status());
  expectType<string | IdxStatus>(tx.status);

  // Manage transaction
  expectType<AuthnTransaction>(await authClient.tx.resume());
  expectType<AuthnTransaction>(await tx.verify!({
    passCode: '123456',
    autoPush: true
  }));
  expectType<AuthnTransaction>(await tx.activate!({
    passCode: '123456'
  }));
  expectType<AuthnTransaction>(await tx.cancel!());
  expectType<AuthnTransaction>(await tx.poll!({
    autoPush: true
  }));
  expectType<AuthnTransaction>(await tx.prev!());
  expectType<AuthnTransaction>(await tx.skip!());
  expectType<AuthnTransaction>(await tx.changePassword!({
    oldPassword: '0ldP4ssw0rd',
    newPassword: 'N3wP4ssw0rd'
  }));
  expectType<AuthnTransaction>(await tx.resetPassword!({
    newPassword: 'N3wP4ssw0rd'
  }));
  expectType<AuthnTransaction>(await tx.unlock!({
    username: 'dade.murphy@example.com',
    factorType: 'EMAIL',
    relayState: 'd3de23'
  }));
  expectType<AuthnTransaction>(await tx.answer!({
    answer: 'My favorite recovery question answer'
  }));
  expectType<AuthnTransaction>(await tx.recovery!({
    recoveryToken: '00xdqXOE5qDZX8-PBR1bYv8AESqIFinDy3yul01tyh'
  }));
  expectType<AuthnTransaction>(await tx.resend!());

  // Questions
  const questionFactor = tx.factors!.find(function(factor) {
    return factor.provider === 'OKTA' && factor.factorType === 'question';
  })!;
  const questions = await questionFactor.questions() as Array<object>;
  expectType<Array<object>>(questions);
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
