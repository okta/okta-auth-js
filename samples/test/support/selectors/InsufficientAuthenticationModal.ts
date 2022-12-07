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

export class InsufficientAuthenticationModal {
  title = 'Challenge Authenticator';

  get modal() { return '#insufficientAuthentication-modal'; }
  get dialog() { return `${this.modal} div[role=dialog]`; }
  get header() { return `${this.dialog} header h1`; }

  get approachAuthorize() { return `${this.dialog} input[name=approach][value=authorize]`; }
  get approachSdk() { return `${this.dialog} input[name=approach][value=interact-sdk]`; }
  get approachWidget() { return `${this.dialog} input[name=approach][value=interact-widget]`; }

  get approaches(): { [key: string]: string } {
    return {
      'Re-Authenticate with Okta Hosted Login flow': this.approachAuthorize,
      'Re-Authenticate with Embedded SDK': this.approachSdk,
      'Re-Authenticate with Embedded Widget': this.approachWidget,
    };
  }

  get submit() { return `${this.dialog} button[name=confirm]`; }
  get cancel() { return `${this.dialog} button[name=cancel]`; }
}

export default new InsufficientAuthenticationModal();
