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

function getValidUrl(args) {
  if (!args) {
    throw new AuthSdkError('No arguments passed to constructor. ' +
      'Required usage: new OktaAuth(args)');
  }

  var url = args.url;
  if (!url) {
    var isUrlRegex = new RegExp('^http?s?://.+');
    if (args.issuer && isUrlRegex.test(args.issuer)) {
      // Infer the URL from the issuer URL, omitting the /oauth2/{authServerId}
      url = args.issuer.split('/oauth2/')[0];
    } else {
      throw new AuthSdkError('No url passed to constructor. ' +
      'Required usage: new OktaAuth({url: "https://{yourOktaDomain}.com"})');
    }
  }

  if (url.indexOf('-admin.') !== -1) {
    throw new AuthSdkError('URL passed to constructor contains "-admin" in subdomain. ' +
      'Required usage: new OktaAuth({url: "https://{yourOktaDomain}.com})');
  }

  return url;
}

function addSharedPrototypes(proto) {
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

module.exports = {
  addSharedPrototypes: addSharedPrototypes,
  buildOktaAuth: buildOktaAuth,
  getValidUrl: getValidUrl
};
