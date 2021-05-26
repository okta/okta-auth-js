const renderMessages = require('./renderMessages');
const getFormActionPath = require('./getFormActionPath');

module.exports = function renderTemplate(req, res, template, options = {}) {
  options = { 
    ...options, 
    action: getFormActionPath(req, options.action),
    skipAction: getFormActionPath(req, options.skipAction),
    cancelAction: getFormActionPath(req, '/cancel')
  };
  const { messages } = req.getIdxStates() || {};
  req.clearIdxStates();
  if (messages && messages.length) {
    renderMessages(res, {
      template,
      messages,
      ...options,
    });
    return;
  }
  res.render(template, options);
};
