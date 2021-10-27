import { AccessToken, IDToken, UserClaims } from '../types';
export declare function getUserInfo(sdk: any, accessTokenObject: AccessToken, idTokenObject: IDToken): Promise<UserClaims>;
