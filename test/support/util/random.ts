import crypto from 'crypto';

export const randomStr = len => crypto.randomBytes(len).toString('hex');
