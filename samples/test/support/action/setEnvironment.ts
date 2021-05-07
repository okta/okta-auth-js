/**
 * Set a test environment by name. Test environments are stored in the `testenv.yml` file in the workspace root
 * @param  {String}   envName    The name of the test environment
 */

const env = require('@okta/env');

export default (envName: string) => {
  env.setEnvironmentVarsFromTestEnvYaml(envName);
};
