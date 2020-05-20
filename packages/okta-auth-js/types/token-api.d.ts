declare namespace OktaAuth {
  interface TokenHash {
    [key: string]: Token;
  }

  interface GetTokenResponse {
    tokens: TokenHash;
    state: string;
  }

  type ParseFromUrlFunction = () => Promise<GetTokenResponse>;

  interface ParseFromUrlInterface extends ParseFromUrlFunction {
    _getDocument: () => Document;
    _getLocation: () => Location;
    _getHistory: () => History;
  }

  type GetWithRedirectFunction = (params?: OAuthParams) => Promise<void>;

  interface GetWithRedirectAPI extends GetWithRedirectFunction {
    _setLocation: (loc: string) => void;
  }

  interface TokenAPI {
    getUserInfo(accessToken?: AccessToken, idToken?: IDToken): Promise<UserClaims>;
    getWithRedirect: GetWithRedirectAPI;
    parseFromUrl: ParseFromUrlInterface;
    getWithoutPrompt(params?: OAuthParams): Promise<GetTokenResponse>;
    getWithPopup(params?: OAuthParams): Promise<GetTokenResponse>;
    decode(token: string): JWTObject;
    revoke(token: AccessToken): Promise<object>;
    renew(token: Token): Promise<Token>;
    verify(token: IDToken, params?: object): Promise<IDToken>;
  }

  interface IDTokenAPI {
    authorize: {
      _getLocationHref: () => string;
    };
  }
}
