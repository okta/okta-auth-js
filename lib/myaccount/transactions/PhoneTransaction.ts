import { ChallengePhonePayload, PhoneProfile, Status, VerificationPayload } from '../types';
import BaseTransaction from './Base';
import { generateRequestFnFromLinks } from '../request';

export default class PhoneTransaction extends BaseTransaction {
  id: string;
  profile: PhoneProfile;
  status: Status;

  get: () => Promise<PhoneTransaction>;
  delete: () => Promise<BaseTransaction>;
  challenge: (payload: ChallengePhonePayload) => Promise<BaseTransaction>;
  verify?: (payload: VerificationPayload) => Promise<BaseTransaction>;

  constructor(oktaAuth, options) {
    super(oktaAuth, options);

    const { res, accessToken } = options;
    // assign required fields from res
    const { id, profile, status, _links } = res;
    this.id = id;
    this.profile = profile;
    this.status = status;

    // assign transformed fns to transaction
    this.get = async () => {
      const fn = generateRequestFnFromLinks({ 
        oktaAuth, 
        accessToken, 
        methodName: 'get', 
        links: _links,
        transactionClassName: 'PhoneTransaction'
      });
      return await fn() as PhoneTransaction;
    };
    this.delete = async () => {
      const fn = generateRequestFnFromLinks({ 
        oktaAuth, 
        accessToken, 
        methodName: 'delete', 
        links: _links 
      });
      return await fn() as BaseTransaction;
    };
    this.challenge = async (payload) => {
      const fn = generateRequestFnFromLinks({ 
        oktaAuth, 
        accessToken, 
        methodName: 'challenge', 
        links: _links 
      });
      return await fn(payload) as BaseTransaction;
    };
    if (_links.verify) {
      this.verify = async (payload) => {
        const fn = generateRequestFnFromLinks({ 
          oktaAuth, 
          accessToken, 
          methodName: 'verify', 
          links: _links 
        });
        return await fn(payload) as BaseTransaction;
      } ;
    }
  }
}
