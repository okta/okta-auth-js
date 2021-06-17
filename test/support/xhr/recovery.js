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
    "expiresAt": "2014-11-10T04:06:58.000Z",
    "status": "RECOVERY",
    "relayState": "/myapp/some/deep/link/i/want/to/return/to",
    "recoveryToken": "VBQ0gwBp5LyJJFdbmWCM",
    "_embedded": {
      "user": {
        "id": "00ub0oNGTSWTBKOLGLNR",
        "profile": {
          "login": "isaac@example.org",
          "firstName": "Isaac",
          "lastName": "Brock",
          "locale": "en_US",
          "timeZone": "America/Los_Angeles"
        }
      }
    },
    "_links": {
      "next": {
        "name": "recovery",
        "href": "<%= uri %>/api/v1/authn/recovery/token",
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
      }
    }
  }
};
