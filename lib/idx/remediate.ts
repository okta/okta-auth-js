/* eslint-disable complexity */
import { IdxResponse, isRawIdxResponse, RemediationValues, Remediator, IdxRemediation } from '../types';
import { createApiError, isErrorResponse } from './util';
import Identify from './remediatiors/Identify';
import { create } from 'lodash';

const REMEDIATORS = {
  'identify': Identify
  // add more
};

function canRemediate(remediators: Remediator[]) {
  for (let i = 0; i < remediators.length; i++) {
    const r = remediators[i];
    if (r.canRemediate() !== true) {
      return false;
    }
  }
  return true;
}

function getData(remediators: Remediator[]) {
  return remediators.reduce((data, r) => {
    Object.assign(data, r.getData());
    return data;
  }, {});
}

async function remediateRecursive(
  neededToProceed: IdxRemediation[],
  remediators: Remediator[],
  values: RemediationValues,
  idxResponse: IdxResponse,
) {
  // Recursive loop breaker
  if (!canRemediate(remediators)) {
    console.log('REMEDIATION CANNOT BE SATISIFIED', idxResponse);
    return idxResponse;
  }

  const data = getData(remediators);
  const form = neededToProceed[0]; // Only considering first remediation
  try {
    idxResponse = await idxResponse.proceed(form.name, data);
    if (isErrorResponse(idxResponse)) {
      throw createApiError(idxResponse.rawIdxState);
    }
    if (idxResponse.interactionCode) {
      return idxResponse;
    }
    return remediateRecursive(neededToProceed, remediators, values, idxResponse); // recursive call
  } catch (e) {
    if (isRawIdxResponse(e)) { // idx responses are sometimes thrown, these will be "raw"
      throw createApiError(e);
    }
    throw e;
  }
}

export async function remediate(
  idxResponse: IdxResponse,
  values: RemediationValues
) {
  // Only consider the first remediation
  const neededToProceed = idxResponse.neededToProceed.slice(0, 1);
  
  const remediators = [];
  for (let i = 0; i < neededToProceed.length; i++) {
    const idxRemediation = neededToProceed[i];
    const name = idxRemediation.name;
    const T = REMEDIATORS[name];
    if (!T) {
      // No remediator is registered. bail!
      console.log(`No remediator registered for "${name}"`);
      return idxResponse;
    }
    const remediator = new T(idxRemediation, values);
    remediators.push(remediator);
  }

  return remediateRecursive(neededToProceed, remediators, values, idxResponse);
}
