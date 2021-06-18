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


const { IdxFeature } = require('@okta/okta-auth-js');
const renderTemplate = require('./renderTemplate');
const { getLoginFlow, getLoginAction, getFlowTitle, getCodePath } = require('./flow');

module.exports = function renderEntryPage(req, res) {
  // Get states from session
  const transaction = req.getIdxStates();
  const { enabledFeatures, availableSteps } = transaction;
  const flows = req.getFlows();
  req.clearFlows();

  // Prepare render params
  const flow = flows.redirect ? flows.redirect : flows.entry;
  const codePath = getCodePath(flow);
  const title = getFlowTitle(flow);
  const loginFlow = getLoginFlow(transaction);
  const loginAction = getLoginAction(loginFlow);
  const identify = availableSteps.find(({ name }) => name === 'identify');
  const loginInputs = identify && identify.inputs
    .map(({ label, name, secure }) => ({ label, name, type: secure ? 'password' : 'text' }));
  const idps = availableSteps
    .filter(({ name }) => name === 'redirect-idp')
    .map(({ href, idp: { name } }) => ({ name, href }));
  
  

  renderTemplate(req, res, 'entry-page', {
    ...flows,
    codePath,
    title,
    loginAction,
    showLoginForm: !!loginInputs && loginInputs.length,
    loginInputs,
    canRegister: enabledFeatures.includes(IdxFeature.REGISTRATION),
    canRecoverPassword: enabledFeatures.includes(IdxFeature.PASSWORD_RECOVERY),
    idps,
  });
}
