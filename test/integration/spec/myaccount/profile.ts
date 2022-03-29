import { getProfile, getProfileSchema, updateProfile } from '../../../../lib/myaccount';
import { createClient, signinAndGetTokens } from '../../util';

describe('MyAccount Profile API', () => {

  describe('getProfile', () => {
    it('can get profile with "okta.myAccount.profile.read" in token scopes', async () => {
      const client = createClient({});
      const scopes = [
        'openid', 
        'profile', 
        'okta.myAccount.profile.read'
      ];
      const { 
        tokens: { 
          accessToken: { accessToken } = {}
        } 
      } = await signinAndGetTokens(client, { scopes });
      const transaction = await getProfile(client, { accessToken });
      expect(transaction).toMatchSnapshot({
        createdAt: expect.any(String),
        modifiedAt: expect.any(String),
        headers: expect.any(Object),
        _http: {
          headers: expect.any(Object),
        },
        profile: expect.any(Object)
      });
    });
  });

  describe('updateProfile', () => {
    it('can update profile with "okta.myAccount.profile.manage" in token scopes', async () => {
      const client = createClient({});
      const scopes = [
        'openid', 
        'profile', 
        'okta.myAccount.profile.manage'
      ];
      const { 
        tokens: { 
          accessToken: { accessToken } = {}
        } 
      } = await signinAndGetTokens(client, { scopes });
      const { profile } = await getProfile(client, { accessToken });
      const transaction = await updateProfile(client, { 
        accessToken,
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
        accessToken,
        payload: { profile }
      });
    });
  });

  describe('getProfileSchema', () => {
    it('can get profile schema with "okta.myAccount.profile.read" in token scopes', async () => {
      const client = createClient({});
      const scopes = [
        'openid', 
        'profile', 
        'okta.myAccount.profile.read'
      ];
      const { 
        tokens: { 
          accessToken: { accessToken } = {}
        } 
      } = await signinAndGetTokens(client, { scopes });
      const transaction = await getProfileSchema(client, { accessToken });
      expect(transaction).toMatchSnapshot({
        headers: expect.any(Object),
        _http: {
          headers: expect.any(Object),
        },
        properties: expect.any(Object)
      });
    });
  });

});
