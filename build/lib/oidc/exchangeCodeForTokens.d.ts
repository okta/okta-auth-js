import { CustomUrls, OktaAuth, TokenParams, TokenResponse } from '../types';
export declare function exchangeCodeForTokens(sdk: OktaAuth, tokenParams: TokenParams, urls?: CustomUrls): Promise<TokenResponse>;
