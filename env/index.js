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

const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const TESTENV_FILE = 'testenv';

function setEnvironmentVars(envConfig) {
  Object.keys(envConfig).forEach((k) => {
    if (process.env[k] !== envConfig[k]) {
      console.log(`Setting a new value for environment variable "${k}"`);
    }
    process.env[k] = envConfig[k];
  });  
}

function getPath(currDir = __dirname) {
  let res, prevDir;
  // stop when find testenv file or reach to root dir
  while (!fs.existsSync(res) && currDir !== prevDir)  {
    prevDir = currDir;
    currDir = path.resolve(currDir, '..');
    res = path.resolve(currDir, TESTENV_FILE);
  }
  return fs.existsSync(res) ? res : null;
}

function setEnvironmentVarsFromTestEnv(currDir) {
  const testEnvPath = getPath(currDir);
  if (!testEnvPath) {
    return;
  }
  const envConfig = dotenv.parse(fs.readFileSync(testEnvPath));
  setEnvironmentVars(envConfig);
}

module.exports = {
  setEnvironmentVarsFromTestEnv
};
