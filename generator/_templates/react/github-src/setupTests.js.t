---
to: ../generated/<%= dest %>/<%= name %>/src/setupTests.js
---
const env = require('../env')();
env.setEnvironmentVarsFromTestEnv(); // Set environment variables from "testenv" file
