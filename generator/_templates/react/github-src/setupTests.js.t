---
to: ../generated/<%= dest %>/<%= name %>/src/setupTests.js
---
<%- include(`${templates}/${generator}/license-banner.t`) %>

const env = require('../env')();
env.setEnvironmentVarsFromTestEnv(); // Set environment variables from "testenv" file
