/*!
 * Copyright (c) 2021-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */

/* eslint-disable complexity */

module.exports = function getNextRouteFromTransaction ({ nextStep }) {
  let nextRoute;

  const { name, authenticator } = nextStep;
  const { key } = authenticator || {};

  switch (name) {
    // authentication
    case 'identify':
      nextRoute = '/login';
      break;
    // recover password
    case 'identify-recovery':
      nextRoute = '/recover-password';
      break;
    // registration
    case 'enroll-profile':
      nextRoute = '/register';
      break;
    // authenticator authenticate
    case 'select-authenticator-authenticate':
      nextRoute = '/select-authenticator';
      break;
    case 'challenge-authenticator':
      nextRoute = `/challenge-authenticator/${key}`;
      break;
    case 'authenticator-verification-data':
      nextRoute = `/verify-authenticator/${key}`;
      break;
    // authenticator enrollment
    case 'select-authenticator-enroll':
      nextRoute = '/select-authenticator';
      break;
    case 'challenge-poll':
      nextRoute = `/challenge-authenticator/${key}/poll`;
      break;
    case 'enroll-poll':
      nextRoute = `/enroll-authenticator/${key}/poll`;
      break;
    case 'select-enrollment-channel':
      nextRoute = `/enroll-authenticator/${key}/select-enrollment-channel`;
      break;
    case 'enrollment-channel-data':
      nextRoute = `/enroll-authenticator/${key}/enrollment-channel-data`;
      break;
    case 'enroll-authenticator':
      nextRoute = `/enroll-authenticator/${key}`;
      break;
    case 'authenticator-enrollment-data':
      nextRoute = `/enroll-authenticator/${key}/enrollment-data`;
      break;
    // reset password
    case 'reset-authenticator':
      nextRoute = '/reset-password';
      break;
    // unlock account
    case 'unlock-account':
      nextRoute = '/unlock-account';
      break;
    case 'select-authenticator-unlock-account':
      nextRoute = '/select-authenticator-unlock-account';
      break;
    default:
      break;
  }
  return nextRoute;
};
