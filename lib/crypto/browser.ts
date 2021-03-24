/* global atob, btoa, crypto */
const a = function(str) { return atob(str); };
const b = function (str) { return btoa(str); };
const c = crypto;

export { a as atob, b as btoa, c as webcrypto };
