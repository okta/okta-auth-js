const { IdxStatus } = require('@okta/okta-auth-js');
const { 
  getAuthClient, 
  getIdxMethod,
  renderError, 
  handleAuthTransaction, 
} = require('../utils');

const generateChallengeAuthenticator = ({ flow, type, next, router }) => {
  router.get(`/${flow}/challenge-authenticator/${type}`, (req, res) => {
    const { status } = req.session;
    if (status === IdxStatus.PENDING) {
      res.render('authenticator', {
        title: `Challenge ${type} authenticator`,
        action: `/${flow}/challenge-authenticator/${type}`,
      });
    } else {
      res.redirect('/recover-password');
    }
  });
  
  router.post(`/${flow}/challenge-authenticator/${type}`, async (req, res) => {
    const { verificationCode } = req.body;
    const authClient = getAuthClient(req);
    try {
      const method = getIdxMethod(flow);
      const authTransaction = await authClient.idx[method]({ verificationCode });
      handleAuthTransaction({ req, res, next, authClient, authTransaction });
    } catch (error) {
      renderError(res, {
        template: 'authenticator',
        title: `Challenge ${type} authenticator`,
        error,
      });
    }
  });  
}

module.exports = generateChallengeAuthenticator;
