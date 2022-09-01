import { OktaAuthHttpInterface } from '../../http/types';
import { AuthnTransactionFunctions, AuthnTransactionAPI } from '../types';
import { link2fn } from './link2fn';
import { getPollFn } from './poll';

export function links2fns(sdk: OktaAuthHttpInterface, tx: AuthnTransactionAPI, res, obj, ref) {
  var fns = {} as AuthnTransactionFunctions;
  for (var linkName in obj._links) {
    if (!Object.prototype.hasOwnProperty.call(obj._links, linkName)) {
      continue;
    }

    var link = obj._links[linkName];
    
    if (linkName === 'next') {
      linkName = link.name;
    }

    if (link.type) {
      fns[linkName] = link;
      continue;
    }

    switch (linkName) {
      // poll is only found at the transaction
      // level, so we don't need to pass the link
      case 'poll':
        fns.poll = getPollFn(sdk, res, ref);
        break;

      default:
        var fn = link2fn(sdk, tx, res, obj, link, ref);
        if (fn) {
          fns[linkName] = fn;
        }
    }
  }
  return fns;
}
