/* eslint-disable max-len */
class OIEOktaLogin {
  get signinForm() { return $('form[data-se="o-form"]');}
  get signinUsername() { return  $('[name="identifier"]'); }
  get signinPassword() { return $('[name="credentials.passcode"]'); }
  get signinSubmitBtn() { return $('[data-type="save"]'); }

  async signin(username, password) {
    await this.waitForLoad();
    await this.signinUsername.then(el => el.setValue(username));
    await this.signinPassword.then(el => el.setValue(password));
    await this.signinSubmitBtn.then(el => el.click());

    // TODO - Fix this to support identifier first flow
    // (await this.signinPassword).isDisplayed().then(async(displayed) => {
    //   // Idenfitier first flow if passcode input is not present on widget
    //   if (!displayed) {
    //     await this.signinSubmitBtn.then(el => el.click());
    //     await this.signinPassword.then(el => el.setValue(password));
    //     await this.signinSubmitBtn.then(el => el.click());
    //   } else { // Identifier and passcode on same screen
    //     await this.signinPassword.then(el => el.setValue(password));
    //     await this.signinSubmitBtn.then(el => el.click());
    //   }
    // });        
  }

  async waitForLoad() {
    return browser.waitUntil(async () => this.signinSubmitBtn.then(el => el.isDisplayed()), 5000, 'wait for signin btn');
  }
}

export default new OIEOktaLogin();
