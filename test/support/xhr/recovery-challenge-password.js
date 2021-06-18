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
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "testStateToken",
    "expiresAt": "2015-07-20T17:51:52.000Z",
    "factorType": "SMS",
    "status": "RECOVERY_CHALLENGE",
    "recoveryType": "PASSWORD",
    "_links": {
      "next": {
        "name": "verify",
        "href": "<%= uri %>/api/v1/authn/recovery/factors/SMS/verify",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      },
      "cancel": {
        "href": "<%= uri %>/api/v1/authn/cancel",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      },
      "resend": {
        "name": "sms",
        "href": "<%= uri %>/api/v1/authn/recovery/factors/SMS/resend",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      }
    }
  }
};
