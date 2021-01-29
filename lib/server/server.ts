/*!
 * Copyright (c) 2018-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
/* eslint-disable complexity */
/* eslint-disable max-statements */

import OktaAuthBase from '../OktaAuthBase';
import fetchRequest from '../fetch/fetchRequest';
import { getUserAgent } from '../builderUtil';
import serverStorage from './serverStorage';
import * as features from './features';
import { BaseTokenAPI, FeaturesAPI, OktaAuthOptions } from '../types';
import { prepareTokenParams, exchangeCodeForTokens, decodeToken } from '../token';

const PACKAGE_JSON = require('../../package.json');

const SDK_VERSION = PACKAGE_JSON.version;

class OktaAuthNode extends OktaAuthBase {
  static features: FeaturesAPI;
  features: FeaturesAPI;
  token: BaseTokenAPI;
  constructor(args: OktaAuthOptions = {}) {
    args = Object.assign({
      httpRequestClient: fetchRequest,
      storageUtil: args.storageUtil || serverStorage,
      storageManager: Object.assign({
        token: {
          storageTypes: [
            'memory'
          ]
        },
        cache: {
          storageTypes: [
            'memory'
          ]
        },
        transaction: {
          storageTypes: [
            'memory'
          ]
        }
      })
    }, args);
    super(args);

    // Add shim for compatibility. This will be removed in next major version. OKTA-362589
    Object.assign(this.options.storageUtil, {
      getHttpCache: this.storageManager.getHttpCache.bind(this.storageManager),
    });

    this.userAgent = getUserAgent(args, `okta-auth-js-server/${SDK_VERSION}`);

    this.token = {
      decode: decodeToken,
      prepareTokenParams: prepareTokenParams.bind(null, this),
      exchangeCodeForTokens: exchangeCodeForTokens.bind(null, this)
    };
  }
}

// Hoist feature detection functions to static type
OktaAuthNode.features = OktaAuthNode.prototype.features = features;

export default OktaAuthNode;