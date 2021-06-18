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


var POLL_INTERVAL = 10; // ms

function waitFor(conditionFn) {
  return new Promise(function(resolve, reject) {

    function checkCondition() {
      var res = conditionFn();
      if (res && res.then && res.catch) {
        // result was a promise. wait for it to resolve
        res
        .then(function(promiseRes) {
          resolve(promiseRes);
        })
        .catch(function(err) {
          reject(err);
        });
        return;
      }

      if (res) {
        resolve(res);
        return;
      }

      // result was false, poll and try again
      setTimeout(checkCondition, POLL_INTERVAL);
    }

    checkCondition();
  });
}

module.exports = waitFor;
