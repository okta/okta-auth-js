declare namespace OktaAuth {
  interface SessionObject {
    status: string;
    refresh?: () => Promise<any>;
    user?: () => Promise<any>;
  }

  interface SessionAPI {
    close: () => Promise<object>;
    exists: () => Promise<boolean>;
    get: () => Promise<SessionObject>;
    refresh: () => Promise<object>;
    setCookieAndRedirect: (sessionToken?: string, redirectUri?: string) => void;
  }
}
