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

/* eslint-disable max-depth, @typescript-eslint/no-non-null-assertion */

import { camelize } from '@okta/test.support/util';
import buttons from '../selectors/maps/buttons';

const getSelector = (tagCandidate: string, name: string, containerSelector?: string) => {
  if (containerSelector) {
    return `${containerSelector} ${tagCandidate}[name=${name}]`;
  } else {
    return `${tagCandidate}[name=${name}]`; 
  }
};

export default async(buttonName: string, containerSelector?: string): Promise<WebdriverIO.Element> => {
  let button: WebdriverIO.Element;
  buttonName = camelize(buttonName);
  await browser.waitUntil(async () => {
    const names = (buttons as any)[buttonName];
    for (const tagCandidate of ['button', 'input', 'a']) {
      if (names) {
        for (const name of names) {
          const selector = getSelector(tagCandidate, name, containerSelector);
          const el = await $(selector);
          const isDisplayed = await el?.isDisplayed();
          if (isDisplayed) {
            button = el;
            return true;
          }
        }
      } else {
        const selector = getSelector(tagCandidate, buttonName, containerSelector);
        const el = await $(selector);
        const isDisplayed = await el?.isDisplayed();
        if (isDisplayed) {
          button = el;
          return true;
        }
      }
    }
    return false;
  }, {
    timeout: 5000,
    timeoutMsg: `wait for button: ${buttonName}`
  });
  return button!;
};
