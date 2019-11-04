class OktaLogin {
  get signinForm() { return $('form[data-se="o-form"]')}
  get signinUsername() { return $('#okta-signin-username') }
  get signinPassword() { return $('#okta-signin-password') }
  get signinSubmitBtn() { return $('#okta-signin-submit') }

  signin(username, password) {
    this.waitForLoad();
    this.signinUsername.setValue(username);
    this.signinPassword.setValue(password);
    this.signinSubmitBtn.click();
  }

  waitForLoad() {
    if(!this.signinSubmitBtn.isDisplayed()){
      this.signinSubmitBtn.waitForDisplayed(10000);
    }
  }
}

export default new OktaLogin()
