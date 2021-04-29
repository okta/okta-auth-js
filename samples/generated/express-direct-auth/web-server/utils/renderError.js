function isIdxError(error) {
  if (!error || typeof error !== 'object') {
    return;
  }

  if (!error.error || typeof error.error !== 'object') {
    return;
  }

  error = error.error;
  return typeof error.error === 'string';
}

function formatIdxError(error) {
  error = error.error;
  const code = error.error;
  const details = error.error_description || '';
  return `${code}: ${details}`;
}

module.exports = function renderError(res, {
  template, error, ...restOptions 
}) {
  let errors;
  if (Array.isArray(error.errorCauses)) {
    errors = error.errorCauses;
  } else if (typeof error === 'string') {
    errors = [error];
  } else if (error && error.message) {
    errors = [error.message];
  } else if (isIdxError(error)) {
    errors = [formatIdxError(error)];
  } else {
    errors = [];
  }

  res.render(template, {
    hasError: true,
    errors,
    ...restOptions,
  });
};
