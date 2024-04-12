import { OktaAuth } from '@okta/okta-auth-js';
import tokens from '@okta/test.support/tokens';
import * as features from '../../../lib/features';
import { TokenManager } from '../../../lib/oidc/TokenManager';
import { InactiveTabService } from '../../../lib/services/InactiveTabService';

function createAuth(options) {
  options = options || {};
  return new OktaAuth({
    pkce: false,
    issuer: 'https://auth-js-test.okta.com',
    clientId: 'NPSfOkH5eZrTy8PMDlvx',
    redirectUri: 'https://example.com/redirect',
    storageUtil: options.storageUtil,
    services: options.services || {},
    tokenManager: options.tokenManager || {},
  });
}


describe('InactiveTabService', () => {
  let client: OktaAuth;
  let service: InactiveTabService;

  async function setup(options = {}, start = true) {
    client = createAuth(options);

    const tokenManager = client.tokenManager as TokenManager;
    tokenManager.renew = jest.fn().mockImplementation(() => Promise.resolve());
    tokenManager.remove = jest.fn();
    // clear downstream listeners
    tokenManager.off('added');
    tokenManager.off('removed');

    service = new InactiveTabService(tokenManager, (client.serviceManager as any).options);

    if (start) {
      client.tokenManager.start();
      await service.start();
    }
    return client;
  }

  beforeEach(function() {
    client = null as any;
    service = null as any;
    jest.useFakeTimers();
    jest.spyOn(features, 'isBrowser').mockReturnValue(true);
  });

  afterEach(async function() {
    if (service) {
      await service.stop();
    }
    if (client) {
      client.tokenManager.stop();
      client.tokenManager.clear();
    }
    jest.useRealTimers();
  });

  describe('start', () => {
    it('binds `visibilitychange` listener when started', async () => {
      const addEventSpy = jest.spyOn(document, 'addEventListener');
      await setup({}, false);
      client.tokenManager.start();
      await service.start();
      expect(addEventSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    });

    it('does not start service when autoRenew=false', async () => {
      const addEventSpy = jest.spyOn(document, 'addEventListener');
      await setup({ services: { autoRenew: false }}, false);
      client.tokenManager.start();
      await service.start();
      expect(addEventSpy).not.toHaveBeenCalled();
    });

    it('does not start service when renewOnTabActivation=false', async () => {
      const addEventSpy = jest.spyOn(document, 'addEventListener');
      await setup({ services: { renewOnTabActivation: false }}, false);
      client.tokenManager.start();
      await service.start();
      expect(addEventSpy).not.toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('removes `visibilitychange` listener when stopped', async () => {
      const removeEventSpy = jest.spyOn(document, 'removeEventListener');
      await setup();
      expect(service.isStarted()).toBe(true);
      await service.stop();
      expect(removeEventSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    });
  });

  describe('onPageVisbilityChange', () => {
    it('document is hidden', async () => {
      jest.spyOn(document, 'hidden', 'get').mockReturnValue(true);
      await setup();
      service.onPageVisbilityChange();
      expect(client.tokenManager.renew).not.toHaveBeenCalled();
    });

    it('should not renew if visibility toggle occurs within 30mins', async () => {
      jest.spyOn(document, 'hidden', 'get')
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
      await setup();
      service.onPageVisbilityChange();
      service.onPageVisbilityChange();
      expect(client.tokenManager.renew).not.toHaveBeenCalled();
    });

    it('should renew tokens if none exist', async () => {
      jest.spyOn(document, 'hidden', 'get')
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
      await setup();
      jest.spyOn(client.tokenManager, 'getTokensSync').mockReturnValue({});
      service.onPageVisbilityChange();
      jest.advanceTimersByTime((1800 * 1000) + 500);
      service.onPageVisbilityChange();
      expect(client.tokenManager.renew).not.toHaveBeenCalled();
    });

    it('should not renew tokens if they are not expired', async () => {
      const accessToken = tokens.standardAccessTokenParsed;
      const idToken = tokens.standardIdTokenParsed;
      const refreshToken = tokens.standardRefreshTokenParsed;
      jest.spyOn(document, 'hidden', 'get')
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
      await setup();
      jest.spyOn(client.tokenManager, 'getTokensSync').mockReturnValue({ accessToken, idToken, refreshToken });
      jest.spyOn(client.tokenManager, 'hasExpired').mockReturnValue(false);
      service.onPageVisbilityChange();
      jest.advanceTimersByTime((1800 * 1000) + 500);
      service.onPageVisbilityChange();
      expect(client.tokenManager.renew).not.toHaveBeenCalled();
    });

    it('should renew tokens after visiblity toggle', async () => {
      const accessToken = tokens.standardAccessTokenParsed;
      const idToken = tokens.standardIdTokenParsed;
      const refreshToken = tokens.standardRefreshTokenParsed;
      jest.spyOn(document, 'hidden', 'get')
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
      await setup();
      jest.spyOn(client.tokenManager, 'getTokensSync').mockReturnValue({ accessToken, idToken, refreshToken });
      service.onPageVisbilityChange();
      jest.advanceTimersByTime((1800 * 1000) + 500);
      service.onPageVisbilityChange();
      expect(client.tokenManager.renew).toHaveBeenCalled();
    });
  });
});
