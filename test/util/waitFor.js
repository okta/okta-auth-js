var POLL_INTERVAL = 10; // ms

/* global Promise */
function waitFor(conditionFn) {
  return new Promise(function(resolve, reject) {

    function checkCondition() {
      var res = conditionFn();
      if (res && res.then && res.catch) {
        // result was a promise. wait for it to resolve
        res
        .then(function(promiseRes) {
          resolve(promiseRes);
        })
        .catch(function(err) {
          reject(err)
        })
        return;
      }

      if (res) {
        resolve(res);
      }

      // result was false, poll and try again
      setTimeout(checkCondition, POLL_INTERVAL);
    }

    checkCondition();
  })
}

module.exports = waitFor;
