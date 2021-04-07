const login = require('./login');
const logout = require('./logout');
const signup = require('./signup');
const recoverPassword = require('./recover-password');
const cancel = require('./cancel');
const home = require('./home');
const protected = require('./protected');

module.exports = [
  login,
  logout,
  signup,
  recoverPassword,
  cancel,
  home,
  protected,
];
