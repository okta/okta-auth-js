module.exports = function idxMessages(req, res, next) {

  req.getIdxMessages = () => {
    return req.session.idxMessages;
  };
  
  req.setIdxMessages = (messages) => {
    req.session.idxMessages = messages;
  };
  
  req.clearIdxMessages = () => {
    delete req.session.idxMessages;
  };

  next();
};
