import { OktaAuth, NodeStorageUtil } from '../types';

export const getStorage = (sdk: OktaAuth) => {
  return (sdk.storageManager.storageUtil as NodeStorageUtil).getStorage();
};
