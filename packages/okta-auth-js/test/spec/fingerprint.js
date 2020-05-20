/* global window, document */
jest.mock('cross-fetch');

var OktaAuth = require('OktaAuth');
var util = require('@okta/test.support/util');
var packageJson = require('../../package.json');

describe('fingerprint', function() {
  var test;
  beforeEach(function() {
    test = {};
  });
  afterEach(function() {
    jest.useRealTimers();
  });

  function setup(options) {
    options = options || {};
    var listener;
    var postMessageSpy = jest.spyOn(window, 'postMessage').mockImplementation(function(msg, url) {
      // "receive" the message in the iframe
      expect(url).toEqual('http://example.okta.com');
      expect(msg).toEqual(expect.any(String));
      expect(JSON.parse(msg).type).toEqual('GetFingerprint');
      expect(listener).toEqual(expect.any(Function));
      listener({
        data: JSON.stringify({
          type: 'FingerprintAvailable',
          fingerprint: 'ABCD'
        }),
        origin: 'http://example.okta.com'
      });
    });

    test.iframe = {
      style: {},
      parentElement: {
        removeChild: jest.fn()
      }
    };

    jest.spyOn(window, 'addEventListener').mockImplementation(function(name, fn) {
      expect(name).toEqual('message');
      listener = fn;
    });
    jest.spyOn(document, 'createElement').mockReturnValue(test.iframe);
    jest.spyOn(document.body, 'contains').mockReturnValue(true);
    jest.spyOn(document.body, 'appendChild').mockImplementation(function(newChild) {
      if (options.timeout) { return newChild; }
      // mimic async page load with setTimeouts
      if (options.sendOtherMessage) {
        setTimeout(function() {
          listener({
            data: '{"not":"forUs"}',
            origin: 'http://not.okta.com'
          });
        });
      }
      setTimeout(function() {
        listener({
          data: options.firstMessage || JSON.stringify({
            type: 'FingerprintServiceReady'
          }),
          origin: 'http://example.okta.com',
          source: {
            postMessage: postMessageSpy
          }
        });
        return newChild;
      });
    });

    var authClient = options.authClient || new OktaAuth({
      pkce: false,
      issuer: 'http://example.okta.com'
    });
    if (typeof options.userAgent !== 'undefined') {
      util.mockUserAgent(authClient, options.userAgent);
    }
    return authClient;
  }

  it('iframe is created with the right src and it is hidden', function () {
    jest.useFakeTimers();
    var promise =  setup().fingerprint();
    return Promise.resolve()
      .then(function() {
        jest.runAllTicks(); // resolves outstanding promises
        jest.advanceTimersByTime(1); // allow listener to be called
        return promise;
      })
      .then(function(fingerprint) {
        expect(document.createElement).toHaveBeenCalled();
        expect(test.iframe.style.display).toEqual('none');
        expect(test.iframe.src).toEqual('http://example.okta.com/auth/services/devicefingerprint');
        expect(document.body.appendChild).toHaveBeenCalledWith(test.iframe);
        expect(window.postMessage).toHaveBeenCalled();
        expect(test.iframe.parentElement.removeChild).toHaveBeenCalled();
        expect(fingerprint).toEqual('ABCD');
      });
  });

  it('allows non-Okta postMessages', function () {
    return setup({ sendOtherMessage: true }).fingerprint()
    .catch(function(err) {
      expect(err).toBeUndefined();
    })
    .then(function(fingerprint) {
      expect(fingerprint).toEqual('ABCD');
    });
  });

  it('fails if the iframe sends invalid message content', function () {
    return setup({ firstMessage: 'invalidMessageContent' }).fingerprint()
    .then(function() {
      throw new Error('Fingerprint promise should have been rejected');
    })
    .catch(function(err) {
      util.assertAuthSdkError(err, 'Unable to parse iframe response');
    });
  });

  it('fails if user agent is not defined', function () {
    return setup({ userAgent: '' }).fingerprint()
    .then(function() {
      throw new Error('Fingerprint promise should have been rejected');
    })
    .catch(function(err) {
      util.assertAuthSdkError(err, 'Fingerprinting is not supported on this device');
    });
  });

  it('fails if it is called from a Windows phone', function () {
    return setup({
      userAgent: 'Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0;)'
    }).fingerprint()
    .then(function() {
      throw new Error('Fingerprint promise should have been rejected');
    })
    .catch(function(err) {
      util.assertAuthSdkError(err, 'Fingerprinting is not supported on this device');
    });
  });

  it('fails after a timeout period', function () {
    return setup({ timeout: true }).fingerprint({ timeout: 5 })
    .then(function() {
      throw new Error('Fingerprint promise should have been rejected');
    })
    .catch(function(err) {
      util.assertAuthSdkError(err, 'Fingerprinting timed out');
    });
  });

  util.itMakesCorrectRequestResponse({
    title: 'attaches fingerprint to signIn requests if sendFingerprint is true',
    setup: {
      issuer: 'http://example.okta.com',
      calls: [
        {
          request: {
            method: 'post',
            uri: '/api/v1/authn',
            data: { username: 'not', password: 'real' },
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-Okta-User-Agent-Extended': 'okta-auth-js/' + packageJson.version,
              'X-Device-Fingerprint': 'ABCD'
            }
          },
          response: 'success'
        }
      ]
    },
    execute: function (test) {
      return setup({ authClient: test.oa }).signIn({
        username: 'not',
        password: 'real',
        sendFingerprint: true
      });
    }
  });

  util.itMakesCorrectRequestResponse({
    title: 'does not attach fingerprint to signIn requests if sendFingerprint is false',
    setup: {
      issuer: 'http://example.okta.com',
      calls: [
        {
          request: {
            method: 'post',
            uri: '/api/v1/authn',
            data: { username: 'not', password: 'real' },
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-Okta-User-Agent-Extended': 'okta-auth-js/' + packageJson.version
            }
          },
          response: 'success'
        }
      ]
    },
    execute: function (test) {
      return test.oa.signIn({
        username: 'not',
        password: 'real',
        sendFingerprint: false
      });
    }
  });

  it('fails signIn request if fingerprinting fails', function() {
    return setup({ firstMessage: 'invalidMessageContent' })
    .signIn({
      username: 'not',
      password: 'real',
      sendFingerprint: true
    })
    .then(function() {
      throw new Error('signIn promise should have been rejected');
    })
    .catch(function(err) {
      util.assertAuthSdkError(err, 'Unable to parse iframe response');
    });
  });
});
