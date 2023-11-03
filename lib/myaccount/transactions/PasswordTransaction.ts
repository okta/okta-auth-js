import { EnrollPasswordPayload, UpdatePasswordPayload, PasswordStatus } from '../types';
import BaseTransaction from './Base';
import { generateRequestFnFromLinks } from '../request';

export default class PasswordTransaction extends BaseTransaction {
  id: string;
  created: string;
  lastUpdated: string;
  status: PasswordStatus;

  // eslint-disable-next-line no-use-before-define
  get?: () => Promise<PasswordTransaction>;
  // eslint-disable-next-line no-use-before-define
  enroll?: (payload: EnrollPasswordPayload) => Promise<PasswordTransaction>;
  // eslint-disable-next-line no-use-before-define
  update?: (payload: UpdatePasswordPayload) => Promise<PasswordTransaction>;
  delete?: () => Promise<BaseTransaction>;

  constructor(oktaAuth, options) {
    super(oktaAuth, options);

    const { res, accessToken } = options;
    // assign required fields from res
    const { id, status, created, lastUpdated, _links } = res;
    this.id = id;
    this.status = status;
    this.created = created;
    this.lastUpdated = lastUpdated;

    // assign transformed fns to transaction
    if (this.status == PasswordStatus.NOT_ENROLLED) {
      this.enroll = async (payload) => {
        const fn = generateRequestFnFromLinks({ 
          oktaAuth, 
          accessToken, 
          methodName: 'enroll',
          links: _links,
        }, PasswordTransaction);
        return await fn(payload);
      };
    }
    else {
      this.get = async () => {
        const fn = generateRequestFnFromLinks({ 
          oktaAuth, 
          accessToken, 
          methodName: 'get',
          links: _links,
        }, PasswordTransaction);
        return await fn();
      };

      this.update = async (payload) => {
        const fn = generateRequestFnFromLinks({ 
          oktaAuth, 
          accessToken, 
          methodName: 'put', 
          links: _links,
        }, PasswordTransaction);
        return await fn(payload);
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
    }
  }
}
