function showSigninWidget(options) {
  // Create widget options
  options = Object.assign({
    baseUrl: config.issuer.split('/oauth2')[0],
    clientId: config.clientId,
    redirectUri: config.redirectUri,
    useInteractionCodeFlow: config.useInteractionCodeFlow,
    authParams: {
      issuer: config.issuer
    },
    idps: config.idps.split(/\s+/).map(idpToken => {
      const [type, id] = idpToken.split(/:/);
      if (!type || !id) {
         return null;
      }
      return { type, id };
    }).filter(idpToken => idpToken)
  }, options);

  // Create an instance of the signin widget
  var signIn = new OktaSignIn(options);

  signIn.showSignIn({
    el: '#signin-widget',
    state: JSON.stringify(config.state)
  })
  .then(function(response) {
    document.getElementById('flow-widget').style.display = 'none';
    signIn.remove();
    endAuthFlow(response.tokens);
  })
  .catch(function(error) {
    console.log('login error', error);
  });

  document.getElementById('flow-widget').style.display = 'block'; // show login UI
}