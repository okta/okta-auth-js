import { OktaAuth, AuthSdkError, TokenParams, OAuthError } from '@okta/okta-auth-js';
import tokens from '@okta/test.support/tokens';


const mocked = {
  addIDPPopupLisenter: jest.fn(),
  verifyToken: jest.fn(),
};

jest.mock('../../../lib/oidc/endpoints/well-known', () => {
  return {
    getWellKnown: async () => ({
      code_challenge_methods_supported: ['S256']
    }),
    getKey: async () => ({})
  };
});

jest.mock('lib/oidc/verifyToken', () => {
  return {
    verifyToken: () => mocked.verifyToken()
  };
});

jest.mock('lib/oidc/util/browser', () => {
  const actual = jest.requireActual('lib/oidc/util/browser');
  return {
    ...actual,
    addIDPPopupLisenter: () => mocked.addIDPPopupLisenter()
  };
});

describe('token.getWithIDPPopup', () => {
  let fakeWindow;
  let MockBC;
  let authParams;
  let authClient;

  beforeEach(() => {
    fakeWindow = {
      url: 'foo',
      location: {
        assign: (url) => {
          fakeWindow.url = url;
        }
      },
      closed: false,
      close: function () {
        this.closed = true;
      }
    };
    jest.spyOn(fakeWindow, 'close');
    jest.spyOn(fakeWindow.location, 'assign');
    jest.spyOn(window, 'open').mockImplementation(() => {
      return fakeWindow;
    });

    MockBC = class MockBC {
      postMessage = jest.fn;
      onmessage = jest.fn;
      close = jest.fn;
    };
    global.BroadcastChannel = MockBC;

    authParams = {
      issuer: 'https://auth-js-test.okta.com',
      clientId: 'clientId',
      redirectUri: 'http://localhost:8080/login/callback',
      pkce: true
    };
    authClient = new OktaAuth(authParams);

    jest.spyOn(authClient.token, 'exchangeCodeForTokens').mockImplementation((_, params) => {
      return Promise.resolve({
        tokens: {
          accessToken: tokens.standardAccessTokenParsed,
        },
        state: (params as TokenParams).state
      });
    });
  });

  it('can redirect a popup to authorize and get tokens', async () => {
    const state = 'state';
    mocked.addIDPPopupLisenter.mockResolvedValue({ code: 'code', state });
    
    const { promise } = authClient.token.getWithIDPPopup({
      redirectUri: 'http://localhost:8080/popup/callback',
      state
    });

    const resp = await promise;

    expect(window.open).toHaveBeenCalled();
    expect(fakeWindow.location.assign).toHaveBeenCalled();
    const popupUrl = new URL(fakeWindow.url);
    expect(popupUrl.host).toBe('auth-js-test.okta.com');
    expect(popupUrl.pathname).toBe('/oauth2/v1/authorize');
    expect(popupUrl.searchParams.get('client_id')).toBe('clientId');
    // pkce
    expect(popupUrl.searchParams.get('code_challenge')).toBeDefined();
    expect(popupUrl.searchParams.get('code_challenge_method')).toBe('S256');
    // display
    expect(popupUrl.searchParams.get('display')).toBe('popup');
    // response_mode
    expect(popupUrl.searchParams.get('response_mode')).toBe('query');
    // response_type
    expect(popupUrl.searchParams.get('response_type')).toBe('code');
    // code
    expect(popupUrl.searchParams.get('code')).toBeDefined();
    // state
    expect(popupUrl.searchParams.get('state')).toBe(state);
    // nonce
    expect(popupUrl.searchParams.get('nonce')).toBeDefined();
    // redirect_uri
    expect(popupUrl.searchParams.get('redirect_uri')).toBe('http://localhost:8080/popup/callback');

    expect(resp).toEqual({ tokens: {
      accessToken: tokens.standardAccessTokenParsed
    }});
  });

  it('can be canceled', async () => {
    const state = 'state';
    mocked.addIDPPopupLisenter.mockResolvedValue({ code: 'code', state });

    const { promise, cancel } = authClient.token.getWithIDPPopup({
      redirectUri: 'http://localhost:8080/popup/callback',
      state
    });

    cancel();

    await expect(promise).rejects.toEqual(new AuthSdkError('Popup flow canceled'));
    expect(window.open).toHaveBeenCalled();
  });

  it('will throw oauth errors', async () => {
    const state = 'state';
    mocked.addIDPPopupLisenter.mockResolvedValue({
      state, error: 'invalid grant', error_description: 'something went wrong'
    });

    const { promise } = authClient.token.getWithIDPPopup({
      redirectUri: 'http://localhost:8080/popup/callback',
      state
    });

    await expect(promise).rejects.toEqual(new OAuthError('invalid grant', 'something went wrong'));
    expect(window.open).toHaveBeenCalled();
  });

  it('will timeout if message is never received', async () => {
    const state = 'state';
    mocked.addIDPPopupLisenter.mockRejectedValue(new AuthSdkError('OAuth flow timed out'));

    const { promise } = authClient.token.getWithIDPPopup({
      redirectUri: 'http://localhost:8080/popup/callback',
      state
    });

    await expect(promise).rejects.toEqual(new AuthSdkError('OAuth flow timed out'));
    expect(window.open).toHaveBeenCalled();
  });

  it('will throw if popup is blocked', async () => {
    jest.spyOn(window, 'open').mockImplementation(() => {
      return null;
    });

    const state = 'state';
    mocked.addIDPPopupLisenter.mockResolvedValue({ code: 'code', state });

    const { promise } = authClient.token.getWithIDPPopup({
      redirectUri: 'http://localhost:8080/popup/callback',
      state
    });

    await expect(promise).rejects.toEqual(new AuthSdkError('Unable to open popup window'));
    expect(window.open).toHaveBeenCalled();
    expect(window.open).toHaveReturnedWith(null);
  });

  it('will throw if `redirect_uri` is not provided', async () => {
    const state = 'state';
    mocked.addIDPPopupLisenter.mockResolvedValue({ code: 'code', state });
    
    const { promise } = authClient.token.getWithIDPPopup({
      state
    });

    await expect(promise).rejects.toEqual(new AuthSdkError('`redirectUri` is a required param for `getWithIDPPopup`'));
    expect(window.open).not.toHaveBeenCalled();
  });

  it('will throw if BroadcastChannel is not supported', async () => {
    // @ts-expect-error forcing window object
    global.BroadcastChannel = undefined;

    const state = 'state';
    mocked.addIDPPopupLisenter.mockResolvedValue({ code: 'code', state });
    
    const { promise } = authClient.token.getWithIDPPopup({
      state
    });

    await expect(promise).rejects.toEqual(new AuthSdkError('Modern browser with `BroadcastChannel` support is required to use this method'));
    expect(window.open).not.toHaveBeenCalled();
  });
});
