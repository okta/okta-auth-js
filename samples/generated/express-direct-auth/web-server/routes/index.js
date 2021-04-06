const login = require('./login');
const logout = require('./logout');
const signup = require('./signup');
const home = require('./home');
const protected = require('./protected');

module.exports = [
  login,
  logout,
  signup,
  home,
  protected,
];
