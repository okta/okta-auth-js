/*!
 * Copyright (c) 2018-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import AuthSdkError from './errors/AuthSdkError';

// TODO: use @okta/configuration-validation (move module to this monorepo?)
// eslint-disable-next-line complexity
function assertValidConfig(args) {
  args = args || {};

  var issuer = args.issuer;
  if (!issuer) {
    throw new AuthSdkError('No issuer passed to constructor. ' + 
      'Required usage: new OktaAuth({issuer: "https://{yourOktaDomain}.com/oauth2/{authServerId}"})');
  }

  var isUrlRegex = new RegExp('^http?s?://.+');
  if (!isUrlRegex.test(args.issuer)) {
    throw new AuthSdkError('Issuer must be a valid URL. ' + 
      'Required usage: new OktaAuth({issuer: "https://{yourOktaDomain}.com/oauth2/{authServerId}"})');
  }

  if (issuer.indexOf('-admin.') !== -1) {
    throw new AuthSdkError('Issuer URL passed to constructor contains "-admin" in subdomain. ' +
      'Required usage: new OktaAuth({issuer: "https://{yourOktaDomain}.com})');
  }

  var userAgent = args.userAgent;
  var userAgentTemplateWithNoPlaceholder = 
    userAgent && userAgent.template && userAgent.template.indexOf('$OKTA_AUTH_JS') === -1;
  if (userAgentTemplateWithNoPlaceholder) {
    throw new AuthSdkError('UserAgentTemplate must include "$OKTA_AUTH_JS" placeholder. ' + 
      'Required usage: new OktaAuth({userAgentTemplate: "xxx $OKTA_AUTH_JS xxx"})');
  }
}

function getUserAgent(args, sdkValue) {
  var userAgent = args.userAgent || {};

  if (userAgent.value) {
    return userAgent.value;
  }

  if (userAgent.template) {
    return userAgent.template.replace('$OKTA_AUTH_JS', sdkValue);
  }

  return sdkValue;
}

export {
  assertValidConfig,
  getUserAgent
};
