const { IdxStatus } = require('@okta/okta-auth-js');
const { 
  getAuthClient, 
  getIdxMethod,
  renderError, 
  handleAuthTransaction, 
} = require('../utils');

const template = 'authenticator';

const generateChallengeAuthenticator = ({ 
  path, action, entryPath, type, next, router 
}) => {
  router.get(path, (req, res) => {
    const { status } = req.session;
    if (status === IdxStatus.PENDING) {
      res.render(template, {
        title: `Challenge ${type} authenticator`,
        action,
      });
    } else {
      res.redirect(entryPath);
    }
  });
  
  router.post(path, async (req, res) => {
    const { verificationCode } = req.body;
    const authClient = getAuthClient(req);
    try {
      const method = getIdxMethod(flow);
      const authTransaction = await authClient.idx[method]({ verificationCode });
      handleAuthTransaction({ req, res, next, authClient, authTransaction });
    } catch (error) {
      renderError(res, {
        template,
        title: `Challenge ${type} authenticator`,
        error,
      });
    }
  });  
};

module.exports = generateChallengeAuthenticator;
