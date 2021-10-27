"use strict";

var _node = require("./node");

Object.keys(_node).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _node[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _node[key];
    }
  });
});
//# sourceMappingURL=webcrypto.js.map