import { 
  BaseTransaction,
  EmailTransaction,
  EmailStatusTransaction,
  EmailChallengeTransaction,
  ProfileTransaction,
  ProfileSchemaTransaction,
  PhoneTransaction
} from './transactions';
import { httpRequest } from '../http';
import { AuthSdkError } from '../errors';
import { MyAccountRequestOptions as RequestOptions } from './types';
import { OktaAuthInterface } from '../types';

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

export async function sendRequest<T extends BaseTransaction> (
  oktaAuth: OktaAuthInterface, 
  options: SendRequestOptions
): Promise<T | T[]> {
  if (!options.accessToken) {
    const { 
      accessToken: { accessToken } = {} 
    } = oktaAuth.tokenManager.getTokensSync();
    options.accessToken = accessToken;
  }
  const { issuer } = oktaAuth.options;
  const { url, method, payload } = options;
  const requestUrl = url.startsWith(issuer!) ? url : `${issuer}${url}`;
  const res = await httpRequest(oktaAuth, {
    headers: { 'Accept': '*/*;okta-version=1.0.0' },
    accessToken: options.accessToken,
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
    PhoneTransaction
  };
  const TransactionClass = map[options.transactionClassName!] || BaseTransaction;

  if (Array.isArray(res)) {
    return res.map(item => new TransactionClass(oktaAuth, { 
      res: item, 
      accessToken: options.accessToken!
    }));
  }

  return new TransactionClass(oktaAuth, { 
    res, 
    accessToken: options.accessToken!
  });
}

export type GenerateRequestFnFromLinksOptions = {
  oktaAuth: OktaAuthInterface;
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
