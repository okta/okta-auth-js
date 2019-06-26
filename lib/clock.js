function SdkClock(localOffset) {
  // Calculated local clock offset from server time (in milliseconds). Can be positive or negative.
  this.localOffset = parseInt(localOffset || 0);
}

Object.assign(SdkClock.prototype, {
  // Return the current time (in seconds)
  now: function() {
    var now = (Date.now() + this.localOffset) / 1000;
    return now;
  }
});

SdkClock.create = function(/* sdk, options */) {
  // TODO: calculate localOffset
  return new SdkClock();
};

module.exports = SdkClock;
