const { IdxFeature } = require('@okta/okta-auth-js');
const renderTemplate = require('./renderTemplate');
const getLoginFlow = require('./getLoginFlow');

const loginFlowMap = {
  'basic-login': {
    title: 'Login with Username and Password',
    action: '/basic-login'
  },
  'multifactor-login': {
    title: 'Login with Password and Another Factor',
    action: '/multifactor-login'
  },
  'social-idp': {
    title: 'Social IDP'
  }
};

module.exports = function renderEntryPage(req, res) {
  const transaction = req.getIdxStates();
  const { enabledFeatures, availableSteps } = transaction;
  const flows = req.getFlows();
  req.clearFlows();

  const loginFlow = getLoginFlow(transaction);

  const idps = availableSteps
    .filter(({ name }) => name === 'redirect-idp')
    .map(({ href, idp: { name } }) => ({ name, href }));
  
  let loginInputs;
  const identify = availableSteps.find(({ name }) => name === 'identify');
  if (identify) {
    loginInputs = identify.inputs
      .map(({ label, name, secure }) => ({ label, name, type: secure ? 'password' : 'text' }));
  }

  renderTemplate(req, res, 'entry-page', {
    ...loginFlowMap[loginFlow],
    ...flows,
    showLoginForm: !!loginInputs && loginInputs.length,
    loginInputs,
    canRegister: enabledFeatures.includes(IdxFeature.REGISTRATION),
    canRecoverPassword: enabledFeatures.includes(IdxFeature.PASSWORD_RECOVERY),
    idps,
  });
}
