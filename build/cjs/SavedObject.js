"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.default = void 0;

var _AuthSdkError = _interopRequireDefault(require("./errors/AuthSdkError"));

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
// formerly known as "storageBuilder". Represents an object saved under a key/name.
class SavedObject {
  constructor(storage, storageName) {
    if (!storage) {
      throw new _AuthSdkError.default('"storage" is required');
    }

    if (typeof storageName !== 'string' || !storageName.length) {
      throw new _AuthSdkError.default('"storageName" is required');
    }

    this.storageName = storageName;
    this.storageProvider = storage;
  } //
  // SimpleStorage interface
  //


  getItem(key) {
    return this.getStorage()[key];
  }

  setItem(key, value) {
    return this.updateStorage(key, value);
  }

  removeItem(key) {
    return this.clearStorage(key);
  } //
  // StorageProvider interface
  //


  getStorage() {
    var storageString = this.storageProvider.getItem(this.storageName);
    storageString = storageString || '{}';

    try {
      return JSON.parse(storageString);
    } catch (e) {
      throw new _AuthSdkError.default('Unable to parse storage string: ' + this.storageName);
    }
  }

  setStorage(obj) {
    try {
      var storageString = obj ? JSON.stringify(obj) : '{}';
      this.storageProvider.setItem(this.storageName, storageString);
    } catch (e) {
      throw new _AuthSdkError.default('Unable to set storage: ' + this.storageName);
    }
  }

  clearStorage(key) {
    if (!key) {
      // clear all
      if (this.storageProvider.removeItem) {
        this.storageProvider.removeItem(this.storageName);
      } else {
        this.setStorage();
      }

      return;
    }

    var obj = this.getStorage();
    delete obj[key];
    this.setStorage(obj);
  }

  updateStorage(key, value) {
    var obj = this.getStorage();
    obj[key] = value;
    this.setStorage(obj);
  }

}

exports.default = SavedObject;
module.exports = exports.default;
//# sourceMappingURL=SavedObject.js.map