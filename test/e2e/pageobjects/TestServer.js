import assert from 'assert';

/* eslint-disable max-len */
class TestServer {
  get rootSelector() { return $('#root'); }

  // form
  get issuer() { return $('#issuer'); }
  get username() { return $('#username'); }
  get password() { return $('#password'); }
  get submitBtn() { return $('#submitBtn'); }

  // results
  get status() { return $('#status'); }
  get sessionToken() { return $('#sessionToken'); }
  get error() { return $('#error'); }

  async open() {
    await browser.url('/server');
    await browser.waitUntil(async () => this.rootSelector.then(el => el.isExisting()), 5000, 'wait for root selector');
  }

  async submitLogin() {
    await this.submitBtn.then(el => el.click());
  }

  async assertLoginSuccess() {
    await this.status.then(el => el.getText()).then(txt => {
      assert(txt.trim() === 'SUCCESS');
    });
    await this.error.then(el => el.getText()).then(txt => {
      assert(txt.trim() === '');
    });
    await this.sessionToken.then(el => el.getText()).then(txt => {
      assert(txt.trim() !== '');
    });
  }

  async assertLoginFailure() {
    await this.status.then(el => el.getText()).then(txt => {
      assert(txt.trim() === '');
    });
    await this.error.then(el => el.getText()).then(txt => {
      assert(txt.trim() === 'AuthApiError: Authentication failed');
    });
    await this.sessionToken.then(el => el.getText()).then(txt => {
      assert(txt.trim() === '');
    });
  }

}

export default new TestServer();
