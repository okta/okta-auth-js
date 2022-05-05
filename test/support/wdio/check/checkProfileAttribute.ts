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

/* eslint-disable @typescript-eslint/no-unused-vars, complexity */

import checkEqualsText from './checkEqualsText';
import ActionContext from '../context';
import { camelize } from '../../util';
import { UserHome } from '../selectors';

export default async function(this: ActionContext, attribute: string, _: string) {
  const key = camelize(attribute);
  let expectedValue;
  if (key === 'email' || key === 'primaryEmail') {
    expectedValue = (this?.credentials?.emailAddress || process.env.USERNAME) as string; 
  } else if (key === 'name') {
    expectedValue = `${this.credentials?.firstName} ${this.credentials?.lastName}`;
  } else if ((this.credentials as any)[key]) {
    expectedValue = (this.credentials as any)[key];
  } else {
    throw new Error('Failed to find attribute in credentials');
  }

  let selector;
  const selectorFromPageObject = (UserHome as any)[key];
  if (Array.isArray(selectorFromPageObject)) {
    const selectorCandidates = (UserHome as any)[key];
    for (const selectorCandidate of selectorCandidates) {
      const el = await $(selectorCandidate);
      try {
        await el.waitForDisplayed({ timeout: 3000 });
        selector = selectorCandidate;
        break;
      } catch { /* do nothing */ }
    }
  } else if (typeof selectorFromPageObject === 'string') {
    selector = selectorFromPageObject;
  }
  
  if (!selector) {
    throw new Error(`Selector not found for ${attribute}`);
  }
  
  await checkEqualsText('element', selector, false, expectedValue);
}
