define(function(require) {
  var OktaAuth = require('OktaAuth');
  var util = require('../util/util');
  var packageJson = require('../../package.json');

  describe('fingerprint', function() {
    function setup(options) {
      options = options || {};
      var test = this;
      var listener;
      var postMessageSpy = jasmine.createSpy('postMessage').and.callFake(function(msg, url) {
        // "receive" the message in the iframe
        expect(url).toEqual('http://example.okta.com');
        expect(msg).toEqual(jasmine.any(String));
        expect(JSON.parse(msg).type).toEqual('GetFingerprint');
        expect(listener).toEqual(jasmine.any(Function));
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
        contentWindow: {
          postMessage: postMessageSpy
        },
        parentElement: {
          removeChild: jasmine.createSpy('removeChild')
        }
      };

      spyOn(window, 'addEventListener').and.callFake(function(name, fn) {
        expect(name).toEqual('message');
        listener = fn;
      });
      spyOn(document, 'createElement').and.returnValue(test.iframe);
      spyOn(document.body, 'contains').and.returnValue(true);
      spyOn(document.body, 'appendChild').and.callFake(function() {
        if (options.timeout) { return; }
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
            origin: 'http://example.okta.com'
          });
        });
      });

      var authClient = options.authClient || new OktaAuth({
        url: 'http://example.okta.com'
      });
      if (typeof options.userAgent !== 'undefined') {
        util.mockUserAgent(authClient, options.userAgent);
      }
      return authClient;
    }

    it('iframe is created with the right src and it is hidden', function (done) {
      return setup().fingerprint()
      .catch(function(err) {
        expect(err).toBeUndefined();
      })
      .then(function(fingerprint) {
        var test = this;
        expect(document.createElement).toHaveBeenCalled();
        expect(test.iframe.style.display).toEqual('none');
        expect(test.iframe.src).toEqual('http://example.okta.com/auth/services/devicefingerprint');
        expect(document.body.appendChild).toHaveBeenCalledWith(test.iframe);
        expect(test.iframe.parentElement.removeChild).toHaveBeenCalled();
        expect(fingerprint).toEqual('ABCD');
      })
      .fin(function() {
        done();
      });
    });

    it('allows non-Okta postMessages', function (done) {
      return setup({ sendOtherMessage: true }).fingerprint()
      .catch(function(err) {
        expect(err).toBeUndefined();
      })
      .then(function(fingerprint) {
        expect(fingerprint).toEqual('ABCD');
      })
      .fin(function() {
        done();
      });
    });

    it('fails if the iframe sends invalid message content', function (done) {
      return setup({ firstMessage: 'invalidMessageContent' }).fingerprint()
      .then(function() {
        done.fail('Fingerprint promise should have been rejected');
      })
      .catch(function(err) {
        util.assertAuthSdkError(err, 'Unable to parse iframe response');
        done();
      });
    });

    it('fails if user agent is not defined', function (done) {
      return setup({ userAgent: '' }).fingerprint()
      .then(function() {
        done.fail('Fingerprint promise should have been rejected');
      })
      .catch(function(err) {
        util.assertAuthSdkError(err, 'Fingerprinting is not supported on this device');
        done();
      });
    });

    it('fails if it is called from a Windows phone', function (done) {
      return setup({
        userAgent: 'Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0;)'
      }).fingerprint()
      .then(function() {
        done.fail('Fingerprint promise should have been rejected');
      })
      .catch(function(err) {
        util.assertAuthSdkError(err, 'Fingerprinting is not supported on this device');
        done();
      });
    });

    it('fails after a timeout period', function (done) {
      return setup({ timeout: true }).fingerprint({ timeout: 5 })
      .then(function() {
        done.fail('Fingerprint promise should have been rejected');
      })
      .catch(function(err) {
        util.assertAuthSdkError(err, 'Fingerprinting timed out');
        done();
      });
    });

    util.itMakesCorrectRequestResponse({
      title: 'attaches fingerprint to signIn requests if sendFingerprint is true',
      setup: {
        uri: 'http://example.okta.com',
        calls: [
          {
            request: {
              method: 'post',
              uri: '/api/v1/authn',
              data: { username: 'not', password: 'real' },
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Okta-User-Agent-Extended': 'okta-auth-js-' + packageJson.version,
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
        uri: 'http://example.okta.com',
        calls: [
          {
            request: {
              method: 'post',
              uri: '/api/v1/authn',
              data: { username: 'not', password: 'real' },
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Okta-User-Agent-Extended': 'okta-auth-js-' + packageJson.version
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

    it('fails signIn request if fingerprinting fails', function(done) {
      return setup({ firstMessage: 'invalidMessageContent' })
      .signIn({
        username: 'not',
        password: 'real',
        sendFingerprint: true
      })
      .then(function() {
        done.fail('signIn promise should have been rejected');
      })
      .catch(function(err) {
        util.assertAuthSdkError(err, 'Unable to parse iframe response');
        done();
      });
    });
  });
});
