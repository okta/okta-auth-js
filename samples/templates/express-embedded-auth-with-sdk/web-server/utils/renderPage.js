const { IdxStatus } = require('@okta/okta-auth-js');
const redirect = require('./redirect');

module.exports = function renderPage({ req, res, render }) {
  const { entry, idx: { status } } = req.getFlowStates();
  if (status === IdxStatus.PENDING) {
    render();
  } else {
    redirect({ req, res, path: entry });
  }
};
