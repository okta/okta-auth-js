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
export declare function isBrowser(): boolean;
export declare function isIE11OrLess(): boolean;
export declare function getUserAgent(): string;
export declare function isFingerprintSupported(): boolean;
export declare function isPopupPostMessageSupported(): boolean;
export declare function isTokenVerifySupported(): boolean;
export declare function hasTextEncoder(): boolean;
export declare function isPKCESupported(): boolean;
export declare function isHTTPS(): boolean;
export declare function isLocalhost(): boolean;
