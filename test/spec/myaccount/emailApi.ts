import {
  getEmail,
  getEmails,
  getEmailChallenge,
  addEmail,
  deleteEmail,
  sendEmailChallenge,
  verifyEmailChallenge
} from '../../../lib/myaccount';
import { OktaAuth } from '../../../lib';
import {
  EmailTransaction,
  EmailChallengeTransaction,
  BaseTransaction
} from '../../../lib/myaccount/transactions';
import { EmailRole } from '../../../lib/myaccount/types';

jest.mock('../../../lib/myaccount/transactions/EmailTransaction');
jest.mock('../../../lib/myaccount/transactions/EmailStatusTransaction');
jest.mock('../../../lib/myaccount/transactions/EmailChallengeTransaction');
jest.mock('../../../lib/myaccount/transactions/Base');

describe('Myaccount Email APIs', () => {
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

  describe('getEmails', () => {
    it('uses access token from options', async () => {
      await getEmails(auth, {
        accessToken: 'fake-accessToken-option'
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'GET',
        'http://my-okta-domain/idp/myaccount/emails',
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
      expect(EmailTransaction).toHaveBeenCalledWith(auth,
        expect.objectContaining({
          accessToken: 'fake-accessToken-option',
          res: expect.objectContaining({
            fake: 'fake-response'
          }),
        }));
    });

    it('uses access token from storage when no accessToken is explicitly provided', async () => {
      await getEmails(auth);
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'GET',
        'http://my-okta-domain/idp/myaccount/emails',
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
      expect(EmailTransaction).toHaveBeenCalledWith(auth,
        expect.objectContaining({
          accessToken: 'fake-accessToken-storage',
          res: expect.objectContaining({
            fake: 'fake-response'
          }),
        }));
    });
  });

  describe('getEmail', () => {
    it('uses access token from options', async () => {
      await getEmail(auth, {
        id: 'fake-id',
        accessToken: 'fake-accessToken-option'
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'GET',
        'http://my-okta-domain/idp/myaccount/emails/fake-id',
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
      expect(EmailTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-option',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });

    it('uses access token from storage when no accessToken is explicitly provided', async () => {
      await getEmail(auth, { id: 'fake-id' });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'GET',
        'http://my-okta-domain/idp/myaccount/emails/fake-id',
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
      expect(EmailTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-storage',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });
  });

  describe('addEmail', () => {
    it('uses access token from options', async () => {
      await addEmail(auth, {
        accessToken: 'fake-accessToken-option',
        payload: {
          profile: {
            email: 'fake'
          },
          sendEmail: false,
          role: EmailRole.PRIMARY
        }
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'http://my-okta-domain/idp/myaccount/emails',
        {
          headers: {
            Accept: '*/*;okta-version=1.0.0',
            Authorization: 'Bearer fake-accessToken-option',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': 'fake-okta-ua'
          },
          data: {
            profile: {
              email: 'fake'
            },
            sendEmail: false,
            role: EmailRole.PRIMARY
          },
          withCredentials: false
        }
      );
      expect(EmailTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-option',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });

    it('uses access token from storage when no accessToken is explicitly provided', async () => {
      await addEmail(auth, {
        payload: {
          profile: {
            email: 'fake'
          },
          sendEmail: false,
          role: EmailRole.PRIMARY
        }
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'http://my-okta-domain/idp/myaccount/emails',
        {
          headers: {
            Accept: '*/*;okta-version=1.0.0',
            Authorization: 'Bearer fake-accessToken-storage',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': 'fake-okta-ua'
          },
          data: {
            profile: {
              email: 'fake'
            },
            sendEmail: false,
            role: EmailRole.PRIMARY
          },
          withCredentials: false
        }
      );
      expect(EmailTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-storage',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });
  });

  describe('deleteEmail', () => {
    it('uses access token from options', async () => {
      await deleteEmail(auth, {
        accessToken: 'fake-accessToken-option',
        id: 'fake-id'
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'DELETE',
        'http://my-okta-domain/idp/myaccount/emails/fake-id',
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
      await deleteEmail(auth, {
        id: 'fake-id'
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'DELETE',
        'http://my-okta-domain/idp/myaccount/emails/fake-id',
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

  describe('sendEmailChallenge', () => {
    it('uses access token from options', async () => {
      await sendEmailChallenge(auth, {
        accessToken: 'fake-accessToken-option',
        id: 'fake-id'
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'http://my-okta-domain/idp/myaccount/emails/fake-id/challenge',
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
      expect(EmailChallengeTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-option',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });

    it('uses access token from storage when no accessToken is explicitly provided', async () => {
      await sendEmailChallenge(auth, {
        id: 'fake-id'
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'http://my-okta-domain/idp/myaccount/emails/fake-id/challenge',
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
      expect(EmailChallengeTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-storage',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });
  });

  describe('getEmailChallenge', () => {
    it('uses access token from options', async () => {
      await getEmailChallenge(auth, {
        accessToken: 'fake-accessToken-option',
        emailId: 'fake-id',
        challengeId: 'fake-challenge-id'
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'http://my-okta-domain/idp/myaccount/emails/fake-id/challenge/fake-challenge-id',
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
      expect(EmailChallengeTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-option',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });

    it('uses access token from storage when no accessToken is explicitly provided', async () => {
      await getEmailChallenge(auth, {
        emailId: 'fake-id',
        challengeId: 'fake-challenge-id'
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'http://my-okta-domain/idp/myaccount/emails/fake-id/challenge/fake-challenge-id',
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
      expect(EmailChallengeTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-accessToken-storage',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });
  });

  describe('verifyPhoneChallenge', () => {
    it('uses access token from options', async () => {
      await verifyEmailChallenge(auth, {
        accessToken: 'fake-accessToken-option',
        emailId: 'fake-id',
        challengeId: 'fake-challenge-id',
        payload: { verificationCode: '000000' }
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'http://my-okta-domain/idp/myaccount/emails/fake-id/challenge/fake-challenge-id/verify',
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
      await verifyEmailChallenge(auth, {
        emailId: 'fake-id',
        challengeId: 'fake-challenge-id',
        payload: { verificationCode: '000000' }
      });
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'http://my-okta-domain/idp/myaccount/emails/fake-id/challenge/fake-challenge-id/verify',
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
