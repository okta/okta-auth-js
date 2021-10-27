"use strict";

var _FlowMonitor = require("./FlowMonitor");

Object.keys(_FlowMonitor).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _FlowMonitor[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _FlowMonitor[key];
    }
  });
});

var _RegistrationFlowMonitor = require("./RegistrationFlowMonitor");

Object.keys(_RegistrationFlowMonitor).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _RegistrationFlowMonitor[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _RegistrationFlowMonitor[key];
    }
  });
});

var _AuthenticationFlowMonitor = require("./AuthenticationFlowMonitor");

Object.keys(_AuthenticationFlowMonitor).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _AuthenticationFlowMonitor[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _AuthenticationFlowMonitor[key];
    }
  });
});

var _PasswordRecoveryFlowMonitor = require("./PasswordRecoveryFlowMonitor");

Object.keys(_PasswordRecoveryFlowMonitor).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _PasswordRecoveryFlowMonitor[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _PasswordRecoveryFlowMonitor[key];
    }
  });
});
//# sourceMappingURL=index.js.map