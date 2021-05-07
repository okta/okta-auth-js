module.exports = function handleAuthTransaction({ 
  req,
  res, 
  next, 
  authClient, 
  authTransaction,
}) {
  const {  
    data: { 
      nextStep = {},
      terminal,
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
    throw error;
  }
  // If terminal exist, redirect to terminal view
  if (terminal) {
    req.setTerminalMessages(terminal.messages);
    return res.redirect('/terminal');
  }
  // Proceed to next step
  if (typeof next === 'function') {
    const supportNextStep = next({ req, res, nextStep });
    if (!supportNextStep) {
      req.setTerminalMessages([
        `Oops! The current flow cannot support the policy configuration in your org, 
        try other flows in the sample or change your app/org configuration.`
      ]);
      return res.redirect('/terminal');
    }
  }
};
