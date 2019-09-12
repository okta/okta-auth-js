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

var AuthSdkError = require('./errors/AuthSdkError');

// storage must have getItem and setItem
function storageBuilder(webstorage, storageName) {
  if (typeof storageName !== 'string' || !storageName.length) {
    throw new AuthSdkError('"storageName" is required');
  }

  function getStorage() {
    var storageString = webstorage.getItem(storageName);
    storageString = storageString || '{}';
    try {
      return JSON.parse(storageString);
    } catch(e) {
      throw new AuthSdkError('Unable to parse storage string: ' + storageName);
    }
  }

  function setStorage(storage) {
    try {
      var storageString = JSON.stringify(storage);
      webstorage.setItem(storageName, storageString);
    } catch(e) {
      throw new AuthSdkError('Unable to set storage: ' + storageName);
    }
  }

  function clearStorage(key) {
    if (!key) {
      setStorage({});
    }
    var storage = getStorage();
    delete storage[key];
    setStorage(storage);
  }

  function updateStorage(key, value) {
    var storage = getStorage();
    storage[key] = value;
    setStorage(storage);
  }

  return {
    getStorage: getStorage,
    setStorage: setStorage,
    clearStorage: clearStorage,
    updateStorage: updateStorage
  };
}

module.exports = storageBuilder;
