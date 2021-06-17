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


const flowMap = {
  'basic-login': {
    title: 'Login with username and password factor',
    loginAction: '/basic-login',
    codePath: 'src/routes/basic-login.js',
  },
  'multifactor-login': {
    title: 'Login with username and password factor, or Social Provider',
    loginAction: '/multifactor-login',
    codePath: 'src/routes/multifactor-login.js',
  },
  'signup': {
    title: 'Self Service Registration with required email enrollment and optional SMS factor enrollment',
    codePath: 'src/routes/signup.js',
  },
  'recover-password': {
    title: 'Self-Service Password Recovery',
    codePath: 'src/routes/recover-password.js',
  }
}

const getFlowTitle = (flow) => {
  const title = flowMap[flow].title;
  if (!title) {
    throw new Error(`Missing title for ${flow} flow`);
  }
  return title;
}

const getLoginFlow = (transaction) => {
  const { availableSteps } = transaction;
  if (!availableSteps) {
    throw Error('No login flow found');
  }

  const identify = availableSteps.find(({ name }) => name === 'identify');
  if (!identify) {
    if (availableSteps.some(({ name }) => name === 'redirect-idp')) {
      return 'multifactor-login';
    } 
    throw Error('No login flow found');
  }

  const hasPasswordInput = identify.inputs.some(({ name }) => name === 'password');
  return hasPasswordInput ? 'basic-login' : 'multifactor-login';
};

const getRedirectFlow = (entryFlow, transaction) => {
  let flow;
  const { enabledFeatures } = transaction;
  const loginFlow = getLoginFlow(transaction);

  switch (entryFlow) {
    case 'basic-login':
    case 'multifactor-login':
      if (entryFlow !== loginFlow) {
        flow = loginFlow;
      }
      return flow;
    case 'signup':
      if (!enabledFeatures.includes(IdxFeature.REGISTRATION)) {
        flow = loginFlow;
      }
      return flow;
    case 'recover-password':
      if (!enabledFeatures.includes(IdxFeature.PASSWORD_RECOVERY)) {
        flow = loginFlow;
      }
      return flow;
    default:
      return flow;
  }
};

const getLoginAction = (loginFlow) => {
  const action = flowMap[loginFlow].loginAction;
  if (!action) {
    throw new Error(`Missing loginAction for ${loginFlow} flow`);
  }
  return action;
};

const getCodePath = (flow) => {
  const path = flowMap[flow].codePath;
  if (!path) {
    throw new Error(`Missing codePath for ${flow} flow`);
  }
  return path;
};

module.exports = {
  getFlowTitle,
  getLoginFlow,
  getLoginAction,
  getRedirectFlow,
  getCodePath,
};
