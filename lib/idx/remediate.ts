/* eslint-disable max-statements */
/* eslint-disable complexity */
import { 
  IdxResponse, 
  isRawIdxResponse, 
  RemediationFlow, 
  RemediationValues
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
  let idxRemediation = getIdxRemediation(flow, neededToProceed);
  
  let name = idxRemediation.name;
  let T = flow[name];
  if (!T) {
    // No remediator is registered. bail!
    return idxResponse;
  }
  let remediator = new T(idxRemediation, values);

  // Recursive loop breaker
  if (!remediator.canRemediate()) {
    if (remediator.canSkip() && neededToProceed.find(n => n.name == 'skip')) {
      idxRemediation = getIdxRemediation(flow, neededToProceed.filter(r => r.name == 'skip'));
      name = 'skip';
      T = flow[name];
      remediator = new T(idxRemediation, values);
    } else {
      const nextStep = remediator.getNextStep();
      return { idxResponse, nextStep };
    }
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
