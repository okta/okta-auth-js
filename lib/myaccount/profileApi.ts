import { sendRequest } from './request';
import { IAPIFunction } from './types';
import {
  ProfileTransaction,
  ProfileSchemaTransaction
} from './transactions';

/**
 * @scope: okta.myAccount.profile.read
 */
export const getProfile: IAPIFunction<ProfileTransaction> = async (oktaAuth, options?) => {
  const transaction = await sendRequest(oktaAuth, {
    url: '/idp/myaccount/profile',
    method: 'GET',
    accessToken: options?.accessToken,
  }, ProfileTransaction);
  return transaction;
};

/**
 * @scope: okta.myAccount.profile.manage
 */
export const updateProfile: IAPIFunction<ProfileTransaction> = async (
  oktaAuth, 
  options
) => {
  const { payload, accessToken } = options!;
  const transaction = await sendRequest(oktaAuth, {
    url: '/idp/myaccount/profile',
    method: 'PUT',
    payload,
    accessToken,
  }, ProfileTransaction);
  return transaction;
};

/**
 * @scope: okta.myAccount.profile.read
 */
export const getProfileSchema: IAPIFunction<ProfileSchemaTransaction> = async (
  oktaAuth, 
  options?
): Promise<ProfileSchemaTransaction> => {
  const transaction = await sendRequest(oktaAuth, {
    url: '/idp/myaccount/profile/schema',
    method: 'GET',
    accessToken: options?.accessToken,
  }, ProfileSchemaTransaction);
  return transaction;
};
