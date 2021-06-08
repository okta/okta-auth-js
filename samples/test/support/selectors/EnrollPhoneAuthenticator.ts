class EnrollPhoneAuthenticator {
  get pageTitle() {return '#page-title-header'; }
  get options() { return '#phone-authenticator-method-options'; }
  get phoneNumber() { return '#enroll-phone-authenticator-form #phoneNumber'; }
  get submit() { return '#enroll-phone-authenticator-form #submit-button';}
}

export default new EnrollPhoneAuthenticator();
