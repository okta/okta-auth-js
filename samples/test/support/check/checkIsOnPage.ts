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

import waitForDisplayed from '../wait/waitForDisplayed';
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

  await waitForDisplayed(page.isDisplayedElementSelector);

  if(page.isDisplayedElementText) {
    const currentPageText = await (await $(page.isDisplayedElementSelector)).getText();
    expect(currentPageText).toEqual(page.isDisplayedElementText);
  }
};
