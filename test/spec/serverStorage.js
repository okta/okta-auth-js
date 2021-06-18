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


import _serverStorage from '../../lib/server/serverStorage';

const serverStorage = _serverStorage.storage;

describe('serverStorage', function () {
  describe('get', function () {
    it('correctly returns value from storage if key is found', function () {
      serverStorage.set('testKey', 'testValue');
      expect(serverStorage.get('testKey')).toBe('testValue');
    });

    it('correctly returns undefined if key is not found in storage', function () {
      serverStorage.set('testKey', 'testValue');
      expect(serverStorage.get('unstoredKey')).toBe(undefined);
    });

    it('correctly returns undefined if key value pair in storage is expired', function () {
      serverStorage.set('testKey', 'testValue', '2015-08-21T19:54:48.486Z');
      expect(serverStorage.get('testKey')).toBe(undefined);
    });

  });

  describe('set', function () {
    it('correctly sets a new key value pair in storage', function () {
      serverStorage.set('newKey', 'newValue');
      expect(serverStorage.get('newKey')).toBe('newValue');
    });

    it('correctly overrides the value of an existing key in storage', function () {
      serverStorage.set('testKey', 'oldValue');
      expect(serverStorage.get('testKey')).toBe('oldValue');
      serverStorage.set('testKey', 'newValue');
      expect(serverStorage.get('testKey')).toBe('newValue');
    });
  });

  describe('delete', function () {
    it('correctly deletes a key value pair from storage if the key is found', function () {
      serverStorage.set('testKey', 'testValue');
      expect(serverStorage.get('testKey')).toBe('testValue');
      expect(serverStorage.delete('testKey')).toBe(1);
      expect(serverStorage.get('testKey')).toBe(undefined);
    });

    it('does not delete anything if the key is not found in storage', function () {
      serverStorage.set('testKey', 'testValue');
      expect(serverStorage.delete('unstoredKey')).toBe(0);
    });
  });
});
