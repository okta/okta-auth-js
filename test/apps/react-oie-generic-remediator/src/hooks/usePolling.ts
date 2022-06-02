/*
 * Copyright (c) 2022-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { IdxTransaction, NextStep } from '@okta/okta-auth-js';
import {
  useEffect, useMemo, useRef, useState,
} from 'react';

const DEFAULT_TIMEOUT = 4000;

const getPollingStep = (
  transaction: IdxTransaction,
): NextStep | undefined => {
  // auth-js preserves polling object (cache) in transaction when back to authenticators list
  // stop polling in this scenario
  if (!transaction || transaction.nextStep?.name.startsWith('select-authenticator')) {
    return undefined;
  }

  const { nextStep = {}, availableSteps = [] } = transaction;
  let pollingStep = ([...availableSteps, nextStep] as NextStep[])
    .find((step: NextStep) => step.name === 'poll' || step.name?.endsWith('-poll'));

  if (!pollingStep) {
    return undefined;
  }

  // load refresh from rawIdxState
  // @ts-ignore Remove after auth-js OKTA-502378 fix
  if (!pollingStep.refresh) {
    const fieldName = pollingStep?.name.split('-')[0];
    const pollingMeta = (transaction.rawIdxState as any)[fieldName]?.value.poll || {};
    pollingStep = { ...pollingStep, ...pollingMeta };
  }

  return pollingStep;
};

// returns polling transaction or undefined
export const usePolling = (
  idxTransaction: IdxTransaction,
): IdxTransaction => {
  const [transaction, setTransaction] = useState<IdxTransaction>();
  const timerRef = useRef<NodeJS.Timeout>();

  const pollingStep = useMemo(() => {
    const idxTransactionPollingStep = getPollingStep(idxTransaction);
    if (!idxTransactionPollingStep) {
      return undefined;
    }

    const res = getPollingStep(transaction) || idxTransactionPollingStep;
    return res;
  }, [idxTransaction, transaction]);

  // start polling timer when internal polling transaction changes
  useEffect(() => {
    if (!pollingStep) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setTransaction(undefined);
      return undefined;
    }

    const { action, refresh = DEFAULT_TIMEOUT } = pollingStep;

    // one time request
    // the following polling requests will be triggered based on idxTransaction update
    timerRef.current = setTimeout(async () => {
      // Per SDK team action is guranteed to exist here, so we are safe to assert non-null
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const newTransaction = await action!({
        // @ts-ignore parameter type does not account for undefined
        stateHandle: idxTransaction?.context?.stateHandle,
      });
      setTransaction(newTransaction);
    }, refresh);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [setTransaction, pollingStep]);

  return transaction;
};