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


const getAuthClient = require('./getAuthClient');
const getAuthTransaction = require('./getAuthTransaction');
const renderMessages = require('./renderMessages');
const handleTransaction = require('./handleTransaction');
const renderTemplate = require('./renderTemplate');
const renderPage = require('./renderPage');
const redirect = require('./redirect');
const getFormActionPath = require('./getFormActionPath');
const {withCatch, routerWithCatch} = require('./withCatch');

module.exports = {
  getAuthClient,
  getAuthTransaction,
  renderMessages,
  handleTransaction,
  renderTemplate,
  renderPage,
  redirect,
  getFormActionPath,
  withCatch,
  routerWithCatch,
};
