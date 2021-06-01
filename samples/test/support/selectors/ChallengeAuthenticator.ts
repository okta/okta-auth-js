class ChallengeAuthenticator {
  get pageTitle() { return '#page-title-header'; }
  get code() { return '#authenticator-code-input'; }
  get submit() { return '#challenge-authenticator-form #submit-button'; }
}

export default new ChallengeAuthenticator();