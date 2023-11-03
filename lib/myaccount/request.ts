import { 
  default as BaseTransaction,
  TransactionType,
  TransactionLinks
} from './transactions/Base';
import { httpRequest } from '../http';
import { AuthSdkError } from '../errors';
import { MyAccountRequestOptions as RequestOptions } from './types';
import { OktaAuthOAuthInterface } from '../oidc/types';

type SendRequestOptions = RequestOptions & {
  url: string;
  method: string;
}

/* eslint-disable complexity */
export async function sendRequest<
  T extends BaseTransaction = BaseTransaction,
  N extends 'plural' | 'single' = 'single',
  NT = N extends 'plural' ? T[] : T
> (
  oktaAuth: OktaAuthOAuthInterface, 
  options: SendRequestOptions,
  TransactionClass: TransactionType<T> = BaseTransaction as TransactionType<T>,
): Promise<NT> {
  const {
    accessToken: accessTokenObj
  } = oktaAuth.tokenManager.getTokensSync();
  
  const accessToken = options.accessToken || accessTokenObj?.accessToken;
  const issuer = oktaAuth.getIssuerOrigin();
  const { url, method, payload } = options;
  const requestUrl = url.startsWith(issuer!) ? url : `${issuer}${url}`;

  if (!accessToken) {
    throw new AuthSdkError('AccessToken is required to request MyAccount API endpoints.');
  }
  
  const res = await httpRequest(oktaAuth, {
    headers: { 'Accept': '*/*;okta-version=1.0.0' },
    accessToken,
    url: requestUrl,
    method,
    ...(payload && { args: payload })
  });

  let ret: T | T[];
  if (Array.isArray(res)) {
    ret = res.map(item => new TransactionClass(oktaAuth, { 
      res: item, 
      accessToken
    }));
  } else {
    ret = new TransactionClass(oktaAuth, { 
      res, 
      accessToken
    });
  }
  return ret as NT;
}
/* eslint-enable complexity */

export type GenerateRequestFnFromLinksOptions = {
  oktaAuth: OktaAuthOAuthInterface;
  accessToken: string;
  methodName: string;
  links: TransactionLinks;
}

type IRequestFnFromLinks<T extends BaseTransaction> = (payload?) => Promise<T>;

export function generateRequestFnFromLinks<T extends BaseTransaction>(
  {
    oktaAuth, 
    accessToken,
    methodName,
    links,
  }: GenerateRequestFnFromLinksOptions,
  TransactionClass: TransactionType<T> = BaseTransaction as TransactionType<T>,
): IRequestFnFromLinks<T> {
  for (const method of ['GET', 'POST', 'PUT', 'DELETE']) {
    if (method.toLowerCase() === methodName) {
      const link = links.self;
      return (async (payload?) => sendRequest<T, 'single'>(oktaAuth, {
        accessToken,
        url: link.href,
        method,
        payload,
      }, TransactionClass));
    }
  }
  
  const link = links[methodName];
  if (!link) {
    throw new AuthSdkError(`No link is found with methodName: ${methodName}`);
  }

  return (async (payload?) => sendRequest<T, 'single'>(oktaAuth, {
    accessToken,
    url: link.href,
    method: link.hints!.allow![0],
    payload,
  }, TransactionClass));
}
