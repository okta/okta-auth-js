module.exports = function flowStates(req, res, next) {

  req.getFlowStates = () => {
    const { transactionId } = req;
    return req.session[transactionId].flowStates;
  };
  
  req.setFlowStates = (states) => {
    const { transactionId } = req;
    if (!req.session[transactionId]) {
      req.session[transactionId] = {};
    }
    req.session[transactionId].flowStates = states;
  };
  
  req.clearFlowStates = () => {
    const { transactionId } = req;
    if (req.session[transactionId]) {
      delete req.session[transactionId];
    }
  };

  next();
};
