const getAuthClient = require('./getAuthClient');
const getAuthTransaction = require('./getAuthTransaction');
const renderMessages = require('./renderMessages');
const handleTransaction = require('./handleTransaction');
const renderTemplate = require('./renderTemplate');
const renderPage = require('./renderPage');
const renderEntryPage = require('./renderEntryPage');
const redirect = require('./redirect');
const getFormActionPath = require('./getFormActionPath');
const flow = require('./flow');

module.exports = {
  getAuthClient,
  getAuthTransaction,
  renderMessages,
  handleTransaction,
  renderTemplate,
  renderEntryPage,
  renderPage,
  redirect,
  getFormActionPath,
  ...flow,
};
