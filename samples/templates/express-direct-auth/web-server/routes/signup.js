const express = require('express');
const { getAuthClient, uniqueId } = require('../utils');

const router = express.Router();

// TODO: extract error message from response, then show error in UI
function hasError(idxResponse, previousStep) {
  return idxResponse.neededToProceed
    .filter(({ name }) => name === previousStep)
    .map(({ value }) => value)

}

// startRegistration
// continueRegistration

router.get('/signup', (_, res) => {
  res.render('registration');
});

router.post('/signup', (req, res) => {
  let previousStep;

  const { firstname, lastname, email } = req.body;
  const transactionId = uniqueId();
  const authClient = getAuthClient({ 
    storageManager: {
      transaction: {
        storageKey: `transaction-${transactionId}`
      }
    }
  });
  authClient.idx.interact()
    .then(({ idxResponse }) => {
      // Add transactionId to session
      req.session.transactionId = transactionId;

      // Proceed with enroll-profile
      previousStep = 'select-enroll-profile';
      return idxResponse.proceed('select-enroll-profile', {});
    })
    .then(idxResponse => {
      // console.log('idxResponse [select-enroll-profile] -> ', idxResponse);
      previousStep = 'enroll-profile';
      return idxResponse.proceed('enroll-profile', {
        userProfile: {
          email,
          firstName: firstname,
          lastName: lastname,
        }
      });
    })
    .then(idxResponse => {
      return idxResponse.proceed('select-authenticator-enroll', {
        authenticator: {
          id: 'aut59pqMlE2tA5IQe4w4' // select email
        }
      });
    })
    .then(idxResponse => {
      console.log('select-authenticator-enroll resp ->', idxResponse);
      req.session.stateHandle = idxResponse.context.stateHandle;
      res.render('enroll-email-authenticator');
    })
    .catch(err => {
      console.log('/ signup error: ', err);
      
      const errors = err.errorCauses ? err.errorCauses : ['Registration failed'];
      res.render('registration', {
        hasError: errors && errors.length,
        errors, 
      });
    });
});

router.post('/signup/enroll-email-authenticator', (req, res) => {
  const { code } = req.body;
  const { stateHandle, transactionId } = req.session;
  const authClient = getAuthClient({
    storageManager: {
      transaction: {
        storageKey: `transaction-${transactionId}`
      }
    }
  });
  authClient.idx.introspect({ stateHandle })
    .then(idxResponse => {
      console.log('resume -> ', idxResponse);
      return idxResponse.proceed('enroll-authenticator', {
        credentials: {
          passcode: code
        }
      })
    })
    .then(idxResponse => {
      console.log(idxResponse);
      return idxResponse.proceed('select-authenticator-enroll', {
        authenticator: {
          id: 'aut59ppeMG1hUTsqO4w4' // select password authenticator
        }
      });
    })
    .then(idxResponse => {
      console.log('select-authenticator-enroll resp ->', idxResponse);
      req.session.stateHandle = idxResponse.context.stateHandle;
      res.render('enroll-password-authenticator');
    })
    .catch(err => {
      console.log('err ->', err, err.messages);
      res.render('enroll-email-authenticator', { error: 'error!!!' });
    });
});

router.post('/signup/enroll-password-authenticator', async (req, res) => {
  const { password } = req.body;
  const { stateHandle, transactionId } = req.session;
  const authClient = getAuthClient({
    storageManager: {
      transaction: {
        storageKey: `transaction-${transactionId}`
      }
    }
  });
  authClient.idx.introspect({ stateHandle })
    .then(idxResponse => {
      console.log('resume -> ', idxResponse);
      return idxResponse.proceed('enroll-authenticator', {
        credentials: {
          passcode: password
        }
      })
    })
    .then(idxResponse => {
      console.log(idxResponse); // get interactionCode here

      const meta = authClient.transactionManager.load();
      const {
        codeVerifier,
        clientId,
        redirectUri,
        scopes,
        urls,
        ignoreSignature
      } = meta;
  
      return authClient.token.exchangeCodeForTokens({
        interactionCode: idxResponse.interactionCode,
        codeVerifier,
        clientId,
        redirectUri,
        scopes,
        ignoreSignature
      }, urls);

    })
    .then(async tokens => {
      const { tokens: { accessToken, idToken } } = tokens;
      const userinfo = await authClient.token.getUserInfo(accessToken, idToken);

      // Persist userContext in session
      req.session.userContext = JSON.stringify({ userinfo, tokens });

      // Redirect back to home page
      res.redirect('/');
    });
});

// Debugging views
router.get('/signup/enroll-email-authenticator', (req, res) => {
  res.render('enroll-email-authenticator');
});

router.get('/signup/enroll-password-authenticator', (req, res) => {
  res.render('enroll-password-authenticator');
});

module.exports = router;
