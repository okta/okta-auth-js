/*!
 * Copyright (c) 2018-present, Okta, Inc. and/or its affiliates. All rights reserved.
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

var storage = require('./serverStorage');
var storageBuilder = require('../storageBuilder');
var config = require('../config');

// Building this as an object allows us to mock the functions in our tests
var storageUtil = {};

storageUtil.getHttpCache = function() {
    return storageBuilder(storageUtil.getStorage(), config.CACHE_STORAGE_NAME);
};

storageUtil.getStorage = function() {
  return {
    getItem: storage.get,
    setItem: function(key, value) {
      storage.set(key, value, '2200-01-01T00:00:00.000Z');
    }
  };
};

module.exports = storageUtil;
