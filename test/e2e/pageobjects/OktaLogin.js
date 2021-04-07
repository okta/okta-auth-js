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

  async waitForLoad() {
    if (process.env.ORG_OIE_ENABLED) {
      return browser.waitUntil(async () => this.OIEsigninSubmitBtn.then(el => el.isDisplayed()), 5000, 'wait for signin btn');
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
