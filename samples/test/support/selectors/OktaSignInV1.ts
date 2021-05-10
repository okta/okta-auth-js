
class OktaSignInV1 {
  get signinForm() { return 'form[data-se="o-form"]';}
  get signinUsername() { return '#okta-signin-username'; }
  get signinPassword() { return '#okta-signin-password'; }
  get signinSubmitBtn() { return '#okta-signin-submit'; }
  get signinWithFacebookBtn() { return '[data-se=social-auth-facebook-button]'; }
  get signinWithGoogleBtn() { return '[data-se=social-auth-google-button]'; }
}

export default new OktaSignInV1();
