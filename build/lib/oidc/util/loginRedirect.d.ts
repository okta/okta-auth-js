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
 *
 */
import { OktaAuth, OktaAuthOptions } from '../../types';
export declare function hasTokensInHash(hash: string): boolean;
export declare function hasAuthorizationCode(hashOrSearch: string): boolean;
export declare function hasInteractionCode(hashOrSearch: string): boolean;
export declare function hasErrorInUrl(hashOrSearch: string): boolean;
export declare function isRedirectUri(uri: string, sdk: OktaAuth): boolean;
export declare function isCodeFlow(options: OktaAuthOptions): boolean;
export declare function getHashOrSearch(options: OktaAuthOptions): string;
/**
 * Check if tokens or a code have been passed back into the url, which happens in
 * the OIDC (including social auth IDP) redirect flow.
 */
export declare function isLoginRedirect(sdk: OktaAuth): boolean;
/**
 * Check if error=interaction_required has been passed back in the url, which happens in
 * the social auth IDP redirect flow.
 */
export declare function isInteractionRequired(sdk: OktaAuth): boolean;
