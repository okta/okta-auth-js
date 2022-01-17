import { StorageManagerOptions } from '../types';

export { default as storage } from '../browser/browserStorage';

export const DEFAULT_STORAGE_MANAGER_OPTIONS: StorageManagerOptions = {
  token: {
    storageTypes: [
      'localStorage',
      'sessionStorage',
      'cookie'
    ]
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
