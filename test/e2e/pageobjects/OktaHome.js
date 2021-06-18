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


/* eslint-disable max-len */
class OktaLogin {
  get userMenu() { return $('[data-se="user-menu"] > a.link-button');}
  get signOutBtn() { return $('[data-se="user-menu"] a[data-se="logout-link"]'); }
  get popUpCloseButton() { return $('a[data-role="close-button"]'); }
  get widgetFormTitle() { return $('.okta-form-title.o-form-head'); }

  async signOut() {
    await browser.waitUntil(async () => this.userMenu.then(el => el.isDisplayed()), 5000, 'wait for user menu');
    await this.userMenu.then(el => el.click());
    await browser.waitUntil(async () => this.signOutBtn.then(el => el.isDisplayed()), 5000, 'wait for signout btn');
    await this.signOutBtn.then(el => el.click());
    await browser.waitUntil(async () => this.widgetFormTitle.then(el => el.isDisplayed()), 5000, 'wait for widget');
  }

  async waitForLoad() {
    await browser.waitUntil(async () => this.userMenu.then(el => el.isDisplayed()), 5000, 'wait for user menu');
  }

  async closeInitialPopUp() {
    // If this is newly created org, there is a "help" window that pops up. We need to close that.
    await this.popUpCloseButton.then(el => { if(el.isExisting()) {
        el.click();
      } else {
        // Do nothing
      }
    });
  }
}

export default new OktaLogin();
