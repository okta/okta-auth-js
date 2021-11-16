import { OktaAuth, BrowserStorageUtil } from '../types';

export const getStorage = (sdk: OktaAuth) => {
  const browserStorageUtil: BrowserStorageUtil = sdk.storageManager.storageUtil as BrowserStorageUtil;
  return browserStorageUtil.getLocalStorage();
};
