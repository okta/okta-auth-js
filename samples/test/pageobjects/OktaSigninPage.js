/* eslint-disable max-len */
class OktaLogin {
  get signinForm() { return $('form[data-se="o-form"]');}
  get signinUsername() { return $('#okta-signin-username'); }
  get signinPassword() { return $('#okta-signin-password'); }
  get signinSubmitBtn() { return $('#okta-signin-submit'); }
  get siginWithFacebookBtn() { return $('[data-se=social-auth-facebook-button]'); }
  get siginWithGoogleBtn() { return $('[data-se=social-auth-google-button]'); }

  async signin(username, password) {
    await this.waitForLoad();
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
    return browser.waitUntil(async () => this.signinSubmitBtn.then(el => el.isDisplayed()), 5000, 'wait for signin btn');
  }
}

export default new OktaLogin();
