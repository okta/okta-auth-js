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
import { AuthState, AuthStateLogOptions } from './types';
import { OktaAuth } from '.';
declare const PCancelable: any;
export declare const INITIAL_AUTH_STATE: any;
export declare class AuthStateManager {
    _sdk: OktaAuth;
    _pending: {
        updateAuthStatePromise: typeof PCancelable;
        canceledTimes: number;
    };
    _authState: AuthState;
    _logOptions: AuthStateLogOptions;
    _lastEventTimestamp: number;
    constructor(sdk: OktaAuth);
    _setLogOptions(options: any): void;
    getAuthState(): AuthState;
    updateAuthState(): Promise<AuthState>;
    subscribe(handler: any): void;
    unsubscribe(handler?: any): void;
}
export {};
