import { isEmailVerifyCallback, parseEmailVerifyCallback, EmailVerifyCallbackResponse } from '../../../lib/util/emailVerify';



describe('emailVerify', () => {
  let originalLocation;
  
  beforeEach(() => {
    // Window will be undefined on a node platform
    if (typeof global.window === 'undefined') {
      Object.assign(global, {
        window: {
          location: {}
        }
      });
    }
    originalLocation = global.window.location;
  });

  afterEach(() => {
    global.window.location = originalLocation;
  });

  function mockWindowSearch(search) {
    delete global.window.location;
    global.window.location = {
      search
    } as Location;
  }

  describe('isEmailVerifyCallback', () => {
    it('by default, it returns false', () => {
      expect(isEmailVerifyCallback()).toBe(false);
    });

    it('it tests against window.location.search', () => {
      mockWindowSearch('state=a&stateTokenExternalId=b');
      expect(isEmailVerifyCallback()).toBe(true);
    });
    it('it tests against a urlPath passed as a parameter', () => {
      expect(isEmailVerifyCallback('state=a&stateTokenExternalId=b')).toBe(true);
    });
  });

  describe('parseEmailVerifyCallback', () => {
    it('returns an empty object by default', () => {
      const res: EmailVerifyCallbackResponse = parseEmailVerifyCallback();
      expect(res).toEqual({});
    });
    it('returns state and stateTokenExternalId from the URL', () => {
      mockWindowSearch('state=a&stateTokenExternalId=b');
      expect(parseEmailVerifyCallback()).toEqual({
        state: 'a',
        stateTokenExternalId: 'b'
      });
    });
    it('returns state and stateTokenExternalId from a url path passed as a parameter', () => {
      expect(parseEmailVerifyCallback('state=a&stateTokenExternalId=b')).toEqual({
        state: 'a',
        stateTokenExternalId: 'b'
      });
    });
  });
});