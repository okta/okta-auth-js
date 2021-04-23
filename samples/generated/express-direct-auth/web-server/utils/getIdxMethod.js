const map = {
  'login': 'authenticate',
  'signup': 'register',
  'recover-password': 'recoverPassword',
};

module.exports = function getIdxMethod(flow) {
  return map[flow];
};
