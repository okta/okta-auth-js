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
