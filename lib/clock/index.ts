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

import { OktaAuth } from '../types';
import { getStorage } from './node';

const LOCAL_CLOCK_OFFSET_STORAGE_KEY = 'okta-local-clock-offset';

export default class SdkClock {
  private localOffset: number;
  private storage;

  constructor(sdk: OktaAuth) {
    this.storage = getStorage(sdk);
    
    // Load saved offset from storage
    // Calculated local clock offset from server time (in milliseconds). Can be positive or negative.
    const offsetFromStorage = this.storage.getItem(LOCAL_CLOCK_OFFSET_STORAGE_KEY) || '0';
    this.localOffset = parseInt(offsetFromStorage);
  }

  // Call this method when a new token is available to keep localOffset update to date
  calculateLocalOffset(iat: number) {
    this.localOffset = Date.now() - iat * 1000;
    this.storage.setItem(LOCAL_CLOCK_OFFSET_STORAGE_KEY, this.localOffset.toString());
  }

  // Return the current server based time (in seconds)
  // positive localOffset means local time is ahead of the server time
  // negative localOffset means local time is behind of the server time
  now() {
    const now = (Date.now() - this.localOffset) / 1000;
    return now;
  }
}
