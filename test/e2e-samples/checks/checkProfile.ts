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

import UserHome from '@okta/test.support/wdio/selectors/UserHome';
import { ActionContext } from '../types';

export default async function(this: ActionContext) {
  // verify profile info
  const userName = this?.credentials?.emailAddress || this?.userName || process.env.USERNAME;
  await browser.waitUntil(async () => {
    const selectors = UserHome.email;
    for (const selector of selectors) {
      const el = await $(selector);
      const text = await el?.getText();
      if (text === userName) {
        return true;
      }
    }
    return false;
  }, {
    timeout: 5000,
    timeoutMsg: 'wait for profile'
  });
}
