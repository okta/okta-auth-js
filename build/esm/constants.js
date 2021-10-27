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
export var STATE_TOKEN_KEY_NAME = 'oktaStateToken';
export var DEFAULT_POLLING_DELAY = 500;
export var DEFAULT_MAX_CLOCK_SKEW = 300;
export var DEFAULT_CACHE_DURATION = 86400;
export var REDIRECT_OAUTH_PARAMS_NAME = 'okta-oauth-redirect-params';
export var REDIRECT_STATE_COOKIE_NAME = 'okta-oauth-state';
export var REDIRECT_NONCE_COOKIE_NAME = 'okta-oauth-nonce';
export var TOKEN_STORAGE_NAME = 'okta-token-storage';
export var CACHE_STORAGE_NAME = 'okta-cache-storage';
export var PKCE_STORAGE_NAME = 'okta-pkce-storage';
export var TRANSACTION_STORAGE_NAME = 'okta-transaction-storage';
export var IDX_RESPONSE_STORAGE_NAME = 'okta-idx-response-storage';
export var ACCESS_TOKEN_STORAGE_KEY = 'accessToken';
export var ID_TOKEN_STORAGE_KEY = 'idToken';
export var REFRESH_TOKEN_STORAGE_KEY = 'refreshToken';
export var REFERRER_PATH_STORAGE_KEY = 'referrerPath'; // Code verifier: Random URL-safe string with a minimum length of 43 characters.
// Code challenge: Base64 URL-encoded SHA-256 hash of the code verifier.

export var MIN_VERIFIER_LENGTH = 43;
export var MAX_VERIFIER_LENGTH = 128;
export var DEFAULT_CODE_CHALLENGE_METHOD = 'S256';
export var IDX_API_VERSION = '1.0.0';
//# sourceMappingURL=constants.js.map