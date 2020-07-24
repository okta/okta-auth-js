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

export default class SdkClock {
  localOffset: number;

  constructor(localOffset) {
    // Calculated local clock offset from server time (in milliseconds). Can be positive or negative.
    this.localOffset = parseInt(localOffset || 0);
  }

  // factory method. Create an instance of a clock from current context.
  static create(/* sdk, options */): SdkClock {
    // TODO: calculate localOffset
    var localOffset = 0;
    return new SdkClock(localOffset);
  }

  // Return the current time (in seconds)
  now() {
    var now = (Date.now() + this.localOffset) / 1000;
    return now;
  }
}
