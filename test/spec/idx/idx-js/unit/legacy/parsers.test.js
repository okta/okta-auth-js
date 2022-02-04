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

import parsersForVersion from '../../../../../../lib/idx/idx-js/parsers';

describe('parsersForVersion', () => {
  it('is a function', () => {
    expect(typeof parsersForVersion).toBe('function');
  });

  it('requires a version', () => {
    expect( () => parsersForVersion()).toThrow(new Error('Api version is required') );
  });

  it('throws an error on an unsupported version', () => {
    expect( () => parsersForVersion('NOT_A_VERSION')).toThrow(new Error('Unknown api version: NOT_A_VERSION.  Use an exact semver version.') );
  });

  it('returns an object of parsers', () => {
    const parsers = parsersForVersion('1.0.0');
    expect(parsers).toBeDefined();
    expect(parsers.makeIdxState).toBeDefined();
  });
});
