var util = require('./util');

function setCookie(name, value, expiresAt) {
  var expiresText = '';
  if (expiresAt) {
    expiresText = ' expires=' + util.isoToUTCString(expiresAt) + ';';
  }

  var cookieText = name + '=' + value + '; path=/;' + expiresText;
  setCookie._setDocumentCookie(cookieText);

  return cookieText;
}

// Exposed for testing
setCookie._setDocumentCookie = function(cookieText) {
  document.cookie = cookieText;
};

function getCookie(name) {
  var pattern = new RegExp(name + '=([^;]*)'),
      matched = getCookie._getDocumentCookie().match(pattern);

  if (matched) {
    var cookie = matched[1];
    return cookie;
  }
}

// Exposed for testing
getCookie._getDocumentCookie = function() {
  return document.cookie;
};

function deleteCookie(name) {
  setCookie(name, '', '1970-01-01T00:00:00Z');
}

module.exports = {
  setCookie: setCookie,
  getCookie: getCookie,
  deleteCookie: deleteCookie
};
