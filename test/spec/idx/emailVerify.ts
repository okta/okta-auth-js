import {
  isEmailVerifyCallback,
  parseEmailVerifyCallback,
  handleEmailVerifyCallback,
  isEmailVerifyCallbackError,
  EmailVerifyCallbackError
} from '../../../lib/idx/emailVerify';
import { EmailVerifyCallbackResponse } from '../../../lib/idx/types';

describe('emailVerify', () => {

  describe('isEmailVerifyCallback', () => {
    it('by default, it returns false', () => {
      expect(isEmailVerifyCallback('foo=bar')).toBe(false);
    });
    it('returns false if only state exist', () => {
      expect(isEmailVerifyCallback('state=a&foo=bar')).toBe(false);
    });
    it('returns false if only otp exist', () => {
      expect(isEmailVerifyCallback('otp=a&foo=bar')).toBe(false);
    });
    it('returns true if both state and otp exist', () => {
      expect(isEmailVerifyCallback('state=a&otp=b')).toBe(true);
    });
  });

  describe('parseEmailVerifyCallback', () => {
    it('returns an empty object by default', () => {
      const res: EmailVerifyCallbackResponse = parseEmailVerifyCallback('');
      expect(res).toEqual({});
    });
    it('returns state and otp from a url path passed as a parameter', () => {
      expect(parseEmailVerifyCallback('state=a&otp=b')).toEqual({
        state: 'a',
        otp: 'b'
      });
    });
  });

  describe('EmailVerifyCallbackError', () => {
    it('has a name property', () => {
      const state = 'abc';
      const otp = '123';
      const error = new EmailVerifyCallbackError(state, otp);
      expect(error.name).toBe('EmailVerifyCallbackError');
    });
    it('has a message property', () => {
      const state = 'abc';
      const otp = '123';
      const error = new EmailVerifyCallbackError(state, otp);
      expect(error.message).toBe(`Enter the OTP code in the originating client: ${otp}`);
    });
    it('has a state property', () => {
      const state = 'abc';
      const otp = '123';
      const error = new EmailVerifyCallbackError(state, otp);
      expect(error.state).toBe(state);
    });
    it('has an otp property', () => {
      const state = 'abc';
      const otp = '123';
      const error = new EmailVerifyCallbackError(state, otp);
      expect(error.otp).toBe(otp);
    });
  });
  describe('isEmailVerifyCallbackError', () => {
    it('returns false for normal errors', () => {
      const error = new Error();
      expect(isEmailVerifyCallbackError(error)).toBe(false);
    });
    it('returns true for EmailVerifyCallbackError errors', () => {
      const state = 'abc';
      const otp = '123';
      const error = new EmailVerifyCallbackError(state, otp);
      expect(isEmailVerifyCallbackError(error)).toBe(true);
    });
  });

  describe('handleEmailVerifyCallback', () => {
    let testContext;
    beforeEach(() => {
      const canProceed = jest.fn();
      const proceed = jest.fn();
      const authClient = {
        idx: {
          canProceed,
          proceed
        }
      };
      const state = 'abc';
      const otp = '123';
      testContext = {
        authClient,
        state,
        otp,
        canProceed,
        proceed
      };
    });
    it('returns a promise', () => {
      const { authClient } = testContext;
      const res = handleEmailVerifyCallback(authClient, '');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(typeof (res as any).then).toBe('function');
      return res;
    });
    it('resolves undefined if search string is not an email verify callback', async () => {
      const { authClient } = testContext;
      const res = await handleEmailVerifyCallback(authClient, '');
      expect(res).toBe(undefined);
    });
    it('throws EmailVerifyCallbackError if canProceed() does not return true', async () => {
      const { authClient, state, otp, canProceed } = testContext;
      canProceed.mockReturnValue(false);
      let didThrow = false;
      try {
        await handleEmailVerifyCallback(authClient, `state=${state}&otp=${otp}`);
      } catch (error) {
        didThrow = true;
        expect(isEmailVerifyCallbackError(error as EmailVerifyCallbackError)).toBe(true);
      }
      expect(didThrow).toBe(true);
      expect(canProceed).toHaveBeenCalled();
    });

    describe('if it can proceed', () => {
      beforeEach(() => {
        const { canProceed } = testContext;
        canProceed.mockReturnValue(true);
      });
      it('passes state to canProceed', async () => {
        const { authClient, state, otp, canProceed } = testContext;
        await handleEmailVerifyCallback(authClient, `state=${state}&otp=${otp}`);
        expect(canProceed).toHaveBeenCalledWith({ state });
      });

      it('passes state and otp to proceed', async () => {
        const { authClient, state, otp, proceed } = testContext;
        await handleEmailVerifyCallback(authClient, `state=${state}&otp=${otp}`);
        expect(proceed).toHaveBeenCalledWith({ state, otp });
      });

      it('returns an IDX transaction', async () => {
        const { authClient, state, otp, proceed } = testContext;
        const mockTransaction = { status: 'fake' };
        proceed.mockResolvedValue(mockTransaction);
        const res = await handleEmailVerifyCallback(authClient, `state=${state}&otp=${otp}`);
        expect(res).toBe(mockTransaction);
      });
    });

  });
});