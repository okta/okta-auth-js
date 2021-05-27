/* eslint-disable max-len */
import { Factory } from 'fishery';
import { IdxResponse, RawIdxResponse } from '../../../../lib/idx/types/idx-js';
import {
  IdentifyRemediationFactory,
  IdentifyWithPasswordRemediationFactory,
  VerifyPasswordRemediationFactory,
} from './remediations';

export const RawIdxResponseFactory = Factory.define<RawIdxResponse>(() => {
  return {
    version: '1.0.0',
    stateHandle: 'unknown-stateHandle'
  };
});

interface MockedIdxResponseTransientParams {
  nextResponse?: IdxResponse;
  idxVersion?: string;
  stateHandle?: string;
}

export const IdxResponseFactory = Factory.define<IdxResponse, MockedIdxResponseTransientParams>(({
  transientParams
}) => {
  return {
    proceed: () => Promise.resolve(transientParams.nextResponse),
    neededToProceed: [],
    rawIdxState: RawIdxResponseFactory.build({
      version: transientParams.idxVersion,
      stateHandle: transientParams.stateHandle,
    }),
    actions: {},
    toPersist: {},
    context: {}
  };
});

export const IdentifyResponseFactory = IdxResponseFactory.params({
  neededToProceed: [
    IdentifyRemediationFactory.build()
  ]
});

export const IdentifyWithPasswordResponseFactory = IdentifyResponseFactory.params({
  neededToProceed: [
    IdentifyWithPasswordRemediationFactory.build()
  ]
});

export const VerifyPasswordResponseFactory = IdxResponseFactory.params({
  neededToProceed: [
    VerifyPasswordRemediationFactory.build()
  ]
});
