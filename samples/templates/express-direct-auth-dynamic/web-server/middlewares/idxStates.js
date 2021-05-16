module.exports = function idxStates(req, res, next) {

  req.getIdxStates = () => {
    return req.session.idxStates;
  };
  
  req.setIdxStates = (idxStates) => {
    req.session.idxStates = idxStates;
  };
  
  req.clearIdxStates = () => {
    delete req.session.idxStates;
  };

  next();
};
