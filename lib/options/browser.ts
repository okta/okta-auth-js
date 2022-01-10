import { StorageManagerOptions } from '../types';

export { default as storage } from '../browser/browserStorage';

export const STORAGE_MANAGER_OPTIONS: StorageManagerOptions = {
  token: {
    storageTypes: [
      'localStorage',
      'sessionStorage',
      'cookie'
    ],
    useMultipleCookies: true
  },
  cache: {
    storageTypes: [
      'localStorage',
      'sessionStorage',
      'cookie'
    ]
  },
  transaction: {
    storageTypes: [
      'sessionStorage',
      'localStorage',
      'cookie'
    ]
  },
  'shared-transaction': {
    storageTypes: [
      'localStorage'
    ]
  },
  'original-uri': {
    storageTypes: [
      'localStorage'
    ]
  }
};

export const enableSharedStorage = true;
