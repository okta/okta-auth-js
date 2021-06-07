const login = require('./login');
const logout = require('./logout');
const register = require('./register');
const recoverPassword = require('./recover-password');
const authenticator = require('./authenticator');
const cancel = require('./cancel');
const home = require('./home');
const terminal = require('./terminal');

module.exports = [
  // idx routes
  login,
  logout,
  register,
  recoverPassword,
  authenticator,
  cancel,

  // general routes
  home,
  terminal,
];
