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

function delay(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  });
}

/* eslint-disable max-len */
class OktaLogin {
  get signinForm() { return $('form[data-se="o-form"]');}
  get signinUsername() { return $('#okta-signin-username'); }
  get signinPassword() { return $('#okta-signin-password'); }
  get signinSubmitBtn() { return $('#okta-signin-submit'); }

  get OIEsigninForm() { return $('form[data-se="o-form"]');}
  get OIEsigninUsername() { return  $('[name="identifier"]'); }
  get OIEsigninPassword() { return $('[name="credentials.passcode"]'); }
  get OIEsigninSubmitBtn() { return $('[data-type="save"]'); }
  get facebookLoginBtn() { return $('[data-se="social-auth-facebook-button"]');}
  get facebookEmail() { return $('#email');}
  get facebookPassword() { return $('#pass');}
  get facebookSubmitBtn() { return $('#loginbutton');}

  get signinFormTitle() { return $('.okta-form-title.o-form-head'); }
  get verifyWithEmailCodeButton() { return $('form[data-se="o-form"] button.enter-auth-code-instead-link'); }
  get receiveCodeViaSmsButton() { return $('form[data-se="o-form"] input[type=submit]'); }
  get code() {
    if (process.env.ORG_OIE_ENABLED) {
      return this.OIEsigninPassword;
    } else { 
      return this.signinPassword;
    }
  }
  get verifyBtn() { return $('form[data-se="o-form"] input[type=submit][value=Verify]'); }
  get authenticatorsList() { return $('form[data-se="o-form"] .authenticator-list'); }
  get authenticatorEmail() { return $('form[data-se="o-form"] .authenticator-list [data-se="okta_email"] .select-factor'); }
  get authenticatorSms() { return $('form[data-se="o-form"] .authenticator-list [data-se="phone_number"] .select-factor'); }
  get authenticatorSecurityQuestion() { return $('form[data-se="o-form"] .authenticator-list [data-se="security_question"] .select-factor'); }
  get securityQuestionAnswer() { return $('form[data-se="o-form"] input[name="credentials.answer"]'); }

  async signin(username, password) {
    await this.waitForLoad();

    if (process.env.ORG_OIE_ENABLED) {
      this.signinOIE(username, password);
    } else { 
      this.signinLegacy(username, password);
    }
  }

  async signinOIE(username, password) {
    await this.OIEsigninUsername.then(el => el.setValue(username));
    await this.OIEsigninPassword.then(el => el.setValue(password));
    await this.OIEsigninSubmitBtn.then(el => el.click());
  }

  async signinLegacy(username, password) {
    await this.signinUsername.then(el => el.setValue(username));
    await this.signinPassword.then(el => el.setValue(password));
    await this.signinSubmitBtn.then(el => el.click());
  }

  async submit() {
    const btn = process.env.ORG_OIE_ENABLED ? this.OIEsigninSubmitBtn : this.signinSubmitBtn;
    (await btn).click();
  }

  async clickSendVerificationCode() {
    await this.submit();
  }

  getFactorVerificationTitle(factor) {
    switch (factor) {
      case 'email':
        return 'Get a verification email';
      case 'sms':
        return 'Verify with your phone';
      default:
        return undefined;
    }
  }

  async selectAuthenticator(factor) {
    switch (factor) {
      case 'email':
        return await this.selectEmailAuthenticator();
      case 'sms':
        return await this.selectSmsAuthenticator();
      default:
        return undefined;
    }
  }

  async selectSmsAuthenticator() {
    await browser.waitUntil(async () => {
      return (await this.authenticatorSms).isDisplayed();
    }, 5000, 'wait for sms authenticator in list');
    (await this.authenticatorSms).click();
  }

  async selectEmailAuthenticator() {
    await browser.waitUntil(async () => {
      return (await this.authenticatorEmail).isDisplayed();
    }, 5000, 'wait for email authenticator in list');
    (await this.authenticatorEmail).click();
  }

  async selectSecurityQuestionAuthenticator() {
    await browser.waitUntil(async () => {
      return (await this.authenticatorSecurityQuestion).isDisplayed();
    }, 5000, 'wait for email authenticator in list');
    (await this.authenticatorSecurityQuestion).click();
  }

  async clickVerify() {
    await browser.waitUntil(async () => {
      return (await this.verifyBtn).isDisplayed();
    }, 5000, 'wait for verify btn');

    let verify = await this.verifyBtn;
    await verify.click();

    // There can be a form validation error, just retry
    await delay(1000);
    verify = await this.verifyBtn;
    if (await verify.isDisplayed() && await verify.isEnabled()) {
      await this.submit();
    }
  }

  async verifyWithEmailCode() {
    await browser.waitUntil(async () => {
      return (await this.verifyWithEmailCodeButton).isDisplayed();
    }, 5000, 'wait for verify with email code btn');
    (await this.verifyWithEmailCodeButton).click();
  }

  async receiveCodeViaSms() {
    await browser.waitUntil(async () => {
      return (await this.receiveCodeViaSmsButton).isDisplayed();
    }, 5000, 'wait for receive a code via sms btn');
    (await this.receiveCodeViaSmsButton).click();
  }

  async enterCode(code) {
    await browser.waitUntil(async () => {
      return (await this.code).isDisplayed();
    }, 5000, 'wait for verify code input');
    (await this.code).setValue(code);
  }

  async enterAnswer(answer) {
    await browser.waitUntil(async () => {
      return (await this.securityQuestionAnswer).isDisplayed();
    }, 5000, 'wait for security question answer');
    (await this.securityQuestionAnswer).setValue(answer);
  }

  async waitForLoad() {
    if (process.env.ORG_OIE_ENABLED) {
      // With Step Up MFA there can be no Submit button displayed, 
      //  but authenticator list or prompt to verify authenticator
      return browser.waitUntil(async () => this.OIEsigninForm.then(el => el.isDisplayed()), 5000, 'wait for signin form');
    } else {
      return browser.waitUntil(async () => this.signinSubmitBtn.then(el => el.isDisplayed()), 5000, 'wait for signin btn');
    }
  }

  async signinFacebook(username, password) {
    await this.waitForLoad();
    await this.facebookLoginBtn.then(el => el.click());

    (await this.facebookEmail).isDisplayed().then(async(displayed) => {
      // If a facebook session already exists, the email input won't display
      // it'll automatically log you in
      if (displayed) {
        await this.facebookEmail.then(el => el.setValue(username));
        await this.facebookPassword.then(el => el.setValue(password));
        await this.facebookSubmitBtn.then(el => el.click());   
      }
    });
  }
}

export default new OktaLogin();
