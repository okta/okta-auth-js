class SelectAuthenticator {
  get pageTitle() {return '#page-title-header';}
  get options() { return '#authenticator-options';  }
  get submit() { return '#select-authenticator-form #submit-button';}
}

export default new SelectAuthenticator(); 
