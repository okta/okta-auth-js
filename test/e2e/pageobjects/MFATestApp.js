import assert from 'assert';

class MFATestApp {
  get readySelector() { return $('#oidc-config'); }
  get loginBtn() { return $('#login'); }
  get logoutBtn() { return $('#logout'); }
  get username() { return $('#username'); }
  get password() { return $('#password'); }
  get submitBtn() { return $('form button[type=submit]'); }
  get authenticatorOptions() { return $('#authenticator-options'); }
  get challengeAuthenticatorForm() { return $('#challenge-authenticator-form'); }
  get answer() { return $('#challenge-authenticator-form input[name=answer]'); }
  get userInfo() { return $('#user-info'); }

  async open() {
    await browser.url('/');
    await browser.waitUntil(async () => 
      this.readySelector.then(el => el.isExisting()), 5000, 'wait for ready selector');
  }

  async waitFor(element) {
    return browser.waitUntil(async () => element.then(el => el.isDisplayed()), 5000, 'wait for login button');
  }

  async startLoginForm() {
    await this.waitFor(this.loginBtn);
    await this.loginBtn.then(el => el.click());
  }

  async login(username, password) {
    await this.username.then(el => el.setValue(username));
    await this.password.then(el => el.setValue(password));
    await this.submitBtn.then(el => el.click());
  }

  async logout() {
    await this.logoutBtn.then(el => el.click());
    await this.waitFor(this.loginBtn);
  }

  async selectAuthenticator(value) {
    await this.waitFor(this.authenticatorOptions);
    await this.authenticatorOptions.then(el => el.selectByAttribute('value', value));
    await this.submitBtn.then(el => el.click());
  }

  async verifyAnswer(answer) {
    await this.waitFor(this.challengeAuthenticatorForm);
    await this.answer.then(el => el.setValue(answer));
    await this.submitBtn.then(el => el.click());
  }

  async assertUserInfo() {
    await this.waitFor(this.userInfo);
    await this.userInfo.then(el => el.getText()).then(txt => {
      assert(txt.indexOf('email') > 0);
    });
  }

}

export default new MFATestApp();
