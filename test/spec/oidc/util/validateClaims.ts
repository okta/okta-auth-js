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


import { OktaAuth, TokenVerifyParams, UserClaims } from '@okta/okta-auth-js';
import { validateClaims } from '../../../../lib/oidc/util';
import util from '@okta/test.support/util';

describe('validateClaims', function () {
  var sdk;
  var validationOptions;

  beforeEach(function() {
    sdk = new OktaAuth({
      pkce: false,
      issuer: 'https://auth-js-test.okta.com',
      clientId: 'foo',
      ignoreSignature: false
    });

    validationOptions = {
      clientId: 'foo',
      issuer: 'https://auth-js-test.okta.com'
    } as TokenVerifyParams;
  });

  it('throws an AuthSdkError when no jwt is provided', function () {
    var fn = function () { validateClaims(sdk, undefined as unknown as UserClaims, validationOptions); };
    expect(fn).toThrowError('The jwt, iss, and aud arguments are all required');
  });

  it('throws an AuthSdkError when no clientId is provided', function () {
    var fn = function () {
      const claims = {} as unknown as UserClaims;
      const params = {
        issuer: 'https://auth-js-test.okta.com'
      } as unknown as TokenVerifyParams;
      validateClaims(sdk, claims, params);
    };
    expect(fn).toThrowError('The jwt, iss, and aud arguments are all required');
  });

  it('throws an AuthSdkError when no issuer is provided', function () {
    var fn = function () {
      const claims = {} as unknown as UserClaims;
      const params = {
        clientId: 'foo'
      } as unknown as TokenVerifyParams;
      validateClaims(sdk, claims, params);
    };
    expect(fn).toThrowError('The jwt, iss, and aud arguments are all required');
  });

  it('validates nonce, if provided', function() {
    validationOptions.nonce = 'bar';
    var claims = { nonce: 'foo' } as unknown as UserClaims;
    var fn = function () {
      validateClaims(sdk, claims, validationOptions);
    };
    expect(fn).toThrowError('OAuth flow response nonce doesn\'t match request nonce');  
  });

  it('validates issuer', function() {
    var claims = { iss: 'foo' } as unknown as UserClaims;
    var fn = function () {
      validateClaims(sdk, claims, validationOptions);
    };
    expect(fn).toThrowError('The issuer [' + claims.iss + '] ' +
    'does not match [' + validationOptions.issuer + ']'); 
  });

  it('validates audience when not an array', function() {
    var claims = {
      iss: validationOptions.issuer,
      aud: 'nobody'
    } as unknown as UserClaims;
    var fn = function () {
      validateClaims(sdk, claims, validationOptions);
    };
    expect(fn).toThrowError('The audience [' + claims.aud + '] ' +
      'does not match [' + validationOptions.clientId + ']'); 
  });

  it('validates audience without error when at least one matches', function() {
    var claims = {
      iss: validationOptions.issuer,
      aud: ['nobody', validationOptions.clientId]
    } as unknown as UserClaims;
    var fn = function () {
      validateClaims(sdk, claims, validationOptions);
    };
    expect(fn).not.toThrowError(); 
  });

  it('validates audience when an array', function() {
    var claims = {
      iss: validationOptions.issuer,
      aud: ['nobody']
    } as unknown as UserClaims;
    var fn = function () {
      validateClaims(sdk, claims, validationOptions);
    };
    expect(fn).toThrowError('The audience [' + claims.aud + '] ' +
      'does not match [' + validationOptions.clientId + ']'); 
  });

  it('validates exp > iat', function() {
    var claims = {
      iss: validationOptions.issuer,
      aud: validationOptions.clientId,
      exp: 1,
      iat: 2
    } as unknown as UserClaims;
    var fn = function () {
      validateClaims(sdk, claims, validationOptions);
    };
    expect(fn).toThrowError('The JWT expired before it was issued'); 
  });

  it('throws if expired', function() {
    var now = 10;
    util.warpToUnixTime(now);
    var claims = {
      iss: validationOptions.issuer,
      aud: validationOptions.clientId,
      exp: now - 1,
      iat: now - 2
    } as unknown as UserClaims;
    sdk.options.maxClockSkew = 0;
    var fn = function () {
      validateClaims(sdk, claims, validationOptions);
    };
    expect(fn).toThrowError('The JWT expired and is no longer valid'); 
  });

  it('maxClockSkew extends expiration window', function() {
    var now = 10;
    var skew = 2;
    util.warpToUnixTime(now);
    var claims = {
      iss: validationOptions.issuer,
      aud: validationOptions.clientId,
      exp: now - 1,
      iat: now - 2
    } as unknown as UserClaims;
    sdk.options.maxClockSkew = skew;
    var fn = function () {
      validateClaims(sdk, claims, validationOptions);
    };
    expect(fn).not.toThrowError();
    util.warpToUnixTime(now + skew);
    expect(fn).toThrowError('The JWT expired and is no longer valid'); 
  });

  it('will skip jwt expired check if `ignoreLifetime` is true', function() {
    var now = 10;
    util.warpToUnixTime(now);
    var claims = {
      iss: validationOptions.issuer,
      aud: validationOptions.clientId,
      exp: now - 1,
      iat: now - 2
    } as unknown as UserClaims;
    sdk.options.maxClockSkew = 0;
    sdk.options.ignoreLifetime = true;
    var fn = function () {
      validateClaims(sdk, claims, validationOptions);
    };
    expect(fn).not.toThrowError();
  });

  it('throws if issued in the future', function() {
    var now = 10;
    util.warpToUnixTime(now);
    var claims = {
      iss: validationOptions.issuer,
      aud: validationOptions.clientId,
      exp: now + 2,
      iat: now + 1
    } as unknown as UserClaims;
    sdk.options.maxClockSkew = 0;
    var fn = function () {
      validateClaims(sdk, claims, validationOptions);
    };
    expect(fn).toThrowError('The JWT was issued in the future'); 
  });

  it('maxClockSkew extends iat validation into the future', function() {
    var now = 10;
    var skew = 2;
    util.warpToUnixTime(now);
    var claims = {
      iss: validationOptions.issuer,
      aud: validationOptions.clientId,
      exp: now + 2,
      iat: now + 1
    } as unknown as UserClaims;
    sdk.options.maxClockSkew = skew;
    var fn = function () {
      validateClaims(sdk, claims, validationOptions);
    };
    expect(fn).not.toThrowError();
    util.warpToUnixTime(now - skew);
    expect(fn).toThrowError('The JWT was issued in the future'); 
  });

  it('will skip jwt future issue check if `ignoreLifetime` is true', function() {
    var now = 10;
    util.warpToUnixTime(now);
    var claims = {
      iss: validationOptions.issuer,
      aud: validationOptions.clientId,
      exp: now + 2,
      iat: now + 1
    } as unknown as UserClaims;
    sdk.options.maxClockSkew = 0;
    sdk.options.ignoreLifetime = true;
    var fn = function () {
      validateClaims(sdk, claims, validationOptions);
    };
    expect(fn).not.toThrowError();
  });

  it('can validate all claims without error', function() {
    var now = 10;
    util.warpToUnixTime(now);
    var claims = {
      iss: validationOptions.issuer,
      aud: validationOptions.clientId,
      exp: now + 2,
      iat: now - 1
    } as unknown as UserClaims;
    sdk.options.maxClockSkew = 0;
    var fn = function () {
      validateClaims(sdk, claims, validationOptions);
    };
    expect(fn).not.toThrowError();
  });

  it('validates acr, if acr_values is provided', function() {
    validationOptions.acrValues = 'urn:okta:loa:2fa:any:ifpossible';
    const claims = {
      iss: validationOptions.issuer,
      aud: validationOptions.clientId,
      acr: 'foo'
    } as unknown as UserClaims;
    const fn = function () {
      validateClaims(sdk, claims, validationOptions);
    };
    expect(fn).toThrowError('The acr [foo] does not match acr_values [urn:okta:loa:2fa:any:ifpossible]');  
  });

  it('does throw an error on missing acr, if acr_values is provided', function() {
    validationOptions.acrValues = 'urn:okta:loa:2fa:any:ifpossible';
    const claims = {
      iss: validationOptions.issuer,
      aud: validationOptions.clientId,
    } as unknown as UserClaims;
    const fn = function () {
      validateClaims(sdk, claims, validationOptions);
    };
    expect(fn).toThrowError('The acr [undefined] does not match acr_values [urn:okta:loa:2fa:any:ifpossible]');  
  });
});
