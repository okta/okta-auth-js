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


import { urlParamsToObject } from '../../../../lib/oidc/util';

describe('urlParamsToObject', () => {
  it('removes leading #/', () => {
    expect(urlParamsToObject('#/foo=bar')).toEqual({
      foo: 'bar'
    });
  });
  it('removes leading #', () => {
    expect(urlParamsToObject('#foo=bar')).toEqual({
      foo: 'bar'
    });
  });
  it('removes leading ?', () => {
    expect(urlParamsToObject('?foo=bar')).toEqual({
      foo: 'bar'
    });
  });
  it('does not modify string if no leading char', () => {
    expect(urlParamsToObject('foo=bar')).toEqual({
      foo: 'bar'
    });
  });
  it('decodes regular URI components', () => {
    const val = 'b a + & r';
    const encoded = encodeURIComponent(val);
    expect(urlParamsToObject(`?foo=${encoded}`)).toEqual({
      foo: val
    });
  });
  it('does not decode id_token, access_token, or code', () => {
    const val = 'b a + & r';
    const encoded = encodeURIComponent(val);
    expect(urlParamsToObject(`?foo=${encoded}&id_token=${encoded}&access_token=${encoded}&code=${encoded}`)).toEqual({
      foo: val,
      id_token: encoded,
      access_token: encoded,
      code: encoded
    });
  });
});
