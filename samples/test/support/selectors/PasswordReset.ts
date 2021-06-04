class PasswordReset {
  get pageTitle() { return '#page-title-header'; }
  get password() { return '#password-reset-form #password'; }
  get confirmPassword() { return '#password-reset-form #confirm-password'; }
  get submit() {return '#password-reset-form #submit-button';}
}

export default new PasswordReset();
