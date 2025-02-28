jest.mock('../../../../lib/features', () => {
  const actual = jest.requireActual('../../../../lib/features');
  return {
    ...actual,
    isDPoPSupported: () => true
  };
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
      return  { keyPair: kp, keyPairId: 'foo' };
    }
  };
});

import {
  getPassword,
  enrollPassword,
  updatePassword,
  deletePassword
} from '../../../../lib/myaccount';
import {
  createClient,
  signinAndGetTokensViaEmail
} from '../../util';
import { PasswordTransaction } from '../../../../lib/myaccount/transactions';

// TODO: generate dynamic profile with a18n api
describe('MyAccount Password API', () => {
  let client, token;

  beforeAll(async () => {
    client = createClient({});
    try {
      const { tokens } = await signinAndGetTokensViaEmail(client, {
        scopes: [
          'openid',
          'profile',
          'okta.myAccount.password.read',
          'okta.myAccount.password.manage'
        ]
      });
      console.log(tokens);

      if (process.env.USE_DPOP == '1') {
        token = tokens.accessToken;
      }
      else {
        token = tokens.accessToken!.accessToken;
      }
    }
    catch (err) {
      console.log('SETUP FAILED');
      console.log(err);
    }
  });

  afterEach(async () => {
    try {
      await deletePassword(client, { accessToken: token });
    } catch {
      // do nothing
    }
  });

  describe('Manage with Transaction functions', () => {
    let password: PasswordTransaction;

   it('can manage password with transaction functions', async () => {
      password = await enrollPassword(client, {
        accessToken: token,
        payload: {
          profile: {
            password: 'MyPassword1'
          }
        }
      });
      expect(password).toMatchSnapshot({
        headers: expect.any(Object),
        id: expect.any(String),
        status: 'ACTIVE',
        get: expect.any(Function),
        update: expect.any(Function),
        delete: expect.any(Function),
      });

      // get password (status ACTIVE)
      password = await password.get!();
      expect(password).toMatchSnapshot({
        headers: expect.any(Object),
        id: expect.any(String),
        status: 'ACTIVE',
        get: expect.any(Function),
        update: expect.any(Function),
        delete: expect.any(Function),
      });

      // update password
      password = await password.update!({
        profile: {
          password: 'MyPassword2',
          currentPassword: 'MyPassword1'
        }
      });
      expect(password).toMatchSnapshot({
        headers: expect.any(Object),
        id: expect.any(String),
        status: 'ACTIVE',
        get: expect.any(Function),
        update: expect.any(Function),
        delete: expect.any(Function),
      });

      // delete
      const deleteTransaction = await password.delete!();
      expect(deleteTransaction).toMatchSnapshot();

      // get password (status NOT_ENROLLED)
      password = await getPassword(client, {
        accessToken: token
      });
      expect(password).toMatchSnapshot({
        headers: expect.any(Object),
        status: 'NOT_ENROLLED',
        enroll: expect.any(Function),
      });

      password = await password.enroll!({
        profile: {
          password: 'MyPassword3'
        }
      });
      expect(password).toMatchSnapshot({
        headers: expect.any(Object),
        id: expect.any(String),
        status: 'ACTIVE'
      });
    });
  });

  describe('Manage with SDK methods', () => {
    let password: PasswordTransaction;

    it('can manage password with SDK methods', async () => {
      // create test password
      password = await enrollPassword(client, {
        accessToken: token,
        payload: {
          profile: {
            password: 'MyPassword1'
          },
        }
      });
      expect(password).toMatchSnapshot({
        headers: expect.any(Object),
        id: expect.any(String),
        status: 'ACTIVE',
        get: expect.any(Function),
        update: expect.any(Function),
        delete: expect.any(Function),
      });

      // get password
      password = await getPassword(client, { accessToken: token });
      expect(password).toMatchSnapshot({
        headers: expect.any(Object),
        id: expect.any(String),
        status: 'ACTIVE',
        get: expect.any(Function),
        update: expect.any(Function),
        delete: expect.any(Function),
      });

      password = await updatePassword(client, {
        accessToken: token,
        payload: {
          profile: {
            password: 'MyPassword2'
          },
        }
      });
      expect(password).toMatchSnapshot({
        headers: expect.any(Object),
        id: expect.any(String),
        status: 'ACTIVE',
        get: expect.any(Function),
        update: expect.any(Function),
        delete: expect.any(Function),
      });

      // delete
      const deleteTransaction = await deletePassword(client, { accessToken: token });
      expect(deleteTransaction).toMatchSnapshot();
    });
  });

});
