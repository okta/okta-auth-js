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

import { IdxTransaction } from '@okta/okta-auth-js';

import AppSvg from './Icon_T1_100x100_Apps.svg';
import BrowserSvg from './Icon_T1_100x100_Device-Desktop.svg';

export const emailChallengeConsentLayout = (transaction: IdxTransaction) => {
  const { nextStep } = transaction;

  // @ts-ignore OKTA-489560 (missing requestInfo prop)
  const appName = nextStep.requestInfo?.find((info) => info?.name === 'appName');
  // @ts-ignore OKTA-489560 (missing requestInfo prop)
  const browser = nextStep.requestInfo?.find((info) => info?.name === 'browser');

  return {
    type: 'VerticalLayout',
    elements: [
      {
        type: 'Title',
        options: {
          content: 'oie.consent.enduser.title',
        },
      },
      ...(appName && [
        {
          type: 'Control',
          scope: `#/properties/${appName.name}`,
          options: {
            format: 'ImageWithText',
            SVGIcon: AppSvg,
            textContent: appName.value,
          },
        },
      ]),
      ...(browser && [
        {
          type: 'Control',
          scope: `#/properties/${browser.name}`,
          options: {
            format: 'ImageWithText',
            SVGIcon: BrowserSvg,
            textContent: browser.value,
          },
        },
      ]),
      'email-challenge-consent.consent',
      'email-challenge-consent.submit',
    ],
  };
};
