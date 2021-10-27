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
 *
 */

/* global SDK_VERSION */
import { isBrowser } from './features';
export class OktaUserAgent {
  constructor() {
    // add base sdk env
    this.environments = ["okta-auth-js/".concat("5.5.0")];
  }

  addEnvironment(env) {
    this.environments.push(env);
  }

  getHttpHeader() {
    this.maybeAddNodeEnvironment();
    return {
      'X-Okta-User-Agent-Extended': this.environments.join(' ')
    };
  }

  getVersion() {
    return "5.5.0";
  }

  maybeAddNodeEnvironment() {
    if (isBrowser() || !process || !process.versions) {
      return;
    }

    var {
      node: version
    } = process.versions;
    this.environments.push("nodejs/".concat(version));
  }

}
//# sourceMappingURL=OktaUserAgent.js.map