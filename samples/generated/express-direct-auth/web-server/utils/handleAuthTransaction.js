/* eslint-disable complexity */
const { IdxStatus } = require('@okta/okta-auth-js');

module.exports = function handleAuthTransaction({ 
  req,
  res, 
  next, 
  authClient, 
  authTransaction,
  proceed,
}) {
  const {  
    data: { 
      nextStep,
      messages,
      tokens,
      status,
      error,
    }
  } = authTransaction;

  // Persist states to session
  req.session.status = status;
  if (messages && messages.length) {
    req.setIdxMessages(messages);
  }

  switch (status) {
    case IdxStatus.PENDING:
      // Proceed to next step
      if (!proceed({ req, res, nextStep })) {
        next(new Error(`
          Oops! The current flow cannot support the policy configuration in your org, 
          try other flows in the sample or change your app/org configuration.
        `));
      }
      return;
    case IdxStatus.SUCCESS:
      // Save tokens to storage (req.session)
      authClient.tokenManager.setTokens(tokens);
      // Redirect back to home page
      res.redirect('/');
      return;
    case IdxStatus.FAILURE:
      authClient.transactionManager.clear();
      next(error);
      return;
    case IdxStatus.TERMINAL:
      res.redirect('/terminal');
      return;
  }
};
