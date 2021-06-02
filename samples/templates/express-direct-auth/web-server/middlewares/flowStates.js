module.exports = function flowStates(req, res, next) {

  const key = `flow-${req.transactionId}`;

  req.getFlowStates = () => {
    return req.session[key] 
        ? req.session[key].flowStates : {};
  };
  
  req.setFlowStates = (states) => {
    if (!req.session[key]) {
      req.session[key] = {};
    }
    req.session[key].flowStates = states;
  };
  
  req.clearFlowStates = () => {
    if (req.session[key]) {
      delete req.session[key];
    }
  };

  next();
};
