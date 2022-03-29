import { sendRequest } from './request';
import { 
  IAPIFunction,
  ProfileTransaction,
  ProfileSchemaTransaction
} from './types';

/**
 * @scope: okta.myaccount.profile.read
 */
export const getProfile: IAPIFunction<ProfileTransaction> = async (oktaAuth, options?) => {
  const transaction = await sendRequest(oktaAuth, {
    url: '/idp/myaccount/profile',
    method: 'GET',
    accessToken: options?.accessToken,
    transactionClassName: 'ProfileTransaction'
  }) as ProfileTransaction;
  return transaction;
};

/**
 * @scope: okta.myaccount.profile.manage
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
    transactionClassName: 'ProfileTransaction'
  }) as ProfileTransaction;
  return transaction;
};

/**
 * @scope: okta.myaccount.profile.read
 */
export const getProfileSchema: IAPIFunction<ProfileSchemaTransaction> = async (
  oktaAuth, 
  options?
): Promise<ProfileSchemaTransaction> => {
  const transaction = await sendRequest(oktaAuth, {
    url: '/idp/myaccount/profile/schema',
    method: 'GET',
    accessToken: options?.accessToken,
    transactionClassName: 'ProfileSchemaTransaction'
  }) as ProfileSchemaTransaction;
  return transaction;
};
