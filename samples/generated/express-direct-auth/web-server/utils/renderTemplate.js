const renderError = require('./renderError');
const getFormActionPath = require('./getFormActionPath');

module.exports = function renderTemplate(req, res, template, options = {}) {
  options = { 
    ...options, 
    action: getFormActionPath(req, options.action),
    skipAction: getFormActionPath(req, options.skipAction),
  };
  const error = req.getLastError();
  if (error) {
    req.clearLastError();
    renderError(res, {
      template,
      error,
      ...options,
    });
    return;
  }
  res.render(template, options);
};
