import { OktaAuth, TokenParams, TokenResponse } from '../types';
export declare function getWithoutPrompt(sdk: OktaAuth, options: TokenParams): Promise<TokenResponse>;
