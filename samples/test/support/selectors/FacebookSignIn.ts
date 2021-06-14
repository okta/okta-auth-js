class FacebookSignIn {
  get signinForm() { return '#login_form';}
  get username() { return  '#login_form #email'; }
  get password()  { return '#login_form #pass'; }
  get submit() { return '#login_form #loginbutton'; }
}

export default new FacebookSignIn();
