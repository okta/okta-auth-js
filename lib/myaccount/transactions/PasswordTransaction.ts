import { EnrollPasswordPayload, UpdatePasswordPayload, PasswordStatus } from '../types';
import BaseTransaction from './Base';
import { generateRequestFnFromLinks } from '../request';

export default class PasswordTransaction extends BaseTransaction {
  id: string;
  created: string;
  lastUpdated: string;
  status: PasswordStatus;

  get: () => Promise<PasswordTransaction>;
  enroll?: (payload: EnrollPasswordPayload) => Promise<PasswordTransaction>;
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
    this.lastUpdated = lastUpdated

    // assign transformed fns to transaction
    this.get = async () => {
      const fn = generateRequestFnFromLinks({ 
        oktaAuth, 
        accessToken, 
        methodName: 'get', 
        links: _links,
        transactionClassName: 'PasswordTransaction'
      });
      return await fn() as PasswordTransaction;
    };

    if (this.status == PasswordStatus.NOT_ENROLLED) {
      this.enroll = async () => {
        const fn = generateRequestFnFromLinks({ 
          oktaAuth, 
          accessToken, 
          methodName: 'post', 
          links: _links,
          transactionClassName: 'PasswordTransaction'
        });
        return await fn() as PasswordTransaction;
      };
    }
    else {
      this.update = async () => {
        const fn = generateRequestFnFromLinks({ 
          oktaAuth, 
          accessToken, 
          methodName: 'put', 
          links: _links,
          transactionClassName: 'PasswordTransaction'
        });
        return await fn() as PasswordTransaction;
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
    }
  }
}
