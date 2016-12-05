var cookies = require('./cookies');
var storageBuilder = require('./storageBuilder');
var config = require('./config');

// Building this as an object allows us to mock the functions in our tests
var storageUtil = {};

// IE11 bug that Microsoft doesn't plan to fix
// https://connect.microsoft.com/IE/Feedback/Details/1496040
storageUtil.browserHasLocalStorage = function() {
  try {
    if (storageUtil.getLocalStorage()) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
};

storageUtil.browserHasSessionStorage = function() {
  try {
    if (storageUtil.getSessionStorage()) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
};

storageUtil.getHttpCache = function() {
  if (storageUtil.browserHasLocalStorage()) {
    return storageBuilder(storageUtil.getLocalStorage(), config.CACHE_STORAGE_NAME);
  } else if (storageUtil.browserHasSessionStorage()) {
    return storageBuilder(storageUtil.getSessionStorage(), config.CACHE_STORAGE_NAME);
  } else {
    return storageBuilder(storageUtil.getCookieStorage(), config.CACHE_STORAGE_NAME);
  }
};

storageUtil.getLocalStorage = function() {
  return localStorage;
};

storageUtil.getSessionStorage = function() {
  return sessionStorage;
};

// Provides webStorage-like interface for cookies
storageUtil.getCookieStorage = function() {
  return {
    getItem: cookies.getCookie,
    setItem: function(key, value) {
      // Cookie shouldn't expire
      cookies.setCookie(key, value, '2038-01-19T03:14:07.000Z');
    }
  };
};

module.exports = storageUtil;
