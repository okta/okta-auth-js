import BaseTransaction from './Base';

export default class ProfileSchemaTransaction extends BaseTransaction {
  properties: Record<string, object>;

  constructor(oktaAuth, options) {
    super(oktaAuth, options);

    this.properties = options.res.properties;
  }
}
