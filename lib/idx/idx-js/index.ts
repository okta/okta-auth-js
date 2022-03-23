/*!
 * Copyright (c) 2021-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

// @ts-nocheck
import introspect from './introspect';
import interact from './interact';
import parsersForVersion from './parsers';
import { HttpClient } from './client';

const LATEST_SUPPORTED_IDX_API_VERSION = '1.0.0';

const { makeIdxState } = parsersForVersion(LATEST_SUPPORTED_IDX_API_VERSION);

export default {
  introspect,
  interact,
  makeIdxState,
  client: HttpClient,
  LATEST_SUPPORTED_IDX_API_VERSION,
};
