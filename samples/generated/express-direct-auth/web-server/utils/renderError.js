module.exports = function renderError(res, { template, title, error }) {
  const errors = err.errorCauses || [error.message] || [];
  res.render(template, {
    title,
    hasError: true,
    errors, 
  });
};
