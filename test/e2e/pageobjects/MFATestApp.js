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
    await browser.waitUntil(async () => {
      const el = await $('#oidc-config');
      const isExisting = await el.isExisting();
      return isExisting;
    }, 5000, 'wait for ready selector');
  }

  async waitFor(element) {
    await browser.waitUntil(async () => {
      const isDisplayed = await element.isDisplayed();
      return isDisplayed;
    }, 5000, 'wait for login button');
  }

  async startLoginForm() {
    const el = await this.loginBtn;
    await this.waitFor(el);
    await el.click();
  }

  async login(username, password) {
    await (await this.username).setValue(username);
    await (await this.password).setValue(password);
    await (await this.submitBtn).click();
  }

  async logout() {
    await (await this.logoutBtn).click();
    await this.waitFor((await this.loginBtn));
  }

  async selectAuthenticator(value) {
    await this.waitFor(await this.authenticatorOptions);
    await (await this.authenticatorOptions).selectByAttribute('value', value);
    await (await this.submitBtn).click();
  }

  async verifyAnswer(answer) {
    await this.waitFor(await this.challengeAuthenticatorForm);
    await (await this.answer).setValue(answer);
    await (await this.submitBtn).click();
  }

  async assertUserInfo() {
    await this.waitFor(await this.userInfo);
    const txt = await (await this.userInfo).getText();
    assert(txt.indexOf('email') > 0);
  }

}

export default new MFATestApp();
