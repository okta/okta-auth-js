define(function(require) {
  var OktaAuth = require('OktaAuth');
  var util = require('../util/util');

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

      var authClient = new OktaAuth({
        url: 'http://example.okta.com'
      });
      if (typeof options.userAgent !== 'undefined') {
        util.mockUserAgent(authClient, options.userAgent);
      }
      return authClient.fingerprint({ timeout: options.timeout });
    }

    it('iframe is created with the right src and it is hidden', function (done) {
      return setup()
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
      return setup({ sendOtherMessage: true })
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
      return setup({ firstMessage: 'invalidMessageContent' })
      .then(function() {
        done.fail('Fingerprint promise should have been rejected');
      })
      .catch(function(err) {
        util.assertAuthSdkError(err, 'Unable to parse iframe response');
        done();
      });
    });

    it('fails if user agent is not defined', function (done) {
      return setup({ userAgent: '' })
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
      })
      .then(function() {
        done.fail('Fingerprint promise should have been rejected');
      })
      .catch(function(err) {
        util.assertAuthSdkError(err, 'Fingerprinting is not supported on this device');
        done();
      });
    });

    it('fails after a timeout period', function (done) {
      return setup({ timeout: 5 })
      .then(function() {
        done.fail('Fingerprint promise should have been rejected');
      })
      .catch(function(err) {
        util.assertAuthSdkError(err, 'Fingerprinting timed out');
        done();
      });
    });
  });
});
