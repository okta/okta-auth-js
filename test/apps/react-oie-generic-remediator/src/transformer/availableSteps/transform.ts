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

import { IdxActionParams, IdxTransaction } from '@okta/okta-auth-js';
import { UISchemaLayout, UISchemaElement } from '../../types';

// TODO: add type IdxActionFunction in auth-js
type IdxActionFunction = (params?: IdxActionParams) => Promise<IdxTransaction>;

type ActionFunction = IdxActionFunction | VoidFunction;

export const transformAvailableSteps = (
  transaction: IdxTransaction,
) => (
  uischema: UISchemaLayout
) => {
  const { availableSteps = [], nextStep } = transaction;

  return availableSteps
    .filter(({ name }) => name !== nextStep?.name)
    .reduce((acc, step) => {
      let action: ActionFunction = step.action as IdxActionFunction;
      if (!action) {
        switch (step.name) {
          case 'redirect-idp':
            action = (): void => {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              window.location.replace(step.href!);
            };
            break;
          default:
            throw new Error(`Unable to handle action for step: ${step.name}`);
        }
      }

      acc.elements.push({
        type: 'CTA', // TODO: figure out a better type name
        options: {
          name: `${step.name}.cta`,
          type: 'button',
          text: step.name, // TODO: i18n
          action,
        },
      } as UISchemaElement);

      return acc;
    }, uischema);
};
