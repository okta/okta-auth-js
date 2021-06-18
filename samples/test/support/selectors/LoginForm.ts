const loginForm = '#login-form';
const username = `${loginForm} #username`;
const password = `${loginForm} #password`;
const submit = `${loginForm} #submit-login-form`;
const formMessages = `#form-messages li`;
const formMessage = `${formMessages}:first-child`;
const facebookButton = '#idp-buttons #facebook';
const googleButton = '#idp-buttons #google';

export class LoginForm {
  get username() { return username; }
  get password() { return password; }
  get submit() { return submit; }
  get formMessages() { return formMessages; }
  get formMessage() { return formMessage; }
  get facebookButton() { return facebookButton; }
  get googleButton() { return googleButton; }
}

export default new LoginForm();
