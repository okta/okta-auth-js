// Throw an error if any test tries to make a live network request
global.fetch = function(url) {
  throw new Error(`Attempt to make a live network request: ${url}`);
};
