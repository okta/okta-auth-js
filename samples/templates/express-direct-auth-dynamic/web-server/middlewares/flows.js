module.exports = function flows(req, res, next) {

  req.getFlows = () => {
    return req.session.flows;
  };
  
  req.setFlows = (flows) => {
    req.session.flows = flows;
  };
  
  req.clearFlows = () => {
    delete req.session.flows;
  };

  next();
};
