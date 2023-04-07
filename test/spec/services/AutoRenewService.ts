/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


import { OktaAuth } from '@okta/okta-auth-js';
import tokens from '@okta/test.support/tokens';
import util from '@okta/test.support/util';
import SdkClock from '../../../lib/clock';
import * as features from '../../../lib/features';
import { AutoRenewService } from '../../../lib/services/AutoRenewService';
import { TokenManager } from '../../../lib/oidc/TokenManager';

const Emitter = require('tiny-emitter');

function createAuth(options) {
  options = options || {};
  jest.spyOn(SdkClock, 'create').mockReturnValue(new SdkClock(options.localClockOffset));
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

describe('AutoRenewService', function() {
  let client: OktaAuth;
  let service: AutoRenewService;

  async function setup(options = {}, start = true) {
    client = createAuth(options);

    const tokenManager = client.tokenManager as TokenManager;
    tokenManager.renew = jest.fn().mockImplementation(() => Promise.resolve());
    tokenManager.remove = jest.fn();
    // clear downstream listeners
    tokenManager.off('added');
    tokenManager.off('removed');

    service = new AutoRenewService(tokenManager, (client.serviceManager as any).options);

    if (start) {
      client.tokenManager.start();
      await service.start();
    }
    return client;
  }

  beforeEach(function() {
    client = null as any;
    service = null as any;
    util.disableLeaderElection();
    util.mockLeader();
    jest.useFakeTimers();
    jest.spyOn(features, 'isLocalhost').mockReturnValue(true);
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

  describe('autoRenew', function() {
    it('should register listener for "expired" event', async function() {
      jest.spyOn(Emitter.prototype, 'on');
      jest.spyOn(Emitter.prototype, 'off');
      await setup({ tokenManager: { autoRenew: true } }, false);
      client.tokenManager.start();
      await service.start();
      expect(Emitter.prototype.on).toHaveBeenCalledWith('expired', expect.any(Function));
      await service.stop();
      expect(Emitter.prototype.off).toHaveBeenCalledWith('expired', expect.any(Function));
    });

    it('calling start twice should register listener for "expired" event once', async () => {
      await setup({ tokenManager: { autoRenew: true } }, false);
      jest.spyOn(client.tokenManager, 'on');
      await Promise.all([
        service.start(),
        service.start()
      ]);
      expect(client.tokenManager.on).toHaveBeenCalledWith('expired', expect.any(Function));
      expect(client.tokenManager.on).toHaveBeenCalledTimes(1);
    });

    it('should renew token if expired after service start', async function() {
      await setup({
        tokenManager: { autoRenew: true }
      }, false);

      // start service
      await service.start();

      // start token manager
      client.tokenManager.start();
      
      // add expired token
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      jest.runAllTimers();

      // token should be renewed
      expect(client.tokenManager.renew).toHaveBeenCalledTimes(1);
      expect(client.tokenManager.renew).toHaveBeenCalledWith('test-idToken');
    });

    it('should renew token if expired before service start', async function() {
      await setup({
        tokenManager: { autoRenew: true }
      }, false);
      
      // add expired token
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      jest.runAllTimers();

      // start service
      await service.start();

      // start token manager
      client.tokenManager.start();
      jest.runAllTimers();

      // token should be renewed
      expect(client.tokenManager.renew).toHaveBeenCalledTimes(1);
      expect(client.tokenManager.renew).toHaveBeenCalledWith('test-idToken');
    });

    it('should renew token if expired before service start AND token manager was started prior to service', async function() {
      await setup({
        tokenManager: { autoRenew: true }
      }, false);

      // add expired token
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      jest.runAllTimers();

      // start token manager
      client.tokenManager.start();
      jest.runAllTimers();

      // start service
      await service.start();
      jest.runAllTimers();

      // token should be renewed
      expect(client.tokenManager.renew).toHaveBeenCalledTimes(1);
      expect(client.tokenManager.renew).toHaveBeenCalledWith('test-idToken');
    });

    describe('too many renew requests', () => {
      it('should emit too many renew error when latest 10 expired event happen in 30 seconds', async () => {
        await setup({
          tokenManager: { autoRenew: true }
        });
        const handler = jest.fn().mockImplementation(err => {
          util.expectErrorToEqual(err, {
            name: 'AuthSdkError',
            message: 'Too many token renew requests',
            errorCode: 'INTERNAL',
            errorSummary: 'Too many token renew requests',
            errorLink: 'INTERNAL',
            errorId: 'INTERNAL',
            errorCauses: []
          });
        });
        client.tokenManager.on('error', handler);
        let startTime = Math.round(Date.now() / 1000);
        // 2 * 10 < 30 => emit error
        for (let i = 0; i < 10; i++) {
          util.warpToUnixTime(startTime);
          client.emitter.emit('expired');
          startTime = startTime + 2;
        }
        expect(handler).toHaveBeenCalledTimes(1);
        expect(client.tokenManager.renew).toHaveBeenCalledTimes(9);
      });

      it('should keep emitting errors if expired events keep emitting in 30s', async () => {
        await setup({
          tokenManager: { autoRenew: true }
        });
        const handler = jest.fn();
        client.tokenManager.on('error', handler);
        let startTime = Math.round(Date.now() / 1000);
        // 2 * 10 < 30 => emit error
        for (let i = 0; i < 20; i++) {
          util.warpToUnixTime(startTime);
          client.emitter.emit('expired');
          startTime = startTime + 2;
        }
        expect(handler).toHaveBeenCalledTimes(11);
        expect(client.tokenManager.renew).toHaveBeenCalledTimes(9);
      });
  
      it('should not emit error if time diff for the latest 10 requests are more than 30s', async () => {
        await setup({
          tokenManager: { autoRenew: true }
        });
        const handler = jest.fn();
        client.tokenManager.on('error', handler);
        let startTime = Math.round(Date.now() / 1000);
        // 5 * 10 > 30 => not emit error
        for (let i = 0; i < 20; i++) {
          util.warpToUnixTime(startTime);
          client.emitter.emit('expired');
          startTime = startTime + 5;
        }
        expect(handler).not.toHaveBeenCalled();
        expect(client.tokenManager.renew).toHaveBeenCalledTimes(20);
      });

      it('should resume autoRenew if requests become normal again', async () => {
        await setup({
          tokenManager: { autoRenew: true }
        });
        const handler = jest.fn();
        client.tokenManager.on('error', handler);

        // trigger too many requests error
        // 10 * 2 < 30 => should emit error
        let startTime = Math.round(Date.now() / 1000);
        for (let i = 0; i < 20; i++) {
          util.warpToUnixTime(startTime);
          client.emitter.emit('expired');
          startTime = startTime + 2;
        }
        // resume to normal requests
        // wait 50s, then 10 * 5 > 30 => not emit error
        startTime = startTime + 50;
        util.warpToUnixTime(startTime);
        for (let i = 0; i < 10; i++) {
          util.warpToUnixTime(startTime);
          client.emitter.emit('expired');
          startTime = startTime + 5;
        }

        expect(handler).toHaveBeenCalledTimes(11);
        expect(client.tokenManager.renew).toHaveBeenCalledTimes(19);
      });
    });
  });

  describe('autoRemove', () => {
    it('should call tokenManager.remove() when autoRenew === false && autoRemove === true', async () => {
      await setup({ tokenManager: { autoRenew: false, autoRemove: true } });
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      util.warpToUnixTime(tokens.standardIdTokenClaims.iat);
      util.warpByTicksToUnixTime(tokens.standardIdTokenParsed.expiresAt + 1);
      expect(client.tokenManager.remove).toHaveBeenCalledWith('test-idToken');
    });

    it('should not call tokenManager.remove() when autoRenew === false && autoRemove === false', async () => {
      await setup({ tokenManager: { autoRenew: false, autoRemove: false } });
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      util.warpToUnixTime(tokens.standardIdTokenClaims.iat);
      util.warpByTicksToUnixTime(tokens.standardIdTokenParsed.expiresAt + 1);
      expect(client.tokenManager.remove).not.toHaveBeenCalled();
    });
  });

  describe('options.services config', () => {
    it('should register listener for "expired" event', async function() {
      jest.spyOn(Emitter.prototype, 'on');
      jest.spyOn(Emitter.prototype, 'off');
      await setup({ services: { autoRenew: true } }, false);
      client.tokenManager.start();
      await service.start();
      expect(Emitter.prototype.on).toHaveBeenCalledWith('expired', expect.any(Function));
      await service.stop();
      expect(Emitter.prototype.off).toHaveBeenCalledWith('expired', expect.any(Function));
    });

    it('should call tokenManager.remove() when autoRenew === false && autoRemove === true', async () => {
      await setup({ services: { autoRenew: false, autoRemove: true } });
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      util.warpToUnixTime(tokens.standardIdTokenClaims.iat);
      util.warpByTicksToUnixTime(tokens.standardIdTokenParsed.expiresAt + 1);
      expect(client.tokenManager.remove).toHaveBeenCalledWith('test-idToken');
    });

    it('should not call tokenManager.remove() when autoRenew === false && autoRemove === false', async () => {
      await setup({ services: { autoRenew: false, autoRemove: false } });
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      util.warpToUnixTime(tokens.standardIdTokenClaims.iat);
      util.warpByTicksToUnixTime(tokens.standardIdTokenParsed.expiresAt + 1);
      expect(client.tokenManager.remove).not.toHaveBeenCalled();
    });
  });

});
