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

/* eslint-disable max-len */

import { OktaAuthIdxInterface, IdxResponse, IdxRemediation, IdxContext } from '../../types';    // auth-js/types
import { IdxActions } from '../../types/idx-js';
import { generateRemediationFunctions } from './remediationParser';
import generateIdxAction from './generateIdxAction';
import { jsonpath } from '../../../util/jsonpath';
import { AuthSdkError } from '../../../errors';

const SKIP_FIELDS = {
  'remediation': true, // remediations are put into proceed/neededToProceed
  'context': true, // the API response of 'context' isn't externally useful.  We ignore it and put all non-action (contextual) info into idxState.context
};

export const parseNonRemediations = function parseNonRemediations( authClient: OktaAuthIdxInterface, idxResponse: IdxResponse, toPersist = {} ) {
  const actions = {};
  const context = {} as IdxContext;

  Object.keys(idxResponse)
    .filter( field => !SKIP_FIELDS[field])
    .forEach( field => {
      const fieldIsObject = typeof idxResponse[field] === 'object' && !!idxResponse[field];

      if ( !fieldIsObject ) {
        // simple fields are contextual info
        context[field] = idxResponse[field];
        return;
      }

      if ( idxResponse[field].rel ) {
        // top level actions
        actions[idxResponse[field].name] = generateIdxAction(authClient, idxResponse[field], toPersist);
        return;
      }

      const { value: fieldValue, type, ...info} = idxResponse[field];
      context[field] = { type, ...info}; // add the non-action parts as context

      if ( type !== 'object' ) {
        // only object values hold actions
        context[field].value = fieldValue;
        return;
      }

      // We are an object field containing an object value
      context[field].value = {};
      Object.entries<IdxRemediation>(fieldValue)
        .forEach( ([subField, value]) => {
          if (value.rel) { // is [field].value[subField] an action?
            // add any "action" value subfields to actions
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            actions[`${field}-${subField.name || subField}`] = generateIdxAction(authClient, value, toPersist);
          } else {
            // add non-action value subfields to context
            context[field].value[subField] = value;
          }
        });
    });

  return { context, actions };
};

const expandRelatesTo = (idxResponse, value) => {
  Object.keys(value).forEach(k => {
    if (k === 'relatesTo') {
      const query = Array.isArray(value[k]) ? value[k][0] : value[k];
      if (typeof query === 'string') {
        const result = jsonpath({ path: query, json: idxResponse })[0];
        if (result) {
          value[k] = result;
          return;
        } else {
          throw new AuthSdkError(`Cannot resolve relatesTo: ${query}`);
        }
      }
    }
    if (Array.isArray(value[k])) {
      value[k].forEach(innerValue => expandRelatesTo(idxResponse, innerValue));
    }
  });
};

const convertRemediationAction = (authClient: OktaAuthIdxInterface, remediation, toPersist) => {
  // Only remediation that has `rel` field (indicator for form submission) can have http action
  if (remediation.rel) {
    const remediationActions = generateRemediationFunctions( authClient, [remediation], toPersist );
    const actionFn = remediationActions[remediation.name];
    return {
      ...remediation,
      action: actionFn,
    };
  }

  return remediation;
};

export const parseIdxResponse = function parseIdxResponse( authClient: OktaAuthIdxInterface, idxResponse, toPersist = {} ): {
  remediations: IdxRemediation[];
  context: IdxContext;
  actions: IdxActions;
} {
  const remediationData = idxResponse.remediation?.value || [];

  remediationData.forEach(
    remediation => {
      // TODO: remove once IDX is fixed - OKTA-659181
      if (remediation.name === 'launch-authenticator' &&
        remediation?.relatesTo?.[0] === 'authenticatorChallenge' &&
        !idxResponse?.authenticatorChallenge
      ) {
        delete remediation.relatesTo;
        return;
      }

      return expandRelatesTo(idxResponse, remediation);
    }
  );

  const remediations = remediationData.map(remediation => convertRemediationAction( authClient, remediation, toPersist ));

  const { context, actions } = parseNonRemediations( authClient, idxResponse, toPersist );

  return {
    remediations,
    context,
    actions,
  };
};
