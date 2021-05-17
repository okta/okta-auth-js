const { IdxFeature } = require('@okta/okta-auth-js');
const { 
  getAuthClient,
  redirect,
  getLoginFlow,
} = require('../utils');


const express = require('express');

const router = express.Router();

const getRedirectFlow = (entryFlow, transaction) => {
  let flow;
  const { enabledFeatures } = transaction;
  const loginFlow = getLoginFlow(transaction);

  switch (entryFlow) {
    case 'basic-login':
    case 'multifactor-login':
      if (entryFlow !== loginFlow) {
        flow = loginFlow;
      }
      return flow;
    case 'signup':
      if (!enabledFeatures.includes(IdxFeature.REGISTRATION)) {
        flow = loginFlow;
      }
      return flow;
    case 'recover-password':
      if (!enabledFeatures.includes(IdxFeature.PASSWORD_RECOVERY)) {
        flow = loginFlow;
      }
      return flow;
    case 'social-idp':
      if (!enabledFeatures.includes(IdxFeature.PASSWORD_RECOVERY)) {
        flow = loginFlow;
      }
      return flow;
  }
};

router.get('/flow', async (req, res) => {
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx.startTransaction();
  req.setIdxStates(transaction);

  const { flow: entryFlow } = req.query;
  const redirectFlow = getRedirectFlow(entryFlow, transaction);
  req.setFlows({ entry: entryFlow, redirect: redirectFlow });

  redirect({ req, res, path: `/${redirectFlow ? redirectFlow : entryFlow}` });
});

module.exports = router;
