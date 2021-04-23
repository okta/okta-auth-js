const { IdxStatus } = require('@okta/okta-auth-js');
const { 
  getAuthClient, 
  getIdxMethod,
  renderError, 
  handleAuthTransaction, 
} = require('../utils');

const generateSelectAuthenticator = ({ flow, next, router }) => {
  router.get(`/${flow}/select-authenticator`, (req, res) => {
    const { status, authenticators } = req.session;
    if (status === IdxStatus.PENDING) {
      res.render('select-authenticator', {
        authenticators,
        action: `/${flow}/select-authenticator`,
      });
    } else {
      res.redirect(`/${flow}`);
    }
  });
  
  router.post(`/${flow}/select-authenticator`, async (req, res) => {
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
        template: 'select-authenticator',
        error,
      });
    }
  });
};

module.exports = generateSelectAuthenticator;
