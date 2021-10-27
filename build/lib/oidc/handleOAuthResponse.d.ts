import { OktaAuth, OAuthResponse, TokenParams, TokenResponse, CustomUrls } from '../types';
export declare function handleOAuthResponse(sdk: OktaAuth, tokenParams: TokenParams, res: OAuthResponse, urls: CustomUrls): Promise<TokenResponse>;
