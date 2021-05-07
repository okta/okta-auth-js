const loginForm = '#login-form';
const username = `${loginForm} #username`;
const password = `${loginForm} #password`;
const submit = `${loginForm} #submit-login-form`;

class LoginForm {
  get username() { return username; }
  get password() { return password; }
  get submit() { return submit; }
}

export default new LoginForm();
