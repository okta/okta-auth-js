import { OktaAuth, CustomUrls } from '../../types';
export declare function generateState(): string;
export declare function generateNonce(): string;
export declare function getOAuthBaseUrl(sdk: OktaAuth, options?: CustomUrls): any;
export declare function getOAuthDomain(sdk: OktaAuth, options?: CustomUrls): any;
export declare function getOAuthUrls(sdk: OktaAuth, options?: CustomUrls): {
    issuer: any;
    authorizeUrl: any;
    userinfoUrl: any;
    tokenUrl: any;
    revokeUrl: any;
    logoutUrl: any;
};
