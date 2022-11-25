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

const Emitter = require('tiny-emitter');

function createAuth(options) {
  options = options || {};
  options.tokenManager = options.tokenManager || {};
  jest.spyOn(SdkClock, 'create').mockReturnValue(new SdkClock(options.localClockOffset));
  return new OktaAuth({
    pkce: false,
    issuer: 'https://auth-js-test.okta.com',
    clientId: 'NPSfOkH5eZrTy8PMDlvx',
    redirectUri: 'https://example.com/redirect',
    storageUtil: options.storageUtil,
    services: options.services || {},
    tokenManager: {
      expireEarlySeconds: options.tokenManager.expireEarlySeconds || 0,
      storage: options.tokenManager.storage,
      storageKey: options.tokenManager.storageKey,
      autoRenew: options.tokenManager.autoRenew || false,
      autoRemove: options.tokenManager.autoRemove || false,
      secure: options.tokenManager.secure, // used by cookie storage,
      clearPendingRemoveTokens: options.tokenManager.clearPendingRemoveTokens !== false
    }
  });
}

describe('AutoRenewService', function() {
  let client;

  function setupSync(options = {}, start = false) {
    client = createAuth(options);
    // clear downstream listeners
    client.tokenManager.off('added');
    client.tokenManager.off('removed');

    if (start) {
      client.tokenManager.start();
    }
    return client;
  }

  beforeEach(function() {
    client = null;
  });
  afterEach(async function() {
    if (client) {
      client.tokenManager.stop();
      client.tokenManager.clear();
      await client.serviceManager.stop();
    }
    jest.useRealTimers();
  });


  describe('autoRenew', function() {
    beforeEach(function() {
      jest.useFakeTimers();
      jest.spyOn(features, 'isLocalhost').mockReturnValue(true);
      util.disableLeaderElection();
      util.mockLeader();
    });
    afterEach(async () => {
      jest.useRealTimers();
    });

    it('should register listener for "expired" event', async function() {
      jest.spyOn(Emitter.prototype, 'on');
      jest.spyOn(Emitter.prototype, 'off');
      setupSync({ tokenManager: { autoRenew: true } }, true);
      client.tokenManager.start();
      await client.serviceManager.start();
      expect(Emitter.prototype.on).toHaveBeenCalledWith('expired', expect.any(Function));
      await client.serviceManager.stop();
      expect(Emitter.prototype.off).toHaveBeenCalledWith('expired', expect.any(Function));
    });

    it('should renew token if expired after service start', async function() {
      setupSync({
        tokenManager: { autoRenew: true }
      }, true);
      client.tokenManager.renew = jest.fn().mockImplementation(() => Promise.resolve());
      await client.serviceManager.start();
      client.emitter.emit('expired');
      expect(client.tokenManager.renew).toHaveBeenCalledTimes(1);
    });

    it('should renew token if expired before service start', async function() {
      // do not become leader, auto renew service would not start
      util.mockLeader(false);
      setupSync({
        tokenManager: { autoRenew: true }
      }, true);
      client.tokenManager.renew = jest.fn().mockImplementation(() => Promise.resolve());
      await client.serviceManager.start();
      expect(client.serviceManager.getService('autoRenew')?.isStarted()).toBeFalsy();

      // add expired token
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      jest.runAllTimers();

      // become leader
      util.mockLeader(true);
      await (client.serviceManager.getService('leaderElection') as any)?.onLeader();
      expect(client.serviceManager.getService('autoRenew')?.isStarted()).toBeTruthy();
      jest.runAllTimers();

      // token should be renewed
      expect(client.tokenManager.renew).toHaveBeenCalledTimes(1);
      expect(client.tokenManager.renew).toHaveBeenCalledWith('test-idToken');
    });

    describe('too many renew requests', () => {
      it('should emit too many renew error when latest 10 expired event happen in 30 seconds', async () => {
        setupSync({
          tokenManager: { autoRenew: true }
        }, true);
        await client.serviceManager.start();
        client.tokenManager.renew = jest.fn().mockImplementation(() => Promise.resolve());
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
        setupSync({
          tokenManager: { autoRenew: true }
        }, true);
        await client.serviceManager.start();
        client.tokenManager.renew = jest.fn().mockImplementation(() => Promise.resolve());
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
        setupSync({
          tokenManager: { autoRenew: true }
        }, true);
        const handler = jest.fn();
        client.tokenManager.on('error', handler);
        await client.serviceManager.start();
        client.tokenManager.renew = jest.fn().mockImplementation(() => Promise.resolve());
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
        setupSync({
          tokenManager: { autoRenew: true }
        }, true);
        const handler = jest.fn();
        client.tokenManager.on('error', handler);
        await client.serviceManager.start();
        client.tokenManager.renew = jest.fn().mockImplementation(() => Promise.resolve());

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
    beforeEach(() => {
      jest.useFakeTimers();
      util.disableLeaderElection();
      util.mockLeader();
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    it('should call tokenManager.remove() when autoRenew === false && autoRemove === true', async () => {
      setupSync({ tokenManager: { autoRenew: false, autoRemove: true } }, true);
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      await client.serviceManager.start();
      client.tokenManager.remove = jest.fn();
      util.warpToUnixTime(tokens.standardIdTokenClaims.iat);
      util.warpByTicksToUnixTime(tokens.standardIdTokenParsed.expiresAt + 1);
      expect(client.tokenManager.remove).toHaveBeenCalledWith('test-idToken');
    });

    it('should not call tokenManager.remove() when autoRenew === false && autoRemove === false', async () => {
      setupSync({ tokenManager: { autoRenew: false, autoRemove: false } }, true);
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      await client.serviceManager.start();
      client.tokenManager.remove = jest.fn();
      util.warpToUnixTime(tokens.standardIdTokenClaims.iat);
      util.warpByTicksToUnixTime(tokens.standardIdTokenParsed.expiresAt + 1);
      expect(client.tokenManager.remove).not.toHaveBeenCalled();
    });
  });

  describe('options.services config', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      util.disableLeaderElection();
      util.mockLeader();
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    it('should register listener for "expired" event', async function() {
      jest.spyOn(Emitter.prototype, 'on');
      jest.spyOn(Emitter.prototype, 'off');
      setupSync({ services: { autoRenew: true } }, true);
      client.tokenManager.start();
      await client.serviceManager.start();
      expect(Emitter.prototype.on).toHaveBeenCalledWith('expired', expect.any(Function));
      await client.serviceManager.stop();
      expect(Emitter.prototype.off).toHaveBeenCalledWith('expired', expect.any(Function));
    });

    it('should call tokenManager.remove() when autoRenew === false && autoRemove === true', async () => {
      setupSync({ services: { autoRenew: false, autoRemove: true } }, true);
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      await client.serviceManager.start();
      client.tokenManager.remove = jest.fn();
      util.warpToUnixTime(tokens.standardIdTokenClaims.iat);
      util.warpByTicksToUnixTime(tokens.standardIdTokenParsed.expiresAt + 1);
      expect(client.tokenManager.remove).toHaveBeenCalledWith('test-idToken');
    });

    it('should not call tokenManager.remove() when autoRenew === false && autoRemove === false', async () => {
      setupSync({ services: { autoRenew: false, autoRemove: false } }, true);
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      await client.serviceManager.start();
      client.tokenManager.remove = jest.fn();
      util.warpToUnixTime(tokens.standardIdTokenClaims.iat);
      util.warpByTicksToUnixTime(tokens.standardIdTokenParsed.expiresAt + 1);
      expect(client.tokenManager.remove).not.toHaveBeenCalled();
    });
  });

});
