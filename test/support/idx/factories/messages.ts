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
import { IdxMessage, IdxMessages } from '../../../../lib/idx/types/idx-js';

export const IdxMessagesFactory = Factory.define<IdxMessages>(() => {
  return {
    type: 'array',
    value: null
  };
});

export const IdxInfoMessageFactory = Factory.define<IdxMessage>(() => {
  return {
    class: 'INFO',
    i18n: {
      key: undefined
    },
    message: 'Default info message'
  };
});

export const IdxMessageCheckYourEmailFactory = IdxInfoMessageFactory.params({
  i18n: {
    key: 'idx.email.verification.required'
  },
  message: 'To finish signing in, check your email.'
});

