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
const isFieldMutable = function isFieldMutable(field) {
  // mutable defaults to true, annoyingly
  return ( field.mutable !== false );
};

const divideSingleActionParamsByMutability = function divideSingleActionParamsByMutability( action ) {
  const defaultParamsForAction = {}; // mutable and present
  const neededParamsForAction = []; // mutable values
  const immutableParamsForAction = {}; // immutable
  // TODO: remove assumption that form names are unique, neededParams being an array is a temp fix
  // not all actions have value (e.g. redirect)
  // making sure they are not empty and instead hold the remediation object
  if (!action.value) {
    neededParamsForAction.push(action);
    return { defaultParamsForAction, neededParamsForAction, immutableParamsForAction };
  }

  for ( let field of action.value ) {

    if ( isFieldMutable( field ) ) {

      neededParamsForAction.push(field);

      if ( field.value ?? false ) {
        defaultParamsForAction[field.name] = field.value;
      }

    } else {
      immutableParamsForAction[field.name] = field.value ?? '';
    }
  }
  return { defaultParamsForAction, neededParamsForAction, immutableParamsForAction };
};

export const divideActionParamsByMutability = function divideActionParamsByMutability( actionList ) {
  // TODO: when removing form name is unique assumption, this may all be redundant
  actionList = Array.isArray(actionList) ? actionList : [ actionList ];
  const neededParams = [];
  const defaultParams = {};
  const immutableParams = {};

  for ( let action of actionList ) {
    const { 
      defaultParamsForAction, 
      neededParamsForAction, 
      immutableParamsForAction 
    } = divideSingleActionParamsByMutability(action);
    neededParams.push(neededParamsForAction);
    defaultParams[action.name] = defaultParamsForAction;
    immutableParams[action.name] = immutableParamsForAction;
  }

  return { defaultParams, neededParams, immutableParams };
};

