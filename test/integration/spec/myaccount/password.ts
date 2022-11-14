import {
  getPassword,
  enrollPassword,
  updatePassword,
  deletePassword
} from '../../../../lib/myaccount';
import {
  createClient,
  signinAndGetTokens,
  signinAndGetTokensViaEmail
} from '../../util';
import { PasswordTransaction } from '../../../../lib/myaccount/transactions';

// TODO: generate dynamic profile with a18n api
describe('MyAccount Password API', () => {
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
        'okta.myAccount.password.read',
        'okta.myAccount.password.manage'
      ]
    });
    token = accessToken!;

    try {
      const { status, tokens } = await signinAndGetTokensViaEmail(client);
      console.log('#####', status, tokens, '######');
    }
    catch (err) {
      console.log('#####', err, '######');
    }
  });

  describe('Manage with Transaction functions', () => {
    let password: PasswordTransaction;

    afterEach(async () => {
      if (password && password.delete) {
        try {
          await password.delete();
        } catch {
          // do nothing
        }
      }
    });

    it.only('can manage password with transaction functions', async () => {
      password = await enrollPassword(client, {
        accessToken: token,
        payload: {
          profile: {
            password: 'MyPassword'
          }
        }
      });
      expect(password).toMatchSnapshot({
        headers: expect.any(Object),
        id: expect.any(String),
        status: expect('ACTIVE')
      });

      // get password (status ACTIVE)
      let transaction = await password.get();
      expect(transaction).toMatchSnapshot({
        headers: expect.any(Object),
        id: expect.any(String),
        status: expect('ACTIVE')
      });

      // update password
      transaction = await password.update!({
        profile: {
          password: 'MyUpdatedPassword'
        }
      });
      expect(transaction).toMatchSnapshot({
        headers: expect.any(Object),
        id: expect.any(String),
        status: expect('ACTIVE')
      });

      // delete
      const deleteTransaction = await password.delete!();
      expect(deleteTransaction).toMatchSnapshot();

      // get password (status NOT_ENROLLED)
      transaction = await password.get();
      expect(transaction).toMatchSnapshot({
        headers: expect.any(Object),
        status: expect('NOT_ENROLLED')
      });

      transaction = await password.enroll!({
        profile: {
          password: 'MyNewlyEnrolledPassword'
        }
      });
      expect(transaction).toMatchSnapshot({
        headers: expect.any(Object),
        id: expect.any(String),
        status: expect('ACTIVE')
      });

      // clean up
      await password.delete!();
    });
  });

  describe('Manage with SDK methods', () => {
    let password: PasswordTransaction;

    afterEach(async () => {
      if (password && password.delete) {
        try {
          await password.delete();
        } catch {
          // do nothing
        }
      }
    });

    it('can manage password with SDK methods', async () => {
      // create test password
      password = await enrollPassword(client, {
        accessToken: token,
        payload: {
          profile: {
            password: 'MyPassword'
          },
        }
      });
      expect(password).toMatchSnapshot({
        headers: expect.any(Object),
        id: expect.any(String),
        status: expect('ACTIVE')
      });

      // get password
      password = await getPassword(client, { accessToken: token });
      expect(password).toMatchSnapshot({
        headers: expect.any(Object),
        id: expect.any(String),
        status: expect('ACTIVE')
      });

      password = await updatePassword(client, {
        accessToken: token,
        payload: {
          profile: {
            password: 'MyPassword'
          },
        }
      });
      expect(password).toMatchSnapshot({
        headers: expect.any(Object),
        id: expect.any(String),
        status: expect('ACTIVE')
      });

      // delete
      const deleteTransaction = await deletePassword(client, { accessToken: token });
      expect(deleteTransaction).toMatchSnapshot({
        headers: expect.any(Object),
        status: expect('NOT_ENROLLED')
      });
    });

  });

});
