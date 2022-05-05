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



class OktaSignInV1 {
  get signinForm() { return 'form[data-se="o-form"]';}
  get signinUsername() { return '#okta-signin-username'; }
  get signinPassword() { return '#okta-signin-password'; }
  get signinSubmitBtn() { return '#okta-signin-submit'; }
  get signinWithFacebookBtn() { return '[data-se=social-auth-facebook-button]'; }
  get signinWithGoogleBtn() { return '[data-se=social-auth-google-button]'; }
  get signinWithOktaOIDCIdPBtn() { return '[data-se=social-auth-general-idp-button]'; }
}

export default new OktaSignInV1();
