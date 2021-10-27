"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.EnrollAuthenticator = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _VerifyAuthenticator = require("./Base/VerifyAuthenticator");

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
class EnrollAuthenticator extends _VerifyAuthenticator.VerifyAuthenticator {}

exports.EnrollAuthenticator = EnrollAuthenticator;
(0, _defineProperty2.default)(EnrollAuthenticator, "remediationName", 'enroll-authenticator');
//# sourceMappingURL=EnrollAuthenticator.js.map