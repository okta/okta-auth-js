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


/* global atob */
import {
  base64ToBase64Url, stringToBase64Url, base64UrlToString,
  base64UrlToBuffer, bufferToBase64Url
} from '../../../lib/crypto/base64';

describe('base64', function() {

  const LONG_STRING = 'Contrary to popular belief, Lorem Ipsum is not simply random text. ' +
    'It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. ';

  describe('base64ToBase64Url', function() {
    it('Replaces "+" with "-"', function() {
      var orig = '123+45';
      var str = base64ToBase64Url(orig);
      expect(str.indexOf('-')).toBe(orig.indexOf('+'));
    });
    it('Replaces "/" with "_"', function() {
      var orig = '123/45';
      var str = base64ToBase64Url(orig);
      expect(str.indexOf('_')).toBe(orig.indexOf('/'));
    });
    it('Replaces "=" with ""', function() {
      var orig = '12345==';
      var str = base64ToBase64Url(orig);
      expect(str.indexOf('=')).toBe(-1);
      expect(str.length).toBe(orig.length - 2);
    });

  });

  describe('stringToBase64Url', function() {

    it('is a valid & reversible base64 string', function() {
      var b = stringToBase64Url(LONG_STRING);
      var str = atob(b);
      expect(str).toBe(LONG_STRING);
    });

    it('does not contain url unsafe characters', function() {
      var b = stringToBase64Url(LONG_STRING);
      expect(b.indexOf('+')).toBe(-1);
      expect(b.indexOf('/')).toBe(-1);
    });

    it('does not contain base64 padding', function() {
      var b = stringToBase64Url(LONG_STRING);
      expect(b.indexOf('=')).toBe(-1);
    });

    it('is reversible', function() {
      var orig = LONG_STRING;
      var b = stringToBase64Url(orig);
      var str = base64UrlToString(b);
      expect(str).toBe(orig);
    });
  });

  describe('base64UrlToBuffer', () => {
    it('converts base64 string to binary data view', () => {
      const b64u = 'aGVsbG8='; // 'hello' in base64
      const buf = base64UrlToBuffer(b64u);
      const expectedBuf = new Uint8Array([104, 101, 108, 108, 111]);
      expect(buf.toString()).toBe(expectedBuf.toString());
    });
  });

  describe('bufferToBase64Url', () => {
    it('converts buffer with binary data to base64 string', () => {
      const buf = new Uint8Array([104, 101, 108, 108, 111]);
      const b64u = bufferToBase64Url(buf);
      expect(b64u).toBe('aGVsbG8=');
    });
  });
});
