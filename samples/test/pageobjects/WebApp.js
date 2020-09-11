import assert from 'assert';
import toQueryParams from '../util/toQueryParams';

/* eslint-disable max-len */
class WebApp {

  // form
  get issuer() { return $('#issuer'); }
  get username() { return $('#username'); }
  get password() { return $('#password'); }
  get submitBtn() { return $('#submitBtn'); }

  // results
  get status() { return $('#status'); }
  get sessionToken() { return $('#sessionToken'); }
  get error() { return $('#error'); }
  get accessToken() { return $('#accessToken'); }

  async open(queryObj) {
    await browser.url(toQueryParams(queryObj));
  }

  async loginDirect() {
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

  async waitForAccessToken() {
    return browser.waitUntil(async () => {
      return this.accessToken.then(el => {
        return el.getText();
      }).then(txt => {
        console.log('accessToken: ', txt);
        return txt;
      });
    }, 5000, 'wait for access token');
  }

  async assertAccessToken() {
    await this.waitForAccessToken();
    await this.accessToken.then(el => el.getText()).then(txt => {
      assert(txt.indexOf('expires_in') > 0);
    });
  }

}

export default new WebApp();
