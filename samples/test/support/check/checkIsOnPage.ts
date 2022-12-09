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

import { pages } from '../selectors';


/**
 * Check if browser has navigated to expected page
 * @param  {String}   pageName       Expected page title
 */
export default async (pageName?: string) => {
  const page = pageName && pages[pageName];

  if (!page) {
    throw new Error(`Unknown form "${pageName}"`);
  }

  await browser.waitUntil(async () => {
    const el = await $(page.isDisplayedElementSelector);
    if (Array.isArray(page.isDisplayedElementText)) {
      for (const expectedText of page.isDisplayedElementText) {
        const text = await el?.getText();
        if (text === expectedText) {
          return true;
        }
      }
      return false;
    } else if (page.isDisplayedElementText) {
      const text = await el?.getText();
      return text === page.isDisplayedElementText;
    } else {
      return !!el && await el.isDisplayed();
    }
  }, { 
    timeout: 10000,
    timeoutMsg: `wait for page ${pageName} to load`
  });
};
