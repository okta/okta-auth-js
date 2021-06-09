import { LoginForm } from './LoginForm';

class OktaSignInOIE extends LoginForm {
  get signinForm() { return 'form[data-se="o-form"]';}
  get signinUsername() { return  '[name="identifier"]'; }
  get signinPassword()  { return '[name="credentials.passcode"]'; }
  get signinSubmitBtn() { return '[data-type="save"]'; }
  get signinWithFacebookBtn() { return '[data-se=social-auth-facebook-button]'; }
  get signinWithGoogleBtn() { return '[data-se=social-auth-google-button]'; }

  // override fields from base form
  get username() { return this.signinUsername; }
  get password() { return this.signinPassword; }
  get submit() { return this.signinSubmitBtn; }
}

export default new OktaSignInOIE();
