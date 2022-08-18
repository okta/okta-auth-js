import { OAuthTransactionMeta } from '../../../lib/types';
import {
  clearTransactionFromSharedStorage,
  loadTransactionFromSharedStorage,
  pruneSharedStorage,
  saveTransactionToSharedStorage
} from '../../../lib/oidc/util/sharedStorage';

const THIRTY_MINUTES = 30 * 60 * 1000; // 30 minutes

describe('sharedStorage', () => {
  let testContext;

  function mockStorage() {
    return {
      getStorage: jest.fn(),
      setStorage: jest.fn()
    };
  }

  beforeEach(() => {
    const sharedTransactionStorage = mockStorage();
    const storageManager = {
      getSharedTansactionStorage: jest.fn().mockReturnValue(sharedTransactionStorage)
    };
    testContext = {
      storageManager,
      sharedTransactionStorage
    };
  });

  describe('clearTransactionFromSharedStorage', () => {
    it('deletes the entry associated with the passed state', () => {
      const { storageManager, sharedTransactionStorage } = testContext;
      const storage = {
        stateA: 'foo',
        stateB: 'bar'
      };
      sharedTransactionStorage.getStorage.mockReturnValue(storage);
      clearTransactionFromSharedStorage(storageManager, 'stateA');
      expect(sharedTransactionStorage.getStorage).toHaveBeenCalledWith();
      expect(sharedTransactionStorage.setStorage).toHaveBeenCalledWith({
        stateB: 'bar'
      });
    });

    it('does not fail or delete entries if there is no entry associated with the passed state', () => {
      const { storageManager, sharedTransactionStorage } = testContext;
      const storage = {
        stateA: 'foo',
        stateB: 'bar'
      };
      sharedTransactionStorage.getStorage.mockReturnValue(storage);
      clearTransactionFromSharedStorage(storageManager, 'stateC');
      expect(sharedTransactionStorage.getStorage).toHaveBeenCalledWith();
      expect(sharedTransactionStorage.setStorage).toHaveBeenCalledWith({
        stateA: 'foo',
        stateB: 'bar'
      });
    });
  });

  describe('loadTransactionFromSharedStorage', () => {
    it('returns the transaction meta from the saved entry', () => {
      const { storageManager, sharedTransactionStorage } = testContext;
      const meta = {
        redirectUri: 'http://localhost/fake',
        codeVerifier: 'fake'
      };
      const storage = {
        stateA: {
          transaction: meta
        }
      };
      sharedTransactionStorage.getStorage.mockReturnValue(storage);
      const res = loadTransactionFromSharedStorage(storageManager, 'stateA');
      expect(res).toBe(meta);
    });
    it('returns null if there is no entry for the passed state', () => {
      const { storageManager, sharedTransactionStorage } = testContext;
      sharedTransactionStorage.getStorage.mockReturnValue({});
      const res = loadTransactionFromSharedStorage(storageManager, 'stateB');
      expect(res).toBe(null);
    });
    it('returns null if the entry does not have valid transaction meta', () => {
      const { storageManager, sharedTransactionStorage } = testContext;
      const storage = {
        stateA: 'foo'
      };
      sharedTransactionStorage.getStorage.mockReturnValue(storage);
      const res = loadTransactionFromSharedStorage(storageManager, 'stateA');
      expect(res).toBe(null);
    });
  });

  describe('saveTransactionToSharedStorage', () => {
    it('saves the meta with a timestamp', () => {
      const { storageManager, sharedTransactionStorage } = testContext;
      sharedTransactionStorage.getStorage.mockReturnValue({});
      const meta = {
        redirectUri: 'http://localhost/fake',
        codeVerifier: 'fake'
      };
      const mockDate = 42;
      jest.spyOn(Date, 'now').mockReturnValue(mockDate);
      saveTransactionToSharedStorage(storageManager, 'stateA', meta as unknown as OAuthTransactionMeta);
      expect(sharedTransactionStorage.getStorage).toHaveBeenCalledWith();
      expect(sharedTransactionStorage.setStorage).toHaveBeenCalledWith({
        stateA: {
          dateCreated: mockDate,
          transaction: meta
        }
      });
    });
    it('will overwrite stored entry with same state value', () => {
      const { storageManager, sharedTransactionStorage } = testContext;
      const storage = {
        stateA: {
          dateCreated: 21,
          transaction: {}
        }
      };
      sharedTransactionStorage.getStorage.mockReturnValue(storage);
      const meta = {
        redirectUri: 'http://localhost/fake',
        codeVerifier: 'fake'
      };
      const mockDate = 42;
      jest.spyOn(Date, 'now').mockReturnValue(mockDate);
      saveTransactionToSharedStorage(storageManager, 'stateA', meta as unknown as OAuthTransactionMeta);
      expect(sharedTransactionStorage.getStorage).toHaveBeenCalledWith();
      expect(sharedTransactionStorage.setStorage).toHaveBeenCalledWith({
        stateA: {
          dateCreated: mockDate,
          transaction: meta
        }
      });
    });
  });

  describe('pruneSharedStorage', () => {
    it('removes entries that are more than 30 minutes old', () => {
      const { storageManager, sharedTransactionStorage } = testContext;
      const mockNow = THIRTY_MINUTES * 10;
      jest.spyOn(Date, 'now').mockReturnValue(mockNow);

      const storage = {
        stateA: {
          dateCreated: mockNow
        },
        stateB: {
          dateCreated: mockNow - THIRTY_MINUTES // will not be removed
        },
        stateC: {
          dateCreated: mockNow - THIRTY_MINUTES - 1 // will be removed
        }
      };
      sharedTransactionStorage.getStorage.mockReturnValue(storage);

      pruneSharedStorage(storageManager);
      expect(sharedTransactionStorage.getStorage).toHaveBeenCalledWith();
      expect(sharedTransactionStorage.setStorage).toHaveBeenCalledWith({
        stateA: {
          dateCreated: mockNow
        },
        stateB: {
          dateCreated: mockNow - THIRTY_MINUTES
        }
      });
    });
    it('does not remove any entries if they are not more than 30 minutes old', () => {
      const { storageManager, sharedTransactionStorage } = testContext;
      const mockNow = THIRTY_MINUTES * 10;
      jest.spyOn(Date, 'now').mockReturnValue(mockNow);

      const storage = {
        stateA: {
          dateCreated: mockNow - 10
        },
        stateB: {
          dateCreated: mockNow - THIRTY_MINUTES // will not be removed
        }
      };
      sharedTransactionStorage.getStorage.mockReturnValue(storage);

      pruneSharedStorage(storageManager);
      expect(sharedTransactionStorage.getStorage).toHaveBeenCalledWith();
      expect(sharedTransactionStorage.setStorage).toHaveBeenCalledWith({
        stateA: {
          dateCreated: mockNow - 10
        },
        stateB: {
          dateCreated: mockNow - THIRTY_MINUTES
        }
      });
    });
  });
});
