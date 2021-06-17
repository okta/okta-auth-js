
class FacebookSignIn {
  get signinForm() { return '#login_form';}
  get username() { return '#login_form #email'; }
  get password() { return '#login_form #pass'; }
  get submit() { return '#login_form #loginbutton'; }
  get continue() { return '#platformDialogForm button[type="submit"][name="__CONFIRM__"]'; }
}

export default new FacebookSignIn();
