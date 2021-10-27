declare function sessionExists(sdk: any): any;
declare function getSession(sdk: any): Promise<any>;
declare function closeSession(sdk: any): Promise<any>;
declare function refreshSession(sdk: any): Promise<any>;
declare function setCookieAndRedirect(sdk: any, sessionToken: any, redirectUrl: any): void;
export { sessionExists, getSession, closeSession, refreshSession, setCookieAndRedirect };
