module.exports = function getLoginFlow(transaction) {
  const { availableSteps } = transaction;
  if (!availableSteps) {
    return null;
  }

  const identify = availableSteps.find(({ name }) => name === 'identify');
  if (!identify) {
    if (availableSteps.some(({ name }) => name === 'redirect-idp')) {
      return 'social-idp';
    } 
    return null;
  }
  const hasPasswordInput = identify.inputs.some(({ name }) => name === 'password');
  return hasPasswordInput ? 'basic-login' : 'multifactor-login';
};
