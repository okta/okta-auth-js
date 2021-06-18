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
    "subject": "acct:john.joe@example.com",
    "links":
    [
      {
        "rel" : "okta:idp",
        "href" : "https://org.okta.com/sso/saml2/0oad5lTSBOMUBOBVVQSC",
        "titles": {
          "und" : "Acme Partner IdP"
        },
        "properties": {
          "okta:logo" : "https://ok3static.oktacdn.com/bc/image/fileStoreRecord?id=fs0w8swww6KGUZZWGSHS",
          "okta:idp:metadata": "http://org.okta.com/api/v1/idps/0oamy8gz2llVopxdr0g3/metadata.xml",
          "okta:idp:id": "0oamy8gz2llVopxdr0g3",
          "okta:idp:type": "SAML2"
        }
      }
    ]
  }
};
