"use strict";

var _authenticate = require("./authenticate");

Object.keys(_authenticate).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _authenticate[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _authenticate[key];
    }
  });
});

var _cancel = require("./cancel");

Object.keys(_cancel).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _cancel[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _cancel[key];
    }
  });
});

var _interact = require("./interact");

Object.keys(_interact).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _interact[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _interact[key];
    }
  });
});

var _introspect = require("./introspect");

Object.keys(_introspect).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _introspect[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _introspect[key];
    }
  });
});

var _register = require("./register");

Object.keys(_register).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _register[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _register[key];
    }
  });
});

var _recoverPassword = require("./recoverPassword");

Object.keys(_recoverPassword).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _recoverPassword[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _recoverPassword[key];
    }
  });
});

var _handleInteractionCodeRedirect = require("./handleInteractionCodeRedirect");

Object.keys(_handleInteractionCodeRedirect).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _handleInteractionCodeRedirect[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _handleInteractionCodeRedirect[key];
    }
  });
});

var _startTransaction = require("./startTransaction");

Object.keys(_startTransaction).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _startTransaction[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _startTransaction[key];
    }
  });
});
//# sourceMappingURL=index.js.map