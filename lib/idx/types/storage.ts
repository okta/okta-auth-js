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

import { OAuthStorageManagerInterface } from '../../oidc/types/storage';
import { StorageOptions, StorageProvider } from '../../storage/types';
import { RawIdxResponse } from './idx-js';
import { IdxTransactionMeta } from './meta';
import { IntrospectOptions } from './options';

export interface SavedIdxResponse extends
  Pick<IntrospectOptions,
    'stateHandle' |
    'interactionHandle'
  >
{
  rawIdxResponse: RawIdxResponse;
  requestDidSucceed?: boolean;
}
export interface IdxResponseStorage extends StorageProvider {
  setStorage(obj: SavedIdxResponse): void;
  getStorage(): SavedIdxResponse;
}

export interface IdxStorageManagerInterface<M extends IdxTransactionMeta = IdxTransactionMeta>
  extends OAuthStorageManagerInterface<M>
{
  getIdxResponseStorage(options?: StorageOptions): IdxResponseStorage | null 
}
