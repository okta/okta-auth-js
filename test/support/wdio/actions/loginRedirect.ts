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


import { Unauth } from  '../selectors';
import waitForDisplayed from '../wait/waitForDisplayed';
import loginWidget from './loginWidget';

export const loginRedirect = async (
  options: Record<string, string> = {}
) => {
  const el = await waitForDisplayed(Unauth.loginRedirect, false);
  await el.click();
  await loginWidget(options);
};
