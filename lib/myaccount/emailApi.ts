import { sendRequest } from './request';
import { 
  IAPIFunction, 
  BaseTransaction, 
  EmailTransaction, 
  EmailChallengeTransaction 
} from './types';

/**
 * @scope: okta.myaccount.email.read
 */
export const getEmails: IAPIFunction<EmailTransaction[]> = async (
  oktaAuth,
  options?
) => {
  const transaction = await sendRequest(oktaAuth, {
    url: '/idp/myaccount/emails',
    method: 'GET',
    accessToken: options?.accessToken,
    transactionClassName: 'EmailTransaction'
  }) as EmailTransaction[];
  return transaction;
};

/**
 * @scope: okta.myaccount.email.read
 */
export const getEmail: IAPIFunction<EmailTransaction> = async (
  oktaAuth, 
  options
) => {
  const { id, accessToken } = options!;
  const transaction = await sendRequest(oktaAuth, {
    url: `/idp/myaccount/emails/${id}`,
    method: 'GET',
    accessToken,
    transactionClassName: 'EmailTransaction'
  }) as EmailTransaction;
  return transaction;
};

/**
 * @scope: okta.myaccount.email.manage
 */
export const addEmail: IAPIFunction<EmailTransaction> = async (
  oktaAuth, 
  options
): Promise<EmailTransaction> => {
  const { accessToken, payload } = options!;
  const transaction = await sendRequest(oktaAuth, {
    url: '/idp/myaccount/emails',
    method: 'POST',
    payload,
    accessToken,
    transactionClassName: 'EmailTransaction'
  }) as EmailTransaction;
  return transaction;
};

/**
 * @scope: okta.myaccount.email.manage
 */
export const deleteEmail: IAPIFunction<BaseTransaction> = async (
  oktaAuth, 
  options
) => {
  const { id, accessToken } = options!;
  const transaction = await sendRequest(oktaAuth, {
    url: `/idp/myaccount/emails/${id}`,
    method: 'DELETE',
    accessToken
  }) as BaseTransaction;
  return transaction;
};

/**
 * @scope: okta.myaccount.email.read
 */
export const sendEmailChallenge: IAPIFunction<EmailChallengeTransaction> = async (
  oktaAuth, 
  options
) => {
  const { id, accessToken } = options!;
  const transaction = await sendRequest(oktaAuth, {
    url: `/idp/myaccount/emails/${id}/challenge`,
    method: 'POST',
    accessToken,
    transactionClassName: 'EmailChallengeTransaction'
  }) as EmailChallengeTransaction;
  return transaction;
};

/**
 * @scope: okta.myaccount.email.read
 */
export const getEmailChallenge: IAPIFunction<EmailChallengeTransaction> = async (
  oktaAuth, 
  options
) => {
  const { emailId, challengeId, accessToken } = options!;
  const transaction = await sendRequest(oktaAuth, {
    url: `/idp/myaccount/emails/${emailId}/challenge/${challengeId}`,
    method: 'POST',
    accessToken,
    transactionClassName: 'EmailChallengeTransaction'
  }) as EmailChallengeTransaction;
  return transaction;
};

/**
 * @scope: okta.myaccount.email.manage
 */
export const verifyEmailChallenge: IAPIFunction<BaseTransaction> = async (
  oktaAuth,
  options
) => {
  const { emailId, challengeId, payload, accessToken } = options!;
  const transaction = await sendRequest(oktaAuth, {
    url: `/idp/myaccount/emails/${emailId}/challenge/${challengeId}/verify`,
    method: 'POST',
    payload,
    accessToken
  }) as BaseTransaction;
  return transaction;
};
