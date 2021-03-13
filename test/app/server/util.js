const btoa = require('btoa');

// converts a standard base64-encoded string to a "url/filename safe" variant
function base64ToBase64Url(b64) {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// converts a string to base64 (url/filename safe variant)
function stringToBase64Url(str) {
  const b64 = btoa(str);
  return base64ToBase64Url(b64);
}

module.exports = {
  base64ToBase64Url,
  stringToBase64Url
};
