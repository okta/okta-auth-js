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


import * as util from '../../lib/util';
import testUtil from '@okta/test.support/util';

describe('util', function() {
  let console;
  beforeEach(function() {
    console = testUtil.getConsole();
    jest.spyOn(console, 'log');
    jest.spyOn(console, 'warn');
  });

  describe('warn', function() {
    it('writes warning to console', function() {
      util.warn('sample warning');
      expect(console.warn).toHaveBeenCalledWith('[okta-auth-sdk] WARN: sample warning');
    });
  });

  describe('deprecate', function() {
    it('writes deprecation to console', function() {
      util.deprecate('sample deprecation');
      expect(console.warn).toHaveBeenCalledWith('[okta-auth-sdk] DEPRECATION: sample deprecation');
    });
  });

  describe('getConsole', function() {
    let originalConsole;
    beforeEach(() => {
      originalConsole = testUtil.getConsole();
    });
    afterEach(() => {
      testUtil.restoreConsole(originalConsole);
    });
    it('returns actual console', function() {
      expect(util.getConsole()).toBe(originalConsole);
    });

    it('returns fake console if native console does not exist', function() {
      testUtil.removeConsole();
      expect(util.getConsole().log).toBeDefined();
    });
  });

  describe('extend', function() {
    it('handles one argument', function() {
      var obj1 = {
        'prop1': 'test prop1',
        'prop2': 'test prop2'
      };
      util.extend(obj1);
      expect(obj1).toEqual(expect.objectContaining({
        'prop1': 'test prop1',
        'prop2': 'test prop2'
      }));
    });

    it('handles more than one argument', function() {
      var obj1 = {
        'prop1': 'test prop1',
        'prop2': 'test prop2'
      };
      var obj2 = {
        'prop3': 'test prop3'
      };
      var obj3 = {
        'prop1': 'test prop4'
      };
      util.extend(obj1, obj2, obj3);
      expect(obj1).toEqual(expect.objectContaining({
        'prop1': 'test prop4',
        'prop2': 'test prop2',
        'prop3': 'test prop3'
      }));
    });

    it('returns the first argument as the modified object', function() {
      var obj1 = {
        // empty
      };
      var obj2 = {
        'prop1': 'test prop1'
      };
      var obj3 = {
        'prop2': 'test prop2'
      };
      util.extend(obj1, obj2, obj3);
      var res = util.extend(obj1);
      expect(res).toBe(obj1);
      expect(obj1).toEqual(expect.objectContaining({
        'prop1': 'test prop1',
        'prop2': 'test prop2'
      }));
    });

    it('does not copy properties with undefined values', function() {
      var obj1 = {
        'prop1': 'test prop1',
        'prop2': 'test prop2'
      };
      var obj2 = {
        'prop2': undefined
      };
      util.extend(obj1, obj2);
      expect(obj1).toEqual(expect.objectContaining({
        'prop1': 'test prop1',
        'prop2': 'test prop2'
      }));
    });
  });



  describe('removeTrailingSlash', function() {
    it('returns a url with a trailing slash without the trailing slash', function() {
      var url = 'https://domain.com/';
      expect(util.removeTrailingSlash(url)).toEqual('https://domain.com');
    });

    it('returns a url without a trailing slash as is', function() {
      var url = 'https://domain.com';
      expect(util.removeTrailingSlash(url)).toEqual('https://domain.com');
    });

    it('returns a url with a trailing slash and appended whitespace correctly', function() {
      var url = 'https://domain.com/    ';
      expect(util.removeTrailingSlash(url)).toEqual('https://domain.com');
    });

    it('returns a url with a trailing slash and prepended whitespace correctly', function() {
      var url = '   https://domain.com/';
      expect(util.removeTrailingSlash(url)).toEqual('https://domain.com');
    });

    it('returns a url without a trailing slash and appended whitespace correctly', function() {
      var url = 'https://domain.com    ';
      expect(util.removeTrailingSlash(url)).toEqual('https://domain.com');
    });

    it('returns a url without a trailing slash and prepended whitespace correctly', function() {
      var url = '   https://domain.com';
      expect(util.removeTrailingSlash(url)).toEqual('https://domain.com');
    });
  });

  describe('isFunction', function() {
    it('returns false if argument is undefined', function() {
      var fn;
      expect(util.isFunction(fn)).toBe(false);
    });

    it('returns false if argument is null', function() {
      var fn = null;
      expect(util.isFunction(fn)).toBe(false);
    });

    it('returns false if argument is a boolean', function() {
      var fn = true;
      expect(util.isFunction(fn)).toBe(false);
    });

    it('returns false if argument is a number', function() {
      var fn = 3;
      expect(util.isFunction(fn)).toBe(false);
    });

    it('returns false if argument a string', function() {
      var fn = 'I am not a function!';
      expect(util.isFunction(fn)).toBe(false);
    });

    it('returns false if argument is an Object', function() {
      var fn = { name: 'Not a function!' };
      expect(util.isFunction(fn)).toBe(false);
    });

    it('returns false if argument is a Date', function() {
      var fn = new Date('December 17, 1995 03:24:00');
      expect(util.isFunction(fn)).toBe(false);
    });

    it('returns false if argument is a RegExp', function() {
      var fn = new RegExp('\\w+');
      expect(util.isFunction(fn)).toBe(false);
    });

    it('returns true if argument is a function', function() {
      var fn = function() { return 'I am a function!'; };
      expect(util.isFunction(fn)).toBe(true);
    });
  });

  describe('toAbsoluteUrl', () => {
    it('should return same url if url is an absolute url', () => {
      const url = 'http://fake.com';
      expect(util.toAbsoluteUrl(url)).toEqual(url);
    });

    it('should return correct url when valid baseUrl and relative url are provided', () => {
      const baseUrl = 'http://fake.com';
      const url = '/relative';
      expect(util.toAbsoluteUrl(url, baseUrl)).toEqual('http://fake.com/relative');
    });

    it('should return correct url when baseUrl has trailing "/"', () => {
      const baseUrl = 'http://fake.com/';
      const url = '/relative';
      expect(util.toAbsoluteUrl(url, baseUrl)).toEqual('http://fake.com/relative');
    });

    it('should return correct url when relative url without "/"', () => {
      const baseUrl = 'http://fake.com';
      const url = 'relative';
      expect(util.toAbsoluteUrl(url, baseUrl)).toEqual('http://fake.com/relative');
    });

    it('should return correct url when relative url without "/" and baseurl with trailing "/"', () => {
      const baseUrl = 'http://fake.com/';
      const url = 'relative';
      expect(util.toAbsoluteUrl(url, baseUrl)).toEqual('http://fake.com/relative');
    });
  });

  describe('toRelativeUrl', () => {
    it('should return same url if url is an relative url', () => {
      const url = '/path';
      expect(util.toRelativeUrl(url)).toEqual(url);
    });

    it('should return correct url when valid baseUrl and relative url are provided', () => {
      const baseUrl = 'http://fake.com';
      const url = 'http://fake.com/relative';
      expect(util.toRelativeUrl(url, baseUrl)).toEqual('/relative');
    });

    it('should return correct url when baseUrl has trailing "/"', () => {
      const baseUrl = 'http://fake.com/';
      const url = 'http://fake.com/relative';
      expect(util.toRelativeUrl(url, baseUrl)).toEqual('/relative');
    });

    it('should return correct url when relative url without "/"', () => {
      const baseUrl = 'http://fake.com';
      const url = 'http://fake.com/relative';
      expect(util.toRelativeUrl(url, baseUrl)).toEqual('/relative');
    });
  });
});
