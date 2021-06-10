const loginForm = '#login-form';
const username = `${loginForm} #username`;
const password = `${loginForm} #password`;
const submit = `${loginForm} #submit-login-form`;
const formMessages = `#form-messages li`;
const formMessage = `${formMessages}:first-child`;

export class LoginForm {
  get username() { return username; }
  get password() { return password; }
  get submit() { return submit; }
  get formMessages() { return formMessages; }
  get formMessage() { return formMessage; }
}

export default new LoginForm();
