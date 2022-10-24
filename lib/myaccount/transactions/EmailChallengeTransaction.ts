import EmailStatusTransaction from './EmailStatusTransaction';
import { 
  EmailProfile, 
  Status,
  VerificationPayload, 
} from '../types';
import BaseTransaction from './Base';
import { GenerateRequestFnFromLinksFn } from '../request';

export default class EmailChallengeTransaction extends BaseTransaction {
  id: string;
  expiresAt: string;
  profile: EmailProfile;
  status: Status;

  poll: () => Promise<EmailStatusTransaction>;
  // eslint-disable-next-line no-use-before-define
  verify: (payload: VerificationPayload) => Promise<EmailChallengeTransaction>;

  constructor(oktaAuth, options) {
    super(oktaAuth, options);

    const { accessToken, res } = options;
    const generateRequestFnFromLinks: GenerateRequestFnFromLinksFn = options.generateRequestFnFromLinks;
    // assign required fields from res
    const { id, expiresAt, profile, status, _links } = res;
    this.id = id;
    this.expiresAt = expiresAt;
    this.profile = profile;
    this.status = status;

    // assign transformed fns to transaction
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
    this.verify = async (payload) => {
      const fn = generateRequestFnFromLinks({ 
        oktaAuth, 
        accessToken, 
        methodName: 'verify', 
        links: _links,
      });
      return await fn(payload) as EmailChallengeTransaction;
    };
  }
}
