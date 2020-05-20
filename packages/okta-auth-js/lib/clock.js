/**
 * @class
 * @param {any} localOffset 
 */
function SdkClock(localOffset) {
  // Calculated local clock offset from server time (in milliseconds). Can be positive or negative.
  this.localOffset = parseInt(localOffset || 0);
}

// Return the current time (in seconds)
SdkClock.prototype.now = function() {
  var now = (Date.now() + this.localOffset) / 1000;
  return now;
};

// factory method. Create an instance of a clock from current context.
SdkClock.create = function(/* sdk, options */) {
  // TODO: calculate localOffset
  var localOffset = 0;
  return new SdkClock(localOffset);
};

module.exports = SdkClock;
