import {
  getProfile,
  updateProfile,
  getProfileSchema
} from '../../../lib/myaccount';
import { OktaAuth } from '../../../lib';
import {
  ProfileTransaction,
  ProfileSchemaTransaction
} from '../../../lib/myaccount/transactions';

jest.mock('../../../lib/myaccount/transactions/ProfileTransaction');
jest.mock('../../../lib/myaccount/transactions/ProfileSchemaTransaction');

describe('Myaccount Profile APIs', () => {
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

  describe('getProfile', () => {
    it('uses access token from options', async () => {
      await getProfile(auth, {
        accessToken: 'fake-accessToken-option'
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'GET',
        'http://my-okta-domain/idp/myaccount/profile',
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
      expect(ProfileTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-option',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });

    it('uses access token from storage when no accessToken is explicitly provided', async () => {
      await getProfile(auth);
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'GET',
        'http://my-okta-domain/idp/myaccount/profile',
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
      expect(ProfileTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-storage',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });
  });

  describe('updateProfile', () => {
    it('uses access token from options', async () => {
      await updateProfile(auth, {
        accessToken: 'fake-accessToken-option',
        payload: {
          profile: {
            firstName: 'fake'
          }
        }
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'PUT',
        'http://my-okta-domain/idp/myaccount/profile',
        {
          headers: {
            Accept: '*/*;okta-version=1.0.0',
            Authorization: 'Bearer fake-accessToken-option',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': 'fake-okta-ua'
          },
          data: {
            profile: {
              firstName: 'fake'
            }
          },
          withCredentials: false
        }
      );
      expect(ProfileTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-option',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });

    it('uses access token from storage when no accessToken is explicitly provided', async () => {
      await updateProfile(auth, {
        payload: {
          profile: {
            firstName: 'fake'
          }
        }
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'PUT',
        'http://my-okta-domain/idp/myaccount/profile',
        {
          headers: {
            Accept: '*/*;okta-version=1.0.0',
            Authorization: 'Bearer fake-accessToken-storage',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': 'fake-okta-ua'
          },
          data: {
            profile: {
              firstName: 'fake'
            }
          },
          withCredentials: false
        }
      );
      expect(ProfileTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-storage',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });
  });

  describe('getProfileSchema', () => {
    it('uses access token from options', async () => {
      await getProfileSchema(auth, {
        accessToken: 'fake-accessToken-option',
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'GET',
        'http://my-okta-domain/idp/myaccount/profile/schema',
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
      expect(ProfileSchemaTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-option',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });

    it('uses access token from storage when no accessToken is explicitly provided', async () => {
      await getProfileSchema(auth);
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'GET',
        'http://my-okta-domain/idp/myaccount/profile/schema',
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
      expect(ProfileSchemaTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-storage',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });
  });

});
