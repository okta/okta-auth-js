import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";

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
import { run } from './run';
// This method only resolves { status: IdxStatus.PENDING } if transaction has already started
export function startTransaction(_x) {
  return _startTransaction.apply(this, arguments);
}

function _startTransaction() {
  _startTransaction = _asyncToGenerator(function* (authClient) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return run(authClient, options);
  });
  return _startTransaction.apply(this, arguments);
}
//# sourceMappingURL=startTransaction.js.map