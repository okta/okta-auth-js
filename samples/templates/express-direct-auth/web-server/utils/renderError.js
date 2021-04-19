module.exports = function renderError(res, { template, title, error }) {
  const errors = error.errorCauses || [error.message] || [];
  res.render(template, {
    title,
    hasError: true,
    errors, 
  });
};
