import {
  addPhone,
  deletePhone,
  sendPhoneChallenge,
  verifyPhoneChallenge
} from '../../../../lib/myaccount';
import {
  createClient,
  signinAndGetTokens
} from '../../util';
import { PhoneTransaction } from '../../../../lib/myaccount/transactions';

// TODO: generate dynamic profile with a18n api
describe('MyAccount Phone API', () => {
  let client, token;

  beforeAll(async () => {
    client = createClient({});
    const {
      tokens: {
        accessToken: { accessToken } = {}
      }
    } = await signinAndGetTokens(client, {
      scopes: [
        'openid',
        'profile',
        'okta.myAccount.phone.read',
        'okta.myAccount.phone.manage'
      ]
    });
    token = accessToken!;
  });

  describe('Manage with Transaction functions', () => {
    let phone: PhoneTransaction;

    afterEach(async () => {
      if (phone) {
        try {
          await phone.delete();
        } catch {
          // do nothing
        }
      }
    });

    it('can manage phone with transaction functions', async () => {
      // create test phone
      phone = await addPhone(client, {
        accessToken: token,
        payload: {
          profile: {
            phoneNumber: '+11234567890'
          },
          // verify link will be included in the response when sendCode is true
          // keep this flag as false in test to avoid sms rate limit issue
          sendCode: false,
          method: 'SMS'
        }
      });
      expect(phone).toMatchSnapshot({
        headers: expect.any(Object),
        _http: {
          headers: expect.any(Object),
        },
        id: expect.any(String),
        profile: {
          phoneNumber: expect.any(String)
        }
      });

      // get phone
      const transaction = await phone.get();
      expect(transaction).toMatchSnapshot({
        headers: expect.any(Object),
        _http: {
          headers: expect.any(Object),
        },
        id: expect.any(String),
        profile: {
          phoneNumber: expect.any(String)
        }
      });

      // send challenge code
      const challenge = await phone.challenge({ method: 'SMS' });
      expect(challenge).toMatchSnapshot({
        _http: {
          headers: expect.any(Object),
        }
      });

      // verify challenge code
      // no verify link when auto send is false
      // use sdk method instead
      // await expect(phone.verify!({ verificationCode: '000000' }))
      //   .rejects
      //   .toThrowErrorMatchingSnapshot();
      await expect(verifyPhoneChallenge(client, {
        accessToken: token,
        id: phone.id,
        payload: { verificationCode: '000000' }
      }))
        .rejects
        .toThrowErrorMatchingSnapshot();

      // delete
      const deleteTransaction = await phone.delete();
      expect(deleteTransaction._http.status).toEqual(204);
    });

  });

  describe('Manage with SDK methods', () => {
    let phone: PhoneTransaction;

    afterEach(async () => {
      if (phone) {
        try {
          await phone.delete();
        } catch {
          // do nothing
        }
      }
    });

    // TODO: integrate with i18n
    it('can manage phone with SDK methods', async () => {
      // create test phone
      phone = await addPhone(client, {
        accessToken: token,
        payload: {
          profile: {
            phoneNumber: '+12345678901'
          },
          sendCode: false,
          method: 'SMS'
        }
      });
      expect(phone).toMatchSnapshot({
        headers: expect.any(Object),
        _http: {
          headers: expect.any(Object),
        },
        id: expect.any(String),
        profile: {
          phoneNumber: expect.any(String)
        }
      });

      // send challenge code
      try {
        const challenge = await sendPhoneChallenge(client, {
          id: phone.id,
          payload: { method: 'SMS' },
          accessToken: token,
        });
        expect(challenge).toMatchSnapshot({
          _http: {
            headers: expect.any(Object),
          }
        });
      } catch (err) {
        // may failure due to - You have reached the limit of sms requests, please try again later.
        console.log(err);
      }

      // verify challenge
      // use invalid code to test the api. expect error
      // TODO: integrate with a18n api to test against real verification code
      await expect(verifyPhoneChallenge(client, {
        accessToken: token,
        id: phone.id,
        payload: { verificationCode: '000000' }
      }))
        .rejects
        .toThrowErrorMatchingSnapshot();

      // delete
      const transaction = await deletePhone(client, {
        accessToken: token,
        id: phone.id
      });
      expect(transaction._http.status).toEqual(204);

    });

  });

});
