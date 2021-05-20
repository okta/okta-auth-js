const flow = require('./flow');
const login = require('./login');
const basicLogin = require('./basic-login');
const multifactorLogin = require('./multifactor-login');
const logout = require('./logout');
const signup = require('./signup');
const recoverPassword = require('./recover-password');
const socialIdp = require('./social-idp');
const cancel = require('./cancel');
const home = require('./home');
const protected = require('./protected');
const terminal = require('./terminal');

module.exports = [
  flow,
  basicLogin,
  multifactorLogin,
  login,
  signup,
  recoverPassword,
  socialIdp,
  logout,
  cancel,
  home,
  protected,
  terminal,
];
