import { OktaAuthIdxInterface } from '../types';    // auth-js/types
import { IdxResponse, IdxToPersist, RawIdxResponse } from '../types/idx-js';      // idx/types
import { IDX_API_VERSION } from '../../constants';
import v1 from './v1/parsers';


export const parsersForVersion = function parsersForVersion( version ) {
  switch (version) {
    case '1.0.0':
      return v1;
    case undefined:
    case null:
      throw new Error('Api version is required');
    default:
      throw new Error(`Unknown api version: ${version}.  Use an exact semver version.`);
  }
};

export function validateVersionConfig(version) {
  if ( !version ) {
    throw new Error('version is required');
  }

  const cleanVersion = (version ?? '').replace(/[^0-9a-zA-Z._-]/, '');
  if ( cleanVersion !== version || !version ) {
    throw new Error('invalid version supplied - version is required and uses semver syntax');
  }

  parsersForVersion(version); // will throw for invalid version
}

export function makeIdxState ( 
  authClient: OktaAuthIdxInterface,
  rawIdxResponse: RawIdxResponse,
  toPersist: IdxToPersist,
  requestDidSucceed: boolean,
): IdxResponse {
  const version = rawIdxResponse?.version ?? IDX_API_VERSION;
  validateVersionConfig(version);
  
  const { makeIdxState } = parsersForVersion(version);
  return makeIdxState(authClient, rawIdxResponse, toPersist, requestDidSucceed);
}
