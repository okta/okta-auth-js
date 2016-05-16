var util = require('./util');

function setCookie(name, value, expiresAt) {
  var expiresText = '';
  if (expiresAt) {
    expiresText = ' expires=' + util.isoToUTCString(expiresAt) + ';';
  }

  var cookieText = name + '=' + value + ';' + expiresText;
  document.cookie = cookieText;

  return cookieText;
}

function getCookie(name) {
  var pattern = new RegExp(name + '=([^;]*)'),
      matched = document.cookie.match(pattern);

  if (matched) {
    var cookie = matched[1];
    return cookie;
  }
}

function deleteCookie(name) {
  setCookie(name, '', '1970-01-01T00:00:00Z');
}

module.exports = {
  setCookie: setCookie,
  getCookie: getCookie,
  deleteCookie: deleteCookie
};
