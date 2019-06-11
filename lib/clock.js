function getLocalAdjustedTime(sdk) {
  var localClockOffset = parseInt(sdk.options.localClockOffset || 0);
  var now = (Date.now() + localClockOffset) / 1000;
  return now;
}

module.exports = {
  getLocalAdjustedTime: getLocalAdjustedTime
};
