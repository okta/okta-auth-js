/*
 * Copyright (c) 2022-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { Renderer } from '../../types';
import ChallengeSecurityQuestionContext from '../ChallengeSecurityQuestionContext';
import Checkbox from '../Checkbox';
import CTAButton from '../CtaButton';
import InputField from '../InputField';
import InputPassword from '../InputPassword';

export default [
  {
    tester: ({ options: { type } }) => type === 'string',
    renderer: InputField,
  },
  {
    tester: ({ options: { name } }) => [
      'credentials.questionKey',
      'credentials.answer',
    ].includes(name),
    renderer: InputField,
  },
  {
    tester: ({
      options: { secret, name },
    }) => secret === true && name === 'credentials.passcode',
    renderer: InputPassword,
  },
  {
    tester: ({ options: { type } }) => type === 'boolean',
    renderer: Checkbox,
  },
  {
    tester: (uiElement) => uiElement.type === 'CTA',
    renderer: CTAButton,
  },
  {
    // TODO: fix type in auth-js
    // @ts-ignore
    tester: ({
      type,
      options: { contextualData, key },
    }) => type === 'CurrentAuthenticator'
      && key === 'security_question'
      && contextualData?.enrolledQuestion,
    renderer: ChallengeSecurityQuestionContext,
  },
] as Renderer[];
