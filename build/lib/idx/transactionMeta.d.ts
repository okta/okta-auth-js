/*!
 * Copyright (c) 2021, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
import { OktaAuth, IdxTransactionMeta } from '../types';
export declare function createTransactionMeta(authClient: OktaAuth): Promise<import("../types").TokenParams>;
export declare function transactionMetaExist(authClient: OktaAuth): boolean;
export declare function getTransactionMeta(authClient: OktaAuth): Promise<IdxTransactionMeta>;
export declare function saveTransactionMeta(authClient: OktaAuth, meta: any): void;
export declare function clearTransactionMeta(authClient: OktaAuth): void;
export declare function isTransactionMetaValid(authClient: OktaAuth, meta: any): boolean;
