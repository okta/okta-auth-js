import { EmailProfile, Status } from '../types';
import BaseTransaction from './Base';

export default class EmailStatusTransaction extends BaseTransaction {
  id: string;
  expiresAt: string;
  profile: EmailProfile;
  status: Status;

  constructor(oktaAuth, options) {
    super(oktaAuth, options);

    const { res } = options;
    // assign required fields from res
    const { id, profile, expiresAt, status } = res;
    this.id = id;
    this.expiresAt = expiresAt;
    this.profile = profile;
    this.status = status;
  }
}
