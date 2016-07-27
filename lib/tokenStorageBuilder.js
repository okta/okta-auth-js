var AuthSdkError = require('./errors/AuthSdkError');
var config = require('./config');

// storage must have getItem and setItem
function tokenStorageBuilder(storage) {
  function getTokenStorage() {
    var tokenStorageString = storage.getItem(config.TOKEN_STORAGE_NAME);
    tokenStorageString = tokenStorageString || '{}';
    try {
      return JSON.parse(tokenStorageString);
    } catch(e) {
      throw new AuthSdkError('Unable to parse token storage string');
    }
  }

  function setTokenStorage(tokenStorage) {
    try {
      var tokenStorageString = JSON.stringify(tokenStorage);
      storage.setItem(config.TOKEN_STORAGE_NAME, tokenStorageString);
    } catch(e) {
      throw new AuthSdkError('Unable to set token storage string');
    }
  }

  function clearTokenStorage() {
    setTokenStorage({});
  }

  return {
    getTokenStorage: getTokenStorage,
    setTokenStorage: setTokenStorage,
    clearTokenStorage: clearTokenStorage
  };
}

module.exports = tokenStorageBuilder;
