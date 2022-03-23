/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


/**
 * Set a test environment by name. Test environments are stored in the `testenv.yml` file in the workspace root
 * @param  {String}   envName    The name of the test environment
 */

const env = require('@okta/env');
import waitForDisplayed from '../wait/waitForDisplayed';
import Home from '../selectors/Home';
import startApp from './startApp';

export default async (envName: string) => {
  envName = {
    'MFA with Password and Email as required': 'Password + Another Factor',
    'MFA with Password and SMS as required': 'Password + Another Factor'
  }[envName] || envName;

  const { 
    ISSUER: issuer, 
    CLIENT_ID: clientId, 
    CLIENT_SECRET: clientSecret 
  } = env.getEnvironmentVarsFromTestEnvYaml(envName, __dirname);

  // update variables for server process
  await startApp('/', {
    ...(issuer && { issuer }),
    ...(clientId && { clientId }),
    ...(clientSecret && { clientSecret }),
  });
  await waitForDisplayed(Home.serverConfig, false);
};
