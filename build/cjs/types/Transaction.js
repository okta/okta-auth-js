"use strict";

exports.isOAuthTransactionMeta = isOAuthTransactionMeta;
exports.isPKCETransactionMeta = isPKCETransactionMeta;
exports.isIdxTransactionMeta = isIdxTransactionMeta;
exports.isCustomAuthTransactionMeta = isCustomAuthTransactionMeta;
exports.isTransactionMeta = isTransactionMeta;

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
// formerly known as "Redirect OAuth Params"
function isObjectWithProperties(obj) {
  if (!obj || typeof obj !== 'object' || Object.values(obj).length === 0) {
    return false;
  }

  return true;
}

function isOAuthTransactionMeta(obj) {
  if (!isObjectWithProperties(obj)) {
    return false;
  }

  return !!obj.redirectUri || !!obj.responseType;
}

function isPKCETransactionMeta(obj) {
  if (!isOAuthTransactionMeta(obj)) {
    return false;
  }

  return !!obj.codeVerifier;
}

function isIdxTransactionMeta(obj) {
  if (!isPKCETransactionMeta(obj)) {
    return false;
  }

  return !!obj.interactionHandle;
}

function isCustomAuthTransactionMeta(obj) {
  if (!isObjectWithProperties(obj)) {
    return false;
  }

  const isAllStringValues = Object.values(obj).find(value => typeof value !== 'string') === undefined;
  return isAllStringValues;
}

function isTransactionMeta(obj) {
  if (isOAuthTransactionMeta(obj) || isCustomAuthTransactionMeta(obj)) {
    return true;
  }

  return false;
}
//# sourceMappingURL=Transaction.js.map