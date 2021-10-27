import { IDToken, OktaAuth, TokenVerifyParams } from '../types';
export declare function verifyToken(sdk: OktaAuth, token: IDToken, validationParams: TokenVerifyParams): Promise<IDToken>;
