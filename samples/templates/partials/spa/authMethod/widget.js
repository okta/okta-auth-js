var signIn;
var _idpPopupWindow;

function showSigninWidget(options) {
  // Create widget options
  options = Object.assign({
    baseUrl: config.issuer.split('/oauth2')[0],
    clientId: config.clientId,
    redirectUri: config.redirectUri,
    useInteractionCodeFlow: config.useInteractionCodeFlow,
    state: JSON.stringify(config.state),
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
  signIn = new OktaSignIn(options);

  // Custom logic for opening IDP in popup
  if (config.idpDisplay === 'popup') {
    signIn.on('afterRender', function() {
      document.querySelectorAll('.okta-idps-container .social-auth-button').forEach(function (el) {
        el.onclick = function(event) {
          event.preventDefault();
          disableIDPs(); // workaround issue of not being able to select another IDP after an IDP is selected
          _idpPopupWindow = openPopup(el.href, {
            popupTitle: el.innerText
          });
        }
      });
    });
  }


  signIn.showSignIn({
    el: '#signin-widget'
  })
  .then(function(response) {
    hideSigninWidget();
    endAuthFlow(response.tokens);
  })
  .catch(function(error) {
    console.log('login error', error);
  });

  document.getElementById('authMethod-widget').style.display = 'block'; // show login UI
}

function hideSigninWidget() {
  document.getElementById('authMethod-widget').style.display = 'none';
  signIn && signIn.remove();
}

function disableIDPs() {
  const idpContainer = document.querySelector('.sign-in-with-idp');
  idpContainer.innerHTML = '<div style="text-align: left; padding-top: 20px; font-size: 13px;"><a class="link-button" href="#" onclick="restartLoginFlow(event)">Cancel / restart IDP flow</a></div>';
}

function restartLoginFlow(event) {
  event.preventDefault();
  // close existing popup window if any
  if (_idpPopupWindow) {
    _idpPopupWindow.close();
  }
  // clear existing transaction
  signIn.authClient.transactionManager.clear();

  // re-render widget
  hideSigninWidget();
  showSigninWidget();
  
}