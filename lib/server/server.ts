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
import { isSignInWithCredentialsOptions } from '../types';
import { AuthSdkError } from '../errors';
const PACKAGE_JSON = require('../../package.json');

const SDK_VERSION = PACKAGE_JSON.version;

export default class OktaAuthNode extends OktaAuthBase {
  constructor(args) {
    args = Object.assign({
      httpRequestClient: fetchRequest,
      storageUtil: serverStorage
    }, args);
    super(args);

    this.userAgent = getUserAgent(args, `okta-auth-js-server/${SDK_VERSION}`);
  }

  signIn(opts) {
    if (!isSignInWithCredentialsOptions(opts)) {
      throw new AuthSdkError('Invalid signinOptions are provided.');
    }
    return super.signIn(opts);
  }
}
