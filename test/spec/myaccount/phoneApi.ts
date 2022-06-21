import {
  getPhones,
  getPhone,
  addPhone,
  deletePhone,
  sendPhoneChallenge,
  verifyPhoneChallenge
} from '../../../lib/myaccount';
import { OktaAuth } from '../../../lib';
import {
  PhoneTransaction,
  BaseTransaction
} from '../../../lib/myaccount/transactions';

jest.mock('../../../lib/myaccount/transactions/PhoneTransaction');
jest.mock('../../../lib/myaccount/transactions/Base');

describe('Myaccount Phone APIs', () => {
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

  describe('getPhones', () => {
    it('uses access token from options', async () => {
      await getPhones(auth, {
        accessToken: 'fake-accessToken-option'
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'GET',
        'http://my-okta-domain/idp/myaccount/phones',
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
      expect(PhoneTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-option',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });

    it('uses access token from storage when no accessToken is explicitly provided', async () => {
      await getPhones(auth);
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'GET',
        'http://my-okta-domain/idp/myaccount/phones',
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
      expect(PhoneTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-storage',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });
  });

  describe('getPhone', () => {
    it('uses access token from options', async () => {
      await getPhone(auth, {
        id: 'fake-id',
        accessToken: 'fake-accessToken-option'
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'GET',
        'http://my-okta-domain/idp/myaccount/phones/fake-id',
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
      expect(PhoneTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-option',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });

    it('uses access token from storage when no accessToken is explicitly provided', async () => {
      await getPhone(auth, { id: 'fake-id' });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'GET',
        'http://my-okta-domain/idp/myaccount/phones/fake-id',
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
      expect(PhoneTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-storage',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });
  });

  describe('addPhone', () => {
    it('uses access token from options', async () => {
      await addPhone(auth, {
        accessToken: 'fake-accessToken-option',
        payload: {
          profile: {
            phoneNumber: 'fake'
          },
          sendCode: false,
          method: 'SMS'
        }
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'http://my-okta-domain/idp/myaccount/phones',
        {
          headers: {
            Accept: '*/*;okta-version=1.0.0',
            Authorization: 'Bearer fake-accessToken-option',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': 'fake-okta-ua'
          },
          data: {
            profile: {
              phoneNumber: 'fake'
            },
            sendCode: false,
            method: 'SMS'
          },
          withCredentials: false
        }
      );
      expect(PhoneTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-option',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });

    it('uses access token from storage when no accessToken is explicitly provided', async () => {
      await addPhone(auth, {
        payload: {
          profile: {
            phoneNumber: 'fake'
          },
          sendCode: false,
          method: 'SMS'
        }
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'http://my-okta-domain/idp/myaccount/phones',
        {
          headers: {
            Accept: '*/*;okta-version=1.0.0',
            Authorization: 'Bearer fake-accessToken-storage',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': 'fake-okta-ua'
          },
          data: {
            profile: {
              phoneNumber: 'fake'
            },
            sendCode: false,
            method: 'SMS'
          },
          withCredentials: false
        }
      );
      expect(PhoneTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-storage',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });
  });

  describe('deletePhone', () => {
    it('uses access token from options', async () => {
      await deletePhone(auth, {
        accessToken: 'fake-accessToken-option',
        id: 'fake-id'
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'DELETE',
        'http://my-okta-domain/idp/myaccount/phones/fake-id',
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
      await deletePhone(auth, {
        id: 'fake-id'
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'DELETE',
        'http://my-okta-domain/idp/myaccount/phones/fake-id',
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

  describe('sendPhoneChallenge', () => {
    it('uses access token from options', async () => {
      await sendPhoneChallenge(auth, {
        accessToken: 'fake-accessToken-option',
        id: 'fake-id',
        payload: { method: 'SMS' }
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'http://my-okta-domain/idp/myaccount/phones/fake-id/challenge',
        {
          headers: {
            Accept: '*/*;okta-version=1.0.0',
            Authorization: 'Bearer fake-accessToken-option',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': 'fake-okta-ua'
          },
          data: { method: 'SMS' },
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
      await sendPhoneChallenge(auth, {
        id: 'fake-id',
        payload: { method: 'SMS' }
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'http://my-okta-domain/idp/myaccount/phones/fake-id/challenge',
        {
          headers: {
            Accept: '*/*;okta-version=1.0.0',
            Authorization: 'Bearer fake-accessToken-storage',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': 'fake-okta-ua'
          },
          data: { method: 'SMS' },
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

  describe('verifyPhoneChallenge', () => {
    it('uses access token from options', async () => {

      await verifyPhoneChallenge(auth, {
        accessToken: 'fake-accessToken-option',
        id: 'fake-id',
        payload: { verificationCode: '000000' }
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'http://my-okta-domain/idp/myaccount/phones/fake-id/verify',
        {
          headers: {
            Accept: '*/*;okta-version=1.0.0',
            Authorization: 'Bearer fake-accessToken-option',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': 'fake-okta-ua'
          },
          data: { verificationCode: '000000' },
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
      await verifyPhoneChallenge(auth, {
        id: 'fake-id',
        payload: { verificationCode: '000000' }
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'http://my-okta-domain/idp/myaccount/phones/fake-id/verify',
        {
          headers: {
            Accept: '*/*;okta-version=1.0.0',
            Authorization: 'Bearer fake-accessToken-storage',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': 'fake-okta-ua'
          },
          data: { verificationCode: '000000' },
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
