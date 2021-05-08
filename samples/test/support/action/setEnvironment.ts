/**
 * Set a test environment by name. Test environments are stored in the `testenv.yml` file in the workspace root
 * @param  {String}   envName    The name of the test environment
 */

const env = require('@okta/env');
import waitForDisplayed from '../wait/waitForDisplayed';
import Home from '../selectors/Home';
import startApp from './startApp';

export default async (envName: string) => {
  // update variables for runner process
  env.setEnvironmentVarsFromTestEnvYaml(envName);

  // update variables for server process
  await startApp('/', { testenv: envName });
  await waitForDisplayed(Home.serverConfig, false);
};
