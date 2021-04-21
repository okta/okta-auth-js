const { AuthSdkError, AuthApiError } = require('@okta/okta-auth-js');

module.exports = function renderError(res, { template, title, error }) {
  let errors = [];
  if (error instanceof AuthSdkError) {
    errors = ['Internal Error'];
  } else if (error instanceof AuthApiError){
    errors = [...error.errorCauses];
  } else {
    errors = [error.message];
  }
  res.render(template, {
    title,
    hasError: true,
    errors, 
  });
};
