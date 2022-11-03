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


// Polyfills objects needed to support IE 11+
require('core-js/features/object/assign');
require('core-js/features/object/keys');
require('core-js/features/object/values');
require('core-js/features/object/from-entries');
require('core-js/features/object/entries');
require('core-js/features/object/iterate-entries');
require('core-js/features/object/iterate-keys');
require('core-js/features/object/iterate-values');
require('core-js/features/symbol/iterator');
require('core-js/features/array/from');
require('core-js/features/array/includes');
require('core-js/es/promise');
require('core-js/es/string/starts-with');
require('core-js/es/string/ends-with');
require('core-js/es/string/includes'); // SIW
require('core-js/es/typed-array/uint8-array');
require('core-js/es/array/find'); // SIW
require('core-js/modules/es.map'); // Map.entries, Map.values
require('core-js/web/url');
require('webcrypto-shim');

if (typeof window.TextEncoder !== 'function') {
  require('fast-text-encoding');
}
