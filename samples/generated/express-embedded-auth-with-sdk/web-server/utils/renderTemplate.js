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


const renderMessages = require('./renderMessages');
const getFormActionPath = require('./getFormActionPath');

module.exports = function renderTemplate(req, res, template, options = {}) {
  const { transactionId } = req;
  const { 
    idx: { 
      messages,
      nextStep: {
        authenticator: {
          contextualData
        } = {},
        authenticatorEnrollments
      } = {}
    } = {} 
  } = req.getFlowStates();
  const hasContextualDataForAuthenticator = contextualData?.qrcode || contextualData?.sharedSecret;
  const authenticatorEnrollmentsJSON = authenticatorEnrollments ? JSON.stringify(authenticatorEnrollments) : null;
  const activationData = contextualData ? JSON.stringify(contextualData.activationData) : null;
  const challengeData = contextualData ? JSON.stringify(contextualData.challengeData) : null;
  options = { 
    ...options, 
    action: getFormActionPath(req, options.action),
    skipAction: getFormActionPath(req, options.skipAction),
    resendAction: getFormActionPath(req, options.resendAction),
    cancelAction: getFormActionPath(req, '/cancel'),
    selectStepAction: getFormActionPath(req, options.selectStepAction),
    contextualData,
    hasContextualDataForAuthenticator,
    activationData,
    challengeData,
    authenticatorEnrollments: authenticatorEnrollmentsJSON,
    transactionId
  };
  
  if (messages && messages.length) {
    renderMessages(res, {
      template,
      messages,
      ...options,
    });
    return;
  }
  res.render(template, options);
};
