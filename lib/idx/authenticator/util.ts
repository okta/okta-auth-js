import { Authenticator, isAuthenticator } from '../types';

export function formatAuthenticator(incoming: unknown): Authenticator {
  let authenticator: Authenticator;
  if  (isAuthenticator(incoming)) {
    authenticator = incoming;
  } else if (typeof incoming === 'string') {
    authenticator = {
      key: incoming
    };
  } else {
    throw new Error('Invalid format for authenticator');
  }
  return authenticator;
}

// Returns true if the authenticators are equivalent
export function compareAuthenticators(auth1, auth2) {
  if (!auth1 || !auth2) {
    return false;
  }
  // by id
  if (auth1.id && auth2.id) {
    return (auth1.id === auth2.id);
  }
  // by key
  if (auth1.key && auth2.key) {
    return (auth1.key === auth2.key);
  }
  return false;
}

// Find matched authenticator in provided order
export function findMatchedOption(authenticators, options) {
  let option;
  for (let authenticator of authenticators) {
    option = options
      .find(({ relatesTo }) => relatesTo.key && relatesTo.key === authenticator.key);
    if (option) {
      break;
    }
  }
  return option;
}