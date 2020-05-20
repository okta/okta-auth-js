declare namespace OktaAuth {
  interface JWTObject {
    header: object;
    payload: object;
    signature: object;
  }

  /**
   *
   * This interface represents the union of possible known claims that are in an
   * ID Token or returned from the /userinfo response and depend on the
   * response_type and scope parameters in the authorize request
   */
  interface UserClaims {
    auth_time?: number;
    aud?: string;
    email?: string;
    email_verified?: boolean;
    exp?: number;
    family_name?: string;
    given_name?: string;
    iat?: number;
    iss?: string;
    jti?: string;
    locale?: string;
    name?: string;
    nonce?: string;
    preferred_username?: string;
    sub: string;
    updated_at?: number;
    ver?: number;
    zoneinfo?: string;
    [propName: string]: any;  // For custom claims that may be configured by the org admin
  }

  interface AbstractToken {
    expiresAt: number;
  }

  interface AccessToken extends AbstractToken {
    accessToken: string;
  }

  // eslint-disable-next-line @typescript-eslint/interface-name-prefix
  interface IDToken extends AbstractToken {
    idToken: string;
    claims: UserClaims;
  }

  type Token = AccessToken | IDToken;
}