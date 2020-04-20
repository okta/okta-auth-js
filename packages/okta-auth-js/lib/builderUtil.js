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

var AuthSdkError = require('./errors/AuthSdkError');
var tx = require('./tx');
var util = require('./util');

// TODO: use @okta/configuration-validation (move module to this monorepo?)
// eslint-disable-next-line complexity
function assertValidConfig(args) {
  if (!args) {
    throw new AuthSdkError('No arguments passed to constructor. ' +
      'Required usage: new OktaAuth(args)');
  }

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

function addSharedPrototypes(proto) {
  proto.getIssuerOrigin = function() {
    // Infer the URL from the issuer URL, omitting the /oauth2/{authServerId}
    return this.options.issuer.split('/oauth2/')[0];
  };

  // { username, (relayState) }
  proto.forgotPassword = function (opts) {
    return tx.postToTransaction(this, '/api/v1/authn/recovery/password', opts);
  };

  // { username, (relayState) }
  proto.unlockAccount = function (opts) {
    return tx.postToTransaction(this, '/api/v1/authn/recovery/unlock', opts);
  };

  // { recoveryToken }
  proto.verifyRecoveryToken = function (opts) {
    return tx.postToTransaction(this, '/api/v1/authn/recovery/token', opts);
  };
}

function buildOktaAuth(OktaAuthBuilder) {
  return function(storageUtil, httpRequestClient) {
    function OktaAuth(args) {
      if (!(this instanceof OktaAuth)) {
        return new OktaAuth(args);
      }

      if (args) {
        args.storageUtil = storageUtil;

        if (args.ajaxRequest) {
          util.deprecate('ajaxRequest is being deprecated, use httpRequestClient attribute instead.');
          args.httpRequestClient = args.ajaxRequest;
        } else if (!args.httpRequestClient) {
          args.httpRequestClient = httpRequestClient;
        }
      }

      util.bind(OktaAuthBuilder, this)(args);
    }
    OktaAuth.prototype = OktaAuthBuilder.prototype;
    OktaAuth.prototype.constructor = OktaAuth;

    // Hoist feature detection functions to static type
    OktaAuth.features = OktaAuthBuilder.prototype.features;

    return OktaAuth;
  };
}

function getUserAgent(args, sdkVersion) {
  var userAgent = args.userAgent;

  if (!userAgent) {
    return '';
  }

  if (userAgent.value) {
    return userAgent.value;
  }

  if (userAgent.template) {
    return userAgent.template.replace('$OKTA_AUTH_JS', `okta-auth-js/${sdkVersion}`);
  }

  return '';
}

module.exports = {
  addSharedPrototypes: addSharedPrototypes,
  buildOktaAuth: buildOktaAuth,
  assertValidConfig: assertValidConfig,
  getUserAgent: getUserAgent
};
