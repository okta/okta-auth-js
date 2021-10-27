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
import StorageManager from './StorageManager';
import { TransactionMeta, PKCETransactionMeta, OAuthTransactionMeta, TransactionMetaOptions, TransactionManagerOptions } from './types';
import { RawIdxResponse } from './idx/types/idx-js';
export default class TransactionManager {
    options: TransactionManagerOptions;
    storageManager: StorageManager;
    legacyWidgetSupport: boolean;
    saveNonceCookie: boolean;
    saveStateCookie: boolean;
    saveParamsCookie: boolean;
    constructor(options: TransactionManagerOptions);
    clear(options?: TransactionMetaOptions): void;
    save(meta: TransactionMeta, options?: TransactionMetaOptions): void;
    exists(options?: TransactionMetaOptions): boolean;
    load(options?: TransactionMetaOptions): TransactionMeta;
    clearLegacyPKCE(): void;
    loadLegacyPKCE(): PKCETransactionMeta;
    clearLegacyOAuthParams(): void;
    loadLegacyOAuthParams(): OAuthTransactionMeta;
    saveIdxResponse(idxResponse: RawIdxResponse): void;
    loadIdxResponse(): RawIdxResponse;
}
