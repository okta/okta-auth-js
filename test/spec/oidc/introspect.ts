import { oidcIntrospect as introspect } from '../../../lib/oidc/introspect';
import { AuthSdkError } from '../../../lib/errors';
import { TokenKind } from '../../../lib/oidc/types';

const mockIntrospectUrl = 'test url';

const mocked = {
  getWellKnown: jest.fn().mockResolvedValue({introspection_endpoint: mockIntrospectUrl}),
  post: jest.fn().mockResolvedValue(true),
  getTokens: jest.fn()
};
jest.mock('../../../lib/oidc/endpoints/well-known', () => {
  return {
    getWellKnown: (...args) => mocked.getWellKnown(...args)
  };
});
jest.mock('../../../lib/http', () => {
  return {
    post: (...args) => mocked.post(...args)
  };
});

describe('introspect', () => {
  const testContext: any = {};

  beforeEach(() => {
    testContext.accessToken = {
      accessToken: 'accessToken'
    };
    testContext.idToken = {
      idToken: 'idToken'
    };
    testContext.refreshToken = {
      refreshToken: 'refreshToken'
    };

    testContext.sdk = {
      tokenManager: {
        getTokens: mocked.getTokens
      },
      options: {
        clientId: 'clientId',
        issuer: 'sdk.options.issuer'
      }
    };
  });

  describe('errors', () => {
    it('throws when no clientId is provided', async () => {
      const { sdk, accessToken } = testContext;
      sdk.options.clientId = undefined;
      let err;
      try {
        await introspect(sdk, TokenKind.ACCESS, accessToken);
      }
      catch(e) {
        err = e;
      }
      expect(err).toBeInstanceOf(AuthSdkError);
      expect(err.message).toEqual('A clientId must be specified in the OktaAuth constructor to introspect a token');
    });

    it('throws when no issuer is provided', async () => {
      const { sdk, accessToken } = testContext;
      sdk.options.issuer = undefined;
      let err;
      try {
        await introspect(sdk, TokenKind.ACCESS, accessToken);
      }
      catch(e) {
        err = e;
      }
      expect(err).toBeInstanceOf(AuthSdkError);
      expect(err.message).toEqual('Unable to find issuer');
    });

    it('throws when tokens are not passed and cannot be found in storage', async () => {
      const { sdk } = testContext;
      mocked.getTokens.mockReturnValue({});
      let err;
      try {
        await introspect(sdk, TokenKind.ACCESS);
      }
      catch(e) {
        err = e;
      }
      expect(err).toBeInstanceOf(AuthSdkError);
      expect(err.message).toEqual('unable to find accessToken in storage or fn params');
    });
  });

  it('introspects access token', async () => {
    const { sdk, accessToken } = testContext;
    mocked.getTokens.mockReturnValue({ accessToken });
    await introspect(sdk, TokenKind.ACCESS, accessToken);
    expect(mocked.getWellKnown).toHaveBeenCalledWith(sdk, 'sdk.options.issuer');
    expect(mocked.post).toHaveBeenCalledWith(
      sdk, 
      mockIntrospectUrl,
      'token_type_hint=access_token&token=accessToken',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': expect.stringContaining('Basic ')
        }
      })
    );
    expect(mocked.getTokens).not.toHaveBeenCalled();
    await introspect(sdk, TokenKind.ACCESS);
    expect(mocked.getTokens).toHaveBeenCalled();
    expect(mocked.post).toHaveBeenLastCalledWith(
      sdk, 
      mockIntrospectUrl,
      'token_type_hint=access_token&token=accessToken',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': expect.stringContaining('Basic ')
        }
      })
    );
  });

  it('introspects id token', async () => {
    const { sdk, idToken } = testContext;
    mocked.getTokens.mockReturnValue({ idToken });
    await introspect(sdk, TokenKind.ID, idToken);
    expect(mocked.getWellKnown).toHaveBeenCalledWith(sdk, 'sdk.options.issuer');
    expect(mocked.post).toHaveBeenCalledWith(
      sdk, 
      mockIntrospectUrl,
      'token_type_hint=id_token&token=idToken',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': expect.stringContaining('Basic ')
        }
      })
    );
    expect(mocked.getTokens).not.toHaveBeenCalled();
    await introspect(sdk, TokenKind.ID);
    expect(mocked.getTokens).toHaveBeenCalled();
    expect(mocked.post).toHaveBeenLastCalledWith(
      sdk, 
      mockIntrospectUrl,
      'token_type_hint=id_token&token=idToken',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': expect.stringContaining('Basic ')
        }
      })
    );
  });

  it('introspects refresh token', async () => {
    const { sdk, refreshToken } = testContext;
    mocked.getTokens.mockReturnValue({ refreshToken });
    await introspect(sdk, TokenKind.REFRESH, refreshToken);
    expect(mocked.getWellKnown).toHaveBeenCalledWith(sdk, 'sdk.options.issuer');
    expect(mocked.post).toHaveBeenCalledWith(
      sdk, 
      mockIntrospectUrl,
      'token_type_hint=refresh_token&token=refreshToken',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': expect.stringContaining('Basic ')
        }
      })
    );
    expect(mocked.getTokens).not.toHaveBeenCalled();
    await introspect(sdk, TokenKind.REFRESH);
    expect(mocked.getTokens).toHaveBeenCalled();
    expect(mocked.post).toHaveBeenLastCalledWith(
      sdk, 
      mockIntrospectUrl,
      'token_type_hint=refresh_token&token=refreshToken',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': expect.stringContaining('Basic ')
        }
      })
    );
  });

});
