import {
  EmailTransaction,
  EmailChallengeTransaction,
  BaseTransaction
} from '../../../lib/myaccount/transactions';
import { OktaAuth } from '../../../lib';
import { generateRequestFnFromLinks } from '../../../lib/myaccount/request';

jest.mock('../../../lib/myaccount/transactions/EmailTransaction');
jest.mock('../../../lib/myaccount/transactions/EmailStatusTransaction');
jest.mock('../../../lib/myaccount/transactions/EmailChallengeTransaction');
jest.mock('../../../lib/myaccount/transactions/Base');

const mockLinks = {
  'self': {
    'href': 'http://my-okta-domain/idp/myaccount/emails/00T196qTp3LIMZQ0L0g3',
    'hints': {
      'allow': [
        'GET',
        'PUT',
        'DELETE'
      ]
    }
  },
  'challenge': {
    'href': 'http://my-okta-domain/idp/myaccount/emails/00T196qTp3LIMZQ0L0g3/challenge',
    'hints': {
      'allow': [
        'POST'
      ]
    }
  },
  'verify': {
    'href': 'http://my-okta-domain/idp/myaccount/emails/00T196qTp3LIMZQ0L0g3/verify',
    'hints': {
      'allow': [
        'POST'
      ]
    }
  },
};

describe('generateRequestFnFromLinks function', () => {
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
  });

  describe('Generate CRUD function based on "self" link', () => {

    it('can resolve transaction based on "transactionClassName"', async () => {
      const getFn = generateRequestFnFromLinks({
        oktaAuth: auth,
        accessToken: 'fake-token',
        methodName: 'get',
        links: mockLinks,
        transactionClassName: 'EmailTransaction'
      });
      await getFn();
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'GET',
        'http://my-okta-domain/idp/myaccount/emails/00T196qTp3LIMZQ0L0g3',
        {
          headers: {
            Accept: '*/*;okta-version=1.0.0',
            Authorization: 'Bearer fake-token',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': 'fake-okta-ua'
          },
          withCredentials: false
        }
      );
      expect(EmailTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-token',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });

    it('resolves BaseTransaction if no "transactionClassName" is provided', async () => {
      const getFn = generateRequestFnFromLinks({
        oktaAuth: auth,
        accessToken: 'fake-token',
        methodName: 'get',
        links: mockLinks,
      });
      await getFn();
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'GET',
        'http://my-okta-domain/idp/myaccount/emails/00T196qTp3LIMZQ0L0g3',
        {
          headers: {
            Accept: '*/*;okta-version=1.0.0',
            Authorization: 'Bearer fake-token',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': 'fake-okta-ua'
          },
          withCredentials: false
        }
      );
      expect(BaseTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-token',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });
  });

  describe('Generate other functions - first level fields', () => {

    it('can resolve transaction based on "transactionClassName"', async () => {
      const challengeFn = generateRequestFnFromLinks({
        oktaAuth: auth,
        accessToken: 'fake-token',
        methodName: 'challenge',
        links: mockLinks,
        transactionClassName: 'EmailChallengeTransaction'
      });
      await challengeFn();
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'http://my-okta-domain/idp/myaccount/emails/00T196qTp3LIMZQ0L0g3/challenge',
        {
          headers: {
            Accept: '*/*;okta-version=1.0.0',
            Authorization: 'Bearer fake-token',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': 'fake-okta-ua'
          },
          withCredentials: false
        }
      );
      expect(EmailChallengeTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-token',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });

    it('resolves BaseTransaction if no "transactionClassName" is provided', async () => {
      const challengeFn = generateRequestFnFromLinks({
        oktaAuth: auth,
        accessToken: 'fake-token',
        methodName: 'challenge',
        links: mockLinks,
      });
      await challengeFn();
      expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'http://my-okta-domain/idp/myaccount/emails/00T196qTp3LIMZQ0L0g3/challenge',
        {
          headers: {
            Accept: '*/*;okta-version=1.0.0',
            Authorization: 'Bearer fake-token',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': 'fake-okta-ua'
          },
          withCredentials: false
        }
      );
      expect(BaseTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
        accessToken: 'fake-token',
        res: expect.objectContaining({
          fake: 'fake-response'
        }),
      }));
    });
  });

  it('can pass payload to generated function', async () => {
    const verifyFn = generateRequestFnFromLinks({
      oktaAuth: auth,
      accessToken: 'fake-token',
      methodName: 'verify',
      links: mockLinks,
    });
    await verifyFn({ verificationCode: '000000' });
    expect(auth.options.httpRequestClient).toHaveBeenCalledWith(
      'POST',
      'http://my-okta-domain/idp/myaccount/emails/00T196qTp3LIMZQ0L0g3/verify',
      {
        headers: {
          Accept: '*/*;okta-version=1.0.0',
          Authorization: 'Bearer fake-token',
          'Content-Type': 'application/json',
          'X-Okta-User-Agent-Extended': 'fake-okta-ua'
        },
        data: { verificationCode: '000000' },
        withCredentials: false
      }
    );
    expect(BaseTransaction).toHaveBeenCalledWith(auth, expect.objectContaining({
      accessToken: 'fake-token',
      res: expect.objectContaining({
        fake: 'fake-response'
      }),
    }));
  });

});
