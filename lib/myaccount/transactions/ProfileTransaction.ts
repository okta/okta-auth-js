import BaseTransaction from './Base';

export default class ProfileTransaction extends BaseTransaction {
  createdAt: string;
  modifiedAt: string;
  profile: Record<string, string>;

  constructor(oktaAuth, options) {
    super(oktaAuth, options);

    const { createdAt, modifiedAt, profile } = options.res;
    this.createdAt = createdAt;
    this.modifiedAt = modifiedAt;
    this.profile = profile;
  }
}
