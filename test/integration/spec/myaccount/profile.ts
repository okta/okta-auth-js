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

import { getProfile, getProfileSchema, updateProfile } from '../../../../lib/myaccount';
import { createClient, signinAndGetTokens } from '../../util';

describe('MyAccount Profile API', () => {
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
        'okta.myAccount.profile.read',
        'okta.myAccount.profile.manage'
      ],
      acrValues: 'urn:okta:loa:2fa:any:ifpossible'
    });

    if (process.env.USE_DPOP == '1') {
      token = accessToken;
    }
    else {
      token = accessToken?.accessToken;
    }
  });

  describe('getProfile', () => {
    it('can get profile with "okta.myAccount.profile.read" in token scopes', async () => {
      const transaction = await getProfile(client, { accessToken: token });
      expect(transaction).toMatchSnapshot({
        createdAt: expect.any(String),
        modifiedAt: expect.any(String),
        headers: expect.any(Object),
        profile: expect.any(Object)
      });
    });
  });

  describe('updateProfile', () => {
    it('can update profile with "okta.myAccount.profile.manage" in token scopes', async () => {
      const { profile } = await getProfile(client, { accessToken: token });
      const transaction = await updateProfile(client, { 
        accessToken: token,
        payload: {
          profile: {
            ...profile,
            firstName: 'George-1'
          }
        }
      });
      expect(transaction.profile.firstName).toEqual('George-1');
      // resume first name
      await updateProfile(client, { 
        accessToken: token,
        payload: { profile }
      });
    });
  });

  describe('getProfileSchema', () => {
    it('can get profile schema with "okta.myAccount.profile.read" in token scopes', async () => {
      const transaction = await getProfileSchema(client, { accessToken: token });
      expect(transaction).toMatchSnapshot({
        headers: expect.any(Object),
        properties: expect.any(Object)
      });
    });
  });

});
