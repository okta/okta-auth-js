import { formatAuthenticator, compareAuthenticators, findMatchedOption } from '../../../../lib/idx/authenticator/util';

describe('authenticator/util', () => {

  describe('formatAuthenticator', () => {
    it('will accept an object with a key property', () => {
      const res = formatAuthenticator({ key: 'foo' });
      expect(res.key).toBe('foo');
    });
    it('will accept an object with an id property', () => {
      const res = formatAuthenticator({ id: 'foo' });
      expect(res.id).toBe('foo');
    });
    it('will accept a string', () => {
      const res = formatAuthenticator('foo');
      expect(res.key).toBe('foo');
    });
    it('will throw for an object with key or id property', () => {
      const f = () => formatAuthenticator({ bar: 'foo' });
      expect(f).toThrowError();
    });
  });
  

  describe('compareAuthenticators', () => {
    it('returns true if keys match', () => {
      const res = compareAuthenticators({ key: 'a'}, { key: 'a'});
      expect(res).toBe(true);
    });
    it('returns false if key does not match', () => {
      const res = compareAuthenticators({ key: 'a' }, { key: 'b'});
      expect(res).toBe(false);
    });
    it('returns true if ids match', () => {
      const res = compareAuthenticators({ id: 'a'}, { id: 'a'});
      expect(res).toBe(true);
    });
    it('returns false if id does not match', () => {
      const res = compareAuthenticators({ id: 'a' }, { id: 'b'});
      expect(res).toBe(false);
    });
    it('returns false if neither key nor id match', () => {
      const res = compareAuthenticators({ id: 'a' }, { key: 'b'});
      expect(res).toBe(false);
    });
  });

  describe('findMatchedOption', () => {
    it('matches an option by key', () => {
      const authenticator = {
        key: 'foo'
      };
      const option = {
        relatesTo: {
          key: 'foo'
        }
      };
      const res = findMatchedOption([authenticator], [option]);
      expect(res).toBe(option);
    });
    it('will not match if key does not match', () => {
      const authenticator = {
        key: 'foo'
      };
      const option = {
        relatesTo: {
          key: 'bar'
        }
      };
      const res = findMatchedOption([authenticator], [option]);
      expect(res).toBe(undefined);
    });
  });
});