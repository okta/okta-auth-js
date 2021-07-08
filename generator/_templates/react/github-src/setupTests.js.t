---
to: ../generated/<%= dest %>/<%= name %>/src/setupTests.js
force: true
---
const env = require('../env')();
env.setEnvironmentVarsFromTestEnv(); // Set environment variables from "testenv" file
