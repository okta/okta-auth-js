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


module.exports = {
  "status": 403,
  "responseType": "json",
  "response": {
    "errorCode": "E0000080",
    "errorSummary": "The password does meet the complexity requirements of the current password policy.",
    "errorLink": "E0000080",
    "errorId": "oaeuNNAquYEQkWFnUVG86Abbw",
    "errorCauses": [{
      "errorSummary": "Passwords must have at least 8 characters, a lowercase letter, an uppercase letter, a number, no parts of your username"
    }]
  }
};
