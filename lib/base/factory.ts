

// Do not use this type in code, so it won't be emitted in the declaration output
import { removeNils } from '../util';

import * as features from '../features';
import * as constants from '../constants';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore 
// Do not use this type in code, so it won't be emitted in the declaration output
import Emitter from 'tiny-emitter';

import {
  EventEmitter,
  OktaAuthConstructor,
  OktaAuthBaseInterface,
  OktaAuthBaseOptions,
  OktaAuthOptionsConstructor, 
  FeaturesAPI,
} from './types';

export function createOktaAuthBase
<
  O extends OktaAuthBaseOptions = OktaAuthBaseOptions,
>
(
  OptionsConstructor: OktaAuthOptionsConstructor<O>
): OktaAuthConstructor<OktaAuthBaseInterface<O>>
{
  class OktaAuthBase implements OktaAuthBaseInterface<O>
  {
    options: O;
    emitter: EventEmitter;
    features: FeaturesAPI;
    static features: FeaturesAPI = features;
    static constants = constants;
    
    constructor(...args: any[]) {
      const options = new OptionsConstructor(args.length ? args[0] || {} : {});
      this.options = removeNils(options) as O; // clear out undefined values
      this.emitter = new Emitter();
      this.features = features;
    }
  }

  // Hoist feature detection functions to prototype & static type
  OktaAuthBase.features = OktaAuthBase.prototype.features = features;

  // Also hoist constants for CommonJS users
  Object.assign(OktaAuthBase, {
    constants
  });

  return OktaAuthBase;
}
