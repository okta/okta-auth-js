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

import * as constants from '../constants';

export declare class EventEmitter {
  on   (event: string, callback: (...args: any[]) => any, ctx?: any): EventEmitter;
  once (event: string, callback: (...args: any[]) => any, ctx?: any): EventEmitter;
  emit (event: string, ...args: any[]): EventEmitter;
  off  (event: string, callback?: (...args: any[]) => any): EventEmitter;
}

export interface FeaturesAPI {
  isLocalhost(): boolean;
  isHTTPS(): boolean;
  isPopupPostMessageSupported(): boolean;
  hasTextEncoder(): boolean;
  isTokenVerifySupported(): boolean;
  isPKCESupported(): boolean;
  isIE11OrLess(): boolean;
  isDPoPSupported(): boolean;
  isIOS(): boolean;
  isMobileSafari18(): boolean;
}


export interface FingerprintOptions {
  timeout?: number;
  container?: Element | null;
}
export type FingerprintAPI = (options?: FingerprintOptions) => Promise<string>;

// options that can be passed to AuthJS
export interface OktaAuthBaseOptions {
  devMode?: boolean;
}

// a class that constructs options
export interface OktaAuthOptionsConstructor<O extends OktaAuthBaseOptions = OktaAuthBaseOptions> {
  new(args: any): O;
}

// a "base" instance of AuthJS
export interface OktaAuthBaseInterface<O extends OktaAuthBaseOptions = OktaAuthBaseOptions> {
  options: O;
  emitter: EventEmitter;
  features: FeaturesAPI;
}

// a constructor that returns an instance of AuthJS
export interface OktaAuthConstructor
<
  I extends OktaAuthBaseInterface = OktaAuthBaseInterface
> 
{
  new(...args: any[]): I;
  features: FeaturesAPI; // static class member
  constants: typeof constants;
}
