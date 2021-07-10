---
to: ../generated/<%= dest %>/src/setupTests.js
---
<%- include(`${templates}/${generator}/license-banner.t`) %>

const env = require('../env');

env.setEnvironmentVarsFromTestEnv();
