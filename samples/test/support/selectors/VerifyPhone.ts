class VerifyPhone {
  get pageTitle() { return '#page-title-header'; }
  get options() { return '#phone-authenticator-method-options'; }
  get submit() { return '#verify-form #submit-button'; }
}

export default new VerifyPhone();
