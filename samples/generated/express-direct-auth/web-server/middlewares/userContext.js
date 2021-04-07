module.exports = function userContext(req, res, next) {
  if (req.session.userContext) {
    try {
      req.userContext = JSON.parse(req.session.userContext);
    } catch (err) {
      console.log('Failed to parse userContext from session');
    }
  }
  
  next();
};
