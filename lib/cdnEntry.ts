import OktaAuth from './OktaAuth';
import * as MyAccountMethods from './myaccount';
import { OktaAuthOptions } from './types';

class OktaAuthCDN extends OktaAuth {
  myaccount;

  constructor(args: OktaAuthOptions) {
    super(args);

    this.myaccount = Object.entries(MyAccountMethods)
      .filter(([ name ]) => name !== 'default')
      .reduce((acc, [name, fn]) => {
        acc[name] = (fn as any).bind(null, this);
        return acc;
      }, {});
  }
}

export default OktaAuthCDN;
