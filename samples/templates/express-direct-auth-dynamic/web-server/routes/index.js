const login = require('./login');
const basicLogin = require('./basic-login');
const multifactorLogin = require('./multifactor-login');
const logout = require('./logout');
const signup = require('./signup');
const recoverPassword = require('./recover-password');
const cancel = require('./cancel');
const home = require('./home');
const protected = require('./protected');
const terminal = require('./terminal');

module.exports = [
  basicLogin,
  multifactorLogin,
  login,
  logout,
  signup,
  recoverPassword,
  cancel,
  home,
  protected,
  terminal,
];
