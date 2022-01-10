import { StorageManagerOptions } from '../types';

export { default as storage } from '../server/serverStorage';

export const STORAGE_MANAGER_OPTIONS: StorageManagerOptions = {
  token: {
    storageTypes: [
      'memory'
    ]
  },
  cache: {
    storageTypes: [
      'memory'
    ]
  },
  transaction: {
    storageTypes: [
      'memory'
    ]
  }
};

export const enableSharedStorage = false;
