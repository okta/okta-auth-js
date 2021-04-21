/* eslint-disable max-statements */
/* eslint-disable complexity */
import { AuthSdkError } from '../errors';
import { 
  IdxResponse, 
  isRawIdxResponse, 
  RemediationFlow, 
  RemediationValues,
  RemediationResponse,
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
): Promise<RemediationResponse> {
  const { neededToProceed } = idxResponse;
  const idxRemediation = getIdxRemediation(flow, neededToProceed);
  if (!idxRemediation) {
    throw new AuthSdkError('No remediation in the idxResponse can be match current flow');
  }
  const name = idxRemediation.name;
  const T = flow[name];
  if (!T) {
    throw new AuthSdkError('No remediator is registered');
  }

  const remediator = new T(idxRemediation, values);

  // Recursive loop breaker
  // TODO: there should be three states to handle:
  // 1. can remediate
  // 2. cannot remediate due to need user interaction
  // 3. cannot remediate due to unsupported inputs or policies
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
