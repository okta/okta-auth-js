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
    "id": "000SFn2Do5LSEeE7ETg1JewvQ",
    "userId": "00uih5GNExguYaK6I0g3",
    "login": "administrator1@clouditude.net",
    "expiresAt": "2016-01-27T03:59:35.000Z",
    "status": "ACTIVE",
    "lastPasswordVerification": "2016-01-27T01:15:39.000Z",
    "lastFactorVerification": null,
    "amr": ["pwd"],
    "idp": {
      "id": "00oigpTeBgc5cgQh50g3",
      "type": "OKTA"
    },
    "mfaActive": false,
    "_links": {
      "self": {
        "href": "<%= uri %>/api/v1/sessions/000SFn2Do5LSEeE7ETg1JewvQ",
        "hints": {
          "allow": ["GET", "DELETE"]
        }
      },
      "refresh": {
        "href": "<%= uri %>/api/v1/sessions/000SFn2Do5LSEeE7ETg1JewvQ/lifecycle/refresh",
        "hints": {
          "allow": ["POST"]
        }
      },
      "user": {
        "name": "Add-Min O'Cloudy Tud",
        "href": "<%= uri %>/api/v1/users/me",
        "hints": {
          "allow": ["GET", "POST"]
        }
      }
    }
  }
};
