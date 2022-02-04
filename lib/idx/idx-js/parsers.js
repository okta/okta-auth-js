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


// We load all the current parsers, because we won't know in advance which version(s) we need to parse
// Expect to only support current major - 1 (also suspect that this limit may never be hit)

// @ts-nocheck
import v1 from './v1/parsers'; // More granularity to be defined as needed

const parsersForVersion = function parsersForVersion( version ) {
  switch (version) {
    case '1.0.0':
      return v1;
    case undefined:
    case null:
      throw new Error('Api version is required');
    default:
      throw new Error(`Unknown api version: ${version}.  Use an exact semver version.`);
  }
};

export default parsersForVersion;
