const express = require('express');
const { getAuthClient } = require('../utils');

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
  const authClient = getAuthClient();
  authClient.idx.interact()
    .then(({ idxResponse }) => {
      // console.log('interact resp -> ', idxResponse.neededToProceed);
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
  const { stateHandle } = req.session;
  const authClient = getAuthClient();
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

router.post('/signup/enroll-password-authenticator', (req, res) => {
  const { password } = req.body;
  const { stateHandle } = req.session;
  const authClient = getAuthClient();
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

      // TODO: get transaction meta (from transaction id)
      // then exchangeCodeForToken
      const transactionData = authClient.storageManager.getTransactionStorage().getStorage();
      console.log(transactionData);
    });
});

// Debugging
router.get('/signup/enroll-email-authenticator', (req, res) => {
  res.render('enroll-email-authenticator');
});

router.get('/signup/enroll-password-authenticator', (req, res) => {
  res.render('enroll-password-authenticator');
});

module.exports = router;
