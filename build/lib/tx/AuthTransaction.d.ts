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
import { TransactionState } from './TransactionState';
import { IdxStatus } from '../idx/types';
declare type AuthTransactionFunction = (obj?: any) => Promise<AuthTransaction>;
interface AuthTransactionFunctions {
    next?: AuthTransactionFunction;
    cancel?: AuthTransactionFunction;
    skip?: AuthTransactionFunction;
    unlock?: AuthTransactionFunction;
    changePassword?: AuthTransactionFunction;
    resetPassword?: AuthTransactionFunction;
    answer?: AuthTransactionFunction;
    recovery?: AuthTransactionFunction;
    verify?: AuthTransactionFunction;
    resend?: AuthTransactionFunction;
    activate?: AuthTransactionFunction;
    poll?: AuthTransactionFunction;
    prev?: AuthTransactionFunction;
}
export declare class AuthTransaction implements TransactionState, AuthTransactionFunctions {
    next?: AuthTransactionFunction;
    cancel?: AuthTransactionFunction;
    skip?: AuthTransactionFunction;
    unlock?: AuthTransactionFunction;
    changePassword?: AuthTransactionFunction;
    resetPassword?: AuthTransactionFunction;
    answer?: AuthTransactionFunction;
    recovery?: AuthTransactionFunction;
    verify?: AuthTransactionFunction;
    resend?: AuthTransactionFunction;
    activate?: AuthTransactionFunction;
    poll?: AuthTransactionFunction;
    prev?: AuthTransactionFunction;
    data: TransactionState;
    stateToken?: string;
    sessionToken?: string;
    status: string | IdxStatus;
    user?: Record<string, any>;
    factor?: Record<string, any>;
    factors?: Array<Record<string, any>>;
    policy?: Record<string, any>;
    scopes?: Array<Record<string, any>>;
    target?: Record<string, any>;
    authentication?: Record<string, any>;
    constructor(sdk: any, res?: any);
}
export {};
