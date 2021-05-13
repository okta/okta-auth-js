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
      terminal,
      messages,
      tokens,
      status,
      error,
    }
  } = authTransaction;

  const done = () => {
    // Save tokens to storage (req.session)
    authClient.tokenManager.setTokens(tokens);
    // Redirect back to home page
    res.redirect('/');
  };

  // Persist status to session
  req.session.status = status;
  // Done if tokens are available
  if (tokens) {
    return done();
  }
  // Throw error if exist in authTransaction
  if (error) {
    authClient.transactionManager.clear();
    next(error);
    return;
  }
  if (messages && messages.length) {
    req.setIdxMessages(messages);
  }
  // If terminal exist, redirect to terminal view
  if (terminal) {
    return res.redirect('/terminal');
  }
  // Proceed to next step
  if (typeof proceed === 'function') {
    const supportNextStep = proceed({ req, res, nextStep });
    if (!supportNextStep) {
      next(new Error(`
        Oops! The current flow cannot support the policy configuration in your org, 
        try other flows in the sample or change your app/org configuration.
      `));
    }
  }
};
