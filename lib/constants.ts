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

export const STATE_TOKEN_KEY_NAME = 'oktaStateToken';
export const DEFAULT_POLLING_DELAY = 500;
export const DEFAULT_MAX_CLOCK_SKEW = 300;
export const DEFAULT_CACHE_DURATION = 86400;
export const TOKEN_STORAGE_NAME = 'okta-token-storage';
export const CACHE_STORAGE_NAME = 'okta-cache-storage';
export const PKCE_STORAGE_NAME = 'okta-pkce-storage';
export const TRANSACTION_STORAGE_NAME = 'okta-transaction-storage';
export const SHARED_TRANSACTION_STORAGE_NAME = 'okta-shared-transaction-storage';
export const ORIGINAL_URI_STORAGE_NAME = 'okta-original-uri-storage';
export const IDX_RESPONSE_STORAGE_NAME = 'okta-idx-response-storage';
export const ACCESS_TOKEN_STORAGE_KEY = 'accessToken';
export const ID_TOKEN_STORAGE_KEY =  'idToken';
export const REFRESH_TOKEN_STORAGE_KEY =  'refreshToken';
export const REFERRER_PATH_STORAGE_KEY = 'referrerPath';

// Code verifier: Random URL-safe string with a minimum length of 43 characters.
// Code challenge: Base64 URL-encoded SHA-256 hash of the code verifier.
export const MIN_VERIFIER_LENGTH = 43;
export const MAX_VERIFIER_LENGTH = 128;
export const DEFAULT_CODE_CHALLENGE_METHOD = 'S256';

export const IDX_API_VERSION = '1.0.0';