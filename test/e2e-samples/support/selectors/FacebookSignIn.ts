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


class FacebookSignIn {
  get signinForm() { return '#login_form';}
  get username() { return '#login_form #email'; }
  get password() { return '#login_form #pass'; }
  get submit() { return '#login_form #loginbutton'; }
  get continue() { return '#platformDialogForm button[type="submit"][name="__CONFIRM__"]'; }
}

export default new FacebookSignIn();
