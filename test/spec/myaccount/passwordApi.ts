import { OktaAuth } from '@okta/okta-auth-js';
import {
  getPassword,
  enrollPassword,
  updatePassword,
  deletePassword
} from '../../../lib/myaccount';
import {
  PasswordTransaction,
  BaseTransaction
} from '../../../lib/myaccount/transactions';

jest.mock('../../../lib/myaccount/transactions/PasswordTransaction');
jest.mock('../../../lib/myaccount/transactions/Base');

describe('Myaccount Password APIs', () => {
  let auth;

  beforeEach(function () {
    const issuer = 'http://my-okta-domain';
    auth = new OktaAuth({ issuer, pkce: false });
    auth.options.httpRequestClient = jest.fn().mockResolvedValue({
      responseText: '{"fake":"fake-response"}'
    });
    auth._oktaUserAgent.getHttpHeader = jest.fn().mockReturnValue({
      'X-Okta-User-Agent-Extended': 'fake-okta-ua'
    });
    jest.spyOn(auth.tokenManager, 'getTokensSync').mockReturnValue({
      accessToken: { accessToken: 'fake-accessToken-storage' }
    });
  });

  describe('getPassword', () => {
    it('uses access token from options', async () => {
      await getPassword(auth, {
        accessToken: 'fake-accessToken-option'
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'GET',
        'http://my-okta-domain/idp/myaccount/password',
        {
          headers: {
            Accept: '*/*;okta-version=1.0.0',
            Authorization: 'Bearer fake-accessToken-option',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': 'fake-okta-ua'
          },
          withCredentials: false
        }
      );
      expect(PasswordTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-option',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });

    it('uses access token from storage when no accessToken is explicitly provided', async () => {
      await getPassword(auth);
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'GET',
        'http://my-okta-domain/idp/myaccount/password',
        {
          headers: {
            Accept: '*/*;okta-version=1.0.0',
            Authorization: 'Bearer fake-accessToken-storage',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': 'fake-okta-ua'
          },
          withCredentials: false
        }
      );
      expect(PasswordTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-storage',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });
  });

  describe('enrollPassword', () => {
    it('uses access token from options', async () => {
      await enrollPassword(auth, {
        accessToken: 'fake-accessToken-option',
        payload: {
          profile: {
            password: 'fake'
          }
        }
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'http://my-okta-domain/idp/myaccount/password',
        {
          headers: {
            Accept: '*/*;okta-version=1.0.0',
            Authorization: 'Bearer fake-accessToken-option',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': 'fake-okta-ua'
          },
          data: {
            profile: {
              password: 'fake'
            }
          },
          withCredentials: false
        }
      );
      expect(PasswordTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-option',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });

    it('uses access token from storage when no accessToken is explicitly provided', async () => {
      await enrollPassword(auth, {
        payload: {
          profile: {
            password: 'fake'
          },
        }
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'http://my-okta-domain/idp/myaccount/password',
        {
          headers: {
            Accept: '*/*;okta-version=1.0.0',
            Authorization: 'Bearer fake-accessToken-storage',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': 'fake-okta-ua'
          },
          data: {
            profile: {
              password: 'fake'
            }
          },
          withCredentials: false
        }
      );
      expect(PasswordTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-storage',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });
  });

  // TODO: handle optional param `currentPassword`?
  describe('updatePassword', () => {
    it('uses access token from options', async () => {
      await updatePassword(auth, {
        accessToken: 'fake-accessToken-option',
        payload: {
          profile: {
            password: 'fake'
          }
        }
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'PUT',
        'http://my-okta-domain/idp/myaccount/password',
        {
          headers: {
            Accept: '*/*;okta-version=1.0.0',
            Authorization: 'Bearer fake-accessToken-option',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': 'fake-okta-ua'
          },
          data: {
            profile: {
              password: 'fake'
            }
          },
          withCredentials: false
        }
      );
      expect(PasswordTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-option',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });

    it('uses access token from storage when no accessToken is explicitly provided', async () => {
      await updatePassword(auth, {
        payload: {
          profile: {
            password: 'fake'
          },
        }
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'PUT',
        'http://my-okta-domain/idp/myaccount/password',
        {
          headers: {
            Accept: '*/*;okta-version=1.0.0',
            Authorization: 'Bearer fake-accessToken-storage',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': 'fake-okta-ua'
          },
          data: {
            profile: {
              password: 'fake'
            }
          },
          withCredentials: false
        }
      );
      expect(PasswordTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-storage',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });
  });

  describe('deletePassword', () => {
    it('uses access token from options', async () => {
      await deletePassword(auth, {
        accessToken: 'fake-accessToken-option'
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'DELETE',
        'http://my-okta-domain/idp/myaccount/password',
        {
          headers: {
            Accept: '*/*;okta-version=1.0.0',
            Authorization: 'Bearer fake-accessToken-option',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': 'fake-okta-ua'
          },
          withCredentials: false
        }
      );
      expect(BaseTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-option',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });

    it('uses access token from storage when no accessToken is explicitly provided', async () => {
      await deletePassword(auth);
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'DELETE',
        'http://my-okta-domain/idp/myaccount/password',
        {
          headers: {
            Accept: '*/*;okta-version=1.0.0',
            Authorization: 'Bearer fake-accessToken-storage',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': 'fake-okta-ua'
          },
          withCredentials: false
        }
      );
      expect(BaseTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-storage',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });
  });
});
