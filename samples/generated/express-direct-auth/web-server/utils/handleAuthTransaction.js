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
  // Proceed to next step
  if (typeof next === 'function') {
    const supportNextStep = next({ req, res, nextStep });
    if (!supportNextStep) {
      throw new Error('Unable to handle next step');
    }
  }
};
