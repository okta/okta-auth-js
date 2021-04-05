module.exports = function isAuthenticated(req, res, next) {
  if (req.userContext && req.userContext.userinfo) {
    next();
  } else {
    res.redirect('/login');
  }
};
