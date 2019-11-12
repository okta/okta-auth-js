jest.mock('cross-fetch');
var OktaAuth = require('../../lib/browser/browserIndex');
var Emitter = require('tiny-emitter');

describe('Browser', function() {

  it('is a valid constructor', function() {
    var auth = new OktaAuth({ url: 'http://localhost/fake' });
    expect(auth instanceof OktaAuth).toBe(true);
  });

  describe('Error handling', function() {
    it('Handles error events from TokenManager', function() {
      jest.spyOn(Emitter.prototype, 'on');
      jest.spyOn(OktaAuth.prototype, '_onTokenManagerError');
      new OktaAuth({ url: 'http://localhost/fake' });
      var emitter = Emitter.prototype.on.mock.instances[0];
      var error = { errorCode: 'anything'};
      emitter.emit('error', error);
      expect(OktaAuth.prototype._onTokenManagerError).toHaveBeenCalledWith(error);
    });
  
    it('errorCode "login_required": Will call option "onLoginRequired" function', function() {
      var onLoginRequired = jest.fn();
      jest.spyOn(Emitter.prototype, 'on');
      new OktaAuth({ url: 'http://localhost/fake', onLoginRequired: onLoginRequired });
      var emitter = Emitter.prototype.on.mock.instances[0];
      expect(onLoginRequired).not.toHaveBeenCalled();
      var error = { errorCode: 'login_required'};
      emitter.emit('error', error);
      expect(onLoginRequired).toHaveBeenCalled();
    });

    it('unknown errorCode is ignored', function() {
      var onLoginRequired = jest.fn();
      jest.spyOn(Emitter.prototype, 'on');
      new OktaAuth({ url: 'http://localhost/fake', onLoginRequired: onLoginRequired });
      var emitter = Emitter.prototype.on.mock.instances[0];
      expect(onLoginRequired).not.toHaveBeenCalled();
      var error = { errorCode: 'unknown'};
      emitter.emit('error', error);
      expect(onLoginRequired).not.toHaveBeenCalled();
    });
  });

  describe('options', function() {
    var auth;
    beforeEach(function() {
      auth = new OktaAuth({ url: 'http://localhost/fake' });
    });

    describe('PKCE', function() {

      it('is false by default', function() {
        expect(auth.options.pkce).toBe(false);
      });

      it('can be set by arg', function() {
        spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(true);
        auth = new OktaAuth({ pkce: true, url: 'http://localhost/fake' });
        expect(auth.options.pkce).toBe(true);
      });

      it('accepts alias "grantType"', function() {
        spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(true);
        auth = new OktaAuth({ grantType: "authorization_code", url: 'http://localhost/fake' });
        expect(auth.options.pkce).toBe(true);
      });

      it('throws if PKCE is not supported', function() {
        spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(false);
        function fn() {
          auth = new OktaAuth({ pkce: true, url: 'http://localhost/fake' });
        }
        expect(fn).toThrowError('This browser doesn\'t support PKCE');
      });
    })
  });
});