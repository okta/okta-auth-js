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
export { IdxMessage } from './idx-js';
export { AuthenticationOptions } from '../authenticate';
export { RegistrationOptions } from '../register';
export { PasswordRecoveryOptions } from '../recoverPassword';
export { CancelOptions } from '../cancel';
export var IdxStatus;

(function (IdxStatus) {
  IdxStatus[IdxStatus["SUCCESS"] = 0] = "SUCCESS";
  IdxStatus[IdxStatus["PENDING"] = 1] = "PENDING";
  IdxStatus[IdxStatus["FAILURE"] = 2] = "FAILURE";
  IdxStatus[IdxStatus["TERMINAL"] = 3] = "TERMINAL";
  IdxStatus[IdxStatus["CANCELED"] = 4] = "CANCELED";
})(IdxStatus || (IdxStatus = {}));

export var IdxFeature;

(function (IdxFeature) {
  IdxFeature[IdxFeature["PASSWORD_RECOVERY"] = 0] = "PASSWORD_RECOVERY";
  IdxFeature[IdxFeature["REGISTRATION"] = 1] = "REGISTRATION";
  IdxFeature[IdxFeature["SOCIAL_IDP"] = 2] = "SOCIAL_IDP";
})(IdxFeature || (IdxFeature = {}));
//# sourceMappingURL=index.js.map