import EmailChallengeTransaction from './EmailChallengeTransaction';
import EmailStatusTransaction from './EmailStatusTransaction';
import { EmailProfile, EmailRole, Status, VerificationPayload } from '../types';
import BaseTransaction from './Base';
import { generateRequestFnFromLinks } from '../request';

export default class EmailTransaction extends BaseTransaction {
  id: string;
  profile: EmailProfile;
  roles: EmailRole[];
  status: Status;

  // eslint-disable-next-line no-use-before-define
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
      }, EmailTransaction);
      return await fn();
    };
    this.delete = async () => {
      const fn = generateRequestFnFromLinks({ 
        oktaAuth, 
        accessToken, 
        methodName: 'delete', 
        links: _links 
      });
      return await fn();
    };
    this.challenge = async () => {
      const fn = generateRequestFnFromLinks({ 
        oktaAuth, 
        accessToken, 
        methodName: 'challenge', 
        links: _links,
      }, EmailChallengeTransaction);
      return await fn();
    };
    if (_links.poll) {
      this.poll = async () => {
        const fn = generateRequestFnFromLinks({ 
          oktaAuth, 
          accessToken, 
          methodName: 'poll', 
          links: _links,
        }, EmailStatusTransaction);
        return await fn();
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
        return await fn(payload);
      };
    }
  }
}
