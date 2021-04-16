module.exports = function lastError(req, res, next) {

  req.getLastError = function getLastError() {
    return req.session.lastError;
  };
  
  req.setLastError = function setLastError(error) {
    req.session.lastError = error;
  };
  
  req.clearLastError = function clearLastError() {
    delete req.session.lastError;
  };

  next();
};
