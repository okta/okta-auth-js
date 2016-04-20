/* globals define, beforeEach, jasmine */
define(function(require) {
  var _ = require('lodash');

  beforeEach(function () {
    jasmine.addMatchers({
      toHaveAllKeys: function () {
        return {
          compare: function (object, expectedKeys) {
            return {
              pass: _.difference(_.keys(object), expectedKeys).length === 0
            };
          }
        };
      },
      toDeepEqual: function () {
        return {
          compare: function (actual, expected) {
            return {
              pass: _.isEqual(actual, expected)
            };
          }
        };
      }
    });
  });
});
