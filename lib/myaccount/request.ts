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
import { AuthApiError, AuthSdkError } from '../errors';
import { decodeToken, getWithRedirect } from '../oidc';
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

type InsufficientAuthenticationError = {
  error: string;
  // eslint-disable-next-line camelcase
  error_description: string;
  // eslint-disable-next-line camelcase
  max_age: string;
}

const parseInsufficientAuthenticationError = (
  header: string
): InsufficientAuthenticationError => {
  if (!header) {
    throw new AuthSdkError('Missing header string');
  }

  return header
    .split(',')
    .map(part => part.trim())
    .map(part => part.split('='))
    .reduce((acc, curr) => {
      acc[curr[0]] = curr[1];
      return acc;
    }, {}) as InsufficientAuthenticationError;
};

/* eslint-disable complexity */
export async function sendRequest<T extends BaseTransaction> (
  oktaAuth: OktaAuthInterface, 
  options: SendRequestOptions
): Promise<T | T[]> {
  const { 
    accessToken: accessTokenObj,
    idToken: idTokenObj 
  } = oktaAuth.tokenManager.getTokensSync();
  
  const idToken = idTokenObj?.idToken;
  const accessToken = options.accessToken || accessTokenObj?.accessToken;
  const { issuer } = oktaAuth.options;
  const { url, method, payload } = options;
  const requestUrl = url.startsWith(issuer!) ? url : `${issuer}${url}`;

  if (!accessToken) {
    throw new AuthSdkError('AccessToken is required to request MyAccount API endpoints.');
  }
  
  let res;
  try {
    res = await httpRequest(oktaAuth, {
      headers: { 'Accept': '*/*;okta-version=1.0.0' },
      accessToken,
      url: requestUrl,
      method,
      ...(payload && { args: payload })
    });
  } catch (err) {
    const errorResp = (err as AuthApiError).xhr;
    if (idToken && errorResp?.status === 403 && !!errorResp?.headers?.['www-authenticate']) {
      const error = parseInsufficientAuthenticationError(errorResp?.headers?.['www-authenticate']);
      if (error?.error?.includes('insufficient_authentication_context')) {
        const scopes = decodeToken(accessToken).payload.scp!;
        // reauthentication - this call triggers redirect
        await getWithRedirect(
          oktaAuth, 
          {
            prompt: 'login',
            maxAge: +error.max_age,
            scopes,
            extraParams: {
              // eslint-disable-next-line camelcase
              id_token_hint: idToken
            }
          }
        );
      } else {
        throw err;
      }
    } else {
      throw err;
    }
  }

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
