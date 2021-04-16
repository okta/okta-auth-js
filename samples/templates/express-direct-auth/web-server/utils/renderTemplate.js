const renderError = require('./renderError');

module.exports = function renderTemplate(req, res, template, options) {
  const error = req.getLastError();
  if (error) {
    req.clearLastError();
    renderError(res, {
      template,
      error,
    });
    return;
  }
  res.render(template, options);
};
