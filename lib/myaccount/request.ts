import { 
  BaseTransaction,
  EmailTransaction,
  EmailStatusTransaction,
  EmailChallengeTransaction,
  ProfileTransaction,
  ProfileSchemaTransaction,
  PhoneTransaction,
  PasswordTransaction
} from './transactions';
import { httpRequest } from '../http';
import { AuthSdkError } from '../errors';
import { MyAccountRequestOptions as RequestOptions } from './types';
import { OktaAuthOAuthInterface } from '../oidc/types';

export type TransactionLink = {
  href: string;
  hints?: {
    allow?: string[];
  };
}

type TransactionLinks = {
  self: TransactionLink;
  [property: string]: TransactionLink;
}

type SendRequestOptions = RequestOptions & {
  url: string;
  method: string;
  transactionClassName?: string;
}

/* eslint-disable complexity */
export async function sendRequest<T extends BaseTransaction> (
  oktaAuth: OktaAuthOAuthInterface, 
  options: SendRequestOptions
): Promise<T | T[]> {
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

  const map = {
    EmailTransaction,
    EmailStatusTransaction,
    EmailChallengeTransaction,
    ProfileTransaction,
    ProfileSchemaTransaction,
    PhoneTransaction,
    PasswordTransaction
  };
  const TransactionClass = map[options.transactionClassName!] || BaseTransaction;

  if (Array.isArray(res)) {
    return res.map(item => new TransactionClass(oktaAuth, { 
      res: item, 
      accessToken
    }));
  }

  return new TransactionClass(oktaAuth, { 
    res, 
    accessToken
  });
}
/* eslint-enable complexity */

export type GenerateRequestFnFromLinksOptions = {
  oktaAuth: OktaAuthOAuthInterface;
  accessToken: string;
  methodName: string;
  links: TransactionLinks;
  transactionClassName?: string;
}

type IRequestFnFromLinks = <T extends BaseTransaction>(payload?) => Promise<T | T[]>;

export function generateRequestFnFromLinks ({
  oktaAuth, 
  accessToken,
  methodName,
  links,
  transactionClassName
}: GenerateRequestFnFromLinksOptions): IRequestFnFromLinks {
  for (const method of ['GET', 'POST', 'PUT', 'DELETE']) {
    if (method.toLowerCase() === methodName) {
      const link = links.self;
      return (async (payload?) => sendRequest(oktaAuth, {
        accessToken,
        url: link.href,
        method,
        payload,
        transactionClassName
      }));
    }
  }
  
  const link = links[methodName];
  if (!link) {
    throw new AuthSdkError(`No link is found with methodName: ${methodName}`);
  }

  return (async (payload?) => sendRequest(oktaAuth, {
    accessToken,
    url: link.href,
    method: link.hints!.allow![0],
    payload,
    transactionClassName
  }));
}
