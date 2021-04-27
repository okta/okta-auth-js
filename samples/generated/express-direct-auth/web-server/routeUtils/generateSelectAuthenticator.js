const { IdxStatus } = require('@okta/okta-auth-js');
const { 
  getAuthClient, 
  getIdxMethod,
  renderError, 
  handleAuthTransaction, 
} = require('../utils');

const template = 'select-authenticator';

const generateSelectAuthenticator = ({ 
  path, action, entryPath, next, router 
}) => {
  router.get(path, (req, res) => {
    const { status, authenticators } = req.session;
    if (status === IdxStatus.PENDING) {
      res.render(template, {
        authenticators,
        action,
      });
    } else {
      res.redirect(entryPath);
    }
  });
  
  router.post(path, async (req, res) => {
    const { authenticator } = req.body;
    const authClient = getAuthClient(req);
    try {
      const method = getIdxMethod(flow);
      const authTransaction = await authClient.idx[method]({
        authenticators: [authenticator],
      });
      handleAuthTransaction({ req, res, next, authClient, authTransaction });
    } catch (error) {
      renderError(res, {
        template,
        error,
      });
    }
  });
};

module.exports = generateSelectAuthenticator;
