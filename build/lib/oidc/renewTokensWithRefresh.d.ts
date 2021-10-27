import { OktaAuth, TokenParams, RefreshToken, Tokens } from '../types';
export declare function renewTokensWithRefresh(sdk: OktaAuth, tokenParams: TokenParams, refreshTokenObject: RefreshToken): Promise<Tokens>;
