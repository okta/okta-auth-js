import { OktaAuth, WellKnownResponse } from '../../types';
export declare function getWellKnown(sdk: OktaAuth, issuer?: string): Promise<WellKnownResponse>;
export declare function getKey(sdk: OktaAuth, issuer: string, kid: string): Promise<string>;
