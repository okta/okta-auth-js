
class OktaSignInOIE {
  get signinForm() { return 'form[data-se="o-form"]';}
  get signinUsername() { return  '[name="identifier"]'; }
  get signinPassword()  { return '[name="credentials.passcode"]'; }
  get signinSubmitBtn() { return '[data-type="save"]'; }
  get signinWithFacebookBtn() { return '[data-se=social-auth-facebook-button]'; }
  get signinWithGoogleBtn() { return '[data-se=social-auth-google-button]'; }
}

export default new OktaSignInOIE();
