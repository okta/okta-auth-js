import { EmailChallengeTransaction, EmailStatusTransaction } from '.';
import { EmailProfile, EmailRole, Status, VerificationPayload } from '../types';
import BaseTransaction from './Base';
import { generateRequestFnFromLinks } from '../request';

export default class EmailTransaction extends BaseTransaction {
  id: string;
  profile: EmailProfile;
  roles: EmailRole[];
  status: Status;

  get: () => Promise<EmailTransaction>;
  delete: () => Promise<BaseTransaction>;
  challenge: () => Promise<EmailChallengeTransaction>;
  poll?: () => Promise<EmailStatusTransaction>;
  verify?: (payload: VerificationPayload) => Promise<BaseTransaction>;

  constructor(oktaAuth, options) {
    super(oktaAuth, options);

    const { accessToken, res } = options;
    // assign required fields from res
    const { id, profile, roles, status, _links } = res;
    this.id = id;
    this.profile = profile;
    this.roles = roles;
    this.status = status;

    // assign transformed fns to transaction
    this.get = async () => {
      const fn = generateRequestFnFromLinks({ 
        oktaAuth, 
        accessToken, 
        methodName: 'get', 
        links: _links,
        transactionClassName: 'EmailTransaction'
      });
      return await fn() as EmailTransaction;
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
    this.challenge = async () => {
      const fn = generateRequestFnFromLinks({ 
        oktaAuth, 
        accessToken, 
        methodName: 'challenge', 
        links: _links,
        transactionClassName: 'EmailChallengeTransaction'
      });
      return await fn() as EmailChallengeTransaction;
    };
    if (_links.poll) {
      this.poll = async () => {
        const fn = generateRequestFnFromLinks({ 
          oktaAuth, 
          accessToken, 
          methodName: 'poll', 
          links: _links,
          transactionClassName: 'EmailStatusTransaction'
        });
        return await fn() as EmailStatusTransaction;
      };
    }
    if (_links.verify) {
      this.verify = async (payload: VerificationPayload) => {
        const fn = generateRequestFnFromLinks({ 
          oktaAuth, 
          accessToken, 
          methodName: 'verify', 
          links: _links,
        });
        return await fn(payload) as BaseTransaction;
      };
    }
  }
}
