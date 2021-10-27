"use strict";

exports.OktaUserAgent = void 0;

var _features = require("./features");

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
class OktaUserAgent {
  constructor() {
    // add base sdk env
    this.environments = [`okta-auth-js/${"5.5.0"}`];
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
    if ((0, _features.isBrowser)() || !process || !process.versions) {
      return;
    }

    const {
      node: version
    } = process.versions;
    this.environments.push(`nodejs/${version}`);
  }

}

exports.OktaUserAgent = OktaUserAgent;
//# sourceMappingURL=OktaUserAgent.js.map