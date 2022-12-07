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

import { Selectors } from './types';
import { Page } from './Page';

const username = 'input[name="username"]';
const password = 'input[name="password"]';
const submit = 'button[type="submit"]';

export class IdentifyForm implements Page, Selectors {
  get isDisplayedElementSelector() { return this.password; }

  get username() { return username; }
  get password() { return password; }
  get submit() { return submit; }
}

export default new IdentifyForm();
