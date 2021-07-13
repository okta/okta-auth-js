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


import { getConfig } from './configUtils';
import toQueryString from './toQueryString';

async function startApp(App, options) {
  await App.open(Object.assign({}, getConfig(), options));
}

function getAppUrl(basePath = '/', queryParams = {}) {
  const query = toQueryString(Object.assign({}, getConfig(), queryParams));
  return basePath + query;
  
}

export { startApp, getAppUrl };
