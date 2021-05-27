const { 
  getAuthClient,
  redirect,
  getRedirectFlow,
} = require('../utils');


const express = require('express');

const router = express.Router();

router.get('/flow', async (req, res) => {
  const authClient = getAuthClient(req, res);
  const transaction = await authClient.idx.startTransaction();
  req.setIdxStates(transaction);

  const { flow: entryFlow } = req.query;
  const redirectFlow = getRedirectFlow(entryFlow, transaction);
  req.setFlows({ entry: entryFlow, redirect: redirectFlow });

  redirect({ req, res, path: `/${redirectFlow ? redirectFlow : entryFlow}` });
});

module.exports = router;
