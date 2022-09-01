/* eslint-disable complexity */
import { OktaAuthHttpInterface } from '../../http/types';
import { clone, isObject, omit } from '../../util';
import { AuthnTransactionAPI } from '../types';
import { links2fns } from './links2fns';

export function flattenEmbedded(sdk: OktaAuthHttpInterface, tx: AuthnTransactionAPI, res, obj, ref) {
  obj = obj || res;
  obj = clone(obj);

  if (Array.isArray(obj)) {
    var objArr = [];
    for (var o = 0, ol = obj.length; o < ol; o++) {
      objArr.push(flattenEmbedded(sdk, tx, res, obj[o], ref) as never);
    }
    return objArr;
  }

  var embedded = obj._embedded || {};

  for (var key in embedded) {
    if (!Object.prototype.hasOwnProperty.call(embedded, key)) {
      continue;
    }

    // Flatten any nested _embedded objects
    if (isObject(embedded[key]) || Array.isArray(embedded[key])) {
      embedded[key] = flattenEmbedded(sdk, tx, res, embedded[key], ref);
    }
  }

  // Convert any links on the embedded object
  var fns = links2fns(sdk, tx, res, obj, ref);
  Object.assign(embedded, fns);

  obj = omit(obj, '_embedded', '_links');
  Object.assign(obj, embedded);
  return obj;
}
