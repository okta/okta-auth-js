const { IdxStatus } = require('@okta/okta-auth-js');
const redirect = require('./redirect');

module.exports = function renderPage({ req, res, render, basePath }) {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
    render();
  } else {
    redirect({ req, res, path: basePath });
  }
};
