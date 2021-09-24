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


import { Factory } from 'fishery';
import { IdxOption, IdxAuthenticator } from '../../../../lib/idx/types/idx-js';
import {
  EmailAuthenticatorFactory,
  OktaVerifyAuthenticatorFactory,
  PasswordAuthenticatorFactory,
  PhoneAuthenticatorFactory,
  GoogleAuthenticatorFactory
} from './authenticators';
import {
  IdxFormFactory,
  PhoneAuthenticatorFormFactory,
  EmailAuthenticatorFormFactory,
  PasswordAuthenticatorFormFactory,
  GoogleAuthenticatorFormFactory
} from './forms';

interface MockedIdxOption extends IdxOption {
  _authenticator?: IdxAuthenticator;
}

export const IdxOptionFactory = Factory.define<MockedIdxOption>(() => {
  return {
    label: 'unknown-option',
    value: ''
  };
});

export const AuthenticatorOptionFactory = IdxOptionFactory.afterBuild(res => {
  if (!res._authenticator) {
    throw new Error('AuthenticatorOptionFactory requires "_authenticator" passed in params');
  }
  if (res.relatesTo) {
    throw new Error('Do not set "relatesTo" on params for AuthenticatorOptionFactory');
  }

  res.label = res._authenticator.displayName;
  res.relatesTo = res._authenticator;

  if (!res.value) {
    res.value = {
      form: IdxFormFactory.build()
    };
  }
});

export const PasswordAuthenticatorOptionFactory = AuthenticatorOptionFactory.params({
  _authenticator: PasswordAuthenticatorFactory.build(),
  value: {
    form: PasswordAuthenticatorFormFactory.build()
  }
});

export const OktaVerifyAuthenticatorOptionFactory = AuthenticatorOptionFactory.params({
  _authenticator: OktaVerifyAuthenticatorFactory.build()
});


export const PhoneAuthenticatorOptionFactory = AuthenticatorOptionFactory.params({
  _authenticator: PhoneAuthenticatorFactory.build(),
  value: {
    form: PhoneAuthenticatorFormFactory.build()
  }
});

export const EmailAuthenticatorOptionFactory = AuthenticatorOptionFactory.params({
  _authenticator: EmailAuthenticatorFactory.build(),
  value: {
    form: EmailAuthenticatorFormFactory.build()
  }
});

export const GoogleAuthenticatorOptionFactory = AuthenticatorOptionFactory.params({
  _authenticator: GoogleAuthenticatorFactory.build(),
  value: {
    form: GoogleAuthenticatorFormFactory.build()
  }
});
