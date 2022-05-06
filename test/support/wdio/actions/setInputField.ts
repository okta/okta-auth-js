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

import inputs from '../selectors/maps/inputs';

export const setInputField = async (fieldName: string, value: string) => {
  let input: WebdriverIO.Element;
  await browser.waitUntil(async () => {
    const names = (inputs as any)[fieldName] || [fieldName];
    for (const name of names) {
        const selector = `input[name="${name}"]`;
        const el = await $(selector);
        const isDisplayed = await el?.isDisplayed();
        if (isDisplayed) {
            input = el;
            return true;
        }
    }

    return false;
  }, {
    timeout: 5000,
    timeoutMsg: `wait for input: ${fieldName}`
  });

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  await input!.setValue(value);
}
