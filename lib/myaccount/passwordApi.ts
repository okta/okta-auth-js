import { sendRequest } from './request';
import { IAPIFunction } from './types';
import {
  BaseTransaction, 
  PasswordTransaction
} from './transactions';

/**
 * @scope: okta.myAccount.password.read
 */
export const getPassword: IAPIFunction<PasswordTransaction> = async (
  oktaAuth,
  options
) => {
  const transaction = await sendRequest(oktaAuth, {
    url: `/idp/myaccount/password`,
    method: 'GET',
    accessToken: options?.accessToken,
  }, PasswordTransaction);
  return transaction;
};

/**
 * @scope: okta.myAccount.password.manage
 */
export const enrollPassword: IAPIFunction<PasswordTransaction> = async (
  oktaAuth, 
  options
): Promise<PasswordTransaction> => {
  const { accessToken, payload } = options!;
  const transaction = await sendRequest(oktaAuth, {
    url: '/idp/myaccount/password',
    method: 'POST',
    payload,
    accessToken,
  }, PasswordTransaction);
  return transaction;
};

/**
 * @scope: okta.myAccount.password.manage
 */
export const updatePassword: IAPIFunction<PasswordTransaction> = async (
  oktaAuth, 
  options
): Promise<PasswordTransaction> => {
  const { accessToken, payload } = options!;
  const transaction = await sendRequest(oktaAuth, {
    url: '/idp/myaccount/password',
    method: 'PUT',
    payload,
    accessToken,
  }, PasswordTransaction);
  return transaction;
};

/**
 * @scope: okta.myAccount.password.manage
 */
export const deletePassword: IAPIFunction<BaseTransaction> = async (
  oktaAuth, 
  options?
) => {
  const transaction = await sendRequest(oktaAuth, {
    url: `/idp/myaccount/password`,
    method: 'DELETE',
    accessToken: options?.accessToken,
  });
  return transaction;
};
