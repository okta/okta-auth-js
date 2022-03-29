import OktaAuth from './OktaAuth';
import { getProfile } from './myaccount';
import { OktaAuthOptions } from './types';

class OktaAuthCDN extends OktaAuth {
  myaccount;

  constructor(args: OktaAuthOptions) {
    super(args);

    this.myaccount = {
      getProfile: getProfile.bind(null, this)
    };
  }
}

export default OktaAuthCDN;
