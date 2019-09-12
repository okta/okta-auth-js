/* global window */
var karma = window.__karma__;
var testsContext = require.context('./spec', true, /.*\.js$/);

testsContext.keys().forEach(function(key) {
  // Filtered List
  if (karma.config.test && !key.includes(karma.config.test)) {
    return;
  }
  testsContext(key);
});
