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



var url = new URL(window.location.href);

// Load config from the URL and update the form
var config = {};

{{#if oidc}}
['clientId', 'clientSecret'].forEach(updateForm);
{{/if}}

['issuer', 'username'].forEach(updateForm);

// Update UI
['error', 'status', 'sessionToken', 'error'].forEach(updateUI);


function updateForm(key) {
  var value = url.searchParams.get(key);
  config[key] = value;
  document.getElementById(key).value = value;
}

function updateUI(key) {
  var value = url.searchParams.get(key);
  document.getElementById(key).innerText = value;
}
