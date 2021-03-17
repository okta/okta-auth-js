/*!
 * Copyright (c) 2021, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { getConsole } from '../util';

function isTransactionMetaValid (sdk, meta) {
  const keys = ['clientId', 'redirectUri'];
  const mismatch = keys.find(key => {
    return sdk.options[key] !== meta[key];
  });
  return !mismatch;
}

export async function getTransactionMeta (sdk) {
  // Load existing transaction meta from storage
  if (sdk.transactionManager.exists()) {
    const existing = sdk.transactionManager.load();
    if (isTransactionMetaValid(sdk, existing)) {
      return existing;
    }
    // existing meta is not valid for this configuration
    // this is common when changing configuration in local development environment
    // in a production environment, this may indicate that two apps are sharing a storage key
    getConsole().warn('Saved transaction meta does not match the current configuration. ' + 
      'This may indicate that two apps are sharing a storage key.');
  }

  // Calculate new values
  return sdk.token.prepareTokenParams();
}

export function buildProceedData(map, value, input) {
  const res = {};
  Object.keys(map).forEach(combinedKey => {
    let key; 
    let currentVal = value; 
    let currentRes = res;
    const keys = combinedKey.split('.');
    while (keys.length) {
      key = keys.shift();
      currentVal = currentVal.find(val => val.name === key);
      if (!currentVal) {
        break;
      } else if (!keys.length) {
        currentRes[key] = input[map[combinedKey]];
      } else {
        currentVal = currentVal.form.value;
        currentRes[key] = {};
        currentRes = currentRes[key];
      }
    }
  });

  return res;
}

export function proceedWithIdx(idxResp, allowedActionPaths, valueMap, userInput) {
  const { interactionCode, neededToProceed } = idxResp;
  if (interactionCode) {
    return interactionCode;
  }

  const actionMeta = neededToProceed.find(meta => allowedActionPaths.includes(meta.name));
  if (actionMeta) {
    const { name, value } = actionMeta;
    const data = buildProceedData(valueMap, value, userInput);
    return idxResp
      .proceed(name, data)
      .then(proceedWithIdx);    
  }

  throw new Error('unknown flow');
}
