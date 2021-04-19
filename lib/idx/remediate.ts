/* eslint-disable max-statements */
/* eslint-disable complexity */
import { 
  IdxResponse, 
  isRawIdxResponse, 
  RemediationFlow, 
  RemediationValues,
} from '../types';
import { 
  createApiError, 
  isErrorResponse, 
  getIdxRemediation 
} from './util';

// This function is called recursively until it reaches success or cannot be remediated
export async function remediate(
  idxResponse: IdxResponse,
  flow: RemediationFlow,
  values: RemediationValues
) {
  const { neededToProceed } = idxResponse;
  // TODO: idxRemediation may be unfound due to policy setting, handle error here
  const idxRemediation = getIdxRemediation(flow, neededToProceed);
  const name = idxRemediation.name;
  const T = flow[name];
  if (!T) {
    // No remediator is registered. bail!
    return idxResponse;
  }
  const remediator = new T(idxRemediation, values);

  // Recursive loop breaker
  if (!remediator.canRemediate()) {
    const nextStep = remediator.getNextStep();
    return { idxResponse, nextStep };
  }

  const data = remediator.getData();
  try {
    idxResponse = await idxResponse.proceed(idxRemediation.name, data);
    if (isErrorResponse(idxResponse)) {
      throw createApiError(idxResponse.rawIdxState);
    }
    if (idxResponse.interactionCode) {
      return { idxResponse };
    }
    return remediate(idxResponse, flow, values); // recursive call
  } catch (e) {
    if (isRawIdxResponse(e)) { // idx responses are sometimes thrown, these will be "raw"
      if (e.messages) {
        throw createApiError(e);
      } else {
        throw remediator.createApiError(e);
      }
    }
    throw e;
  }
}
