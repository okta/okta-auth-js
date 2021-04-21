import assert from 'assert';

/* eslint-disable max-len */
class TestServer {
  get rootSelector() { return $('#root'); }

  get configLink() { return $('a.config-link'); }
  get issuer() { return $('#f_issuer'); }

  // login form
  get username() { return $('#username'); }
  get password() { return $('#password'); }
  get submitBtn() { return $('#submitBtn'); }

  // register form
  get r_firstName() { return $('#r_firstName'); }
  get r_lastName() { return $('#r_lastName'); }
  get r_email() { return $('#r_email'); }
  get r_password() { return $('#r_password'); }
  get r_submitBtn() { return $('#r_submitBtn'); }

  // results
  get status() { return $('#status'); }
  get sessionToken() { return $('#sessionToken'); }
  get idToken() { return $('#idToken'); }
  get accessToken() { return $('#accessToken'); }
  get login() { return $('#login'); }
  get error() { return $('#error'); }

  async open() {
    await browser.url('/server');
    await browser.waitUntil(async () => this.rootSelector.then(el => el.isExisting()), 5000, 'wait for root selector');
    await this.openConfigForm();
  }

  async openConfigForm() {
    await this.configLink.then(el => el.click());
  }

  async submitLogin() {
    await this.submitBtn.then(el => el.click());
  }

  async submitRegister() {
    await this.r_submitBtn.then(el => el.click());
  }

  async assertLoginSuccess() {
    await this.status.then(el => el.getText()).then(txt => {
      assert(txt.trim() === 'SUCCESS');
    });
    await this.error.then(el => el.getText()).then(txt => {
      assert(txt.trim() === '""');
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
      const err = JSON.parse(txt);
      assert(err.name === 'AuthApiError');
      assert(err.errorSummary === 'Authentication failed');
    });
    await this.sessionToken.then(el => el.getText()).then(txt => {
      assert(txt.trim() === '');
    });
  }

  async assertRegisterSuccess(login) {
    await this.status.then(el => el.getText()).then(txt => {
      assert(txt.trim() === 'SUCCESS');
    });
    await this.error.then(el => el.getText()).then(txt => {
      assert(txt.trim() === '""');
    });
    await this.idToken.then(el => el.getText()).then(txt => {
      assert(txt.trim() !== '');
    });
    await this.accessToken.then(el => el.getText()).then(txt => {
      assert(txt.trim() !== '');
    });
    if (login) {
      await this.login.then(el => el.getText()).then(txt => {
        assert(txt.trim() === login);
      });
    }
  }

  async assertRegisterFailure(errorSummary, errorName = 'AuthApiError') {
    await this.status.then(el => el.getText()).then(txt => {
      assert(txt.trim() === '');
    });
    await this.error.then(el => el.getText()).then(txt => {
      const err = JSON.parse(txt);
      assert(err.name === errorName);
      if (errorSummary) {
        assert(err.errorSummary === errorSummary);
      }
    });
    await this.idToken.then(el => el.getText()).then(txt => {
      assert(txt.trim() === '');
    });
    await this.accessToken.then(el => el.getText()).then(txt => {
      assert(txt.trim() === '');
    });
    await this.login.then(el => el.getText()).then(txt => {
      assert(txt.trim() === '');
    });
  }

}

export default new TestServer();
