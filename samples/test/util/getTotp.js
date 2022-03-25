const totp = require('totp-generator');

export const TOTP_TYPES = {
  ENROLL: 'enrollment',
  AUTH: 'authentication'
};

export function getTotp(sharedSecret, type = TOTP_TYPES.AUTH) {
  // avoid using same passcode for enroll and auth
  const timestamp = type === TOTP_TYPES.ENROLL ? Date.now() - 30 * 3000 : Date.now();
  return totp(sharedSecret, { timestamp });
}
