jest.mock('../../../../lib/features', () => {
  const actual = jest.requireActual('../../../../lib/features');
  return {
    ...actual,
    isDPoPSupported: () => true
  }
});

jest.mock('../../../../lib/oidc/dpop', () => {
  const actual = jest.requireActual('../../../../lib/oidc/dpop');
  const keyPair = actual.generateKeyPair();

  return {
    ...actual,
    generateKeyPair: async () => await keyPair,
    findKeyPair: async () => await keyPair,
    createDPoPKeyPair: async () => {
      const kp = await keyPair;
      return  { keyPair: kp, keyPairId: 'foo' }
    }
  }
});

import {
  addEmail,
  deleteEmail,
  getEmail,
  getEmails,
  sendEmailChallenge,
  verifyEmailChallenge
} from '../../../../lib/myaccount';
import {
  createClient,
  signinAndGetTokens
} from '../../util';
import { EmailRole } from '../../../../lib/myaccount/types';
import { AuthApiError } from '../../../../lib/errors';
import { EmailTransaction } from '../../../../lib/myaccount/transactions';

// TODO: generate dynamic profile with a18n api
describe('MyAccount Email API', () => {
  let client, token;

  beforeAll(async () => {
    client = createClient({});
    const {
      tokens: {
        accessToken
      }
    } = await signinAndGetTokens(client, {
      scopes: [
        'openid',
        'profile',
        'okta.myAccount.email.read',
        'okta.myAccount.email.manage'
      ],
      acrValues: 'urn:okta:loa:2fa:any:ifpossible',
    });
    token = accessToken;

    if (process.env.USE_DPOP == '1') {
      token = accessToken;
    }
    else {
      token = accessToken?.accessToken;
    }
  });

  describe('getEmail/s', () => {
    it('can get email/s', async () => {
      let email;
      const transactions = await getEmails(client, {
        accessToken: token
      });
      for (const transaction of transactions) {
        expect(transaction).toMatchSnapshot({
          headers: expect.any(Object),
          id: expect.any(String),
          profile: {
            email: expect.any(String)
          },
          roles: expect.any(Array),
          status: expect.any(String)
        });

        // assign emailTransaction for later test use
        email = transaction;
      }

      // get email by id
      const transaction = await getEmail(client, {
        accessToken: token,
        id: email.id
      });
      expect(transaction).toMatchSnapshot({
        headers: expect.any(Object),
        id: expect.any(String),
        profile: {
          email: expect.any(String)
        },
        roles: expect.any(Array),
        status: expect.any(String)
      });
    });
  });

  describe('Email Management', () => {
    let email: EmailTransaction;

    afterEach(async () => {
      if (email) {
        try {
          await email.delete();
        } catch {
          // do nothing
        }
      }
    });

    it('can manage email with Transaction functions', async () => {
      // create test email
      email = await addEmail(client, {
        accessToken: token,
        payload: {
          profile: {
            email: 'fake1@acme.com'
          },
          sendEmail: false,
          role: EmailRole.SECONDARY
        }
      });


      expect(email).toMatchSnapshot({
        headers: expect.any(Object),
        id: expect.any(String),
        profile: {
          email: expect.any(String)
        }
      });

      // get email
      const getTransaction = await email.get();
      expect(getTransaction).toMatchSnapshot({
        headers: expect.any(Object),
        id: expect.any(String),
        profile: {
          email: expect.any(String)
        }
      });

      const challenge = await email.challenge();
      expect(challenge).toMatchSnapshot({
        headers: expect.any(Object),
        expiresAt: expect.any(String),
        id: expect.any(String),
        profile: {
          email: expect.any(String)
        }
      });

      const emailStatus = await challenge.poll();
      expect(emailStatus).toMatchSnapshot({
        headers: expect.any(Object),
        expiresAt: expect.any(String),
        id: expect.any(String),
        profile: {
          email: expect.any(String)
        }
      });

      try {
        // use invalid code to test the api. expect error
        // TODO: integrate with a18n api to test against real verification code
        await challenge.verify({ verificationCode: '000000' });
      } catch (err) {
        expect((err as AuthApiError).xhr?.status).toEqual(401);
      }

      // delete created email
      const deleteTransaction = await email.delete();
      expect(deleteTransaction).toMatchSnapshot();
    });

    it('can manage email with SDK methods', async () => {
      // create test email
      email = await addEmail(client, {
        accessToken: token,
        payload: {
          profile: {
            email: 'fake2@acme.com'
          },
          sendEmail: false,
          role: EmailRole.SECONDARY
        }
      });
      expect(email).toMatchSnapshot({
        headers: expect.any(Object),
        id: expect.any(String),
        profile: {
          email: expect.any(String)
        }
      });

      // send challenge code
      const challenge = await sendEmailChallenge(client, {
        id: email.id,
        accessToken: token,
      });
      expect(challenge).toMatchSnapshot({
        headers: expect.any(Object),
        expiresAt: expect.any(String),
        id: expect.any(String),
        profile: {
          email: expect.any(String)
        }
      });

      // verify challenge
      try {
        // use invalid code to test the api. expect error
        // TODO: integrate with a18n api to test against real verification code
        await verifyEmailChallenge(client, {
          accessToken: token,
          emailId: email.id,
          challengeId: challenge.id,
          payload: { verificationCode: '000000' }
        });
      } catch (err) {
        expect((err as AuthApiError).xhr?.status).toEqual(401);
      }

      // delete created email
      const deleteTransaction = await deleteEmail(client, {
        id: email.id,
        accessToken: token
      });
      expect(deleteTransaction).toMatchSnapshot();
    });

  });

});

