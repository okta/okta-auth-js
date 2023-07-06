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


import { ElementArray } from 'webdriverio';
import SelectAuthenticatorMethod from '../selectors/SelectAuthenticatorMethod';
import selectOption from './selectOption';

export default async (methodType: string) => {
  const $select = await $(SelectAuthenticatorMethod.options);
  const options = await $select.$$('option') as ElementArray;
  const optionsStr = (await Promise.all(options.map(async el => {
    const value = await el.getAttribute('value');
    const text = await el.getText();
    return `${value}: ${text}`;
  }))).join(', ');
  console.log(`[debug] Should select method ${methodType}. Available options: ${optionsStr}`);

  await selectOption('value', methodType, SelectAuthenticatorMethod.options);
};
