/* eslint-disable max-len */
class OktaLogin {

  // V1
  get signinForm() { return $('form[data-se="o-form"]');}
  get signinUsername() { return $('#okta-signin-username'); }
  get signinPassword() { return $('#okta-signin-password'); }
  get signinSubmitBtn() { return $('#okta-signin-submit'); }
  get siginWithFacebookBtn() { return $('[data-se=social-auth-facebook-button]'); }
  get siginWithGoogleBtn() { return $('[data-se=social-auth-google-button]'); }

  // V2
  get OIEsigninForm() { return $('form[data-se="o-form"]');}
  get OIEsigninUsername() { return  $('[name="identifier"]'); }
  get OIEsigninPassword() { return $('[name="credentials.passcode"]'); }
  get OIEsigninSubmitBtn() { return $('[data-type="save"]'); }

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

  async clickSigninWithFacebook() {
    await this.waitForLoad();
    await this.siginWithFacebookBtn.then(el => el.click());
  }

  async clickSigninWithGoogle() {
    await this.waitForLoad();
    await this.siginWithGoogleBtn.then(el => el.click());
  }

  async waitForLoad() {
    if (process.env.ORG_OIE_ENABLED) {
      return browser.waitUntil(async () => this.OIEsigninSubmitBtn.then(el => el.isDisplayed()), 5000, 'wait for signin btn');
    } else {
      return browser.waitUntil(async () => this.signinSubmitBtn.then(el => el.isDisplayed()), 5000, 'wait for signin btn');
    }
  }
}

export default new OktaLogin();
